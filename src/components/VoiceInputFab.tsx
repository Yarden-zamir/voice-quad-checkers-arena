
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VoiceInputFabProps {
  onCoordinatesReceived: (x: number, y: number, z: number) => void;
}

const VoiceInputFab: React.FC<VoiceInputFabProps> = ({ onCoordinatesReceived }) => {
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const recognition = useRef<SpeechRecognition | null>(null);

  const initializeSpeechRecognition = () => {
    if (!recognition.current) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        toast({
          title: "Error",
          description: "Speech recognition is not supported in this browser",
          duration: 3000,
          className: "toast-with-progress",
        });
        return false;
      }
      
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = 'en-US';

      recognition.current.onresult = (event) => {
        const text = event.results[0][0].transcript.toLowerCase();
        console.log("Recognized text:", text);
        
        const coordinatesMatch = text.match(/(\d+)\D+(\d+)\D+(\d+)/);
        
        if (coordinatesMatch) {
          const x = parseInt(coordinatesMatch[1]);
          const y = parseInt(coordinatesMatch[2]);
          const z = parseInt(coordinatesMatch[3]);
          
          if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
            if (x >= 1 && x <= 4 && y >= 1 && y <= 4 && z >= 1 && z <= 4) {
              toast({
                title: "Coordinates Recognized",
                description: `Position: ${x}, ${y}, ${z}`,
                duration: 800,
                className: "toast-with-progress",
              });
              onCoordinatesReceived(x, y, z);
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
          toast({
            title: "No Coordinates Found",
            description: "Try saying three numbers, like '2 3 4'",
            duration: 1000,
            className: "toast-with-progress",
          });
        }
        setIsListening(false);
        setIsLoading(false);
      };

      recognition.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        toast({
          title: "Recognition Error",
          description: `Failed to process speech: ${event.error}`,
          duration: 3000,
          className: "toast-with-progress",
        });
        setIsListening(false);
        setIsLoading(false);
      };

      recognition.current.onend = () => {
        setIsListening(false);
        setIsLoading(false);
      };
    }
    return true;
  };

  const startListening = () => {
    setIsLoading(true);
    if (initializeSpeechRecognition()) {
      try {
        recognition.current?.start();
        setIsListening(true);
        toast({
          title: "Voice Input Active",
          description: "Speak the coordinates (e.g., '2, 3, 4')",
          duration: 2000,
          className: "toast-with-progress",
        });
      } catch (error) {
        console.error("Error starting recognition:", error);
        toast({
          title: "Error",
          description: "Failed to start voice recognition",
          duration: 3000,
          className: "toast-with-progress",
        });
        setIsListening(false);
        setIsLoading(false);
      }
    }
  };

  const stopListening = () => {
    if (recognition.current) {
      recognition.current.stop();
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <Button
      className={`fixed bottom-4 left-4 rounded-full w-12 h-12 p-0 shadow-lg ${isLoading ? 'animate-pulse' : ''}`}
      onClick={toggleListening}
      variant="default"
      disabled={isLoading && !isListening}
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
