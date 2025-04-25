import React, { useState } from 'react';
import Board from './Board';
import { Toggle } from "@/components/ui/toggle";
import { Eye, EyeOff, History, RotateCcw } from "lucide-react";
import VoiceInputFab from './VoiceInputFab';

interface GameBoardProps {
  markers: number[][][];
  currentPlayer: number;
  onCellClick: (x: number, y: number, z: number) => void;
  onResetGame: () => void;
  lastMove?: { x: number; y: number; z: number } | null;
}

const GameBoard: React.FC<GameBoardProps> = ({ 
  markers, 
  currentPlayer, 
  onCellClick, 
  onResetGame,
  lastMove 
}) => {
  const [isHidden, setIsHidden] = useState(false);
  const [hideHistory, setHideHistory] = useState(false);

  const handleCoordinatesReceived = (x: number, y: number, z: number) => {
    console.log(`Voice coordinates received: ${x}, ${y}, ${z}`);
    onCellClick(x - 1, y - 1, z - 1);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="sticky top-0 z-20 flex justify-center gap-4 bg-white/80 backdrop-blur-sm py-4 px-4 shadow-md">
        <Toggle
          pressed={hideHistory}
          onPressedChange={setHideHistory}
          className="shadow-sm"
        >
          <History className="h-4 w-4 mr-2" />
          {hideHistory ? 'Show History' : 'Hide History'}
        </Toggle>
        
        <Toggle
          pressed={isHidden}
          onPressedChange={setIsHidden}
          className="shadow-sm"
        >
          {isHidden ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
          {isHidden ? 'Show Board' : 'Hide Board'}
        </Toggle>

        <Toggle
          pressed={false}
          onPressedChange={() => onResetGame()}
          className="shadow-sm"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset Game
        </Toggle>
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
      
      <VoiceInputFab 
        onCoordinatesReceived={handleCoordinatesReceived} 
        fullScreen={isHidden}
        currentPlayer={currentPlayer}
      />
    </div>
  );
};

export default GameBoard;
