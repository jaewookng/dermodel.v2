import { Database, Search, Package, FileX } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: 'database' | 'search' | 'package' | 'file';
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState = ({ 
  title = 'No results found', 
  message = 'Try adjusting your filters or search terms',
  icon = 'database',
  action,
  className = ''
}: EmptyStateProps) => {
  const icons = {
    database: Database,
    search: Search,
    package: Package,
    file: FileX
  };

  const Icon = icons[icon];

  return (
    <div className={`flex items-center justify-center py-8 ${className}`}>
      <div className="text-center">
        <Icon className="h-8 w-8 mx-auto mb-3 text-gray-400" />
        <h3 className="text-sm font-medium text-gray-900 mb-1">{title}</h3>
        <p className="text-xs text-gray-500">{message}</p>
        {action && (
          <button
            onClick={action.onClick}
            className="mt-3 px-4 py-1.5 text-xs bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
};