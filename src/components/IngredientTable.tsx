
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
    <div className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="w-6 p-2"></TableHead>
            <TableHead className="font-medium text-xs p-2">Name</TableHead>
            <TableHead className="font-medium text-xs p-2">Category</TableHead>
            <TableHead className="font-medium text-xs p-2">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ingredients.map((ingredient) => (
            <Collapsible key={ingredient.id} open={expandedRows.has(ingredient.id)}>
              <TableRow className="hover:bg-gray-50">
                <TableCell className="p-2">
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0"
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
                <TableCell className="font-medium text-xs p-2">{ingredient.name}</TableCell>
                <TableCell className="p-2">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${categoryColors[ingredient.category]}`}
                  >
                    {ingredient.category.replace('-', ' ')}
                  </Badge>
                </TableCell>
                <TableCell className="p-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 text-xs px-2"
                    onClick={() => openPubMed(ingredient.name)}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Research
                  </Button>
                </TableCell>
              </TableRow>
              <CollapsibleContent asChild>
                <TableRow className="bg-gray-25">
                  <TableCell colSpan={4} className="p-3 border-t">
                    <div className="grid grid-cols-1 gap-3 text-xs">
                      <div>
                        <p className="text-gray-600 mb-2">{ingredient.description}</p>
                        
                        <div className="flex flex-wrap gap-1 mb-2">
                          {ingredient.benefits.map((benefit, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {benefit}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {ingredient.skinTypes.map((skinType, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skinType}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {(ingredient.casNumber || ingredient.potency || ingredient.maxExposure) && (
                        <div className="text-xs text-gray-600 mt-2">
                          {ingredient.casNumber && <div>CAS: {ingredient.casNumber}</div>}
                          {ingredient.potency && <div>Potency: {ingredient.potency}</div>}
                          {ingredient.maxExposure && <div>Max Exposure: {ingredient.maxExposure}</div>}
                        </div>
                      )}
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
