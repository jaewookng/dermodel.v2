
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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

interface IngredientTableProps {
  ingredients: ProcessedIngredient[];
}

const categoryColors = {
  hydrating: 'bg-blue-100 text-blue-700',
  'anti-aging': 'bg-purple-100 text-purple-700',
  'acne-fighting': 'bg-green-100 text-green-700',
  brightening: 'bg-yellow-100 text-yellow-700',
  sensitive: 'bg-pink-100 text-pink-700'
};

export const IngredientTable = ({ ingredients }: IngredientTableProps) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const openPubMed = (ingredientName: string) => {
    const searchUrl = `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(ingredientName)}+dermatology`;
    window.open(searchUrl, '_blank');
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="w-8"></TableHead>
            <TableHead className="font-semibold">Ingredient Name</TableHead>
            <TableHead className="font-semibold">Category</TableHead>
            <TableHead className="font-semibold">CAS Number</TableHead>
            <TableHead className="font-semibold">Route</TableHead>
            <TableHead className="font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ingredients.map((ingredient) => (
            <Collapsible key={ingredient.id} open={expandedRows.has(ingredient.id)}>
              <TableRow className="hover:bg-gray-50">
                <TableCell>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => toggleRow(ingredient.id)}
                    >
                      {expandedRows.has(ingredient.id) ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </TableCell>
                <TableCell className="font-medium">{ingredient.name}</TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${categoryColors[ingredient.category]}`}
                  >
                    {ingredient.category.replace('-', ' ')}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {ingredient.casNumber || '-'}
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {ingredient.route || '-'}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => openPubMed(ingredient.name)}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Research
                  </Button>
                </TableCell>
              </TableRow>
              <CollapsibleContent asChild>
                <TableRow className="bg-gray-25">
                  <TableCell colSpan={6} className="p-4 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-sm mb-2">Description</h4>
                        <p className="text-xs text-gray-600 mb-3">{ingredient.description}</p>
                        
                        <h4 className="font-medium text-sm mb-2">Benefits</h4>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {ingredient.benefits.map((benefit, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {benefit}
                            </Badge>
                          ))}
                        </div>
                        
                        <h4 className="font-medium text-sm mb-2">Suitable Skin Types</h4>
                        <div className="flex flex-wrap gap-1">
                          {ingredient.skinTypes.map((skinType, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skinType}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm mb-2">Technical Data</h4>
                        <div className="space-y-1 text-xs">
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
                        
                        <h4 className="font-medium text-sm mb-2 mt-3">Addresses Concerns</h4>
                        <div className="flex flex-wrap gap-1">
                          {ingredient.concerns.map((concern, index) => (
                            <Badge key={index} variant="outline" className="text-xs bg-rose-50 text-rose-700">
                              {concern}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
