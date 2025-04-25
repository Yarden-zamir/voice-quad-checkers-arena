
import React from 'react';
import { useTileSize } from '@/contexts/TileSizeContext';

interface BoardProps {
  markers: number[][][];
  currentPlayer: number;
  onCellClick: (x: number, y: number, z: number) => void;
  hideHistory: boolean;
  lastMove?: { x: number; y: number; z: number } | null;
}

const Board: React.FC<BoardProps> = ({ markers, currentPlayer, onCellClick, hideHistory, lastMove }) => {
  const { tileSize } = useTileSize();
  
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
        className={`${color} aspect-square flex items-center justify-center border border-gray-400 cursor-pointer hover:opacity-80 transition-opacity text-xs`}
        onClick={() => onCellClick(x, y, z)}
      >
        {!shouldHideCell && value !== 0 && (
          <span className="text-white font-bold text-xs">
            {value === 1 ? 'X' : 'O'}
          </span>
        )}
        {value === 0 && (
          <span className="text-gray-400 opacity-0 hover:opacity-100 text-[0.6rem]">
            {x+1},{y+1},{z+1}
          </span>
        )}
      </div>
    );
  };

  const renderGrid = (gridIndex: number) => {
    return (
      <div 
        key={`grid-${gridIndex}`} 
        className="grid grid-cols-4 gap-0.5 mx-auto"
        style={{ 
          transform: `scale(${tileSize})`, 
          transformOrigin: 'center',
          width: 'fit-content'
        }}
      >
        {Array.from({ length: 4 }, (_, y) => (
          Array.from({ length: 4 }, (_, z) => (
            renderCell(gridIndex, y, z)
          ))
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col justify-center items-center w-full">
      <div className="flex flex-col items-center w-full max-w-md mx-auto">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={`grid-container-${index}`} className="mb-8">
            {renderGrid(index)}
          </div>
        ))}
      </div>
      <div className="fixed bottom-24 left-0 right-0 text-center">
        <div className="inline-block px-6 py-3 bg-white rounded-full shadow-md">
          <span className="font-bold">Current Player: </span>
          <span className={`${currentPlayer === 1 ? "text-purple-500" : "text-blue-500"} font-bold`}>
            Player {currentPlayer} ({currentPlayer === 1 ? 'X' : 'O'})
          </span>
        </div>
      </div>
    </div>
  );
};

export default Board;
