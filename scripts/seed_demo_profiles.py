#!/usr/bin/env python3
"""Seed ~100 demo skin profiles, favorites and cabinets.

Why this exists: you cannot screenshot a replenishment email, a co-favorites
graph, or a personalized Bella hook from an empty database. This generates
plausible users over the REAL product catalogue so every demo, screenshot and
end-to-end test has something to stand on.

    export SUPABASE_SERVICE_KEY="sb_secret_..."
    python3 scripts/seed_demo_profiles.py --dry-run      # inspect the plan
    python3 scripts/seed_demo_profiles.py --apply        # write it
    python3 scripts/seed_demo_profiles.py --teardown     # remove it all

⚠️  READ THIS BEFORE RUNNING AGAINST PRODUCTION
    Inserting product_favorites fires `trg_favorite_counts`, which increments
    sss_products.like_count and sss_ingredients.like_count. That is the column
    that drives the DEFAULT SORT every real visitor sees, and it feeds
    sss_co_favorites -> Bella's recommendations. Real co_count values are
    currently ~1, so 100 seeded users will dominate the organic signal.

    Prefer a staging project. If you do run it on production, --teardown
    reverses it exactly (the same trigger decrements on DELETE), and every
    demo user is identifiable by the reserved e-mail domain below.

    Use --no-favorites to seed cabinets ONLY. Cabinets do not touch like_count,
    so that variant is inert with respect to public rankings.
"""

import argparse
import json
import os
import random
import sys
import urllib.error
import urllib.request
import uuid
from datetime import date, timedelta

SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://dolkstgbyfozbetxyrby.supabase.co")

# RFC 2606 reserved TLD: these addresses can never resolve or receive mail, so a
# misconfigured check-in run can't email a real person by accident. It also makes
# teardown a single unambiguous filter.
DEMO_EMAIL_DOMAIN = "seed.dermodel.invalid"

# ── Archetypes ──────────────────────────────────────────────────────────────
# Weighted to the 2026 market: barrier/"skin longevity" is the centre of gravity,
# not classic anti-aging. Keywords match against real product_name text.
ARCHETYPES = [
    {
        "key": "barrier-repair", "weight": 22,
        "skin_type": "dry", "concerns": ["dryness", "sensitivity"],
        "wants": ["cleanser", "toner", "essence|serum|ampoule", "cream|moisturizer", "sunscreen|spf"],
        "prefer": ["ceramide", "barrier", "cica", "centella", "panthenol", "heartleaf"],
    },
    {
        "key": "oily-acne", "weight": 20,
        "skin_type": "oily", "concerns": ["acne", "oiliness"],
        "wants": ["cleanser|cleansing", "toner", "serum|ampoule", "gel|moisturizer", "sunscreen|spf"],
        "prefer": ["salicylic", "bha", "niacinamide", "tea tree", "clay", "mucin"],
    },
    {
        "key": "sensitive-minimal", "weight": 16,
        "skin_type": "sensitive", "concerns": ["sensitivity", "redness"],
        "wants": ["cleanser", "cream|moisturizer", "sunscreen|spf"],
        "prefer": ["fragrance free", "cica", "oat", "madecassoside", "calming", "soothing"],
    },
    {
        "key": "longevity", "weight": 18,
        "skin_type": "combination", "concerns": ["wrinkles", "dryness"],
        "wants": ["cleanser", "essence|toner", "serum|ampoule", "cream", "eye", "sunscreen|spf"],
        "prefer": ["peptide", "retinol", "collagen", "bakuchiol", "pdrn", "firming"],
    },
    {
        "key": "brightening", "weight": 14,
        "skin_type": "combination", "concerns": ["hyperpigmentation", "uneven-texture"],
        "wants": ["cleanser", "toner", "serum|ampoule", "moisturizer|cream", "sunscreen|spf"],
        "prefer": ["vitamin c", "tranexamic", "arbutin", "niacinamide", "glutathione"],
    },
    {
        "key": "k-beauty-maximalist", "weight": 10,
        "skin_type": "normal", "concerns": ["dryness", "uneven-texture"],
        "wants": ["cleansing oil|balm", "cleanser", "toner", "essence", "serum|ampoule",
                  "mask", "cream", "sunscreen|spf"],
        "prefer": ["rice", "ginseng", "propolis", "snail", "mugwort", "fermented"],
    },
]

def frequency_for(name, rng):
    """How often a product of this kind actually gets used. Random frequency
    produces nonsense (a face wash used 'weekly') and, because days_supply is
    size / (dose x uses_per_day), it also produces nonsense run-out dates."""
    n = name.lower()
    if any(k in n for k in ("mask", "pack of", "sheet", "peel", "exfolia", "scrub")):
        return rng.choice(["weekly", "every_other_day"])
    if any(k in n for k in ("cleanser", "cleansing", "face wash", "foam", "micellar")):
        return rng.choice(["twice_daily", "daily"])
    if any(k in n for k in ("sunscreen", "spf", "sun cream", "sunblock")):
        return "daily"
    if any(k in n for k in ("retinol", "retinal", "aha", "bha", "glycolic")):
        return rng.choice(["every_other_day", "daily"])
    return rng.choice(["twice_daily", "daily", "daily"])


def routine_for(name, rng):
    """AM/PM/both. Sunscreen is never a night product; retinoids and heavy
    balms are never a morning one."""
    n = name.lower()
    if any(k in n for k in ("sunscreen", "spf", "sun cream", "sunblock")):
        return "am"
    if any(k in n for k in ("retinol", "retinal", "night", "sleeping", "overnight")):
        return "pm"
    if any(k in n for k in ("cleansing oil", "cleansing balm", "makeup remover")):
        return "pm"
    return rng.choice(["both", "both", "am", "pm"])

FIRST = ["mina", "sora", "jade", "noor", "ines", "kai", "remi", "yuna", "lucia", "tess",
         "amara", "priya", "nadia", "hana", "elle", "juno", "wren", "iris", "cleo", "ada",
         "maya", "leni", "rosa", "thea", "zoe", "vera", "isla", "nia", "faye", "opal"]
LAST = ["kim", "cho", "park", "lee", "moreau", "silva", "haddad", "novak", "reyes", "okafor",
        "tanaka", "iyer", "bakker", "rossi", "sandoval", "nyberg", "duval", "ozturk"]


def req(method, path, token, body=None, headers=None):
    url = f"{SUPABASE_URL}{path}"
    data = json.dumps(body).encode() if body is not None else None
    h = {
        "apikey": token,
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
    h.update(headers or {})
    r = urllib.request.Request(url, data=data, headers=h, method=method)
    try:
        with urllib.request.urlopen(r) as resp:
            raw = resp.read().decode()
            return resp.status, (json.loads(raw) if raw else None)
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()


def fetch_catalogue(token, want=4000):
    """Real products, most-liked first, so seeded cabinets look plausible.

    PostgREST caps a single response at 1000 rows regardless of `limit`, so this
    pages explicitly -- without it we'd only ever draw from the top 1000 and
    every demo cabinet would look like the same handful of products.
    """
    out, page = [], 1000
    for start in range(0, want, page):
        status, rows = req(
            "GET",
            "/rest/v1/sss_products?select=product_id,product_name,like_count"
            "&order=like_count.desc.nullslast",
            token,
            headers={"Range-Unit": "items", "Range": f"{start}-{start + page - 1}"},
        )
        if status not in (200, 206):
            sys.exit(f"Could not read product catalogue ({status}): {rows}")
        if not rows:
            break
        out.extend(r for r in rows if r.get("product_name"))
        if len(rows) < page:
            break
    return out


# Slot keywords like "cream|moisturizer" happily match body lotions and hand
# creams, which then show up in a face routine and make the demo look wrong.
NON_FACE = ("body", "hand ", "hand&", "foot", "shampoo", "conditioner", "lip ",
            "lip balm", "deodorant", "bar soap", "shower", "bath ", "hair ",
            "sunscreen stick for body", "baby ")


def is_face_product(name):
    n = name.lower()
    # "Face & Body" is fine -- it is sold for the face too.
    if "face" in n:
        return True
    return not any(k in n for k in NON_FACE)


def pick_products(catalogue, archetype, rng):
    """Assemble one routine: at most one product per slot, biased to the
    archetype's preferred actives, falling back to any product in the slot."""
    chosen, used = [], set()
    for slot in archetype["wants"]:
        terms = slot.split("|")
        pool = [p for p in catalogue
                if any(t in p["product_name"].lower() for t in terms)
                and p["product_id"] not in used
                and is_face_product(p["product_name"])]
        if not pool:
            continue
        liked = [p for p in pool
                 if any(k in p["product_name"].lower() for k in archetype["prefer"])]
        # Weight toward the archetype's actives, but keep the tail reachable.
        source = liked if (liked and rng.random() < 0.7) else pool
        pick = rng.choice(source[:120])
        chosen.append(pick)
        used.add(pick["product_id"])
    return chosen


def build_plan(catalogue, count, rng):
    weights = [a["weight"] for a in ARCHETYPES]
    plan = []
    for i in range(count):
        arch = rng.choices(ARCHETYPES, weights=weights, k=1)[0]
        products = pick_products(catalogue, arch, rng)
        if len(products) < 2:
            continue
        handle = f"{rng.choice(FIRST)}{rng.choice(LAST)}{rng.randint(2, 98)}"
        # Cabinet is a subset of favorites -- people save more than they own.
        cabinet_n = max(1, min(len(products), rng.randint(2, 5)))
        cabinet = []
        for p in products[:cabinet_n]:
            # Spread opened_on so a slice is genuinely due for a check-in:
            # roughly 1 in 6 lands inside the 7-day lead window.
            opened = date.today() - timedelta(days=rng.choice(
                [3, 9, 14, 18, 21, 24, 27, 30, 34, 40, 55, 70]
            ))
            cabinet.append({
                "product_id": p["product_id"],
                "product_name": p["product_name"],
                "opened_on": opened.isoformat(),
                "frequency": frequency_for(p["product_name"], rng),
                "routine": routine_for(p["product_name"], rng),
            })
        plan.append({
            "email": f"{handle}@{DEMO_EMAIL_DOMAIN}",
            "username": handle,
            "archetype": arch["key"],
            "skin_type": arch["skin_type"],
            "skin_concerns": arch["concerns"],
            "favorites": products,
            "cabinet": cabinet,
        })
    return plan


def apply_plan(plan, token, with_favorites):
    created = 0
    for person in plan:
        status, user = req("POST", "/auth/v1/admin/users", token, {
            "email": person["email"],
            "password": uuid.uuid4().hex + "Aa1!",
            "email_confirm": True,
            "user_metadata": {"username": person["username"], "demo_seed": True},
        })
        if status not in (200, 201):
            print(f"  ! could not create {person['email']}: {status} {user}")
            continue
        uid = user["id"]

        # handle_new_user() already inserted the profile row; enrich it.
        req("PATCH", f"/rest/v1/profiles?id=eq.{uid}", token, {
            "username": person["username"],
            "skin_type": [person["skin_type"]],
            "skin_concerns": person["skin_concerns"],
        }, {"Prefer": "return=minimal"})

        if with_favorites:
            req("POST", "/rest/v1/product_favorites", token,
                [{"user_id": uid, "product_id": p["product_id"]} for p in person["favorites"]],
                {"Prefer": "return=minimal"})

        req("POST", "/rest/v1/cabinet_items", token,
            [{"user_id": uid, "product_id": c["product_id"], "opened_on": c["opened_on"],
              "frequency": c["frequency"], "routine": c["routine"]} for c in person["cabinet"]],
            {"Prefer": "return=minimal"})

        created += 1
        if created % 10 == 0:
            print(f"  … {created} profiles")
    return created


def teardown(token):
    status, users = req(
        "GET", "/auth/v1/admin/users?per_page=1000", token
    )
    if status != 200:
        sys.exit(f"Could not list users ({status}): {users}")
    targets = [u for u in (users.get("users", users) if isinstance(users, dict) else users)
               if str(u.get("email", "")).endswith(f"@{DEMO_EMAIL_DOMAIN}")]
    print(f"Found {len(targets)} demo users.")
    for u in targets:
        uid = u["id"]
        # Delete favorites explicitly so trg_favorite_counts fires and the
        # like_count increments are reversed rather than orphaned.
        req("DELETE", f"/rest/v1/product_favorites?user_id=eq.{uid}", token, None,
            {"Prefer": "return=minimal"})
        req("DELETE", f"/rest/v1/cabinet_items?user_id=eq.{uid}", token, None,
            {"Prefer": "return=minimal"})
        req("DELETE", f"/auth/v1/admin/users/{uid}", token)
    print(f"Removed {len(targets)} demo users and reversed their like_count.")
    return len(targets)


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--count", type=int, default=100)
    ap.add_argument("--seed", type=int, default=20260819, help="RNG seed; reruns are reproducible")
    ap.add_argument("--apply", action="store_true", help="actually write (default is dry-run)")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--teardown", action="store_true", help="remove every demo user")
    ap.add_argument("--no-favorites", action="store_true",
                    help="cabinets only; leaves public like_count untouched")
    args = ap.parse_args()

    token = os.environ.get("SUPABASE_SERVICE_KEY")
    if not token:
        sys.exit('SUPABASE_SERVICE_KEY is not set. Export the secret key first:\n'
                 '  export SUPABASE_SERVICE_KEY="sb_secret_..."')

    if args.teardown:
        teardown(token)
        return

    rng = random.Random(args.seed)
    catalogue = fetch_catalogue(token)
    print(f"Catalogue: {len(catalogue)} products")
    plan = build_plan(catalogue, args.count, rng)

    fav_total = sum(len(p["favorites"]) for p in plan)
    cab_total = sum(len(p["cabinet"]) for p in plan)
    due = sum(1 for p in plan for c in p["cabinet"]
              if 0 <= (date.fromisoformat(c["opened_on"]) + timedelta(days=21)
                       - date.today()).days <= 7)
    by_arch = {}
    for p in plan:
        by_arch[p["archetype"]] = by_arch.get(p["archetype"], 0) + 1

    print(f"\nPlanned: {len(plan)} profiles, {fav_total} favorites, {cab_total} cabinet items")
    print(f"  by archetype: {by_arch}")
    print(f"  ~{due} cabinet items land in a check-in window (rough 21-day estimate)")
    if not args.no_favorites:
        print(f"\n  ⚠️  {fav_total} favorites will increment public like_count on "
              f"products AND their ingredients.\n"
              f"      Reversible with --teardown. Use --no-favorites to skip.")
    print("\nSample:")
    for p in plan[:3]:
        print(f"  {p['username']:22} {p['archetype']:20} {p['skin_type']}")
        for c in p["cabinet"][:2]:
            print(f"      cabinet: {c['product_name'][:52]:54} {c['frequency']}/{c['routine']}")

    if not args.apply:
        print("\n(dry run — pass --apply to write)")
        return

    print(f"\nWriting {len(plan)} profiles…")
    n = apply_plan(plan, token, with_favorites=not args.no_favorites)
    print(f"Done: {n} demo profiles created. Remove with --teardown.")


if __name__ == "__main__":
    main()
