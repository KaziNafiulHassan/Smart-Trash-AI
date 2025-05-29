
import React from 'react';
import { Clock } from 'lucide-react';

interface AnimatedTimerBarProps {
  timeLeft: number;
  maxTime: number;
  language: 'EN' | 'DE';
}

const AnimatedTimerBar: React.FC<AnimatedTimerBarProps> = ({ timeLeft, maxTime, language }) => {
  const percentage = (timeLeft / maxTime) * 100;
  
  const getBarColor = () => {
    if (percentage > 60) return 'bg-green-500 dark:bg-green-400';
    if (percentage > 30) return 'bg-yellow-500 dark:bg-yellow-400';
    return 'bg-red-500 dark:bg-red-400';
  };

  const getGlowColor = () => {
    if (percentage > 60) return 'shadow-green-400/50';
    if (percentage > 30) return 'shadow-yellow-400/50';
    return 'shadow-red-400/50';
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-1">
          <Clock className="w-4 h-4 text-white dark:text-cyan-300" />
          <span className="text-sm font-medium text-white dark:text-cyan-300">
            {language === 'EN' ? 'Time' : 'Zeit'}
          </span>
        </div>
        <span className={`text-lg font-bold ${
          timeLeft <= 10 ? 'text-red-400 dark:text-red-300 animate-pulse' : 
          timeLeft <= 20 ? 'text-yellow-400 dark:text-yellow-300' : 
          'text-green-400 dark:text-green-300'
        }`}>
          {timeLeft}s
        </span>
      </div>
      
      <div className="w-full h-3 bg-gray-600/50 dark:bg-gray-800/50 rounded-full overflow-hidden border border-white/20 dark:border-gray-600">
        <div
          className={`h-full transition-all duration-1000 ease-linear rounded-full ${getBarColor()} shadow-lg ${getGlowColor()}`}
          style={{ 
            width: `${percentage}%`,
            boxShadow: percentage <= 30 ? '0 0 10px currentColor' : undefined
          }}
        />
      </div>
      
      {timeLeft <= 10 && (
        <div className="text-center mt-1">
          <span className="text-xs text-red-300 dark:text-red-200 animate-pulse font-medium">
            {language === 'EN' ? 'Hurry up!' : 'Beeil dich!'}
          </span>
        </div>
      )}
    </div>
  );
};

export default AnimatedTimerBar;
