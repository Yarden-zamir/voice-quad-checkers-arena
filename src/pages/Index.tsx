
import { useState, useCallback } from 'react';
import GameBoard from '../components/GameBoard';
import { useToast } from "@/components/ui/use-toast";
import { playErrorSound } from '../utils/audio';
import { checkWin } from '../utils/winConditions';

const Index = () => {
  const { toast } = useToast();
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [lastMove, setLastMove] = useState<{ x: number; y: number; z: number } | null>(null);
  const [markers, setMarkers] = useState([
    [[0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0]],
    [[0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0]],
    [[0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0]],
    [[0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0]]
  ]);

  const handleCellClick = useCallback((x: number, y: number, z: number) => {
    if (gameOver) {
      toast({
        title: "Game Over",
        description: "Please start a new game",
      });
      return;
    }

    setMarkers(prev => {
      if (!prev[x] || !prev[x][y] || prev[x][y][z] === undefined) {
        playErrorSound();
        toast({
          title: "Invalid position",
          description: `Coordinates (${x+1}, ${y+1}, ${z+1}) are out of bounds`,
        });
        return prev;
      }

      if (prev[x][y][z] !== 0) {
        playErrorSound();
        toast({
          title: "Position already taken",
          description: "Please choose another position",
        });
        return prev;
      }

      const newMarkers = JSON.parse(JSON.stringify(prev));
      newMarkers[x][y][z] = currentPlayer;
      
      setLastMove({ x, y, z });
      
      if (checkWin(newMarkers, currentPlayer)) {
        setGameOver(true);
        toast({
          title: "Game Over!",
          description: `Player ${currentPlayer} wins!`,
        });
      } else {
        toast({
          title: "Move placed",
          description: `Player ${currentPlayer} placed at position (${x+1}, ${y+1}, ${z+1})`,
        });
      }

      return newMarkers;
    });

    setCurrentPlayer(current => current === 1 ? 2 : 1);
  }, [currentPlayer, gameOver, toast]);

  return (
    <div className="relative">
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-10 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full">
        <h1 className="text-2xl font-bold text-white">
          {gameOver ? `Player ${currentPlayer === 1 ? 2 : 1} Wins!` : `Player ${currentPlayer}'s Turn`}
        </h1>
      </div>
      <GameBoard 
        markers={markers}
        currentPlayer={currentPlayer}
        onCellClick={handleCellClick}
        lastMove={lastMove}
      />
    </div>
  );
};

export default Index;

