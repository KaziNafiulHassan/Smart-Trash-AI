
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { profileService } from '@/services/profileService';
import { gameService } from '@/services/gameService';
import { Language } from '@/types/common';

interface AuthManagerProps {
  language: Language;
  onAuthStateChange: (user: any, showOnboarding: boolean) => void;
  onProgressUpdate: (progress: any) => void;
}

export const AuthManager: React.FC<AuthManagerProps> = ({
  language,
  onAuthStateChange,
  onProgressUpdate
}) => {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user) {
      console.log('User authenticated, loading progress...', user.id);
      loadUserProgress();
      
      // Check if user needs onboarding (new user)
      const userCreatedAt = new Date(user.created_at);
      const now = new Date();
      const timeDiff = now.getTime() - userCreatedAt.getTime();
      const isNewUser = timeDiff < 60000; // Less than 1 minute old
      
      onAuthStateChange(user, isNewUser);
    } else if (!loading) {
      onAuthStateChange(null, false);
    }
  }, [user, loading, onAuthStateChange]);

  const loadUserProgress = async () => {
    if (!user) return;
    
    console.log('Loading user progress for:', user.id);
    
    // Ensure user setup first
    await profileService.ensureUserSetup(user.id, user.user_metadata?.name, language);
    
    const progress = await gameService.getUserProgress(user.id);
    if (progress) {
      console.log('Progress loaded:', progress);
      onProgressUpdate(progress);
    } else {
      console.log('No progress found, using defaults');
    }
  };

  return null; // This component only handles logic, no UI
};
