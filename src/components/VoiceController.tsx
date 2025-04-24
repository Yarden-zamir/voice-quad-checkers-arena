
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";

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
      recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.continuous = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const words = event.results[0][0].transcript
          .trim()
          .split(' ')
          .map(Number)
          .filter(num => !isNaN(num));

        if (words.length === 3) {
          onCoordinatesReceived(words);
        } else {
          console.log('Please say three numbers for coordinates');
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
