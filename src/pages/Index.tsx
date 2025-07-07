import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AuthScreen from '@/components/Auth/AuthScreen';
import { OnboardingScreen } from '@/features/auth';
import RegistrationScreen from '@/features/auth/components/RegistrationScreen';
import GameHome from '@/components/Game/GameHome';
import GameLevel from '@/components/Game/GameLevel';
import ProfileDashboard from '@/components/Profile/ProfileDashboard';
import BackendArchitecture from '@/pages/BackendArchitecture';
import StructuredFeedbackTest from '@/pages/StructuredFeedbackTest';
import StreamingTest from '@/pages/StreamingTest';
import ComprehensiveTest from '@/pages/ComprehensiveTest';
import FeedbackTypeTest from '@/pages/FeedbackTypeTest';
import AIWasteSorter from '@/components/AIWasteSorter';
import { gameService } from '@/services/gameService';
import { profileService } from '@/services/profileService';
import { userStudyService } from '@/services/userStudyService';
import { supabase } from '@/integrations/supabase/client';
import { Language, Screen } from '@/types/common';

type ExtendedScreen = Screen | 'backendArchitecture' | 'aiSorting' | 'registration' | 'structuredFeedbackTest' | 'streamingTest' | 'comprehensiveTest' | 'feedbackTypeTest';

const Index = () => {
  const { user, loading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<ExtendedScreen>(() => {
    // Restore screen state from localStorage, but only for authenticated users
    if (typeof window !== 'undefined') {
      const savedScreen = localStorage.getItem('ecoSort_currentScreen');
      return (savedScreen as ExtendedScreen) || 'auth';
    }
    return 'auth';
  });
  const [language, setLanguage] = useState<Language>(() => {
    // Restore language from localStorage
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('ecoSort_language');
      return (savedLanguage as Language) || 'EN';
    }
    return 'EN';
  });
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

  // Save current screen to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && user) {
      localStorage.setItem('ecoSort_currentScreen', currentScreen);
    }
  }, [currentScreen, user]);

  // Save language to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ecoSort_language', language);
    }
  }, [language]);

  useEffect(() => {
    if (user) {
      console.log('User authenticated, checking registration status...', user.id);

      // Check if we have cached the user's registration status
      const cachedStatus = localStorage.getItem(`ecoSort_userRegistered_${user.id}`);

      if (cachedStatus === 'true') {
        console.log('User registration status cached as complete, proceeding to game');
        loadUserProgress();
        setCurrentScreen('gameHome');
      } else {
        console.log('No cached status found, checking registration...');
        checkUserRegistrationStatus();
      }
    } else if (!loading) {
      // User signed out, clear any cached registration status
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('ecoSort_userRegistered_')) {
          localStorage.removeItem(key);
        }
      });
      setCurrentScreen('auth');
    }
  }, [user, loading]);

  const checkUserRegistrationStatus = async () => {
    if (!user) return;

    try {
      console.log('Checking registration status for user:', user.id);

      // First, ensure user setup exists
      await profileService.ensureUserSetup(user.id, user.user_metadata?.name, language);

      // Check if user has completed registration
      const isRegistrationComplete = await userStudyService.checkRegistrationStatus(user.id);
      console.log('Registration complete status:', isRegistrationComplete);

      // For users with usernames (new auth system), they should be considered complete
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, registration_completed, created_at')
        .eq('id', user.id)
        .single();

      console.log('User profile data:', profile);

      // If user has a username but registration_completed is false, update it
      if (profile?.username && !profile.registration_completed) {
        console.log('User has username but registration not marked complete, fixing...');
        await supabase
          .from('profiles')
          .update({ registration_completed: true })
          .eq('id', user.id);

        // Update local check
        const updatedStatus = true;
        console.log('Updated registration status to:', updatedStatus);
      }

      // Final check - if still not complete, show registration
      const finalStatus = profile?.registration_completed || (profile?.username ? true : false);

      if (!finalStatus) {
        console.log('User registration not complete, showing registration form');
        setCurrentScreen('registration');
        return;
      }

      // Cache the registration status to avoid repeated checks
      localStorage.setItem(`ecoSort_userRegistered_${user.id}`, 'true');
      console.log('Registration status cached for user:', user.id);

      // Load user progress
      await loadUserProgress();

      // Check if user needs onboarding (only for very new users)
      const userCreatedAt = new Date(user.created_at);
      const now = new Date();
      const timeDiff = now.getTime() - userCreatedAt.getTime();
      const isVeryNewUser = timeDiff < 300000; // Less than 5 minutes old

      if (isVeryNewUser && !localStorage.getItem('ecoSort_onboardingShown')) {
        console.log('New user detected, showing onboarding');
        localStorage.setItem('ecoSort_onboardingShown', 'true');
        setShowOnboarding(true);
        setCurrentScreen('onboarding');
      } else {
        console.log('Proceeding to game home');
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

        // Cache the registration status
        localStorage.setItem(`ecoSort_userRegistered_${user.id}`, 'true');

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
      case 'structuredFeedbackTest':
        return <StructuredFeedbackTest />;
      case 'streamingTest':
        return <StreamingTest />;
      case 'comprehensiveTest':
        return <ComprehensiveTest />;
      case 'feedbackTypeTest':
        return <FeedbackTypeTest />;
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
