import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, Loader, WifiOff } from "lucide-react";
import { useOfflineSpeechRecognition } from '../hooks/useOfflineSpeechRecognition';
import { useToast } from "@/hooks/use-toast";

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  [index: number]: SpeechRecognitionResult;
  item(index: number): SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  [index: number]: SpeechRecognitionAlternative;
  item(index: number): SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: Event) => void;
  onend: (event: Event) => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

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
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const { startListening: startOfflineListening, stopListening: stopOfflineListening, isModelLoading } = useOfflineSpeechRecognition();
  const { toast } = useToast();

  useEffect(() => {
    if (!isListening) return;

    let timeoutId: NodeJS.Timeout;

    if (isOfflineMode) {
      startOfflineListening((text) => {
        setTranscript(text);
        processTranscript(text);
      });
      return () => stopOfflineListening();
    }

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
        console.log("Raw transcript:", fullTranscript);
        
        processTranscript(fullTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setRecognitionError(`Error: ${event.error}`);
      };

      recognition.onend = () => {
        console.log("Speech recognition ended");
      };

      recognition.start();
      
      timeoutId = setTimeout(() => {
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
      clearTimeout(timeoutId);
      if (recognition) {
        recognition.stop();
      }
    };
  }, [isListening, onCoordinatesReceived, isOfflineMode]);

  const processTranscript = (fullTranscript: string) => {
    console.log("Raw transcript:", fullTranscript);
    
    let coordinates: number[] = [];
    let processedTranscript = fullTranscript.split(' ')[0]; // Only take the first word/number
    
    if (/^\d+/.test(processedTranscript)) {
      const firstThreeDigits = processedTranscript.match(/\d+/g)?.slice(0, 3).join('');
      if (firstThreeDigits && firstThreeDigits.length === 3) {
        coordinates = firstThreeDigits.split('').map(Number);
      }
    } else {
      const words = processedTranscript.split(/\s+/);
      const numberWords: Record<string, number> = {
        'one': 1, 'two': 2, 'three': 3, 'four': 4,
        'won': 1, 'too': 2, 'to': 2, 'for': 4, 'fore': 4
      };
      
      coordinates = words
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
      <Button
        onClick={() => setIsOfflineMode(prev => !prev)}
        variant="outline"
        className="mb-2"
      >
        <WifiOff className={`mr-2 ${isOfflineMode ? 'text-red-500' : ''}`} />
        {isOfflineMode ? 'Offline Mode' : 'Online Mode'}
      </Button>

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
        disabled={isListening || isModelLoading}
        className={`px-12 py-8 text-2xl flex gap-3 items-center ${
          isListening ? 'bg-red-500' : 'bg-primary hover:bg-primary/90'
        }`}
      >
        {isListening || isModelLoading ? (
          <>
            <Loader className="animate-spin h-8 w-8" />
            {isModelLoading ? 'Loading Model...' : 'Listening...'}
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
