
import React, { useRef, useCallback, useState, useEffect } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Language } from '@/types/common';

interface CameraCaptureProps {
  onCapture: (imageDataUrl: string) => void;
  isAnalyzing: boolean;
  language: Language;
}

const texts = {
  EN: {
    takePhoto: 'Take Photo',
    analyzing: 'Analyzing...',
    cameraNotSupported: 'Camera not supported',
    allowCamera: 'Please allow camera access to take photos'
  },
  DE: {
    takePhoto: 'Foto aufnehmen',
    analyzing: 'Analysieren...',
    cameraNotSupported: 'Kamera nicht unterstützt',
    allowCamera: 'Bitte erlauben Sie Kamerazugriff für Fotos'
  }
};

const CameraCapture: React.FC<CameraCaptureProps> = ({
  onCapture,
  isAnalyzing,
  language
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const t = texts[language];

  useEffect(() => {
    initCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const initCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'environment' // Prefer back camera on mobile
        }
      });
      
      setStream(mediaStream);
      setHasPermission(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasPermission(false);
    }
  };

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to data URL
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    onCapture(imageDataUrl);
  }, [onCapture]);

  if (hasPermission === false) {
    return (
      <div className="bg-white/10 rounded-2xl p-6 text-center">
        <Camera className="w-16 h-16 mx-auto mb-4 text-white/60" />
        <p className="text-white/80">{t.allowCamera}</p>
      </div>
    );
  }

  if (hasPermission === null) {
    return (
      <div className="bg-white/10 rounded-2xl p-6 text-center">
        <Loader2 className="w-16 h-16 mx-auto mb-4 text-white animate-spin" />
        <p className="text-white/80">Loading camera...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative bg-black rounded-2xl overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-64 object-cover"
        />
        
        {/* Camera overlay */}
        <div className="absolute inset-0 border-2 border-white/20 rounded-2xl">
          <div className="absolute inset-4 border border-white/40 rounded-xl border-dashed" />
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <Button
        onClick={capturePhoto}
        disabled={isAnalyzing}
        className="w-full bg-white text-green-600 hover:bg-white/90 font-semibold py-3 rounded-xl"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            {t.analyzing}
          </>
        ) : (
          <>
            <Camera className="w-5 h-5 mr-2" />
            {t.takePhoto}
          </>
        )}
      </Button>
    </div>
  );
};

export default CameraCapture;
