import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { neo4jService } from '@/services/neo4jService';

const Neo4jTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<string>('Initializing...');
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Auto-test connection when component mounts
    console.log('Neo4j Test Page: Component mounted, testing connection...');
    testConnection();
  }, []);

  const testConnection = async () => {
    setIsLoading(true);
    setConnectionStatus('Testing...');
    
    try {
      const isConnected = await neo4jService.testConnection();
      setConnectionStatus(isConnected ? 'Connected ✅' : 'Failed ❌');
    } catch (error) {
      setConnectionStatus(`Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testWasteItemQuery = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      // Test with a common item name
      const result = await neo4jService.getWasteItemInfo('paper', 'newspaper');
      setTestResult(result);
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
          Neo4j Connection Test
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Connection Status
          </h2>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            Status: <span className="font-mono">{connectionStatus}</span>
          </p>
          <Button 
            onClick={testConnection} 
            disabled={isLoading}
            className="mr-4"
          >
            {isLoading ? 'Testing...' : 'Test Connection'}
          </Button>
          <Button 
            onClick={testWasteItemQuery} 
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? 'Querying...' : 'Test Waste Item Query'}
          </Button>
        </div>

        {testResult && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Query Result
            </h2>
            <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded text-sm overflow-auto text-gray-900 dark:text-gray-100">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default Neo4jTest;
