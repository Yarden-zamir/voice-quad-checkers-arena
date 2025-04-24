
import { useState, useCallback } from 'react';
import GameBoard from '../components/GameBoard';
import VoiceController from '../components/VoiceController';
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const { toast } = useToast();
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [isListening, setIsListening] = useState(false);
  const [markers, setMarkers] = useState(Array(3).fill(null).map(() => 
    Array(3).fill(null).map(() => Array(3).fill(0))
  ));

  const handleCoordinates = useCallback((coordinates: number[]) => {
    const [x, y, z] = coordinates.map(coord => Math.min(Math.max(coord, 1), 3) - 1);
    
    setMarkers(prev => {
      if (prev[x][y][z] !== 0) {
        toast({
          title: "Position already taken",
          description: "Please choose another position",
        });
        return prev;
      }

      const newMarkers = [...prev];
      newMarkers[x] = [...prev[x]];
      newMarkers[x][y] = [...prev[x][y]];
      newMarkers[x][y][z] = currentPlayer;
      
      return newMarkers;
    });

    setCurrentPlayer(current => current === 1 ? 2 : 1);
    setIsListening(false);
  }, [currentPlayer, toast]);

  return (
    <div className="relative">
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-10 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full">
        <h1 className="text-2xl font-bold text-white">
          Player {currentPlayer}'s Turn
        </h1>
      </div>
      <GameBoard 
        markers={markers}
        currentPlayer={currentPlayer}
      />
      <VoiceController 
        onCoordinatesReceived={handleCoordinates}
        isListening={isListening}
        onStartListening={() => setIsListening(true)}
      />
    </div>
  );
};

export default Index;
