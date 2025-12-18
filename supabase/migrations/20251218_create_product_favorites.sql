-- Create product_favorites table for user-liked products
CREATE TABLE IF NOT EXISTS product_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES sss_products(product_id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS on product_favorites
ALTER TABLE product_favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own product favorites
DROP POLICY IF EXISTS "Users can view their own product favorites" ON product_favorites;
CREATE POLICY "Users can view their own product favorites"
  ON product_favorites FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own product favorites
DROP POLICY IF EXISTS "Users can insert their own product favorites" ON product_favorites;
CREATE POLICY "Users can insert their own product favorites"
  ON product_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete their own product favorites
DROP POLICY IF EXISTS "Users can delete their own product favorites" ON product_favorites;
CREATE POLICY "Users can delete their own product favorites"
  ON product_favorites FOR DELETE
  USING (auth.uid() = user_id);
