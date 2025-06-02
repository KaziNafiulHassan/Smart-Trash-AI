import React, { useState, useEffect } from 'react';
import { Language } from '@/types/common';
import WasteItem from './WasteItem';
import { 
  FeedbackPopup, 
  LevelUpAnimation, 
  GameHeader, 
  GameTimer, 
  GameInstructions, 
  GameProgress, 
  GameBinsGrid 
} from '@/features/game';
import { dataService } from '@/services/dataService';
import { gameService } from '@/services/gameService';
import { useAuth } from '@/hooks/useAuth';

interface GameLevelProps {
  language: Language;
  level: number;
  onLevelComplete: (correct: boolean) => void;
  onBackToHome: () => void;
}

const GameLevel: React.FC<GameLevelProps> = ({
  language,
  level,
  onLevelComplete,
  onBackToHome
}) => {
  const { user } = useAuth();
  const [allItems, setAllItems] = useState<any[]>([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState<any>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [gameData, setGameData] = useState<any>({ wasteItems: [], binCategories: {} });
  const [timer, setTimer] = useState(30);
  const [initialTimer, setInitialTimer] = useState(30);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [sortingTimes, setSortingTimes] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [showLevelUpAnimation, setShowLevelUpAnimation] = useState(false);
  const [userAchievements, setUserAchievements] = useState<any[]>([]);

  const bins = [
    { 
      id: 'residual', 
      name: language === 'EN' ? 'Residual Waste Bin' : 'Restmüll', 
      color: 'bg-gray-600 dark:bg-gray-800 dark:neon-glow'
    },
    { 
      id: 'paper', 
      name: language === 'EN' ? 'Paper Bin' : 'Papier', 
      color: 'bg-red-500 dark:bg-red-800 dark:neon-glow'
    },
    { 
      id: 'bio', 
      name: language === 'EN' ? 'Bio Bin' : 'Bio', 
      color: 'bg-amber-600 dark:bg-amber-800 dark:neon-glow'
    },
    { 
      id: 'plastic', 
      name: language === 'EN' ? 'Lightweight Packaging Bin' : 'Leichtverpackung', 
      color: 'bg-yellow-500 dark:bg-yellow-700 dark:neon-glow'
    },
    { 
      id: 'glass', 
      name: language === 'EN' ? 'Waste Glass Container' : 'Altglas', 
      color: 'bg-green-600 dark:bg-green-800 dark:neon-glow'
    },
    { 
      id: 'hazardous', 
      name: language === 'EN' ? 'Hazardous Waste Mobile or Collection Points' : 'Sondermüll', 
      color: 'bg-orange-600 dark:bg-orange-800 dark:neon-glow'
    },
    { 
      id: 'bulky', 
      name: language === 'EN' ? 'Bulky Waste Container' : 'Sperrmüll', 
      color: 'bg-purple-600 dark:bg-purple-800 dark:neon-glow'
    }
  ];

  // Calculate timer based on level - progressively decrease timer
  const getTimerForLevel = (currentLevel: number) => {
    // Start with 30 seconds for level 1, decrease by 2 seconds per level, minimum 10 seconds
    const baseTime = 30;
    const decreasePerLevel = 2;
    const minTime = 10;
    
    const calculatedTime = baseTime - ((currentLevel - 1) * decreasePerLevel);
    return Math.max(calculatedTime, minTime);
  };

  useEffect(() => {
    loadGameData();
  }, [language]);

  useEffect(() => {
    if (gameData.wasteItems.length > 0) {
      generateLevelItems();
    }
  }, [level, gameData]);

  useEffect(() => {
    if (currentItem && !startTime) {
      setStartTime(Date.now());
      const levelTimer = getTimerForLevel(level);
      setTimer(levelTimer);
      setInitialTimer(levelTimer);
      setIsTimerActive(true);
    }
  }, [currentItem, level]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            setIsTimerActive(false);
            handleTimeOut();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timer]);

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
    // Handle timeout scenario
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
      setStartTime(Date.now());
      const levelTimer = getTimerForLevel(level);
      setTimer(levelTimer);
      setInitialTimer(levelTimer);
      setIsTimerActive(true);
    } else {
      // Level complete - show level up animation
      setShowLevelUpAnimation(true);
      loadUserAchievements();
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

  const handleDrop = async (binId: string) => {
    if (!draggedItem || !user || !currentItem) return;

    console.log('Item dropped:', currentItem);
    console.log('Item description:', currentItem.description);

    setIsTimerActive(false);
    const sortTime = startTime ? Date.now() - startTime : getTimerForLevel(level) * 1000;
    setSortingTimes(prev => [...prev, sortTime]);

    const bin = bins.find(b => b.id === binId);
    const isCorrect = currentItem.bin_type === binId;

    setAttempts(prev => prev + 1);

    // Generate AI feedback using the description
    let feedbackMessage = '';
    try {
      const { feedbackService } = await import('@/services/feedbackService');
      
      // Ensure we have the description in the correct language
      const itemDescription = currentItem.description || '';
      console.log('Using item description for feedback:', itemDescription);
      
      feedbackMessage = await feedbackService.generateFeedback({
        itemName: currentItem.item_name,
        itemDescription: itemDescription,
        selectedBin: bin?.name || '',
        correctBin: bins.find(b => b.id === currentItem.bin_type)?.name || '',
        isCorrect,
        language
      });
      
      console.log('Generated feedback message:', feedbackMessage);
    } catch (error) {
      console.error('Error generating feedback:', error);
      // Enhanced fallback that always includes description
      const itemDescription = currentItem.description || '';
      feedbackMessage = isCorrect 
        ? (language === 'EN' 
          ? `Correct! ${currentItem.item_name} belongs in the ${bin?.name}. ${itemDescription ? `Info: ${itemDescription}` : ''}`
          : `Richtig! ${currentItem.item_name} gehört in die ${bin?.name}. ${itemDescription ? `Info: ${itemDescription}` : ''}`)
        : (language === 'EN'
          ? `Oops! ${currentItem.item_name} doesn't belong in the ${bin?.name}. It should go in the ${bins.find(b => b.id === currentItem.bin_type)?.name}. ${itemDescription ? `Remember: ${itemDescription}` : ''}`
          : `Ups! ${currentItem.item_name} gehört nicht in die ${bin?.name}. Es sollte in die ${bins.find(b => b.id === currentItem.bin_type)?.name}. ${itemDescription ? `Denk daran: ${itemDescription}` : ''}`);
    }

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
    setStartTime(null);
  };

  const handleFeedbackClose = () => {
    setShowFeedback(false);
    moveToNextItem();
  };

  const resetLevel = () => {
    generateLevelItems();
    setIsTimerActive(false);
    setStartTime(null);
  };

  return (
    <div className="min-h-screen flex flex-col p-4 sm:p-6 text-white dark:bg-gradient-to-br dark:from-gray-900 dark:to-purple-900">
      {/* Header */}
      <GameHeader
        language={language}
        level={level}
        score={score}
        onBackToHome={onBackToHome}
        onResetLevel={resetLevel}
      />

      {/* Timer Bar */}
      <GameTimer
        language={language}
        timer={timer}
        initialTimer={initialTimer}
      />

      {/* Instructions */}
      <GameInstructions
        language={language}
        currentItemIndex={currentItemIndex}
        totalItems={allItems.length}
      />

      {/* Current Item */}
      {currentItem && (
        <div className="flex justify-center mb-8 sm:mb-12">
          <WasteItem
            key={currentItem.id}
            item={currentItem}
            onDragStart={setDraggedItem}
            isDraggable={true}
            isCompleted={false}
          />
        </div>
      )}

      {/* Bins */}
      <GameBinsGrid
        language={language}
        onDrop={handleDrop}
      />

      {/* Progress */}
      <GameProgress
        allItems={allItems}
        currentItemIndex={currentItemIndex}
      />

      {/* Feedback Popup */}
      {showFeedback && feedbackData && (
        <FeedbackPopup
          feedback={feedbackData}
          language={language}
          onClose={handleFeedbackClose}
        />
      )}

      {/* Level Up Animation */}
      {showLevelUpAnimation && (
        <LevelUpAnimation
          language={language}
          level={level}
          score={score}
          achievements={userAchievements}
          onComplete={handleLevelUpAnimationComplete}
        />
      )}
    </div>
  );
};

export default GameLevel;
