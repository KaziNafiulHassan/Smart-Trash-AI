
import React, { useState, useRef, useCallback } from 'react';
import { Camera, Upload, ArrowLeft, RotateCcw, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Language } from '@/types/common';
import CameraCapture from './CameraCapture';
import ClassificationResult from './ClassificationResult';
import { useToast } from '@/hooks/use-toast';

interface RealtimeSortingScreenProps {
  language: Language;
  user: any;
  onBackToHome: () => void;
}

const texts = {
  EN: {
    title: 'Real-time Sorting',
    subtitle: 'Take a photo to classify waste instantly',
    takePhoto: 'Take Photo',
    uploadImage: 'Upload Image',
    retake: 'Retake',
    analyzing: 'Analyzing...',
    error: 'Error',
    tryAgain: 'Try Again',
    feedback: 'Was this classification correct?',
    yes: 'Yes',
    no: 'No',
    thankYou: 'Thank you for your feedback!'
  },
  DE: {
    title: 'Echtzeit-Sortierung',
    subtitle: 'Machen Sie ein Foto für sofortige Müllklassifizierung',
    takePhoto: 'Foto aufnehmen',
    uploadImage: 'Bild hochladen',
    retake: 'Wiederholen',
    analyzing: 'Analysieren...',
    error: 'Fehler',
    tryAgain: 'Nochmal versuchen',
    feedback: 'War diese Klassifizierung korrekt?',
    yes: 'Ja',
    no: 'Nein',
    thankYou: 'Vielen Dank für Ihr Feedback!'
  }
};

const RealtimeSortingScreen: React.FC<RealtimeSortingScreenProps> = ({
  language,
  user,
  onBackToHome
}) => {
  const [currentStep, setCurrentStep] = useState<'camera' | 'result'>('camera');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [classificationResult, setClassificationResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const t = texts[language];

  const handleImageCapture = useCallback(async (imageDataUrl: string) => {
    console.log('Image captured, starting analysis...');
    setCapturedImage(imageDataUrl);
    setIsAnalyzing(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('classify-waste-image', {
        body: {
          imageBase64: imageDataUrl,
          userId: user.id,
          language
        }
      });

      if (error) {
        console.error('Classification error:', error);
        throw new Error(error.message || 'Classification failed');
      }

      console.log('Classification result:', data);
      setClassificationResult(data);
      setCurrentStep('result');
    } catch (err: any) {
      console.error('Error during classification:', err);
      setError(err.message || 'Failed to classify image');
      toast({
        title: t.error,
        description: err.message || 'Failed to classify image',
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [user.id, language, toast, t]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        handleImageCapture(result);
      }
    };
    reader.readAsDataURL(file);
  }, [handleImageCapture]);

  const handleRetake = useCallback(() => {
    setCapturedImage(null);
    setClassificationResult(null);
    setCurrentStep('camera');
    setError(null);
  }, []);

  const handleFeedback = useCallback(async (isCorrect: boolean, selectedBin?: string) => {
    if (!classificationResult) return;

    try {
      await supabase
        .from('image_classifications')
        .update({
          user_feedback_correct: isCorrect,
          user_selected_bin: selectedBin || null
        })
        .eq('user_id', user.id)
        .eq('image_url', classificationResult.imageUrl);

      toast({
        title: t.thankYou,
        description: 'Your feedback helps improve our AI model.',
      });
    } catch (error) {
      console.error('Error saving feedback:', error);
    }
  }, [classificationResult, user.id, toast, t]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 text-white">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={onBackToHome}
            variant="ghost"
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-bold">{t.title}</h1>
            <p className="text-blue-100">{t.subtitle}</p>
          </div>
          <div className="w-20" /> {/* Spacer for center alignment */}
        </div>

        {/* Content */}
        <div className="max-w-md mx-auto">
          {currentStep === 'camera' && (
            <div className="space-y-4">
              <CameraCapture
                onCapture={handleImageCapture}
                isAnalyzing={isAnalyzing}
                language={language}
              />
              
              {/* Upload option */}
              <div className="text-center">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full bg-white/20 border-white/30 text-white hover:bg-white/30"
                  disabled={isAnalyzing}
                >
                  <Upload className="w-5 h-5 mr-2" />
                  {t.uploadImage}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Error message */}
              {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                  <p className="text-red-100">{error}</p>
                  <Button
                    onClick={handleRetake}
                    variant="outline"
                    className="mt-2 bg-red-500/20 border-red-400 text-red-100 hover:bg-red-500/30"
                  >
                    {t.tryAgain}
                  </Button>
                </div>
              )}
            </div>
          )}

          {currentStep === 'result' && classificationResult && (
            <div className="space-y-4">
              <ClassificationResult
                result={classificationResult}
                capturedImage={capturedImage}
                language={language}
                onFeedback={handleFeedback}
              />
              
              <Button
                onClick={handleRetake}
                variant="outline"
                className="w-full bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                {t.retake}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RealtimeSortingScreen;
