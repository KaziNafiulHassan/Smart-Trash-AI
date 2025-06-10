
import { gameService } from '@/services/gameService';

export const useProgressManager = (user: any, gameProgress: any, onProgressUpdate: (progress: any) => void) => {
  const handleLevelComplete = async (correct: boolean) => {
    if (!user) return;

    const newProgress = {
      ...gameProgress,
      total_correct: gameProgress.total_correct + (correct ? 1 : 0),
      total_attempts: gameProgress.total_attempts + 1,
      level: correct ? gameProgress.level + 1 : gameProgress.level,
      completed_levels: correct ? gameProgress.completed_levels + 1 : gameProgress.completed_levels
    };

    onProgressUpdate(newProgress);

    // Save to database
    try {
      await gameService.updateUserProgress(user.id, newProgress);
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  return { handleLevelComplete };
};
