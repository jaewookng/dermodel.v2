
import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Droplets, Shield, Zap, Heart, Loader2 } from 'lucide-react';
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
  const { data: ingredients = [], isLoading, error } = useIngredients();

  const filteredIngredients = useMemo(() => {
    return ingredients.filter(ingredient => {
      const matchesSearch = ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ingredient.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ingredient.benefits.some(benefit => benefit.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || ingredient.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory, ingredients]);

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

          {!isLoading && !error && filteredIngredients.map((ingredient) => {
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
