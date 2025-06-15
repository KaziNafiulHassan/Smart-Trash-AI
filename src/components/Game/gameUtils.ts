
import { Language } from '@/types/common';

export const bins = [
  { 
    id: 'residual', 
    name: { EN: 'Residual Waste Bin', DE: 'Restmüll' },
    color: 'bg-gray-600 dark:bg-gray-800 dark:neon-glow'
  },
  { 
    id: 'paper', 
    name: { EN: 'Paper Bin', DE: 'Papier' },
    color: 'bg-red-500 dark:bg-red-800 dark:neon-glow'
  },
  { 
    id: 'bio', 
    name: { EN: 'Bio Bin', DE: 'Bio' },
    color: 'bg-amber-600 dark:bg-amber-800 dark:neon-glow'
  },
  { 
    id: 'plastic', 
    name: { EN: 'Lightweight Packaging Bin', DE: 'Leichtverpackung' },
    color: 'bg-yellow-500 dark:bg-yellow-700 dark:neon-glow'
  },
  { 
    id: 'glass', 
    name: { EN: 'Waste Glass Container', DE: 'Altglas' },
    color: 'bg-green-600 dark:bg-green-800 dark:neon-glow'
  },
  { 
    id: 'hazardous', 
    name: { EN: 'Hazardous Waste Mobile or Collection Points', DE: 'Sondermüll' },
    color: 'bg-orange-600 dark:bg-orange-800 dark:neon-glow'
  },
  { 
    id: 'bulky', 
    name: { EN: 'Bulky Waste Container', DE: 'Sperrmüll' },
    color: 'bg-purple-600 dark:bg-purple-800 dark:neon-glow'
  }
];

export const getBinsForLanguage = (language: Language) => {
  return bins.map(bin => ({
    ...bin,
    name: bin.name[language]
  }));
};

export const getTimerForLevel = (currentLevel: number) => {
  // Start with 30 seconds for level 1, decrease by 2 seconds per level, minimum 10 seconds
  const baseTime = 30;
  const decreasePerLevel = 2;
  const minTime = 10;
  
  const calculatedTime = baseTime - ((currentLevel - 1) * decreasePerLevel);
  return Math.max(calculatedTime, minTime);
};

export const generateFeedbackMessage = (
  isCorrect: boolean, 
  itemName: string, 
  itemDescription: string, 
  selectedBin: string, 
  correctBin: string,
  language: Language
) => {
  if (isCorrect) {
    return language === 'EN' 
      ? `Excellent! ✅ ${itemName} belongs in the ${correctBin}.\n\n💡 Tip: ${itemDescription || 'Great job with waste sorting!'}`
      : `Ausgezeichnet! ✅ ${itemName} gehört in die ${correctBin}.\n\n💡 Tipp: ${itemDescription || 'Großartige Arbeit beim Mülltrennen!'}`;
  } else {
    return language === 'EN'
      ? `Not quite right. ❌ ${itemName} doesn't belong in the ${selectedBin}. It should go in the ${correctBin}.\n\n💡 Tip: ${itemDescription || 'Keep learning about proper waste sorting!'}`
      : `Nicht ganz richtig. ❌ ${itemName} gehört nicht in die ${selectedBin}. Es sollte in die ${correctBin}.\n\n💡 Tipp: ${itemDescription || 'Weiter lernen über richtige Mülltrennung!'}`;
  }
};
