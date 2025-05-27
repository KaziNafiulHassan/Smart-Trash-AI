
import React, { useState } from 'react';
import { Eye, EyeOff, User, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Language } from '@/pages/Index';

interface AuthScreenProps {
  language: Language;
  onAuth: (user: any) => void;
}

const texts = {
  EN: {
    welcome: 'Welcome to EcoSort',
    subtitle: 'Learn waste sorting through fun gameplay',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    email: 'Email',
    password: 'Password',
    name: 'Full Name',
    alreadyAccount: 'Already have an account?',
    noAccount: "Don't have an account?",
    signInButton: 'Sign In',
    signUpButton: 'Create Account',
    loading: 'Loading...',
    emailPlaceholder: 'Enter your email',
    passwordPlaceholder: 'Enter your password',
    namePlaceholder: 'Enter your full name'
  },
  DE: {
    welcome: 'Willkommen bei EcoSort',
    subtitle: 'Lerne Mülltrennung durch spielerisches Lernen',
    signIn: 'Anmelden',
    signUp: 'Registrieren',
    email: 'E-Mail',
    password: 'Passwort',
    name: 'Vollständiger Name',
    alreadyAccount: 'Bereits ein Konto?',
    noAccount: 'Noch kein Konto?',
    signInButton: 'Anmelden',
    signUpButton: 'Konto erstellen',
    loading: 'Laden...',
    emailPlaceholder: 'E-Mail eingeben',
    passwordPlaceholder: 'Passwort eingeben',
    namePlaceholder: 'Vollständigen Namen eingeben'
  }
};

const AuthScreen: React.FC<AuthScreenProps> = ({ language, onAuth }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const t = texts[language];

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              language
            }
          }
        });

        if (error) throw error;
        
        if (data.user) {
          onAuth(data.user);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;
        
        if (data.user) {
          onAuth(data.user);
        }
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 text-white">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">♻️</div>
          <h1 className="text-3xl font-bold mb-2">{t.welcome}</h1>
          <p className="text-blue-100">{t.subtitle}</p>
        </div>

        <div className="bg-white/10 rounded-3xl p-6 backdrop-blur-sm">
          <div className="flex mb-6">
            <Button
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-3 rounded-xl mr-2 ${
                !isSignUp ? 'bg-blue-500 text-white' : 'bg-transparent text-blue-100'
              }`}
            >
              {t.signIn}
            </Button>
            <Button
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-3 rounded-xl ml-2 ${
                isSignUp ? 'bg-blue-500 text-white' : 'bg-transparent text-blue-100'
              }`}
            >
              {t.signUp}
            </Button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.namePlaceholder}
                  className="w-full pl-12 pr-4 py-3 bg-white/20 rounded-xl text-white placeholder-gray-300"
                  required
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                className="w-full pl-12 pr-4 py-3 bg-white/20 rounded-xl text-white placeholder-gray-300"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.passwordPlaceholder}
                className="w-full pl-12 pr-12 py-3 bg-white/20 rounded-xl text-white placeholder-gray-300"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-500/20 rounded-xl">
                <p className="text-red-100 text-sm">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold"
            >
              {loading ? t.loading : (isSignUp ? t.signUpButton : t.signInButton)}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
