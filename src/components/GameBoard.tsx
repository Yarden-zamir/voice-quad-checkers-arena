
import React from 'react';
import Board from './Board';

interface GameBoardProps {
  markers: number[][][];
  currentPlayer: number;
}

const GameBoard: React.FC<GameBoardProps> = ({ markers, currentPlayer }) => {
  return (
    <div className="py-16 px-4 bg-gray-100 min-h-screen">
      <Board markers={markers} currentPlayer={currentPlayer} />
    </div>
  );
};

export default GameBoard;
