
import React, { useEffect, useState, useCallback } from 'react';
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
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();
  
  const startRecognition = useCallback(() => {
    let recognition: SpeechRecognition | undefined;
    let listenTimeout: number | undefined;
    
    try {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognitionAPI) {
        console.error("Speech recognition not supported in this browser");
        setRecognitionError("Speech recognition not supported in your browser");
        return { recognition, listenTimeout };
      }
      
      recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.start();
      setRecognitionError('');
      
      // Set a maximum listening time of 5 seconds
      listenTimeout = window.setTimeout(() => {
        if (recognition) {
          recognition.stop();
          onStartListening();  // Reset listening state
          
          // Process whatever we have if we timed out
          if (transcript) {
            processTranscript(transcript);
          } else {
            toast({
              title: "No input detected",
              description: "Please try speaking again",
              variant: "destructive"
            });
          }
        }
      }, 5000);
      
      return { recognition, listenTimeout };
    } catch (error) {
      console.error('Speech recognition is not supported:', error);
      setRecognitionError('Speech recognition is not supported in your browser');
      return { recognition: undefined, listenTimeout: undefined };
    }
  }, [transcript, onStartListening, toast]);

  useEffect(() => {
    if (!isListening) {
      setRetryCount(0);
      return;
    }

    let { recognition, listenTimeout } = startRecognition();
    
    if (recognition) {
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const currentTranscript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join(' ')
          .trim();
          
        setTranscript(currentTranscript);
        
        // Only process when we have a final result
        const mostRecentResult = event.results[event.results.length - 1];
        if (mostRecentResult.isFinal) {
          const hasThreeDigits = /\b\d{3}\b/.test(currentTranscript) || 
                                countNumberWords(currentTranscript) >= 3;
                                
          if (hasThreeDigits) {
            // Stop listening once we have what looks like three digits
            if (recognition) {
              recognition.stop();
              clearTimeout(listenTimeout);
              processTranscript(currentTranscript);
              onStartListening(); // Reset listening state
            }
          }
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);
        
        if (event.error === 'aborted' && retryCount < 2) {
          // Auto-retry up to 2 times on aborted errors
          setRetryCount(prev => prev + 1);
          
          if (listenTimeout) {
            clearTimeout(listenTimeout);
          }
          
          // Small delay before retrying
          setTimeout(() => {
            if (isListening) {
              const newSession = startRecognition();
              recognition = newSession.recognition;
              listenTimeout = newSession.listenTimeout;
              
              toast({
                title: "Reconnecting...",
                description: "Please continue speaking"
              });
            }
          }, 300);
        } else {
          setRecognitionError(`Error: ${event.error}`);
          if (event.error === 'aborted') {
            toast({
              title: "Voice recognition interrupted",
              description: "Please try again",
              variant: "destructive"
            });
            onStartListening(); // Reset listening state
          }
        }
      };

      recognition.onend = () => {
        // Only handle natural endings here
        // Aborted ones are handled in onerror
        if (isListening && !transcript && retryCount < 2) {
          setRetryCount(prev => prev + 1);
          
          // Small delay before retrying
          setTimeout(() => {
            if (isListening) {
              const newSession = startRecognition();
              recognition = newSession.recognition;
              listenTimeout = newSession.listenTimeout;
            }
          }, 300);
        }
      };
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
      if (listenTimeout) {
        clearTimeout(listenTimeout);
      }
    };
  }, [isListening, onStartListening, startRecognition, retryCount, transcript]);

  // Helper function to count number words in a string
  const countNumberWords = (text: string): number => {
    const numberWords = [
      'zero', 'one', 'two', 'three', 'four', 'five', 'six', 
      'seven', 'eight', 'nine', 'won', 'too', 'to', 'for', 'fore'
    ];
    
    const words = text.toLowerCase().split(/\s+/);
    const digits = words.filter(word => 
      !isNaN(parseInt(word)) || numberWords.includes(word)
    );
    
    return digits.length;
  };

  const processTranscript = (fullTranscript: string) => {
    console.log("Raw transcript:", fullTranscript);
    
    let coordinates: number[] = [];
    
    // Try to extract a 3-digit sequence first
    const threeDigitMatch = fullTranscript.match(/\b(\d{3})\b/);
    if (threeDigitMatch) {
      coordinates = threeDigitMatch[1].split('').map(Number);
    } else {
      // Process individual digits and number words
      const numberWords: Record<string, number> = {
        'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4,
        'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9,
        'won': 1, 'too': 2, 'to': 2, 'for': 4, 'fore': 4
      };
      
      // First, try to extract individual digits
      const digitMatches = fullTranscript.match(/\b\d\b/g);
      if (digitMatches && digitMatches.length >= 3) {
        coordinates = digitMatches.slice(0, 3).map(Number);
      } else {
        // Try spoken words and digits combined
        coordinates = fullTranscript
          .split(/\s+/)
          .map(word => {
            const parsed = parseInt(word, 10);
            if (!isNaN(parsed) && parsed >= 0 && parsed <= 9) return parsed;
            return numberWords[word.toLowerCase()] || NaN;
          })
          .filter(num => !isNaN(num))
          .slice(0, 3);
      }
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
            Listening{retryCount > 0 ? ` (retry ${retryCount})` : '...'}
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
