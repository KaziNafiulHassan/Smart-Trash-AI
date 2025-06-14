
import { supabase } from '@/integrations/supabase/client';
import { userStudyService, UserStudyData } from './userStudyService';

export interface UserProfile {
  id: string;
  name: string;
  language: 'EN' | 'DE';
  avatar_emoji?: string;
  age?: number;
  gender?: string;
  nationality?: string;
  data_usage_approved?: boolean;
  registration_completed?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const profileService = {
  async createUserProfile(userId: string, name: string, language: 'EN' | 'DE'): Promise<UserProfile | null> {
    console.log('Creating user profile for:', userId, name, language);
    
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        name,
        language,
        avatar_emoji: '🌱',
        registration_completed: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user profile:', error);
      return null;
    }

    console.log('User profile created:', data);
    return data;
  },

  async createUserProgress(userId: string) {
    console.log('Creating user progress for:', userId);
    
    const { data, error } = await supabase
      .from('user_progress')
      .insert({
        user_id: userId,
        level: 1,
        total_correct: 0,
        total_attempts: 0,
        completed_levels: 0,
        best_score: 0,
        current_streak: 0,
        best_streak: 0
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user progress:', error);
      return null;
    }

    console.log('User progress created:', data);
    return data;
  },

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  },

  async ensureUserSetup(userId: string, name?: string, language: 'EN' | 'DE' = 'EN') {
    console.log('Ensuring user setup for:', userId);
    
    // Check if profile exists
    const existingProfile = await this.getUserProfile(userId);
    
    if (!existingProfile) {
      console.log('Profile not found, creating...');
      // Create profile with registration_completed = false
      await this.createUserProfile(userId, name || 'Player', language);
      
      // Create progress
      await this.createUserProgress(userId);
    } else {
      console.log('Profile already exists:', existingProfile);
    }
  },

  async completeUserRegistration(userId: string, userData: UserStudyData & { avatar?: any }) {
    console.log('Completing user registration with study data:', userData);
    
    // Complete registration using the database function
    const success = await userStudyService.completeUserRegistration(userId, {
      name: userData.name,
      age: userData.age,
      gender: userData.gender,
      nationality: userData.nationality,
      dataUsageApproved: userData.dataUsageApproved
    });

    if (success && userData.avatar) {
      // Update avatar emoji
      await supabase
        .from('profiles')
        .update({ avatar_emoji: userData.avatar.emoji })
        .eq('id', userId);
    }

    return success;
  }
};
