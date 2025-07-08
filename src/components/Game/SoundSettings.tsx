import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Volume1 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { gameSoundService } from '@/services/gameSoundService';

interface SoundSettingsProps {
  language: 'EN' | 'DE';
}

const texts = {
  EN: {
    soundSettings: 'Sound Settings',
    masterVolume: 'Master Volume',
    effectsVolume: 'Effects Volume',
    musicVolume: 'Music Volume',
    enableSounds: 'Enable Sounds',
    testSound: 'Test Sound',
    soundEnabled: 'Sound Enabled',
    soundDisabled: 'Sound Disabled'
  },
  DE: {
    soundSettings: 'Sound-Einstellungen',
    masterVolume: 'Hauptlautstärke',
    effectsVolume: 'Effekt-Lautstärke',
    musicVolume: 'Musik-Lautstärke',
    enableSounds: 'Sounds aktivieren',
    testSound: 'Sound testen',
    soundEnabled: 'Sound aktiviert',
    soundDisabled: 'Sound deaktiviert'
  }
};

const SoundSettings: React.FC<SoundSettingsProps> = ({ language }) => {
  const [settings, setSettings] = useState(gameSoundService.getSettings());
  const t = texts[language];

  useEffect(() => {
    // Initialize audio context on component mount
    gameSoundService.resumeAudioContext();
  }, []);

  const handleSettingChange = (key: keyof typeof settings, value: number | boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    gameSoundService.updateSettings({ [key]: value });
  };

  const handleTestSound = async () => {
    await gameSoundService.resumeAudioContext();
    await gameSoundService.playSound('drop-correct');
  };

  const getVolumeIcon = (volume: number) => {
    if (volume === 0) return VolumeX;
    if (volume < 0.5) return Volume1;
    return Volume2;
  };

  const VolumeIcon = getVolumeIcon(settings.masterVolume);

  return (
    <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <VolumeIcon className="w-5 h-5" />
          {t.soundSettings}
        </h3>
        <Button
          onClick={handleTestSound}
          variant="outline"
          size="sm"
          className="text-xs"
        >
          {t.testSound}
        </Button>
      </div>

      {/* Enable/Disable Sounds */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t.enableSounds}
        </label>
        <button
          onClick={() => handleSettingChange('enabled', !settings.enabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            settings.enabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              settings.enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Volume Sliders */}
      {settings.enabled && (
        <div className="space-y-3">
          {/* Master Volume */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.masterVolume}: {Math.round(settings.masterVolume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.masterVolume}
              onChange={(e) => handleSettingChange('masterVolume', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Effects Volume */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.effectsVolume}: {Math.round(settings.effectsVolume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.effectsVolume}
              onChange={(e) => handleSettingChange('effectsVolume', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Music Volume */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.musicVolume}: {Math.round(settings.musicVolume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.musicVolume}
              onChange={(e) => handleSettingChange('musicVolume', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        </div>
      )}

      {/* Status Indicator */}
      <div className="flex items-center gap-2 text-sm">
        <div className={`w-2 h-2 rounded-full ${settings.enabled ? 'bg-green-500' : 'bg-gray-400'}`} />
        <span className="text-gray-600 dark:text-gray-400">
          {settings.enabled ? t.soundEnabled : t.soundDisabled}
        </span>
      </div>
    </div>
  );
};

export default SoundSettings;
