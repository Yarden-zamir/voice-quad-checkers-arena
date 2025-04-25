
export const playErrorSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.type = 'sine';
  oscillator.frequency.value = 440; // A4 note
  gainNode.gain.value = 0.3; // Increased from 0.1 to 0.3

  oscillator.start();
  gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.5);
  
  setTimeout(() => {
    oscillator.stop();
    audioContext.close();
  }, 500);
};

export const playWinSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  // Create a happy victory sound using multiple oscillators
  const oscillators: OscillatorNode[] = [];
  const gainNode = audioContext.createGain();
  gainNode.connect(audioContext.destination);
  gainNode.gain.value = 0.3; // Increased from 0.1 to 0.3

  // Create a happy chord
  const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
  frequencies.forEach(freq => {
    const osc = audioContext.createOscillator();
    osc.connect(gainNode);
    osc.type = 'sine';
    osc.frequency.value = freq;
    oscillators.push(osc);
    osc.start();
  });

  // Fade out
  gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 1);

  setTimeout(() => {
    oscillators.forEach(osc => osc.stop());
    audioContext.close();
  }, 1000);
};
