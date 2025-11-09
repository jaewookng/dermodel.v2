import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  subMessage?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingState = ({ 
  message = "Loading...", 
  subMessage,
  size = 'md' 
}: LoadingStateProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };
  
  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };
  
  return (
    <div className="flex items-center justify-center py-8">
      <div className="text-center">
        <Loader2 className={`${sizeClasses[size]} mx-auto mb-2 text-violet-600 animate-spin`} />
        <p className={`${textSizeClasses[size]} text-gray-600`}>{message}</p>
        {subMessage && (
          <p className={`${textSizeClasses[size]} text-gray-500 mt-1`}>{subMessage}</p>
        )}
      </div>
    </div>
  );
};
