import React, { useState, useEffect } from 'react';

const loadingMessages = [
    "Analyzing your outfit's key elements...",
    "Consulting our style database...",
    "Pairing accessories and footwear...",
    "Scouring the web for shoppable matches...",
    "Crafting your personalized style report...",
    "Almost ready, just polishing the details!",
];

export const Loader: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
    }, 2500); // Change message every 2.5 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      <p className="text-indigo-600 font-semibold text-lg text-center">Analyzing Your Style</p>
      <p className="text-gray-500 text-sm h-5 transition-opacity duration-500 text-center">
        {loadingMessages[messageIndex]}
      </p>
    </div>
  );
};