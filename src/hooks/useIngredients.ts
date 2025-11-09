import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  processIngredients, 
  ProcessedIngredient,
  SupabaseIngredient 
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
      console.log('🔍 Fetching ingredients with filters:', filters);
      
      try {
        let query = supabase.from('ingredients').select('*', { count: 'exact' });
        
        // Apply search filter with partial match and case-insensitive searching
        if (search && search.trim()) {
          const searchTerm = search.trim();
          // Escape special characters that might interfere with the query
          // Use % wildcards for PostgreSQL ilike (case-insensitive partial matching)
          // Supabase will handle URL encoding automatically
          const escapedTerm = searchTerm.replace(/%/g, '\\%').replace(/_/g, '\\_');
          const searchPattern = `%${escapedTerm}%`;
          
          // Build OR conditions for case-insensitive partial matching
          // Search in INGREDIENT_NAME and DESCRIPTION fields
          const searchConditions = [
            `INGREDIENT_NAME.ilike.${searchPattern}`,
            `DESCRIPTION.ilike.${searchPattern}`
          ];
          
          // If search term is purely numeric, also search CAS_NUMBER
          // Cast CAS_NUMBER to text for partial matching support
          // Note: PostgREST may support this syntax; if not, search will still work
          // for INGREDIENT_NAME and DESCRIPTION fields
          if (/^\d+$/.test(searchTerm)) {
            searchConditions.push(`CAS_NUMBER::text.ilike.${searchPattern}`);
          }
          
          // Apply OR filter - matches if ANY condition is true
          // This enables searching across multiple columns simultaneously
          query = query.or(searchConditions.join(','));
        }
        
        // Apply data availability filters
        if (hasData === 'with-cas') {
          query = query.not('CAS_NUMBER', 'is', null);
        } else if (hasData === 'with-potency') {
          query = query.not('POTENCY_AMOUNT', 'is', null);
        } else if (hasData === 'with-exposure') {
          query = query.not('MAXIMUM_DAILY_EXPOSURE', 'is', null);
        }
        
        // Apply sorting
        if (sortBy === 'name' || sortBy === 'name-desc') {
          query = query.order('INGREDIENT_NAME', { ascending: sortBy === 'name' });
        } else if (sortBy === 'cas') {
          query = query.order('CAS_NUMBER', { ascending: true, nullsLast: true });
        }
        
        // Apply pagination
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);        
        const { data, error, count } = await query;
        
        if (error) {
          console.error('❌ Supabase error:', error);
          throw error;
        }
        
        console.log('✅ Raw ingredients data received:', data?.length || 0, 'items, total:', count);
        
        if (!data) {
          return { data: [], totalCount: 0, hasMore: false };
        }
        
        // Process ingredients using centralized processor
        let processed = processIngredients(data as SupabaseIngredient[]);
        
        // Apply category filter post-processing
        if (category && category !== 'all') {
          processed = processed.filter(ingredient => ingredient.category === category);
        }
        
        console.log('🔄 Processed ingredients:', processed.length, 'items');
        
        return {
          data: processed,
          totalCount: count || 0,
          hasMore: count ? (page * limit) < count : false
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
// Hook for getting total count
export const useIngredientsCount = () => {
  return useQuery({
    queryKey: ['ingredients-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('ingredients')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};