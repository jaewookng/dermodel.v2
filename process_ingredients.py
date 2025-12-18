import pandas as pd
import re
import uuid

"""
ORIGINAL APPROACH WITH MINIMAL IMPROVEMENTS
This is a simplified version based on your original code with just essential enhancements.
"""

# ---------- STEP 1: load CSV ----------
df = pd.read_csv("/Users/jaewookang/Downloads/sss.csv")

# ---------- STEP 2: Helper functions ----------
def remove_parentheses(text):
    """Remove anything inside parentheses () including the parentheses."""
    return re.sub(r'\([^)]*\)', '', text)

def normalize_ingredient(name):
    """Clean spacing and unify formatting."""
    if not isinstance(name, str):
        return None
    
    # Remove parentheses content
    name = remove_parentheses(name)
    
    # Remove extra whitespace and normalize spaces
    name = ' '.join(name.split())
    
    # Remove trailing punctuation
    name = name.rstrip(",.;:/")
    
    # Title case for consistency (preserves common acronyms)
    if name and len(name) > 1:
        # Keep common cosmetic acronyms uppercase
        acronyms = ['PEG', 'PPG', 'CI', 'MEA', 'DEA', 'TEA', 'SLS', 'SLES']
        words = name.split()
        for i, word in enumerate(words):
            if any(word.upper().startswith(acr) for acr in acronyms):
                words[i] = word.upper()
            else:
                words[i] = word.title()
        name = ' '.join(words)
    
    return name if name else None

def split_ingredients(cell):
    """Split ingredients by comma and clean them."""
    if not isinstance(cell, str):
        return []
    
    items = cell.split(',')
    cleaned = [normalize_ingredient(i) for i in items]
    # remove empty or None
    return [x for x in cleaned if x]

# ---------- STEP 3: Expand each product to multiple ingredient rows ----------
records = []
for idx, row in df.iterrows():
    product_name = row["product_name"]
    ingredient_cell = row["ingredients"]
    ingredients = split_ingredients(ingredient_cell)
    
    # Track position for each ingredient (important for concentration)
    for position, ing in enumerate(ingredients, 1):
        records.append({
            "product_name": product_name,
            "ingredient": ing,
            "position": position  # Added: position in ingredient list
        })

expanded_df = pd.DataFrame(records)

# ---------- STEP 4: Create UNIQUE ingredient list ----------
unique_ingredients_df = (
    expanded_df["ingredient"]
    .drop_duplicates()
    .reset_index(drop=True)
    .to_frame()
)

# Add frequency count (how many products contain each ingredient)
ingredient_counts = expanded_df["ingredient"].value_counts()
unique_ingredients_df["product_count"] = unique_ingredients_df["ingredient"].map(ingredient_counts)

# ---------- STEP 5: Assign UUIDs to products + ingredients ----------
# (You may replace this with Supabase-generated UUIDs later)
product_ids = {
    name: str(uuid.uuid4()) for name in df["product_name"].unique()
}

ingredient_ids = {
    ing: str(uuid.uuid4()) for ing in unique_ingredients_df["ingredient"].unique()
}

# ---------- STEP 6: Build JOIN TABLE ----------
join_rows = []
for _, row in expanded_df.iterrows():
    join_rows.append({
        "product_id": product_ids[row["product_name"]],
        "ingredient_id": ingredient_ids[row["ingredient"]],
        "position": row["position"]  # Added: preserve position info
    })

join_table_df = pd.DataFrame(join_rows)

# Remove duplicates - keep first occurrence (lowest position = highest concentration)
join_table_df = join_table_df.sort_values('position').drop_duplicates(
    subset=['product_id', 'ingredient_id'], 
    keep='first'
).reset_index(drop=True)

# ---------- STEP 7: Create Product Table ----------
products_df = pd.DataFrame({
    "product_id": list(product_ids.values()),
    "product_name": list(product_ids.keys())
})

# Add ingredient count per product
ingredient_counts_per_product = expanded_df.groupby("product_name").size()
products_df["ingredient_count"] = products_df["product_name"].map(ingredient_counts_per_product)

# ---------- STEP 8: Create Ingredient Table ----------
ingredients_df = pd.DataFrame({
    "ingredient_id": list(ingredient_ids.values()),
    "ingredient_name": list(ingredient_ids.keys())
})

# Add product count per ingredient
ingredients_df["product_count"] = ingredients_df["ingredient_name"].map(ingredient_counts)

# Calculate average position (lower = typically higher concentration)
avg_position = expanded_df.groupby("ingredient")["position"].mean().round(2)
ingredients_df["avg_position"] = ingredients_df["ingredient_name"].map(avg_position)

# ---------- OUTPUT ----------
print("="*60)
print("PROCESSING SUMMARY")
print("="*60)
print(f"Total Products: {len(products_df)}")
print(f"Total Unique Ingredients: {len(ingredients_df)}")
print(f"Total Relationships: {len(join_table_df)}")
print(f"Avg Ingredients per Product: {len(join_table_df) / len(products_df):.2f}")

print("\n📦 Sample Products:")
print(products_df.head())

print("\n🧪 Sample Ingredients (sorted by frequency):")
print(ingredients_df.nlargest(10, "product_count")[["ingredient_name", "product_count", "avg_position"]])

print("\n🔗 Sample Join Table:")
print(join_table_df.head())

# ---------- EXPORT ----------
# Save to CSV for Supabase import
products_df.to_csv("/Users/jaewookang/Downloads/jaewookng/projects/dermodel/products.csv", index=False)
ingredients_df.to_csv("/Users/jaewookang/Downloads/jaewookng/projects/dermodel/ingredients.csv", index=False) 
join_table_df.to_csv("/Users/jaewookang/Downloads/jaewookng/projects/dermodel/product_ingredients.csv", index=False)

print("\n✅ Files exported:")
print("   - products.csv")
print("   - ingredients.csv")
print("   - product_ingredients.csv")
