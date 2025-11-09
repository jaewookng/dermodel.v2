import { Database, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: 'database' | 'search' | 'filter';
  actionLabel?: string;
  onAction?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export const EmptyState = ({ 
  title = "No results found", 
  message = "Try adjusting your filters or search criteria.",
  icon = 'database',
  actionLabel,
  onAction,
  size = 'md' 
}: EmptyStateProps) => {
  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };
  
  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };
  
  const icons = {
    database: Database,
    search: Search,
    filter: Filter
  };
  
  const Icon = icons[icon];
  
  return (
    <div className="flex items-center justify-center py-8">
      <div className="text-center">
        <Icon className={`${sizeClasses[size]} mx-auto mb-2 text-gray-400`} />
        <p className={`${textSizeClasses[size]} font-medium text-gray-600 mb-1`}>
          {title}
        </p>
        <p className={`${textSizeClasses[size]} text-gray-500`}>
          {message}
        </p>
        {actionLabel && onAction && (
          <Button
            variant="outline" 
            size="sm"
            onClick={onAction}
            className="mt-3"
          >
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
};
