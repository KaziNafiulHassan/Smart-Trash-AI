
import React from 'react';
import { Play, User, Trophy, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Language } from '@/pages/Index';

interface GameHomeProps {
  language: Language;
  user: any;
  gameProgress: any;
  onPlayGame: () => void;
  onViewProfile: () => void;
}

const texts = {
  EN: {
    welcome: 'Welcome back',
    level: 'Level',
    accuracy: 'Accuracy',
    playGame: 'Play Game',
    viewProfile: 'View Profile',
    weeklyGoal: 'Weekly Goal',
    itemsSorted: 'items sorted',
    dailyStreak: 'Day Streak'
  },
  DE: {
    welcome: 'Willkommen zurück',
    level: 'Level',
    accuracy: 'Genauigkeit',
    playGame: 'Spiel Spielen',
    viewProfile: 'Profil Anzeigen',
    weeklyGoal: 'Wochenziel',
    itemsSorted: 'Gegenstände sortiert',
    dailyStreak: 'Tage in Folge'
  }
};

const GameHome: React.FC<GameHomeProps> = ({
  language,
  user,
  gameProgress,
  onPlayGame,
  onViewProfile
}) => {
  const t = texts[language];
  const accuracy = gameProgress.totalAttempts > 0 
    ? Math.round((gameProgress.totalCorrect / gameProgress.totalAttempts) * 100) 
    : 0;

  return (
    <div className="min-h-screen flex flex-col p-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="text-4xl">{user?.avatar?.emoji}</div>
          <div>
            <h1 className="text-2xl font-bold">{t.welcome}</h1>
            <p className="text-blue-200">{user?.name}</p>
          </div>
        </div>
        <Button
          onClick={onViewProfile}
          className="p-3 bg-white/20 hover:bg-white/30 rounded-full"
        >
          <User className="w-6 h-6" />
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-500/30 to-blue-600/30 p-4 rounded-2xl border border-white/20">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-5 h-5 text-blue-300" />
            <span className="text-sm font-medium text-blue-200">{t.level}</span>
          </div>
          <p className="text-2xl font-bold">{gameProgress.level}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500/30 to-green-600/30 p-4 rounded-2xl border border-white/20">
          <div className="flex items-center space-x-2 mb-2">
            <Trophy className="w-5 h-5 text-green-300" />
            <span className="text-sm font-medium text-green-200">{t.accuracy}</span>
          </div>
          <p className="text-2xl font-bold">{accuracy}%</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/30 to-purple-600/30 p-4 rounded-2xl border border-white/20">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">🎯</span>
            <span className="text-sm font-medium text-purple-200">{t.weeklyGoal}</span>
          </div>
          <p className="text-lg font-bold">{gameProgress.totalCorrect}/50</p>
          <p className="text-xs text-purple-200">{t.itemsSorted}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500/30 to-orange-600/30 p-4 rounded-2xl border border-white/20">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">🔥</span>
            <span className="text-sm font-medium text-orange-200">{t.dailyStreak}</span>
          </div>
          <p className="text-2xl font-bold">7</p>
        </div>
      </div>

      {/* Recent Achievements */}
      <div className="bg-white/10 rounded-2xl p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Recent Achievements</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 bg-yellow-500/20 p-3 rounded-lg">
            <span className="text-2xl">🏆</span>
            <div>
              <p className="font-medium">Eco Warrior</p>
              <p className="text-sm text-yellow-200">Sorted 25 items correctly</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 bg-green-500/20 p-3 rounded-lg">
            <span className="text-2xl">🌱</span>
            <div>
              <p className="font-medium">Bio Expert</p>
              <p className="text-sm text-green-200">Perfect bio waste sorting</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4 mt-auto">
        <Button
          onClick={onPlayGame}
          className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl shadow-lg transition-all duration-200 hover:scale-105"
        >
          <Play className="w-6 h-6 mr-2" />
          {t.playGame}
        </Button>

        <Button
          onClick={onViewProfile}
          className="w-full py-4 text-lg font-semibold bg-white/20 hover:bg-white/30 text-white rounded-xl border border-white/30 transition-all duration-200 hover:scale-105"
        >
          <User className="w-6 h-6 mr-2" />
          {t.viewProfile}
        </Button>
      </div>
    </div>
  );
};

export default GameHome;
