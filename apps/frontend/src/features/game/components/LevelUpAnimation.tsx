
import React, { useEffect, useState } from 'react';
import { Star, Trophy, Award, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Language } from '@/types/common';

interface LevelUpAnimationProps {
  language: Language;
  level: number;
  score: number;
  achievements: any[];
  onComplete: () => void;
}

const texts = {
  EN: {
    levelUp: 'Level Up!',
    congratulations: 'Congratulations!',
    youCompleted: 'You completed Level',
    yourScore: 'Your Score',
    achievements: 'Achievements',
    continue: 'Continue',
    noAchievements: 'No achievements unlocked yet'
  },
  DE: {
    levelUp: 'Level Up!',
    congratulations: 'Glückwunsch!',
    youCompleted: 'Du hast Level',
    yourScore: 'Deine Punkte',
    achievements: 'Erfolge',
    continue: 'Weiter',
    noAchievements: 'Noch keine Erfolge freigeschaltet'
  }
};

const LevelUpAnimation: React.FC<LevelUpAnimationProps> = ({
  language,
  level,
  score,
  achievements,
  onComplete
}) => {
  const [showContent, setShowContent] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  
  const t = texts[language];

  useEffect(() => {
    // Stagger the animations
    const timer1 = setTimeout(() => setShowContent(true), 500);
    const timer2 = setTimeout(() => setShowAchievements(true), 1500);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative max-w-md mx-4 p-8 bg-gradient-to-br from-purple-600 via-blue-600 to-green-500 rounded-3xl shadow-2xl">
        {/* Animated background sparkles */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl">
          {[...Array(20)].map((_, i) => (
            <Sparkles
              key={i}
              className={`absolute w-4 h-4 text-yellow-300 animate-pulse`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`
              }}
            />
          ))}
        </div>

        {/* Main content */}
        <div className="relative z-10 text-center text-white">
          {/* Level Up Title */}
          <div className={`transform transition-all duration-1000 ${showContent ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
            <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-300 animate-bounce" />
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
              {t.levelUp}
            </h1>
            <h2 className="text-2xl font-semibold mb-6">{t.congratulations}</h2>
          </div>

          {/* Level and Score Info */}
          <div className={`transform transition-all duration-1000 delay-500 ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="bg-white/20 rounded-2xl p-6 mb-6 backdrop-blur-sm">
              <p className="text-lg mb-2">
                {t.youCompleted} <span className="font-bold text-yellow-300">{level}</span>
              </p>
              <div className="flex items-center justify-center space-x-2">
                <Star className="w-5 h-5 text-yellow-300" />
                <span className="text-xl font-bold">{t.yourScore}: {score}</span>
              </div>
            </div>
          </div>

          {/* Achievements Section */}
          <div className={`transform transition-all duration-1000 delay-1000 ${showAchievements ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="bg-white/20 rounded-2xl p-4 mb-6 backdrop-blur-sm">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <Award className="w-5 h-5 text-purple-300" />
                <h3 className="text-lg font-semibold">{t.achievements}</h3>
              </div>
              
              {achievements.length > 0 ? (
                <div className="space-y-2 max-h-24 overflow-y-auto">
                  {achievements.slice(0, 3).map((achievement, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm bg-white/10 rounded-lg p-2">
                      <Trophy className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                      <span className="truncate">
                        {language === 'EN' ? achievement.achievements?.name_en : achievement.achievements?.name_de}
                      </span>
                    </div>
                  ))}
                  {achievements.length > 3 && (
                    <p className="text-xs text-gray-300">+{achievements.length - 3} more...</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-300">{t.noAchievements}</p>
              )}
            </div>
          </div>

          {/* Continue Button */}
          <div className={`transform transition-all duration-1000 delay-1500 ${showAchievements ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <Button
              onClick={onComplete}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              {t.continue}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelUpAnimation;
