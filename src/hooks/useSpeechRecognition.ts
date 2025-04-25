
import { useState, useRef, useCallback } from 'react';
import { pipeline } from '@huggingface/transformers';

interface SpeechRecognitionProps {
  onResult: (transcript: string) => void;
  onError: (error: string) => void;
  onListeningChange?: (isListening: boolean) => void;
}

export const useSpeechRecognition = ({ onResult, onError, onListeningChange }: SpeechRecognitionProps) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const whisperRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // Initialize Whisper model
  const initializeWhisper = useCallback(async () => {
    if (isInitialized || isInitializing) return;
    
    try {
      setIsInitializing(true);
      if (onListeningChange) onListeningChange(true);
      
      console.log("Loading Whisper model...");
      
      // Initialize the Whisper model using @huggingface/transformers
      // Remove the quantized property as it's not recognized in the type definition
      whisperRef.current = await pipeline(
        "automatic-speech-recognition",
        "onnx-community/whisper-tiny.en"
      );
      
      setIsInitialized(true);
      console.log("Whisper model loaded successfully");
      
    } catch (error) {
      console.error("Failed to initialize Whisper:", error);
      onError("Failed to initialize speech recognition model");
      if (onListeningChange) onListeningChange(false);
    } finally {
      setIsInitializing(false);
    }
  }, [isInitialized, isInitializing, onError, onListeningChange]);
  
  const startListening = useCallback(async () => {
    try {
      // Make sure model is initialized
      if (!isInitialized && !isInitializing) {
        await initializeWhisper();
      }
      
      // Stop any existing recording session first
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      
      console.log("Starting audio recording...");
      audioChunksRef.current = [];
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      // Set up event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        console.log("Processing audio...");
        if (onListeningChange) onListeningChange(false);
        
        try {
          // Convert audio chunks to blob
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          
          // Process audio with Whisper
          if (whisperRef.current) {
            // Create a File object from the Blob
            const audioFile = new File([audioBlob], "recording.webm", { type: 'audio/webm' });
            
            console.log("Transcribing with Whisper...");
            const result = await whisperRef.current(audioFile);
            console.log("Whisper result:", result);
            
            if (result && result.text) {
              onResult(result.text);
            } else {
              onError("No speech detected");
            }
          } else {
            onError("Speech recognition model not initialized");
          }
        } catch (error) {
          console.error("Error processing audio:", error);
          onError("Failed to process speech");
        } finally {
          // Close all audio tracks
          stream.getTracks().forEach(track => track.stop());
        }
      };
      
      // Start recording
      mediaRecorder.start();
      if (onListeningChange) onListeningChange(true);
      console.log("Recording started");
      
    } catch (error) {
      console.error("Failed to start speech recognition:", error);
      onError("Speech recognition failed to start");
      if (onListeningChange) onListeningChange(false);
    }
  }, [isInitialized, isInitializing, initializeWhisper, onListeningChange, onResult, onError]);
  
  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      console.log("Stopping recording");
      mediaRecorderRef.current.stop();
    }
  }, []);
  
  return {
    startListening,
    stopListening,
    isModelLoading: isInitializing
  };
};
