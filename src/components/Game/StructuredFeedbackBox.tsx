import React from 'react';
import { Brain, Sparkles, CheckCircle, ArrowRight, Lightbulb } from 'lucide-react';
import DualStarRating from './DualStarRating';
import { Language } from '@/types/common';

interface StructuredFeedback {
  correctBin: {
    name: string;
    icon: string;
  };
  why: string;
  nextStep: string;
  didYouKnow: string;
}

interface StructuredFeedbackBoxProps {
  structuredFeedback?: StructuredFeedback;
  fallbackMessage?: string;
  language: Language;
  onClarityRating: (rating: number) => void;
  onHelpfulnessRating: (rating: number) => void;
}

const texts = {
  EN: {
    title: 'AI Assistant',
    correctBin: 'Correct Bin',
    why: 'Why',
    nextStep: 'Next Step',
    didYouKnow: 'Did You Know?',
    rateHelpfulness: 'Rate the helpfulness of this explanation'
  },
  DE: {
    title: 'KI-Assistent',
    correctBin: 'Richtige Tonne',
    why: 'Warum',
    nextStep: 'Nächster Schritt',
    didYouKnow: 'Wussten Sie schon?',
    rateHelpfulness: 'Bewerten Sie die Hilfe dieser Erklärung'
  }
};

const StructuredFeedbackBox: React.FC<StructuredFeedbackBoxProps> = ({ 
  structuredFeedback, 
  fallbackMessage, 
  language, 
  onClarityRating, 
  onHelpfulnessRating 
}) => {
  const t = texts[language];

  return (
    <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-lg p-4 mb-4">
      <div className="flex items-center mb-4">
        <div className="flex items-center">
          <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
          <Sparkles className="w-4 h-4 text-purple-500 dark:text-purple-300 mr-1" />
        </div>
        <h3 className="font-semibold text-purple-800 dark:text-purple-300">{t.title}</h3>
      </div>
      
      {structuredFeedback ? (
        <div className="space-y-4">
          {/* Correct Bin Section */}
          <div className="bg-white dark:bg-gray-800/50 rounded-md p-3 border border-purple-100 dark:border-purple-800">
            <div className="flex items-center mb-2">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mr-2" />
              <h4 className="font-medium text-gray-800 dark:text-gray-200">{t.correctBin}:</h4>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{structuredFeedback.correctBin.icon}</span>
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                {structuredFeedback.correctBin.name}
              </span>
            </div>
          </div>

          {/* Why Section */}
          <div className="bg-white dark:bg-gray-800/50 rounded-md p-3 border border-purple-100 dark:border-purple-800">
            <div className="flex items-center mb-2">
              <Brain className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" />
              <h4 className="font-medium text-gray-800 dark:text-gray-200">{t.why}:</h4>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
              {structuredFeedback.why}
            </p>
          </div>

          {/* Next Step Section */}
          <div className="bg-white dark:bg-gray-800/50 rounded-md p-3 border border-purple-100 dark:border-purple-800">
            <div className="flex items-center mb-2">
              <ArrowRight className="w-4 h-4 text-orange-600 dark:text-orange-400 mr-2" />
              <h4 className="font-medium text-gray-800 dark:text-gray-200">{t.nextStep}:</h4>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
              {structuredFeedback.nextStep}
            </p>
          </div>

          {/* Did You Know Section */}
          <div className="bg-white dark:bg-gray-800/50 rounded-md p-3 border border-purple-100 dark:border-purple-800">
            <div className="flex items-center mb-2">
              <Lightbulb className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mr-2" />
              <h4 className="font-medium text-gray-800 dark:text-gray-200">{t.didYouKnow}:</h4>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
              {structuredFeedback.didYouKnow}
            </p>
          </div>
        </div>
      ) : (
        // Fallback to simple message display
        <div className="bg-white dark:bg-gray-800/50 rounded-md p-3 border border-purple-100 dark:border-purple-800">
          <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-sm">
            {fallbackMessage || 'AI Assistant feedback is currently unavailable.'}
          </p>
        </div>
      )}

      {/* Rating Section */}
      <div className="mt-4 pt-4 border-t border-purple-200 dark:border-purple-700">
        <DualStarRating
          language={language}
          onClarityRating={onClarityRating}
          onHelpfulnessRating={onHelpfulnessRating}
        />
      </div>
    </div>
  );
};

export default StructuredFeedbackBox;
