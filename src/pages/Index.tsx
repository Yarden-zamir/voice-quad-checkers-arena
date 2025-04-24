
import { useState, useCallback } from 'react';
import GameBoard from '../components/GameBoard';
import VoiceController from '../components/VoiceController';
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const { toast } = useToast();
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [isListening, setIsListening] = useState(false);
  // Initialize the 3D array properly to avoid undefined access
  const [markers, setMarkers] = useState([
    [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
    [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
    [[0, 0, 0], [0, 0, 0], [0, 0, 0]]
  ]);

  const handleCoordinates = useCallback((coordinates: number[]) => {
    // Make sure we have all three coordinates
    if (!coordinates || coordinates.length !== 3) {
      console.log("Invalid coordinates received", coordinates);
      setIsListening(false);
      return;
    }

    // Adjust coordinates to be 0-based and within bounds
    const [x, y, z] = coordinates.map(coord => Math.min(Math.max(coord, 1), 3) - 1);
    
    // Check if coordinates are valid
    if (x === undefined || y === undefined || z === undefined) {
      console.log("Invalid coordinates after mapping", { x, y, z });
      setIsListening(false);
      return;
    }

    // Update markers with bounds checking
    setMarkers(prev => {
      // Ensure we have a valid position to modify
      if (!prev[x] || !prev[x][y] || prev[x][y][z] === undefined) {
        toast({
          title: "Invalid position",
          description: `Coordinates (${x+1}, ${y+1}, ${z+1}) are out of bounds`,
        });
        return prev;
      }

      // Check if position is already taken
      if (prev[x][y][z] !== 0) {
        toast({
          title: "Position already taken",
          description: "Please choose another position",
        });
        return prev;
      }

      // Create a deep copy of the markers array
      const newMarkers = JSON.parse(JSON.stringify(prev));
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
