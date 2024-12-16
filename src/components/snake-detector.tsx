"use client"

import React, { useState } from 'react';
import { Camera, Upload, Info, AlertTriangle, Video } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Image from 'next/image';

// Update interface to match API response structure
interface APIResponse {
  content: string;
  isSnakeImage: boolean;
  success: boolean;
  error?: string;
}

interface AnalysisResult {
  species: string;
  venomous: boolean;
  features: string;
  safety_concerns: string;
}

const SnakeDetector = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notSnakeMessage, setNotSnakeMessage] = useState<string | null>(null);

  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Add file type validation
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setAnalysis(null);
        setError(null);
        setNotSnakeMessage(null);
      };
      reader.onerror = () => {
        setError('Error reading file');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';  // This enables the camera on mobile devices
    
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        // Add file type validation
        if (!file.type.startsWith('image/')) {
          setError('Please capture a valid image');
          return;
        }
  
        const reader = new FileReader();
        reader.onloadend = () => {
          setSelectedImage(reader.result as string);
          setAnalysis(null);
          setError(null);
          setNotSnakeMessage(null);
        };
        reader.onerror = () => {
          setError('Error reading captured image');
        };
        reader.readAsDataURL(file);
      }
    };
  
    input.click();
  };


  const analyzeImage = async () => {
    if (!selectedImage) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: selectedImage,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json() as APIResponse;
      
      if (!result.isSnakeImage) {
        setNotSnakeMessage(result.content);
        setAnalysis(null);
      } else {

      // Parse the JSON string from the content
      const jsonString = result.content.replace(/```json\n|\n```/g, '');
      const analysisResult = JSON.parse(jsonString) as AnalysisResult;
      
      setAnalysis(analysisResult);
      setNotSnakeMessage(null);
      }


    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze image. Please try again.");
      console.error('Analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-6 h-6" />
            Snake Species Detector
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center gap-4">
            <div className="w-full max-w-xl aspect-video bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
              {selectedImage ? (
                <Image
                  src={selectedImage}
                  alt="Selected Image"
                  fill
                    className="object-contain rounded-lg"
                    priority
                />
              ) : (
                <div className="text-gray-400 flex flex-col items-center">
                  <Upload className="w-12 h-12 mb-2" />
                  <p>Upload an image of a snake</p>
                </div>
              )}
            </div>
            
            <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('imageInput')?.click()}
                  disabled={isLoading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Select Image
                </Button>
                
                {isMobileDevice() && (
                  <Button
                    variant="outline"
                    onClick={handleCameraCapture}
                    disabled={isLoading}
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Take Photo
                  </Button>
                )}

                <input
                  id="imageInput"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={isLoading}
                />
                
                <Button
                  onClick={analyzeImage}
                  disabled={!selectedImage || isLoading}
                >
                  {isLoading ? 'Analyzing...' : 'Analyze Snake'}
                </Button>
              </div>

          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {notSnakeMessage && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{notSnakeMessage}</AlertDescription>
            </Alert>
          )}

          {analysis && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Analysis Results
                </CardTitle>
              </CardHeader>
              <CardContent>
          
                <div className="space-y-2">
                  <p><strong>Species:</strong> {analysis.species}</p>
                  <p><strong>Venomous:</strong> <span className={analysis.venomous ? 'text-red-600 font-semibold' : 'text-green-600'}>{analysis.venomous ? 'Yes' : 'No'}</span></p>
                  <p><strong>Features:</strong> {analysis.features}</p>
                  <p><strong>Safety Concerns:</strong> <span className="text-red-600">{analysis.safety_concerns}</span></p>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SnakeDetector;