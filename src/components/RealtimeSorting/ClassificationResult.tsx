
import React, { useState } from 'react';
import { Check, X, Recycle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Language } from '@/types/common';

type BinType = 'paper' | 'plastic' | 'glass' | 'bio' | 'residual' | 'hazardous' | 'bulky';

interface ClassificationResultProps {
  result: {
    predictedCategory: string;
    predictedBin: BinType;
    confidence: number;
    feedback: string;
    imageUrl?: string;
    timestamp: string;
  };
  capturedImage: string | null;
  language: Language;
  onFeedback: (isCorrect: boolean, selectedBin?: BinType) => void;
}

const texts = {
  EN: {
    result: 'Classification Result',
    confidence: 'Confidence',
    category: 'Category',
    binType: 'Bin Type',
    feedback: 'Was this classification correct?',
    yes: 'Yes, Correct',
    no: 'No, Incorrect',
    selectCorrectBin: 'Select the correct bin:',
    paper: 'Paper',
    plastic: 'Plastic', 
    glass: 'Glass',
    bio: 'Bio Waste',
    residual: 'Residual Waste',
    hazardous: 'Hazardous',
    bulky: 'Bulky Waste',
    submit: 'Submit Feedback',
    thankYou: 'Thank you for your feedback!'
  },
  DE: {
    result: 'Klassifikationsergebnis',
    confidence: 'Sicherheit',
    category: 'Kategorie',
    binType: 'Tonnentyp',
    feedback: 'War diese Klassifizierung korrekt?',
    yes: 'Ja, richtig',
    no: 'Nein, falsch',
    selectCorrectBin: 'Wählen Sie die richtige Tonne:',
    paper: 'Papier',
    plastic: 'Plastik',
    glass: 'Glas', 
    bio: 'Biomüll',
    residual: 'Restmüll',
    hazardous: 'Sondermüll',
    bulky: 'Sperrmüll',
    submit: 'Feedback senden',
    thankYou: 'Vielen Dank für Ihr Feedback!'
  }
};

const binColors: Record<BinType, string> = {
  paper: 'bg-blue-500',
  plastic: 'bg-yellow-500',
  glass: 'bg-green-500',
  bio: 'bg-green-600',
  residual: 'bg-gray-500',
  hazardous: 'bg-red-500',
  bulky: 'bg-purple-500'
};

const binIcons: Record<BinType, string> = {
  paper: '📄',
  plastic: '♻️',
  glass: '🍶',
  bio: '🍎',
  residual: '🗑️',
  hazardous: '☢️',
  bulky: '📦'
};

const ClassificationResult: React.FC<ClassificationResultProps> = ({
  result,
  capturedImage,
  language,
  onFeedback
}) => {
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [showCorrection, setShowCorrection] = useState(false);
  const [selectedBin, setSelectedBin] = useState<BinType | ''>('');

  const t = texts[language];

  const handlePositiveFeedback = () => {
    onFeedback(true);
    setFeedbackSubmitted(true);
  };

  const handleNegativeFeedback = () => {
    setShowCorrection(true);
  };

  const handleCorrectionSubmit = () => {
    if (selectedBin) {
      onFeedback(false, selectedBin as BinType);
      setFeedbackSubmitted(true);
      setShowCorrection(false);
    }
  };

  const binOptions: BinType[] = ['paper', 'plastic', 'glass', 'bio', 'residual', 'hazardous', 'bulky'];

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 space-y-4">
      {/* Captured Image */}
      {capturedImage && (
        <div className="relative">
          <img
            src={capturedImage}
            alt="Captured waste"
            className="w-full h-48 object-cover rounded-xl"
          />
        </div>
      )}

      {/* Results */}
      <div className="space-y-3">
        <h3 className="text-xl font-bold text-center text-white">{t.result}</h3>
        
        <div className="bg-white/20 rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-white/80">{t.category}:</span>
            <span className="font-semibold text-white capitalize">{result.predictedCategory}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-white/80">{t.binType}:</span>
            <div className="flex items-center space-x-2">
              <span className={`w-6 h-6 rounded-full ${binColors[result.predictedBin]} flex items-center justify-center text-white text-sm`}>
                {binIcons[result.predictedBin]}
              </span>
              <span className="font-semibold text-white capitalize">{t[result.predictedBin]}</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-white/80">{t.confidence}:</span>
            <span className="font-semibold text-white">{result.confidence}%</span>
          </div>
        </div>

        {/* Educational Feedback */}
        <div className="bg-blue-50/90 dark:bg-blue-900/30 p-4 rounded-xl border-l-4 border-blue-400">
          <p className="text-gray-800 dark:text-blue-100 leading-relaxed">
            {result.feedback}
          </p>
        </div>

        {/* User Feedback Section */}
        {!feedbackSubmitted && !showCorrection && (
          <div className="space-y-3">
            <p className="text-white/90 text-center">{t.feedback}</p>
            <div className="flex space-x-3">
              <Button
                onClick={handlePositiveFeedback}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white"
              >
                <Check className="w-5 h-5 mr-2" />
                {t.yes}
              </Button>
              <Button
                onClick={handleNegativeFeedback}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              >
                <X className="w-5 h-5 mr-2" />
                {t.no}
              </Button>
            </div>
          </div>
        )}

        {/* Correction Interface */}
        {showCorrection && (
          <div className="space-y-3">
            <p className="text-white/90 text-center">{t.selectCorrectBin}</p>
            <div className="grid grid-cols-2 gap-2">
              {binOptions.map((bin) => (
                <Button
                  key={bin}
                  onClick={() => setSelectedBin(bin)}
                  variant={selectedBin === bin ? "default" : "outline"}
                  className={`p-3 ${
                    selectedBin === bin 
                      ? `${binColors[bin]} text-white` 
                      : 'bg-white/20 border-white/30 text-white hover:bg-white/30'
                  }`}
                >
                  <span className="text-lg mr-2">{binIcons[bin]}</span>
                  {t[bin]}
                </Button>
              ))}
            </div>
            {selectedBin && (
              <Button
                onClick={handleCorrectionSubmit}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                {t.submit}
              </Button>
            )}
          </div>
        )}

        {/* Thank You Message */}
        {feedbackSubmitted && (
          <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 text-center">
            <Check className="w-8 h-8 mx-auto mb-2 text-green-400" />
            <p className="text-green-100">{t.thankYou}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassificationResult;
