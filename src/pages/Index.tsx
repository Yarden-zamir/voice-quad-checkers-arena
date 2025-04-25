
import { useState, useCallback, useRef } from 'react';
import GameBoard from '../components/GameBoard';
import { useToast } from "@/components/ui/use-toast";
import { playErrorSound } from '../utils/audio';
import { checkWin } from '../utils/winConditions';
import { Progress } from "@/components/ui/progress";

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
  
  // Use a ref to prevent state updates during render
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCellClick = useCallback((x: number, y: number, z: number) => {
    if (gameOver) {
      // Use setTimeout to avoid state updates during render
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = setTimeout(() => {
        toast({
          title: "Game Over",
          description: "Please start a new game",
          duration: 800,
          className: "toast-with-progress",
        });
      }, 0);
      return;
    }

    setMarkers(prev => {
      if (!prev[x] || !prev[x][y] || prev[x][y][z] === undefined) {
        playErrorSound();
        // Use setTimeout to avoid state updates during render
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = setTimeout(() => {
          toast({
            title: "Invalid position",
            description: `Coordinates (${x+1}, ${y+1}, ${z+1}) are out of bounds`,
            duration: 800,
            className: "toast-with-progress",
          });
        }, 0);
        return prev;
      }

      if (prev[x][y][z] !== 0) {
        playErrorSound();
        // Use setTimeout to avoid state updates during render
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = setTimeout(() => {
          toast({
            title: "Position already taken",
            description: "Please choose another position",
            duration: 800,
            className: "toast-with-progress",
          });
        }, 0);
        return prev;
      }

      const newMarkers = JSON.parse(JSON.stringify(prev));
      newMarkers[x][y][z] = currentPlayer;
      
      setLastMove({ x, y, z });
      
      // Always switch the player on valid moves
      setTimeout(() => {
        setCurrentPlayer(current => current === 1 ? 2 : 1);
      }, 0);
      
      if (checkWin(newMarkers, currentPlayer)) {
        setGameOver(true);
        // Use setTimeout to avoid state updates during render
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = setTimeout(() => {
          toast({
            title: "Game Over!",
            description: `Player ${currentPlayer} wins!`,
            duration: 800,
            className: "toast-with-progress",
          });
        }, 0);
      } else {
        // Use setTimeout to avoid state updates during render
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = setTimeout(() => {
          toast({
            title: "Move placed",
            description: `Player ${currentPlayer} placed at position (${x+1}, ${y+1}, ${z+1})`,
            duration: 800,
            className: "toast-with-progress",
          });
        }, 0);
      }

      return newMarkers;
    });
  }, [currentPlayer, gameOver, toast]);

  const bgColor = currentPlayer === 1 ? 'bg-purple-500/20' : 'bg-blue-500/20';

  return (
    <div className={`relative min-h-screen transition-colors duration-300 ${bgColor}`}>
      {gameOver && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-10 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full">
          <h1 className="text-2xl font-bold text-white">
            Player {currentPlayer === 1 ? 2 : 1} Wins!
          </h1>
        </div>
      )}
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
