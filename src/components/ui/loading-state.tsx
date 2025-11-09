import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  submessage?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingState = ({ 
  message = 'Loading...', 
  submessage,
  size = 'md',
  className = ''
}: LoadingStateProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={`flex items-center justify-center py-8 ${className}`}>
      <div className="text-center">
        <Loader2 className={`${sizeClasses[size]} mx-auto mb-2 text-violet-600 animate-spin`} />
        <p className="text-sm text-gray-600">{message}</p>
        {submessage && (
          <p className="text-xs text-gray-500 mt-1">{submessage}</p>
        )}
      </div>
    </div>
  );
};