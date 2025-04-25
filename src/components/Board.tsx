
import React from 'react';

interface BoardProps {
  markers: number[][][];
  currentPlayer: number;
  onCellClick: (x: number, y: number, z: number) => void;
  hideHistory: boolean;
  lastMove?: { x: number; y: number; z: number } | null;
}

const Board: React.FC<BoardProps> = ({ markers, currentPlayer, onCellClick, hideHistory, lastMove }) => {
  const renderCell = (x: number, y: number, z: number) => {
    const value = markers && markers[x] && markers[x][y] ? markers[x][y][z] : 0;
    const isLastMove = lastMove && lastMove.x === x && lastMove.y === y && lastMove.z === z;
    
    const shouldHideCell = hideHistory && value !== 0 && !isLastMove;
    
    const color = shouldHideCell 
      ? 'bg-gray-200' 
      : value === 1 
        ? 'bg-purple-500' 
        : value === 2 
          ? 'bg-blue-500' 
          : 'bg-gray-200';
    
    return (
      <div 
        key={`cell-${x}-${y}-${z}`}
        className={`${color} aspect-square flex items-center justify-center border border-gray-400 cursor-pointer hover:opacity-80 transition-opacity text-sm`}
        onClick={() => onCellClick(x, y, z)}
      >
        {!shouldHideCell && value !== 0 && (
          <span className="text-white font-bold">
            {value === 1 ? 'X' : 'O'}
          </span>
        )}
        {value === 0 && (
          <span className="text-gray-400 opacity-0 hover:opacity-100 text-xs">
            {x+1},{y+1},{z+1}
          </span>
        )}
      </div>
    );
  };

  const renderGrid = (gridIndex: number) => {
    return (
      <div key={`grid-${gridIndex}`} className="grid grid-cols-4 gap-0.5 m-1">
        {Array.from({ length: 4 }, (_, y) => (
          Array.from({ length: 4 }, (_, z) => (
            renderCell(gridIndex, y, z)
          ))
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col justify-center items-center gap-4 max-w-full">
      <div className="flex flex-col gap-4 w-full max-w-md mx-auto px-2">
        {Array.from({ length: 4 }, (_, index) => renderGrid(index))}
      </div>
      <div className="w-full text-center mt-4">
        <div className="inline-block px-4 py-2 bg-white rounded-lg shadow">
          <span className="font-bold">Current Player: </span>
          <span className={currentPlayer === 1 ? "text-purple-500 font-bold" : "text-blue-500 font-bold"}>
            {currentPlayer === 1 ? 'Player 1 (X)' : 'Player 2 (O)'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Board;
