import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SupabaseIngredient {
  INGREDIENT_NAME: string;
  CAS_NUMBER: number | null;
  ROUTE: string | null;
  UNII: string | null;
  POTENCY_AMOUNT: string | null;
  POTENCY_UNIT: string | null;
  MAXIMUM_DAILY_EXPOSURE: string | null;
  MAXIMUM_DAILY_EXPOSURE_UNIT: string | null;
  RECORD_UPDATED: string | null;
  database: string | null;
  DESCRIPTION: string | null;
}

interface ProcessedIngredient {
  id: string;
  name: string;
  category: 'hydrating' | 'anti-aging' | 'acne-fighting' | 'brightening' | 'sensitive';
  description: string;
  benefits: string[];
  skinTypes: string[];
  concerns: string[];
  casNumber?: string;
  route?: string;
  potency?: string;
  maxExposure?: string;
}

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

// Helper functions remain the same
const categorizeIngredient = (name: string, route: string | null): ProcessedIngredient['category'] => {
  const nameLower = name.toLowerCase();
  const routeLower = route?.toLowerCase() || '';
  
  if (nameLower.includes('acid') && (nameLower.includes('hyaluronic') || nameLower.includes('sodium'))) {
    return 'hydrating';
  }
  if (nameLower.includes('retinol') || nameLower.includes('vitamin a') || nameLower.includes('palmitate')) {
    return 'anti-aging';
  }
  if (nameLower.includes('salicylic') || nameLower.includes('benzoyl') || routeLower.includes('acne')) {
    return 'acne-fighting';
  }
  if (nameLower.includes('vitamin c') || nameLower.includes('ascorbic') || nameLower.includes('kojic')) {
    return 'brightening';
  }
  if (nameLower.includes('ceramide') || nameLower.includes('allantoin') || nameLower.includes('panthenol')) {
    return 'sensitive';
  }
  
  return 'hydrating';
};

const generateBenefits = (name: string, category: ProcessedIngredient['category']): string[] => {
  switch (category) {
    case 'hydrating':
      return ['Moisturizes skin', 'Plumps appearance', 'Smooth texture'];
    case 'anti-aging':
      return ['Reduces fine lines', 'Improves firmness', 'Evens texture'];
    case 'acne-fighting':
      return ['Clears pores', 'Reduces breakouts', 'Controls oil'];
    case 'brightening':
      return ['Evens skin tone', 'Reduces dark spots', 'Adds glow'];
    case 'sensitive':
      return ['Soothes irritation', 'Strengthens barrier', 'Calms redness'];
    default:
      return ['Improves skin health'];
  }
};

const getSkinTypes = (category: ProcessedIngredient['category']): string[] => {
  switch (category) {
    case 'hydrating':
      return ['All skin types'];
    case 'anti-aging':
      return ['Normal', 'Dry', 'Mature'];
    case 'acne-fighting':
      return ['Oily', 'Acne-prone', 'Combination'];
    case 'brightening':
      return ['All skin types'];
    case 'sensitive':
      return ['Sensitive', 'Dry', 'Irritated'];
    default:
      return ['All skin types'];
  }
};

const getConcerns = (category: ProcessedIngredient['category']): string[] => {
  switch (category) {
    case 'hydrating':
      return ['Dryness', 'Dehydration', 'Fine lines'];
    case 'anti-aging':
      return ['Wrinkles', 'Loss of firmness', 'Age spots'];
    case 'acne-fighting':
      return ['Acne', 'Blackheads', 'Oily skin'];
    case 'brightening':
      return ['Dark spots', 'Uneven tone', 'Dullness'];
    case 'sensitive':
      return ['Irritation', 'Redness', 'Sensitivity'];
    default:
      return ['General skin health'];
  }
};

const processIngredient = (ingredient: SupabaseIngredient): ProcessedIngredient => {
  const category = categorizeIngredient(ingredient.INGREDIENT_NAME, ingredient.ROUTE);
  const benefits = generateBenefits(ingredient.INGREDIENT_NAME, category);
  const skinTypes = getSkinTypes(category);
  const concerns = getConcerns(category);
  
  const potency = ingredient.POTENCY_AMOUNT && ingredient.POTENCY_UNIT 
    ? `${ingredient.POTENCY_AMOUNT} ${ingredient.POTENCY_UNIT}`
    : undefined;
    
  const maxExposure = ingredient.MAXIMUM_DAILY_EXPOSURE && ingredient.MAXIMUM_DAILY_EXPOSURE_UNIT
    ? `${ingredient.MAXIMUM_DAILY_EXPOSURE} ${ingredient.MAXIMUM_DAILY_EXPOSURE_UNIT}`
    : undefined;

  return {
    id: ingredient.CAS_NUMBER?.toString() || ingredient.INGREDIENT_NAME,
    name: ingredient.INGREDIENT_NAME,
    category,
    description: ingredient.DESCRIPTION || `A scientifically-backed ingredient${potency ? ` with ${potency} potency` : ''}${ingredient.ROUTE ? ` for ${ingredient.ROUTE.toLowerCase()} application` : ''}.`,
    benefits,
    skinTypes,
    concerns,
    casNumber: ingredient.CAS_NUMBER?.toString(),
    route: ingredient.ROUTE,
    potency,
    maxExposure
  };
};

export const useIngredients = (filters: FilterParams = {}) => {
  const { page = 1, limit = 50, search, category, hasData, sortBy = 'name' } = filters;
  
  return useQuery({
    queryKey: ['ingredients', { page, limit, search, category, hasData, sortBy }],
    queryFn: async (): Promise<IngredientsResponse> => {
      console.log('🔍 Fetching ingredients with filters:', filters);
      
      try {
        let query = supabase.from('ingredients').select('*', { count: 'exact' });
        
        // Apply search filter
        if (search) {
          query = query.or(`INGREDIENT_NAME.ilike.%${search}%,DESCRIPTION.ilike.%${search}%,CAS_NUMBER.eq.${search}`);
        }
        
        // Apply category filter (this would need to be done post-processing since categories are derived)
        // For now, we'll handle this in the frontend
        
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
        
        let processed = data.map(processIngredient);
        
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
