'use client';

import { useEffect, useState } from 'react';

interface SuccessMessageProps {
  message: string;
  onDismiss?: () => void;
  autoDismiss?: number;
}

export default function SuccessMessage({ 
  message, 
  onDismiss, 
  autoDismiss 
}: SuccessMessageProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoDismiss) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onDismiss?.(), 300);
      }, autoDismiss);
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, onDismiss]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss?.(), 300);
  };

  if (!isVisible) return null;

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between animate-scaleIn shadow-md">
      <div className="flex items-center flex-1">
        <svg
          className="w-5 h-5 text-green-500 mr-3 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-green-700 text-sm md:text-base">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={handleDismiss}
          className="ml-4 text-green-500 hover:text-green-700 transition-colors focus-ring rounded p-1"
          aria-label="Dismiss"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

