"use client"

import React, { useState } from 'react';
import { Camera, Upload, Info, AlertTriangle, Video } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from "@/components/ui/progress";
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
  confidence: number;
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

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 90) return 'High';
    if (confidence >= 70) return 'Medium';
    return 'Low';
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
    
    <div className="max-w-4xl mx-auto p-4 space-y-4 text-white">
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Camera className="w-6 h-6" />
            Snake Species Detector
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center gap-4">
          <div className="w-full max-w-xl aspect-video bg-slate-800 rounded-lg flex items-center justify-center relative overflow-hidden cursor-pointer hover:bg-slate-700 transition-colors"
  onClick={() => document.getElementById('imageInput')?.click()}>
              {selectedImage ? (
                <Image
                  src={selectedImage}
                  alt="Selected Image"
                  fill
                    className="object-contain rounded-lg"
                    priority
                />
              ) : (
                <div className="text-slate-400 flex flex-col items-center">
                  <Upload className="w-12 h-12 mb-2" />
                  <p>Upload an image of a snake</p>
                </div>
              )}
            </div>
            
            <div className="flex gap-4">
            {selectedImage && (
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('imageInput')?.click()}
                  disabled={isLoading}
                  className="text-white border-slate-700 hover:bg-slate-800"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Change Image
                </Button>
               )}

                {isMobileDevice() && (
                  <Button
                    variant="outline"
                    onClick={handleCameraCapture}
                    disabled={isLoading}
                    className="text-white border-slate-700 hover:bg-slate-800"
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
               {selectedImage && ( 
                <Button
                  variant="default"
                  onClick={analyzeImage}
                  disabled={!selectedImage || isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? 'Analyzing...' : 'Analyze Snake'}
                </Button>
                )}
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
            <Card className="mt-4 bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-gray-400 text-base">
                  <Info className="w-4 h-4" />
                  Analysis Results
                </CardTitle>
                <div className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                  analysis.confidence >= 90 ? 'bg-green-900/80 text-green-400 border border-green-800' :
                  analysis.confidence >= 70 ? 'bg-yellow-900/80 text-yellow-400 border border-yellow-800' :
                    'bg-red-900/80 text-red-400 border border-red-800'
                }`}>
                  Confidence: {analysis.confidence}%
                </div>
              </div>
              </CardHeader>
              <CardContent>
              <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-800/50 rounded-lg flex items-center justify-center">
                        <span className={`px-6 py-3 rounded-md text-lg font-semibold ${
                          analysis.venomous 
                            ? 'bg-red-900/80 text-red-400 border-2 border-red-800' 
                            : 'bg-green-900/80 text-green-400 border-2 border-green-800'
                        }`}>
                          {analysis.venomous ? 'Poisonous' : 'Not Poisonous'}
                        </span>
                      </div>

                      <div className="p-4 bg-slate-800/50 rounded-lg">
                        <div className="flex flex-col gap-3">
                        <div className="text-gray-400 mb-1">Species:</div>
                          <div className="text-white font-medium leading-snug">
                            {analysis.species}
                          </div>
                                
                        
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-slate-800/50 rounded-lg">
                            <div className="text-gray-400 mb-1">Features:</div>
                            <div className="text-white">{analysis.features}</div>
                          </div>
                          <div className="p-4 bg-slate-800/50 rounded-lg">
                            <div className="text-gray-400 mb-1">Safety Concerns:</div>
                            <div className="text-red-400">{analysis.safety_concerns}</div>
                          </div>
                        </div>

                        
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