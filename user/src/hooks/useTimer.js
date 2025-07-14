import { useState, useEffect } from 'react';

/**
 * Basit kronometre.
 * @returns { time, isPlaying, togglePlay, reset }
 */
export const useTimer = (initial = 0) => {
  const [time, setTime]       = useState(initial);
  const [isPlaying, setPlay]  = useState(false);

  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => setTime(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [isPlaying]);

  return {
    time,
    isPlaying,
    togglePlay: () => setPlay(p => !p),
    reset     : () => setTime(0)
  };
};
