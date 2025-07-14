import React, { useEffect, useState } from 'react';
import { Play, Pause, ChevronRight } from 'lucide-react';
import ProgressBar from './ProgressBar';

/**
 * Basitleştirilmiş ses çalar.
 * Gerçek bir <audio> elementi yerine simüle edilmiş ilerleme kullanır:
 * props.isPlaying değişince 0-100 arası progress artar.
 */
const AudioPlayer = ({ time, isPlaying, onTogglePlay, onNext }) => {
  const [prog, setProg] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => {
      setProg(p => (p >= 100 ? 0 : p + 2));
    }, 500);
    return () => clearInterval(id);
  }, [isPlaying]);

  return (
    <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={onTogglePlay}
          className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 text-[#0079a9]" />
          ) : (
            <Play className="w-5 h-5 text-[#0079a9] ml-0.5" />
          )}
        </button>

        <div className="flex-1 mx-3">
          <ProgressBar progress={prog} />
        </div>

        <button
          onClick={onNext}
          className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
        >
          <ChevronRight className="w-5 h-5 text-[#0079a9]" />
        </button>
      </div>
    </div>
  );
};

export default AudioPlayer;
