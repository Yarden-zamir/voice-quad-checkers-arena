
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface VoiceControllerProps {
  onCoordinatesReceived: (coordinates: number[]) => void;
}

const VoiceController: React.FC<VoiceControllerProps> = ({
  onCoordinatesReceived,
}) => {
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();
  
  const { startListening, stopListening } = useSpeechRecognition({
    onResult: (transcript) => {
      console.log("Processing transcript:", transcript);
      
      // Extract numbers from the transcript
      const numbers = transcript
        .split(' ')
        .map(word => {
          const num = parseInt(word);
          return isNaN(num) ? null : num;
        })
        .filter(num => num !== null && num >= 0 && num <= 9)
        .slice(0, 3) as number[];

      console.log("Extracted numbers:", numbers);

      // Only proceed if we have exactly 3 numbers
      if (numbers.length === 3) {
        onCoordinatesReceived(numbers);
        toast({
          title: "Coordinates received",
          description: `Using ${numbers.join(', ')}`
        });
      } else {
        toast({
          title: "Incomplete coordinates",
          description: `Need exactly 3 numbers. Got: ${numbers.length > 0 ? numbers.join(', ') : 'none'}`,
          variant: "destructive"
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Voice recognition error",
        description: error,
        variant: "destructive"
      });
    }
  });

  const handlePointerDown = () => {
    console.log("Button pressed - starting listening");
    setIsListening(true);
    startListening();
  };

  const handlePointerUp = () => {
    console.log("Button released - stopping listening");
    setIsListening(false);
    stopListening();
  };

  // Handle pointer leave to prevent button staying in active state if pointer leaves while pressed
  const handlePointerLeave = () => {
    if (isListening) {
      console.log("Pointer left while listening - stopping listening");
      setIsListening(false);
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
        <Mic className="h-8 w-8 mb-1" />
        <span className="text-sm select-none">
          {isListening ? 'Listening...' : 'Hold to Speak'}
        </span>
      </Button>
    </div>
  );
};

export default VoiceController;
