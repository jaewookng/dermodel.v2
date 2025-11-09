import { useCallback } from 'react';
import { Database, Search } from 'lucide-react';
import { useIngredients, useIngredientsCount } from '@/hooks/useIngredients';
import { useIngredientFilters } from '@/hooks/useIngredientFilters';
import { IngredientTable } from './IngredientTable';
import { SimplePagination } from './SimplePagination';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/states';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export const OptimizedIngredientDatabase = () => {
  const {
    filters,
    pagination,
    queryParams,
    hasActiveFilters,
    updateFilter,
    clearFilters,
    setCurrentPage,
    setItemsPerPage
  } = useIngredientFilters(300); // 300ms debounce
  
  const { data: ingredientsResponse, isLoading, error, isFetching } = useIngredients(queryParams);
  const { data: totalCount = 0 } = useIngredientsCount();
  
  const ingredients = ingredientsResponse?.data || [];
  const displayedCount = ingredientsResponse?.totalCount || 0;
  const totalPages = Math.ceil(displayedCount / pagination.itemsPerPage);  
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [setCurrentPage]);

  const handleItemsPerPageChange = useCallback((items: number) => {
    setItemsPerPage(items);
  }, [setItemsPerPage]);

  if (error) {
    console.error('Error loading ingredients:', error);
  }

  return (
    <div className="h-full flex flex-col p-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-violet-600" />
          <h2 className="text-base font-semibold text-gray-800">Ingredients</h2>
          {isFetching && (
            <div className="animate-pulse w-2 h-2 bg-violet-600 rounded-full" />
          )}
        </div>
        <div className="text-xs text-gray-500">
          {totalCount.toLocaleString()} total
        </div>
      </div>      
      {/* Compact Filters */}
      <div className="space-y-2 mb-3">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
          <Input
            placeholder="Search ingredients..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-7 h-8 text-sm"
          />
        </div>

        <div className="flex gap-2">
          <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="hydrating">Hydrating</SelectItem>
              <SelectItem value="anti-aging">Anti-Aging</SelectItem>
              <SelectItem value="acne-fighting">Acne Fighting</SelectItem>
              <SelectItem value="brightening">Brightening</SelectItem>
              <SelectItem value="sensitive">Sensitive Skin</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-sm">
              Clear
            </Button>
          )}
        </div>
      </div>      
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Loading State */}
        {isLoading && (
          <LoadingState 
            message="Loading ingredients..." 
            submessage="Fetching from database"
            size="sm"
          />
        )}

        {/* Error State */}
        {error && !isLoading && (
          <ErrorState 
            title="Error loading ingredients"
            message="Please try refreshing the page"
            type="error"
            action={{
              label: "Retry",
              onClick: () => window.location.reload()
            }}
          />
        )}

        {/* Data Table */}
        {!isLoading && !error && ingredients.length > 0 && (
          <>
            <div className="bg-white rounded border overflow-hidden">
              <IngredientTable ingredients={ingredients} />
            </div>
            
            <div className="mt-2">
              <SimplePagination
                currentPage={pagination.currentPage}
                totalPages={totalPages}
                itemsPerPage={pagination.itemsPerPage}
                totalItems={displayedCount}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            </div>
          </>
        )}
        
        {/* No Results */}
        {!isLoading && !error && ingredients.length === 0 && (
          <EmptyState 
            title="No ingredients found"
            message="Try adjusting your filters or search terms"
            icon="database"
            action={hasActiveFilters ? {
              label: "Clear filters",
              onClick: clearFilters
            } : undefined}
          />
        )}
      </div>
    </div>
  );
};