import React, { useState } from 'react';
import { Settings, LogOut, Palette, Bot, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Language } from '@/types/common';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { useModelSettings } from '@/contexts/ModelSettingsContext';
import { LLMModel } from '@/contexts/ModelSettingsContext';

interface GameSettingsDropdownProps {
  language: Language;
  onResetLevel: () => void;
  onOpenModelSettings: () => void;
}

const texts = {
  EN: {
    settings: 'Settings',
    aiModel: 'AI Model',
    theme: 'Theme',
    resetLevel: 'Reset Level',
    logout: 'Logout',
    light: 'Light',
    dark: 'Dark',
    currentModel: 'Current Model'
  },
  DE: {
    settings: 'Einstellungen',
    aiModel: 'KI-Modell',
    theme: 'Design',
    resetLevel: 'Level zurücksetzen',
    logout: 'Abmelden',
    light: 'Hell',
    dark: 'Dunkel',
    currentModel: 'Aktuelles Modell'
  }
};

const modelDisplayNames = {
  'meta-llama/llama-3.1-8b-instruct:free': 'Llama 3.1 8B',
  'mistralai/mistral-7b-instruct:free': 'Mistral 7B',
  'meta-llama/llama-3.2-3b-instruct:free': 'Llama 3.2 3B',
  'qwen/qwen2.5-vl-32b-instruct:free': 'Qwen 2.5 VL 32B'
};

const GameSettingsDropdown: React.FC<GameSettingsDropdownProps> = ({
  language,
  onResetLevel,
  onOpenModelSettings
}) => {
  const t = texts[language];
  const { signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { selectedModel } = useModelSettings();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    setIsOpen(false);
  };

  const handleThemeToggle = () => {
    toggleTheme();
    setIsOpen(false);
  };

  const handleResetLevel = () => {
    onResetLevel();
    setIsOpen(false);
  };

  const handleModelSettings = () => {
    onOpenModelSettings();
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          className="p-2 bg-white/20 hover:bg-white/30 rounded-full dark:bg-purple-900/50 dark:hover:bg-purple-800/50 dark:neon-border"
        >
          <Settings className="w-4 h-4 sm:w-6 sm:h-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg"
      >
        <DropdownMenuLabel className="text-gray-900 dark:text-gray-100">
          {t.settings}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleModelSettings}
          className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Bot className="w-4 h-4" />
          <div className="flex flex-col">
            <span>{t.aiModel}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {t.currentModel}: {modelDisplayNames[selectedModel as LLMModel] || selectedModel}
            </span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={handleThemeToggle}
          className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Palette className="w-4 h-4" />
          <div className="flex flex-col">
            <span>{t.theme}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {theme === 'dark' ? t.dark : t.light}
            </span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem 
          onClick={handleResetLevel}
          className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{t.resetLevel}</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem 
          onClick={handleLogout}
          className="flex items-center space-x-2 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
        >
          <LogOut className="w-4 h-4" />
          <span>{t.logout}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default GameSettingsDropdown;
