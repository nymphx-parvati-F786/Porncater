'use client';

import { useRef, useState, useEffect } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, 
  SkipBack, SkipForward, Settings
} from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
}

export default function VideoPlayer({ src, poster, title }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Play / Pause
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Update progress
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    const progressPercent = (video.currentTime / video.duration) * 100;
    setProgress(progressPercent);
    setCurrentTime(video.currentTime);
  };

  // Seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = (parseFloat(e.target.value) / 100) * video.duration;
    video.currentTime = newTime;
    setProgress(parseFloat(e.target.value));
  };

  // Format time
  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Volume
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.volume = volume || 1;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  };

  // Speed
  const changeSpeed = (rate: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = rate;
    setPlaybackRate(rate);
  };

  // Fullscreen
  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!isFullscreen) {
      if (container.requestFullscreen) container.requestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        togglePlay();
      }
      if (e.key === 'f') toggleFullscreen();
      if (e.key === 'm') toggleMute();
      if (e.key === 'ArrowRight') {
        const video = videoRef.current;
        if (video) video.currentTime += 10;
      }
      if (e.key === 'ArrowLeft') {
        const video = videoRef.current;
        if (video) video.currentTime -= 10;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative bg-black w-full h-full group flex items-center justify-center font-sans"
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => { if (isPlaying) setShowControls(false); }}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain cursor-pointer"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onClick={togglePlay}
      />

      {/* Cinematic Top Gradient (for Title if fullscreen) */}
      <div className={`absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-500 pointer-events-none ${showControls && isFullscreen ? 'opacity-100' : 'opacity-0'}`}>
         {title && (
           <div className="p-6 text-white font-serif italic tracking-wide text-xl">
             {title}
           </div>
         )}
      </div>

      {/* Big Center Play Button (Frosted Glass Luxe Style) */}
      {!isPlaying && (
        <button 
          onClick={togglePlay}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-md border border-white/20 text-white hover:bg-rose-900/40 hover:border-rose-800 hover:scale-105 transition-all duration-500 group-hover:opacity-100"
        >
          <Play size={40} className="ml-2 opacity-90" fill="currentColor" strokeWidth={1} />
        </button>
      )}

      {/* Custom Controls Bottom Bar */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-6 py-8 transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* Sleek Progress Bar */}
        <div className="relative w-full h-1 bg-white/20 rounded-full mb-6 cursor-pointer group/progress">
          <input
            type="range"
            min="0"
            max="100"
            value={progress || 0}
            onChange={handleSeek}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div 
            className="absolute top-0 left-0 h-full bg-rose-700 rounded-full pointer-events-none group-hover/progress:bg-rose-600 transition-colors"
            style={{ width: `${progress}%` }}
          />
          {/* Playhead thumb (appears on hover) */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 shadow-[0_0_10px_rgba(255,255,255,0.5)] pointer-events-none transition-opacity"
            style={{ left: `calc(${progress}% - 6px)` }}
          />
        </div>

        <div className="flex items-center justify-between text-zinc-300">
          <div className="flex items-center gap-6">
            {/* Play/Pause */}
            <button onClick={togglePlay} className="hover:text-white transition-colors duration-300">
              {isPlaying ? <Pause size={24} strokeWidth={1.5} fill="currentColor" /> : <Play size={24} strokeWidth={1.5} fill="currentColor" />}
            </button>

            {/* Skip */}
            <div className="flex items-center gap-4 text-zinc-400">
              <button onClick={() => { if (videoRef.current) videoRef.current.currentTime -= 10; }} className="hover:text-white transition-colors duration-300">
                <SkipBack size={18} strokeWidth={1.5} />
              </button>
              <button onClick={() => { if (videoRef.current) videoRef.current.currentTime += 10; }} className="hover:text-white transition-colors duration-300">
                <SkipForward size={18} strokeWidth={1.5} />
              </button>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-3 group/volume">
              <button onClick={toggleMute} className="hover:text-white transition-colors duration-300">
                {isMuted ? <VolumeX size={20} strokeWidth={1.5} /> : <Volume2 size={20} strokeWidth={1.5} />}
              </button>
              <div className="w-0 overflow-hidden group-hover/volume:w-20 transition-all duration-500 ease-out flex items-center">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-full h-1 accent-white bg-white/20 appearance-none rounded-full cursor-pointer"
                />
              </div>
            </div>

            {/* Time */}
            <span className="text-[11px] font-medium tabular-nums tracking-widest uppercase ml-2 opacity-80">
              {formatTime(currentTime)} <span className="opacity-50 mx-1">/</span> {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-6">
            {/* Speed Selector (Cleaned up, no clunky select box) */}
            <div className="relative group/speed cursor-pointer flex items-center gap-1 hover:text-white transition-colors duration-300">
              <span className="text-[11px] font-medium tracking-widest">{playbackRate}x</span>
              <Settings size={14} strokeWidth={1.5} />
              
              {/* Hidden Dropdown */}
              <div className="absolute bottom-full right-0 mb-4 bg-black/80 backdrop-blur-md border border-white/10 rounded-sm overflow-hidden opacity-0 invisible group-hover/speed:opacity-100 group-hover/speed:visible transition-all duration-300 translate-y-2 group-hover/speed:translate-y-0">
                {[0.5, 1, 1.5, 2].map((rate) => (
                  <div 
                    key={rate}
                    onClick={() => changeSpeed(rate)}
                    className={`px-6 py-2 text-[10px] tracking-widest cursor-pointer hover:bg-rose-900/40 transition-colors ${playbackRate === rate ? 'text-rose-500' : 'text-zinc-300'}`}
                  >
                    {rate}x
                  </div>
                ))}
              </div>
            </div>

            {/* Fullscreen */}
            <button onClick={toggleFullscreen} className="hover:text-white transition-colors duration-300">
              {isFullscreen ? <Minimize size={20} strokeWidth={1.5} /> : <Maximize size={20} strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}