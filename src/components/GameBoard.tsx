
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Board from './Board';

interface GameBoardProps {
  markers: number[][][];
  currentPlayer: number;
}

const GameBoard: React.FC<GameBoardProps> = ({ markers, currentPlayer }) => {
  return (
    <div className="h-screen w-full bg-[#1A1F2C]">
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Board markers={markers} currentPlayer={currentPlayer} />
        <OrbitControls />
      </Canvas>
    </div>
  );
};

export default GameBoard;
