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
    console.log('Environment variables check:');
    console.log('VITE_NEO4J_URI:', import.meta.env.VITE_NEO4J_URI);
    console.log('VITE_NEO4J_USERNAME:', import.meta.env.VITE_NEO4J_USERNAME);
    console.log('VITE_NEO4J_PASSWORD length:', import.meta.env.VITE_NEO4J_PASSWORD?.length);
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
      // Test with multiple common item names to see what's in the database
      const testItems = ['newspaper', 'plastic bottle', 'glass bottle', 'apple', 'cardboard'];
      const results = [];

      for (const item of testItems) {
        try {
          const result = await neo4jService.getWasteItemInfo('unknown', item);
          results.push({ item, success: true, data: result });
        } catch (error) {
          results.push({ item, success: false, error: error.message });
        }
      }

      setTestResult({ multipleItems: results });
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
              Query Results
            </h2>

            {testResult.multipleItems ? (
              <div className="space-y-4">
                {testResult.multipleItems.map((test: any, index: number) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-600 rounded p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Testing: "{test.item}" {test.success ? '✅' : '❌'}
                    </h3>
                    {test.success ? (
                      <div className="bg-green-50 dark:bg-green-900 p-3 rounded">
                        <p><strong>Correct Bin:</strong> {test.data.correctBin}</p>
                        <p><strong>Category:</strong> {test.data.category}</p>
                        <p><strong>Material:</strong> {test.data.material}</p>
                        <p><strong>Rule:</strong> {test.data.rule}</p>
                        <p><strong>Recycling Center:</strong> {test.data.recyclingCenter}</p>
                      </div>
                    ) : (
                      <div className="bg-red-50 dark:bg-red-900 p-3 rounded">
                        <p className="text-red-700 dark:text-red-300">Error: {test.error}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded text-sm overflow-auto text-gray-900 dark:text-gray-100">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Neo4jTest;
