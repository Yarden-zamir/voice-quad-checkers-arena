
import React from 'react';
import Board from './Board';

interface GameBoardProps {
  markers: number[][][];
  currentPlayer: number;
  onCellClick: (x: number, y: number, z: number) => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ markers, currentPlayer, onCellClick }) => {
  return (
    <div className="py-16 px-4 bg-gray-100 min-h-screen">
      <Board markers={markers} currentPlayer={currentPlayer} onCellClick={onCellClick} />
    </div>
  );
};

export default GameBoard;
