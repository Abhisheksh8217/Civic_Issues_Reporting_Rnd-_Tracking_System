import { useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

function ImageClassifier({ imageFile, onPredictions }) {
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    classifyImage();
  }, [imageFile]);

  const classifyImage = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load MobileNet model
      const model = await mobilenet.load();

      // Create image element
      const img = document.createElement('img');
      img.src = URL.createObjectURL(imageFile);

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // Classify
      const results = await model.classify(img);
      
      setPredictions(results);
      if (onPredictions) {
        onPredictions(results);
      }

      // Cleanup
      URL.revokeObjectURL(img.src);
    } catch (err) {
      console.error('Classification error:', err);
      setError('Failed to classify image');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800">🤖 AI is analyzing the image...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">❌ {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <p className="font-semibold text-green-800 mb-2">✅ AI Classification Results:</p>
      {predictions && predictions.slice(0, 3).map((pred, idx) => (
        <div key={idx} className="flex justify-between items-center mb-1">
          <span className="text-sm text-green-700">{pred.className}</span>
          <span className="text-sm font-semibold text-green-900">
            {(pred.probability * 100).toFixed(1)}%
          </span>
        </div>
      ))}
    </div>
  );
}

export default ImageClassifier;
