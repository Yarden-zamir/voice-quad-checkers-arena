
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
  const modelRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // Initialize ASR model
  const initializeModel = useCallback(async () => {
    if (isInitialized || isInitializing) return;
    
    try {
      setIsInitializing(true);
      if (onListeningChange) onListeningChange(true);
      
      console.log("Loading speech recognition model...");
      
      // Use a model that's known to work in browsers
      modelRef.current = await pipeline(
        "automatic-speech-recognition",
        "onnx-community/whisper-tiny.en"
      );
      
      setIsInitialized(true);
      console.log("Speech recognition model loaded successfully");
      
    } catch (error) {
      console.error("Failed to initialize speech recognition model:", error);
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
        await initializeModel();
        return; // Wait for model to initialize before starting recording
      }
      
      // Stop any existing recording session first
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      
      console.log("Starting audio recording...");
      audioChunksRef.current = [];
      
      // Request microphone access with optimal settings for speech recognition
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000, // Works best with 16kHz audio
          channelCount: 1,   // Mono audio
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      // Determine supported MIME type
      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/ogg';
      }
      
      // Create media recorder with optimized settings
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType,
        audioBitsPerSecond: 128000
      });
      mediaRecorderRef.current = mediaRecorder;
      
      // Set up event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log(`Audio chunk received: ${event.data.size} bytes`);
        }
      };
      
      mediaRecorder.onstop = async () => {
        console.log("Processing audio...");
        if (onListeningChange) onListeningChange(false);
        
        try {
          if (audioChunksRef.current.length === 0) {
            throw new Error("No audio recorded");
          }
          
          // Convert audio chunks to blob
          const audioBlob = new Blob(audioChunksRef.current, { 
            type: mediaRecorder.mimeType 
          });
          
          if (audioBlob.size < 100) {
            throw new Error("Audio recording too short");
          }
          
          console.log(`Audio blob created: ${audioBlob.size} bytes, type: ${audioBlob.type}`);
          
          // Process audio with model
          if (modelRef.current) {
            // Create a File object from the Blob with proper name and type
            const audioFile = new File(
              [audioBlob], 
              "recording.webm", 
              { type: mediaRecorder.mimeType }
            );
            
            console.log("Transcribing audio...");
            const result = await modelRef.current(audioFile);
            console.log("Transcription result:", result);
            
            if (result && result.text && result.text.trim() !== "") {
              onResult(result.text);
            } else {
              onError("No speech detected");
            }
          } else {
            onError("Speech recognition model not initialized");
          }
        } catch (error: any) {
          console.error("Error processing audio:", error);
          onError(`Failed to process speech: ${error.message || "Unknown error"}`);
        } finally {
          // Close all audio tracks
          stream.getTracks().forEach(track => track.stop());
        }
      };
      
      // Start recording with a timeslice to collect data more frequently
      mediaRecorder.start(250); // Collect data every 250ms
      if (onListeningChange) onListeningChange(true);
      console.log("Recording started");
      
    } catch (error: any) {
      console.error("Failed to start speech recognition:", error);
      onError(`Speech recognition failed to start: ${error.message || "Unknown error"}`);
      if (onListeningChange) onListeningChange(false);
    }
  }, [isInitialized, isInitializing, initializeModel, onListeningChange, onResult, onError]);
  
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
