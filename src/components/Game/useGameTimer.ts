
import { useState, useEffect } from 'react';
import { Language } from '@/types/common';
import { getTimerForLevel } from './gameUtils';

interface UseGameTimerProps {
  level: number;
  currentItem: any;
  isTimerActive: boolean;
  setIsTimerActive: (active: boolean) => void;
  onTimeOut: () => void;
}

export const useGameTimer = ({
  level,
  currentItem,
  isTimerActive,
  setIsTimerActive,
  onTimeOut
}: UseGameTimerProps) => {
  const [timer, setTimer] = useState(30);
  const [initialTimer, setInitialTimer] = useState(30);
  const [startTime, setStartTime] = useState<number | null>(null);

  // Initialize timer when current item changes
  useEffect(() => {
    if (currentItem && !startTime) {
      setStartTime(Date.now());
      const levelTimer = getTimerForLevel(level);
      setTimer(levelTimer);
      setInitialTimer(levelTimer);
      setIsTimerActive(true);
    }
  }, [currentItem, level, startTime, setIsTimerActive]);

  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            setIsTimerActive(false);
            onTimeOut();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timer, setIsTimerActive, onTimeOut]);

  const resetTimer = () => {
    setStartTime(null);
    setIsTimerActive(false);
  };

  const startNewTimer = () => {
    setStartTime(Date.now());
    const levelTimer = getTimerForLevel(level);
    setTimer(levelTimer);
    setInitialTimer(levelTimer);
    setIsTimerActive(true);
  };

  return {
    timer,
    initialTimer,
    startTime,
    resetTimer,
    startNewTimer
  };
};
