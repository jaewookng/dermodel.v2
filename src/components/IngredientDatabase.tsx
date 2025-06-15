
import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Droplets, Shield, Zap, Heart, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useIngredients } from '@/hooks/useIngredients';

const categoryIcons = {
  hydrating: Droplets,
  'anti-aging': Shield,
  'acne-fighting': Zap,
  brightening: Shield,
  sensitive: Heart
};

const categoryColors = {
  hydrating: 'bg-blue-100 text-blue-700 border-blue-200',
  'anti-aging': 'bg-purple-100 text-purple-700 border-purple-200',
  'acne-fighting': 'bg-green-100 text-green-700 border-green-200',
  brightening: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  sensitive: 'bg-pink-100 text-pink-700 border-pink-200'
};

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

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
          <TabsTrigger value="hydrating" className="text-xs">Hydrating</TabsTrigger>
        </TabsList>
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="anti-aging" className="text-xs">Anti-Aging</TabsTrigger>
          <TabsTrigger value="acne-fighting" className="text-xs">Acne</TabsTrigger>
        </TabsList>
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="brightening" className="text-xs">Brightening</TabsTrigger>
          <TabsTrigger value="sensitive" className="text-xs">Sensitive</TabsTrigger>
        </TabsList>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between mb-4 gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">Show:</span>
            <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger className="w-16 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="40">40</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>
              
              <span className="text-xs text-gray-600 px-2">
                {currentPage} of {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

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

          {!isLoading && !error && paginatedIngredients.map((ingredient) => {
            const IconComponent = categoryIcons[ingredient.category];
            return (
              <Card key={ingredient.id} className="p-3 hover:shadow-lg transition-all duration-300 border-rose-100 hover:border-violet-200">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${categoryColors[ingredient.category]}`}>
                      <IconComponent className="h-3 w-3" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">{ingredient.name}</h4>
                    </div>
                  </div>
                </div>
                
                <p className="text-xs text-gray-600 mb-2">{ingredient.description}</p>
                
                <div className="space-y-1">
                  <div>
                    <span className="text-xs font-medium text-gray-500">Benefits:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {ingredient.benefits.slice(0, 2).map((benefit, index) => (
                        <Badge key={index} variant="outline" className="text-xs py-0 px-1">
                          {benefit}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {ingredient.casNumber && (
                    <div>
                      <span className="text-xs font-medium text-gray-500">CAS:</span>
                      <span className="text-xs text-gray-600 ml-1">{ingredient.casNumber}</span>
                    </div>
                  )}
                  
                  {ingredient.potency && (
                    <div>
                      <span className="text-xs font-medium text-gray-500">Potency:</span>
                      <span className="text-xs text-gray-600 ml-1">{ingredient.potency}</span>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Results Summary */}
        {!isLoading && !error && (
          <div className="mt-3 text-xs text-gray-500 text-center">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredIngredients.length)} of {filteredIngredients.length} ingredients
          </div>
        )}
      </Tabs>

      {!isLoading && !error && filteredIngredients.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          <Shield className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No ingredients found.</p>
        </div>
      )}
    </div>
  );
};
