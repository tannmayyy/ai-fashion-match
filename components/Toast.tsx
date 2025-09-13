import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'info' | 'error' | 'success';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto-close after 5 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  const baseClasses = "fixed top-5 right-5 max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden z-50 transition-all duration-300 transform animate-fade-in-right";

  const typeStyles = {
    info: {
      container: 'bg-blue-50',
      icon: 'text-blue-500',
      text: 'text-blue-800'
    },
    success: {
        container: 'bg-green-50',
        icon: 'text-green-500',
        text: 'text-green-800'
    },
    error: {
        container: 'bg-red-50',
        icon: 'text-red-500',
        text: 'text-red-800'
    },
  };

  const selectedStyle = typeStyles[type];

  const Icon = () => {
    const iconClasses = `h-6 w-6 ${selectedStyle.icon}`;
    if (type === 'success') {
      return (
          <svg className={iconClasses} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      );
    }
    if (type === 'error') {
       return (
          <svg className={iconClasses} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
       );
    }
    // info icon
    return (
        <svg className={iconClasses} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    );
  }

  return (
    <div className={baseClasses} role="alert" aria-live="assertive" aria-atomic="true">
        <div className={`p-4 ${selectedStyle.container}`}>
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    <Icon />
                </div>
                <div className={`ml-3 w-0 flex-1 pt-0.5 ${selectedStyle.text}`}>
                    <p className="text-sm font-medium">{message}</p>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                    <button onClick={onClose} className={`inline-flex rounded-md ${selectedStyle.container} text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}>
                        <span className="sr-only">Close</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};
