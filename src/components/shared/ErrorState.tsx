import { AlertCircle, RefreshCw, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  icon?: 'alert' | 'shield';
  onRetry?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export const ErrorState = ({ 
  title = "Error", 
  message = "Something went wrong. Please try again.",
  icon = 'alert',
  onRetry,
  size = 'md' 
}: ErrorStateProps) => {
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
  
  const Icon = icon === 'shield' ? Shield : AlertCircle;
  
  return (
    <div className="flex items-center justify-center py-8">
      <div className="text-center">
        <Icon className={`${sizeClasses[size]} mx-auto mb-2 text-red-500`} />
        <p className={`${textSizeClasses[size]} font-medium text-red-600 mb-1`}>
          {title}
        </p>
        <p className={`${textSizeClasses[size]} text-gray-500`}>
          {message}
        </p>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="mt-3"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
};
