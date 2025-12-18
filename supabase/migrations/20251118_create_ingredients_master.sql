-- =====================================================
-- Migration: Create Master Ingredients Table
-- Date: 2025-11-18
-- Description: Implements inheritance/supertype design
--              with ingredients_master as the parent table
--              and database-specific tables as subtypes
-- =====================================================

-- =====================================================
-- STEP 1: Create Master Ingredients Table
-- =====================================================

CREATE TABLE IF NOT EXISTS ingredients_master (
  name TEXT PRIMARY KEY,                    -- INCI name as natural key
  cas_number TEXT UNIQUE,                   -- Chemical Abstracts Service number
  description TEXT,                         -- Merged description
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for case-insensitive searches
CREATE INDEX IF NOT EXISTS idx_ingredients_master_name_lower
  ON ingredients_master(LOWER(name));

-- Create index on CAS number for fast lookups
CREATE INDEX IF NOT EXISTS idx_ingredients_master_cas_number
  ON ingredients_master(cas_number) WHERE cas_number IS NOT NULL;

-- Add trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ingredients_master_updated_at
  BEFORE UPDATE ON ingredients_master
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE ingredients_master IS 'Master table containing all unique ingredients from USFDA and COSING databases';
COMMENT ON COLUMN ingredients_master.name IS 'Standardized INCI name (International Nomenclature of Cosmetic Ingredients)';
COMMENT ON COLUMN ingredients_master.cas_number IS 'Chemical Abstracts Service registry number - used for deduplication';


-- =====================================================
-- STEP 2: Populate Master Table with Merged Data
-- =====================================================

-- First, determine which FDA table name to use (ingredients or ingredients_usfda)
DO $$
DECLARE
  fda_table_name TEXT;
  cosing_table_name TEXT;
BEGIN
  -- Check which table exists for FDA data
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ingredients') THEN
    fda_table_name := 'ingredients';
  ELSIF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ingredients_usfda') THEN
    fda_table_name := 'ingredients_usfda';
  ELSE
    RAISE EXCEPTION 'Neither ingredients nor ingredients_usfda table exists';
  END IF;

  -- Check which table exists for COSING data
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'COSING_ingredients') THEN
    cosing_table_name := 'COSING_ingredients';
  ELSIF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ingredients_cosing') THEN
    cosing_table_name := 'ingredients_cosing';
  ELSE
    RAISE EXCEPTION 'Neither COSING_ingredients nor ingredients_cosing table exists';
  END IF;

  RAISE NOTICE 'Using FDA table: %, COSING table: %', fda_table_name, cosing_table_name;

  -- Insert merged ingredients using dynamic SQL
  EXECUTE format('
    INSERT INTO ingredients_master (name, cas_number, description)
    SELECT DISTINCT ON (dedup_key)
      ingredient_name as name,
      cas_num as cas_number,
      description
    FROM (
      -- COSING records (prioritized for INCI names)
      SELECT
        COALESCE(
          NULLIF(TRIM("INCI name"), ''''),
          NULLIF(TRIM("INN name"), ''''),
          NULLIF(TRIM("Ph. Eur. Name"), '''')
        ) as ingredient_name,
        NULLIF(TRIM("CAS No"), '''') as cas_num,
        NULLIF(TRIM("Chem/IUPAC Name / Description"), '''') as description,
        1 as priority,
        COALESCE(
          NULLIF(TRIM("CAS No"), ''''),
          LOWER(TRIM(COALESCE(
            NULLIF(TRIM("INCI name"), ''''),
            NULLIF(TRIM("INN name"), ''''),
            NULLIF(TRIM("Ph. Eur. Name"), '''')
          )))
        ) as dedup_key
      FROM %I
      WHERE COALESCE(
        NULLIF(TRIM("INCI name"), ''''),
        NULLIF(TRIM("INN name"), ''''),
        NULLIF(TRIM("Ph. Eur. Name"), '''')
      ) IS NOT NULL

      UNION ALL

      -- FDA records
      SELECT
        TRIM("INGREDIENT_NAME") as ingredient_name,
        NULLIF(TRIM(CAST("CAS_NUMBER" AS TEXT)), '''') as cas_num,
        NULLIF(TRIM("DESCRIPTION"), '''') as description,
        2 as priority,
        COALESCE(
          NULLIF(TRIM(CAST("CAS_NUMBER" AS TEXT)), ''''),
          LOWER(TRIM("INGREDIENT_NAME"))
        ) as dedup_key
      FROM %I
      WHERE TRIM("INGREDIENT_NAME") IS NOT NULL
        AND TRIM("INGREDIENT_NAME") != ''''
    ) merged
    WHERE ingredient_name IS NOT NULL
      AND ingredient_name != ''''
      AND dedup_key IS NOT NULL
    ORDER BY
      dedup_key,
      priority,
      CASE WHEN description IS NOT NULL THEN 0 ELSE 1 END,
      LENGTH(description) DESC NULLS LAST
    ON CONFLICT (name) DO NOTHING
  ', cosing_table_name, fda_table_name);
END $$;

-- Log the results
DO $$
DECLARE
  ingredient_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO ingredient_count FROM ingredients_master;
  RAISE NOTICE 'Created % unique ingredients in master table', ingredient_count;
END $$;


-- =====================================================
-- STEP 3: Rename and Modify USFDA Subtype Table
-- =====================================================

-- Rename ingredients table to ingredients_usfda (only if not already renamed)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ingredients') THEN
    ALTER TABLE ingredients RENAME TO ingredients_usfda;
    RAISE NOTICE 'Renamed ingredients to ingredients_usfda';
  ELSE
    RAISE NOTICE 'Table ingredients_usfda already exists, skipping rename';
  END IF;
END $$;

-- Add master_name foreign key column
ALTER TABLE ingredients_usfda
  ADD COLUMN IF NOT EXISTS master_name TEXT;

-- Populate master_name by matching CAS number first, then name
UPDATE ingredients_usfda f
SET master_name = (
  SELECT m.name
  FROM ingredients_master m
  WHERE m.cas_number = NULLIF(TRIM(CAST(f.CAS_NUMBER AS TEXT)), '')
     OR LOWER(TRIM(m.name)) = LOWER(TRIM(f.INGREDIENT_NAME))
  ORDER BY
    CASE WHEN m.cas_number = NULLIF(TRIM(CAST(f.CAS_NUMBER AS TEXT)), '') THEN 1 ELSE 2 END,
    m.name
  LIMIT 1
)
WHERE master_name IS NULL;

-- Add foreign key constraint
ALTER TABLE ingredients_usfda
  DROP CONSTRAINT IF EXISTS fk_ingredients_usfda_master,
  ADD CONSTRAINT fk_ingredients_usfda_master
    FOREIGN KEY (master_name)
    REFERENCES ingredients_master(name)
    ON UPDATE CASCADE
    ON DELETE CASCADE;

-- Create index on master_name for fast joins
CREATE INDEX IF NOT EXISTS idx_ingredients_usfda_master_name
  ON ingredients_usfda(master_name);

-- Log the results
DO $$
DECLARE
  linked_count INTEGER;
  unlinked_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO linked_count FROM ingredients_usfda WHERE master_name IS NOT NULL;
  SELECT COUNT(*) INTO unlinked_count FROM ingredients_usfda WHERE master_name IS NULL;
  RAISE NOTICE 'Linked % USFDA ingredients to master table', linked_count;
  IF unlinked_count > 0 THEN
    RAISE WARNING 'Found % unlinked USFDA ingredients', unlinked_count;
  END IF;
END $$;


-- =====================================================
-- STEP 4: Rename and Modify COSING Subtype Table
-- =====================================================

-- Rename COSING_ingredients table to ingredients_cosing (only if not already renamed)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'COSING_ingredients') THEN
    ALTER TABLE "COSING_ingredients" RENAME TO ingredients_cosing;
    RAISE NOTICE 'Renamed COSING_ingredients to ingredients_cosing';
  ELSE
    RAISE NOTICE 'Table ingredients_cosing already exists, skipping rename';
  END IF;
END $$;

-- Add master_name foreign key column
ALTER TABLE ingredients_cosing
  ADD COLUMN IF NOT EXISTS master_name TEXT;

-- Populate master_name by matching CAS number first, then INCI name
UPDATE ingredients_cosing c
SET master_name = (
  SELECT m.name
  FROM ingredients_master m
  WHERE m.cas_number = NULLIF(TRIM(c."CAS No"), '')
     OR LOWER(TRIM(m.name)) = LOWER(TRIM(COALESCE(
       NULLIF(TRIM(c."INCI name"), ''),
       NULLIF(TRIM(c."INN name"), ''),
       NULLIF(TRIM(c."Ph. Eur. Name"), '')
     )))
  ORDER BY
    CASE WHEN m.cas_number = NULLIF(TRIM(c."CAS No"), '') THEN 1 ELSE 2 END,
    m.name
  LIMIT 1
)
WHERE master_name IS NULL;

-- Add foreign key constraint
ALTER TABLE ingredients_cosing
  DROP CONSTRAINT IF EXISTS fk_ingredients_cosing_master,
  ADD CONSTRAINT fk_ingredients_cosing_master
    FOREIGN KEY (master_name)
    REFERENCES ingredients_master(name)
    ON UPDATE CASCADE
    ON DELETE CASCADE;

-- Create index on master_name for fast joins
CREATE INDEX IF NOT EXISTS idx_ingredients_cosing_master_name
  ON ingredients_cosing(master_name);

-- Log the results
DO $$
DECLARE
  linked_count INTEGER;
  unlinked_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO linked_count FROM ingredients_cosing WHERE master_name IS NOT NULL;
  SELECT COUNT(*) INTO unlinked_count FROM ingredients_cosing WHERE master_name IS NULL;
  RAISE NOTICE 'Linked % COSING ingredients to master table', linked_count;
  IF unlinked_count > 0 THEN
    RAISE WARNING 'Found % unlinked COSING ingredients', unlinked_count;
  END IF;
END $$;


-- =====================================================
-- STEP 5: Update References Table
-- =====================================================

-- Update ingredient_name to match master table names
-- (Handle cases where the reference uses a different name variant)
UPDATE ingredient_references_master ref
SET ingredient_name = (
  SELECT m.name
  FROM ingredients_master m
  WHERE LOWER(TRIM(m.name)) = LOWER(TRIM(ref.ingredient_name))
     OR m.name IN (
       SELECT master_name FROM ingredients_usfda WHERE LOWER(TRIM(INGREDIENT_NAME)) = LOWER(TRIM(ref.ingredient_name))
     )
     OR m.name IN (
       SELECT master_name FROM ingredients_cosing WHERE LOWER(TRIM("INCI name")) = LOWER(TRIM(ref.ingredient_name))
     )
  LIMIT 1
)
WHERE ingredient_name IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM ingredients_master m WHERE m.name = ref.ingredient_name
  );

-- Drop old foreign key constraints if they exist
ALTER TABLE ingredient_references_master
  DROP CONSTRAINT IF EXISTS ingredient_references_master_ingredient_name_fkey,
  DROP CONSTRAINT IF EXISTS ingredient_references_master_cosing_ref_no_fkey;

-- Remove cosing_ref_no column (no longer needed)
ALTER TABLE ingredient_references_master
  DROP COLUMN IF EXISTS cosing_ref_no;

-- Make ingredient_name NOT NULL and add FK to master table
ALTER TABLE ingredient_references_master
  ALTER COLUMN ingredient_name SET NOT NULL,
  ADD CONSTRAINT fk_ingredient_references_master
    FOREIGN KEY (ingredient_name)
    REFERENCES ingredients_master(name)
    ON UPDATE CASCADE
    ON DELETE CASCADE;

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_ingredient_references_master_ingredient_name
  ON ingredient_references_master(ingredient_name);

-- Log the results
DO $$
DECLARE
  ref_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO ref_count FROM ingredient_references_master;
  RAISE NOTICE 'Updated % ingredient references to point to master table', ref_count;
END $$;


-- =====================================================
-- STEP 6: Create Public Read Policies
-- =====================================================

-- Enable RLS on master table
ALTER TABLE ingredients_master ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
DROP POLICY IF EXISTS "Allow public read access to ingredients_master" ON ingredients_master;
CREATE POLICY "Allow public read access to ingredients_master"
  ON ingredients_master
  FOR SELECT
  TO public
  USING (true);

-- Update existing policies for renamed tables
DROP POLICY IF EXISTS "Allow public read access to ingredients" ON ingredients_usfda;
CREATE POLICY "Allow public read access to ingredients_usfda"
  ON ingredients_usfda
  FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Allow public read access to COSING_ingredients" ON ingredients_cosing;
CREATE POLICY "Allow public read access to ingredients_cosing"
  ON ingredients_cosing
  FOR SELECT
  TO public
  USING (true);


-- =====================================================
-- STEP 7: Create Helper Functions
-- =====================================================

-- Function to get ingredient details with all source data
CREATE OR REPLACE FUNCTION get_ingredient_full_details(ingredient_name_param TEXT)
RETURNS TABLE (
  name TEXT,
  cas_number TEXT,
  description TEXT,
  has_usfda_data BOOLEAN,
  has_cosing_data BOOLEAN,
  usfda_data JSONB,
  cosing_data JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.name,
    m.cas_number,
    m.description,
    (u.master_name IS NOT NULL) as has_usfda_data,
    (c.master_name IS NOT NULL) as has_cosing_data,
    CASE WHEN u.master_name IS NOT NULL THEN
      jsonb_build_object(
        'potency_amount', u.POTENCY_AMOUNT,
        'potency_unit', u.POTENCY_UNIT,
        'max_daily_exposure', u.MAXIMUM_DAILY_EXPOSURE,
        'max_daily_exposure_unit', u.MAXIMUM_DAILY_EXPOSURE_UNIT,
        'route', u.ROUTE,
        'unii', u.UNII
      )
    ELSE NULL END as usfda_data,
    CASE WHEN c.master_name IS NOT NULL THEN
      jsonb_build_object(
        'cosing_ref_no', c."COSING Ref No",
        'inn_name', c."INN name",
        'ph_eur_name', c."Ph. Eur. Name",
        'ec_no', c."EC No",
        'restriction', c.Restriction,
        'function', c.Function
      )
    ELSE NULL END as cosing_data
  FROM ingredients_master m
  LEFT JOIN ingredients_usfda u ON u.master_name = m.name
  LEFT JOIN ingredients_cosing c ON c.master_name = m.name
  WHERE LOWER(m.name) = LOWER(ingredient_name_param);
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_ingredient_full_details IS 'Helper function to retrieve complete ingredient information from master and subtype tables';


-- =====================================================
-- STEP 8: Create Views for Backward Compatibility
-- =====================================================

-- View that mimics the old merged structure
CREATE OR REPLACE VIEW ingredients_merged_view AS
SELECT
  m.name,
  m.cas_number,
  m.description,
  ARRAY_REMOVE(ARRAY[
    CASE WHEN u.master_name IS NOT NULL THEN 'USFDA' END,
    CASE WHEN c.master_name IS NOT NULL THEN 'EU COSING' END
  ], NULL) as sources,
  -- COSING functions
  CASE
    WHEN c.Function IS NOT NULL
    THEN string_to_array(TRIM(c.Function), ',')
    ELSE ARRAY[]::TEXT[]
  END as functions,
  c.Restriction as restriction,
  c."EC No" as ec_number,
  -- USFDA fields
  u.POTENCY_AMOUNT as potency_amount,
  u.POTENCY_UNIT as potency_unit,
  u.MAXIMUM_DAILY_EXPOSURE as max_daily_exposure,
  u.MAXIMUM_DAILY_EXPOSURE_UNIT as max_daily_exposure_unit,
  u.ROUTE as route,
  u.UNII as unii,
  m.created_at,
  m.updated_at
FROM ingredients_master m
LEFT JOIN ingredients_usfda u ON u.master_name = m.name
LEFT JOIN ingredients_cosing c ON c.master_name = m.name;

COMMENT ON VIEW ingredients_merged_view IS 'Backward-compatible view showing merged ingredient data from all sources';


-- =====================================================
-- Migration Complete
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Master table: ingredients_master';
  RAISE NOTICE 'Subtype tables: ingredients_usfda, ingredients_cosing';
  RAISE NOTICE 'References table: ingredient_references_master';
  RAISE NOTICE 'Helper view: ingredients_merged_view';
  RAISE NOTICE '==============================================';
END $$;
