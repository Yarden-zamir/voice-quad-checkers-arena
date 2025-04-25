
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VoiceInputFabProps {
  onCoordinatesReceived: (x: number, y: number, z: number) => void;
}

const VoiceInputFab: React.FC<VoiceInputFabProps> = ({ onCoordinatesReceived }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const { toast } = useToast();

  // References for audio processing
  const recognizerRef = useRef<any>(null);
  const microphoneRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorNodeRef = useRef<ScriptProcessorNode | null>(null);

  // Initialize Vosk
  useEffect(() => {
    const initializeVosk = async () => {
      try {
        if (typeof window !== 'undefined') {
          // Import vosk dynamically
          const vosk = await import('vosk');
          const { Model, recognizerCallback, decodeMemory } = vosk;
          
          console.log("Loading Vosk model...");
          
          // Create the model and recognizer (with small English model)
          const modelPath = 'https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip';
          
          toast({
            title: "Voice Recognition",
            description: "Loading voice recognition model...",
            duration: 3000,
            className: "toast-with-progress",
          });
          
          // When model is loaded, set it to the recognizer ref
          try {
            const model = new Model(modelPath);
            recognizerRef.current = new vosk.Recognizer({
              model,
              sampleRate: 16000,
            });
            console.log("Vosk model loaded successfully");
          } catch (error) {
            console.error("Failed to load Vosk model:", error);
            toast({
              title: "Error",
              description: "Failed to load voice recognition model",
              duration: 3000,
              className: "toast-with-progress",
            });
          }
        }
      } catch (error) {
        console.error("Error initializing Vosk:", error);
        toast({
          title: "Error",
          description: "Failed to initialize voice recognition",
          duration: 3000,
          className: "toast-with-progress",
        });
      }
    };

    initializeVosk();

    // Cleanup function
    return () => {
      stopListening();
    };
  }, [toast]);

  // Start listening for voice input
  const startListening = async () => {
    try {
      if (!recognizerRef.current) {
        toast({
          title: "Loading",
          description: "Voice recognition is still loading",
          duration: 800,
          className: "toast-with-progress",
        });
        return;
      }

      // Request microphone access
      microphoneRef.current = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          channelCount: 1,
        },
      });

      // Create audio context
      audioContextRef.current = new AudioContext();
      const audioSource = audioContextRef.current.createMediaStreamSource(microphoneRef.current);
      
      // Create processor
      processorNodeRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      
      // Process audio data
      processorNodeRef.current.onaudioprocess = (e) => {
        const input = e.inputBuffer.getChannelData(0);
        const inputData = new Float32Array(input);
        
        if (recognizerRef.current) {
          const recognizerResult = recognizerRef.current.acceptWaveform(inputData);
          
          if (recognizerResult) {
            const result = recognizerRef.current.result();
            processRecognitionResult(result);
          }
        }
      };

      // Connect nodes
      audioSource.connect(processorNodeRef.current);
      processorNodeRef.current.connect(audioContextRef.current.destination);
      
      toast({
        title: "Voice Input Active",
        description: "Speak the coordinates (e.g., '2, 3, 4')",
        duration: 2000,
        className: "toast-with-progress",
      });

      setIsListening(true);
    } catch (error) {
      console.error("Error starting voice recognition:", error);
      toast({
        title: "Error",
        description: "Failed to access microphone",
        duration: 3000,
        className: "toast-with-progress",
      });
    }
  };

  // Stop listening
  const stopListening = () => {
    if (processorNodeRef.current && audioContextRef.current) {
      processorNodeRef.current.disconnect();
      processorNodeRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(console.error);
      audioContextRef.current = null;
    }
    
    if (microphoneRef.current) {
      microphoneRef.current.getTracks().forEach(track => track.stop());
      microphoneRef.current = null;
    }
    
    if (recognizerRef.current) {
      const finalResult = recognizerRef.current.finalResult();
      processRecognitionResult(finalResult);
    }
    
    setIsListening(false);
  };

  // Process recognition result
  const processRecognitionResult = (result: any) => {
    if (result && result.text) {
      setRecognizedText(result.text);
      
      // Extract coordinates from text using regex
      const coordinatesMatch = result.text.match(/(\d+)\D+(\d+)\D+(\d+)/);
      
      if (coordinatesMatch) {
        const x = parseInt(coordinatesMatch[1]);
        const y = parseInt(coordinatesMatch[2]);
        const z = parseInt(coordinatesMatch[3]);
        
        if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
          // Validate coordinates (they should be between 1 and 4 for this game)
          if (x >= 1 && x <= 4 && y >= 1 && y <= 4 && z >= 1 && z <= 4) {
            toast({
              title: "Coordinates Recognized",
              description: `Position: ${x}, ${y}, ${z}`,
              duration: 800,
              className: "toast-with-progress",
            });
            
            // Call the callback with the recognized coordinates
            onCoordinatesReceived(x, y, z);
            stopListening();
          } else {
            toast({
              title: "Invalid Coordinates",
              description: "Coordinates must be between 1 and 4",
              duration: 800,
              className: "toast-with-progress",
            });
          }
        }
      } else {
        console.log("No coordinates found in:", result.text);
      }
    }
  };

  // Toggle listening state
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <Button
      className="fixed bottom-4 left-4 rounded-full w-12 h-12 p-0 shadow-lg"
      onClick={toggleListening}
      variant="default"
    >
      {isListening ? (
        <MicOff className="h-6 w-6" />
      ) : (
        <Mic className="h-6 w-6" />
      )}
    </Button>
  );
};

export default VoiceInputFab;
