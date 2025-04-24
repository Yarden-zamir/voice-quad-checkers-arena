
import { useRef } from 'react';
import { Mesh } from 'three';
import { meshStandardMaterial } from 'three/examples/jsm/nodes/Nodes.js';

interface BoardProps {
  markers: number[][][];
  currentPlayer: number;
}

const Board: React.FC<BoardProps> = ({ markers, currentPlayer }) => {
  const boardRef = useRef<Mesh>(null);

  const renderCube = (x: number, y: number, z: number, player: number) => {
    const color = player === 1 ? '#D946EF' : '#0EA5E9';
    return (
      <mesh key={`${x}-${y}-${z}`} position={[x - 1, y - 1, z - 1]}>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial color={color} />
      </mesh>
    );
  };

  return (
    <group>
      <gridHelper args={[3, 3]} />
      <gridHelper args={[3, 3]} rotation={[Math.PI / 2, 0, 0]} />
      <gridHelper args={[3, 3]} rotation={[0, 0, Math.PI / 2]} />
      
      {markers.map((plane, x) =>
        plane.map((row, y) =>
          row.map((cell, z) => {
            if (cell !== 0) {
              return renderCube(x, y, z, cell);
            }
            return null;
          })
        )
      )}
    </group>
  );
};

export default Board;
