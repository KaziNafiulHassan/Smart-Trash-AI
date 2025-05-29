
import React from 'react';
import { ArrowLeft, Trophy, Target, Calendar, TrendingUp, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Language } from '@/pages/Index';
import LogoutButton from '../Game/LogoutButton';
import ThemeToggle from '@/components/ui/ThemeToggle';
import LanguageToggle from '@/components/ui/LanguageToggle';

interface ProfileDashboardProps {
  language: Language;
  user: any;
  gameProgress: any;
  onBackToHome: () => void;
  onLanguageChange: (language: Language) => void;
}

const texts = {
  EN: {
    profile: 'Profile',
    weeklyProgress: 'Weekly Progress',
    stats: 'Statistics',
    achievements: 'Achievements',
    totalSorted: 'Total Sorted',
    accuracy: 'Accuracy',
    currentStreak: 'Current Streak',
    bestStreak: 'Best Streak',
    level: 'Level',
    itemsSorted: 'items sorted',
    days: 'days',
    avgSortTime: 'Avg Sort Time',
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
    sunday: 'Sun'
  },
  DE: {
    profile: 'Profil',
    weeklyProgress: 'Wöchentlicher Fortschritt',
    stats: 'Statistiken',
    achievements: 'Erfolge',
    totalSorted: 'Gesamt Sortiert',
    accuracy: 'Genauigkeit',
    currentStreak: 'Aktuelle Serie',
    bestStreak: 'Beste Serie',
    level: 'Level',
    itemsSorted: 'Gegenstände sortiert',
    days: 'Tage',
    avgSortTime: 'Durchschn. Sortierzeit',
    monday: 'Mo',
    tuesday: 'Di',
    wednesday: 'Mi',
    thursday: 'Do',
    friday: 'Fr',
    saturday: 'Sa',
    sunday: 'So'
  }
};

const ProfileDashboard: React.FC<ProfileDashboardProps> = ({
  language,
  user,
  gameProgress,
  onBackToHome,
  onLanguageChange
}) => {
  const t = texts[language];
  const accuracy = gameProgress.total_attempts > 0 
    ? Math.round((gameProgress.total_correct / gameProgress.total_attempts) * 100) 
    : 0;

  // Mock weekly data - could be replaced with real data
  const weeklyData = [5, 8, 12, 6, 15, 10, 9];
  const maxValue = Math.max(...weeklyData);
  const weekDays = [t.monday, t.tuesday, t.wednesday, t.thursday, t.friday, t.saturday, t.sunday];

  const achievements = [
    { id: 1, name: 'First Steps', description: 'Complete your first sort', emoji: '👶', unlocked: gameProgress.total_attempts > 0 },
    { id: 2, name: 'Eco Warrior', description: 'Sort 25 items correctly', emoji: '🏆', unlocked: gameProgress.total_correct >= 25 },
    { id: 3, name: 'Bio Expert', description: 'Perfect bio waste sorting', emoji: '🌱', unlocked: accuracy >= 80 },
    { id: 4, name: 'Speed Demon', description: 'Sort items quickly', emoji: '⚡', unlocked: gameProgress.completed_levels >= 5 },
    { id: 5, name: 'Streak Master', description: 'Maintain a 7-day streak', emoji: '🔥', unlocked: gameProgress.current_streak >= 7 },
    { id: 6, name: 'Level Master', description: 'Reach level 10', emoji: '🎯', unlocked: gameProgress.level >= 10 }
  ];

  return (
    <div className="min-h-screen flex flex-col p-4 sm:p-6 text-white dark:text-white bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
      {/* Header with controls moved to left corner */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <LanguageToggle language={language} onLanguageChange={onLanguageChange} />
          <ThemeToggle />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold dark:text-cyan-300">{t.profile}</h1>
        <div className="flex items-center space-x-2">
          <Button
            onClick={onBackToHome}
            className="p-2 bg-white/20 hover:bg-white/30 dark:bg-purple-900/50 dark:hover:bg-purple-800/50 rounded-full dark:neon-border"
          >
            <ArrowLeft className="w-4 h-4 sm:w-6 sm:h-6" />
          </Button>
          <LogoutButton className="bg-white/20 hover:bg-white/30 dark:bg-purple-900/50 dark:hover:bg-purple-800/50 text-white dark:neon-border" />
        </div>
      </div>

      {/* User Info */}
      <div className="bg-white/10 dark:bg-gray-800/80 rounded-2xl p-4 sm:p-6 mb-6 text-center border border-white/20 dark:border-gray-700">
        <div className="text-4xl sm:text-6xl mb-4">{user?.avatar?.emoji || '👤'}</div>
        <h2 className="text-xl sm:text-2xl font-bold mb-2 dark:text-cyan-300">{user?.name || 'Player'}</h2>
        <div className="flex items-center justify-center space-x-2">
          <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 dark:text-yellow-300" />
          <span className="text-base sm:text-lg font-semibold dark:text-cyan-300">{t.level} {gameProgress.level}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-500/30 to-green-600/30 dark:from-green-800/50 dark:to-green-900/50 p-3 sm:p-4 rounded-2xl border border-white/20 dark:border-green-700/50">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-green-300 dark:text-green-200" />
            <span className="text-xs sm:text-sm font-medium text-green-200 dark:text-green-100">{t.totalSorted}</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold dark:text-green-200">{gameProgress.total_correct}</p>
          <p className="text-xs text-green-200 dark:text-green-300">{t.itemsSorted}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500/30 to-blue-600/30 dark:from-blue-800/50 dark:to-blue-900/50 p-3 sm:p-4 rounded-2xl border border-white/20 dark:border-blue-700/50">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-300 dark:text-blue-200" />
            <span className="text-xs sm:text-sm font-medium text-blue-200 dark:text-blue-100">{t.accuracy}</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold dark:text-blue-200">{accuracy}%</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500/30 to-orange-600/30 dark:from-orange-800/50 dark:to-orange-900/50 p-3 sm:p-4 rounded-2xl border border-white/20 dark:border-orange-700/50">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-base sm:text-lg">🔥</span>
            <span className="text-xs sm:text-sm font-medium text-orange-200 dark:text-orange-100">{t.currentStreak}</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold dark:text-orange-200">{gameProgress.current_streak}</p>
          <p className="text-xs text-orange-200 dark:text-orange-300">{t.days}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/30 to-purple-600/30 dark:from-purple-800/50 dark:to-purple-900/50 p-3 sm:p-4 rounded-2xl border border-white/20 dark:border-purple-700/50">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-base sm:text-lg">⭐</span>
            <span className="text-xs sm:text-sm font-medium text-purple-200 dark:text-purple-100">{t.bestStreak}</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold dark:text-purple-200">{gameProgress.best_streak}</p>
          <p className="text-xs text-purple-200 dark:text-purple-300">{t.days}</p>
        </div>
      </div>

      {/* Weekly Progress Chart */}
      <div className="bg-white/10 dark:bg-gray-800/80 rounded-2xl p-4 sm:p-6 mb-6 border border-white/20 dark:border-gray-700">
        <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center dark:text-cyan-300">
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          {t.weeklyProgress}
        </h3>
        <div className="flex items-end justify-between space-x-1 sm:space-x-2 h-24 sm:h-32">
          {weeklyData.map((value, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="w-full bg-white/20 dark:bg-gray-700/50 rounded-t-lg flex items-end" style={{ height: '80px' }}>
                <div
                  className="w-full bg-gradient-to-t from-blue-500 to-blue-300 dark:from-cyan-600 dark:to-cyan-400 rounded-t-lg"
                  style={{ height: `${(value / maxValue) * 100}%`, minHeight: '4px' }}
                />
              </div>
              <span className="text-xs mt-2 text-blue-200 dark:text-cyan-300">{weekDays[index]}</span>
              <span className="text-xs font-semibold dark:text-cyan-200">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white/10 dark:bg-gray-800/80 rounded-2xl p-4 sm:p-6 border border-white/20 dark:border-gray-700">
        <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center dark:text-cyan-300">
          <Trophy className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          {t.achievements}
        </h3>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-2 sm:p-3 rounded-lg ${
                achievement.unlocked
                  ? 'bg-yellow-500/20 dark:bg-yellow-800/30 border border-yellow-400/30 dark:border-yellow-600/50'
                  : 'bg-gray-500/20 dark:bg-gray-800/30 border border-gray-400/30 dark:border-gray-600/50'
              }`}
            >
              <div className="text-xl sm:text-2xl mb-1">{achievement.emoji}</div>
              <p className={`font-medium text-xs sm:text-sm ${
                achievement.unlocked 
                  ? 'text-yellow-100 dark:text-yellow-200' 
                  : 'text-gray-300 dark:text-gray-400'
              }`}>
                {achievement.name}
              </p>
              <p className={`text-xs ${
                achievement.unlocked 
                  ? 'text-yellow-200 dark:text-yellow-300' 
                  : 'text-gray-400 dark:text-gray-500'
              }`}>
                {achievement.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileDashboard;
