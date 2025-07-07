import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Language } from '@/types/common';
import { ragLLMService } from '@/services/ragLLMService';
import { useFeedbackSettings, FEEDBACK_TYPE_OPTIONS } from '@/contexts/FeedbackSettingsContext';
import { useModelSettings, AVAILABLE_MODELS } from '@/contexts/ModelSettingsContext';
import StructuredFeedbackBox from '@/components/Game/StructuredFeedbackBox';
import GraphBox from '@/components/Game/GraphBox';
import GameAnimation from '@/components/Game/GameAnimations';

const ComprehensiveTest: React.FC = () => {
  const [language, setLanguage] = useState<Language>('EN');
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationType, setAnimationType] = useState<'correct' | 'incorrect'>('correct');
  
  const { feedbackType, setFeedbackType } = useFeedbackSettings();
  const { selectedModel, setSelectedModel } = useModelSettings();

  const testMistralDefault = async () => {
    setIsLoading(true);
    try {
      console.log('Testing Mistral as default model...');
      
      // Test that Mistral is the default
      const defaultModel = AVAILABLE_MODELS[0];
      console.log('Default model:', defaultModel);
      
      // Test human-like tone with Mistral
      const response = await ragLLMService.generateFeedback(
        'plastic',
        'plastic bottle',
        language,
        'mistralai/mistral-7b-instruct:free'
      );
      
      setTestResults({
        defaultModel,
        mistralResponse: response,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Test failed:', error);
      setTestResults({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const testFeedbackTypes = () => {
    console.log('Current feedback type:', feedbackType);
    console.log('Available feedback types:', FEEDBACK_TYPE_OPTIONS);
    
    // Cycle through feedback types
    const currentIndex = FEEDBACK_TYPE_OPTIONS.findIndex(opt => opt.id === feedbackType);
    const nextIndex = (currentIndex + 1) % FEEDBACK_TYPE_OPTIONS.length;
    setFeedbackType(FEEDBACK_TYPE_OPTIONS[nextIndex].id);
    
    console.log('Switched to:', FEEDBACK_TYPE_OPTIONS[nextIndex].name);
  };

  const testAnimations = (type: 'correct' | 'incorrect') => {
    setAnimationType(type);
    setShowAnimation(true);
  };

  const handleAnimationEnd = () => {
    setShowAnimation(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
            🎮 Comprehensive Feature Test
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {/* Language Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="EN">English</option>
                <option value="DE">German</option>
              </select>
            </div>

            {/* Model Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                AI Model
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as any)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                {AVAILABLE_MODELS.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Feedback Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Feedback Type
              </label>
              <select
                value={feedbackType}
                onChange={(e) => setFeedbackType(e.target.value as any)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                {FEEDBACK_TYPE_OPTIONS.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Button
              onClick={testMistralDefault}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? 'Testing...' : 'Test Mistral Default'}
            </Button>

            <Button
              onClick={testFeedbackTypes}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Toggle Feedback Type
            </Button>

            <Button
              onClick={() => testAnimations('correct')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Test Correct Animation
            </Button>

            <Button
              onClick={() => testAnimations('incorrect')}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Test Incorrect Animation
            </Button>
          </div>

          {/* Current Settings Display */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Current Settings:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <strong>Language:</strong> {language}
              </div>
              <div>
                <strong>Model:</strong> {AVAILABLE_MODELS.find(m => m.id === selectedModel)?.name}
              </div>
              <div>
                <strong>Feedback:</strong> {FEEDBACK_TYPE_OPTIONS.find(f => f.id === feedbackType)?.name}
              </div>
            </div>
          </div>
        </div>

        {/* Test Results */}
        {testResults && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              Test Results
            </h2>
            
            {testResults.error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <strong>Error:</strong> {testResults.error}
              </div>
            ) : (
              <div className="space-y-4">
                {testResults.defaultModel && (
                  <div>
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300">Default Model:</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {testResults.defaultModel.name} - {testResults.defaultModel.description}
                    </p>
                  </div>
                )}
                
                {testResults.mistralResponse && (
                  <div>
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Mistral Response (Human-like Tone):
                    </h3>
                    {testResults.mistralResponse.structured ? (
                      <StructuredFeedbackBox
                        structuredFeedback={testResults.mistralResponse.structured}
                        fallbackMessage={testResults.mistralResponse.message}
                        language={language}
                        onClarityRating={(rating) => console.log('Clarity:', rating)}
                        onHelpfulnessRating={(rating) => console.log('Helpfulness:', rating)}
                      />
                    ) : (
                      <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded">
                        {testResults.mistralResponse.message}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Demo Feedback Components */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
              AI Feedback Demo
            </h3>
            <StructuredFeedbackBox
              structuredFeedback={{
                correctBin: { name: 'Plastic Bin', icon: '♻️' },
                why: 'This plastic bottle is made of PET plastic and belongs in the recycling bin! 🌱',
                nextStep: 'Remember to remove the cap and rinse it out before recycling.',
                didYouKnow: 'Did you know? Recycling one plastic bottle saves enough energy to power a light bulb for 3 hours! ✨'
              }}
              language={language}
              onClarityRating={(rating) => console.log('Demo clarity:', rating)}
              onHelpfulnessRating={(rating) => console.log('Demo helpfulness:', rating)}
            />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
              Waste Information Demo
            </h3>
            <GraphBox
              data={{
                correctBin: 'Plastic Bin',
                category: 'Recyclable Plastic',
                material: 'PET Plastic',
                rule: 'Remove cap and rinse before recycling',
                recyclingCenter: 'Municipal Recycling Center'
              }}
              language={language}
              onClarityRating={(rating) => console.log('Demo clarity:', rating)}
              onHelpfulnessRating={(rating) => console.log('Demo helpfulness:', rating)}
            />
          </div>
        </div>
      </div>

      {/* Game Animation */}
      <GameAnimation
        type={animationType}
        isVisible={showAnimation}
        onAnimationEnd={handleAnimationEnd}
      />
    </div>
  );
};

export default ComprehensiveTest;
