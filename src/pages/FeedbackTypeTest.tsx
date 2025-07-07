import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useFeedbackSettings, FEEDBACK_TYPE_OPTIONS } from '@/contexts/FeedbackSettingsContext';
import GameSettingsDropdown from '@/components/Game/GameSettingsDropdown';
import { Language } from '@/types/common';

const FeedbackTypeTest: React.FC = () => {
  const { feedbackType, setFeedbackType } = useFeedbackSettings();
  const [language] = useState<Language>('EN');

  const handleDirectChange = (newType: string) => {
    console.log('Direct change from', feedbackType, 'to', newType);
    setFeedbackType(newType as any);
  };

  const testLocalStorage = () => {
    const stored = localStorage.getItem('ecoSort_feedbackType');
    console.log('Stored feedback type:', stored);
    console.log('Current feedback type:', feedbackType);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
            🔧 Feedback Type Dropdown Test
          </h1>

          {/* Current State Display */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Current State:</h3>
            <div className="space-y-2 text-sm">
              <div><strong>Feedback Type:</strong> {feedbackType}</div>
              <div><strong>Display Name:</strong> {FEEDBACK_TYPE_OPTIONS.find(opt => opt.id === feedbackType)?.name}</div>
              <div><strong>Description:</strong> {FEEDBACK_TYPE_OPTIONS.find(opt => opt.id === feedbackType)?.description}</div>
            </div>
          </div>

          {/* Settings Dropdown Test */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Settings Dropdown Test:</h3>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Test the dropdown in the settings button:
              </span>
              <GameSettingsDropdown
                language={language}
                onResetLevel={() => console.log('Reset level')}
                onOpenModelSettings={() => console.log('Open model settings')}
              />
            </div>
          </div>

          {/* Direct Control Buttons */}
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-green-800 dark:text-green-300 mb-4">Direct Control Test:</h3>
            <div className="flex flex-wrap gap-2">
              {FEEDBACK_TYPE_OPTIONS.map(option => (
                <Button
                  key={option.id}
                  onClick={() => handleDirectChange(option.id)}
                  variant={feedbackType === option.id ? "default" : "outline"}
                  className={feedbackType === option.id ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  {option.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Debug Actions */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-4">Debug Actions:</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={testLocalStorage}
                variant="outline"
                className="border-yellow-500 text-yellow-700 hover:bg-yellow-100"
              >
                Check localStorage
              </Button>
              <Button
                onClick={() => {
                  localStorage.removeItem('ecoSort_feedbackType');
                  window.location.reload();
                }}
                variant="outline"
                className="border-red-500 text-red-700 hover:bg-red-100"
              >
                Clear & Reload
              </Button>
              <Button
                onClick={() => {
                  console.log('All feedback options:', FEEDBACK_TYPE_OPTIONS);
                  console.log('Current context state:', { feedbackType });
                }}
                variant="outline"
                className="border-blue-500 text-blue-700 hover:bg-blue-100"
              >
                Log State
              </Button>
            </div>
          </div>

          {/* Visual Feedback */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Visual Feedback:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg border-2 transition-all ${
                feedbackType === 'ai' 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-300 bg-gray-100 dark:bg-gray-600'
              }`}>
                <h4 className="font-medium text-gray-800 dark:text-gray-200">🤖 AI Feedback</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {feedbackType === 'ai' ? '✅ ACTIVE' : '⭕ Inactive'}
                </p>
              </div>
              
              <div className={`p-4 rounded-lg border-2 transition-all ${
                feedbackType === 'waste-info' 
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                  : 'border-gray-300 bg-gray-100 dark:bg-gray-600'
              }`}>
                <h4 className="font-medium text-gray-800 dark:text-gray-200">📊 Waste Information</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {feedbackType === 'waste-info' ? '✅ ACTIVE' : '⭕ Inactive'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
            🧪 Test Instructions
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
            <li>Click the settings button (⚙️) above to open the dropdown</li>
            <li>Look for the "Feedback Type" section in the dropdown</li>
            <li>Click on either "AI Feedback" or "Waste Information" buttons</li>
            <li>Observe the visual feedback changes below</li>
            <li>Check the browser console for debug logs</li>
            <li>Use the direct control buttons to verify the context is working</li>
            <li>Check localStorage to ensure persistence is working</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default FeedbackTypeTest;
