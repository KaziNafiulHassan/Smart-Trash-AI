
import * as ort from "onnxruntime-web";

export async function preprocessImage(
  file: File | Blob,
  targetWidth = 224,
  targetHeight = 224
): Promise<ort.Tensor> {
  // We will use an offscreen Canvas to resize the image to target size,
  // then extract pixel data and normalize.
  return new Promise<ort.Tensor>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Create an offscreen canvas
      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }
      // Draw the image resized to canvas
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      // Extract ImageData (RGBA)
      const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
      const { data } = imageData; // Uint8ClampedArray length = w*h*4

      // Prepare Float32Array for [1,3,224,224]
      const [width, height] = [targetWidth, targetHeight];
      // We'll ignore alpha channel.
      const floatData = new Float32Array(3 * width * height);
      // ImageData is [r,g,b,a, r,g,b,a, ...]
      // Normalize: first map to [0,1], then (x - mean)/std.
      const mean = [0.485, 0.456, 0.406];
      const std = [0.229, 0.224, 0.225];
      // Fill channel-first array
      // Indexing: for pixel at (y, x):
      //   baseIndex = (y * width + x) * 4
      //   r = data[baseIndex], g = data[baseIndex+1], b = data[baseIndex+2]
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const pixelIndex = (y * width + x) * 4;
          const r = data[pixelIndex] / 255;
          const g = data[pixelIndex + 1] / 255;
          const b = data[pixelIndex + 2] / 255;
          const idx = y * width + x;
          floatData[idx] = (r - mean[0]) / std[0];                         // channel 0
          floatData[width * height + idx] = (g - mean[1]) / std[1];        // channel 1
          floatData[2 * width * height + idx] = (b - mean[2]) / std[2];    // channel 2
        }
      }
      // Create ONNX Tensor
      const tensor = new ort.Tensor("float32", floatData, [1, 3, height, width]);
      resolve(tensor);
    };
    img.onerror = (e) => reject(new Error("Image load error"));
    // For local Blob or File, create object URL:
    img.src = URL.createObjectURL(file);
  });
}
