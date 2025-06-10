
import React from 'react';
import AuthScreen from '@/components/Auth/AuthScreen';
import { OnboardingScreen } from '@/features/auth';
import GameHome from '@/components/Game/GameHome';
import GameLevel from '@/components/Game/GameLevel';
import ProfileDashboard from '@/components/Profile/ProfileDashboard';
import RealtimeSortingScreen from '@/components/RealtimeSorting/RealtimeSortingScreen';
import BackendArchitecture from '@/pages/BackendArchitecture';
import { Language, Screen } from '@/types/common';

type ExtendedScreen = Screen | 'backendArchitecture';

interface ScreenManagerProps {
  currentScreen: ExtendedScreen;
  language: Language;
  user: any;
  gameProgress: any;
  onAuth: (user: any) => void;
  onLanguageChange: (language: Language) => void;
  onScreenChange: (screen: ExtendedScreen) => void;
  onLevelComplete: (correct: boolean) => void;
}

export const ScreenManager: React.FC<ScreenManagerProps> = ({
  currentScreen,
  language,
  user,
  gameProgress,
  onAuth,
  onLanguageChange,
  onScreenChange,
  onLevelComplete
}) => {
  const handleStartEcoSort = () => {
    onScreenChange('gameLevel');
  };

  const handleStartRealtimeSorting = () => {
    onScreenChange('realtimeSorting');
  };

  const handleStartLevel = (level: number) => {
    onScreenChange('gameLevel');
  };

  const handleViewProfile = () => {
    onScreenChange('profile');
  };

  const handleBackToHome = () => {
    onScreenChange('gameHome');
  };

  const handleOnboardingComplete = () => {
    onScreenChange('gameHome');
  };

  if (!user) {
    return <AuthScreen language={language} onAuth={onAuth} onLanguageChange={onLanguageChange} />;
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
          onStartLevel={handleStartLevel}
          onOpenProfile={handleViewProfile}
          onLanguageChange={onLanguageChange}
          onStartEcoSort={handleStartEcoSort}
          onStartRealtimeSorting={handleStartRealtimeSorting}
        />
      );
    case 'gameLevel':
      return (
        <GameLevel
          language={language}
          level={gameProgress.level}
          onLevelComplete={onLevelComplete}
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
          onLanguageChange={onLanguageChange}
        />
      );
    case 'realtimeSorting':
      return (
        <RealtimeSortingScreen
          language={language}
          user={user}
          onBackToHome={handleBackToHome}
        />
      );
    case 'backendArchitecture':
      return (
        <BackendArchitecture
          onBack={handleBackToHome}
        />
      );
    default:
      return <AuthScreen language={language} onAuth={onAuth} onLanguageChange={onLanguageChange} />;
  }
};
