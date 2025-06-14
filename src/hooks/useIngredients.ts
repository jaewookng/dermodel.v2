
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
}

interface ProcessedIngredient {
  id: string;
  name: string;
  category: 'hydrating' | 'anti-aging' | 'acne-fighting' | 'brightening' | 'sensitive';
  description: string;
  benefits: string[];
  rating: number;
  skinTypes: string[];
  concerns: string[];
  casNumber?: string;
  route?: string;
  potency?: string;
  maxExposure?: string;
}

// Helper function to categorize ingredients based on name and route
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
  
  // Default categorization
  return 'hydrating';
};

// Helper function to generate user-friendly benefits based on ingredient properties
const generateBenefits = (name: string, category: ProcessedIngredient['category']): string[] => {
  const nameLower = name.toLowerCase();
  
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

// Helper function to determine suitable skin types
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

// Helper function to determine concerns addressed
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

// Transform scientific data into user-friendly format
const processIngredient = (ingredient: SupabaseIngredient): ProcessedIngredient => {
  const category = categorizeIngredient(ingredient.INGREDIENT_NAME, ingredient.ROUTE);
  const benefits = generateBenefits(ingredient.INGREDIENT_NAME, category);
  const skinTypes = getSkinTypes(category);
  const concerns = getConcerns(category);
  
  // Generate a simple rating based on available data completeness
  const dataCompleteness = [
    ingredient.CAS_NUMBER,
    ingredient.POTENCY_AMOUNT,
    ingredient.MAXIMUM_DAILY_EXPOSURE
  ].filter(Boolean).length;
  const rating = Math.min(4.9, 4.0 + (dataCompleteness * 0.3));
  
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
    description: `A scientifically-backed ingredient${potency ? ` with ${potency} potency` : ''}${ingredient.ROUTE ? ` for ${ingredient.ROUTE.toLowerCase()} application` : ''}.`,
    benefits,
    rating: Number(rating.toFixed(1)),
    skinTypes,
    concerns,
    casNumber: ingredient.CAS_NUMBER?.toString(),
    route: ingredient.ROUTE,
    potency,
    maxExposure
  };
};

export const useIngredients = () => {
  return useQuery({
    queryKey: ['ingredients'],
    queryFn: async () => {
      console.log('Fetching ingredients from Supabase...');
      const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .limit(50); // Limit for performance
      
      if (error) {
        console.error('Error fetching ingredients:', error);
        throw error;
      }
      
      console.log('Raw ingredients data:', data);
      
      const processed = data?.map(processIngredient) || [];
      console.log('Processed ingredients:', processed);
      
      return processed;
    },
  });
};
