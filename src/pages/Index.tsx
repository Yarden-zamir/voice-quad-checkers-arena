
import { useState, useCallback } from 'react';
import GameBoard from '../components/GameBoard';
import VoiceController from '../components/VoiceController';
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const { toast } = useToast();
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [isListening, setIsListening] = useState(false);
  // Initialize the 4x4x4 array
  const [markers, setMarkers] = useState([
    [[0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0]],
    [[0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0]],
    [[0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0]],
    [[0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0]]
  ]);

  const handleCellClick = useCallback((x: number, y: number, z: number) => {
    // Use the same logic as handleCoordinates, but for direct clicks
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
      
      toast({
        title: "Move placed",
        description: `Player ${currentPlayer} placed at position (${x+1}, ${y+1}, ${z+1})`,
      });

      return newMarkers;
    });

    setCurrentPlayer(current => current === 1 ? 2 : 1);
  }, [currentPlayer, toast]);

  const handleCoordinates = useCallback((coordinates: number[]) => {
    // Make sure we have all three coordinates
    if (!coordinates || coordinates.length !== 3) {
      console.log("Invalid coordinates received", coordinates);
      setIsListening(false);
      if (coordinates.length > 0) {
        toast({
          title: "Invalid coordinates",
          description: `Please provide exactly 3 numbers (x, y, z). Received: ${coordinates.join(', ')}`,
        });
      }
      return;
    }

    // Adjust coordinates to be 0-based and within bounds
    const [x, y, z] = coordinates.map(coord => Math.min(Math.max(coord, 1), 4) - 1);
    
    // Check if coordinates are valid
    if (x === undefined || y === undefined || z === undefined) {
      console.log("Invalid coordinates after mapping", { x, y, z });
      setIsListening(false);
      toast({
        title: "Invalid coordinates",
        description: "Please provide valid x, y, z coordinates between 1 and 4",
      });
      return;
    }

    // Use the cell click handler for consistency
    handleCellClick(x, y, z);
    setIsListening(false);
  }, [handleCellClick]);

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
        onCellClick={handleCellClick}
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
