
import { supabase } from '@/integrations/supabase/client';

export interface FeedbackRating {
  user_id: string;
  feedback_type: 'graph' | 'graphrag';
  rating: number;
  item_id?: string;
  session_id?: string;
}

export const feedbackService = {
  async saveFeedbackRating(rating: FeedbackRating): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('feedback_ratings')
        .insert([rating]);

      if (error) {
        console.error('Error saving feedback rating:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in saveFeedbackRating:', error);
      return false;
    }
  },

  async getUserFeedbackRatings(userId: string): Promise<FeedbackRating[]> {
    try {
      const { data, error } = await supabase
        .from('feedback_ratings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching feedback ratings:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserFeedbackRatings:', error);
      return [];
    }
  }
};
