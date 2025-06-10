import React from 'react';
import { User, Bot, Gamepad2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Language } from '@/types/common';
import LanguageToggle from '@/components/ui/LanguageToggle';
import SettingsDropdown from './SettingsDropdown';
import TestingSortingComponent from '@/components/RealtimeSorting/TestingSortingComponent';

interface GameHomeProps {
  language: Language;
  user: any;
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
  onOpenProfile: () => void;
  onLanguageChange: (language: Language) => void;
  onStartEcoSort: () => void;
  onStartRealtimeSorting: () => void;
}

const texts = {
  EN: {
    title: 'Smart Trash AI',
    subtitle: 'AI-Powered Waste Sorting Assistant',
    welcomeMessage: 'Choose your sorting experience',
    ecosortGame: 'EcoSort Game',
    ecosortDescription: 'Learn waste sorting through interactive levels',
    realtimeSorting: 'Real-time Sorting',
    realtimeDescription: 'Get instant AI-powered sorting assistance',
    profile: 'View Profile',
    robotGreeting: 'Hello! I\'m your Smart Trash AI assistant!'
  },
  DE: {
    title: 'Smart Trash AI',
    subtitle: 'KI-gestützter Müllsortierassistent',
    welcomeMessage: 'Wählen Sie Ihr Sortiererlebnis',
    ecosortGame: 'EcoSort Spiel',
    ecosortDescription: 'Lernen Sie Mülltrennung durch interaktive Level',
    realtimeSorting: 'Echtzeit-Sortierung',
    realtimeDescription: 'Erhalten Sie sofortige KI-gestützte Sortierhilfe',
    profile: 'Profil Anzeigen',
    robotGreeting: 'Hallo! Ich bin Ihr Smart Trash AI Assistent!'
  }
};

const GameHome: React.FC<GameHomeProps> = ({ 
  language, 
  user, 
  gameProgress, 
  onStartLevel, 
  onOpenProfile, 
  onLanguageChange,
  onStartEcoSort,
  onStartRealtimeSorting 
}) => {
  const t = texts[language];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 text-white dark:bg-gradient-to-br dark:from-gray-900 dark:to-purple-900">
      {/* Header with controls */}
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        <LanguageToggle language={language} onLanguageChange={onLanguageChange} />
        <SettingsDropdown language={language} onOpenProfile={onOpenProfile} />
      </div>

      {/* Robot Mascot */}
      <div className="mb-8 animate-bounce">
        <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-4">
          <Bot className="w-full h-full text-cyan-400 dark:text-cyan-300 drop-shadow-lg" />
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full animate-pulse"></div>
        </div>
        <div className="bg-white/10 dark:bg-purple-900/30 rounded-2xl p-4 backdrop-blur-sm">
          <p className="text-sm sm:text-base text-cyan-200 dark:text-cyan-300 text-center font-medium">
            {t.robotGreeting}
          </p>
        </div>
      </div>

      {/* App title */}
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent dark:neon-text">
          {t.title}
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-blue-100 dark:text-cyan-200 mb-6">
          {t.subtitle}
        </p>
        <p className="text-base sm:text-lg text-blue-200 dark:text-cyan-300 font-medium">
          {t.welcomeMessage}
        </p>
      </div>

      {/* Feature Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 w-full max-w-4xl mb-8">
        {/* EcoSort Game */}
        <div className="bg-white/10 dark:bg-purple-900/20 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-white/20 dark:neon-border hover:bg-white/15 dark:hover:bg-purple-800/30 transition-all duration-300 hover:scale-105 dark:hover:neon-glow">
          <div className="text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <Gamepad2 className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold mb-3 text-white dark:text-cyan-300">
              {t.ecosortGame}
            </h3>
            <p className="text-sm sm:text-base text-blue-100 dark:text-cyan-200 mb-6 leading-relaxed">
              {t.ecosortDescription}
            </p>
            <Button
              onClick={onStartEcoSort}
              className="w-full py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 dark:from-green-600 dark:to-blue-700 dark:hover:from-green-700 dark:hover:to-blue-800"
            >
              Start Game
            </Button>
          </div>
        </div>

        {/* Real-time Sorting */}
        <div className="bg-white/10 dark:bg-purple-900/20 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-white/20 dark:neon-border hover:bg-white/15 dark:hover:bg-purple-800/30 transition-all duration-300 hover:scale-105 dark:hover:neon-glow">
          <div className="text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold mb-3 text-white dark:text-cyan-300">
              {t.realtimeSorting}
            </h3>
            <p className="text-sm sm:text-base text-blue-100 dark:text-cyan-200 mb-6 leading-relaxed">
              {t.realtimeDescription}
            </p>
            <Button
              onClick={onStartRealtimeSorting}
              className="w-full py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 dark:from-purple-600 dark:to-pink-700 dark:hover:from-purple-700 dark:hover:to-pink-800"
            >
              Start AI Assistant
            </Button>
          </div>
        </div>
      </div>

      {/* Testing Component - Only show in development */}
      {process.env.NODE_ENV === 'development' && (
        <TestingSortingComponent />
      )}
    </div>
  );
};

export default GameHome;
