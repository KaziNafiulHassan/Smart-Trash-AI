import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ragLLMService } from '@/services/ragLLMService';
import { Language } from '@/types/common';
import { AVAILABLE_MODELS, LLMModel } from '@/contexts/ModelSettingsContext';
import ModelSelection from '@/components/Game/ModelSelection';

const RAGTest: React.FC = () => {
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState<Language>('EN');
  const [selectedModel, setSelectedModel] = useState<LLMModel>('meta-llama/llama-4-maverick-17b-128e-instruct:free');

  const testRAGService = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      // Test with a common item name
      const result = await ragLLMService.generateFeedback('paper', 'newspaper', language, selectedModel);
      setTestResult(result);
    } catch (error) {
      setTestResult({ error: error.toString() });
    } finally {
      setIsLoading(false);
    }
  };

  const testWithDifferentItems = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      const testItems = [
        { binType: 'plastic', itemName: 'plastic bottle' },
        { binType: 'glass', itemName: 'wine bottle' },
        { binType: 'bio', itemName: 'apple core' }
      ];

      const results = [];
      for (const item of testItems) {
        const result = await ragLLMService.generateFeedback(item.binType, item.itemName, language, selectedModel);
        results.push({ item: item.itemName, binType: item.binType, response: result });
      }

      setTestResult({ multipleTests: results });
    } catch (error) {
      setTestResult({ error: error.toString() });
    } finally {
      setIsLoading(false);
    }
  };

  const testOpenRouterAPI = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      const result = await ragLLMService.testOpenRouterAPI(selectedModel);
      setTestResult({ apiTest: result });
    } catch (error) {
      setTestResult({ error: error.toString() });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
          RAG LLM Service Test
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Test Configuration
          </h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Language:
            </label>
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="EN">English</option>
              <option value="DE">German</option>
            </select>
          </div>
          
          <div className="space-x-4">
            <Button 
              onClick={testRAGService} 
              disabled={isLoading}
              className="mr-4"
            >
              {isLoading ? 'Testing...' : 'Test Single Item (Newspaper)'}
            </Button>
            <Button
              onClick={testWithDifferentItems}
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? 'Testing...' : 'Test Multiple Items'}
            </Button>
            <Button
              onClick={testOpenRouterAPI}
              disabled={isLoading}
              variant="secondary"
            >
              {isLoading ? 'Testing...' : 'Test OpenRouter API'}
            </Button>
          </div>
        </div>

        {testResult && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Test Results
            </h2>
            
            {testResult.multipleTests ? (
              <div className="space-y-4">
                {testResult.multipleTests.map((test: any, index: number) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-600 rounded p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {test.item} → {test.binType}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded">
                      {test.response.message}
                    </p>
                  </div>
                ))}
              </div>
            ) : testResult.apiTest ? (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  OpenRouter API Test Result
                </h3>
                <pre className="text-sm overflow-auto text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                  {JSON.stringify(testResult.apiTest, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
                <pre className="text-sm overflow-auto text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                  {testResult.error ? 
                    `Error: ${testResult.error}` : 
                    testResult.message || JSON.stringify(testResult, null, 2)
                  }
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RAGTest;
