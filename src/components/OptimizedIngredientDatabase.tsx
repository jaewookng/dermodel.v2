
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
  const [itemsPerPage, setItemsPerPage] = useState(50);
  
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

  const hasActiveFilters = filters.search || filters.category !== 'all' || filters.hasData !== 'all';

  if (error) {
    console.error('Error loading ingredients:', error);
  }

  return (
    <div className="space-y-4">
      {/* Header with improved loading states */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Database className="h-6 w-6 text-violet-600" />
            <h2 className="text-xl font-bold text-gray-800">Ingredient Database</h2>
          </div>
          {(isLoading || isFetching) && (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-violet-600" />
              <span className="text-sm text-gray-500">Loading...</span>
            </div>
          )}
        </div>
        <div className="text-sm text-gray-500">
          {totalCount.toLocaleString()} total ingredients
        </div>
      </div>

      {/* Improved Filters */}
      <div className="space-y-4 p-4 bg-white rounded-lg border shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-500" />
            <h3 className="font-medium text-gray-700">Search & Filter</h3>
            {hasActiveFilters && (
              <Badge variant="secondary" className="text-xs">
                {displayedCount.toLocaleString()} results
              </Badge>
            )}
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear all
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search ingredients, CAS numbers..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
            <SelectTrigger>
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

          <Select value={filters.hasData} onValueChange={(value) => updateFilter('hasData', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Data Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ingredients</SelectItem>
              <SelectItem value="with-cas">With CAS Number</SelectItem>
              <SelectItem value="with-potency">With Potency Data</SelectItem>
              <SelectItem value="with-exposure">With Exposure Limits</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              <SelectItem value="cas">CAS Number</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12 bg-white rounded-lg border">
          <div className="text-center">
            <Loader2 className="h-8 w-8 mx-auto mb-4 text-violet-600 animate-spin" />
            <p className="text-gray-600">Loading ingredients...</p>
            <p className="text-sm text-gray-500 mt-1">Searching through {totalCount.toLocaleString()} ingredients</p>
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
      {!isLoading && !error && ingredients.length > 0 && (
        <>
          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <IngredientTable ingredients={ingredients} />
          </div>
          
          <SimplePagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={displayedCount}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </>
      )}

      {/* No Results */}
      {!isLoading && !error && ingredients.length === 0 && (
        <div className="flex items-center justify-center py-12 bg-white rounded-lg border">
          <div className="text-center">
            <Database className="h-8 w-8 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">No ingredients match your criteria</p>
            <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters</p>
          </div>
        </div>
      )}
    </div>
  );
};
