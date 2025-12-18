import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { Tables } from '@/integrations/supabase/types'

type HistoryEntry = Tables<'ingredient_history'>

export const useIngredientHistory = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['ingredient_history', user?.id],
    queryFn: async () => {
      if (!user) return []

      const { data, error } = await supabase
        .from('ingredient_history')
        .select('*')
        .eq('user_id', user.id)
        .order('viewed_at', { ascending: false })
        .limit(50)

      if (error) throw error
      return data || []
    },
    enabled: !!user,
  })

  const trackIngredient = useMutation({
    mutationFn: async (ingredientName: string, action: string = 'viewed') => {
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('ingredient_history')
        .insert({
          user_id: user.id,
          ingredient_name: ingredientName,
          action,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredient_history', user?.id] })
    },
  })

  const clearHistory = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('ingredient_history')
        .delete()
        .eq('user_id', user.id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredient_history', user?.id] })
    },
  })

  return {
    history: query.data || [],
    loading: query.isLoading,
    error: query.error,
    trackIngredient,
    clearHistory,
  }
}
