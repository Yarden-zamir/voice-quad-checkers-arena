
import React, { useState } from 'react';
import Board from './Board';
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, History } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import VoiceInputFab from './VoiceInputFab';

interface GameBoardProps {
  markers: number[][][];
  currentPlayer: number;
  onCellClick: (x: number, y: number, z: number) => void;
  lastMove?: { x: number; y: number; z: number } | null;
}

const GameBoard: React.FC<GameBoardProps> = ({ markers, currentPlayer, onCellClick, lastMove }) => {
  const [isHidden, setIsHidden] = useState(false);
  const [hideHistory, setHideHistory] = useState(false);

  const handleCoordinatesReceived = (x: number, y: number, z: number) => {
    onCellClick(x - 1, y - 1, z - 1); // Adjust for 0-based indexing
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="sticky top-0 z-20 flex justify-center gap-4 bg-white/80 backdrop-blur-sm py-4 px-4 shadow-md">
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
      
      <div className="pt-4 px-4">
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
      <VoiceInputFab onCoordinatesReceived={handleCoordinatesReceived} />
    </div>
  );
};

export default GameBoard;
