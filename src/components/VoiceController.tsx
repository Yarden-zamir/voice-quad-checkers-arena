
import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface VoiceControllerProps {
  onCoordinatesReceived: (coordinates: number[]) => void;
}

const VoiceController: React.FC<VoiceControllerProps> = ({
  onCoordinatesReceived,
}) => {
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();
  
  const handleTranscriptResult = useCallback((transcript: string) => {
    console.log("Processing transcript:", transcript);
    
    // Extract all numbers from the transcript
    // Look for both digit forms (1, 2, 3) and word forms (one, two, three)
    const wordToNumber: Record<string, number> = {
      'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 
      'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9
    };
    
    // First, try to extract digit numbers
    let numbers: number[] = [];
    const digitMatches = transcript.match(/\d/g);
    
    if (digitMatches) {
      numbers = digitMatches.map(digit => parseInt(digit)).slice(0, 3);
      console.log("Extracted digit numbers:", numbers);
    }
    
    // If we don't have enough digits, try to find number words
    if (numbers.length < 3) {
      const words = transcript.toLowerCase().split(/\s+/);
      
      for (const word of words) {
        if (numbers.length >= 3) break;
        const cleaned = word.replace(/[^a-z]/g, '');
        if (wordToNumber[cleaned] !== undefined) {
          numbers.push(wordToNumber[cleaned]);
        }
      }
      console.log("After adding word numbers:", numbers);
    }
    
    // Ensure we have exactly 3 numbers (pad with zeros if needed)
    while (numbers.length < 3) {
      numbers.push(0);
    }
    
    // Take just the first 3 numbers
    const finalNumbers = numbers.slice(0, 3);
    console.log("Final numbers to use:", finalNumbers);
    
    // Proceed with the coordinates
    onCoordinatesReceived(finalNumbers);
    
    // Provide feedback
    if (finalNumbers.length === 3) {
      toast({
        title: "Coordinates received",
        description: `Using ${finalNumbers.join(', ')}`
      });
    } else {
      toast({
        title: "Incomplete coordinates",
        description: `Need exactly 3 numbers. Using: ${finalNumbers.join(', ')}`,
        variant: "destructive"
      });
    }
  }, [onCoordinatesReceived, toast]);

  const { startListening, stopListening } = useSpeechRecognition({
    onResult: handleTranscriptResult,
    onError: (error) => {
      toast({
        title: "Voice recognition error",
        description: error,
        variant: "destructive"
      });
      setIsListening(false);
    },
    onListeningChange: (listening) => {
      setIsListening(listening);
    }
  });

  const handlePointerDown = () => {
    console.log("Button pressed - starting listening");
    startListening();
  };

  const handlePointerUp = () => {
    console.log("Button released - stopping listening");
    stopListening();
  };

  // Handle pointer leave to prevent button staying in active state if pointer leaves while pressed
  const handlePointerLeave = () => {
    if (isListening) {
      console.log("Pointer left while listening - stopping listening");
      stopListening();
    }
  };

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-10">
      <Button
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        className={`
          rounded-full 
          w-20 
          h-20 
          text-base
          flex 
          flex-col
          justify-center
          items-center 
          select-none 
          transition-colors
          duration-200
          ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'}
        `}
      >
        {isListening ? 
          <MicOff className="h-8 w-8 mb-1" /> : 
          <Mic className="h-8 w-8 mb-1" />
        }
        <span className="text-sm select-none">
          {isListening ? 'Listening...' : 'Hold to Speak'}
        </span>
      </Button>
    </div>
  );
};

export default VoiceController;
