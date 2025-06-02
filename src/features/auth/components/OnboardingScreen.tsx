
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Language } from '@/types/common';
import WasteItem from '@/features/game/components/WasteItem';
import WasteBin from '@/features/game/components/WasteBin';

interface OnboardingScreenProps {
  language: Language;
  onComplete: () => void;
}

const texts = {
  EN: {
    welcome: 'Welcome to EcoSort!',
    subtitle: 'Learn to sort waste correctly and help protect our environment',
    instruction: 'Drag items to the correct bins',
    example: 'Example: Paper goes in the blue bin',
    getStarted: 'Get Started',
    skipTutorial: 'Skip Tutorial'
  },
  DE: {
    welcome: 'Willkommen bei EcoSort!',
    subtitle: 'Lerne Müll richtig zu trennen und hilf dabei, unsere Umwelt zu schützen',
    instruction: 'Ziehe Gegenstände in die richtigen Tonnen',
    example: 'Beispiel: Papier gehört in die blaue Tonne',
    getStarted: 'Loslegen',
    skipTutorial: 'Tutorial überspringen'
  }
};

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ language, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const t = texts[language];

  // Sample items for demonstration
  const sampleItems = [
    {
      id: 'paper-sample',
      item_name: language === 'EN' ? 'Newspaper' : 'Zeitung',
      description: language === 'EN' ? 'Old newspaper for recycling' : 'Alte Zeitung zum Recycling'
    }
  ];

  const sampleBins = [
    { 
      id: 'paper', 
      name: language === 'EN' ? 'Paper Bin' : 'Papier', 
      color: 'bg-blue-500'
    },
    { 
      id: 'residual', 
      name: language === 'EN' ? 'Residual Waste Bin' : 'Restmüll', 
      color: 'bg-gray-600'
    }
  ];

  const steps = [
    {
      title: t.welcome,
      content: (
        <div className="text-center">
          <div className="text-6xl mb-4">🌱</div>
          <p className="text-blue-100 text-lg mb-6">{t.subtitle}</p>
        </div>
      )
    },
    {
      title: t.instruction,
      content: (
        <div className="space-y-6">
          <p className="text-blue-100 text-center">{t.example}</p>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {sampleBins.map((bin) => (
              <WasteBin key={bin.id} bin={bin} />
            ))}
          </div>
          <div className="flex justify-center">
            <div className="w-32">
              <WasteItem
                item={sampleItems[0]}
                isDraggable={false}
              />
            </div>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-white">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
        <h1 className="text-3xl font-bold text-center mb-8">
          {currentStepData.title}
        </h1>
        
        <div className="mb-8">
          {currentStepData.content}
        </div>

        <div className="flex justify-center space-x-4">
          <Button
            onClick={onComplete}
            variant="outline"
            className="bg-white/20 hover:bg-white/30 border-white/30 text-white"
          >
            {t.skipTutorial}
          </Button>
          <Button
            onClick={handleNext}
            className="bg-green-500 hover:bg-green-600 text-white px-8"
          >
            {currentStep === steps.length - 1 ? t.getStarted : 'Next'}
          </Button>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center mt-6 space-x-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentStep ? 'bg-green-400' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OnboardingScreen;
