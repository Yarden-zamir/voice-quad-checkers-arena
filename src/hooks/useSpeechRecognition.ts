
interface SpeechRecognitionProps {
  onResult: (transcript: string) => void;
  onError: (error: string) => void;
  onListeningChange?: (isListening: boolean) => void;
}

export const useSpeechRecognition = ({ onResult, onError, onListeningChange }: SpeechRecognitionProps) => {
  // Use a closure to store the recognition instance
  let recognitionInstance: SpeechRecognition | null = null;

  const startListening = () => {
    try {
      // Stop any existing recognition session first
      if (recognitionInstance) {
        recognitionInstance.abort();
        recognitionInstance = null;
      }

      // Get the appropriate SpeechRecognition interface
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognitionAPI) {
        onError("Speech recognition not supported in your browser");
        return;
      }

      // Create a new instance
      recognitionInstance = new SpeechRecognitionAPI();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      // Set up event handlers
      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log("Speech recognized:", transcript);
        onResult(transcript);
      };

      recognitionInstance.onerror = (event) => {
        if (event.error !== 'aborted') {
          console.error("Speech recognition error:", event.error);
          onError(`Error: ${event.error}`);
        }
      };

      recognitionInstance.onstart = () => {
        console.log("Speech recognition started");
        if (onListeningChange) onListeningChange(true);
      };

      recognitionInstance.onend = () => {
        console.log("Speech recognition ended");
        if (onListeningChange) onListeningChange(false);
      };

      // Start the recognition
      console.log("Starting speech recognition");
      recognitionInstance.start();
    } catch (error) {
      console.error("Failed to start speech recognition:", error);
      onError("Speech recognition failed to start");
      if (onListeningChange) onListeningChange(false);
    }
  };

  const stopListening = () => {
    if (recognitionInstance) {
      console.log("Stopping speech recognition");
      try {
        recognitionInstance.stop();
      } catch (error) {
        console.error("Error stopping speech recognition:", error);
      } finally {
        recognitionInstance = null;
      }
    }
  };

  return {
    startListening,
    stopListening
  };
};
