
import { useState, useMemo, useEffect } from 'react';
import { Loader2, Database, AlertCircle } from 'lucide-react';
import { useIngredients } from '@/hooks/useIngredients';
import { IngredientTable } from './IngredientTable';
import { IngredientFilters } from './IngredientFilters';
import { SimplePagination } from './SimplePagination';

interface FilterState {
  search: string;
  category: string;
  hasData: string;
  sortBy: string;
}

export const NewIngredientDatabase = () => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: 'all',
    hasData: 'all',
    sortBy: 'name'
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  
  const { data: ingredients = [], isLoading, error } = useIngredients();

  // Filter and sort ingredients
  const filteredIngredients = useMemo(() => {
    let filtered = ingredients.filter(ingredient => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesSearch = 
          ingredient.name.toLowerCase().includes(searchTerm) ||
          ingredient.description.toLowerCase().includes(searchTerm) ||
          ingredient.benefits.some(benefit => benefit.toLowerCase().includes(searchTerm)) ||
          (ingredient.casNumber && ingredient.casNumber.includes(searchTerm));
        
        if (!matchesSearch) return false;
      }

      // Category filter
      if (filters.category !== 'all' && ingredient.category !== filters.category) {
        return false;
      }

      // Data availability filter
      if (filters.hasData !== 'all') {
        if (filters.hasData === 'with-cas' && !ingredient.casNumber) return false;
        if (filters.hasData === 'with-potency' && !ingredient.potency) return false;
        if (filters.hasData === 'with-exposure' && !ingredient.maxExposure) return false;
      }

      return true;
    });

    // Sort ingredients
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'cas':
          const aCas = a.casNumber || '';
          const bCas = b.casNumber || '';
          return aCas.localeCompare(bCas);
        default:
          return 0;
      }
    });

    return filtered;
  }, [ingredients, filters]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, itemsPerPage]);

  // Pagination
  const totalPages = Math.ceil(filteredIngredients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedIngredients = filteredIngredients.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
  };

  if (error) {
    console.error('Error loading ingredients:', error);
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Database className="h-6 w-6 text-violet-600" />
          <h2 className="text-xl font-bold text-gray-800">Ingredient Database</h2>
        </div>
        {isLoading && <Loader2 className="h-5 w-5 animate-spin text-violet-600" />}
        {!isLoading && (
          <div className="text-sm text-gray-500">
            {ingredients.length.toLocaleString()} total ingredients
          </div>
        )}
      </div>

      {/* Filters */}
      <IngredientFilters
        filters={filters}
        onFiltersChange={setFilters}
        totalCount={ingredients.length}
        filteredCount={filteredIngredients.length}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12 bg-white rounded-lg border">
          <div className="text-center">
            <Loader2 className="h-8 w-8 mx-auto mb-4 text-violet-600 animate-spin" />
            <p className="text-gray-600">Loading ingredient database...</p>
            <p className="text-sm text-gray-500 mt-1">This may take a moment for large datasets</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-center justify-center py-12 bg-white rounded-lg border">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
            <p className="text-red-600">Error loading ingredients</p>
            <p className="text-sm text-gray-500 mt-1">Please try refreshing the page</p>
          </div>
        </div>
      )}

      {/* Data Table */}
      {!isLoading && !error && (
        <>
          <IngredientTable ingredients={paginatedIngredients} />
          
          <SimplePagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={filteredIngredients.length}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </>
      )}

      {/* No Results */}
      {!isLoading && !error && filteredIngredients.length === 0 && ingredients.length > 0 && (
        <div className="flex items-center justify-center py-12 bg-white rounded-lg border">
          <div className="text-center">
            <Database className="h-8 w-8 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">No ingredients match your filters</p>
            <p className="text-sm text-gray-500 mt-1">Try adjusting your search criteria</p>
          </div>
        </div>
      )}
    </div>
  );
};
