
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, RotateCcw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Language } from '@/pages/Index';
import WasteBin from './WasteBin';
import WasteItem from './WasteItem';
import FeedbackPopup from './FeedbackPopup';
import LogoutButton from './LogoutButton';
import { dataService } from '@/services/dataService';
import { gameService } from '@/services/gameService';
import { useAuth } from '@/hooks/useAuth';

interface GameLevelProps {
  language: Language;
  level: number;
  onLevelComplete: (correct: boolean) => void;
  onBackToHome: () => void;
}

const texts = {
  EN: {
    level: 'Level',
    score: 'Score',
    dragInstruction: 'Drag the item to the correct bin',
    nextLevel: 'Next Level',
    tryAgain: 'Try Again',
    backToHome: 'Back to Home',
    timer: 'Timer'
  },
  DE: {
    level: 'Level',
    score: 'Punkte',
    dragInstruction: 'Ziehe den Gegenstand in die richtige Tonne',
    nextLevel: 'Nächstes Level',
    tryAgain: 'Nochmal Versuchen',
    backToHome: 'Zurück zum Hauptmenü',
    timer: 'Timer'
  }
};

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
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [sortingTimes, setSortingTimes] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);

  const t = texts[language];

  const bins = [
    { 
      id: 'residual', 
      name: language === 'EN' ? 'Residual Waste Bin' : 'Restmüll', 
      color: 'bg-gray-600'
    },
    { 
      id: 'paper', 
      name: language === 'EN' ? 'Paper Bin' : 'Papier', 
      color: 'bg-red-500'
    },
    { 
      id: 'bio', 
      name: language === 'EN' ? 'Bio Bin' : 'Bio', 
      color: 'bg-amber-600'
    },
    { 
      id: 'plastic', 
      name: language === 'EN' ? 'Lightweight Packaging Bin' : 'Leichtverpackung', 
      color: 'bg-yellow-500'
    },
    { 
      id: 'glass', 
      name: language === 'EN' ? 'Waste Glass Container' : 'Altglas', 
      color: 'bg-green-600'
    },
    { 
      id: 'hazardous', 
      name: language === 'EN' ? 'Hazardous Waste Mobile or Collection Points' : 'Sondermüll', 
      color: 'bg-orange-600'
    },
    { 
      id: 'bulky', 
      name: language === 'EN' ? 'Bulky Waste Container' : 'Sperrmüll', 
      color: 'bg-purple-600'
    }
  ];

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
      setTimer(30);
      setIsTimerActive(true);
    }
  }, [currentItem]);

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
      setTimer(30);
      setIsTimerActive(true);
    } else {
      // Level complete
      setTimeout(() => {
        onLevelComplete(true);
        generateLevelItems();
      }, 1000);
    }
  };

  const handleDrop = async (binId: string) => {
    if (!draggedItem || !user || !currentItem) return;

    console.log('Item dropped:', currentItem);
    console.log('Item description:', currentItem.description);

    setIsTimerActive(false);
    const sortTime = startTime ? Date.now() - startTime : 30000;
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

  const timerColor = timer <= 10 ? 'text-red-400' : timer <= 20 ? 'text-yellow-400' : 'text-green-400';

  return (
    <div className="min-h-screen flex flex-col p-4 sm:p-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          onClick={onBackToHome}
          className="p-2 bg-white/20 hover:bg-white/30 rounded-full"
        >
          <ArrowLeft className="w-4 h-4 sm:w-6 sm:h-6" />
        </Button>
        
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold">{t.level} {level}</h1>
          <div className="flex items-center justify-center space-x-4 mt-1">
            <div className="flex items-center space-x-1">
              <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
              <span className="text-sm sm:text-lg font-semibold">{score}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className={`text-sm sm:text-lg font-semibold ${timerColor}`}>{timer}s</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            onClick={resetLevel}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-full"
          >
            <RotateCcw className="w-4 h-4 sm:w-6 sm:h-6" />
          </Button>
          <LogoutButton className="bg-white/20 hover:bg-white/30 text-white" />
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center mb-6 sm:mb-8">
        <p className="text-sm sm:text-base text-blue-100">{t.dragInstruction}</p>
        <p className="text-xs sm:text-sm text-blue-200 mt-1">
          Item {currentItemIndex + 1} of {allItems.length}
        </p>
      </div>

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
      <div className="flex-1 flex flex-col justify-center">
        <div className="space-y-3 sm:space-y-4">
          {/* First row - 4 bins */}
          <div className="flex justify-center gap-2 sm:gap-3">
            {bins.slice(0, 4).map((bin) => (
              <WasteBin
                key={bin.id}
                bin={bin}
                onDrop={handleDrop}
                isDropTarget={true}
              />
            ))}
          </div>
          {/* Second row - 3 bins */}
          <div className="flex justify-center gap-2 sm:gap-3">
            {bins.slice(4, 7).map((bin) => (
              <WasteBin
                key={bin.id}
                bin={bin}
                onDrop={handleDrop}
                isDropTarget={true}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="flex justify-center space-x-2 mb-4">
        {allItems.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
              index < currentItemIndex ? 'bg-green-400' : 
              index === currentItemIndex ? 'bg-blue-400' : 'bg-white/30'
            }`}
          />
        ))}
      </div>

      {/* Feedback Popup */}
      {showFeedback && feedbackData && (
        <FeedbackPopup
          feedback={feedbackData}
          language={language}
          onClose={handleFeedbackClose}
        />
      )}
    </div>
  );
};

export default GameLevel;
