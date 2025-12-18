import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useIngredientFavorites } from '@/hooks/useIngredientFavorites'
import { LoginDialog } from './Auth/LoginDialog'
import { useState } from 'react'
import { toast } from 'sonner'

interface IngredientFavoriteButtonProps {
  ingredientName: string
  className?: string
}

export const IngredientFavoriteButton = ({
  ingredientName,
  className,
}: IngredientFavoriteButtonProps) => {
  const { session } = useAuth()
  const { isFavorite, addFavorite, removeFavorite } = useIngredientFavorites()
  const [loginOpen, setLoginOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleFavoriteClick = async () => {
    if (!session) {
      setLoginOpen(true)
      return
    }

    try {
      setIsLoading(true)
      if (isFavorite(ingredientName)) {
        await removeFavorite.mutateAsync(ingredientName)
        toast.success('Removed from favorites')
      } else {
        await addFavorite.mutateAsync(ingredientName)
        toast.success('Added to favorites')
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
      toast.error('Failed to update favorite')
    } finally {
      setIsLoading(false)
    }
  }

  const favorite = isFavorite(ingredientName)

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleFavoriteClick}
        disabled={isLoading || addFavorite.isPending || removeFavorite.isPending}
        className={className}
        title={favorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Heart
          className={`h-4 w-4 ${
            favorite ? 'fill-red-500 text-red-500' : 'text-gray-400'
          }`}
        />
      </Button>
      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
    </>
  )
}
