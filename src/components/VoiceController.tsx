
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
      const numbers = transcript
        .split(' ')
        .map(word => parseInt(word))
        .filter(num => !isNaN(num) && num >= 0 && num <= 9)
        .slice(0, 3);

      if (numbers.length === 3) {
        onCoordinatesReceived(numbers);
        toast({
          title: "Coordinates received",
          description: `Using ${numbers.join(', ')}`
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error,
        variant: "destructive"
      });
    }
  });

  const handlePointerDown = () => {
    console.log("Starting listening");
    setIsListening(true);
    startListening();
  };

  const handlePointerUp = () => {
    console.log("Stopping listening");
    setIsListening(false);
    stopListening();
  };

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-10">
      <Button
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className={`
          rounded-full 
          px-12 
          py-12 
          text-2xl 
          flex 
          gap-3 
          items-center 
          select-none 
          ${isListening ? 'bg-red-500' : 'bg-primary hover:bg-primary/90'}
        `}
      >
        <Mic className="h-8 w-8" />
        {isListening ? 'Listening...' : 'Hold to Speak'}
      </Button>
    </div>
  );
};

export default VoiceController;
