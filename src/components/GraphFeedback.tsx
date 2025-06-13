
import React from 'react';
import { MapPin, Info, Recycle } from 'lucide-react';

interface GraphFeedbackData {
  bin_type: string;
  bin_color: string;
  allowed_in_bin: string;
  recyclable: string;
  rule_en: string;
  rule_de?: string;
  recycling_centers: string[];
}

interface GraphFeedbackProps {
  data: GraphFeedbackData;
  isLoading?: boolean;
}

const GraphFeedback: React.FC<GraphFeedbackProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex items-center text-blue-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          Loading graph-based insights...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 flex items-center">
        <Info className="h-5 w-5 mr-2" />
        Graph-Based Insights
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Bin Type:</span>
            <span className="ml-2 text-lg font-bold text-blue-700 dark:text-blue-300 capitalize">
              {data.bin_type}
            </span>
          </div>
          
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Bin Color:</span>
            <span className="ml-2 text-lg font-bold capitalize" style={{ color: data.bin_color }}>
              {data.bin_color}
            </span>
          </div>
          
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Allowed in Bin:</span>
            <span className={`ml-2 text-lg font-bold ${data.allowed_in_bin === 'Yes' ? 'text-green-600' : 'text-red-600'}`}>
              {data.allowed_in_bin}
            </span>
          </div>
          
          <div className="flex items-center">
            <Recycle className="h-4 w-4 mr-2 text-gray-600" />
            <span className="font-medium text-gray-700 dark:text-gray-300">Recyclable:</span>
            <span className={`ml-2 text-lg font-bold ${data.recyclable === 'Yes' ? 'text-green-600' : 'text-red-600'}`}>
              {data.recyclable}
            </span>
          </div>
        </div>
        
        <div className="space-y-3">
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300 block mb-2">Disposal Rule:</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-3 rounded border">
              {data.rule_en}
            </p>
          </div>
        </div>
      </div>
      
      {data.recycling_centers && data.recycling_centers.length > 0 && (
        <div>
          <div className="flex items-center mb-2">
            <MapPin className="h-4 w-4 mr-2 text-gray-600" />
            <span className="font-medium text-gray-700 dark:text-gray-300">Recycling Centers:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.recycling_centers.map((center, index) => (
              <span 
                key={index}
                className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm"
              >
                {center}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphFeedback;
