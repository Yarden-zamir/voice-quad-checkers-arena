import { useState, useCallback, useRef, useEffect } from 'react';
import GameBoard from '../components/GameBoard';
import { useToast } from "@/hooks/use-toast";
import { playErrorSound, playWinSound } from '../utils/audio';
import { checkWin } from '../utils/winConditions';
import WinCelebration from '../components/WinCelebration';
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

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
  
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentPlayerRef = useRef(currentPlayer);

  useEffect(() => {
    currentPlayerRef.current = currentPlayer;
  }, [currentPlayer]);

  const resetGame = () => {
    setMarkers([
      [[0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0]],
      [[0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0]],
      [[0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0]],
      [[0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0]]
    ]);
    setCurrentPlayer(1);
    setGameOver(false);
    setLastMove(null);
    toast({
      title: "Game Reset",
      description: "Starting a new game",
      duration: 800,
      className: "toast-with-progress",
    });
  };

  const handleCellClick = useCallback((x: number, y: number, z: number) => {
    if (gameOver) {
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

    const player = currentPlayerRef.current;

    setMarkers(prev => {
      if (!prev[x] || !prev[x][y] || prev[x][y][z] === undefined) {
        playErrorSound();
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
      newMarkers[x][y][z] = player;
      
      setLastMove({ x, y, z });
      
      const nextPlayer = player === 1 ? 2 : 1;
      
      if (checkWin(newMarkers, player)) {
        setGameOver(true);
        playWinSound();
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = setTimeout(() => {
          toast({
            title: "Game Over!",
            description: `Player ${player} wins!`,
            duration: 800,
            className: "toast-with-progress",
          });
        }, 0);
      } else {
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = setTimeout(() => {
          toast({
            title: "Move placed",
            description: `Player ${player} placed at position (${x+1}, ${y+1}, ${z+1})`,
            duration: 800,
            className: "toast-with-progress",
          });
        }, 0);
        
        setTimeout(() => {
          setCurrentPlayer(nextPlayer);
        }, 0);
      }

      return newMarkers;
    });
  }, [gameOver, toast]);

  const bgColor = currentPlayer === 1 ? 'bg-purple-500/20' : 'bg-blue-500/20';

  return (
    <div className={`relative min-h-screen transition-colors duration-300 ${bgColor}`}>
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center gap-4">
        <Button 
          onClick={resetGame}
          variant="secondary"
          className="bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white/90"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset Game
        </Button>
        {gameOver && (
          <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-full">
            <h1 className="text-2xl font-bold text-white">
              Player {currentPlayer === 1 ? 2 : 1} Wins!
            </h1>
          </div>
        )}
      </div>
      <WinCelebration isActive={gameOver} />
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
