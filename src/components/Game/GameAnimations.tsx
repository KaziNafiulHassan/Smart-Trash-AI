import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Sparkles, Heart, Star } from 'lucide-react';

interface GameAnimationProps {
  type: 'correct' | 'incorrect';
  isVisible: boolean;
  onAnimationEnd: () => void;
}

const GameAnimation: React.FC<GameAnimationProps> = ({ type, isVisible, onAnimationEnd }) => {
  const [animationPhase, setAnimationPhase] = useState<'enter' | 'celebrate' | 'exit'>('enter');

  useEffect(() => {
    if (!isVisible) {
      setAnimationPhase('enter');
      return;
    }

    const timer1 = setTimeout(() => setAnimationPhase('celebrate'), 100);
    const timer2 = setTimeout(() => setAnimationPhase('exit'), 1500);
    const timer3 = setTimeout(() => onAnimationEnd(), 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isVisible, onAnimationEnd]);

  if (!isVisible) return null;

  const isCorrect = type === 'correct';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Background overlay */}
      <div 
        className={`absolute inset-0 transition-all duration-500 ${
          animationPhase === 'enter' ? 'bg-black/0' : 
          animationPhase === 'celebrate' ? (isCorrect ? 'bg-green-500/20' : 'bg-red-500/20') :
          'bg-black/0'
        }`}
      />

      {/* Main animation container */}
      <div 
        className={`relative transition-all duration-500 transform ${
          animationPhase === 'enter' ? 'scale-0 opacity-0' :
          animationPhase === 'celebrate' ? 'scale-100 opacity-100' :
          'scale-110 opacity-0'
        }`}
      >
        {isCorrect ? (
          <CorrectAnimation animationPhase={animationPhase} />
        ) : (
          <IncorrectAnimation animationPhase={animationPhase} />
        )}
      </div>

      {/* Particle effects */}
      {isCorrect && animationPhase === 'celebrate' && <ParticleEffect />}
    </div>
  );
};

const CorrectAnimation: React.FC<{ animationPhase: string }> = ({ animationPhase }) => {
  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Main icon */}
      <div 
        className={`relative transition-all duration-700 ${
          animationPhase === 'celebrate' ? 'animate-bounce' : ''
        }`}
      >
        <CheckCircle 
          className={`w-24 h-24 text-green-500 transition-all duration-500 ${
            animationPhase === 'celebrate' ? 'drop-shadow-lg' : ''
          }`}
        />
        
        {/* Glow effect */}
        <div 
          className={`absolute inset-0 w-24 h-24 rounded-full transition-all duration-1000 ${
            animationPhase === 'celebrate' ? 'bg-green-400/30 animate-ping' : 'bg-transparent'
          }`}
        />
      </div>

      {/* Text */}
      <div 
        className={`text-center transition-all duration-500 delay-200 ${
          animationPhase === 'celebrate' ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        <h2 className="text-3xl font-bold text-green-600 mb-2">Perfect! 🎉</h2>
        <p className="text-lg text-green-700">Great job sorting that correctly!</p>
      </div>

      {/* Floating icons */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute transition-all duration-1000 delay-${i * 100} ${
              animationPhase === 'celebrate' ? 'animate-float' : 'opacity-0'
            }`}
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 2) * 20}%`,
              animationDelay: `${i * 200}ms`
            }}
          >
            {i % 3 === 0 ? (
              <Star className="w-6 h-6 text-yellow-400" />
            ) : i % 3 === 1 ? (
              <Heart className="w-6 h-6 text-pink-400" />
            ) : (
              <Sparkles className="w-6 h-6 text-blue-400" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const IncorrectAnimation: React.FC<{ animationPhase: string }> = ({ animationPhase }) => {
  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Main icon */}
      <div 
        className={`relative transition-all duration-700 ${
          animationPhase === 'celebrate' ? 'animate-shake' : ''
        }`}
      >
        <XCircle 
          className={`w-24 h-24 text-red-500 transition-all duration-500 ${
            animationPhase === 'celebrate' ? 'drop-shadow-lg' : ''
          }`}
        />
        
        {/* Glow effect */}
        <div 
          className={`absolute inset-0 w-24 h-24 rounded-full transition-all duration-1000 ${
            animationPhase === 'celebrate' ? 'bg-red-400/30 animate-pulse' : 'bg-transparent'
          }`}
        />
      </div>

      {/* Text */}
      <div 
        className={`text-center transition-all duration-500 delay-200 ${
          animationPhase === 'celebrate' ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        <h2 className="text-3xl font-bold text-red-600 mb-2">Oops! 😅</h2>
        <p className="text-lg text-red-700">No worries, let's learn together!</p>
      </div>
    </div>
  );
};

const ParticleEffect: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 2}s`
          }}
        />
      ))}
    </div>
  );
};

export default GameAnimation;
