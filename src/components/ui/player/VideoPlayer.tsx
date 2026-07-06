'use client';

import { useRef, useState, useEffect } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, 
  SkipBack, SkipForward, Settings, ExternalLink, Repeat
} from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  vastTagUrl?: string;
}

export default function VideoPlayer({ src, poster, title, vastTagUrl }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const firedTrackingEvents = useRef<Set<string>>(new Set());
  const abortControllerRef = useRef<AbortController | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoadingAd, setIsLoadingAd] = useState(false);
  const [isLooping, setIsLooping] = useState(false); // 🔥 NEW: Retention hook

  const [adState, setAdState] = useState<{
    isPlaying: boolean;
    hasPlayed: boolean;
    mediaUrl: string | null;
    clickThroughUrl: string | null;
    skipOffset: number;
    trackingUrls: { [key: string]: string[] };
  }>({
    isPlaying: false,
    hasPlayed: false,
    mediaUrl: null,
    clickThroughUrl: null,
    skipOffset: 5, 
    trackingUrls: {},
  });

  const [adCountdown, setAdCountdown] = useState(5);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  const fireTrackingPixel = (urls: string[] | undefined) => {
    if (!urls) return;
    urls.forEach(url => {
      if (url && !firedTrackingEvents.current.has(url)) {
        firedTrackingEvents.current.add(url);
        const img = new Image();
        img.src = url;
      }
    });
  };

  const loadAd = async (): Promise<boolean> => {
    if (!vastTagUrl || adState.hasPlayed) return false;
    
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    setIsLoadingAd(true);

    try {
      const timeoutId = setTimeout(() => abortControllerRef.current?.abort(), 3000);
      const response = await fetch(vastTagUrl, { signal: abortControllerRef.current.signal });
      clearTimeout(timeoutId);
      
      const text = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, 'text/xml');

      const mediaFile = xmlDoc.getElementsByTagName('MediaFile')[0]?.textContent?.trim();
      if (!mediaFile) {
        setIsLoadingAd(false);
        return false;
      }

      const clickThrough = xmlDoc.getElementsByTagName('ClickThrough')[0]?.textContent?.trim() || null;

      const trackingEvents: { [key: string]: string[] } = {};
      const trackingNodes = xmlDoc.getElementsByTagName('Tracking');
      for (let i = 0; i < trackingNodes.length; i++) {
        const eventType = trackingNodes[i].getAttribute('event');
        const url = trackingNodes[i].textContent?.trim();
        if (eventType && url) {
          if (!trackingEvents[eventType]) trackingEvents[eventType] = [];
          trackingEvents[eventType].push(url);
        }
      }
      
      const impressionNodes = xmlDoc.getElementsByTagName('Impression');
      trackingEvents['impression'] = [];
      for (let i = 0; i < impressionNodes.length; i++) {
        const url = impressionNodes[i].textContent?.trim();
        if (url) trackingEvents['impression'].push(url);
      }

      setIsLoadingAd(false);
      setAdState(prev => ({
        ...prev,
        isPlaying: true,
        mediaUrl: mediaFile,
        clickThroughUrl: clickThrough,
        trackingUrls: trackingEvents
      }));
      setAdCountdown(5);
      return true;
    } catch (error) {
      setIsLoadingAd(false);
      return false;
    }
  };

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (vastTagUrl && !adState.hasPlayed && !adState.isPlaying) {
      const success = await loadAd();
      if (success) return; 
    }

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    if (adState.isPlaying && videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
      fireTrackingPixel(adState.trackingUrls['impression']);
      fireTrackingPixel(adState.trackingUrls['start']);
    }
  }, [adState.isPlaying, adState.mediaUrl]);

  const skipAd = () => {
    fireTrackingPixel(adState.trackingUrls['skip']);
    setAdState(prev => ({ ...prev, isPlaying: false, hasPlayed: true }));
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.load();
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }, 50);
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    const progressPercent = (video.currentTime / video.duration) * 100;
    setProgress(progressPercent);
    setCurrentTime(video.currentTime);

    if (adState.isPlaying) {
      const timeLeft = Math.max(0, Math.ceil(adState.skipOffset - video.currentTime));
      setAdCountdown(timeLeft);

      if (progressPercent >= 25) fireTrackingPixel(adState.trackingUrls['firstQuartile']);
      if (progressPercent >= 50) fireTrackingPixel(adState.trackingUrls['midpoint']);
      if (progressPercent >= 75) fireTrackingPixel(adState.trackingUrls['thirdQuartile']);
    }
  };

  const handleVideoEnded = () => {
    if (adState.isPlaying) {
      fireTrackingPixel(adState.trackingUrls['complete']);
      skipAd();
    } else {
      // Loop logic is handled automatically by the video HTML element's 'loop' attribute,
      // but we need to reset UI state if NOT looping.
      if (!isLooping) {
        setIsPlaying(false);
        setShowControls(true);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (adState.isPlaying) return;
    const video = videoRef.current;
    if (!video) return;

    const newTime = (parseFloat(e.target.value) / 100) * video.duration;
    video.currentTime = newTime;
    setProgress(parseFloat(e.target.value));
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

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

  const changeSpeed = (rate: number) => {
    if (adState.isPlaying) return;
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = rate;
    setPlaybackRate(rate);
  };

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        togglePlay();
      }
      if (e.key === 'f') toggleFullscreen();
      if (e.key === 'm') toggleMute();
      if (e.key === 'ArrowRight' && !adState.isPlaying) {
        const video = videoRef.current;
        if (video) video.currentTime += 10;
      }
      if (e.key === 'ArrowLeft' && !adState.isPlaying) {
        const video = videoRef.current;
        if (video) video.currentTime -= 10;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, adState.isPlaying]);

  return (
    <div 
      ref={containerRef}
      className="relative bg-black w-full h-full group flex items-center justify-center font-sans select-none overflow-hidden ring-1 ring-white/5"
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => { if (isPlaying) setShowControls(false); }}
    >
      <video
        ref={videoRef}
        src={adState.isPlaying ? (adState.mediaUrl || undefined) : src}
        poster={adState.isPlaying ? undefined : poster}
        loop={!adState.isPlaying && isLooping} // 🔥 Applies the loop if enabled
        className="w-full h-full object-contain cursor-pointer"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleVideoEnded}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onClick={adState.isPlaying ? undefined : togglePlay}
      />

      {/* 🔥 NEW: Cinematic Vignette Overlay. Creates a dark gradient around the edges to lock in focus */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_120px_rgba(0,0,0,0.9)] z-0" />

      {/* --- Ad Interaction Layers --- */}
      {adState.isPlaying && (
        <>
          {adState.clickThroughUrl && (
            <a 
              href={adState.clickThroughUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="absolute inset-0 z-20 cursor-pointer flex items-start justify-end p-4"
            >
              <div className="bg-black/80 backdrop-blur-sm border border-white/10 text-white text-xs px-4 py-2 rounded-sm flex items-center gap-2 hover:bg-rose-900 transition-all opacity-0 group-hover:opacity-100 shadow-[0_0_15px_rgba(225,29,72,0.5)]">
                Visit Advertiser <ExternalLink size={12} />
              </div>
            </a>
          )}

          <div className="absolute bottom-24 right-0 z-30 pointer-events-auto">
            {adCountdown > 0 ? (
              <div className="bg-black/90 border-l-4 border-rose-600 text-zinc-300 font-medium tracking-wide text-xs px-5 py-3 shadow-2xl select-none">
                You can skip ad in <span className="text-white font-bold tabular-nums">{adCountdown}s</span>
              </div>
            ) : (
              <button 
                onClick={(e) => { e.stopPropagation(); skipAd(); }}
                className="bg-rose-700 hover:bg-rose-600 text-white font-bold tracking-widest text-xs uppercase px-6 py-3 shadow-[0_0_20px_rgba(225,29,72,0.6)] transition-all transform hover:scale-105"
              >
                Skip Advertisement
              </button>
            )}
          </div>
        </>
      )}

      {/* Cinematic Top Title Gradient */}
      <div className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/90 to-transparent transition-opacity duration-500 pointer-events-none z-10 ${showControls && isFullscreen && !adState.isPlaying ? 'opacity-100' : 'opacity-0'}`}>
         {title && (
           <div className="p-6 text-white font-serif italic tracking-wide text-2xl drop-shadow-lg">
             {title}
           </div>
         )}
      </div>

      {/* Loading Spinner */}
      {isLoadingAd && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4 text-rose-600 text-xs tracking-wider uppercase z-20 font-bold">
          <div className="w-10 h-10 border-2 border-t-rose-600 border-rose-900/30 rounded-full animate-spin shadow-[0_0_15px_rgba(225,29,72,0.5)]" />
          Loading...
        </div>
      )}

      {/* 🔥 UPGRADED: Aggressive Red Glow Play Button */}
      {!isPlaying && !adState.isPlaying && !isLoadingAd && (
        <button 
          onClick={togglePlay}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 flex items-center justify-center rounded-full bg-rose-900/40 backdrop-blur-md border border-rose-500/50 text-white hover:bg-rose-800/80 hover:border-rose-500 hover:scale-110 transition-all duration-300 shadow-[0_0_30px_rgba(225,29,72,0.5)] z-10 group-hover:opacity-100"
        >
          <Play size={44} className="ml-2 text-white" fill="currentColor" strokeWidth={0} />
        </button>
      )}

      {/* Custom Controls Bottom Bar */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent px-6 py-8 transition-opacity duration-500 z-20 ${showControls ? 'opacity-100' : 'opacity-0'} ${adState.isPlaying || isLoadingAd ? 'pointer-events-none opacity-40' : ''}`}>
        
        {/* 🔥 UPGRADED: Thicker glowing progress bar with distinct thumb */}
        <div className={`relative w-full h-1.5 bg-zinc-800 rounded-full mb-6 group/progress flex items-center ${adState.isPlaying || isLoadingAd ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
          <input
            type="range"
            min="0"
            max="100"
            disabled={adState.isPlaying || isLoadingAd}
            value={progress || 0}
            onChange={handleSeek}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30 disabled:pointer-events-none"
          />
          <div 
            className={`absolute top-0 left-0 h-full rounded-full pointer-events-none transition-all duration-100 ${adState.isPlaying || isLoadingAd ? 'bg-zinc-600' : 'bg-rose-600 group-hover/progress:bg-rose-500 shadow-[0_0_12px_rgba(225,29,72,0.8)]'}`}
            style={{ width: `${progress}%` }}
          />
          {/* Custom Handle Thumb that appears on hover */}
          {!adState.isPlaying && !isLoadingAd && (
            <div 
              className="absolute w-3.5 h-3.5 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 shadow-[0_0_10px_rgba(255,255,255,1)] pointer-events-none transition-opacity z-20"
              style={{ left: `calc(${progress}% - 7px)` }}
            />
          )}
        </div>

        <div className="flex items-center justify-between text-zinc-300">
          <div className="flex items-center gap-6 pointer-events-auto">
            <button disabled={isLoadingAd} onClick={togglePlay} className="hover:text-rose-500 hover:scale-110 transition-all duration-300 disabled:opacity-50">
              {isPlaying ? <Pause size={24} strokeWidth={2} fill="currentColor" /> : <Play size={24} strokeWidth={2} fill="currentColor" />}
            </button>

            <div className={`flex items-center gap-4 ${adState.isPlaying || isLoadingAd ? 'opacity-30 cursor-not-allowed' : 'text-zinc-400'}`}>
              <button disabled={adState.isPlaying || isLoadingAd} onClick={() => { if (videoRef.current) videoRef.current.currentTime -= 10; }} className="hover:text-white transition-colors duration-300 disabled:hover:text-zinc-400">
                <SkipBack size={18} strokeWidth={2} />
              </button>
              <button disabled={adState.isPlaying || isLoadingAd} onClick={() => { if (videoRef.current) videoRef.current.currentTime += 10; }} className="hover:text-white transition-colors duration-300 disabled:hover:text-zinc-400">
                <SkipForward size={18} strokeWidth={2} />
              </button>
            </div>

            <div className="flex items-center gap-3 group/volume">
              <button onClick={toggleMute} className="hover:text-white transition-colors duration-300">
                {isMuted ? <VolumeX size={20} strokeWidth={2} /> : <Volume2 size={20} strokeWidth={2} />}
              </button>
              <div className="w-0 overflow-hidden group-hover/volume:w-20 transition-all duration-300 ease-out flex items-center">
                {/* 🔥 UPGRADED: Sexy Circular Volume Slider Thumb using Tailwind Arbitrary Variants */}
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-full h-1.5 bg-zinc-700 rounded-full cursor-pointer appearance-none outline-none 
                             [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
                             [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white 
                             [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(255,255,255,0.8)] 
                             [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:border-none 
                             [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white"
                />
              </div>
            </div>

            <span className="text-[11px] font-bold tabular-nums tracking-widest uppercase ml-2 text-zinc-400">
              <span className="text-white">{formatTime(currentTime)}</span> <span className="opacity-40 mx-1">/</span> {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-6 pointer-events-auto">
            
            {/* 🔥 NEW: Loop Toggle Button */}
            <button 
              onClick={() => setIsLooping(!isLooping)} 
              disabled={adState.isPlaying || isLoadingAd}
              className={`transition-all duration-300 ${isLooping ? 'text-rose-500 drop-shadow-[0_0_8px_rgba(225,29,72,0.8)]' : 'text-zinc-500 hover:text-white'} ${adState.isPlaying || isLoadingAd ? 'opacity-30 cursor-not-allowed' : ''}`}
              title="Loop Scene"
            >
              <Repeat size={18} strokeWidth={2} />
            </button>

            <div className={`relative group/speed flex items-center gap-1 hover:text-white transition-colors duration-300 ${adState.isPlaying || isLoadingAd ? 'opacity-30 cursor-not-allowed pointer-events-none' : 'cursor-pointer'}`}>
              <span className="text-[11px] font-bold tracking-widest">{playbackRate}x</span>
              <Settings size={14} strokeWidth={2} />
              
              <div className="absolute bottom-full right-0 mb-4 bg-black/90 backdrop-blur-md border border-zinc-800 rounded-sm overflow-hidden opacity-0 invisible group-hover/speed:opacity-100 group-hover/speed:visible transition-all duration-300 translate-y-2 group-hover/speed:translate-y-0">
                {[0.5, 1, 1.25, 1.5, 2].map((rate) => (
                  <div 
                    key={rate}
                    onClick={() => changeSpeed(rate)}
                    className={`px-6 py-2.5 text-[11px] font-bold tracking-widest cursor-pointer hover:bg-rose-900/60 transition-colors ${playbackRate === rate ? 'text-rose-500 bg-rose-950/30' : 'text-zinc-300'}`}
                  >
                    {rate}x
                  </div>
                ))}
              </div>
            </div>

            <button onClick={toggleFullscreen} className="hover:text-white hover:scale-110 transition-all duration-300">
              {isFullscreen ? <Minimize size={20} strokeWidth={2} /> : <Maximize size={20} strokeWidth={2} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}