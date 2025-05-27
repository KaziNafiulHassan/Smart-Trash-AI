
import React from 'react';
import { ArrowLeft, Trophy, Target, Calendar, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Language } from '@/pages/Index';

interface ProfileDashboardProps {
  language: Language;
  user: any;
  gameProgress: any;
  onBackToHome: () => void;
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
  onBackToHome
}) => {
  const t = texts[language];
  const accuracy = gameProgress.totalAttempts > 0 
    ? Math.round((gameProgress.totalCorrect / gameProgress.totalAttempts) * 100) 
    : 0;

  // Mock weekly data
  const weeklyData = [5, 8, 12, 6, 15, 10, 9];
  const maxValue = Math.max(...weeklyData);
  const weekDays = [t.monday, t.tuesday, t.wednesday, t.thursday, t.friday, t.saturday, t.sunday];

  const achievements = [
    { id: 1, name: 'First Steps', description: 'Complete your first sort', emoji: '👶', unlocked: true },
    { id: 2, name: 'Eco Warrior', description: 'Sort 25 items correctly', emoji: '🏆', unlocked: true },
    { id: 3, name: 'Bio Expert', description: 'Perfect bio waste sorting', emoji: '🌱', unlocked: true },
    { id: 4, name: 'Paper Master', description: 'Master paper sorting', emoji: '📄', unlocked: false },
    { id: 5, name: 'Plastic Pro', description: 'Excel at plastic sorting', emoji: '♻️', unlocked: false },
    { id: 6, name: 'Week Warrior', description: 'Complete 7 days in a row', emoji: '🔥', unlocked: true }
  ];

  return (
    <div className="min-h-screen flex flex-col p-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          onClick={onBackToHome}
          className="p-2 bg-white/20 hover:bg-white/30 rounded-full"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-2xl font-bold">{t.profile}</h1>
        <div></div>
      </div>

      {/* User Info */}
      <div className="bg-white/10 rounded-2xl p-6 mb-6 text-center">
        <div className="text-6xl mb-4">{user?.avatar?.emoji}</div>
        <h2 className="text-2xl font-bold mb-2">{user?.name}</h2>
        <div className="flex items-center justify-center space-x-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <span className="text-lg font-semibold">{t.level} {gameProgress.level}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-500/30 to-green-600/30 p-4 rounded-2xl border border-white/20">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-5 h-5 text-green-300" />
            <span className="text-sm font-medium text-green-200">{t.totalSorted}</span>
          </div>
          <p className="text-2xl font-bold">{gameProgress.totalCorrect}</p>
          <p className="text-xs text-green-200">{t.itemsSorted}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500/30 to-blue-600/30 p-4 rounded-2xl border border-white/20">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-300" />
            <span className="text-sm font-medium text-blue-200">{t.accuracy}</span>
          </div>
          <p className="text-2xl font-bold">{accuracy}%</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500/30 to-orange-600/30 p-4 rounded-2xl border border-white/20">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">🔥</span>
            <span className="text-sm font-medium text-orange-200">{t.currentStreak}</span>
          </div>
          <p className="text-2xl font-bold">7</p>
          <p className="text-xs text-orange-200">{t.days}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/30 to-purple-600/30 p-4 rounded-2xl border border-white/20">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">⭐</span>
            <span className="text-sm font-medium text-purple-200">{t.bestStreak}</span>
          </div>
          <p className="text-2xl font-bold">14</p>
          <p className="text-xs text-purple-200">{t.days}</p>
        </div>
      </div>

      {/* Weekly Progress Chart */}
      <div className="bg-white/10 rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          {t.weeklyProgress}
        </h3>
        <div className="flex items-end justify-between space-x-2 h-32">
          {weeklyData.map((value, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="w-full bg-white/20 rounded-t-lg flex items-end" style={{ height: '100px' }}>
                <div
                  className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-lg"
                  style={{ height: `${(value / maxValue) * 100}%`, minHeight: '4px' }}
                />
              </div>
              <span className="text-xs mt-2 text-blue-200">{weekDays[index]}</span>
              <span className="text-xs font-semibold">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Trophy className="w-5 h-5 mr-2" />
          {t.achievements}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-3 rounded-lg ${
                achievement.unlocked
                  ? 'bg-yellow-500/20 border border-yellow-400/30'
                  : 'bg-gray-500/20 border border-gray-400/30'
              }`}
            >
              <div className="text-2xl mb-1">{achievement.emoji}</div>
              <p className={`font-medium text-sm ${
                achievement.unlocked ? 'text-yellow-100' : 'text-gray-300'
              }`}>
                {achievement.name}
              </p>
              <p className={`text-xs ${
                achievement.unlocked ? 'text-yellow-200' : 'text-gray-400'
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
