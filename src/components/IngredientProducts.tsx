import { useIngredientProducts } from '@/hooks/useIngredientProducts';

interface IngredientProductsProps {
  ingredientId: string;
  onProductClick?: (productId: string, productName: string) => void;
}

export const IngredientProducts = ({ ingredientId, onProductClick }: IngredientProductsProps) => {
  const { data: products, isLoading } = useIngredientProducts(ingredientId);

  if (isLoading) {
    return (
      <div className="pt-2">
        <span className="font-medium text-gray-700">Products:</span>
        <div className="text-xs text-gray-400 mt-1">Loading products...</div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="pt-2">
      <span className="font-medium text-gray-700">Products ({products.length}):</span>
      <div className="mt-1 space-y-1">
        {products.map((product) => (
          <div
            key={product.product_id}
            className="text-xs text-gray-600 pl-2 border-l-2 border-blue-200"
          >
            <div className="flex justify-between">
              <button
                onClick={() => onProductClick?.(product.product_id, product.product_name)}
                className="font-medium text-blue-600 hover:text-blue-800 hover:underline text-left"
              >
                {product.product_name}
              </button>
              {product.ingredient_count && (
                <span className="text-gray-500">
                  {product.ingredient_count} ingredients
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
