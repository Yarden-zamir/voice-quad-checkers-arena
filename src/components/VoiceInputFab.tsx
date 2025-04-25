
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { pipeline } from "@huggingface/transformers";

interface VoiceInputFabProps {
  onCoordinatesReceived: (x: number, y: number, z: number) => void;
}

const VoiceInputFab: React.FC<VoiceInputFabProps> = ({ onCoordinatesReceived }) => {
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();
  const transcriber = useRef<any>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const initializeTranscriber = async () => {
    if (!transcriber.current) {
      try {
        // Removed the quantized option as it's not recognized in the type definitions
        transcriber.current = await pipeline(
          "automatic-speech-recognition",
          "onnx-community/whisper-tiny.en"
        );
      } catch (error) {
        console.error("Failed to initialize transcriber:", error);
        toast({
          title: "Error",
          description: "Failed to initialize offline speech recognition",
          duration: 3000,
          className: "toast-with-progress",
        });
      }
    }
  };

  const startListening = async () => {
    try {
      await initializeTranscriber();
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        try {
          const result = await transcriber.current(audioBlob);
          console.log("Transcription result:", result);
          
          const text = result.text.toLowerCase();
          const coordinatesMatch = text.match(/(\d+)\D+(\d+)\D+(\d+)/);
          
          if (coordinatesMatch) {
            const x = parseInt(coordinatesMatch[1]);
            const y = parseInt(coordinatesMatch[2]);
            const z = parseInt(coordinatesMatch[3]);
            
            if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
              if (x >= 1 && x <= 4 && y >= 1 && y <= 4 && z >= 1 && z <= 4) {
                toast({
                  title: "Coordinates Recognized",
                  description: `Position: ${x}, ${y}, ${z}`,
                  duration: 800,
                  className: "toast-with-progress",
                });
                onCoordinatesReceived(x, y, z);
              } else {
                toast({
                  title: "Invalid Coordinates",
                  description: "Coordinates must be between 1 and 4",
                  duration: 800,
                  className: "toast-with-progress",
                });
              }
            }
          } else {
            toast({
              title: "No Coordinates Found",
              description: "Try saying three numbers, like '2 3 4'",
              duration: 1000,
              className: "toast-with-progress",
            });
          }
        } catch (error) {
          console.error("Transcription error:", error);
          toast({
            title: "Recognition Error",
            description: "Failed to process speech",
            duration: 3000,
            className: "toast-with-progress",
          });
        }
        setIsListening(false);
      };

      mediaRecorder.current.start();
      setIsListening(true);
      
      toast({
        title: "Voice Input Active",
        description: "Speak the coordinates (e.g., '2, 3, 4')",
        duration: 2000,
        className: "toast-with-progress",
      });
      
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        title: "Error",
        description: "Failed to access microphone",
        duration: 3000,
        className: "toast-with-progress",
      });
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
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
