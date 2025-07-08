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
import { useFeedbackSettings, FEEDBACK_TYPE_OPTIONS } from '@/contexts/FeedbackSettingsContext';
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
    feedbackType: 'Feedback Type',
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
    feedbackType: 'Feedback-Typ',
    theme: 'Design',
    resetLevel: 'Level zurücksetzen',
    logout: 'Abmelden',
    light: 'Hell',
    dark: 'Dunkel',
    currentModel: 'Aktuelles Modell'
  }
};

const modelDisplayNames = {
  'mistralai/mistral-7b-instruct:free': 'Mistral 7B',
  'meta-llama/llama-4-maverick-17b-128e-instruct:free': 'Llama 4 Maverick 17B',
  'meta-llama/llama-3.1-8b-instruct:free': 'Llama 3.1 8B',
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
  const { feedbackType, setFeedbackType } = useFeedbackSettings();
  const [isOpen, setIsOpen] = useState(false);

  // Debug function to test feedback type changes
  const handleFeedbackTypeChange = (newType: string) => {
    console.log('Attempting to change feedback type from', feedbackType, 'to', newType);
    setFeedbackType(newType as any);
    console.log('Feedback type change completed');
  };

  const handleLogout = async () => {
    try {
      console.log('GameSettingsDropdown: Starting logout process...');
      await signOut();
      console.log('GameSettingsDropdown: Logout completed successfully');
      setIsOpen(false);
    } catch (error) {
      console.error('GameSettingsDropdown: Error during logout:', error);
    }
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

        <div className="px-2 py-1.5 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-2 mb-2">
            <Bot className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{t.feedbackType}</span>
          </div>
          <div className="space-y-1">
            {FEEDBACK_TYPE_OPTIONS.map(option => (
              <button
                key={option.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleFeedbackTypeChange(option.id);
                  setIsOpen(false); // Close dropdown after selection
                }}
                className={`w-full text-left px-2 py-1 text-xs rounded transition-colors ${
                  feedbackType === option.id
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{option.name}</span>
                  {feedbackType === option.id && (
                    <span className="text-blue-600 dark:text-blue-400">✓</span>
                  )}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {option.description}
                </div>
              </button>
            ))}
          </div>
        </div>

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
