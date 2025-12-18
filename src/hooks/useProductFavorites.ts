import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface ProductFavoriteRow {
  id: string;
  user_id: string;
  product_id: string;
  notes: string | null;
  created_at: string;
  sss_products?: {
    product_id: string;
    product_name: string;
    ingredient_count: number | null;
  } | null;
}

export const useProductFavorites = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['product_favorites', user?.id],
    queryFn: async (): Promise<ProductFavoriteRow[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('product_favorites')
        .select(
          `
          *,
          sss_products (
            product_id,
            product_name,
            ingredient_count
          )
        `,
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as ProductFavoriteRow[];
    },
    enabled: !!user,
  });

  const addFavorite = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('product_favorites')
        .insert({
          user_id: user.id,
          product_id: productId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product_favorites', user?.id] });
    },
  });

  const removeFavorite = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('product_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product_favorites', user?.id] });
    },
  });

  const isFavorite = (productId: string) => {
    return query.data?.some((fav) => fav.product_id === productId) || false;
  };

  return {
    favorites: query.data || [],
    loading: query.isLoading,
    error: query.error,
    addFavorite,
    removeFavorite,
    isFavorite,
  };
};

