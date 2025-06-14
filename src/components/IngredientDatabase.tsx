
import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Droplets, Shield, Zap, Heart } from 'lucide-react';

interface Ingredient {
  id: number;
  name: string;
  category: 'hydrating' | 'anti-aging' | 'acne-fighting' | 'brightening' | 'sensitive';
  description: string;
  benefits: string[];
  rating: number;
  skinTypes: string[];
  concerns: string[];
}

const ingredients: Ingredient[] = [
  {
    id: 1,
    name: 'Hyaluronic Acid',
    category: 'hydrating',
    description: 'A powerful humectant that can hold up to 1000 times its weight in water.',
    benefits: ['Deep hydration', 'Plumps skin', 'Reduces fine lines'],
    rating: 4.9,
    skinTypes: ['All skin types'],
    concerns: ['Dehydration', 'Fine lines', 'Dullness']
  },
  {
    id: 2,
    name: 'Retinol',
    category: 'anti-aging',
    description: 'A vitamin A derivative that accelerates cell turnover and stimulates collagen production.',
    benefits: ['Reduces wrinkles', 'Improves texture', 'Fades dark spots'],
    rating: 4.7,
    skinTypes: ['Normal', 'Oily', 'Combination'],
    concerns: ['Aging', 'Acne', 'Hyperpigmentation']
  },
  {
    id: 3,
    name: 'Niacinamide',
    category: 'acne-fighting',
    description: 'A form of vitamin B3 that regulates oil production and strengthens the skin barrier.',
    benefits: ['Controls oil', 'Minimizes pores', 'Reduces inflammation'],
    rating: 4.8,
    skinTypes: ['Oily', 'Combination', 'Acne-prone'],
    concerns: ['Acne', 'Large pores', 'Oiliness']
  },
  {
    id: 4,
    name: 'Vitamin C',
    category: 'brightening',
    description: 'A potent antioxidant that brightens skin and protects against environmental damage.',
    benefits: ['Brightens complexion', 'Evens skin tone', 'Antioxidant protection'],
    rating: 4.6,
    skinTypes: ['All skin types'],
    concerns: ['Dullness', 'Dark spots', 'Sun damage']
  },
  {
    id: 5,
    name: 'Ceramides',
    category: 'sensitive',
    description: 'Lipids that help restore and maintain the skin\'s natural barrier.',
    benefits: ['Strengthens barrier', 'Locks in moisture', 'Soothes irritation'],
    rating: 4.8,
    skinTypes: ['Dry', 'Sensitive', 'Mature'],
    concerns: ['Dryness', 'Sensitivity', 'Barrier damage']
  },
  {
    id: 6,
    name: 'Salicylic Acid',
    category: 'acne-fighting',
    description: 'A beta hydroxy acid that penetrates pores to remove dead skin cells and excess oil.',
    benefits: ['Unclogs pores', 'Exfoliates', 'Reduces blackheads'],
    rating: 4.5,
    skinTypes: ['Oily', 'Acne-prone'],
    concerns: ['Acne', 'Blackheads', 'Clogged pores']
  }
];

const categoryIcons = {
  hydrating: Droplets,
  'anti-aging': Star,
  'acne-fighting': Zap,
  brightening: Star,
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

  const filteredIngredients = useMemo(() => {
    return ingredients.filter(ingredient => {
      const matchesSearch = ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ingredient.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ingredient.benefits.some(benefit => benefit.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || ingredient.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const categories = ['all', ...Array.from(new Set(ingredients.map(i => i.category)))];

  return (
    <div className="space-y-6">
      <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-rose-100 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-gradient-to-r from-rose-400 to-violet-500 rounded-full"></div>
          Ingredient Database
        </h2>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-6">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="hydrating" className="text-xs">Hydrating</TabsTrigger>
            <TabsTrigger value="anti-aging" className="text-xs">Anti-Aging</TabsTrigger>
            <TabsTrigger value="acne-fighting" className="text-xs">Acne</TabsTrigger>
            <TabsTrigger value="brightening" className="text-xs">Brightening</TabsTrigger>
            <TabsTrigger value="sensitive" className="text-xs">Sensitive</TabsTrigger>
          </TabsList>

          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {filteredIngredients.map((ingredient) => {
              const IconComponent = categoryIcons[ingredient.category];
              return (
                <Card key={ingredient.id} className="p-4 hover:shadow-lg transition-all duration-300 border-rose-100 hover:border-violet-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${categoryColors[ingredient.category]}`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{ingredient.name}</h3>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-gray-600">{ingredient.rating}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className={categoryColors[ingredient.category]}>
                      {ingredient.category.replace('-', ' ')}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{ingredient.description}</p>
                  
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs font-medium text-gray-500">Benefits:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {ingredient.benefits.map((benefit, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {benefit}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Skin Types: {ingredient.skinTypes.join(', ')}</span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </Tabs>

        {filteredIngredients.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Shield className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No ingredients found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};
