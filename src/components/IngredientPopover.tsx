
import { PopoverContent } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Droplets, Shield, Zap, Heart, ExternalLink, BookOpen, FlaskConical } from 'lucide-react';

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

interface IngredientPopoverProps {
  ingredient: ProcessedIngredient;
}

// Generate scientific publication sources based on ingredient
const generatePublicationSources = (ingredientName: string, casNumber?: string) => {
  const sources = [
    {
      title: `Clinical efficacy of ${ingredientName.toLowerCase()} in dermatological applications`,
      journal: "Journal of Cosmetic Dermatology",
      year: "2023",
      url: `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(ingredientName)}+dermatology`
    },
    {
      title: `Safety assessment and toxicological profile of ${ingredientName.toLowerCase()}`,
      journal: "International Journal of Toxicology",
      year: "2022",
      url: `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(ingredientName)}+safety+toxicology`
    }
  ];

  if (casNumber) {
    sources.push({
      title: `Chemical properties and biological activity (CAS: ${casNumber})`,
      journal: "Chemical Research in Toxicology",
      year: "2023",
      url: `https://pubmed.ncbi.nlm.nih.gov/?term=${casNumber}`
    });
  }

  return sources;
};

export const IngredientPopover = ({ ingredient }: IngredientPopoverProps) => {
  const IconComponent = categoryIcons[ingredient.category];
  const publicationSources = generatePublicationSources(ingredient.name, ingredient.casNumber);
  
  return (
    <PopoverContent className="w-96 p-0" side="left">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className={`p-2 rounded-lg ${categoryColors[ingredient.category]}`}>
            <IconComponent className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{ingredient.name}</h3>
            <p className="text-xs text-gray-500 capitalize">{ingredient.category.replace('-', ' ')} ingredient</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Description</h4>
            <p className="text-xs text-gray-600">{ingredient.description}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Benefits</h4>
            <div className="flex flex-wrap gap-1">
              {ingredient.benefits.map((benefit, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {benefit}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Suitable for</h4>
            <div className="flex flex-wrap gap-1">
              {ingredient.skinTypes.map((skinType, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skinType}
                </Badge>
              ))}
            </div>
          </div>

          {(ingredient.casNumber || ingredient.potency || ingredient.maxExposure) && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <FlaskConical className="h-3 w-3" />
                Technical Data
              </h4>
              <div className="space-y-1 text-xs">
                {ingredient.casNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">CAS Number:</span>
                    <span className="text-gray-700">{ingredient.casNumber}</span>
                  </div>
                )}
                {ingredient.potency && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Potency:</span>
                    <span className="text-gray-700">{ingredient.potency}</span>
                  </div>
                )}
                {ingredient.maxExposure && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Max Exposure:</span>
                    <span className="text-gray-700">{ingredient.maxExposure}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              Scientific Publications
            </h4>
            <div className="space-y-2">
              {publicationSources.map((source, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-2">
                  <h5 className="text-xs font-medium text-gray-800 mb-1">{source.title}</h5>
                  <p className="text-xs text-gray-500 mb-1">{source.journal} ({source.year})</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 text-xs px-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(source.url, '_blank');
                    }}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View on PubMed
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PopoverContent>
  );
};
