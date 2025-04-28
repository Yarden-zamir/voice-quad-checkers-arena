
import React, { useState } from 'react';
import Board from './Board';
import HeaderControls from './HeaderControls';
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
    onCellClick(x - 1, y - 1, z - 1);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <HeaderControls 
        hideHistory={hideHistory}
        setHideHistory={setHideHistory}
        isHidden={isHidden}
        setIsHidden={setIsHidden}
        onResetGame={onResetGame}
      />
      
      <div className="flex-1 pt-4 px-4 pb-4 overflow-auto">
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
