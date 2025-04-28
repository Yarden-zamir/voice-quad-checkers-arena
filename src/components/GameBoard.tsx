
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
      
      <div className="flex-1 flex items-center justify-center">
        {isHidden ? (
          <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
            <p className="text-white text-2xl">Board Hidden</p>
          </div>
        ) : (
          <div className="w-full h-full max-w-screen-lg mx-auto flex items-center justify-center" style={{ maxHeight: 'calc(100vh - 80px)' }}>
            <div className="scale-[var(--scale)] origin-center w-full h-full" style={{ '--scale': 'min(1, var(--vh-scale))' } as React.CSSProperties}>
              <Board 
                markers={markers} 
                currentPlayer={currentPlayer} 
                onCellClick={onCellClick} 
                hideHistory={hideHistory}
                lastMove={lastMove}
              />
            </div>
          </div>
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
