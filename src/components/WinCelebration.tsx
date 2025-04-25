
import { useEffect, useState } from 'react';
import ReactConfetti from 'react-confetti';

interface WinCelebrationProps {
  isActive: boolean;
}

const WinCelebration = ({ isActive }: WinCelebrationProps) => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    // Update window dimensions when the window is resized
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isActive) return null;

  return (
    <ReactConfetti
      width={windowSize.width}
      height={windowSize.height}
      numberOfPieces={300}
      recycle={false}
      run={true}
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        zIndex: 50 
      }}
    />
  );
};

export default WinCelebration;
