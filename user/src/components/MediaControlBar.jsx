import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

export default function MediaControlBar({ 
  mediaRef, 
  mediaType, 
  currentTime = 0, 
  duration = 0, 
  isPlaying = false, 
  onPlayPause, 
  onSeek, 
  onRestart,
  currentQuestion,
  totalQuestions
}) {
  const [isDragging, setIsDragging] = useState(false);
  const progressRef = useRef(null);

  // Handle progress bar interaction
  const handleProgressInteraction = (e) => {
    if (!progressRef.current || !duration) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newProgress = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = newProgress * duration;
    
    onSeek && onSeek(newTime);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    handleProgressInteraction(e);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      handleProgressInteraction(e);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const questionProgress = totalQuestions > 0 ? (currentQuestion / totalQuestions) * 100 : 0;

  // Don't show for static images
  if (mediaType === 'image') {
    return (
      <div className="absolute top-4 left-4 right-4">
        <div className="flex justify-between items-center">
          <div className="bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm font-medium">
            Soru {currentQuestion} / {totalQuestions}
          </div>
          <div className="w-24 h-1 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-300"
              style={{ width: `${questionProgress}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Top progress for quiz */}
      <div className="absolute top-4 left-4 right-4">
        <div className="flex justify-between items-center">
          <div className="bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm font-medium">
            Soru {currentQuestion} / {totalQuestions}
          </div>
          <div className="w-24 h-1 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-300"
              style={{ width: `${questionProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bottom media controls */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-black/60 backdrop-blur-md rounded-xl p-4">
          <div className="flex items-center space-x-4">
            
            {/* Play/Pause Button */}
            <button
              onClick={onPlayPause}
              className="w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full transition-all duration-200 hover:scale-105"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white" />
              ) : (
                <Play className="w-5 h-5 text-white ml-0.5" />
              )}
            </button>

            {/* Restart Button */}
            <button
              onClick={onRestart}
              className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-all duration-200"
            >
              <RotateCcw className="w-4 h-4 text-white" />
            </button>

            {/* Progress Bar */}
            <div 
              ref={progressRef}
              className="flex-1 h-6 flex items-center cursor-pointer group"
              onMouseDown={handleMouseDown}
            >
              <div className="w-full h-1 bg-white/20 rounded-full relative">
                {/* Progress fill */}
                <div 
                  className="absolute left-0 top-0 h-full bg-white rounded-full transition-all duration-150"
                  style={{ width: `${progress}%` }}
                />
                
                {/* Draggable handle */}
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-grab active:cursor-grabbing transform -translate-x-1/2"
                  style={{ left: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}