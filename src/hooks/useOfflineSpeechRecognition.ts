
import { useState, useEffect, useCallback } from 'react';
import * as speechCommands from '@tensorflow-models/speech-commands';
import { useToast } from "@/components/ui/use-toast";

export const useOfflineSpeechRecognition = () => {
  const [model, setModel] = useState<speechCommands.SpeechCommandRecognizer | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadModel = async () => {
      try {
        setIsModelLoading(true);
        const recognizer = speechCommands.create('BROWSER_FFT');
        await recognizer.ensureModelLoaded();
        setModel(recognizer);
      } catch (error) {
        console.error('Failed to load offline speech model:', error);
        toast({
          title: "Error",
          description: "Failed to load offline speech recognition model",
          variant: "destructive"
        });
      } finally {
        setIsModelLoading(false);
      }
    };

    loadModel();

    return () => {
      if (model) {
        model.stopListening();
      }
    };
  }, []);

  const startListening = useCallback(async (onResult: (words: string) => void) => {
    if (!model) return;

    try {
      await model.listen(
        (result) => {
          const scores = Array.from(result.scores);
          const maxScore = Math.max(...scores);
          const maxIndex = scores.indexOf(maxScore);
          const word = model.wordLabels()[maxIndex];
          onResult(word);
        },
        {
          includeSpectrogram: true,
          probabilityThreshold: 0.75
        }
      );
    } catch (error) {
      console.error('Error starting offline recognition:', error);
      toast({
        title: "Error",
        description: "Failed to start offline speech recognition",
        variant: "destructive"
      });
    }
  }, [model]);

  const stopListening = useCallback(() => {
    if (model) {
      model.stopListening();
    }
  }, [model]);

  return {
    startListening,
    stopListening,
    isModelLoading,
  };
};
