
import React, { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Language } from '@/types/common';
import { useAuth } from '@/hooks/useAuth';
import { useModelSettings } from '@/contexts/ModelSettingsContext';
import { useFeedbackSettings } from '@/contexts/FeedbackSettingsContext';
import GraphBox from '@/components/Game/GraphBox';
import StructuredFeedbackBox from '@/components/Game/StructuredFeedbackBox';
import { neo4jService } from '@/services/neo4jService';
import { ragLLMService } from '@/services/ragLLMService';
import { feedbackService } from '@/services/feedbackService';
import { gameSoundService } from '@/services/gameSoundService';

interface FeedbackPopupProps {
  feedback: {
    correct: boolean;
    item: any;
    bin: any;
    message: string;
  };
  language: Language;
  sessionId?: string;
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

const FeedbackPopup: React.FC<FeedbackPopupProps> = ({ feedback, language, sessionId, onClose }) => {
  const { user } = useAuth();
  const { selectedModel } = useModelSettings();
  const { feedbackType } = useFeedbackSettings();
  const t = texts[language];
  const [graphData, setGraphData] = useState<any>(null);
  const [ragMessage, setRagMessage] = useState<string>('');
  const [structuredFeedback, setStructuredFeedback] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const currentSessionId = sessionId || crypto.randomUUID();

  // Rating state management - single state since only one feedback type is shown
  const [currentRatings, setCurrentRatings] = useState<{
    clarity: number | null;
    helpfulness: number | null;
  }>({ clarity: null, helpfulness: null });

  // No longer using Supabase-based feedback messages - only AI Assistant and Waste Information

  useEffect(() => {
    // Play popup open sound and feedback sound
    gameSoundService.playSound('popup-open');
    gameSoundService.playSound(feedback.correct ? 'feedback-positive' : 'feedback-negative');

    loadAdditionalData();
  }, [feedback.item, feedback.bin, feedbackType, selectedModel]);

  const loadAdditionalData = async () => {
    setIsLoading(true);
    try {
      console.log('FeedbackPopup: Loading data for feedback type:', feedbackType);

      // Load graph data from Neo4j service
      console.log('FeedbackPopup: Loading Neo4j data...');
      const graphInfo = await neo4jService.getWasteItemInfo(
        feedback.bin?.id || 'residual',
        feedback.item?.item_name || ''
      );
      setGraphData(graphInfo);
      console.log('FeedbackPopup: Neo4j data loaded successfully');

      // Only load RAG message if AI feedback is selected
      if (feedbackType === 'ai') {
        console.log('FeedbackPopup: Loading RAG feedback with model:', selectedModel);
        const ragResponse = await ragLLMService.generateFeedback(
          feedback.bin?.id || 'residual',
          feedback.item?.item_name || '',
          language,
          selectedModel
        );
        setRagMessage(ragResponse.message);
        setStructuredFeedback(ragResponse.structured);
        console.log('FeedbackPopup: RAG feedback loaded successfully', {
          hasStructured: !!ragResponse.structured,
          message: ragResponse.message
        });
      } else {
        // Clear AI feedback when not selected
        setRagMessage('');
        setStructuredFeedback(null);
        console.log('FeedbackPopup: Skipped RAG feedback (waste-info mode)');
      }
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

  // Save rating for the currently selected feedback type
  const saveCurrentFeedbackRating = async (
    clarityRating: number,
    helpfulnessRating: number
  ) => {
    if (!user) return;

    try {
      // Only include fields that exist in the feedback_ratings table
      const ratingData = {
        user_id: user.id,
        feedback_type: feedbackType, // 'ai' or 'waste-info'
        clarity_rating: clarityRating,
        helpfulness_rating: helpfulnessRating,
        session_id: currentSessionId,
        item_id: feedback.item?.id || feedback.item?.item_name,
        ...(feedbackType === 'ai' && {
          model_used: selectedModel,
          generated_text: structuredFeedback ? JSON.stringify(structuredFeedback) : ragMessage
        }),
        ...(feedbackType === 'waste-info' && {
          generated_text: JSON.stringify(graphData)
        })
      };

      console.log('Saving rating for feedback type:', feedbackType, ratingData);
      const success = await feedbackService.saveEnhancedFeedbackRating(ratingData);

      if (success) {
        console.log(`${feedbackType} feedback rating saved successfully`);
      } else {
        console.error(`Failed to save ${feedbackType} feedback rating`);
      }
    } catch (error) {
      console.error(`Error saving ${feedbackType} feedback rating:`, error);
    }
  };

  const handleClarityRating = (rating: number) => {
    setCurrentRatings(prev => ({ ...prev, clarity: rating }));
  };

  const handleHelpfulnessRating = (rating: number) => {
    setCurrentRatings(prev => ({ ...prev, helpfulness: rating }));
  };

  // Save ratings when popup closes
  const handleClose = async () => {
    // Play popup close sound
    gameSoundService.playSound('popup-close');

    // Save current feedback ratings if both are provided
    if (currentRatings.clarity !== null && currentRatings.helpfulness !== null) {
      await saveCurrentFeedbackRating(currentRatings.clarity, currentRatings.helpfulness);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 max-w-lg sm:max-w-2xl lg:max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
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
        <div className="mb-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{t.loading}</p>
            </div>
          ) : (
            <div className="w-full">
              {/* Show AI Feedback when selected */}
              {feedbackType === 'ai' && (structuredFeedback || ragMessage) && (
                <div className="w-full">
                  <StructuredFeedbackBox
                    structuredFeedback={structuredFeedback}
                    fallbackMessage={ragMessage}
                    language={language}
                    onClarityRating={handleClarityRating}
                    onHelpfulnessRating={handleHelpfulnessRating}
                  />
                </div>
              )}

              {/* Show Waste Information when selected */}
              {feedbackType === 'waste-info' && graphData && (
                <div className="w-full">
                  <GraphBox
                    data={graphData}
                    language={language}
                    onClarityRating={handleClarityRating}
                    onHelpfulnessRating={handleHelpfulnessRating}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <Button
          onClick={handleClose}
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
