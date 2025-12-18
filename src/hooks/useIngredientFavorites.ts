import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { Tables } from '@/integrations/supabase/types'

type Favorite = Tables<'ingredient_favorites'>

export const useIngredientFavorites = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['ingredient_favorites', user?.id],
    queryFn: async () => {
      if (!user) return []

      const { data, error } = await supabase
        .from('ingredient_favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    },
    enabled: !!user,
  })

  const addFavorite = useMutation({
    mutationFn: async (ingredientName: string) => {
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('ingredient_favorites')
        .insert({
          user_id: user.id,
          ingredient_name: ingredientName,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredient_favorites', user?.id] })
    },
  })

  const removeFavorite = useMutation({
    mutationFn: async (ingredientName: string) => {
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('ingredient_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('ingredient_name', ingredientName)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredient_favorites', user?.id] })
    },
  })

  const isFavorite = (ingredientName: string) => {
    return query.data?.some((fav) => fav.ingredient_name === ingredientName) || false
  }

  return {
    favorites: query.data || [],
    loading: query.isLoading,
    error: query.error,
    addFavorite,
    removeFavorite,
    isFavorite,
  }
}
