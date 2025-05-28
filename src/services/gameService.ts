
import { supabase } from '@/integrations/supabase/client';

export interface GameSession {
  level: number;
  score: number;
  time_spent?: number;
  items_sorted: number;
  correct_sorts: number;
  accuracy: number;
}

export interface UserProgress {
  level: number;
  total_correct: number;
  total_attempts: number;
  completed_levels: number;
  best_score: number;
  current_streak: number;
  best_streak: number;
}

export const gameService = {
  async getUserProgress(userId: string): Promise<UserProgress | null> {
    console.log('Fetching user progress for:', userId);
    
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle(); // Use maybeSingle instead of single to handle no results

    if (error) {
      console.error('Error fetching user progress:', error);
      return null;
    }

    if (!data) {
      console.log('No user progress found for user:', userId);
      return null;
    }

    console.log('User progress fetched:', data);
    return data;
  },

  async updateUserProgress(userId: string, progress: Partial<UserProgress>) {
    const { error } = await supabase
      .from('user_progress')
      .update({
        ...progress,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating user progress:', error);
      throw error;
    }
  },

  async saveGameSession(userId: string, session: GameSession) {
    const { error } = await supabase
      .from('game_sessions')
      .insert({
        user_id: userId,
        ...session
      });

    if (error) {
      console.error('Error saving game session:', error);
      throw error;
    }
  },

  async getWasteItems() {
    const { data, error } = await supabase
      .from('waste_items')
      .select(`
        *,
        categories (
          id,
          name_en,
          name_de,
          bin_type,
          description_en,
          description_de
        )
      `);

    if (error) {
      console.error('Error fetching waste items:', error);
      return [];
    }

    return data;
  },

  async getAchievements() {
    const { data, error } = await supabase
      .from('achievements')
      .select('*');

    if (error) {
      console.error('Error fetching achievements:', error);
      return [];
    }

    return data;
  },

  async getUserAchievements(userId: string) {
    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievements (*)
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user achievements:', error);
      return [];
    }

    return data;
  },

  async unlockAchievement(userId: string, achievementId: string) {
    const { error } = await supabase
      .from('user_achievements')
      .insert({
        user_id: userId,
        achievement_id: achievementId
      });

    if (error && !error.message.includes('duplicate')) {
      console.error('Error unlocking achievement:', error);
      throw error;
    }
  }
};
