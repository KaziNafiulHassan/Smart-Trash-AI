
import React from 'react';
import { ArrowLeft, Star, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Language } from '@/types/common';
import LogoutButton from './LogoutButton';
import { ThemeToggle } from '@/shared/components/ui';

interface GameHeaderProps {
  language: Language;
  level: number;
  score: number;
  onBackToHome: () => void;
  onResetLevel: () => void;
}

const texts = {
  EN: {
    level: 'Level'
  },
  DE: {
    level: 'Level'
  }
};

const GameHeader: React.FC<GameHeaderProps> = ({
  language,
  level,
  score,
  onBackToHome,
  onResetLevel
}) => {
  const t = texts[language];

  return (
    <div className="flex items-center justify-between mb-6">
      <Button
        onClick={onBackToHome}
        className="p-2 bg-white/20 hover:bg-white/30 rounded-full dark:bg-purple-900/50 dark:hover:bg-purple-800/50 dark:neon-border"
      >
        <ArrowLeft className="w-4 h-4 sm:w-6 sm:h-6" />
      </Button>
      
      <div className="text-center">
        <h1 className="text-xl sm:text-2xl font-bold dark:neon-text">{t.level} {level}</h1>
        <div className="flex items-center justify-center space-x-4 mt-1">
          <div className="flex items-center space-x-1">
            <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 dark:text-yellow-300" />
            <span className="text-sm sm:text-lg font-semibold dark:text-cyan-300">{score}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <ThemeToggle />
        <Button
          onClick={onResetLevel}
          className="p-2 bg-white/20 hover:bg-white/30 rounded-full dark:bg-purple-900/50 dark:hover:bg-purple-800/50 dark:neon-border"
        >
          <RotateCcw className="w-4 h-4 sm:w-6 sm:h-6" />
        </Button>
        <LogoutButton className="bg-white/20 hover:bg-white/30 text-white dark:bg-purple-900/50 dark:hover:bg-purple-800/50 dark:neon-border" />
      </div>
    </div>
  );
};

export default GameHeader;
