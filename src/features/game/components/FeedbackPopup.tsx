
import React from 'react';
import { X, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Language } from '@/types/common';

interface FeedbackPopupProps {
  feedback: {
    correct: boolean;
    item: any;
    bin: any;
    message: string;
  };
  language: Language;
  onClose: () => void;
}

const texts = {
  EN: {
    great: 'Great Job!',
    oops: 'Oops!',
    continue: 'Continue',
    learMore: 'Learn More'
  },
  DE: {
    great: 'Toll gemacht!',
    oops: 'Ups!',
    continue: 'Weiter',
    learMore: 'Mehr erfahren'
  }
};

const FeedbackPopup: React.FC<FeedbackPopupProps> = ({ feedback, language, onClose }) => {
  const t = texts[language];

  // Split the message at "💡 Tip:" or "💡 Tipp:" to handle formatting
  const messageParts = feedback.message.split(/\n\n💡 (Tip|Tipp):/);
  const mainMessage = messageParts[0];
  const tipMessage = messageParts.length > 2 ? messageParts[2] : null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-scale-in">
        <div className="text-center">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
            feedback.correct ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
          }`}>
            {feedback.correct ? (
              <CheckCircle className="w-8 h-8 text-green-500" />
            ) : (
              <XCircle className="w-8 h-8 text-red-500" />
            )}
          </div>
          
          <h2 className={`text-2xl font-bold mb-2 ${
            feedback.correct ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {feedback.correct ? t.great : t.oops}
          </h2>
          
          <div className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
            <p className="mb-3">{mainMessage}</p>
            {tipMessage && (
              <p className="text-base bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg border-l-4 border-blue-400">
                <span className="font-semibold">🤖 {language === 'EN' ? 'Tip' : 'Tipp'}:</span> {tipMessage}
              </p>
            )}
          </div>

          {/* Only show visual indicator if there's no tip message */}
          {!tipMessage && (
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                {feedback.item.image_url ? (
                  <img 
                    src={feedback.item.image_url} 
                    alt={feedback.item.item_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl">📦</span>
                )}
              </div>
              <span className="text-2xl dark:text-gray-300">→</span>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${feedback.bin.color}`}>
                <span className="text-white text-xl">🗑️</span>
              </div>
            </div>
          )}

          <Button
            onClick={onClose}
            className={`w-full py-3 text-lg font-semibold rounded-xl transition-all duration-200 ${
              feedback.correct 
                ? 'bg-green-500 hover:bg-green-600 text-white' 
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            {t.continue}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPopup;
