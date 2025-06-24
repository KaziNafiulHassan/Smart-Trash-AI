import React from 'react';
import { X, Settings, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Language } from '@/types/common';
import ModelSelection from './ModelSelection';

interface SettingsPanelProps {
  language: Language;
  isOpen: boolean;
  onClose: () => void;
}

const texts = {
  EN: {
    settings: 'Game Settings',
    aiModelSettings: 'AI Assistant Model',
    aiModelDescription: 'Choose which AI model to use for generating feedback during the game. Different models may provide varying response styles and accuracy.',
    gamePaused: 'Game Paused',
    gamePausedDescription: 'The game timer is paused while you adjust settings.',
    close: 'Close'
  },
  DE: {
    settings: 'Spiel-Einstellungen',
    aiModelSettings: 'KI-Assistent Modell',
    aiModelDescription: 'Wählen Sie, welches KI-Modell für die Generierung von Feedback während des Spiels verwendet werden soll. Verschiedene Modelle können unterschiedliche Antwortstile und Genauigkeit bieten.',
    gamePaused: 'Spiel Pausiert',
    gamePausedDescription: 'Der Spiel-Timer ist pausiert, während Sie die Einstellungen anpassen.',
    close: 'Schließen'
  }
};

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  language,
  isOpen,
  onClose
}) => {
  const t = texts[language];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-white/20 dark:border-purple-400/30">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
            <Settings className="h-5 w-5" />
            <span>{t.settings}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Game Paused Notice */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-yellow-800 dark:text-yellow-200">
              <Pause className="h-4 w-4" />
              <span className="font-medium">{t.gamePaused}</span>
            </div>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              {t.gamePausedDescription}
            </p>
          </div>

          {/* AI Model Settings Section */}
          <div className="space-y-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t.aiModelSettings}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {t.aiModelDescription}
              </p>
            </div>

            <ModelSelection language={language} />
          </div>
        </div>
        
        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={onClose}
            className="bg-blue-500 hover:bg-blue-600 dark:bg-cyan-600 dark:hover:bg-cyan-700 text-white"
          >
            {t.close}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsPanel;
