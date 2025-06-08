import React from 'react';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Play, User as UserIcon, Globe, Camera, BarChart3 } from 'lucide-react';
import { Language } from '@/types/common';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import LogoutButton from './LogoutButton';

interface GameHomeProps {
  language: Language;
  user: User;
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
  onViewBackendArchitecture: () => void;
}

const GameHome: React.FC<GameHomeProps> = ({
  language,
  user,
  gameProgress,
  onStartLevel,
  onOpenProfile,
  onLanguageChange,
  onStartEcoSort,
  onStartRealtimeSorting,
  onViewBackendArchitecture
}) => {
  const texts = {
    EN: {
      welcome: 'Welcome back,',
      level: 'Level',
      totalCorrect: 'Total Correct',
      totalAttempts: 'Total Attempts',
      completedLevels: 'Completed Levels',
      bestScore: 'Best Score',
      currentStreak: 'Current Streak',
      bestStreak: 'Best Streak',
      startGame: 'Start Game',
      openProfile: 'Open Profile',
      ecoSort: 'Eco Sort Challenge',
      realtimeSorting: 'Real-time Sorting',
      backendArchitecture: 'Backend Architecture'
    },
    DE: {
      welcome: 'Willkommen zurück,',
      level: 'Level',
      totalCorrect: 'Insgesamt Richtig',
      totalAttempts: 'Gesamtversuche',
      completedLevels: 'Abgeschlossene Level',
      bestScore: 'Beste Punktzahl',
      currentStreak: 'Aktuelle Serie',
      bestStreak: 'Beste Serie',
      startGame: 'Spiel Starten',
      openProfile: 'Profil öffnen',
      ecoSort: 'Eco Sort Challenge',
      realtimeSorting: 'Echtzeit-Sortierung',
      backendArchitecture: 'Backend Architektur'
    },
  };

  const t = texts[language];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 text-white">
      <div className="container mx-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">{t.welcome} {user.user_metadata?.name || 'User'}!</h1>
            <p className="text-blue-100">Here's your progress:</p>
          </div>
          <div className="space-x-4 flex items-center">
            <LanguageToggle language={language} onLanguageChange={onLanguageChange} />
            <LogoutButton />
          </div>
        </div>

        {/* Progress Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 rounded-xl p-4">
            <h3 className="text-lg font-semibold">{t.level}</h3>
            <p className="text-2xl">{gameProgress.level}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <h3 className="text-lg font-semibold">{t.totalCorrect}</h3>
            <p className="text-2xl">{gameProgress.total_correct}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <h3 className="text-lg font-semibold">{t.totalAttempts}</h3>
            <p className="text-2xl">{gameProgress.total_attempts}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <h3 className="text-lg font-semibold">{t.completedLevels}</h3>
            <p className="text-2xl">{gameProgress.completed_levels}</p>
          </div>
           <div className="bg-white/10 rounded-xl p-4">
            <h3 className="text-lg font-semibold">{t.bestScore}</h3>
            <p className="text-2xl">{gameProgress.best_score}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <h3 className="text-lg font-semibold">{t.currentStreak}</h3>
            <p className="text-2xl">{gameProgress.current_streak}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <h3 className="text-lg font-semibold">{t.bestStreak}</h3>
            <p className="text-2xl">{gameProgress.best_streak}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Button onClick={() => onStartLevel(gameProgress.level)} className="bg-green-500 hover:bg-green-600">
            <Play className="w-5 h-5 mr-2" />
            {t.startGame}
          </Button>
          <Button onClick={onOpenProfile} className="bg-blue-500 hover:bg-blue-600">
            <UserIcon className="w-5 h-5 mr-2" />
            {t.openProfile}
          </Button>
          <Button onClick={onStartEcoSort} className="bg-orange-500 hover:bg-orange-600">
            <Globe className="w-5 h-5 mr-2" />
            {t.ecoSort}
          </Button>
          <Button onClick={onStartRealtimeSorting} className="bg-purple-500 hover:bg-purple-600">
            <Camera className="w-5 h-5 mr-2" />
            {t.realtimeSorting}
          </Button>
          <Button onClick={onViewBackendArchitecture} className="bg-gray-700 hover:bg-gray-800">
            <BarChart3 className="w-5 h-5 mr-2" />
            {t.backendArchitecture}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameHome;
