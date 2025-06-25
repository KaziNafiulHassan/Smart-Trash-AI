
import React, { useState, useRef } from "react";
import { Camera, Upload, Trash2, CheckCircle, AlertCircle, ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useOnnxClassifier } from "@/hooks/useOnnxClassifier";
import { classMapping } from "@/data/classMapping";
import { useAuth } from "@/hooks/useAuth";
import { imageClassificationService } from "@/services/imageClassificationService";

// Use the correct EfficientNet model URL from Supabase storage (fixed double slash)
const MODEL_URL = "https://dwgolyqevdaqosteonfl.supabase.co/storage/v1/object/public/models/efficientnet_b0_waste.onnx";

const AIWasteSorter: React.FC = () => {
  const { session, loading, error, classify } = useOnnxClassifier(MODEL_URL, classMapping);
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<{
    label: string;
    logit: number;
    confidence: number;
  } | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [classificationId, setClassificationId] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [userAgreement, setUserAgreement] = useState<boolean | null>(null);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
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
    if (!file || !session || !user) return;

    setIsClassifying(true);

    try {
      const res = await classify(file);
      setResult(res);

      // Save classification to database
      const classificationData = {
        user_id: user.id,
        predicted_category: res.label,
        predicted_bin: mapWasteToBinType(res.label),
        confidence: res.logit,
        image_url: preview || undefined
      };

      const savedId = await imageClassificationService.saveClassification(classificationData);
      setClassificationId(savedId);
      setShowFeedback(true);
      setUserAgreement(null);
      setFeedbackComment('');
    } catch (e) {
      console.error("Classification error", e);
    } finally {
      setIsClassifying(false);
    }
  };

  const clearSelection = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setShowFeedback(false);
    setUserAgreement(null);
    setFeedbackComment('');
    setClassificationId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFeedbackSubmit = async (agrees: boolean) => {
    if (!classificationId) return;

    setIsSubmittingFeedback(true);
    setUserAgreement(agrees);

    try {
      await imageClassificationService.updateClassificationFeedback(
        classificationId,
        agrees,
        feedbackComment || undefined
      );
      console.log('Feedback submitted successfully');
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const mapWasteToBinType = (wasteType: string): "bio" | "paper" | "plastic" | "residual" | "glass" | "hazardous" | "bulky" => {
    const binMapping: { [key: string]: "bio" | "paper" | "plastic" | "residual" | "glass" | "hazardous" | "bulky" } = {
      "Paper": "paper",
      "Paper Packaging": "paper",
      "Cardboard": "paper",
      "Plastic": "plastic",
      "Metal Packaging": "plastic",
      "Recyclable Glass": "glass",
      "Waste Glass": "glass",
      "Food Waste": "bio",
      "Vegetation": "bio",
      "Hazardous Waste": "hazardous",
      "Bulky Waste": "bulky",
      "Textile": "residual",
      "Composite Packaging": "plastic",
      "Residual Waste": "residual"
    };

    return binMapping[wasteType] || "residual";
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
            Loading EfficientNet AI model...
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
            EfficientNet AI model ready
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
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 space-y-6">
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
            Classification Result
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Waste Category</span>
              <div className="text-lg font-bold text-green-700 dark:text-green-300 mt-1">
                {result.label}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Recommended Bin</span>
              <div className="text-lg font-bold text-blue-700 dark:text-blue-300 mt-1">
                {getBinRecommendation(result.label)}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Confidence Score</span>
              <div className="text-lg font-bold text-purple-700 dark:text-purple-300 mt-1">
                {(result.logit * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Feedback Section */}
          {showFeedback && userAgreement === null && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4">
                Do you agree with this classification?
              </h4>

              <div className="flex gap-4 mb-4">
                <Button
                  onClick={() => handleFeedbackSubmit(true)}
                  disabled={isSubmittingFeedback}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                >
                  <ThumbsUp className="w-4 h-4" />
                  Yes, I agree
                </Button>

                <Button
                  onClick={() => setUserAgreement(false)}
                  disabled={isSubmittingFeedback}
                  variant="outline"
                  className="flex items-center gap-2 border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <ThumbsDown className="w-4 h-4" />
                  No, I disagree
                </Button>
              </div>
            </div>
          )}

          {/* Disagreement Feedback Form */}
          {userAgreement === false && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-orange-800 dark:text-orange-200 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Please provide your feedback
              </h4>

              <div className="space-y-4">
                <Textarea
                  placeholder="What do you think the correct classification should be? Any additional comments?"
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  className="min-h-[100px]"
                />

                <Button
                  onClick={() => handleFeedbackSubmit(false)}
                  disabled={isSubmittingFeedback}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {isSubmittingFeedback ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting Feedback...
                    </>
                  ) : (
                    'Submit Feedback'
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Feedback Confirmation */}
          {userAgreement !== null && !isSubmittingFeedback && (
            <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">
                  Thank you for your feedback! Your input helps improve our AI model.
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIWasteSorter;
