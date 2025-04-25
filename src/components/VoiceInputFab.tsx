
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface VoiceInputFabProps {
  onCoordinatesReceived: (x: number, y: number, z: number) => void;
  fullScreen?: boolean;
  currentPlayer: number;
}

const VoiceInputFab: React.FC<VoiceInputFabProps> = ({ 
  onCoordinatesReceived, 
  fullScreen = false,
  currentPlayer
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const recognition = useRef<SpeechRecognition | null>(null);

  const extractNumbers = (text: string): number[] => {
    const spacedText = text.replace(/(\d)(?=\d)/g, '$1 ');
    return spacedText.split(/\s+/).map(Number).filter(num => !isNaN(num));
  };

  const handleCoordinates = (text: string) => {
    const numbers = extractNumbers(text);
    
    if (numbers.length >= 3) {
      const [x, y, z] = numbers;
      if (x >= 1 && x <= 4 && y >= 1 && y <= 4 && z >= 1 && z <= 4) {
        toast({
          title: "Coordinates Recognized",
          description: `Position: ${x}, ${y}, ${z}`,
          duration: 3000,
        });
        
        // Call the handler function with the coordinates
        onCoordinatesReceived(x, y, z);
      } else {
        toast({
          title: "Invalid Coordinates",
          description: "Coordinates must be between 1 and 4",
          duration: 3000,
        });
      }
    } else {
      toast({
        title: "No Coordinates Found",
        description: `You said: "${text}". Try saying three numbers, like '2 3 4'`,
        duration: 5000,
      });
    }
  };

  const initializeSpeechRecognition = () => {
    if (!recognition.current) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        console.error("Speech recognition not supported");
        toast({
          title: "Error",
          description: "Speech recognition is not supported in this browser",
          duration: 3000,
          variant: "destructive",
        });
        return false;
      }
      
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = 'en-US';

      recognition.current.onstart = () => {
        console.log("Speech recognition started");
        toast({
          title: "Voice Input Active",
          description: "Listening for coordinates...",
          duration: 3000,
        });
      };

      recognition.current.onresult = (event) => {
        const text = event.results[0][0].transcript.toLowerCase();
        console.log("Recognized text:", text);
        
        // Always show what the user said
        toast({
          title: "You said:",
          description: text,
          duration: 5000,
        });
        
        handleCoordinates(text);
        setIsListening(false);
        setIsLoading(false);
      };

      recognition.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        toast({
          title: "Recognition Error",
          description: `Failed to process speech: ${event.error}`,
          duration: 3000,
          variant: "destructive",
        });
        setIsListening(false);
        setIsLoading(false);
      };

      recognition.current.onend = () => {
        console.log("Speech recognition ended");
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
        console.log("Starting voice recognition");
        toast({
          title: "Voice Input Active",
          description: "Speak the coordinates (e.g., '2, 3, 4')",
          duration: 3000,
        });
      } catch (error) {
        console.error("Error starting recognition:", error);
        toast({
          title: "Error",
          description: "Failed to start voice recognition",
          duration: 3000,
          variant: "destructive",
        });
        setIsListening(false);
        setIsLoading(false);
      }
    }
  };

  const stopListening = () => {
    if (recognition.current) {
      recognition.current.stop();
      console.log("Stopping voice recognition");
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
      className={cn(
        "fixed bottom-8 left-8 rounded-full w-16 h-16 p-0 shadow-lg transition-all duration-300 ease-in-out",
        {
          "w-72 h-72": fullScreen,
          "animate-pulse": isLoading && !isListening,
          "hover:scale-105": !fullScreen,
          "hover:scale-102": fullScreen,
          "bg-purple-500 hover:bg-purple-600": currentPlayer === 1,
          "bg-blue-500 hover:bg-blue-600": currentPlayer === 2
        }
      )}
      onClick={toggleListening}
      variant="default"
      disabled={isLoading && !isListening}
    >
      {isListening ? (
        <MicOff className={cn("h-8 w-8 transition-all duration-300", { 
          "h-32 w-32": fullScreen 
        })} />
      ) : (
        <Mic className={cn("h-8 w-8 transition-all duration-300", { 
          "h-32 w-32": fullScreen 
        })} />
      )}
    </Button>
  );
};

export default VoiceInputFab;
