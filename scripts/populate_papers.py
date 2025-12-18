#!/usr/bin/env python3
"""
Semantic Scholar Paper Fetcher for Dermodel
Populates ingredient_references_master table with research papers

Usage:
    python populate_papers.py

Features:
    - Fetches top 4 papers per ingredient from Semantic Scholar
    - Checkpointing: safe to stop and resume
    - Rate limiting: 3 second delay between requests
    - Deduplication: skips duplicate DOIs
"""

import os
import json
import time
import requests
from datetime import datetime

# Optional: Use supabase-py if available, otherwise use REST API
try:
    from supabase import create_client, Client
    USE_SUPABASE_PY = True
except ImportError:
    USE_SUPABASE_PY = False
    print("supabase-py not installed, using REST API directly")

# ============================================================================
# CONFIGURATION - UPDATE THESE VALUES
# ============================================================================

SUPABASE_URL = "https://dolkstgbyfozbetxyrby.supabase.co"
# Use your service role key (has write permissions) - keep this secret!
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvbGtzdGdieWZvemJldHh5cmJ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTc5NjA4OCwiZXhwIjoyMDU3MzcyMDg4fQ.WED_p7KRQh80eEsryd4CjpoZW1BeHhdIigeWb5ZWeoI")

# Semantic Scholar settings
SEMANTIC_SCHOLAR_API = "https://api.semanticscholar.org/graph/v1/paper/search"
PAPERS_PER_INGREDIENT = 4
REQUEST_DELAY = 3  # seconds between requests (with API key: 100 req/5min = 1 req/3sec safe)

# Optional: Add your Semantic Scholar API key for higher rate limits
# Get one at: https://www.semanticscholar.org/product/api
SEMANTIC_SCHOLAR_API_KEY = os.environ.get("SEMANTIC_SCHOLAR_KEY", "vNYFA7adXT91a3UPDnvYj1FS6umrN00C2811KmWn")

# Script settings
CHECKPOINT_FILE = "checkpoint.json"
BATCH_SIZE = 100  # checkpoint every N ingredients
LOG_FILE = "populate_papers.log"

# ============================================================================
# SUPABASE CLIENT
# ============================================================================

if USE_SUPABASE_PY:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
else:
    # REST API headers
    supabase_headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }


def log(message: str):
    """Log message to console and file"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_line = f"[{timestamp}] {message}"
    print(log_line)
    with open(LOG_FILE, "a") as f:
        f.write(log_line + "\n")


# ============================================================================
# CHECKPOINT MANAGEMENT
# ============================================================================

def load_checkpoint() -> dict:
    """Load progress from checkpoint file"""
    if os.path.exists(CHECKPOINT_FILE):
        with open(CHECKPOINT_FILE, 'r') as f:
            data = json.load(f)
            log(f"Loaded checkpoint: {len(data.get('processed', []))} ingredients already processed")
            return data
    return {"processed": [], "last_index": 0, "total_papers": 0}


def save_checkpoint(data: dict):
    """Save progress to checkpoint file"""
    data["last_updated"] = datetime.now().isoformat()
    with open(CHECKPOINT_FILE, 'w') as f:
        json.dump(data, f, indent=2)
    log(f"Checkpoint saved: {len(data['processed'])} ingredients processed, {data.get('total_papers', 0)} papers found")


# ============================================================================
# DATABASE OPERATIONS
# ============================================================================

def fetch_all_ingredients() -> list:
    """Fetch all unique ingredient names from both FDA and COSING tables"""
    log("Fetching ingredient names from database...")

    fda_names = set()
    cosing_names = set()

    if USE_SUPABASE_PY:
        # Fetch ALL FDA ingredients with pagination
        log("  Fetching FDA ingredients...")
        offset = 0
        page_size = 1000
        while True:
            response = supabase.table("ingredients").select("INGREDIENT_NAME").range(offset, offset + page_size - 1).execute()
            if not response.data:
                break
            for row in response.data:
                if row.get("INGREDIENT_NAME"):
                    fda_names.add(row["INGREDIENT_NAME"])
            if len(response.data) < page_size:
                break
            offset += page_size
            log(f"    ... fetched {len(fda_names)} FDA ingredients so far")
        log(f"  FDA ingredients: {len(fda_names)}")

        # Fetch ALL COSING ingredients with pagination
        log("  Fetching COSING ingredients...")
        offset = 0
        while True:
            response = supabase.table("COSING_ingredients").select('"INCI name"').range(offset, offset + page_size - 1).execute()
            if not response.data:
                break
            for row in response.data:
                if row.get("INCI name"):
                    cosing_names.add(row["INCI name"])
            if len(response.data) < page_size:
                break
            offset += page_size
            log(f"    ... fetched {len(cosing_names)} COSING ingredients so far")
        log(f"  COSING ingredients: {len(cosing_names)}")
    else:
        # REST API fallback with pagination
        log("  Fetching FDA ingredients...")
        offset = 0
        page_size = 1000
        while True:
            fda_url = f"{SUPABASE_URL}/rest/v1/ingredients?select=INGREDIENT_NAME&offset={offset}&limit={page_size}"
            fda_response = requests.get(fda_url, headers=supabase_headers)
            data = fda_response.json()
            if not data:
                break
            for row in data:
                if row.get("INGREDIENT_NAME"):
                    fda_names.add(row["INGREDIENT_NAME"])
            if len(data) < page_size:
                break
            offset += page_size
            log(f"    ... fetched {len(fda_names)} FDA ingredients so far")
        log(f"  FDA ingredients: {len(fda_names)}")

        log("  Fetching COSING ingredients...")
        offset = 0
        while True:
            cosing_url = f'{SUPABASE_URL}/rest/v1/COSING_ingredients?select="INCI name"&offset={offset}&limit={page_size}'
            cosing_response = requests.get(cosing_url, headers=supabase_headers)
            data = cosing_response.json()
            if not data:
                break
            for row in data:
                if row.get("INCI name"):
                    cosing_names.add(row["INCI name"])
            if len(data) < page_size:
                break
            offset += page_size
            log(f"    ... fetched {len(cosing_names)} COSING ingredients so far")
        log(f"  COSING ingredients: {len(cosing_names)}")

    # Combine and deduplicate
    all_names = list(fda_names | cosing_names)
    all_names.sort()

    log(f"Total unique ingredients: {len(all_names)}")
    return all_names


def insert_papers(papers: list) -> int:
    """Insert papers into database, returns count of inserted papers"""
    if not papers:
        return 0

    # Filter out papers without required fields
    valid_papers = [p for p in papers if p.get("title") and p.get("ingredient_name")]

    if not valid_papers:
        return 0

    inserted = 0

    if USE_SUPABASE_PY:
        # Insert one by one with duplicate check by title + ingredient_name
        for paper in valid_papers:
            try:
                # Check if paper already exists (by title + ingredient)
                existing = supabase.table("ingredient_references_master").select("id").eq(
                    "ingredient_name", paper["ingredient_name"]
                ).eq("title", paper["title"]).execute()

                if existing.data:
                    # Already exists, skip
                    continue

                # Insert new paper
                supabase.table("ingredient_references_master").insert(paper).execute()
                inserted += 1
            except Exception as e:
                if "duplicate" not in str(e).lower():
                    log(f"    Failed to insert paper: {e}")
    else:
        # REST API fallback
        url = f"{SUPABASE_URL}/rest/v1/ingredient_references_master"
        for paper in valid_papers:
            try:
                # Check if exists first
                check_url = f"{url}?ingredient_name=eq.{requests.utils.quote(paper['ingredient_name'])}&title=eq.{requests.utils.quote(paper['title'])}&select=id"
                check_response = requests.get(check_url, headers=supabase_headers)
                if check_response.status_code == 200 and check_response.json():
                    continue  # Already exists

                response = requests.post(url, json=paper, headers=supabase_headers)
                if response.status_code in [200, 201]:
                    inserted += 1
                elif response.status_code != 409:  # 409 = duplicate
                    log(f"    Insert failed: {response.text}")
            except Exception as e:
                log(f"    Request failed: {e}")

    return inserted


# ============================================================================
# SEMANTIC SCHOLAR API
# ============================================================================

def search_semantic_scholar(ingredient_name: str, retry_count: int = 0) -> list:
    """Search Semantic Scholar for papers about an ingredient"""

    # Build search query - just the ingredient name for more targeted results
    query = f"{ingredient_name.lower()} skin"

    params = {
        "query": query,
        "limit": PAPERS_PER_INGREDIENT,
        "fields": "title,authors,year,venue,externalIds,url,abstract"
    }

    headers = {
        "User-Agent": "Dermodel 1.0 (interactive skincare education database)"
    }

    # Add API key if available (higher rate limits)
    if SEMANTIC_SCHOLAR_API_KEY:
        headers["x-api-key"] = "vNYFA7adXT91a3UPDnvYj1FS6umrN00C2811KmWn"

    try:
        response = requests.get(
            SEMANTIC_SCHOLAR_API,
            params=params,
            headers=headers,
            timeout=15
        )

        if response.status_code == 429:
            if retry_count >= 3:
                log(f"  Rate limited 3 times, skipping {ingredient_name}")
                return []
            wait_time = 120 * (retry_count + 1)  # 120s, 240s, 360s
            log(f"  Rate limited! Waiting {wait_time} seconds (attempt {retry_count + 1}/3)...")
            time.sleep(wait_time)
            return search_semantic_scholar(ingredient_name, retry_count + 1)

        response.raise_for_status()
        data = response.json()
        return data.get("data", [])

    except requests.exceptions.Timeout:
        log(f"  Timeout searching for {ingredient_name}")
        return []
    except requests.exceptions.RequestException as e:
        log(f"  Error searching for {ingredient_name}: {e}")
        return []


def transform_paper(paper: dict, ingredient_name: str) -> dict:
    """Transform Semantic Scholar paper to database schema"""

    # Extract DOI from externalIds
    doi = None
    if paper.get("externalIds"):
        doi = paper["externalIds"].get("DOI")

    # Format authors (limit to first 5)
    authors = ""
    if paper.get("authors"):
        author_names = [a.get("name", "") for a in paper["authors"][:5]]
        authors = ", ".join(author_names)
        if len(paper["authors"]) > 5:
            authors += " et al."

    # Build Semantic Scholar URL if not provided
    url = paper.get("url")
    if not url and paper.get("paperId"):
        url = f"https://www.semanticscholar.org/paper/{paper['paperId']}"

    # Truncate long abstracts
    summary = paper.get("abstract", "")
    if summary and len(summary) > 2000:
        summary = summary[:1997] + "..."

    return {
        "ingredient_name": ingredient_name.strip(),  # Strip whitespace
        "title": paper.get("title"),
        "authors": authors or None,
        "journal": paper.get("venue") or None,
        "year": paper.get("year"),
        "doi": doi,
        "url": url,
        "summary": summary or None,
        "source": "semantic_scholar"
    }


# ============================================================================
# MAIN SCRIPT
# ============================================================================

def main():
    log("=" * 70)
    log("Semantic Scholar Paper Fetcher for Dermodel")
    log("=" * 70)

    # Validate configuration
    if SUPABASE_KEY == "YOUR_SERVICE_ROLE_KEY_HERE":
        log("ERROR: Please set SUPABASE_SERVICE_KEY environment variable or update SUPABASE_KEY in script")
        log("You can find your service role key in Supabase Dashboard > Settings > API")
        return

    # Load checkpoint
    checkpoint = load_checkpoint()
    processed_set = set(checkpoint.get("processed", []))
    total_papers_found = checkpoint.get("total_papers", 0)

    # Fetch all ingredients
    try:
        ingredients = fetch_all_ingredients()
    except Exception as e:
        log(f"ERROR: Failed to fetch ingredients: {e}")
        return

    # Filter out already processed
    remaining = [ing for ing in ingredients if ing not in processed_set]

    log("-" * 70)
    log(f"Already processed: {len(processed_set)} ingredients")
    log(f"Remaining: {len(remaining)} ingredients")
    log(f"Papers per ingredient: {PAPERS_PER_INGREDIENT}")
    log(f"Request delay: {REQUEST_DELAY} seconds")

    if remaining:
        est_hours = len(remaining) * REQUEST_DELAY / 3600
        log(f"Estimated time remaining: {est_hours:.1f} hours")

    log("-" * 70)

    if not remaining:
        log("All ingredients have been processed!")
        return

    # Process ingredients
    papers_buffer = []
    session_papers = 0

    try:
        for i, ingredient in enumerate(remaining):
            log(f"[{i+1}/{len(remaining)}] Searching: {ingredient}")

            # Search Semantic Scholar
            papers = search_semantic_scholar(ingredient)

            if papers:
                log(f"  Found {len(papers)} papers")
                for paper in papers:
                    transformed = transform_paper(paper, ingredient)
                    papers_buffer.append(transformed)
                    session_papers += 1
                    total_papers_found += 1
            else:
                log(f"  No relevant papers found")

            # Mark as processed
            processed_set.add(ingredient)

            # Checkpoint and insert every BATCH_SIZE ingredients
            if (i + 1) % BATCH_SIZE == 0:
                log(f"\n{'='*70}")
                log(f"CHECKPOINT: Inserting {len(papers_buffer)} papers to database...")
                inserted = insert_papers(papers_buffer)
                log(f"Successfully inserted: {inserted} papers")
                papers_buffer = []

                checkpoint["processed"] = list(processed_set)
                checkpoint["last_index"] = i + 1
                checkpoint["total_papers"] = total_papers_found
                save_checkpoint(checkpoint)
                log(f"{'='*70}\n")

            # Rate limiting
            time.sleep(REQUEST_DELAY)

    except KeyboardInterrupt:
        log("\n\nInterrupted by user! Saving progress...")
    except Exception as e:
        log(f"\n\nError occurred: {e}")
        log("Saving progress...")
    finally:
        # Final insert of remaining papers
        if papers_buffer:
            log(f"\nFinal insert: {len(papers_buffer)} papers...")
            inserted = insert_papers(papers_buffer)
            log(f"Successfully inserted: {inserted} papers")

        # Save final checkpoint
        checkpoint["processed"] = list(processed_set)
        checkpoint["total_papers"] = total_papers_found
        save_checkpoint(checkpoint)

    log("\n" + "=" * 70)
    log("SESSION COMPLETE")
    log(f"Total ingredients processed: {len(processed_set)}")
    log(f"Papers found this session: {session_papers}")
    log(f"Total papers found overall: {total_papers_found}")
    log("=" * 70)


if __name__ == "__main__":
    main()
