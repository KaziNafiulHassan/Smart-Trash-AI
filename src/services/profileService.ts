
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  name: string;
  language: 'EN' | 'DE';
  avatar_emoji?: string;
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
        avatar_emoji: '🌱'
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
      // Create profile
      await this.createUserProfile(userId, name || 'Player', language);
      
      // Create progress
      await this.createUserProgress(userId);
    } else {
      console.log('Profile already exists:', existingProfile);
    }
  }
};
