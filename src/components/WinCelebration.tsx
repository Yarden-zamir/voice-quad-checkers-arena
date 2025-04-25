
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

  const [isConfettiActive, setIsConfettiActive] = useState(false);

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

  useEffect(() => {
    if (isActive) {
      setIsConfettiActive(true);
      const timer = setTimeout(() => {
        setIsConfettiActive(false);
      }, 5000); // Run confetti for 5 seconds
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  if (!isActive) return null;

  return (
    <ReactConfetti
      width={windowSize.width}
      height={windowSize.height}
      numberOfPieces={500}
      recycle={false}
      run={isConfettiActive}
    />
  );
};

export default WinCelebration;
