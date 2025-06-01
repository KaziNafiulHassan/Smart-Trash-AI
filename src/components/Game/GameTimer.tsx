
import React from 'react';
import { Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Language } from '@/pages/Index';

interface GameTimerProps {
  language: Language;
  timer: number;
  initialTimer: number;
}

const texts = {
  EN: {
    timer: 'Timer'
  },
  DE: {
    timer: 'Timer'
  }
};

const GameTimer: React.FC<GameTimerProps> = ({
  language,
  timer,
  initialTimer
}) => {
  const t = texts[language];
  const timerProgress = initialTimer > 0 ? (timer / initialTimer) * 100 : 0;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-center space-x-2 mb-2">
        <Clock className="w-4 h-4 text-white" />
        <span className="text-sm font-medium text-white">{timer}s</span>
      </div>
      <div className="w-full max-w-md mx-auto">
        <Progress 
          value={timerProgress} 
          className="h-3 bg-white/20"
        />
      </div>
    </div>
  );
};

export default GameTimer;
