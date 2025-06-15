
import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  onRating: (rating: number) => void;
  initialRating?: number;
  size?: number;
}

const StarRating: React.FC<StarRatingProps> = ({ 
  onRating, 
  initialRating = 0,
  size = 20 
}) => {
  const [rating, setRating] = useState(initialRating);
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

  return (
    <div className="flex items-center space-x-1" onMouseLeave={handleMouseLeave}>
      {[1, 2, 3, 4, 5].map((starValue) => (
        <button
          key={starValue}
          onClick={() => handleStarClick(starValue)}
          onMouseEnter={() => handleStarHover(starValue)}
          className="transition-colors duration-150 hover:scale-110 transform"
        >
          <Star
            size={size}
            className={`${
              starValue <= (hoverRating || rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300 dark:text-gray-600'
            } transition-colors duration-150`}
          />
        </button>
      ))}
    </div>
  );
};

export default StarRating;
