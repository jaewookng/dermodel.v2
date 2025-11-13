-- Create a policy to allow public read access to the COSING_ingredients table
CREATE POLICY "Allow public read access to COSING_ingredients"
ON public."COSING_ingredients"
FOR SELECT
TO public
USING (true);
