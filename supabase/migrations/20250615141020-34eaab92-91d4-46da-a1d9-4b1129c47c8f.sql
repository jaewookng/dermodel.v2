
-- Create a policy to allow public read access to the ingredients table
CREATE POLICY "Allow public read access to ingredients" 
ON public.ingredients
FOR SELECT 
TO public 
USING (true);
