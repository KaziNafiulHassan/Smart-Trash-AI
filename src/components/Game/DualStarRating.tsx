import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Language } from '@/types/common';

interface DualStarRatingProps {
  onClarityRating: (rating: number) => void;
  onHelpfulnessRating: (rating: number) => void;
  language: Language;
  size?: number;
}

const texts = {
  EN: {
    clarityTitle: 'Clarity Rating',
    helpfulnessTitle: 'Helpfulness Rating',
    clarityLabels: {
      1: 'Very confusing',
      2: 'Confusing', 
      3: 'Moderate',
      4: 'Clear',
      5: 'Very clear'
    },
    helpfulnessLabels: {
      1: 'Bad',
      2: 'Not helpful',
      3: 'Helpful', 
      4: 'Very helpful',
      5: 'Excellent'
    }
  },
  DE: {
    clarityTitle: 'Klarheitsbewertung',
    helpfulnessTitle: 'Hilfreichkeitsbewertung',
    clarityLabels: {
      1: 'Sehr verwirrend',
      2: 'Verwirrend',
      3: 'Mäßig',
      4: 'Klar',
      5: 'Sehr klar'
    },
    helpfulnessLabels: {
      1: 'Schlecht',
      2: 'Nicht hilfreich',
      3: 'Hilfreich',
      4: 'Sehr hilfreich', 
      5: 'Ausgezeichnet'
    }
  }
};

interface StarRowProps {
  title: string;
  labels: Record<number, string>;
  onRating: (rating: number) => void;
  size: number;
}

const StarRow: React.FC<StarRowProps> = ({ title, labels, onRating, size }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const handleStarClick = (starValue: number) => {
    setRating(starValue);
    onRating(starValue);
  };

  const handleStarHover = (starValue: number) => {
    setHoverRating(starValue);
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  const currentRating = hoverRating || rating;
  const currentLabel = currentRating > 0 ? labels[currentRating] : '';

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</h4>
        <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[100px] text-right">
          {currentLabel}
        </span>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1" onMouseLeave={handleMouseLeave}>
          {[1, 2, 3, 4, 5].map((starValue) => (
            <button
              key={starValue}
              onClick={() => handleStarClick(starValue)}
              onMouseEnter={() => handleStarHover(starValue)}
              className="transition-all duration-150 hover:scale-110 transform focus:outline-none focus:ring-2 focus:ring-blue-300 rounded"
              aria-label={`${starValue} stars: ${labels[starValue]}`}
            >
              <Star
                size={size}
                className={`${
                  starValue <= currentRating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300 dark:text-gray-600'
                } transition-colors duration-150`}
              />
            </button>
          ))}
        </div>
        
        <div className="flex space-x-1 text-xs text-gray-400 dark:text-gray-500">
          <span>1</span>
          <span>•</span>
          <span>2</span>
          <span>•</span>
          <span>3</span>
          <span>•</span>
          <span>4</span>
          <span>•</span>
          <span>5</span>
        </div>
      </div>
    </div>
  );
};

const DualStarRating: React.FC<DualStarRatingProps> = ({ 
  onClarityRating, 
  onHelpfulnessRating, 
  language,
  size = 20 
}) => {
  const t = texts[language];

  return (
    <div className="space-y-3">
      <StarRow
        title={t.clarityTitle}
        labels={t.clarityLabels}
        onRating={onClarityRating}
        size={size}
      />
      
      <StarRow
        title={t.helpfulnessTitle}
        labels={t.helpfulnessLabels}
        onRating={onHelpfulnessRating}
        size={size}
      />
    </div>
  );
};

export default DualStarRating;
