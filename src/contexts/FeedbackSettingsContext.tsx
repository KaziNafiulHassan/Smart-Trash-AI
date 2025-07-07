import React, { createContext, useContext, useState, useEffect } from 'react';

export type FeedbackType = 'ai' | 'waste-info';

interface FeedbackSettingsContextType {
  feedbackType: FeedbackType;
  setFeedbackType: (type: FeedbackType) => void;
}

const FeedbackSettingsContext = createContext<FeedbackSettingsContextType | undefined>(undefined);

export const useFeedbackSettings = () => {
  const context = useContext(FeedbackSettingsContext);
  if (context === undefined) {
    throw new Error('useFeedbackSettings must be used within a FeedbackSettingsProvider');
  }
  return context;
};

interface FeedbackSettingsProviderProps {
  children: React.ReactNode;
}

export const FeedbackSettingsProvider: React.FC<FeedbackSettingsProviderProps> = ({ children }) => {
  const [feedbackType, setFeedbackTypeState] = useState<FeedbackType>(() => {
    // Restore feedback type from localStorage, default to 'ai'
    if (typeof window !== 'undefined') {
      const savedType = localStorage.getItem('ecoSort_feedbackType');
      return (savedType as FeedbackType) || 'ai';
    }
    return 'ai';
  });

  // Save feedback type to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ecoSort_feedbackType', feedbackType);
    }
  }, [feedbackType]);

  const setFeedbackType = (type: FeedbackType) => {
    setFeedbackTypeState(type);
    console.log('FeedbackSettings: Changed feedback type to:', type);
  };

  const value = {
    feedbackType,
    setFeedbackType
  };

  return (
    <FeedbackSettingsContext.Provider value={value}>
      {children}
    </FeedbackSettingsContext.Provider>
  );
};

export const FEEDBACK_TYPE_OPTIONS = [
  {
    id: 'ai' as FeedbackType,
    name: 'AI Feedback',
    description: 'Get personalized AI-powered explanations and tips'
  },
  {
    id: 'waste-info' as FeedbackType,
    name: 'Waste Information',
    description: 'View detailed waste sorting information from database'
  }
] as const;
