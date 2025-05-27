
import React, { useState } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Language } from '@/pages/Index';
import WasteBin from '@/components/Game/WasteBin';
import WasteItem from '@/components/Game/WasteItem';

interface OnboardingScreenProps {
  language: Language;
  onComplete: () => void;
}

const texts = {
  EN: {
    title: 'Learn Waste Sorting',
    subtitle: 'Drag items to the correct bins!',
    step1Title: 'Meet the Bins',
    step1Text: 'Each bin is for different types of waste',
    step2Title: 'Try Sorting!',
    step2Text: 'Drag the apple peel to the Bio bin',
    step3Title: 'Great Job!',
    step3Text: 'You\'re ready to start playing!',
    next: 'Next',
    back: 'Back',
    startGame: 'Start Game',
    correct: 'Correct! Bio waste like fruit peels goes in the brown bin.',
    tryAgain: 'Try again! Apple peels are organic waste.'
  },
  DE: {
    title: 'Müll Sortieren Lernen',
    subtitle: 'Ziehe Gegenstände in die richtigen Tonnen!',
    step1Title: 'Lerne die Tonnen kennen',
    step1Text: 'Jede Tonne ist für verschiedene Abfallarten',
    step2Title: 'Probiere das Sortieren!',
    step2Text: 'Ziehe die Apfelschale in die Biotonne',
    step3Title: 'Gut gemacht!',
    step3Text: 'Du bist bereit zum Spielen!',
    next: 'Weiter',
    back: 'Zurück',
    startGame: 'Spiel Starten',
    correct: 'Richtig! Bioabfall wie Obstschalen gehört in die braune Tonne.',
    tryAgain: 'Versuche es nochmal! Apfelschalen sind Bioabfall.'
  }
};

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ language, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [feedback, setFeedback] = useState('');

  const t = texts[language];

  const bins = [
    { id: 'bio', name: language === 'EN' ? 'Bio' : 'Bio', color: 'bg-amber-600' },
    { id: 'paper', name: language === 'EN' ? 'Paper' : 'Papier', color: 'bg-blue-500' },
    { id: 'plastic', name: language === 'EN' ? 'Plastic' : 'Plastik', color: 'bg-yellow-500' },
    { id: 'residual', name: language === 'EN' ? 'Residual' : 'Restmüll', color: 'bg-gray-600' }
  ];

  const handleDrop = (binId: string) => {
    if (draggedItem === 'apple_peel' && binId === 'bio') {
      setFeedback(t.correct);
      setCompleted(true);
    } else {
      setFeedback(t.tryAgain);
    }
    setDraggedItem(null);
  };

  const steps = [
    {
      title: t.step1Title,
      content: (
        <div className="space-y-4">
          <p className="text-center text-lg mb-6">{t.step1Text}</p>
          <div className="grid grid-cols-2 gap-4">
            {bins.map((bin) => (
              <WasteBin key={bin.id} bin={bin} />
            ))}
          </div>
        </div>
      )
    },
    {
      title: t.step2Title,
      content: (
        <div className="space-y-4">
          <p className="text-center text-lg mb-6">{t.step2Text}</p>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {bins.map((bin) => (
              <WasteBin 
                key={bin.id} 
                bin={bin} 
                onDrop={handleDrop}
                isDropTarget={true}
              />
            ))}
          </div>
          <div className="flex justify-center">
            <WasteItem
              item={{
                id: 'apple_peel',
                name: language === 'EN' ? 'Apple Peel' : 'Apfelschale',
                category: 'Food Waste',
                emoji: '🍎'
              }}
              onDragStart={setDraggedItem}
              isDraggable={true}
            />
          </div>
          {feedback && (
            <div className={`p-4 rounded-lg text-center ${
              completed ? 'bg-green-500/20 text-green-100' : 'bg-red-500/20 text-red-100'
            }`}>
              {feedback}
            </div>
          )}
        </div>
      )
    },
    {
      title: t.step3Title,
      content: (
        <div className="text-center space-y-6">
          <div className="text-6xl mb-4">🎉</div>
          <p className="text-lg">{t.step3Text}</p>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen flex flex-col p-6 text-white">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">{t.title}</h1>
        <p className="text-lg text-blue-100">{t.subtitle}</p>
        <div className="flex justify-center mt-4 space-x-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full ${
                index === currentStep ? 'bg-yellow-400' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <div className="bg-white/10 rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-center mb-6">
            {steps[currentStep].title}
          </h2>
          {steps[currentStep].content}
        </div>
      </div>

      <div className="flex justify-between">
        {currentStep > 0 && (
          <Button
            onClick={() => setCurrentStep(currentStep - 1)}
            className="py-3 px-6 bg-gray-500 hover:bg-gray-600 text-white rounded-xl"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {t.back}
          </Button>
        )}
        
        <div className="flex-1" />
        
        {currentStep < steps.length - 1 ? (
          <Button
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={currentStep === 1 && !completed}
            className="py-3 px-6 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 text-white rounded-xl"
          >
            {t.next}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={onComplete}
            className="py-3 px-6 bg-green-500 hover:bg-green-600 text-white rounded-xl"
          >
            {t.startGame}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default OnboardingScreen;
