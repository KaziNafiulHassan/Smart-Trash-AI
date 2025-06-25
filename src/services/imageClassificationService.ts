import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type BinType = Database["public"]["Enums"]["bin_type"];

export interface ImageClassificationData {
  user_id: string;
  image_url?: string;
  predicted_category: string;
  predicted_bin: BinType;
  confidence: number;
  user_feedback_correct?: boolean;
  feedback_comment?: string;
  user_selected_bin?: BinType;
}

export const imageClassificationService = {
  async saveClassification(data: ImageClassificationData): Promise<string | null> {
    try {
      const { data: result, error } = await supabase
        .from('image_classifications')
        .insert([data])
        .select('id')
        .single();

      if (error) {
        console.error('Error saving image classification:', error);
        return null;
      }

      console.log('Image classification saved successfully:', result.id);
      return result.id;
    } catch (error) {
      console.error('Error in saveClassification:', error);
      return null;
    }
  },

  async updateClassificationFeedback(
    id: string,
    userFeedbackCorrect: boolean,
    feedbackComment?: string,
    userSelectedBin?: BinType
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('image_classifications')
        .update({
          user_feedback_correct: userFeedbackCorrect,
          feedback_comment: feedbackComment,
          user_selected_bin: userSelectedBin
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating classification feedback:', error);
        return false;
      }

      console.log('Classification feedback updated successfully');
      return true;
    } catch (error) {
      console.error('Error in updateClassificationFeedback:', error);
      return false;
    }
  },

  async getUserClassifications(userId: string): Promise<ImageClassificationData[]> {
    try {
      const { data, error } = await supabase
        .from('image_classifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user classifications:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserClassifications:', error);
      return [];
    }
  }
};
