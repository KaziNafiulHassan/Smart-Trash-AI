
import React from 'react';
import { Leaf, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Language } from '@/types/common';

interface WelcomeScreenProps {
  onLanguageSelect: (language: Language) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onLanguageSelect }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-white">
      <div className="text-center mb-12 animate-fade-in">
        <div className="mb-6">
          <Leaf className="w-24 h-24 mx-auto text-green-300 animate-pulse" />
        </div>
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-300 to-blue-300 bg-clip-text text-transparent">
          EcoSort
        </h1>
        <p className="text-xl text-green-100 max-w-md mx-auto leading-relaxed">
          Learn waste sorting through fun games and help save our planet!
        </p>
      </div>

      <div className="space-y-4 w-full max-w-sm">
        <div className="flex items-center justify-center mb-6">
          <Globe className="w-6 h-6 mr-2 text-blue-300" />
          <span className="text-lg font-semibold text-blue-100">Select Language</span>
        </div>
        
        <Button
          onClick={() => onLanguageSelect('EN')}
          className="w-full py-4 text-lg font-semibold bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-lg transition-all duration-200 hover:scale-105"
        >
          🇺🇸 English
        </Button>
        
        <Button
          onClick={() => onLanguageSelect('DE')}
          className="w-full py-4 text-lg font-semibold bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-lg transition-all duration-200 hover:scale-105"
        >
          🇩🇪 Deutsch
        </Button>
      </div>

      <div className="mt-12 text-center">
        <p className="text-sm text-green-200 opacity-75">
          Made with 💚 for a cleaner world
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;
