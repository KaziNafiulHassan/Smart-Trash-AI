
import React, { useState, useRef } from "react";
import { Camera, Upload, Trash2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOnnxClassifier } from "@/hooks/useOnnxClassifier";
import { classMapping } from "@/data/classMapping";
import { supabase } from "@/integrations/supabase/client";

// You'll need to update this URL to match your actual model in Supabase storage
const MODEL_URL = `${supabase.supabaseUrl}/storage/v1/object/public/models/waste_classifier.onnx`;

const AIWasteSorter: React.FC = () => {
  const { session, loading, error, classify } = useOnnxClassifier(MODEL_URL, classMapping);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<{
    label: string;
    logit: number;
    confidence: number;
  } | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setResult(null);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const onClassify = async () => {
    if (!file || !session) return;
    
    setIsClassifying(true);
    try {
      const res = await classify(file);
      setResult(res);
    } catch (e) {
      console.error("Classification error", e);
      // You could add a toast notification here
    } finally {
      setIsClassifying(false);
    }
  };

  const clearSelection = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getBinRecommendation = (wasteType: string) => {
    // Map waste types to bins (you can customize this based on your needs)
    const binMapping: { [key: string]: string } = {
      "Paper": "Paper Bin",
      "Paper Packaging": "Paper Bin", 
      "Cardboard": "Paper Bin",
      "Plastic": "Plastic Bin",
      "Metal Packaging": "Plastic Bin",
      "Recyclable Glass": "Glass Bin",
      "Waste Glass": "Glass Bin",
      "Food Waste": "Bio Bin",
      "Vegetation": "Bio Bin",
      "Hazardous Waste": "Hazardous Waste Collection",
      "Bulky Waste": "Bulky Waste Collection",
      "Textile": "Textile Collection",
      "Composite Packaging": "Plastic Bin",
      "Residual Waste": "Residual Bin"
    };
    
    return binMapping[wasteType] || "Residual Bin";
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          AI Waste Sorter
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Upload an image to identify waste type and get sorting recommendations
        </p>
      </div>

      {/* Model Status */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        {loading && (
          <div className="flex items-center text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            Loading AI model...
          </div>
        )}
        {error && (
          <div className="flex items-center text-red-600">
            <AlertCircle className="h-4 w-4 mr-2" />
            Error loading model: {error}
          </div>
        )}
        {session && !loading && (
          <div className="flex items-center text-green-600">
            <CheckCircle className="h-4 w-4 mr-2" />
            AI model ready
          </div>
        )}
      </div>

      {/* File Upload */}
      <div className="space-y-4">
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="cursor-pointer"
        />
        
        <div className="flex gap-2">
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="flex-1"
          >
            <Upload className="h-4 w-4 mr-2" />
            Choose Image
          </Button>
          
          {file && (
            <Button
              onClick={clearSelection}
              variant="outline"
              className="px-3"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Image Preview */}
      {preview && (
        <div className="space-y-4">
          <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
            <img
              src={preview}
              alt="Selected waste item"
              className="max-w-full h-auto max-h-64 mx-auto rounded-lg"
            />
          </div>
          
          <Button
            onClick={onClassify}
            disabled={!file || loading || isClassifying || !!error}
            className="w-full"
          >
            {isClassifying ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Analyzing...
              </>
            ) : (
              <>
                <Camera className="h-4 w-4 mr-2" />
                Classify Waste
              </>
            )}
          </Button>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
            Classification Result
          </h3>
          
          <div className="space-y-3">
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Waste Type:</span>
              <span className="ml-2 text-lg font-bold text-green-700 dark:text-green-300">
                {result.label}
              </span>
            </div>
            
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Recommended Bin:</span>
              <span className="ml-2 text-lg font-bold text-blue-700 dark:text-blue-300">
                {getBinRecommendation(result.label)}
              </span>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Confidence Score: {result.logit.toFixed(2)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIWasteSorter;
