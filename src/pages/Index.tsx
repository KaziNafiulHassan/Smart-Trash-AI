import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AuthScreen from '@/components/Auth/AuthScreen';
import OnboardingScreen from '@/components/Auth/OnboardingScreen';
import GameHome from '@/components/Game/GameHome';
import GameLevel from '@/components/Game/GameLevel';
import ProfileDashboard from '@/components/Profile/ProfileDashboard';
import { gameService } from '@/services/gameService';
import { profileService } from '@/services/profileService';

export type Language = 'EN' | 'DE';
export type Screen = 'auth' | 'onboarding' | 'gameHome' | 'gameLevel' | 'profile';

const Index = () => {
  const { user, loading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>('auth');
  const [language, setLanguage] = useState<Language>('EN');
  const [gameProgress, setGameProgress] = useState({
    level: 1,
    total_correct: 0,
    total_attempts: 0,
    completed_levels: 0,
    best_score: 0,
    current_streak: 0,
    best_streak: 0
  });
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (user) {
      console.log('User authenticated, loading progress...', user.id);
      // Load user progress when user is authenticated
      loadUserProgress();
      
      // Check if user needs onboarding (new user)
      const userCreatedAt = new Date(user.created_at);
      const now = new Date();
      const timeDiff = now.getTime() - userCreatedAt.getTime();
      const isNewUser = timeDiff < 60000; // Less than 1 minute old
      
      if (isNewUser) {
        setShowOnboarding(true);
        setCurrentScreen('onboarding');
      } else {
        setCurrentScreen('gameHome');
      }
    } else if (!loading) {
      setCurrentScreen('auth');
    }
  }, [user, loading]);

  const loadUserProgress = async () => {
    if (!user) return;
    
    console.log('Loading user progress for:', user.id);
    
    // Ensure user setup first
    await profileService.ensureUserSetup(user.id, user.user_metadata?.name, language);
    
    const progress = await gameService.getUserProgress(user.id);
    if (progress) {
      console.log('Progress loaded:', progress);
      setGameProgress(progress);
    } else {
      console.log('No progress found, using defaults');
      // Keep default progress if none found
    }
  };

  const handleAuth = (userData: any) => {
    console.log('Auth completed for user:', userData.id);
    // User is now authenticated, useAuth hook will handle the state
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setCurrentScreen('gameHome');
  };

  const handlePlayGame = () => {
    setCurrentScreen('gameLevel');
  };

  const handleViewProfile = () => {
    setCurrentScreen('profile');
  };

  const handleBackToHome = () => {
    setCurrentScreen('gameHome');
  };

  const handleLevelComplete = async (correct: boolean) => {
    if (!user) return;

    const newProgress = {
      ...gameProgress,
      total_correct: gameProgress.total_correct + (correct ? 1 : 0),
      total_attempts: gameProgress.total_attempts + 1,
      level: correct ? gameProgress.level + 1 : gameProgress.level,
      completed_levels: correct ? gameProgress.completed_levels + 1 : gameProgress.completed_levels
    };

    setGameProgress(newProgress);

    // Save to database
    try {
      await gameService.updateUserProgress(user.id, newProgress);
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const renderScreen = () => {
    if (!user) {
      return <AuthScreen language={language} onAuth={handleAuth} />;
    }

    switch (currentScreen) {
      case 'onboarding':
        return <OnboardingScreen language={language} onComplete={handleOnboardingComplete} />;
      case 'gameHome':
        return (
          <GameHome
            language={language}
            user={user}
            gameProgress={gameProgress}
            onPlayGame={handlePlayGame}
            onViewProfile={handleViewProfile}
          />
        );
      case 'gameLevel':
        return (
          <GameLevel
            language={language}
            level={gameProgress.level}
            onLevelComplete={handleLevelComplete}
            onBackToHome={handleBackToHome}
          />
        );
      case 'profile':
        return (
          <ProfileDashboard
            language={language}
            user={user}
            gameProgress={gameProgress}
            onBackToHome={handleBackToHome}
          />
        );
      default:
        return <AuthScreen language={language} onAuth={handleAuth} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600">
      {renderScreen()}
    </div>
  );
};

export default Index;
