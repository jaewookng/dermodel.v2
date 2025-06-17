
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Droplets, Shield, Zap, Heart } from 'lucide-react';

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

interface ProcessedIngredient {
  id: string;
  name: string;
  category: 'hydrating' | 'anti-aging' | 'acne-fighting' | 'brightening' | 'sensitive';
  description: string;
  benefits: string[];
  skinTypes: string[];
  concerns: string[];
  casNumber?: string;
  route?: string;
  potency?: string;
  maxExposure?: string;
}

interface IngredientCardProps {
  ingredient: ProcessedIngredient;
  onClick: () => void;
}

export const IngredientCard = ({ ingredient, onClick }: IngredientCardProps) => {
  const IconComponent = categoryIcons[ingredient.category];
  
  return (
    <Card 
      className="p-3 hover:shadow-lg transition-all duration-300 border-rose-100 hover:border-violet-200 cursor-pointer hover:scale-[1.02]"
      onClick={onClick}
    >
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
};
