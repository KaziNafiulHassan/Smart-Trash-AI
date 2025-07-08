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
import { gameSoundService } from '@/services/gameSoundService';
import { useAuth } from '@/hooks/useAuth';
import SettingsPanel from './SettingsPanel';
import GameAnimation from '@/components/Game/GameAnimations';

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
  const [usedItemIds, setUsedItemIds] = useState<Set<string>>(new Set());
  const [sessionId] = useState<string>(() => {
    // Try to restore session ID from localStorage, or create new one
    const savedSessionId = localStorage.getItem('ecoSort_gameSessionId');
    return savedSessionId || crypto.randomUUID();
  });
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [showSoundSettings, setShowSoundSettings] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationType, setAnimationType] = useState<'correct' | 'incorrect'>('correct');
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [wasTimerActiveBeforeSettings, setWasTimerActiveBeforeSettings] = useState(false);
  const [sortingTimes, setSortingTimes] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [showLevelUpAnimation, setShowLevelUpAnimation] = useState(false);
  const [userAchievements, setUserAchievements] = useState<any[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

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
    // Initialize audio context and play game start sound
    gameSoundService.resumeAudioContext().then(() => {
      gameSoundService.playSound('game-start');
    });
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
          // Play warning sound when timer is low
          if (prev === 6) {
            gameSoundService.playSound('timer-warning');
          } else if (prev <= 3) {
            gameSoundService.playSound('timer-tick');
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timer]);

  // Handle timer pausing when settings panel or sound settings opens/closes
  useEffect(() => {
    const anySettingsOpen = showSettingsPanel || showSoundSettings;

    if (anySettingsOpen) {
      // Settings opened - pause timer if it was active
      if (isTimerActive && !wasTimerActiveBeforeSettings) {
        setWasTimerActiveBeforeSettings(true);
        setIsTimerActive(false);
        console.log('Game: Settings opened, timer paused');
      }
    } else {
      // All settings closed - resume timer if it was active before
      if (wasTimerActiveBeforeSettings && timer > 0) {
        setIsTimerActive(true);
        setWasTimerActiveBeforeSettings(false);
        console.log('Game: Settings closed, timer resumed');
      }
    }
  }, [showSettingsPanel, showSoundSettings, isTimerActive, wasTimerActiveBeforeSettings]);

  // Save game state to localStorage
  useEffect(() => {
    if (currentItem && allItems.length > 0) {
      const gameState = {
        sessionId,
        level,
        score,
        attempts,
        currentItemIndex,
        timer,
        initialTimer,
        allItems: allItems.map(item => item.id), // Only save IDs to reduce storage
        usedItemIds: Array.from(usedItemIds),
        timestamp: Date.now()
      };
      localStorage.setItem('ecoSort_gameState', JSON.stringify(gameState));
    }
  }, [sessionId, level, score, attempts, currentItemIndex, timer, initialTimer, allItems, usedItemIds, currentItem]);

  // Restore game state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('ecoSort_gameState');
    if (savedState && gameData.wasteItems.length > 0) {
      try {
        const gameState = JSON.parse(savedState);

        // Only restore if it's recent (within 1 hour) and for the same level
        const isRecent = Date.now() - gameState.timestamp < 3600000; // 1 hour
        const isSameLevel = gameState.level === level;

        if (isRecent && isSameLevel && gameState.allItems) {
          // Restore items from IDs
          const restoredItems = gameState.allItems
            .map((id: string) => gameData.wasteItems.find((item: any) => item.id === id))
            .filter(Boolean);

          if (restoredItems.length > 0) {
            setAllItems(restoredItems);
            setCurrentItemIndex(gameState.currentItemIndex || 0);
            setCurrentItem(restoredItems[gameState.currentItemIndex || 0]);
            setScore(gameState.score || 0);
            setAttempts(gameState.attempts || 0);
            setTimer(gameState.timer || getTimerForLevel(level));
            setInitialTimer(gameState.initialTimer || getTimerForLevel(level));
            setUsedItemIds(new Set(gameState.usedItemIds || []));

            console.log('GameLevel: Restored game state from localStorage', {
              level: gameState.level,
              score: gameState.score,
              currentItemIndex: gameState.currentItemIndex,
              sessionId: gameState.sessionId
            });
            return; // Skip generating new items
          }
        }
      } catch (error) {
        console.warn('GameLevel: Failed to restore game state:', error);
      }
    }

    // Generate new items if no valid saved state
    generateLevelItems();
  }, [gameData.wasteItems, level]);

  // Save session ID to localStorage
  useEffect(() => {
    localStorage.setItem('ecoSort_gameSessionId', sessionId);
  }, [sessionId]);

  const loadGameData = async () => {
    const data = await dataService.getGameData(language);
    setGameData(data);
  };

  const generateLevelItems = () => {
    if (gameData.wasteItems.length === 0) return;

    // Filter out already used items for this session
    const availableItems = gameData.wasteItems.filter(item => !usedItemIds.has(item.id));

    // If we've used all items, reset the used items set (allow reuse but with better shuffling)
    const itemsToUse = availableItems.length >= 5 ? availableItems : gameData.wasteItems;

    // Use Fisher-Yates shuffle for better randomization
    const shuffled = [...itemsToUse];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const selected = shuffled.slice(0, 5);

    // Track used items for this session
    const newUsedIds = new Set(usedItemIds);
    selected.forEach(item => newUsedIds.add(item.id));
    setUsedItemIds(newUsedIds);

    setAllItems(selected);
    setCurrentItemIndex(0);
    setCurrentItem(selected[0]);
    setScore(0);
    setAttempts(0);
    setSortingTimes([]);

    console.log(`GameLevel: Generated ${selected.length} unique items for session ${sessionId}`, {
      selectedIds: selected.map(item => item.id),
      totalUsedInSession: newUsedIds.size,
      availableItems: availableItems.length
    });
  };

  const handleTimeOut = () => {
    // Handle timeout scenario - AI Assistant and Waste Information will provide the feedback
    const feedback = {
      correct: false,
      item: currentItem,
      bin: bins[0],
      message: '' // No longer using Supabase-based feedback message
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
      gameSoundService.playSound('level-complete');
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

    // Play drop sound effect
    gameSoundService.playSound(isCorrect ? 'drop-correct' : 'drop-incorrect');

    // Show animation first
    setAnimationType(isCorrect ? 'correct' : 'incorrect');
    setShowAnimation(true);

    // Delay feedback popup to show after animation
    setTimeout(() => {
      // Create minimal feedback data - AI Assistant and Waste Information will provide the feedback
      const feedback = {
        correct: isCorrect,
        item: currentItem,
        bin: bin,
        message: '' // No longer using Supabase-based feedback message
      };

      setFeedbackData(feedback);
      setShowFeedback(true);
    }, 2000); // Show feedback after animation completes

    if (isCorrect) {
      setScore(prev => prev + 10);
    }

    // Save game session data with timing
    try {
      const avgSortTime = sortingTimes.length > 0 ?
        sortingTimes.reduce((a, b) => a + b, 0) / sortingTimes.length : sortTime;

      const sessionId = await gameService.saveGameSession(user.id, {
        level,
        score: isCorrect ? score + 10 : score,
        items_sorted: attempts + 1,
        correct_sorts: isCorrect ? 1 : 0,
        accuracy: isCorrect ? 100 : 0,
        time_spent: Math.round(avgSortTime / 1000)
      });

      if (sessionId) {
        setCurrentSessionId(sessionId);
        console.log('Game session saved with ID:', sessionId);
      }
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

  const handleSoundSettingsChange = (isOpen: boolean) => {
    setShowSoundSettings(isOpen);
  };

  const resetLevel = () => {
    // Clear saved game state
    localStorage.removeItem('ecoSort_gameState');

    // Reset used items tracking for a fresh start
    setUsedItemIds(new Set());
    generateLevelItems();
    setTimer(getTimerForLevel(level));
    setInitialTimer(getTimerForLevel(level));
    setIsTimerActive(false);
    setStartTime(null);
    console.log(`GameLevel: Reset level ${level} with fresh item pool for session ${sessionId}`);
  };

  const handleBackToHome = () => {
    // Clear saved game state when going back to home
    localStorage.removeItem('ecoSort_gameState');
    onBackToHome();
  };

  const handleAnimationEnd = () => {
    setShowAnimation(false);
  };

  return (
    <div className="min-h-screen flex flex-col p-4 sm:p-6 text-white dark:bg-gradient-to-br dark:from-gray-900 dark:to-purple-900">
      {/* Header */}
      <GameHeader
        language={language}
        level={level}
        score={score}
        onBackToHome={handleBackToHome}
        onResetLevel={resetLevel}
        onOpenSettings={() => setShowSettingsPanel(true)}
        onSoundSettingsChange={handleSoundSettingsChange}
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
          sessionId={currentSessionId}
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

      {/* Game Animation */}
      <GameAnimation
        type={animationType}
        isVisible={showAnimation}
        onAnimationEnd={handleAnimationEnd}
      />

      {/* Settings Panel */}
      <SettingsPanel
        language={language}
        isOpen={showSettingsPanel}
        onClose={() => setShowSettingsPanel(false)}
      />
    </div>
  );
};

export default GameLevel;
