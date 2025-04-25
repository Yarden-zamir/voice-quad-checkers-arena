
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VoiceInputFabProps {
  onCoordinatesReceived: (x: number, y: number, z: number) => void;
}

const VoiceInputFab: React.FC<VoiceInputFabProps> = ({ onCoordinatesReceived }) => {
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();

  const toggleListening = () => {
    if (!isListening) {
      // For now we'll just mock the functionality until we implement the vosk library
      toast({
        title: "Voice Input",
        description: "Voice input will be implemented soon",
        duration: 800,
        className: "toast-with-progress",
      });
    }
    setIsListening(!isListening);
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
