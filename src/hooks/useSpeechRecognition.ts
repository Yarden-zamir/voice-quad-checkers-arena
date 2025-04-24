
interface SpeechRecognitionProps {
  onResult: (transcript: string) => void;
  onError: (error: string) => void;
}

export const useSpeechRecognition = ({ onResult, onError }: SpeechRecognitionProps) => {
  let recognition: SpeechRecognition | null = null;

  const startListening = () => {
    try {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognitionAPI) {
        onError("Speech recognition not supported in your browser");
        return;
      }

      recognition = new SpeechRecognitionAPI();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
      };

      recognition.onerror = (event) => {
        if (event.error !== 'aborted') {
          onError(`Error: ${event.error}`);
        }
      };

      recognition.start();
    } catch (error) {
      onError("Speech recognition failed to start");
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      recognition = null;
    }
  };

  return {
    startListening,
    stopListening
  };
};
