import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  processIngredients,
  processCosingIngredient,
  mergeIngredients,
  ProcessedIngredient,
  SupabaseIngredient,
  COSINGIngredient
} from '@/lib/ingredientProcessor';

interface FilterParams {
  search?: string;
  category?: string;
  hasData?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}

interface IngredientsResponse {
  data: ProcessedIngredient[];
  totalCount: number;
  hasMore: boolean;
}

export const useIngredients = (filters: FilterParams = {}) => {
  const { page = 1, limit = 50, search, category, hasData, sortBy = 'name' } = filters;

  return useQuery({
    queryKey: ['ingredients', { page, limit, search, category, hasData, sortBy }],
    queryFn: async (): Promise<IngredientsResponse> => {
      console.log('🔍 Fetching ingredients from USFDA and COSING with filters:', filters);

      try {
        // Fetch both USFDA and COSING ingredients in parallel (no limits - fetch all)
        const [fdaResult, cosingResult] = await Promise.all([
          supabase.from('ingredients').select('*'),
          supabase.from('COSING_ingredients').select('*')
        ]);

        if (fdaResult.error) {
          console.error('❌ FDA Supabase error:', fdaResult.error);
          throw fdaResult.error;
        }

        if (cosingResult.error) {
          console.error('❌ COSING Supabase error:', cosingResult.error);
          throw cosingResult.error;
        }

        console.log('✅ Raw FDA ingredients:', fdaResult.data?.length || 0);
        console.log('✅ Raw COSING ingredients:', cosingResult.data?.length || 0);

        // Process both datasets
        const processedFDA = processIngredients(fdaResult.data as SupabaseIngredient[]);
        const processedCOSING = (cosingResult.data as COSINGIngredient[]).map(processCosingIngredient);

        // Merge ingredients by CAS number (already sorted alphabetically)
        let merged = mergeIngredients(processedFDA, processedCOSING);

        console.log('🔄 Merged ingredients:', merged.length);

        // Apply search filter
        if (search && search.trim()) {
          const searchTerm = search.trim().toLowerCase();
          merged = merged.filter(ingredient =>
            ingredient.name.toLowerCase().includes(searchTerm) ||
            ingredient.description.toLowerCase().includes(searchTerm) ||
            ingredient.casNumber?.toLowerCase().includes(searchTerm) ||
            ingredient.functions.some(fn => fn.toLowerCase().includes(searchTerm))
          );
        }

        // Apply category filter
        if (category && category !== 'all') {
          merged = merged.filter(ingredient => ingredient.category === category);
        }

        // Apply data availability filters
        if (hasData === 'with-cas') {
          merged = merged.filter(ing => ing.casNumber);
        } else if (hasData === 'with-potency') {
          merged = merged.filter(ing => ing.potency);
        } else if (hasData === 'with-exposure') {
          merged = merged.filter(ing => ing.maxExposure);
        }

        // Sorting (already alphabetical by default from mergeIngredients)
        if (sortBy === 'name-desc') {
          merged = merged.sort((a, b) => b.name.localeCompare(a.name));
        } else if (sortBy === 'cas') {
          merged = merged.sort((a, b) => {
            if (!a.casNumber) return 1;
            if (!b.casNumber) return -1;
            return a.casNumber.localeCompare(b.casNumber);
          });
        }
        // sortBy === 'name' is already applied

        const totalCount = merged.length;

        // Apply pagination
        const from = (page - 1) * limit;
        const to = from + limit;
        const paginatedData = merged.slice(from, to);

        console.log('📄 Paginated ingredients:', paginatedData.length, 'items, total:', totalCount);

        return {
          data: paginatedData,
          totalCount,
          hasMore: to < totalCount
        };
      } catch (error) {
        console.error('💥 Error in ingredient fetch:', error);
        throw error;
      }
    },
    retry: 2,
    retryDelay: 500,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
// Hook for getting total count of merged ingredients
export const useIngredientsCount = () => {
  return useQuery({
    queryKey: ['ingredients-count'],
    queryFn: async () => {
      // Fetch both tables and merge to get accurate count
      const [fdaResult, cosingResult] = await Promise.all([
        supabase.from('ingredients').select('*', { count: 'exact', head: true }),
        supabase.from('COSING_ingredients').select('*', { count: 'exact', head: true })
      ]);

      if (fdaResult.error) throw fdaResult.error;
      if (cosingResult.error) throw cosingResult.error;

      // For a rough estimate, we can add both counts
      // (Note: This may overcount if there are duplicates, but it's close enough for display)
      const fdaCount = fdaResult.count || 0;
      const cosingCount = cosingResult.count || 0;

      // Return combined count as approximation
      return fdaCount + cosingCount;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};