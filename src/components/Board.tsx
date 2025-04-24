
import React from 'react';

interface BoardProps {
  markers: number[][][];
  currentPlayer: number;
}

const Board: React.FC<BoardProps> = ({ markers, currentPlayer }) => {
  // Render a single cell in a grid
  const renderCell = (value: number, x: number, y: number, z: number) => {
    const color = value === 1 ? 'bg-purple-500' : value === 2 ? 'bg-blue-500' : 'bg-gray-200';
    return (
      <div 
        key={`cell-${x}-${y}-${z}`}
        className={`${color} w-12 h-12 flex items-center justify-center border border-gray-400`}
        onClick={() => console.log(`Clicked: ${x}, ${y}, ${z}`)}
      >
        {value !== 0 && (
          <span className="text-white font-bold text-xl">
            {value === 1 ? 'X' : 'O'}
          </span>
        )}
      </div>
    );
  };

  // Render a single 4x4 grid (slice)
  const renderGrid = (gridIndex: number) => {
    return (
      <div key={`grid-${gridIndex}`} className="grid grid-cols-4 gap-1 m-4">
        {markers[gridIndex].map((row, y) => (
          row.map((cell, z) => renderCell(cell, gridIndex, y, z))
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-wrap justify-center max-w-4xl mx-auto">
      {markers.map((_, index) => renderGrid(index))}
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
