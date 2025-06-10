
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const TestingSortingComponent = () => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const testClassification = async () => {
    setTesting(true);
    setResult(null);
    
    try {
      // Create a simple test image (1x1 pixel base64 image)
      const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      
      console.log('Testing classification with test image...');
      
      const { data, error } = await supabase.functions.invoke('classify-waste-image', {
        body: {
          imageBase64: testImageBase64,
          userId: 'test-user-id',
          language: 'EN'
        }
      });

      if (error) {
        console.error('Classification test error:', error);
        throw new Error(error.message || 'Classification failed');
      }

      console.log('Test classification result:', data);
      setResult(data);
      
      toast({
        title: 'Test Successful',
        description: 'Real-time sorting is working correctly!',
      });
    } catch (err: any) {
      console.error('Test failed:', err);
      setResult({ error: err.message });
      
      toast({
        title: 'Test Failed',
        description: err.message || 'Classification test failed',
        variant: 'destructive'
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 m-4">
      <h3 className="text-lg font-bold text-white mb-4">Test Real-time Sorting</h3>
      
      <Button
        onClick={testClassification}
        disabled={testing}
        className="mb-4 bg-blue-500 hover:bg-blue-600 text-white"
      >
        {testing ? 'Testing...' : 'Test Classification'}
      </Button>
      
      {result && (
        <div className="bg-white/20 rounded-xl p-4">
          <h4 className="font-semibold text-white mb-2">Test Result:</h4>
          <pre className="text-sm text-white overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default TestingSortingComponent;
