
import { useState, useCallback } from 'react';
import { pipeline } from "@huggingface/transformers";
import { useToast } from "@/hooks/use-toast";

export const useOfflineSpeechRecognition = () => {
  const [isModelLoading, setIsModelLoading] = useState(false);
  const { toast } = useToast();
  
  const startListening = useCallback(async (onResult: (text: string) => void) => {
    try {
      setIsModelLoading(true);
      
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
        const result = await transcriber(audioBlob);
        if (result.text) {
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
