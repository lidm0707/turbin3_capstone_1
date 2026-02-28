import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({
  size = 'md',
  text,
  fullScreen = false
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
    xl: 'h-16 w-16 border-4'
  };

  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <div className={`animate-spin rounded-full ${sizeClasses[size]} border-t-purple-500 border-r-pink-500 border-b-purple-500 border-l-transparent`}></div>
        <div className={`absolute inset-0 ${sizeClasses[size]} rounded-full border-t-transparent border-r-pink-500/30 border-b-transparent border-l-purple-500/30 animate-pulse`}></div>
      </div>
      {text && (
        <p className="text-gray-300 text-sm font-medium animate-pulse">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
}
