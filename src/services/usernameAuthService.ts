import { supabase } from '@/integrations/supabase/client';
import { profileService } from './profileService';

export interface UsernameAuthResult {
  success: boolean;
  user?: any;
  error?: string;
}

export interface UsernameSignUpData {
  username: string;
  password: string;
  name: string;
  language: 'EN' | 'DE';
}

export interface UsernameSignInData {
  username: string;
  password: string;
}

/**
 * Username-based authentication service for barrier-free access
 * This service provides a simple username + password authentication system
 * without requiring email verification, suitable for research and demo purposes.
 */
export const usernameAuthService = {
  /**
   * Generate a dummy email from username for Supabase Auth compatibility
   * Format: username@smart-trash-ai.demo
   */
  generateDummyEmail(username: string): string {
    const cleanUsername = username.toLowerCase().replace(/[^a-z0-9_]/g, '');
    return `${cleanUsername}@smart-trash-ai.demo`;
  },

  /**
   * Validate username format
   */
  validateUsername(username: string): { valid: boolean; error?: string } {
    if (!username || username.length < 3) {
      return { valid: false, error: 'Username must be at least 3 characters long' };
    }
    
    if (username.length > 30) {
      return { valid: false, error: 'Username must be no more than 30 characters long' };
    }
    
    if (!/^[a-z0-9_]+$/.test(username.toLowerCase())) {
      return { valid: false, error: 'Username can only contain lowercase letters, numbers, and underscores' };
    }
    
    return { valid: true };
  },

  /**
   * Check if username is available
   */
  async isUsernameAvailable(username: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username.toLowerCase())
        .single();

      if (error && error.code === 'PGRST116') {
        // No rows returned, username is available
        return true;
      }

      return !data; // If data exists, username is taken
    } catch (error) {
      console.error('Error checking username availability:', error);
      return false;
    }
  },

  /**
   * Generate a unique username by adding numbers if needed
   */
  async generateUniqueUsername(baseUsername: string): Promise<string> {
    let username = baseUsername.toLowerCase();
    let counter = 1;

    while (!(await this.isUsernameAvailable(username))) {
      username = `${baseUsername.toLowerCase()}_${counter}`;
      counter++;

      // Prevent infinite loop
      if (counter > 999) {
        username = `${baseUsername.toLowerCase()}_${Date.now()}`;
        break;
      }
    }

    return username;
  },

  /**
   * Sign up with username and password
   */
  async signUpWithUsername(signUpData: UsernameSignUpData): Promise<UsernameAuthResult> {
    try {
      // Validate username
      const validation = this.validateUsername(signUpData.username);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Generate unique username (handles conflicts automatically)
      const uniqueUsername = await this.generateUniqueUsername(signUpData.username);
      console.log('Generated unique username:', uniqueUsername);

      // Generate dummy email for Supabase Auth using unique username
      const dummyEmail = this.generateDummyEmail(uniqueUsername);

      // Sign up with Supabase Auth using dummy email
      const { data, error } = await supabase.auth.signUp({
        email: dummyEmail,
        password: signUpData.password,
        options: {
          data: {
            name: signUpData.name,
            language: signUpData.language,
            username: uniqueUsername
          }
        }
      });

      if (error) {
        console.error('Supabase auth signup error:', error);
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Create user profile with unique username directly (single operation)
        console.log('Creating user profile with username:', uniqueUsername);

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            name: signUpData.name,
            language: signUpData.language,
            username: uniqueUsername,
            avatar_emoji: '🌱',
            registration_completed: false  // Users still need to complete study data form
          })
          .select()
          .single();

        if (profileError) {
          console.error('Error creating user profile:', profileError);
          // Note: Cannot clean up auth user with client-side code (requires admin privileges)
          // The auth user will remain but without a profile, which is handled elsewhere
          return { success: false, error: 'Failed to create user profile' };
        }

        console.log('User profile created successfully:', profileData);

        // Create user progress
        await profileService.createUserProgress(data.user.id);

        console.log('New user registration completed automatically');
        return { success: true, user: data.user };
      }

      return { success: false, error: 'Failed to create user account' };
    } catch (error: any) {
      console.error('Username signup error:', error);
      return { success: false, error: error.message || 'An unexpected error occurred' };
    }
  },

  /**
   * Sign in with username and password
   */
  async signInWithUsername(signInData: UsernameSignInData): Promise<UsernameAuthResult> {
    try {
      // Validate username format
      const validation = this.validateUsername(signInData.username);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Generate dummy email for Supabase Auth
      const dummyEmail = this.generateDummyEmail(signInData.username);

      // Sign in with Supabase Auth using dummy email
      const { data, error } = await supabase.auth.signInWithPassword({
        email: dummyEmail,
        password: signInData.password
      });

      if (error) {
        console.error('Supabase auth signin error:', error);
        
        // Provide user-friendly error messages
        if (error.message.includes('Invalid login credentials')) {
          return { success: false, error: 'Invalid username or password' };
        }
        
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Ensure user setup exists (fallback for existing users)
        const userMetadata = data.user.user_metadata;
        await profileService.ensureUserSetup(
          data.user.id,
          userMetadata?.name || 'Player',
          userMetadata?.language || 'EN'
        );

        // Note: We no longer automatically mark users as registration_completed
        // All users must complete the study data form for research compliance
        // The registration status will be handled by the main application flow

        return { success: true, user: data.user };
      }

      return { success: false, error: 'Failed to sign in' };
    } catch (error: any) {
      console.error('Username signin error:', error);
      return { success: false, error: error.message || 'An unexpected error occurred' };
    }
  },

  /**
   * Get user profile by username
   */
  async getUserByUsername(username: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username.toLowerCase())
        .single();

      if (error) {
        console.error('Error fetching user by username:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserByUsername:', error);
      return null;
    }
  }
};
