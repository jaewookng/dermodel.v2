
import { useState, useMemo, useEffect } from 'react';
import { Popover, PopoverTrigger } from '@/components/ui/popover';
import { Loader2, Shield } from 'lucide-react';
import { useIngredients } from '@/hooks/useIngredients';
import { IngredientCard } from './IngredientCard';
import { IngredientPopover } from './IngredientPopover';
import { PaginationControls } from './PaginationControls';
import { CategoryTabs } from './CategoryTabs';

interface IngredientDatabaseProps {
  searchTerm: string;
}

export const IngredientDatabase = ({ searchTerm }: IngredientDatabaseProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const { data: ingredients = [], isLoading, error } = useIngredients();

  const filteredIngredients = useMemo(() => {
    const filtered = ingredients.filter(ingredient => {
      const matchesSearch = ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ingredient.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ingredient.benefits.some(benefit => benefit.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || ingredient.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
    
    // Sort ingredients alphabetically by name
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [searchTerm, selectedCategory, ingredients]);

  // Reset to page 1 when filters or itemsPerPage change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, itemsPerPage]);

  const totalPages = Math.ceil(filteredIngredients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedIngredients = filteredIngredients.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
  };

  if (error) {
    console.error('Error loading ingredients:', error);
  }

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-rose-100 p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <div className="w-2 h-2 bg-gradient-to-r from-rose-400 to-violet-500 rounded-full"></div>
        Ingredient Database
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      </h3>

      <CategoryTabs 
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      <PaginationControls
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        totalPages={totalPages}
        onItemsPerPageChange={handleItemsPerPageChange}
        onPageChange={handlePageChange}
      />

      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {isLoading && (
          <div className="text-center py-6">
            <Loader2 className="h-8 w-8 mx-auto mb-2 text-gray-400 animate-spin" />
            <p className="text-sm text-gray-500">Loading ingredients...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-6 text-red-500">
            <Shield className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">Error loading ingredients. Please try again.</p>
          </div>
        )}

        {!isLoading && !error && paginatedIngredients.map((ingredient) => (
          <Popover key={ingredient.id}>
            <PopoverTrigger asChild>
              <div>
                <IngredientCard 
                  ingredient={ingredient}
                  onClick={() => {}}
                />
              </div>
            </PopoverTrigger>
            <IngredientPopover ingredient={ingredient} />
          </Popover>
        ))}
      </div>

      {/* Results Summary */}
      {!isLoading && !error && (
        <div className="mt-3 text-xs text-gray-500 text-center">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredIngredients.length)} of {filteredIngredients.length} ingredients
        </div>
      )}

      {!isLoading && !error && filteredIngredients.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          <Shield className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No ingredients found.</p>
        </div>
      )}
    </div>
  );
};
