
import { useEffect, useState } from 'react';
import ReactConfetti from 'react-confetti';
import { useWindowSize } from 'react-confetti';

interface WinCelebrationProps {
  isActive: boolean;
}

const WinCelebration = ({ isActive }: WinCelebrationProps) => {
  const { width, height } = useWindowSize();
  const [isConfettiActive, setIsConfettiActive] = useState(false);

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
      width={width}
      height={height}
      numberOfPieces={500}
      recycle={false}
      run={isConfettiActive}
    />
  );
};

export default WinCelebration;
