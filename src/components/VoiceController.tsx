
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VoiceControllerProps {
  onCoordinatesReceived: (coordinates: number[]) => void;
  isListening: boolean;
  onStartListening: () => void;
}

const VoiceController: React.FC<VoiceControllerProps> = ({
  onCoordinatesReceived,
  isListening,
  onStartListening,
}) => {
  const [transcript, setTranscript] = useState('');
  const [recognitionError, setRecognitionError] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (!isListening) return;

    let recognition: SpeechRecognition;
    
    try {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognitionAPI) {
        console.error("Speech recognition not supported in this browser");
        setRecognitionError("Speech recognition not supported in your browser");
        return;
      }
      
      recognition = new SpeechRecognitionAPI();
      recognition.continuous = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const fullTranscript = event.results[0][0].transcript.trim();
        setTranscript(fullTranscript);
        processTranscript(fullTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setRecognitionError(`Error: ${event.error}`);
      };

      recognition.start();
      setTimeout(() => {
        if (recognition) {
          recognition.stop();
          onStartListening();  // This will set isListening to false
        }
      }, 2000);

    } catch (error) {
      console.error('Speech recognition is not supported:', error);
      setRecognitionError('Speech recognition is not supported in your browser');
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [isListening, onStartListening]);

  const processTranscript = (fullTranscript: string) => {
    console.log("Raw transcript:", fullTranscript);
    
    let coordinates: number[] = [];
    let processedTranscript = fullTranscript.split(' ')[0];
    
    if (/^\d+/.test(processedTranscript)) {
      const firstThreeDigits = processedTranscript.match(/\d+/g)?.slice(0, 3).join('');
      if (firstThreeDigits && firstThreeDigits.length === 3) {
        coordinates = firstThreeDigits.split('').map(Number);
      }
    } else {
      const numberWords: Record<string, number> = {
        'one': 1, 'two': 2, 'three': 3, 'four': 4,
        'won': 1, 'too': 2, 'to': 2, 'for': 4, 'fore': 4
      };
      
      coordinates = fullTranscript
        .split(/\s+/)
        .map(word => {
          const parsed = parseInt(word, 10);
          if (!isNaN(parsed)) return parsed;
          return numberWords[word.toLowerCase()] || NaN;
        })
        .filter(num => !isNaN(num))
        .slice(0, 3);
    }

    if (coordinates.length === 3) {
      console.log("Valid coordinates received:", coordinates);
      onCoordinatesReceived(coordinates);
      toast({
        title: "Coordinates Received",
        description: `Using ${coordinates.join(', ')} [Full transcript: ${fullTranscript}]`
      });
    } else {
      console.log('Please say three numbers for coordinates. Received:', coordinates);
      toast({
        title: "Invalid Input",
        description: `Please say three numbers (received ${coordinates.length}). [Full transcript: ${fullTranscript}]`,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center gap-4">
      {transcript && (
        <div className="bg-white px-4 py-2 rounded shadow mb-2">
          <p>You said: <strong>{transcript}</strong></p>
        </div>
      )}
      
      {recognitionError && (
        <div className="bg-red-50 text-red-700 px-4 py-2 rounded shadow mb-2">
          <p>{recognitionError}</p>
        </div>
      )}
      
      <Button 
        onClick={onStartListening}
        disabled={isListening}
        className={`px-12 py-8 text-2xl flex gap-3 items-center ${
          isListening ? 'bg-red-500' : 'bg-primary hover:bg-primary/90'
        }`}
      >
        {isListening ? (
          <>
            <Loader className="animate-spin h-8 w-8" />
            Listening...
          </>
        ) : (
          <>
            <Mic className="h-8 w-8" />
            Speak Coordinates
          </>
        )}
      </Button>
    </div>
  );
};

export default VoiceController;
