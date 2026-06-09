import React, { useState, useRef, useEffect } from "react";
import { TaskbarTheme } from "../types";
import { Play, Pause, SkipForward, SkipBack, Volume2, HelpCircle } from "lucide-react";

interface MediaPlayerProps {
  theme: TaskbarTheme;
}

export default function MediaPlayer({ theme }: MediaPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [volume, setVolume] = useState(60);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(1);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isDark = theme.theme === "dark";

  const playlist = [
    { title: "Dreamy Synthwave beats", artist: "Retrowave", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", cover: "🎧" },
    { title: "Lofi Ambient Raindrops", artist: "Serene Minds", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", cover: "🌌" },
    { title: "Solar Orbit Flight", artist: "Galactic Crew", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3", cover: "☀️" },
    { title: "Quantum Coding Loops", artist: "Byte Sized", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3", cover: "💻" }
  ];

  const currentTrack = playlist[currentTrackIdx];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Handle track changing
  useEffect(() => {
    setIsPlaying(false);
    setProgress(0);
    if (audioRef.current) {
      audioRef.current.src = currentTrack.url;
      if (isPlaying) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      }
    }
  }, [currentTrackIdx]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.error(err);
          // Fallback timer increase simulation if browser blocks autoload audio
          setIsPlaying(true);
        });
    }
  };

  const handleNext = () => {
    setCurrentTrackIdx((prev) => (prev + 1) % playlist.length);
  };

  const handlePrev = () => {
    setCurrentTrackIdx((prev) => (prev - 1 + playlist.length) % playlist.length);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 1);
    }
  };

  const handleProgressChange = (val: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = val;
      setProgress(val);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="flex-1 flex flex-col p-5 bg-transparent select-none justify-between h-full font-sans">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleNext}
        src={currentTrack.url}
      />

      {/* 1. Cover Art Display Card */}
      <div className={`p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center h-44 shadow-lg ${
        isDark ? "bg-black/15" : "bg-white/45"
      }`}>
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-sky-400 to-indigo-600 flex items-center justify-center text-4xl shadow-md mb-3 transform rotate-3 hover:rotate-0 transition-transform duration-300">
          {currentTrack.cover}
        </div>
        <span className="text-[12px] font-bold text-inherit truncate max-w-full leading-normal">
          {currentTrack.title}
        </span>
        <span className="text-[10px] text-slate-500 mt-0.5 select-all leading-snug">
          {currentTrack.artist}
        </span>
      </div>

      {/* 2. Progress Scrubbing Bar */}
      <div className="space-y-1">
        <input
          type="range"
          min="0"
          max={duration}
          value={progress}
          onChange={(e) => handleProgressChange(parseFloat(e.target.value))}
          className="w-full accent-sky-500 h-1 cursor-pointer bg-slate-500/20 rounded-lg outline-none"
        />
        <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono font-bold leading-none select-none">
          <span>{formatTime(progress)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* 4. Controls triggers row */}
      <div className="flex items-center justify-between">
        {/* Volume adjust sliders */}
        <div className="flex items-center gap-1 w-24">
          <Volume2 className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(parseInt(e.target.value))}
            className="w-full accent-sky-500 h-1 cursor-pointer bg-slate-500/20 rounded-lg outline-none"
          />
        </div>

        {/* Core Media Keys */}
        <div className="flex gap-2">
          <button
            onClick={handlePrev}
            className="p-1.5 rounded-full bg-slate-500/10 hover:bg-slate-500/20 active:scale-90 transition text-inherit cursor-default"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={togglePlay}
            className="p-2.5 rounded-full bg-sky-500 text-white hover:bg-sky-600 active:scale-90 transition cursor-default shadow-md shadow-sky-500/10"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-white text-white" /> : <Play className="w-4 h-4 fill-white text-white ml-0.5" />}
          </button>

          <button
            onClick={handleNext}
            className="p-1.5 rounded-full bg-slate-500/10 hover:bg-slate-500/20 active:scale-90 transition text-inherit cursor-default"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        <HelpCircle className="w-4 h-4 text-slate-600 self-center" title="Ambient Soundhelix MP3 loops" />
      </div>
    </div>
  );
}
export function MediaPlayerIcon() {
  return <span className="text-[15px]">🎵</span>;
}
