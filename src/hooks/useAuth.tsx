
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

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
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('useAuth: Error during signOut:', error);
        throw error;
      }
      console.log('useAuth: SignOut completed successfully');
    } catch (error) {
      console.error('useAuth: SignOut failed:', error);
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
