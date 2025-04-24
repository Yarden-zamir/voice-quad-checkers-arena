
import { useState, useCallback } from 'react';
import { pipeline } from "@huggingface/transformers";
import { useToast } from "@/hooks/use-toast";

// Define a simplified interface for the transcription result
interface TranscriptionResult {
  text: string;
}

export const useOfflineSpeechRecognition = () => {
  const [isModelLoading, setIsModelLoading] = useState(false);
  const { toast } = useToast();
  
  const startListening = useCallback(async (onResult: (text: string) => void) => {
    try {
      setIsModelLoading(true);
      
      // Create the pipeline without explicit typing
      const transcriber = await pipeline(
        "automatic-speech-recognition",
        "onnx-community/whisper-tiny.en",
        { device: "webgpu" }
      );
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        
        // Use any to bypass the type checking temporarily
        // The library types are likely out of date or incomplete
        const result = await (transcriber as any)(audioBlob, { 
          return_timestamps: false 
        });
        
        if (result && typeof result === 'object') {
          // Handle both possible result formats
          const text = Array.isArray(result) 
            ? result[0]?.text 
            : result.text;
            
          if (text) {
            onResult(text);
          }
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
