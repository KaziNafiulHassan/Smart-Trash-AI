
import { supabase } from '@/integrations/supabase/client';

export const feedbackService = {
  async generateFeedback(
    itemName: string,
    itemDescription: string,
    selectedBin: string,
    correctBin: string,
    isCorrect: boolean,
    language: 'EN' | 'DE'
  ): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-feedback', {
        body: {
          itemName,
          itemDescription,
          selectedBin,
          correctBin,
          isCorrect,
          language
        }
      });

      if (error) {
        console.error('Error generating feedback:', error);
        return language === 'EN' 
          ? 'Great job sorting that item!' 
          : 'Toll gemacht beim Sortieren!';
      }

      return data.feedback;
    } catch (error) {
      console.error('Error calling feedback function:', error);
      return language === 'EN' 
        ? 'Great job sorting that item!' 
        : 'Toll gemacht beim Sortieren!';
    }
  }
};
