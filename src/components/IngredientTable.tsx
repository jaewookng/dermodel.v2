import { useState, Fragment } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, FileText } from 'lucide-react';

interface ResearchPaper {
  title: string;
  authors: string;
  year: number;
  url: string;
}

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
  papers?: ResearchPaper[];
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


  return (
    <div className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="w-10 p-2"></TableHead>
            <TableHead className="p-2 text-xs font-medium text-gray-700">Name</TableHead>
            <TableHead className="p-2 text-xs font-medium text-gray-700">Category</TableHead>
            <TableHead className="p-2 text-xs font-medium text-gray-700">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ingredients.map((ingredient) => {
            const isExpanded = expandedRows.has(ingredient.id);
            return (
              <Fragment key={ingredient.id}>
                <TableRow className="hover:bg-gray-50">
                  <TableCell className="p-2 w-10">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0"
                      onClick={() => toggleRow(ingredient.id)}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="p-2 font-medium text-xs">{ingredient.name}</TableCell>
                  <TableCell className="p-2">
                    <Badge
                      variant="outline"
                      className={`text-xs ${categoryColors[ingredient.category]}`}
                    >
                      {ingredient.category.replace('-', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="p-2">
                    {/* Research button removed - papers shown inline */}
                  </TableCell>
                </TableRow>
                {isExpanded && (
                  <TableRow>
                    <TableCell colSpan={4} className="p-3 bg-gray-50">
                      <div className="space-y-2 text-xs">
                        <p className="text-gray-600">{ingredient.description}</p>
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
                        {(ingredient.casNumber || ingredient.potency || ingredient.maxExposure) && (
                          <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-gray-200">
                            {ingredient.casNumber && (
                              <div>
                                <span className="font-medium text-gray-700">CAS:</span>
                                <p className="text-gray-600">{ingredient.casNumber}</p>
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

                        {/* Research Papers Section - To be implemented with Supabase data */}
                        {ingredient.papers && ingredient.papers.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex items-center gap-1 mb-2">
                              <FileText className="h-3 w-3 text-gray-500" />
                              <span className="font-medium text-gray-700">Research Papers:</span>
                            </div>
                            <div className="space-y-2">
                              {ingredient.papers.map((paper, index) => (
                                <div key={index} className="pl-4">
                                  <a
                                    href={paper.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 hover:underline block"
                                  >
                                    <div className="font-medium text-xs">{paper.title}</div>
                                    <div className="text-gray-500 text-xs">{paper.authors} ({paper.year})</div>
                                  </a>
                                </div>
                              ))}
                            </div>
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