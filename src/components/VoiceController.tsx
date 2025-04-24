
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, Loader } from "lucide-react";

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
  const [transcript, setTranscript] = useState('');
  const [recognitionError, setRecognitionError] = useState('');

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
        console.log("Raw transcript:", fullTranscript);
        
        // Extract coordinates using multiple methods
        let coordinates: number[] = [];
        
        // Method 1: Check if it's a single number that needs to be split
        // This handles cases like "331" to become [3,3,1]
        if (/^\d+$/.test(fullTranscript.replace(/\s+/g, ''))) {
          const digits = fullTranscript.replace(/\s+/g, '').split('');
          if (digits.length === 3) {
            coordinates = digits.map(Number);
          }
        }
        
        // Method 2: Extract individual numbers (if Method 1 didn't work)
        if (coordinates.length !== 3) {
          coordinates = fullTranscript.split(/\s+/).map(word => {
            // Convert word numbers to digits
            const numberWords: Record<string, number> = {
              'one': 1, 'two': 2, 'three': 3, 'four': 4,
              'won': 1, 'too': 2, 'to': 2, 'for': 4, 'fore': 4
            };
            
            // Try to parse the word as a number or map it if it's a word number
            const parsed = parseInt(word, 10);
            if (!isNaN(parsed)) return parsed;
            return numberWords[word.toLowerCase()] || NaN;
          }).filter(num => !isNaN(num));
        }

        console.log("Extracted coordinates:", coordinates);
        
        if (coordinates.length === 3) {
          console.log("Valid coordinates received:", coordinates);
          onCoordinatesReceived(coordinates);
        } else {
          console.log('Please say three numbers for coordinates. Received:', coordinates);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setRecognitionError(`Error: ${event.error}`);
      };

      recognition.onend = () => {
        console.log("Speech recognition ended");
        // Don't automatically call onCoordinatesReceived with empty array
      };

      recognition.start();
    } catch (error) {
      console.error('Speech recognition is not supported:', error);
      setRecognitionError('Speech recognition is not supported in your browser');
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [isListening, onCoordinatesReceived]);

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center gap-2">
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
        className={`px-8 py-4 text-lg flex gap-2 items-center ${
          isListening ? 'bg-red-500' : 'bg-primary hover:bg-primary/90'
        }`}
      >
        {isListening ? (
          <>
            <Loader className="animate-spin h-5 w-5" />
            Listening...
          </>
        ) : (
          <>
            <Mic className="h-5 w-5" />
            Speak Coordinates
          </>
        )}
      </Button>
    </div>
  );
};

export default VoiceController;
