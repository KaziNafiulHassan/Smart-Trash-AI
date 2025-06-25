
import React, { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Language } from '@/types/common';
import { useAuth } from '@/hooks/useAuth';
import { useModelSettings } from '@/contexts/ModelSettingsContext';
import GraphBox from '@/components/Game/GraphBox';
import GraphRAGBox from '@/components/Game/GraphRAGBox';
import { neo4jService } from '@/services/neo4jService';
import { ragLLMService } from '@/services/ragLLMService';
import { feedbackService } from '@/services/feedbackService';

interface FeedbackPopupProps {
  feedback: {
    correct: boolean;
    item: any;
    bin: any;
    message: string;
  };
  language: Language;
  onClose: () => void;
}

const texts = {
  EN: {
    great: 'Great Job!',
    oops: 'Oops!',
    continue: 'Continue',
    loading: 'Loading additional information...'
  },
  DE: {
    great: 'Toll gemacht!',
    oops: 'Ups!',
    continue: 'Weiter',
    loading: 'Lade zusätzliche Informationen...'
  }
};

const FeedbackPopup: React.FC<FeedbackPopupProps> = ({ feedback, language, onClose }) => {
  const { user } = useAuth();
  const { selectedModel } = useModelSettings();
  const t = texts[language];
  const [graphData, setGraphData] = useState<any>(null);
  const [ragMessage, setRagMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // No longer using Supabase-based feedback messages - only AI Assistant and Waste Information

  useEffect(() => {
    loadAdditionalData();
  }, [feedback.item, feedback.bin]);

  const loadAdditionalData = async () => {
    setIsLoading(true);
    try {
      // Load graph data from Neo4j service
      console.log('FeedbackPopup: Loading Neo4j data...');
      const graphInfo = await neo4jService.getWasteItemInfo(
        feedback.bin?.id || 'residual',
        feedback.item?.item_name || ''
      );
      setGraphData(graphInfo);
      console.log('FeedbackPopup: Neo4j data loaded successfully');

      // Load RAG message from LLM service
      console.log('FeedbackPopup: Loading RAG feedback with model:', selectedModel);
      const ragResponse = await ragLLMService.generateFeedback(
        feedback.bin?.id || 'residual',
        feedback.item?.item_name || '',
        language,
        selectedModel
      );
      setRagMessage(ragResponse.message);
      console.log('FeedbackPopup: RAG feedback loaded successfully');
    } catch (error) {
      console.error('FeedbackPopup: Error loading additional data:', error);
      // Set error messages for display
      if (error.message.includes('Neo4j')) {
        setGraphData({
          correctBin: 'Connection Error',
          category: 'Database Error',
          material: 'Unable to connect to Neo4j database',
          rule: 'Please check your internet connection and try again',
          recyclingCenter: 'Service temporarily unavailable'
        });
      }
      if (error.message.includes('AI feedback')) {
        setRagMessage('Sorry, the AI assistant is temporarily unavailable. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGraphClarityRating = async (rating: number) => {
    if (!user) return;

    try {
      await feedbackService.saveEnhancedFeedbackRating({
        user_id: user.id,
        feedback_type: 'graph',
        clarity_rating: rating,
        helpfulness_rating: 0, // Will be updated when helpfulness is rated
        generated_text: JSON.stringify(graphData),
        item_id: feedback.item?.id
      });
    } catch (error) {
      console.error('Error saving graph clarity rating:', error);
    }
  };

  const handleGraphHelpfulnessRating = async (rating: number) => {
    if (!user) return;

    try {
      await feedbackService.saveEnhancedFeedbackRating({
        user_id: user.id,
        feedback_type: 'graph',
        clarity_rating: 0, // Will be updated when clarity is rated
        helpfulness_rating: rating,
        generated_text: JSON.stringify(graphData),
        item_id: feedback.item?.id
      });
    } catch (error) {
      console.error('Error saving graph helpfulness rating:', error);
    }
  };

  const handleRAGClarityRating = async (rating: number) => {
    if (!user) return;

    try {
      await feedbackService.saveEnhancedFeedbackRating({
        user_id: user.id,
        feedback_type: 'graphrag',
        clarity_rating: rating,
        helpfulness_rating: 0, // Will be updated when helpfulness is rated
        model_used: selectedModel,
        generated_text: ragMessage,
        item_id: feedback.item?.id
      });
    } catch (error) {
      console.error('Error saving RAG clarity rating:', error);
    }
  };

  const handleRAGHelpfulnessRating = async (rating: number) => {
    if (!user) return;

    try {
      await feedbackService.saveEnhancedFeedbackRating({
        user_id: user.id,
        feedback_type: 'graphrag',
        clarity_rating: 0, // Will be updated when clarity is rated
        helpfulness_rating: rating,
        model_used: selectedModel,
        generated_text: ragMessage,
        item_id: feedback.item?.id
      });
    } catch (error) {
      console.error('Error saving RAG helpfulness rating:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
        <div className="text-center mb-6">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
            feedback.correct ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
          }`}>
            {feedback.correct ? (
              <CheckCircle className="w-8 h-8 text-green-500" />
            ) : (
              <XCircle className="w-8 h-8 text-red-500" />
            )}
          </div>
          
          <h2 className={`text-2xl font-bold mb-2 ${
            feedback.correct ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {feedback.correct ? t.great : t.oops}
          </h2>
          
          {/* Visual indicator showing item and bin selection */}
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-gray-700">
              {feedback.item.image_url ? (
                <img
                  src={feedback.item.image_url}
                  alt={feedback.item.item_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl">📦</span>
              )}
            </div>
            <span className="text-2xl dark:text-gray-300">→</span>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${feedback.bin.color}`}>
              <span className="text-white text-xl">🗑️</span>
            </div>
          </div>
        </div>

        {/* Additional Information Boxes */}
        <div className="space-y-4 mb-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{t.loading}</p>
            </div>
          ) : (
            <>
              {/* GraphRAG Box - AI Assistant (now appears first) */}
              {ragMessage && (
                <GraphRAGBox
                  message={ragMessage}
                  language={language}
                  onClarityRating={handleRAGClarityRating}
                  onHelpfulnessRating={handleRAGHelpfulnessRating}
                />
              )}

              {/* Graph Box - Waste Information (now appears second) */}
              {graphData && (
                <GraphBox
                  data={graphData}
                  language={language}
                  onClarityRating={handleGraphClarityRating}
                  onHelpfulnessRating={handleGraphHelpfulnessRating}
                />
              )}
            </>
          )}
        </div>

        <Button
          onClick={onClose}
          className={`w-full py-3 text-lg font-semibold rounded-xl transition-all duration-200 ${
            feedback.correct 
              ? 'bg-green-500 hover:bg-green-600 text-white' 
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
        >
          {t.continue}
        </Button>
      </div>
    </div>
  );
};

export default FeedbackPopup;
