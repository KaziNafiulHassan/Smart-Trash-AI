
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Language } from '@/pages/Index';
import WasteBin from './WasteBin';
import WasteItem from './WasteItem';
import FeedbackPopup from './FeedbackPopup';
import { wasteItems, binCategories } from '@/data/gameData';

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
  const [currentItems, setCurrentItems] = useState<any[]>([]);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState<any>(null);
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const t = texts[language];

  const bins = [
    { 
      id: 'bio', 
      name: language === 'EN' ? 'Bio' : 'Bio', 
      color: 'bg-amber-600',
      categories: ['Food Waste', 'Organic Waste']
    },
    { 
      id: 'paper', 
      name: language === 'EN' ? 'Paper' : 'Papier', 
      color: 'bg-blue-500',
      categories: ['Paper', 'Paper Packaging', 'Cardboard']
    },
    { 
      id: 'plastic', 
      name: language === 'EN' ? 'Plastic' : 'Plastik', 
      color: 'bg-yellow-500',
      categories: ['Lightweight Packaging Bin', 'Plastic', 'Metal Packaging']
    },
    { 
      id: 'residual', 
      name: language === 'EN' ? 'Residual' : 'Restmüll', 
      color: 'bg-gray-600',
      categories: ['Residual Plastics', 'Residual Electronics', 'Residual Papers', 'Hygene Items', 'Inorganic Items', 'Residual Organics']
    }
  ];

  useEffect(() => {
    generateLevelItems();
  }, [level]);

  const generateLevelItems = () => {
    const shuffled = [...wasteItems].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);
    setCurrentItems(selected);
    setCompletedItems(new Set());
    setScore(0);
    setAttempts(0);
  };

  const handleDrop = (binId: string) => {
    if (!draggedItem) return;

    const item = currentItems.find(i => i.id === draggedItem);
    if (!item) return;

    const bin = bins.find(b => b.id === binId);
    const isCorrect = bin?.categories.includes(item.category_id);

    setAttempts(prev => prev + 1);

    const feedback = {
      correct: isCorrect,
      item: item,
      bin: bin,
      message: isCorrect 
        ? (language === 'EN' 
          ? `Correct! ${item.item_name} belongs in the ${bin?.name} bin.`
          : `Richtig! ${item.item_name} gehört in die ${bin?.name}tonne.`)
        : (language === 'EN'
          ? `Oops! ${item.item_name} doesn't belong in the ${bin?.name} bin.`
          : `Ups! ${item.item_name} gehört nicht in die ${bin?.name}tonne.`)
    };

    setFeedbackData(feedback);
    setShowFeedback(true);

    if (isCorrect) {
      setScore(prev => prev + 10);
      setCompletedItems(prev => new Set([...prev, draggedItem]));
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

      {/* Bins */}
      <div className="grid grid-cols-2 gap-4 mb-8">
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
