import React, { ReactNode } from 'react';

interface ResultCardProps {
  icon: ReactNode;
  title: string;
  content: ReactNode;
  action?: ReactNode;
}

export const ResultCard: React.FC<ResultCardProps> = ({ icon, title, content, action }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100 transition-all duration-300 hover:shadow-lg hover:border-indigo-200 mb-4">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
          {icon}
        </div>
        <div className="flex-1">
          <h4 className="text-md font-semibold text-gray-800">{title}</h4>
          <div className="mt-1 text-gray-600 text-sm">{content}</div>
           {action && <div className="mt-4">{action}</div>}
        </div>
      </div>
    </div>
  );
};