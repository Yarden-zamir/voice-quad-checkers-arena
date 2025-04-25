
import React, { useState } from 'react';
import Board from './Board';
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, History } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface GameBoardProps {
  markers: number[][][];
  currentPlayer: number;
  onCellClick: (x: number, y: number, z: number) => void;
  lastMove?: { x: number; y: number; z: number } | null;
}

const GameBoard: React.FC<GameBoardProps> = ({ markers, currentPlayer, onCellClick, lastMove }) => {
  const [isHidden, setIsHidden] = useState(false);
  const [hideHistory, setHideHistory] = useState(false);

  return (
    <div className="pt-24 px-4 bg-gray-100 min-h-screen relative">
      <div className="fixed top-4 left-0 right-0 z-20 flex justify-center gap-4 bg-white/80 backdrop-blur-sm py-4 px-4 shadow-md">
        <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow">
          <Switch
            id="hide-history"
            checked={hideHistory}
            onCheckedChange={setHideHistory}
          />
          <label htmlFor="hide-history" className="text-sm font-medium cursor-pointer">
            <History className="h-4 w-4 inline-block mr-2" />
            Hide History
          </label>
        </div>
        
        <Button
          onClick={() => setIsHidden(prev => !prev)}
          className="shadow-sm"
        >
          {isHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          {isHidden ? 'Show Board' : 'Hide Board'}
        </Button>
      </div>
      
      {isHidden ? (
        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
          <p className="text-white text-2xl">Board Hidden</p>
        </div>
      ) : (
        <Board 
          markers={markers} 
          currentPlayer={currentPlayer} 
          onCellClick={onCellClick} 
          hideHistory={hideHistory}
          lastMove={lastMove}
        />
      )}
    </div>
  );
};

export default GameBoard;
