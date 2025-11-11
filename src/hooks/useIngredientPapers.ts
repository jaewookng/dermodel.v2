import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface IngredientPaper {
  id: string;
  title: string;
  authors: string;
  journal: string;
  year: number;
  url: string;
  doi: string | null;
  summary: string;
}

export const useIngredientPapers = (ingredientName: string) => {
  return useQuery({
    queryKey: ['ingredient-papers', ingredientName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ingredient_references')
        .select('*')
        .eq('ingredient_name', ingredientName.toLowerCase())
        .order('year', { ascending: false });

      if (error) {
        console.error('Error fetching papers:', error);
        throw error;
      }

      return data as IngredientPaper[];
    },
    enabled: !!ingredientName,
  });
};
