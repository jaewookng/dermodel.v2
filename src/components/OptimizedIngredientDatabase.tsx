import { useState, useMemo, useCallback } from 'react';
import { Loader2, Database, AlertCircle, Search } from 'lucide-react';
import { useIngredients, useIngredientsCount } from '@/hooks/useIngredients';
import { IngredientTable } from './IngredientTable';
import { SimplePagination } from './SimplePagination';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDebounce } from '@/hooks/useDebounce';

interface FilterState {
  search: string;
  category: string;
  hasData: string;
  sortBy: string;
}

export const OptimizedIngredientDatabase = () => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: 'all',
    hasData: 'all',
    sortBy: 'name'
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Increased to show more items  
  // Debounce search to avoid too many API calls
  const debouncedSearch = useDebounce(filters.search, 300);
  
  const queryFilters = useMemo(() => ({
    search: debouncedSearch,
    category: filters.category,
    hasData: filters.hasData,
    sortBy: filters.sortBy,
    page: currentPage,
    limit: itemsPerPage
  }), [debouncedSearch, filters.category, filters.hasData, filters.sortBy, currentPage, itemsPerPage]);
  
  const { data: ingredientsResponse, isLoading, error, isFetching } = useIngredients(queryFilters);
  const { data: totalCount = 0 } = useIngredientsCount();
  
  const ingredients = ingredientsResponse?.data || [];
  const displayedCount = ingredientsResponse?.totalCount || 0;
  const totalPages = Math.ceil(displayedCount / itemsPerPage);
  
  const updateFilter = useCallback((key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      category: 'all',
      hasData: 'all',
      sortBy: 'name'
    });
    setCurrentPage(1);
  }, []);
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleItemsPerPageChange = useCallback((items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  }, []);

  const hasActiveFilters = filters.search || filters.category !== 'all';

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
          {(isLoading || isFetching) && (
            <Loader2 className="h-3 w-3 animate-spin text-violet-600" />
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
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="h-6 w-6 mx-auto mb-2 text-violet-600 animate-spin" />
              <p className="text-sm text-gray-600">Loading ingredients...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <AlertCircle className="h-6 w-6 mx-auto mb-2 text-red-500" />
              <p className="text-sm text-red-600">Error loading ingredients</p>
            </div>
          </div>
        )}

        {/* Data Table */}
        {!isLoading && !error && ingredients.length > 0 && (
          <>
            <div className="bg-white rounded border overflow-hidden">
              <IngredientTable ingredients={ingredients} />
            </div>
            
            <div className="mt-2">
              <SimplePagination
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                totalItems={displayedCount}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            </div>
          </>
        )}
        {/* No Results */}
        {!isLoading && !error && ingredients.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Database className="h-6 w-6 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">No ingredients found</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};