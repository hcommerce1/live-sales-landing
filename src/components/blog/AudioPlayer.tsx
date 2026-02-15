/**
 * Blog Audio Player
 *
 * 4-state UI:
 * 1. idle: "Odsłuchaj artykuł" button
 * 2. generating: "Generuję audio..." with pulsing animation
 * 3. playing: Full player with play/pause, seek, speed control
 * 4. error: Error message with retry button
 */

import { useState, useRef, useEffect, useCallback } from 'react';

interface AudioPlayerProps {
  slug: string;
  lang?: string;
}

type PlayerState = 'idle' | 'generating' | 'ready' | 'error';

export default function AudioPlayer({ slug, lang = 'pl' }: AudioPlayerProps) {
  const [state, setState] = useState<PlayerState>('idle');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const generate = useCallback(async () => {
    setState('generating');
    setErrorMsg('');

    try {
      const res = await fetch('/api/audio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, lang }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      const data = await res.json();

      const audio = new Audio(data.audioUrl);
      audioRef.current = audio;

      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration || data.duration || 0);
      });

      audio.addEventListener('timeupdate', () => {
        setCurrentTime(audio.currentTime);
      });

      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentTime(0);
      });

      audio.addEventListener('error', () => {
        setState('error');
        setErrorMsg('Błąd odtwarzania audio.');
      });

      // Set estimated duration from API if available
      if (data.duration) setDuration(data.duration);

      setState('ready');

      // Auto-play
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    } catch (err: any) {
      setState('error');
      setErrorMsg(err?.message || 'Nie udało się wygenerować audio.');
    }
  }, [slug, lang]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const cycleSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    const newRate = speeds[nextIdx];
    setPlaybackRate(newRate);
    if (audioRef.current) audioRef.current.playbackRate = newRate;
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // --- IDLE STATE ---
  if (state === 'idle') {
    return (
      <button
        onClick={generate}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
        </svg>
        Odsłuchaj artykuł
      </button>
    );
  }

  // --- GENERATING STATE ---
  if (state === 'generating') {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-500 bg-gray-50 rounded-lg">
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
        Generuję audio...
      </div>
    );
  }

  // --- ERROR STATE ---
  if (state === 'error') {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 text-sm">
        <span className="text-red-500">{errorMsg}</span>
        <button
          onClick={generate}
          className="text-blue-600 hover:underline font-medium"
        >
          Spróbuj ponownie
        </button>
      </div>
    );
  }

  // --- READY/PLAYING STATE ---
  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
      {/* Play/Pause */}
      <button
        onClick={togglePlay}
        className="w-8 h-8 flex items-center justify-center text-blue-600 hover:text-blue-700 transition-colors"
        aria-label={isPlaying ? 'Pauza' : 'Odtwórz'}
      >
        {isPlaying ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      {/* Time */}
      <span className="text-xs text-gray-500 w-10 text-right tabular-nums">
        {formatTime(currentTime)}
      </span>

      {/* Seek bar */}
      <input
        type="range"
        min={0}
        max={duration || 0}
        value={currentTime}
        onChange={seek}
        className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />

      {/* Duration */}
      <span className="text-xs text-gray-500 w-10 tabular-nums">
        {formatTime(duration)}
      </span>

      {/* Speed */}
      <button
        onClick={cycleSpeed}
        className="text-xs font-medium text-gray-500 hover:text-gray-700 px-1.5 py-0.5 bg-gray-200 rounded transition-colors"
        title="Zmień prędkość odtwarzania"
      >
        {playbackRate}x
      </button>
    </div>
  );
}
