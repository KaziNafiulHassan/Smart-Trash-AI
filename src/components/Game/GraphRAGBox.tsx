
import React from 'react';
import { Brain, Sparkles } from 'lucide-react';
import DualStarRating from './DualStarRating';
import { Language } from '@/types/common';

interface GraphRAGBoxProps {
  message: string;
  language: Language;
  onClarityRating: (rating: number) => void;
  onHelpfulnessRating: (rating: number) => void;
}

const texts = {
  EN: {
    title: 'AI Assistant',
    rateHelpfulness: 'Rate the helpfulness of this explanation'
  },
  DE: {
    title: 'KI-Assistent',
    rateHelpfulness: 'Bewerten Sie die Hilfe dieser Erklärung'
  }
};

const GraphRAGBox: React.FC<GraphRAGBoxProps> = ({ message, language, onClarityRating, onHelpfulnessRating }) => {
  const t = texts[language];

  return (
    <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-lg p-4 mb-4">
      <div className="flex items-center mb-3">
        <div className="flex items-center">
          <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
          <Sparkles className="w-4 h-4 text-purple-500 dark:text-purple-300 mr-1" />
        </div>
        <h3 className="font-semibold text-purple-800 dark:text-purple-300">{t.title}</h3>
      </div>
      
      <div className="bg-white dark:bg-gray-800/50 rounded-md p-3 border border-purple-100 dark:border-purple-800">
        <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-sm">
          {message}
        </p>
      </div>
      
      <div className="mt-4 pt-3 border-t border-purple-200 dark:border-purple-700">
        <DualStarRating
          onClarityRating={onClarityRating}
          onHelpfulnessRating={onHelpfulnessRating}
          language={language}
          size={18}
        />
      </div>
    </div>
  );
};

export default GraphRAGBox;
