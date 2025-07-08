
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper function to clear auth-related localStorage items
  const clearAuthRelatedStorage = () => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('ecoSort_userRegistered_') ||
            key.startsWith('ecoSort_currentScreen') ||
            key.startsWith('supabase.auth.token')) {
          localStorage.removeItem(key);
        }
      });
      console.log('useAuth: Cleared auth-related localStorage items');
    } catch (error) {
      console.error('useAuth: Error clearing localStorage:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      console.log('useAuth: Starting signOut process...');

      // Check if there's an active session before attempting to sign out
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        console.log('useAuth: No active session found, clearing local state');
        // No active session, just clear local state and localStorage
        setSession(null);
        setUser(null);
        clearAuthRelatedStorage();
        return;
      }

      console.log('useAuth: Active session found, proceeding with signOut');
      const { error } = await supabase.auth.signOut();

      if (error) {
        // Handle specific auth session missing error gracefully
        if (error.message.includes('Auth session missing') || error.name === 'AuthSessionMissingError') {
          console.log('useAuth: Session already cleared, updating local state');
          setSession(null);
          setUser(null);
          clearAuthRelatedStorage();
          return;
        }

        console.error('useAuth: Error during signOut:', error);
        throw error;
      }

      console.log('useAuth: SignOut completed successfully');
      clearAuthRelatedStorage();
    } catch (error) {
      console.error('useAuth: SignOut failed:', error);

      // For auth session errors, still clear local state to allow logout
      if (error.message?.includes('Auth session missing') || error.name === 'AuthSessionMissingError') {
        console.log('useAuth: Clearing local state despite session error');
        setSession(null);
        setUser(null);
        clearAuthRelatedStorage();
        return;
      }

      throw error;
    }
  };

  return {
    user,
    session,
    loading,
    signOut
  };
};
