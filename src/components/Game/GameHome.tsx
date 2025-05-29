import React from 'react';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Language } from '@/pages/Index';
import LogoutButton from './LogoutButton';
import ThemeToggle from '@/components/ui/ThemeToggle';

interface GameHomeProps {
  language: Language;
  onStartLevel: (level: number) => void;
  onOpenProfile: () => void;
}

const texts = {
  EN: {
    title: 'EcoSort Game',
    subtitle: 'Learn to sort waste correctly!',
    selectLevel: 'Select a Level',
    profile: 'View Profile',
    instructions: 'Drag the waste item to the correct bin. Earn points for correct sorts. Improve your knowledge of waste sorting in Magdeburg!'
  },
  DE: {
    title: 'EcoSort Spiel',
    subtitle: 'Lerne, Müll richtig zu trennen!',
    selectLevel: 'Wähle ein Level',
    profile: 'Profil Anzeigen',
    instructions: 'Ziehe den Müllgegenstand in die richtige Tonne. Verdiene Punkte für korrekte Sortierungen. Verbessere dein Wissen über Mülltrennung in Magdeburg!'
  }
};

const GameHome: React.FC<GameHomeProps> = ({ language, onStartLevel, onOpenProfile }) => {
  const t = texts[language];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 text-white dark:bg-gradient-to-br dark:from-gray-900 dark:to-purple-900">
      {/* Header with theme toggle and logout */}
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        <ThemeToggle />
        <LogoutButton className="bg-white/20 hover:bg-white/30 text-white dark:bg-purple-900/50 dark:hover:bg-purple-800/50 dark:neon-border" />
      </div>

      {/* Game title */}
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 dark:neon-text">{t.title}</h1>
        <p className="text-lg sm:text-xl md:text-2xl text-blue-100 dark:text-cyan-200">{t.subtitle}</p>
      </div>

      {/* Level selection */}
      <div className="flex flex-col items-center space-y-6 sm:space-y-8">
        <h2 className="text-xl sm:text-2xl font-semibold text-center dark:text-cyan-300">{t.selectLevel}</h2>
        
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
        
        <Button
          onClick={onOpenProfile}
          className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 dark:from-purple-600 dark:to-pink-600 dark:hover:from-purple-700 dark:hover:to-pink-700 dark:neon-glow"
        >
          <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          {t.profile}
        </Button>
      </div>

      {/* Instructions */}
      <div className="mt-8 sm:mt-12 text-center max-w-md sm:max-w-2xl">
        <p className="text-sm sm:text-base text-blue-100 dark:text-cyan-200 leading-relaxed">
          {t.instructions}
        </p>
      </div>
    </div>
  );
};

export default GameHome;
