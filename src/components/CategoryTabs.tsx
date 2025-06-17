
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CategoryTabsProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export const CategoryTabs = ({ selectedCategory, onCategoryChange }: CategoryTabsProps) => {
  return (
    <Tabs value={selectedCategory} onValueChange={onCategoryChange} className="w-full">
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
    </Tabs>
  );
};
