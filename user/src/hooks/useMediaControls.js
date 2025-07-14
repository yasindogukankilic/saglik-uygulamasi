import { useState, useCallback } from 'react';

/**
 * Ortak medya kontrol kancası
 * ───────────────────────────
 * • video | audio | gif vb. element için play / pause / seek / restart
 * • Görsel (image) içeriklerde sadece iskelet döner (boşa state güncellemez)
 */
export function useMediaControls(mediaRef) {
  const [isPlaying, setIsPlaying]   = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration]       = useState(0);

  const playPause = useCallback(() => {
    const el = mediaRef.current;
    if (!el) return;
    isPlaying ? el.pause() : el.play();
    setIsPlaying(!isPlaying);
  }, [isPlaying, mediaRef]);

  const seek = useCallback((t) => {
    const el = mediaRef.current;
    if (!el) return;
    el.currentTime = t;
    setCurrentTime(t);
  }, [mediaRef]);

  const restart = useCallback(() => {
    const el = mediaRef.current;
    if (!el) return;
    el.currentTime = 0;
    setCurrentTime(0);
    el.play();
    setIsPlaying(true);
  }, [mediaRef]);

  /* Video element event’leri ileri sarar ↘︎ */
  const onTime       = () => setCurrentTime(mediaRef.current?.currentTime ?? 0);
  const onLoadedMeta = () => setDuration(mediaRef.current?.duration ?? 0);

  return {
    isPlaying, currentTime, duration,
    playPause, seek, restart, onTime, onLoadedMeta,
  };
}
