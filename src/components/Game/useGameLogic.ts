
import { useState, useEffect } from 'react';
import { Language } from '@/types/common';
import { dataService } from '@/services/dataService';
import { gameService } from '@/services/gameService';
import { getBinsForLanguage, generateFeedbackMessage } from './gameUtils';

interface UseGameLogicProps {
  language: Language;
  level: number;
  user: any;
  onLevelComplete: (correct: boolean) => void;
}

export const useGameLogic = ({
  language,
  level,
  user,
  onLevelComplete
}: UseGameLogicProps) => {
  const [allItems, setAllItems] = useState<any[]>([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState<any>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [gameData, setGameData] = useState<any>({ wasteItems: [], binCategories: {} });
  const [sortingTimes, setSortingTimes] = useState<number[]>([]);
  const [showLevelUpAnimation, setShowLevelUpAnimation] = useState(false);
  const [userAchievements, setUserAchievements] = useState<any[]>([]);

  const bins = getBinsForLanguage(language);

  useEffect(() => {
    loadGameData();
  }, [language]);

  useEffect(() => {
    if (gameData.wasteItems.length > 0) {
      generateLevelItems();
    }
  }, [level, gameData]);

  const loadGameData = async () => {
    const data = await dataService.getGameData(language);
    setGameData(data);
  };

  const generateLevelItems = () => {
    if (gameData.wasteItems.length === 0) return;
    
    const shuffled = [...gameData.wasteItems].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);
    setAllItems(selected);
    setCurrentItemIndex(0);
    setCurrentItem(selected[0]);
    setScore(0);
    setAttempts(0);
    setSortingTimes([]);
  };

  const handleTimeOut = () => {
    const feedbackMessage = language === 'EN' 
      ? 'Time\'s up! Try to be faster next time.'
      : 'Zeit abgelaufen! Versuche beim nächsten Mal schneller zu sein.';
    
    const feedback = {
      correct: false,
      item: currentItem,
      bin: bins[0],
      message: feedbackMessage
    };

    setFeedbackData(feedback);
    setShowFeedback(true);
    setAttempts(prev => prev + 1);
  };

  const moveToNextItem = () => {
    const nextIndex = currentItemIndex + 1;
    if (nextIndex < allItems.length) {
      setCurrentItemIndex(nextIndex);
      setCurrentItem(allItems[nextIndex]);
      return true; // Has next item
    } else {
      // Level complete - show level up animation
      setShowLevelUpAnimation(true);
      loadUserAchievements();
      return false; // No more items
    }
  };

  const loadUserAchievements = async () => {
    if (!user) return;
    
    try {
      const achievements = await gameService.getUserAchievements(user.id);
      setUserAchievements(achievements);
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  };

  const handleLevelUpAnimationComplete = () => {
    setShowLevelUpAnimation(false);
    setTimeout(() => {
      onLevelComplete(true);
      generateLevelItems();
    }, 500);
  };

  const handleDrop = async (binId: string, startTime: number | null) => {
    if (!draggedItem || !user || !currentItem) return;

    console.log('Item dropped:', currentItem);
    console.log('Item description:', currentItem.description);

    const sortTime = startTime ? Date.now() - startTime : 30000;
    setSortingTimes(prev => [...prev, sortTime]);

    const bin = bins.find(b => b.id === binId);
    const isCorrect = currentItem.bin_type === binId;

    setAttempts(prev => prev + 1);

    // Generate feedback using the description directly
    const itemDescription = currentItem.description || '';
    console.log('Using item description for feedback:', itemDescription);
    
    const feedbackMessage = generateFeedbackMessage(
      isCorrect,
      currentItem.item_name,
      itemDescription,
      bin?.name || '',
      bins.find(b => b.id === currentItem.bin_type)?.name || '',
      language
    );
    
    console.log('Generated feedback message:', feedbackMessage);

    const feedback = {
      correct: isCorrect,
      item: currentItem,
      bin: bin,
      message: feedbackMessage
    };

    setFeedbackData(feedback);
    setShowFeedback(true);

    if (isCorrect) {
      setScore(prev => prev + 10);
    }

    // Save game session data with timing
    try {
      const avgSortTime = sortingTimes.length > 0 ? 
        sortingTimes.reduce((a, b) => a + b, 0) / sortingTimes.length : sortTime;
      
      await gameService.saveGameSession(user.id, {
        level,
        score: isCorrect ? score + 10 : score,
        items_sorted: attempts + 1,
        correct_sorts: isCorrect ? 1 : 0,
        accuracy: isCorrect ? 100 : 0,
        time_spent: Math.round(avgSortTime / 1000)
      });
    } catch (error) {
      console.error('Error saving game session:', error);
    }

    setDraggedItem(null);
    return isCorrect;
  };

  const handleFeedbackClose = () => {
    setShowFeedback(false);
    moveToNextItem();
  };

  const resetLevel = () => {
    generateLevelItems();
  };

  return {
    allItems,
    currentItemIndex,
    currentItem,
    score,
    attempts,
    showFeedback,
    feedbackData,
    draggedItem,
    showLevelUpAnimation,
    userAchievements,
    bins,
    setDraggedItem,
    handleTimeOut,
    handleDrop,
    handleFeedbackClose,
    handleLevelUpAnimationComplete,
    resetLevel,
    moveToNextItem
  };
};
