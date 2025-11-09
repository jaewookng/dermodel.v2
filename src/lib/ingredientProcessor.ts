// Types for ingredient processing
export interface SupabaseIngredient {
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

export interface ProcessedIngredient {
  id: string;
  name: string;
  category: IngredientCategory;
  description: string;
  benefits: string[];
  skinTypes: string[];
  concerns: string[];
  casNumber?: string;
  route?: string;
  potency?: string;
  maxExposure?: string;
}

export type IngredientCategory = 
  | 'hydrating' 
  | 'anti-aging' 
  | 'acne-fighting' 
  | 'brightening' 
  | 'sensitive';
// Category mapping based on ingredient name and route
const CATEGORY_KEYWORDS: Record<IngredientCategory, { names: string[], routes: string[] }> = {
  'hydrating': {
    names: ['hyaluronic', 'sodium hyaluronate', 'glycerin', 'squalane', 'ceramide'],
    routes: ['moisturizing', 'hydrating']
  },
  'anti-aging': {
    names: ['retinol', 'vitamin a', 'palmitate', 'peptide', 'collagen'],
    routes: ['anti-aging', 'wrinkle']
  },
  'acne-fighting': {
    names: ['salicylic', 'benzoyl', 'niacinamide', 'zinc'],
    routes: ['acne', 'comedolytic']
  },
  'brightening': {
    names: ['vitamin c', 'ascorbic', 'kojic', 'arbutin', 'tranexamic'],
    routes: ['brightening', 'whitening']
  },
  'sensitive': {
    names: ['ceramide', 'allantoin', 'panthenol', 'centella', 'oat'],
    routes: ['soothing', 'calming']
  }
};
// Categorize ingredient based on name and route
export const categorizeIngredient = (
  name: string, 
  route: string | null
): IngredientCategory => {
  const nameLower = name.toLowerCase();
  const routeLower = route?.toLowerCase() || '';
  
  // Check each category's keywords
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const { names, routes } = keywords;
    
    // Check if name matches any keyword
    if (names.some(keyword => nameLower.includes(keyword))) {
      return category as IngredientCategory;
    }
    
    // Check if route matches any keyword
    if (route && routes.some(keyword => routeLower.includes(keyword))) {
      return category as IngredientCategory;
    }
  }
  
  // Default to hydrating
  return 'hydrating';
};
// Benefits mapping by category
const CATEGORY_BENEFITS: Record<IngredientCategory, string[]> = {
  'hydrating': ['Moisturizes skin', 'Plumps appearance', 'Smooth texture', 'Strengthens barrier'],
  'anti-aging': ['Reduces fine lines', 'Improves firmness', 'Evens texture', 'Boosts collagen'],
  'acne-fighting': ['Clears pores', 'Reduces breakouts', 'Controls oil', 'Prevents blemishes'],
  'brightening': ['Evens skin tone', 'Reduces dark spots', 'Adds glow', 'Fades hyperpigmentation'],
  'sensitive': ['Soothes irritation', 'Strengthens barrier', 'Calms redness', 'Reduces inflammation']
};

// Skin types mapping by category
const CATEGORY_SKIN_TYPES: Record<IngredientCategory, string[]> = {
  'hydrating': ['All skin types', 'Dry', 'Dehydrated'],
  'anti-aging': ['Normal', 'Dry', 'Mature'],
  'acne-fighting': ['Oily', 'Acne-prone', 'Combination'],
  'brightening': ['All skin types', 'Uneven tone'],
  'sensitive': ['Sensitive', 'Dry', 'Irritated']
};

// Concerns mapping by category
const CATEGORY_CONCERNS: Record<IngredientCategory, string[]> = {
  'hydrating': ['Dryness', 'Dehydration', 'Fine lines', 'Rough texture'],
  'anti-aging': ['Wrinkles', 'Loss of firmness', 'Age spots', 'Elasticity'],
  'acne-fighting': ['Acne', 'Blackheads', 'Oily skin', 'Large pores'],
  'brightening': ['Dark spots', 'Uneven tone', 'Dullness', 'Sun damage'],
  'sensitive': ['Irritation', 'Redness', 'Sensitivity', 'Inflammation']
};
// Main processing function
export const processIngredient = (ingredient: SupabaseIngredient): ProcessedIngredient => {
  const category = categorizeIngredient(ingredient.INGREDIENT_NAME, ingredient.ROUTE);
  
  // Format potency string
  const potency = ingredient.POTENCY_AMOUNT && ingredient.POTENCY_UNIT 
    ? `${ingredient.POTENCY_AMOUNT} ${ingredient.POTENCY_UNIT}`
    : undefined;
    
  // Format max exposure string  
  const maxExposure = ingredient.MAXIMUM_DAILY_EXPOSURE && ingredient.MAXIMUM_DAILY_EXPOSURE_UNIT
    ? `${ingredient.MAXIMUM_DAILY_EXPOSURE} ${ingredient.MAXIMUM_DAILY_EXPOSURE_UNIT}`
    : undefined;
  
  // Generate description if not provided
  const description = ingredient.DESCRIPTION || generateDescription(
    ingredient.INGREDIENT_NAME, 
    category, 
    potency, 
    ingredient.ROUTE
  );

  return {
    id: ingredient.CAS_NUMBER?.toString() || ingredient.INGREDIENT_NAME,
    name: ingredient.INGREDIENT_NAME,
    category,
    description,
    benefits: CATEGORY_BENEFITS[category],
    skinTypes: CATEGORY_SKIN_TYPES[category],
    concerns: CATEGORY_CONCERNS[category],
    casNumber: ingredient.CAS_NUMBER?.toString(),
    route: ingredient.ROUTE || undefined,
    potency,
    maxExposure
  };
};
// Helper function to generate description
const generateDescription = (
  name: string,
  category: IngredientCategory,
  potency?: string,
  route?: string | null
): string => {
  const categoryDescriptions: Record<IngredientCategory, string> = {
    'hydrating': 'hydrating and moisturizing',
    'anti-aging': 'anti-aging and rejuvenating',
    'acne-fighting': 'acne-fighting and clarifying',
    'brightening': 'brightening and tone-evening',
    'sensitive': 'soothing and calming'
  };
  
  let description = `A scientifically-backed ${categoryDescriptions[category]} ingredient`;
  
  if (potency) {
    description += ` with ${potency} potency`;
  }
  
  if (route) {
    description += ` for ${route.toLowerCase()} application`;
  }
  
  return description + '.';
};

// Batch processing function for multiple ingredients
export const processIngredients = (ingredients: SupabaseIngredient[]): ProcessedIngredient[] => {
  return ingredients.map(processIngredient);
};