import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Language } from '@/pages/Index';
import WasteBin from './WasteBin';
import WasteItem from './WasteItem';
import FeedbackPopup from './FeedbackPopup';
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
    dragInstruction: 'Drag items to the correct bins',
    nextLevel: 'Next Level',
    tryAgain: 'Try Again',
    backToHome: 'Back to Home'
  },
  DE: {
    level: 'Level',
    score: 'Punkte',
    dragInstruction: 'Ziehe Gegenstände in die richtigen Tonnen',
    nextLevel: 'Nächstes Level',
    tryAgain: 'Nochmal Versuchen',
    backToHome: 'Zurück zum Hauptmenü'
  }
};

const GameLevel: React.FC<GameLevelProps> = ({
  language,
  level,
  onLevelComplete,
  onBackToHome
}) => {
  const { user } = useAuth();
  const [currentItems, setCurrentItems] = useState<any[]>([]);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState<any>(null);
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [gameData, setGameData] = useState<any>({ wasteItems: [], binCategories: {} });

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
      color: 'bg-blue-500'
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
      color: 'bg-red-600'
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

  const loadGameData = async () => {
    const data = await dataService.getGameData(language);
    setGameData(data);
  };

  const generateLevelItems = () => {
    if (gameData.wasteItems.length === 0) return;
    
    const shuffled = [...gameData.wasteItems].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);
    setCurrentItems(selected);
    setCompletedItems(new Set());
    setScore(0);
    setAttempts(0);
  };

  const handleDrop = async (binId: string) => {
    if (!draggedItem || !user) return;

    const item = currentItems.find(i => i.id === draggedItem);
    if (!item) return;

    const bin = bins.find(b => b.id === binId);
    const isCorrect = item.bin_type === binId;

    setAttempts(prev => prev + 1);

    // Generate AI feedback using the description
    let feedbackMessage = '';
    try {
      const { feedbackService } = await import('@/services/feedbackService');
      feedbackMessage = await feedbackService.generateFeedback({
        itemName: item.item_name,
        itemDescription: item.description || '',
        selectedBin: bin?.name || '',
        correctBin: bins.find(b => b.id === item.bin_type)?.name || '',
        isCorrect,
        language
      });
    } catch (error) {
      console.error('Error generating feedback:', error);
      feedbackMessage = isCorrect 
        ? (language === 'EN' 
          ? `Correct! ${item.item_name} belongs in the ${bin?.name}.`
          : `Richtig! ${item.item_name} gehört in die ${bin?.name}.`)
        : (language === 'EN'
          ? `Oops! ${item.item_name} doesn't belong in the ${bin?.name}.`
          : `Ups! ${item.item_name} gehört nicht in die ${bin?.name}.`);
    }

    const feedback = {
      correct: isCorrect,
      item: item,
      bin: bin,
      message: feedbackMessage
    };

    setFeedbackData(feedback);
    setShowFeedback(true);

    if (isCorrect) {
      setScore(prev => prev + 10);
      setCompletedItems(prev => new Set([...prev, draggedItem]));
    }

    // Save game session data
    try {
      await gameService.saveGameSession(user.id, {
        level,
        score: isCorrect ? score + 10 : score,
        items_sorted: attempts + 1,
        correct_sorts: isCorrect ? completedItems.size + 1 : completedItems.size,
        accuracy: Math.round(((isCorrect ? completedItems.size + 1 : completedItems.size) / (attempts + 1)) * 100)
      });
    } catch (error) {
      console.error('Error saving game session:', error);
    }

    setDraggedItem(null);
  };

  const handleFeedbackClose = () => {
    setShowFeedback(false);
    
    if (completedItems.size === currentItems.length) {
      setTimeout(() => {
        onLevelComplete(true);
        generateLevelItems();
      }, 1000);
    }
  };

  const resetLevel = () => {
    generateLevelItems();
  };

  return (
    <div className="min-h-screen flex flex-col p-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          onClick={onBackToHome}
          className="p-2 bg-white/20 hover:bg-white/30 rounded-full"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        
        <div className="text-center">
          <h1 className="text-2xl font-bold">{t.level} {level}</h1>
          <div className="flex items-center space-x-4 mt-1">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-lg font-semibold">{score}</span>
            </div>
          </div>
        </div>

        <Button
          onClick={resetLevel}
          className="p-2 bg-white/20 hover:bg-white/30 rounded-full"
        >
          <RotateCcw className="w-6 h-6" />
        </Button>
      </div>

      {/* Instructions */}
      <div className="text-center mb-6">
        <p className="text-blue-100">{t.dragInstruction}</p>
      </div>

      {/* Bins - Updated grid for 7 bins */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
        {bins.map((bin) => (
          <WasteBin
            key={bin.id}
            bin={bin}
            onDrop={handleDrop}
            isDropTarget={true}
          />
        ))}
      </div>

      {/* Items */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-3 gap-4 mb-6">
          {currentItems.map((item) => (
            <WasteItem
              key={item.id}
              item={item}
              onDragStart={setDraggedItem}
              isDraggable={!completedItems.has(item.id)}
              isCompleted={completedItems.has(item.id)}
            />
          ))}
        </div>
      </div>

      {/* Progress */}
      <div className="flex justify-center space-x-2 mb-4">
        {currentItems.map((item, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full ${
              completedItems.has(item.id) ? 'bg-green-400' : 'bg-white/30'
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
