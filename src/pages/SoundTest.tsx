import React from 'react';
import { Button } from '@/components/ui/button';
import { gameSoundService, SoundType } from '@/services/gameSoundService';
import SoundSettings from '@/components/Game/SoundSettings';

const SoundTest: React.FC = () => {
  const soundTypes: SoundType[] = [
    'drag-start',
    'drag-hover',
    'drop-correct',
    'drop-incorrect',
    'level-complete',
    'game-start',
    'timer-warning',
    'timer-tick',
    'achievement-unlock',
    'button-click',
    'popup-open',
    'popup-close',
    'feedback-positive',
    'feedback-negative',
    'confetti',
    'whoosh',
    'sparkle'
  ];

  const handlePlaySound = async (soundType: SoundType) => {
    await gameSoundService.resumeAudioContext();
    await gameSoundService.playSound(soundType);
  };

  const handleStopAllSounds = () => {
    gameSoundService.stopAllSounds();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-green-500 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            🔊 EcoSort Game Sound Test
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sound Test Buttons */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Test Sound Effects
              </h2>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                {soundTypes.map((soundType) => (
                  <Button
                    key={soundType}
                    onClick={() => handlePlaySound(soundType)}
                    variant="outline"
                    className="text-sm p-3 h-auto"
                  >
                    {soundType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Button>
                ))}
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleStopAllSounds}
                  variant="destructive"
                  className="flex-1"
                >
                  Stop All Sounds
                </Button>
                
                <Button
                  onClick={() => handlePlaySound('drop-correct')}
                  className="flex-1 bg-green-500 hover:bg-green-600"
                >
                  Test Success Sound
                </Button>
              </div>
            </div>

            {/* Sound Settings */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Sound Settings
              </h2>
              <SoundSettings language="EN" />
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
              🎮 Sound Integration Guide
            </h3>
            <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
              <p><strong>Game Events with Sound:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Game Start:</strong> Welcome sound when level loads</li>
                <li><strong>Drag & Drop:</strong> Audio feedback for item interactions</li>
                <li><strong>Correct/Incorrect:</strong> Success/error sounds for sorting</li>
                <li><strong>Timer:</strong> Warning sounds when time is running out</li>
                <li><strong>Level Complete:</strong> Victory fanfare with confetti</li>
                <li><strong>Achievements:</strong> Special unlock sounds</li>
                <li><strong>UI Interactions:</strong> Button clicks and popup sounds</li>
                <li><strong>Feedback:</strong> Positive/negative audio cues</li>
              </ul>
              
              <p className="mt-4"><strong>Features:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Procedurally generated sounds (no external files needed)</li>
                <li>Volume controls for master, effects, and music</li>
                <li>Enable/disable toggle for accessibility</li>
                <li>Browser-compatible Web Audio API</li>
                <li>Persistent settings via localStorage</li>
              </ul>
            </div>
          </div>

          {/* Back to Game */}
          <div className="mt-6 text-center">
            <Button
              onClick={() => window.location.href = '/'}
              className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3"
            >
              ← Back to Game
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoundTest;
