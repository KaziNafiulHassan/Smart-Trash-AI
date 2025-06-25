import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { feedbackService } from '@/services/feedbackService';
import { supabase } from '@/integrations/supabase/client';

const FeedbackTest: React.FC = () => {
  const { user } = useAuth();
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testSupabaseConnection = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      // Test basic Supabase connection
      const { data, error } = await supabase
        .from('feedback_ratings')
        .select('count(*)')
        .limit(1);

      if (error) {
        setTestResult({ error: 'Supabase connection failed', details: error });
        return;
      }

      setTestResult({ 
        success: true, 
        message: 'Supabase connection successful',
        data: data 
      });
    } catch (error) {
      setTestResult({ error: 'Connection test failed', details: error });
    } finally {
      setIsLoading(false);
    }
  };

  const testEnhancedFeedbackSave = async () => {
    if (!user) {
      setTestResult({ error: 'User not authenticated' });
      return;
    }

    setIsLoading(true);
    setTestResult(null);
    
    try {
      // Test saving enhanced feedback rating
      const success = await feedbackService.saveEnhancedFeedbackRating({
        user_id: user.id,
        feedback_type: 'graphrag',
        clarity_rating: 4,
        helpfulness_rating: 5,
        model_used: 'meta-llama/llama-3.1-8b-instruct:free',
        generated_text: 'This is a test feedback message from the AI assistant.',
        item_id: 'test-item-123'
      });

      if (success) {
        setTestResult({ 
          success: true, 
          message: 'Enhanced feedback rating saved successfully!' 
        });
      } else {
        setTestResult({ error: 'Failed to save enhanced feedback rating' });
      }
    } catch (error) {
      setTestResult({ error: 'Save test failed', details: error });
    } finally {
      setIsLoading(false);
    }
  };

  const testFetchFeedbackRatings = async () => {
    if (!user) {
      setTestResult({ error: 'User not authenticated' });
      return;
    }

    setIsLoading(true);
    setTestResult(null);
    
    try {
      // Test fetching enhanced feedback ratings
      const ratings = await feedbackService.getUserEnhancedFeedbackRatings(user.id);
      
      setTestResult({ 
        success: true, 
        message: `Fetched ${ratings.length} enhanced feedback ratings`,
        data: ratings 
      });
    } catch (error) {
      setTestResult({ error: 'Fetch test failed', details: error });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Feedback System Test</h1>
      
      <div className="space-y-4 mb-6">
        <Button 
          onClick={testSupabaseConnection}
          disabled={isLoading}
          className="mr-4"
        >
          Test Supabase Connection
        </Button>
        
        <Button 
          onClick={testEnhancedFeedbackSave}
          disabled={isLoading || !user}
          className="mr-4"
        >
          Test Enhanced Feedback Save
        </Button>
        
        <Button 
          onClick={testFetchFeedbackRatings}
          disabled={isLoading || !user}
          className="mr-4"
        >
          Test Fetch Feedback Ratings
        </Button>
      </div>

      {!user && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          Please sign in to test feedback saving and fetching.
        </div>
      )}

      {isLoading && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          Testing in progress...
        </div>
      )}

      {testResult && (
        <div className={`border px-4 py-3 rounded mb-4 ${
          testResult.success 
            ? 'bg-green-100 border-green-400 text-green-700'
            : 'bg-red-100 border-red-400 text-red-700'
        }`}>
          <h3 className="font-bold mb-2">Test Result:</h3>
          <p>{testResult.message || testResult.error}</p>
          {testResult.details && (
            <pre className="mt-2 text-sm bg-gray-100 p-2 rounded overflow-auto">
              {JSON.stringify(testResult.details, null, 2)}
            </pre>
          )}
          {testResult.data && (
            <pre className="mt-2 text-sm bg-gray-100 p-2 rounded overflow-auto">
              {JSON.stringify(testResult.data, null, 2)}
            </pre>
          )}
        </div>
      )}

      <div className="bg-gray-100 p-4 rounded">
        <h3 className="font-bold mb-2">Test Information:</h3>
        <p><strong>User:</strong> {user ? user.email : 'Not authenticated'}</p>
        <p><strong>User ID:</strong> {user ? user.id : 'N/A'}</p>
        <p><strong>Supabase URL:</strong> https://dwgolyqevdaqosteonfl.supabase.co</p>
      </div>
    </div>
  );
};

export default FeedbackTest;
