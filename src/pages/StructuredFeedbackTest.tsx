import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Language } from '@/types/common';
import { ragLLMService } from '@/services/ragLLMService';
import { neo4jService } from '@/services/neo4jService';
import StructuredFeedbackBox from '@/components/Game/StructuredFeedbackBox';

const StructuredFeedbackTest: React.FC = () => {
  const [itemName, setItemName] = useState('plastic bottle');
  const [binType, setBinType] = useState('plastic');
  const [language, setLanguage] = useState<Language>('EN');
  const [isLoading, setIsLoading] = useState(false);
  const [ragResult, setRagResult] = useState<any>(null);
  const [neo4jResult, setNeo4jResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testStructuredFeedback = async () => {
    setIsLoading(true);
    setError(null);
    setRagResult(null);
    setNeo4jResult(null);

    try {
      console.log('Testing structured feedback system...');
      
      // Test Neo4j enhanced data retrieval
      console.log('1. Testing Neo4j enhanced data retrieval...');
      const neo4jData = await neo4jService.getWasteItemInfo(binType, itemName);
      setNeo4jResult(neo4jData);
      console.log('Neo4j enhanced data:', neo4jData);

      // Test RAG service with structured response
      console.log('2. Testing RAG service with structured response...');
      const ragResponse = await ragLLMService.generateFeedback(binType, itemName, language);
      setRagResult(ragResponse);
      console.log('RAG structured response:', ragResponse);

    } catch (err: any) {
      console.error('Test failed:', err);
      setError(err.message || 'Test failed');
    } finally {
      setIsLoading(false);
    }
  };

  const testNeo4jConnection = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const isConnected = await neo4jService.testConnection();
      if (isConnected) {
        setError(null);
        alert('Neo4j connection successful!');
      } else {
        setError('Neo4j connection failed');
      }
    } catch (err: any) {
      setError(err.message || 'Connection test failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
            Structured Feedback System Test
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
          </div>

          <div className="flex gap-4 mb-6">
            <Button
              onClick={testStructuredFeedback}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? 'Testing...' : 'Test Structured Feedback'}
            </Button>

            <Button
              onClick={testNeo4jConnection}
              disabled={isLoading}
              variant="outline"
            >
              Test Neo4j Connection
            </Button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>

        {/* Neo4j Enhanced Data Display */}
        {neo4jResult && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              Neo4j Enhanced Data
            </h2>
            <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(neo4jResult, null, 2)}
            </pre>
          </div>
        )}

        {/* RAG Response Display */}
        {ragResult && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              RAG Service Response
            </h2>
            
            {ragResult.structured ? (
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Structured Feedback (Rendered)
                </h3>
                <StructuredFeedbackBox
                  structuredFeedback={ragResult.structured}
                  fallbackMessage={ragResult.message}
                  language={language}
                  onClarityRating={(rating) => console.log('Clarity rating:', rating)}
                  onHelpfulnessRating={(rating) => console.log('Helpfulness rating:', rating)}
                />
              </div>
            ) : (
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Fallback Message
                </h3>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded">
                  {ragResult.message}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Raw Response Data
              </h3>
              <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(ragResult, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StructuredFeedbackTest;
