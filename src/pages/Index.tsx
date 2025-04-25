
import { useState, useCallback, useRef, useEffect } from 'react';
import GameBoard from '../components/GameBoard';
import { Settings } from '../components/Settings';
import { TileSizeProvider } from '../contexts/TileSizeContext';
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
    <TileSizeProvider>
      <div className={`relative min-h-screen transition-colors duration-300 ${bgColor}`}>
        <Settings />
        <WinCelebration isActive={gameOver} />
        <GameBoard 
          markers={markers}
          currentPlayer={currentPlayer}
          onCellClick={handleCellClick}
          onResetGame={resetGame}
          lastMove={lastMove}
        />
      </div>
    </TileSizeProvider>
  );
};

export default Index;
