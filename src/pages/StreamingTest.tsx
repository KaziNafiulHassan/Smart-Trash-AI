import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Language } from '@/types/common';
import { ragLLMService } from '@/services/ragLLMService';
import { LLMModel } from '@/contexts/ModelSettingsContext';

const StreamingTest: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<LLMModel>('meta-llama/llama-4-maverick-17b-128e-instruct:free');
  const [language, setLanguage] = useState<Language>('EN');
  const [itemName, setItemName] = useState('plastic bottle');
  const [binType, setBinType] = useState('plastic');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const models: LLMModel[] = [
    'meta-llama/llama-4-maverick-17b-128e-instruct:free',
    'meta-llama/llama-3.1-8b-instruct:free',
    'mistralai/mistral-7b-instruct:free',
    'meta-llama/llama-3.2-3b-instruct:free',
    'qwen/qwen2.5-vl-32b-instruct:free'
  ];

  const testStreamingAPI = async () => {
    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      console.log('Testing hardened streaming API...');
      
      // Test the basic API functionality
      const testResult = await ragLLMService.testOpenRouterAPI(selectedModel);
      console.log('Basic API test result:', testResult);
      
      // Test the full feedback generation with streaming
      const feedbackResult = await ragLLMService.generateFeedback(binType, itemName, language, selectedModel);
      console.log('Feedback generation result:', feedbackResult);
      
      setResults([
        {
          type: 'API Test',
          model: selectedModel,
          result: testResult,
          timestamp: new Date().toISOString()
        },
        {
          type: 'Feedback Generation',
          model: selectedModel,
          result: feedbackResult,
          timestamp: new Date().toISOString()
        }
      ]);

    } catch (err: any) {
      console.error('Streaming test failed:', err);
      setError(err.message || 'Test failed');
    } finally {
      setIsLoading(false);
    }
  };

  const testAllModels = async () => {
    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      console.log('Testing all models with hardened streaming...');
      
      const allResults = await ragLLMService.testAllModels();
      console.log('All models test results:', allResults);
      
      const formattedResults = Object.entries(allResults).map(([model, result]) => ({
        type: 'Model Test',
        model,
        result,
        timestamp: new Date().toISOString()
      }));
      
      setResults(formattedResults);

    } catch (err: any) {
      console.error('All models test failed:', err);
      setError(err.message || 'Test failed');
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
            🚀 Hardened OpenRouter Streaming Test
          </h1>
          
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-semibold mb-2">Features Tested:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>✅ Server-Sent Events (SSE) streaming with proper [DONE] detection</li>
              <li>✅ Timeout handling: 5s connect, 300s read</li>
              <li>✅ Retry logic: 3 attempts with exponential backoff (2s, 4s, 8s)</li>
              <li>✅ Success validation: completion_tokens ≥ 5</li>
              <li>✅ Comprehensive metrics & logging</li>
              <li>✅ Read timeout warnings</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Model
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as LLMModel)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                {models.map(model => (
                  <option key={model} value={model}>
                    {model.split('/')[1]?.split('-').slice(0, 3).join(' ') || model}
                  </option>
                ))}
              </select>
            </div>

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

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Item Name
              </label>
              <Input
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="e.g., plastic bottle"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bin Type
              </label>
              <Input
                value={binType}
                onChange={(e) => setBinType(e.target.value)}
                placeholder="e.g., plastic"
              />
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            <Button
              onClick={testStreamingAPI}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? 'Testing...' : 'Test Selected Model'}
            </Button>

            <Button
              onClick={testAllModels}
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isLoading ? 'Testing...' : 'Test All Models'}
            </Button>

            <Button
              onClick={clearResults}
              disabled={isLoading}
              variant="outline"
            >
              Clear Results
            </Button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>

        {/* Results Display */}
        {results.length > 0 && (
          <div className="space-y-4">
            {results.map((result, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    {result.type} - {result.model}
                  </h2>
                  <span className="text-sm text-gray-500">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                
                {result.result.success ? (
                  <div className="space-y-4">
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2">
                        ✅ Success
                      </h3>
                      {result.result.response && (
                        <div className="bg-white dark:bg-gray-700 p-3 rounded border">
                          <strong>Response:</strong>
                          <p className="mt-2 text-sm">{result.result.response}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                    <h3 className="font-semibold text-red-800 dark:text-red-300 mb-2">
                      ❌ Failed
                    </h3>
                    <p className="text-red-700 dark:text-red-300">{result.result.error}</p>
                    {result.result.metrics && (
                      <div className="mt-3 bg-white dark:bg-gray-700 p-3 rounded border">
                        <strong>Metrics:</strong>
                        <pre className="mt-2 text-xs overflow-auto">
                          {JSON.stringify(result.result.metrics, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="mt-4">
                  <details className="cursor-pointer">
                    <summary className="font-medium text-gray-700 dark:text-gray-300">
                      Raw Result Data
                    </summary>
                    <pre className="mt-2 bg-gray-100 dark:bg-gray-700 p-4 rounded text-xs overflow-auto">
                      {JSON.stringify(result.result, null, 2)}
                    </pre>
                  </details>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StreamingTest;
