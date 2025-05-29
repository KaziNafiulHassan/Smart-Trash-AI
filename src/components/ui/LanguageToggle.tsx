
import React from 'react';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Language } from '@/pages/Index';

interface LanguageToggleProps {
  language: Language;
  onLanguageChange: (language: Language) => void;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ language, onLanguageChange }) => {
  const toggleLanguage = () => {
    onLanguageChange(language === 'EN' ? 'DE' : 'EN');
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleLanguage}
      className="bg-white/20 hover:bg-white/30 border-white/30 text-white hover:text-white dark:bg-purple-900/50 dark:hover:bg-purple-800/50 dark:border-purple-400/30 dark:text-purple-200 relative"
    >
      <Globe className="h-4 w-4" />
      <span className="absolute -bottom-1 -right-1 text-xs font-bold bg-blue-500 dark:bg-cyan-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
        {language}
      </span>
    </Button>
  );
};

export default LanguageToggle;
