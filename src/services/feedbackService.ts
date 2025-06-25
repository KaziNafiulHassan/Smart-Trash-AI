
import { supabase } from '@/integrations/supabase/client';

export interface FeedbackRating {
  user_id: string;
  feedback_type: 'graph' | 'graphrag';
  rating: number;
  clarity_rating?: number;
  helpfulness_rating?: number;
  model_used?: string;
  generated_text?: string;
  item_id?: string;
  session_id?: string;
}

export interface EnhancedFeedbackRating {
  user_id: string;
  feedback_type: 'graph' | 'graphrag';
  clarity_rating: number;
  helpfulness_rating: number;
  model_used?: string;
  generated_text?: string;
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

  async saveEnhancedFeedbackRating(rating: EnhancedFeedbackRating): Promise<boolean> {
    try {
      // For enhanced ratings, we don't use the old 'rating' field
      const dataToInsert = {
        ...rating,
        rating: 5 // Set a default value for the required rating field
      };

      const { error } = await supabase
        .from('feedback_ratings')
        .insert([dataToInsert]);

      if (error) {
        console.error('Error saving enhanced feedback rating:', error);
        return false;
      }

      console.log('Enhanced feedback rating saved successfully:', dataToInsert);
      return true;
    } catch (error) {
      console.error('Error in saveEnhancedFeedbackRating:', error);
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

      // Type cast the feedback_type to ensure it matches our interface
      return (data || []).map(item => ({
        ...item,
        feedback_type: item.feedback_type as 'graph' | 'graphrag'
      }));
    } catch (error) {
      console.error('Error in getUserFeedbackRatings:', error);
      return [];
    }
  },

  async getUserEnhancedFeedbackRatings(userId: string): Promise<EnhancedFeedbackRating[]> {
    try {
      const { data, error } = await supabase
        .from('feedback_ratings')
        .select('*')
        .eq('user_id', userId)
        .not('clarity_rating', 'is', null)
        .not('helpfulness_rating', 'is', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching enhanced feedback ratings:', error);
        return [];
      }

      // Type cast and filter for enhanced ratings
      return (data || [])
        .filter(item => item.clarity_rating !== null && item.helpfulness_rating !== null)
        .map(item => ({
          user_id: item.user_id,
          feedback_type: item.feedback_type as 'graph' | 'graphrag',
          clarity_rating: item.clarity_rating!,
          helpfulness_rating: item.helpfulness_rating!,
          model_used: item.model_used,
          generated_text: item.generated_text,
          item_id: item.item_id,
          session_id: item.session_id
        }));
    } catch (error) {
      console.error('Error in getUserFeedbackRatings:', error);
      return [];
    }
  }
};
