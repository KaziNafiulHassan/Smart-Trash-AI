
import React, { useState, useEffect } from 'react';
import WelcomeScreen from '@/components/Auth/WelcomeScreen';
import RegistrationScreen from '@/components/Auth/RegistrationScreen';
import OnboardingScreen from '@/components/Auth/OnboardingScreen';
import GameHome from '@/components/Game/GameHome';
import GameLevel from '@/components/Game/GameLevel';
import ProfileDashboard from '@/components/Profile/ProfileDashboard';

export type Language = 'EN' | 'DE';
export type Screen = 'welcome' | 'registration' | 'onboarding' | 'gameHome' | 'gameLevel' | 'profile';

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [language, setLanguage] = useState<Language>('EN');
  const [user, setUser] = useState<any>(null);
  const [gameProgress, setGameProgress] = useState({
    level: 1,
    totalCorrect: 0,
    totalAttempts: 0,
    completedLevels: 0
  });

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    setCurrentScreen('registration');
  };

  const handleRegistration = (userData: any) => {
    setUser(userData);
    setCurrentScreen('onboarding');
  };

  const handleOnboardingComplete = () => {
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

  const handleLevelComplete = (correct: boolean) => {
    setGameProgress(prev => ({
      ...prev,
      totalCorrect: prev.totalCorrect + (correct ? 1 : 0),
      totalAttempts: prev.totalAttempts + 1,
      level: correct ? prev.level + 1 : prev.level,
      completedLevels: correct ? prev.completedLevels + 1 : prev.completedLevels
    }));
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return <WelcomeScreen onLanguageSelect={handleLanguageSelect} />;
      case 'registration':
        return <RegistrationScreen language={language} onRegistration={handleRegistration} />;
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
        return <WelcomeScreen onLanguageSelect={handleLanguageSelect} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600">
      {renderScreen()}
    </div>
  );
};

export default Index;
