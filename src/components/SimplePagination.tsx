
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface SimplePaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
}

export const SimplePagination = ({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange
}: SimplePaginationProps) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between px-2 py-2 bg-gray-50 border-t text-xs pointer-events-auto">
      <div className="flex items-center gap-2 pointer-events-auto">
        <Select 
          value={itemsPerPage.toString()} 
          onValueChange={(value) => onItemsPerPageChange(Number(value))}
        >
          <SelectTrigger className="w-12 h-7 text-xs pointer-events-auto">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="pointer-events-auto">
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="15">15</SelectItem>
            <SelectItem value="20">20</SelectItem>
          </SelectContent>
        </Select>
        
        <span className="text-gray-600 pointer-events-none">
          {startItem}-{endItem} of {totalItems}
        </span>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-1 pointer-events-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="h-7 w-7 p-0 pointer-events-auto"
          >
            <ChevronsLeft className="h-3 w-3" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-7 w-7 p-0 pointer-events-auto"
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>
          
          <span className="text-gray-700 px-2 pointer-events-none">
            {currentPage}/{totalPages}
          </span>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-7 w-7 p-0 pointer-events-auto"
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="h-7 w-7 p-0 pointer-events-auto"
          >
            <ChevronsRight className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
};
