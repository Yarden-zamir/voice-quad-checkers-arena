
import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";

// Add TypeScript interfaces for the Web Speech API
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

// Add global interfaces
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
  useEffect(() => {
    if (!isListening) return;

    let recognition: SpeechRecognition;
    
    try {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition = new SpeechRecognitionAPI();
      recognition.continuous = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript.trim();
        const words = transcript.split(' ').map(Number).filter(num => !isNaN(num));

        if (words.length === 3) {
          console.log("Coordinates received:", words);
          onCoordinatesReceived(words);
        } else {
          console.log('Please say three numbers for coordinates. Received:', transcript);
        }
      };

      recognition.onend = () => {
        console.log("Speech recognition ended");
        if (isListening) {
          onCoordinatesReceived([]);
        }
      };

      recognition.start();
    } catch (error) {
      console.error('Speech recognition is not supported:', error);
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [isListening, onCoordinatesReceived]);

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-10">
      <Button 
        onClick={onStartListening}
        disabled={isListening}
        className={`px-8 py-4 text-lg ${
          isListening ? 'bg-red-500' : 'bg-primary hover:bg-primary/90'
        }`}
      >
        {isListening ? 'Listening...' : 'Start Speaking'}
      </Button>
    </div>
  );
};

export default VoiceController;
