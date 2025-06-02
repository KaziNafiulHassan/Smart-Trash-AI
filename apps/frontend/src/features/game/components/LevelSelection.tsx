
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Language } from '@/types/common';
import { ThemeToggle, LanguageToggle } from '@/shared/components/ui';

interface LevelSelectionProps {
  language: Language;
  gameProgress: {
    level: number;
    total_correct: number;
    total_attempts: number;
    completed_levels: number;
    best_score: number;
    current_streak: number;
    best_streak: number;
  };
  onStartLevel: (level: number) => void;
  onBackToHome: () => void;
  onLanguageChange: (language: Language) => void;
}

const texts = {
  EN: {
    title: 'EcoSort Game',
    subtitle: 'Select a Level',
    backToHome: 'Back to Home'
  },
  DE: {
    title: 'EcoSort Spiel',
    subtitle: 'Wähle ein Level',
    backToHome: 'Zurück zur Startseite'
  }
};

const LevelSelection: React.FC<LevelSelectionProps> = ({ 
  language, 
  gameProgress, 
  onStartLevel, 
  onBackToHome,
  onLanguageChange 
}) => {
  const t = texts[language];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 text-white dark:bg-gradient-to-br dark:from-gray-900 dark:to-purple-900">
      {/* Header with controls */}
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        <LanguageToggle language={language} onLanguageChange={onLanguageChange} />
        <ThemeToggle />
      </div>

      {/* Back button */}
      <div className="absolute top-4 left-4">
        <Button
          onClick={onBackToHome}
          variant="ghost"
          className="text-white hover:bg-white/20 dark:hover:bg-purple-800/50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t.backToHome}
        </Button>
      </div>

      {/* Game title */}
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 dark:neon-text">{t.title}</h1>
        <h2 className="text-xl sm:text-2xl font-semibold text-center dark:text-cyan-300 mb-8">{t.subtitle}</h2>
      </div>

      {/* Level selection */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
        {[1, 2, 3, 4, 5].map((level) => (
          <Button
            key={level}
            onClick={() => onStartLevel(level)}
            className="w-16 h-16 sm:w-20 sm:h-20 text-lg sm:text-xl font-bold rounded-2xl bg-white/20 hover:bg-white/30 text-white border-2 border-white/30 hover:border-white/50 transition-all duration-200 hover:scale-110 dark:bg-purple-900/50 dark:hover:bg-purple-800/50 dark:neon-border dark:hover:neon-glow"
          >
            {level}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default LevelSelection;
