import { AlertCircle, XCircle, Info, AlertTriangle } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  type?: 'error' | 'warning' | 'info';
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const ErrorState = ({ 
  title = 'Something went wrong', 
  message = 'Please try again later',
  type = 'error',
  action,
  className = ''
}: ErrorStateProps) => {
  const icons = {
    error: XCircle,
    warning: AlertTriangle,
    info: Info
  };

  const colors = {
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500'
  };

  const Icon = icons[type] || AlertCircle;
  const iconColor = colors[type];

  return (
    <div className={`flex items-center justify-center py-8 ${className}`}>
      <div className="text-center">
        <Icon className={`h-8 w-8 mx-auto mb-3 ${iconColor}`} />
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