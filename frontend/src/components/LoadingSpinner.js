import React from 'react';

const LoadingSpinner = ({ size = 'md', className = '', text = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`loading ${sizeClasses[size]}`}></div>
      {text && <span className="ml-2 text-sm text-gray-600">{text}</span>}
    </div>
  );
};

export const LoadingOverlay = ({ children, isLoading, text = 'Loading...' }) => {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="loading-overlay">
          <LoadingSpinner size="lg" text={text} />
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;