
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X, Filter } from 'lucide-react';

interface FilterState {
  search: string;
  category: string;
  hasData: string;
  sortBy: string;
}

interface IngredientFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  totalCount: number;
  filteredCount: number;
}

export const IngredientFilters = ({ 
  filters, 
  onFiltersChange, 
  totalCount, 
  filteredCount 
}: IngredientFiltersProps) => {
  const updateFilter = (key: keyof FilterState, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      category: 'all',
      hasData: 'all',
      sortBy: 'name'
    });
  };

  const hasActiveFilters = filters.search || filters.category !== 'all' || filters.hasData !== 'all';

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <h3 className="font-medium text-gray-700">Filters</h3>
          {hasActiveFilters && (
            <Badge variant="secondary" className="text-xs">
              {filteredCount} of {totalCount}
            </Badge>
          )}
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search ingredients..."
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
            <SelectValue placeholder="Data Availability" />
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
            <SelectItem value="category">Category</SelectItem>
            <SelectItem value="cas">CAS Number</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
