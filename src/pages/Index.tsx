
import React, { useState } from 'react';
import { AuthManager } from '@/components/App/AuthManager';
import { ScreenManager } from '@/components/App/ScreenManager';
import { useProgressManager } from '@/components/App/ProgressManager';
import { Language, Screen } from '@/types/common';

type ExtendedScreen = Screen | 'backendArchitecture';

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<ExtendedScreen>('auth');
  const [language, setLanguage] = useState<Language>('EN');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [gameProgress, setGameProgress] = useState({
    level: 1,
    total_correct: 0,
    total_attempts: 0,
    completed_levels: 0,
    best_score: 0,
    current_streak: 0,
    best_streak: 0
  });

  const { handleLevelComplete } = useProgressManager(user, gameProgress, setGameProgress);

  const handleAuthStateChange = (authenticatedUser: any, showOnboarding: boolean) => {
    setUser(authenticatedUser);
    setLoading(false);
    
    if (authenticatedUser) {
      if (showOnboarding) {
        setCurrentScreen('onboarding');
      } else {
        setCurrentScreen('gameHome');
      }
    } else {
      setCurrentScreen('auth');
    }
  };

  const handleAuth = (userData: any) => {
    console.log('Auth completed for user:', userData.id);
    // AuthManager will handle the state changes
  };

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600">
      <AuthManager
        language={language}
        onAuthStateChange={handleAuthStateChange}
        onProgressUpdate={setGameProgress}
      />
      <ScreenManager
        currentScreen={currentScreen}
        language={language}
        user={user}
        gameProgress={gameProgress}
        onAuth={handleAuth}
        onLanguageChange={handleLanguageChange}
        onScreenChange={setCurrentScreen}
        onLevelComplete={handleLevelComplete}
      />
    </div>
  );
};

export default Index;
