
import React from 'react';

interface BoardProps {
  markers: number[][][];
  currentPlayer: number;
  onCellClick: (x: number, y: number, z: number) => void;
  hideHistory: boolean;
  lastMove?: { x: number; y: number; z: number } | null;
}

const Board: React.FC<BoardProps> = ({ 
  markers, 
  currentPlayer, 
  onCellClick, 
  hideHistory, 
  lastMove 
}) => {
  const renderCell = (x: number, y: number, z: number) => {
    const value = markers[x][y][z];
    const isLastMove = lastMove && lastMove.x === x && lastMove.y === y && lastMove.z === z;
    const shouldHideCell = hideHistory && value !== 0 && !isLastMove;
    
    const cellColor = shouldHideCell 
      ? 'bg-gray-200' 
      : value === 1 
        ? 'bg-purple-500' 
        : value === 2 
          ? 'bg-blue-500' 
          : 'bg-gray-200';

    return (
      <div 
        key={`cell-${x}-${y}-${z}`}
        onClick={() => onCellClick(x, y, z)}
        className={`${cellColor} w-full h-full flex items-center justify-center border border-gray-400 cursor-pointer hover:opacity-80 transition-opacity text-sm`}
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

  const renderGrid = (gridIndex: number) => (
    <div 
      key={`grid-${gridIndex}`} 
      className="aspect-square w-full bg-gray-100 p-2 rounded-lg shadow-sm"
    >
      <div className="grid grid-cols-4 grid-rows-4 gap-0.5 h-full w-full">
        {Array.from({ length: 4 }, (_, y) => (
          <div key={`row-${y}`} className="contents">
            {Array.from({ length: 4 }, (_, z) => (
              <div key={`cell-container-${gridIndex}-${y}-${z}`} className="aspect-square">
                {renderCell(gridIndex, y, z)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col justify-center items-center w-full h-full">
      <div className="w-full max-w-xs mx-auto px-2">
        <div className="grid grid-cols-1 gap-2">
          {Array.from({ length: 4 }, (_, index) => renderGrid(index))}
        </div>
      </div>
    </div>
  );
};

export default Board;
