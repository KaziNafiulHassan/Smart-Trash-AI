import { useEffect, useState } from "react";
import * as ort from "onnxruntime-web";
import { preprocessImage } from "../utils/onnxPreprocess";

export function useOnnxClassifier(modelUrl: string, classMapping: string[]) {
  const [session, setSession] = useState<ort.InferenceSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadModel() {
      try {
        console.log('Loading ONNX model from:', modelUrl);
        
        // First check if the URL is accessible
        const response = await fetch(modelUrl, { method: 'HEAD' });
        if (!response.ok) {
          throw new Error(`Model not found: ${response.status} ${response.statusText}`);
        }
        
        // Choose backend: 'wasm' or 'webgl' if available. By default, ORT picks best.
        const sess = await ort.InferenceSession.create(modelUrl, {
          executionProviders: ["wasm"], // or ["webgl", "wasm"] for GPU if supported
        });
        if (!cancelled) {
          console.log('ONNX model loaded successfully');
          setSession(sess);
          setLoading(false);
        }
      } catch (e: any) {
        console.error("Failed to load ONNX model:", e);
        if (!cancelled) {
          setError((e && (e as Error).message) || "Model load error");
          setLoading(false);
        }
      }
    }
    loadModel();
    return () => {
      cancelled = true;
    };
  }, [modelUrl]);

  // classify function: given a File/Blob, returns { label, logit }
  const classify = async (file: File | Blob) => {
    if (!session) throw new Error("ONNX session not ready");
    
    console.log('Starting classification...');
    // Preprocess to tensor
    const inputTensor = await preprocessImage(file, 224, 224);
    
    // Run inference
    const feeds: Record<string, ort.Tensor> = { input: inputTensor };
    const outputMap = await session.run(feeds);
    
    // The output name should be "logits" or check what's available
    const outputTensor = outputMap.logits || outputMap.output || Object.values(outputMap)[0];
    if (!outputTensor) throw new Error("No valid output tensor found");
    
    const data = outputTensor.data as Float32Array;
    
    // Find argmax
    let max = -Infinity;
    let maxIndex = -1;
    for (let i = 0; i < data.length; i++) {
      if (data[i] > max) {
        max = data[i];
        maxIndex = i;
      }
    }
    
    const label = classMapping[maxIndex] || "unknown";
    console.log('Classification result:', { label, logit: max, index: maxIndex });
    
    return {
      label,
      logit: max,
      confidence: maxIndex < classMapping.length ? 1 : 0
    };
  };

  return { session, loading, error, classify };
}
