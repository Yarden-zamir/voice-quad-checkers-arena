
import { useState, useCallback } from 'react';
import { pipeline, AutomaticSpeechRecognitionPipeline } from "@huggingface/transformers";
import { useToast } from "@/hooks/use-toast";

// Define types to match the expected interface from the transformer library
interface TranscriptionResult {
  text: string;
}

export const useOfflineSpeechRecognition = () => {
  const [isModelLoading, setIsModelLoading] = useState(false);
  const { toast } = useToast();
  
  const startListening = useCallback(async (onResult: (text: string) => void) => {
    try {
      setIsModelLoading(true);
      
      // Create the pipeline with proper typing
      const transcriber = await pipeline(
        "automatic-speech-recognition",
        "onnx-community/whisper-tiny.en",
        { device: "webgpu" }
      ) as AutomaticSpeechRecognitionPipeline;
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        
        // Properly handle the result by casting to the expected type
        const result = await transcriber(audioBlob, { 
          return_timestamps: false 
        }) as TranscriptionResult;
        
        if (result && result.text) {
          onResult(result.text);
        }
      };
      
      mediaRecorder.start();
      setTimeout(() => mediaRecorder.stop(), 2000);
      
    } catch (error) {
      console.error('Error in offline speech recognition:', error);
      toast({
        title: "Error",
        description: "Failed to start offline speech recognition",
        variant: "destructive"
      });
    } finally {
      setIsModelLoading(false);
    }
  }, [toast]);

  const stopListening = useCallback(() => {
    // Cleanup will happen automatically when mediaRecorder.stop() is called
  }, []);

  return {
    startListening,
    stopListening,
    isModelLoading
  };
};
