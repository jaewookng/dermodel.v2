import { useState, Fragment } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { IngredientPapers } from './IngredientPapers';

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
  sources: string[];
  functions: string[];
  restriction?: string;
  ecNumber?: string;
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

const sourceColors: Record<string, string> = {
  'USFDA': 'bg-blue-50 text-blue-600 border-blue-200',
  'EU COSING': 'bg-yellow-50 text-yellow-700 border-yellow-200'
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


  return (
    <div className="overflow-hidden pointer-events-auto">
      <Table className="pointer-events-auto">
        <TableHeader>
          <TableRow className="bg-gray-50 pointer-events-auto">
            <TableHead className="w-10 p-2"></TableHead>
            <TableHead className="p-2 text-xs font-medium text-gray-700">Name</TableHead>
            <TableHead className="p-2 text-xs font-medium text-gray-700">Source</TableHead>
            <TableHead className="p-2 text-xs font-medium text-gray-700">Category</TableHead>
            <TableHead className="p-2 text-xs font-medium text-gray-700">Functions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ingredients.map((ingredient) => {
            const isExpanded = expandedRows.has(ingredient.id);
            return (
              <Fragment key={ingredient.id}>
                <TableRow className="hover:bg-gray-50 pointer-events-auto">
                  <TableCell className="p-2 w-10 pointer-events-auto">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 pointer-events-auto"
                      onClick={() => toggleRow(ingredient.id)}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="p-2 font-medium text-xs pointer-events-auto">{ingredient.name}</TableCell>
                  <TableCell className="p-2 pointer-events-auto">
                    <div className="flex gap-1 flex-wrap">
                      {ingredient.sources.map((source) => (
                        <Badge
                          key={source}
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 ${sourceColors[source]} pointer-events-auto`}
                        >
                          {source === 'USFDA' ? 'FDA' : 'EU'}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="p-2 pointer-events-auto">
                    <Badge
                      variant="outline"
                      className={`text-xs ${categoryColors[ingredient.category]} pointer-events-auto`}
                    >
                      {ingredient.category.replace('-', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="p-2 pointer-events-auto">
                    <div className="flex gap-1 flex-wrap max-w-[200px]">
                      {ingredient.functions.length > 0 ? (
                        ingredient.functions.slice(0, 3).map((func, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 bg-gray-50 text-gray-600 border-gray-200 pointer-events-auto"
                          >
                            {func}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                      {ingredient.functions.length > 3 && (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 bg-gray-50 text-gray-600 border-gray-200 pointer-events-auto"
                        >
                          +{ingredient.functions.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
                {isExpanded && (
                  <TableRow className="pointer-events-auto">
                    <TableCell colSpan={5} className="p-3 bg-gray-50 pointer-events-auto">
                      <div className="space-y-2 text-xs pointer-events-auto">
                        <div>
                          <p className="text-gray-600">{ingredient.description}</p>
                          <IngredientPapers ingredientName={ingredient.name} />
                        </div>

                        {/* All Functions */}
                        {ingredient.functions.length > 0 && (
                          <div className="pt-2">
                            <span className="font-medium text-gray-700">All Functions:</span>
                            <div className="flex gap-1 flex-wrap mt-1">
                              {ingredient.functions.map((func, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 border-gray-200 pointer-events-auto"
                                >
                                  {func}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* EU Restriction Warning */}
                        {ingredient.restriction && (
                          <div className="pt-2">
                            <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                              EU Restriction: {ingredient.restriction}
                            </Badge>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div>
                            <span className="font-medium text-gray-700">Benefits:</span>
                            <p className="text-gray-600">{ingredient.benefits.join(', ')}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Skin Types:</span>
                            <p className="text-gray-600">{ingredient.skinTypes.join(', ')}</p>
                          </div>
                        </div>
                        {(ingredient.casNumber || ingredient.ecNumber || ingredient.potency || ingredient.maxExposure) && (
                          <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-gray-200">
                            {ingredient.casNumber && (
                              <div>
                                <span className="font-medium text-gray-700">CAS:</span>
                                <p className="text-gray-600">{ingredient.casNumber}</p>
                              </div>
                            )}
                            {ingredient.ecNumber && (
                              <div>
                                <span className="font-medium text-gray-700">EC:</span>
                                <p className="text-gray-600">{ingredient.ecNumber}</p>
                              </div>
                            )}
                            {ingredient.potency && (
                              <div>
                                <span className="font-medium text-gray-700">Potency:</span>
                                <p className="text-gray-600">{ingredient.potency}</p>
                              </div>
                            )}
                            {ingredient.maxExposure && (
                              <div>
                                <span className="font-medium text-gray-700">Max Exposure:</span>
                                <p className="text-gray-600">{ingredient.maxExposure}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};