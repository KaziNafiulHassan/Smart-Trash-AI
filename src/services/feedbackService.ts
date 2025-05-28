
import { supabase } from '@/integrations/supabase/client';

export interface FeedbackRequest {
  itemName: string;
  itemDescription: string;
  selectedBin: string;
  correctBin: string;
  isCorrect: boolean;
  language: 'EN' | 'DE';
}

export const feedbackService = {
  async generateFeedback(request: FeedbackRequest): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-feedback', {
        body: request
      });

      if (error) {
        console.error('Error generating feedback:', error);
        return this.getFallbackFeedback(request);
      }

      return data.feedback;
    } catch (error) {
      console.error('Error calling feedback function:', error);
      return this.getFallbackFeedback(request);
    }
  },

  getFallbackFeedback(request: FeedbackRequest): string {
    const { itemName, selectedBin, correctBin, isCorrect, language } = request;
    
    if (isCorrect) {
      return language === 'EN' 
        ? `Correct! ${itemName} belongs in the ${correctBin}.`
        : `Richtig! ${itemName} gehört in die ${correctBin}.`;
    } else {
      return language === 'EN'
        ? `Oops! ${itemName} doesn't belong in the ${selectedBin}. It should go in the ${correctBin}.`
        : `Ups! ${itemName} gehört nicht in die ${selectedBin}. Es sollte in die ${correctBin}.`;
    }
  }
};
