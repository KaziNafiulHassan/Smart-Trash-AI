import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AuthScreen from '@/components/Auth/AuthScreen';
import { OnboardingScreen } from '@/features/auth';
import RegistrationScreen from '@/features/auth/components/RegistrationScreen';
import GameHome from '@/components/Game/GameHome';
import GameLevel from '@/components/Game/GameLevel';
import ProfileDashboard from '@/components/Profile/ProfileDashboard';
import BackendArchitecture from '@/pages/BackendArchitecture';
import AIWasteSorter from '@/components/AIWasteSorter';
import { gameService } from '@/services/gameService';
import { profileService } from '@/services/profileService';
import { userStudyService } from '@/services/userStudyService';
import { Language, Screen } from '@/types/common';

type ExtendedScreen = Screen | 'backendArchitecture' | 'aiSorting' | 'registration';

const Index = () => {
  const { user, loading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<ExtendedScreen>('auth');
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
      console.log('User authenticated, checking registration status...', user.id);
      checkUserRegistrationStatus();
    } else if (!loading) {
      setCurrentScreen('auth');
    }
  }, [user, loading]);

  const checkUserRegistrationStatus = async () => {
    if (!user) return;

    try {
      // Check if user has completed registration
      const isRegistrationComplete = await userStudyService.checkRegistrationStatus(user.id);
      
      if (!isRegistrationComplete) {
        console.log('User registration not complete, showing registration form');
        setCurrentScreen('registration');
        return;
      }

      // Load user progress
      await loadUserProgress();
      
      // Check if user needs onboarding
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
    } catch (error) {
      console.error('Error checking user registration status:', error);
      setCurrentScreen('gameHome'); // Fallback to game home
    }
  };

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
    }
  };

  const handleAuth = (userData: any) => {
    console.log('Auth completed for user:', userData.id);
    // User is now authenticated, useAuth hook will handle the state
  };

  const handleRegistrationComplete = async (userData: any) => {
    if (!user) return;

    console.log('Registration data received:', userData);
    
    try {
      const success = await profileService.completeUserRegistration(user.id, userData.studyData || userData);
      
      if (success) {
        console.log('User registration completed successfully');
        // Reload user progress and proceed to game
        await loadUserProgress();
        setCurrentScreen('gameHome');
      } else {
        console.error('Failed to complete user registration');
      }
    } catch (error) {
      console.error('Error completing registration:', error);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setCurrentScreen('gameHome');
  };

  const handleStartEcoSort = () => {
    setCurrentScreen('gameLevel');
  };

  const handleStartAISorting = () => {
    setCurrentScreen('aiSorting');
  };

  const handleStartLevel = (level: number) => {
    setCurrentScreen('gameLevel');
  };

  const handleViewProfile = () => {
    setCurrentScreen('profile');
  };

  const handleBackToHome = () => {
    setCurrentScreen('gameHome');
  };

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
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

    try {
      await gameService.updateUserProgress(user.id, newProgress);
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleViewBackendArchitecture = () => {
    setCurrentScreen('backendArchitecture');
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
      return <AuthScreen language={language} onAuth={handleAuth} onLanguageChange={handleLanguageChange} />;
    }

    switch (currentScreen) {
      case 'registration':
        return <RegistrationScreen language={language} onRegistration={handleRegistrationComplete} />;
      case 'onboarding':
        return <OnboardingScreen language={language} onComplete={handleOnboardingComplete} />;
      case 'gameHome':
        return (
          <GameHome
            language={language}
            user={user}
            gameProgress={gameProgress}
            onStartLevel={handleStartLevel}
            onOpenProfile={handleViewProfile}
            onLanguageChange={handleLanguageChange}
            onStartEcoSort={handleStartEcoSort}
            onStartAISorting={handleStartAISorting}
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
            onLanguageChange={handleLanguageChange}
          />
        );
      case 'aiSorting':
        return (
          <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex flex-col">
            <div className="p-4">
              <button
                onClick={handleBackToHome}
                className="text-white hover:text-gray-200 transition-colors"
              >
                ← Back to Home
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <AIWasteSorter />
            </div>
          </div>
        );
      case 'backendArchitecture':
        return (
          <BackendArchitecture
            onBack={handleBackToHome}
          />
        );
      default:
        return <AuthScreen language={language} onAuth={handleAuth} onLanguageChange={handleLanguageChange} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600">
      {renderScreen()}
    </div>
  );
};

export default Index;
