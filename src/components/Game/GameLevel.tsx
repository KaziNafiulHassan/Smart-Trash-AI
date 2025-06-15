
import React from 'react';
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
import { useAuth } from '@/hooks/useAuth';
import { useGameLogic } from './useGameLogic';
import { useGameTimer } from './useGameTimer';

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
  
  const {
    allItems,
    currentItemIndex,
    currentItem,
    score,
    showFeedback,
    feedbackData,
    draggedItem,
    showLevelUpAnimation,
    userAchievements,
    setDraggedItem,
    handleTimeOut,
    handleDrop,
    handleFeedbackClose,
    handleLevelUpAnimationComplete,
    resetLevel
  } = useGameLogic({
    language,
    level,
    user,
    onLevelComplete
  });

  const {
    timer,
    initialTimer,
    startTime,
    resetTimer,
    startNewTimer
  } = useGameTimer({
    level,
    currentItem,
    isTimerActive: true,
    setIsTimerActive: () => {},
    onTimeOut: handleTimeOut
  });

  const handleDropWithTimer = async (binId: string) => {
    const result = await handleDrop(binId, startTime);
    resetTimer();
    return result;
  };

  const handleResetLevel = () => {
    resetLevel();
    resetTimer();
  };

  const handleFeedbackCloseWithTimer = () => {
    handleFeedbackClose();
    startNewTimer();
  };

  return (
    <div className="min-h-screen flex flex-col p-4 sm:p-6 text-white dark:bg-gradient-to-br dark:from-gray-900 dark:to-purple-900">
      {/* Header */}
      <GameHeader
        language={language}
        level={level}
        score={score}
        onBackToHome={onBackToHome}
        onResetLevel={handleResetLevel}
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
        onDrop={handleDropWithTimer}
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
          onClose={handleFeedbackCloseWithTimer}
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
