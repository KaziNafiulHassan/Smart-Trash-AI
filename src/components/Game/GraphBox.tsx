
import React from 'react';
import { Database, MapPin } from 'lucide-react';
import StarRating from './StarRating';
import { Language } from '@/types/common';

interface GraphData {
  correctBin: string;
  category: string;
  material: string;
  rule: string;
  recyclingCenter: string;
}

interface GraphBoxProps {
  data: GraphData;
  language: Language;
  onRating: (rating: number) => void;
}

const texts = {
  EN: {
    title: 'Waste Information',
    correctBin: 'Correct Bin',
    category: 'Category',
    material: 'Material',
    rule: 'Rule',
    recyclingCenter: 'Recycling Center',
    rateHelpfulness: 'Rate the helpfulness of this information'
  },
  DE: {
    title: 'Abfall-Informationen',
    correctBin: 'Richtige Tonne',
    category: 'Kategorie',
    material: 'Material',
    rule: 'Regel',
    recyclingCenter: 'Recycling-Center',
    rateHelpfulness: 'Bewerten Sie die Hilfe dieser Information'
  }
};

const GraphBox: React.FC<GraphBoxProps> = ({ data, language, onRating }) => {
  const t = texts[language];

  return (
    <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-4">
      <div className="flex items-center mb-3">
        <Database className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
        <h3 className="font-semibold text-blue-800 dark:text-blue-300">{t.title}</h3>
      </div>
      
      <div className="space-y-3 text-sm">
        <div className="flex flex-col">
          <span className="font-medium text-gray-700 dark:text-gray-300">{t.correctBin}:</span>
          <span className="text-blue-700 dark:text-blue-400 font-semibold">{data.correctBin}</span>
        </div>
        
        <div className="flex flex-col">
          <span className="font-medium text-gray-700 dark:text-gray-300">{t.category}:</span>
          <span className="text-gray-800 dark:text-gray-200">{data.category}</span>
        </div>
        
        <div className="flex flex-col">
          <span className="font-medium text-gray-700 dark:text-gray-300">{t.material}:</span>
          <span className="text-gray-800 dark:text-gray-200">{data.material}</span>
        </div>
        
        <div className="flex flex-col">
          <span className="font-medium text-gray-700 dark:text-gray-300">{t.rule}:</span>
          <span className="text-gray-800 dark:text-gray-200 italic">{data.rule}</span>
        </div>
        
        <div className="flex flex-col">
          <span className="font-medium text-gray-700 dark:text-gray-300">{t.recyclingCenter}:</span>
          <div className="flex items-center mt-1">
            <MapPin className="w-4 h-4 text-green-600 dark:text-green-400 mr-1" />
            <span className="text-gray-800 dark:text-gray-200">{data.recyclingCenter}</span>
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-blue-200 dark:border-blue-700">
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{t.rateHelpfulness}:</p>
        <StarRating onRating={onRating} size={18} />
      </div>
    </div>
  );
};

export default GraphBox;
