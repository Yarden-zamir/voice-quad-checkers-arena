
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VoiceInputFabProps {
  onCoordinatesReceived: (x: number, y: number, z: number) => void;
}

const VoiceInputFab: React.FC<VoiceInputFabProps> = ({ onCoordinatesReceived }) => {
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();
  
  // Reference for SpeechRecognition
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  // Start listening for voice input
  const startListening = async () => {
    try {
      // Check if the browser supports the Web Speech API
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        toast({
          title: "Error",
          description: "Speech recognition is not supported in this browser",
          duration: 3000,
          className: "toast-with-progress",
        });
        return;
      }
      
      // Initialize the speech recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      // Configure speech recognition
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.maxAlternatives = 1;
      
      // Set up event handlers
      recognitionRef.current.onresult = (event) => {
        const speechResult = event.results[0][0].transcript;
        console.log("Speech recognized:", speechResult);
        
        // Extract coordinates from text using regex
        const coordinatesMatch = speechResult.match(/(\d+)\D+(\d+)\D+(\d+)/);
        
        if (coordinatesMatch) {
          const x = parseInt(coordinatesMatch[1]);
          const y = parseInt(coordinatesMatch[2]);
          const z = parseInt(coordinatesMatch[3]);
          
          if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
            // Validate coordinates
            if (x >= 1 && x <= 4 && y >= 1 && y <= 4 && z >= 1 && z <= 4) {
              toast({
                title: "Coordinates Recognized",
                description: `Position: ${x}, ${y}, ${z}`,
                duration: 800,
                className: "toast-with-progress",
              });
              
              // Call the callback with the recognized coordinates
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
        
        stopListening();
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        toast({
          title: "Recognition Error",
          description: event.error === "not-allowed" 
            ? "Microphone access denied" 
            : "Failed to recognize speech",
          duration: 3000,
          className: "toast-with-progress",
        });
        stopListening();
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
      
      // Start recognition
      recognitionRef.current.start();
      setIsListening(true);
      
      toast({
        title: "Voice Input Active",
        description: "Speak the coordinates (e.g., '2, 3, 4')",
        duration: 2000,
        className: "toast-with-progress",
      });
      
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      toast({
        title: "Error",
        description: "Failed to start voice recognition",
        duration: 3000,
        className: "toast-with-progress",
      });
      setIsListening(false);
    }
  };

  // Stop listening
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
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
