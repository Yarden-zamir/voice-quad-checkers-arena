
import React, { useState } from 'react';
import Board from './Board';
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

interface GameBoardProps {
  markers: number[][][];
  currentPlayer: number;
  onCellClick: (x: number, y: number, z: number) => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ markers, currentPlayer, onCellClick }) => {
  const [isHidden, setIsHidden] = useState(false);

  return (
    <div className="py-16 px-4 bg-gray-100 min-h-screen relative">
      <Button
        onClick={() => setIsHidden(prev => !prev)}
        className="fixed top-24 right-4 z-20"
      >
        {isHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        {isHidden ? 'Show Board' : 'Hide Board'}
      </Button>
      
      {isHidden ? (
        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
          <p className="text-white text-2xl">Board Hidden</p>
        </div>
      ) : (
        <Board markers={markers} currentPlayer={currentPlayer} onCellClick={onCellClick} />
      )}
    </div>
  );
};

export default GameBoard;
