
import React, { useState } from 'react';
import Board from './Board';
import { Toggle } from "@/components/ui/toggle";
import { Eye, EyeOff, History, RotateCcw } from "lucide-react";
import VoiceInputFab from './VoiceInputFab';
import { Button } from "@/components/ui/button";

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
    <div className="min-h-screen bg-gray-100 pb-32">
      <div className="sticky top-0 z-20 flex justify-center gap-2 bg-white/80 backdrop-blur-sm py-3 px-2 shadow-md">
        <Toggle
          pressed={hideHistory}
          onPressedChange={setHideHistory}
          variant="outline"
          aria-label={hideHistory ? "Show History" : "Hide History"}
          className="data-[state=on]:bg-blue-500 data-[state=on]:text-white flex-1 max-w-[130px]"
        >
          <History className="h-4 w-4 mr-1" />
          History
        </Toggle>
        
        <Toggle
          pressed={isHidden}
          onPressedChange={setIsHidden}
          variant="outline"
          aria-label={isHidden ? "Show Board" : "Hide Board"}
          className="data-[state=on]:bg-blue-500 data-[state=on]:text-white flex-1 max-w-[130px]"
        >
          {isHidden ? <Eye className="h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />}
          Board
        </Toggle>

        <Button
          onClick={onResetGame}
          variant="outline"
          aria-label="Reset Game"
          className="flex-1 max-w-[130px]"
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Reset
        </Button>
      </div>
      
      <div className="pt-4 px-4">
        {isHidden ? (
          <div className="flex items-center justify-center h-[70vh]">
            <p className="text-gray-400 text-2xl">Board Hidden</p>
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
