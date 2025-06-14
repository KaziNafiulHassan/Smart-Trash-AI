
import { supabase } from '@/integrations/supabase/client';

export interface UserStudyData {
  name: string;
  age: number;
  gender: string;
  nationality: string;
  dataUsageApproved: boolean;
}

export const userStudyService = {
  async completeUserRegistration(userId: string, userData: UserStudyData): Promise<boolean> {
    console.log('Completing user registration for:', userId, userData);
    
    try {
      const { data, error } = await supabase.rpc('complete_user_registration', {
        p_user_id: userId,
        p_name: userData.name,
        p_age: userData.age,
        p_gender: userData.gender,
        p_nationality: userData.nationality,
        p_data_usage_approved: userData.dataUsageApproved
      });

      if (error) {
        console.error('Error completing user registration:', error);
        return false;
      }

      console.log('User registration completed successfully:', data);
      return true;
    } catch (error) {
      console.error('Error in completeUserRegistration:', error);
      return false;
    }
  },

  async getUserProfile(userId: string) {
    console.log('Fetching user profile for:', userId);
    
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

  async getUserStudyData(userId: string) {
    console.log('Fetching user study data for:', userId);
    
    const { data, error } = await supabase
      .from('user_study_data')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user study data:', error);
      return null;
    }

    return data;
  },

  async checkRegistrationStatus(userId: string): Promise<boolean> {
    console.log('Checking registration status for:', userId);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('registration_completed')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error checking registration status:', error);
      return false;
    }

    return data?.registration_completed || false;
  }
};
