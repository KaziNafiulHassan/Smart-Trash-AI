
import React from 'react';
import { User, Settings, Moon, Sun, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/contexts/ThemeContext';
import { Language } from '@/types/common';
import LogoutButton from './LogoutButton';

interface SettingsDropdownProps {
  language: Language;
  onOpenProfile: () => void;
}

const texts = {
  EN: {
    settings: 'Settings',
    viewProfile: 'View Profile',
    toggleTheme: 'Toggle Theme',
    logout: 'Logout'
  },
  DE: {
    settings: 'Einstellungen',
    viewProfile: 'Profil Anzeigen',
    toggleTheme: 'Design Wechseln',
    logout: 'Abmelden'
  }
};

const SettingsDropdown: React.FC<SettingsDropdownProps> = ({ 
  language, 
  onOpenProfile 
}) => {
  const { theme, toggleTheme } = useTheme();
  const t = texts[language];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="bg-white/20 hover:bg-white/30 border-white/30 text-white hover:text-white dark:bg-purple-900/50 dark:hover:bg-purple-800/50 dark:border-purple-400/30 dark:text-purple-200"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-48 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-white/20 dark:border-purple-400/30"
      >
        <DropdownMenuItem 
          onClick={onOpenProfile}
          className="cursor-pointer hover:bg-white/20 dark:hover:bg-purple-800/30"
        >
          <User className="mr-2 h-4 w-4" />
          {t.viewProfile}
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={toggleTheme}
          className="cursor-pointer hover:bg-white/20 dark:hover:bg-purple-800/30"
        >
          {theme === 'light' ? (
            <Moon className="mr-2 h-4 w-4" />
          ) : (
            <Sun className="mr-2 h-4 w-4" />
          )}
          {t.toggleTheme}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-white/20 dark:bg-purple-400/30" />
        
        <DropdownMenuItem asChild>
          <div className="cursor-pointer hover:bg-white/20 dark:hover:bg-purple-800/30 p-0">
            <LogoutButton 
              variant="ghost" 
              className="w-full justify-start p-2 h-auto text-foreground hover:bg-transparent"
            />
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SettingsDropdown;
