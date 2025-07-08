
import { supabase } from '@/integrations/supabase/client';

// Frontend feedback types (what the UI uses)
export type FrontendFeedbackType = 'ai' | 'waste-info';

// Database feedback types (what the database expects)
export type DatabaseFeedbackType = 'graphrag' | 'graph';

// Mapping function to convert frontend types to database types
export const mapFeedbackType = (frontendType: FrontendFeedbackType): DatabaseFeedbackType => {
  switch (frontendType) {
    case 'ai':
      return 'graphrag'; // AI feedback maps to graphrag
    case 'waste-info':
      return 'graph'; // Waste info feedback maps to graph
    default:
      return 'graph'; // Default fallback
  }
};

// Reverse mapping function to convert database types back to frontend types
export const mapDatabaseToFrontendType = (databaseType: DatabaseFeedbackType): FrontendFeedbackType => {
  switch (databaseType) {
    case 'graphrag':
      return 'ai'; // graphrag maps back to AI feedback
    case 'graph':
      return 'waste-info'; // graph maps back to waste info feedback
    default:
      return 'waste-info'; // Default fallback
  }
};

export interface FeedbackRating {
  user_id: string;
  feedback_type: DatabaseFeedbackType;
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
  feedback_type: FrontendFeedbackType; // Accept frontend types
  clarity_rating: number;
  helpfulness_rating: number;
  model_used?: string;
  generated_text?: string;
  item_id?: string;
  session_id?: string;
  // Additional fields that might be passed from the frontend
  item_name?: string;
  selected_bin?: string;
  is_correct?: boolean;
  created_at?: string;
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
      // Map frontend feedback type to database feedback type
      const mappedFeedbackType = mapFeedbackType(rating.feedback_type);

      // For enhanced ratings, we don't use the old 'rating' field
      const dataToInsert = {
        ...rating,
        feedback_type: mappedFeedbackType, // Use mapped database type
        rating: 5 // Set a default value for the required rating field
      };

      console.log('Saving enhanced feedback rating with mapped type:', {
        original: rating.feedback_type,
        mapped: mappedFeedbackType,
        data: dataToInsert
      });

      const { error } = await supabase
        .from('feedback_ratings')
        .insert([dataToInsert]);

      if (error) {
        console.error('Error saving enhanced feedback rating:', error);
        console.error('Error details:', error.message, error.details);
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

      // Type cast the feedback_type and map to frontend types
      return (data || []).map(item => ({
        ...item,
        feedback_type: item.feedback_type as DatabaseFeedbackType
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

      // Type cast and filter for enhanced ratings, mapping database types back to frontend types
      return (data || [])
        .filter(item => item.clarity_rating !== null && item.helpfulness_rating !== null)
        .map(item => ({
          user_id: item.user_id,
          feedback_type: mapDatabaseToFrontendType(item.feedback_type as DatabaseFeedbackType),
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
