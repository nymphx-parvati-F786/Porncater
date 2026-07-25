'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Hls from 'hls.js'; // 🔥 CRITICAL FOR BUNNY STREAM
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, 
  SkipBack, SkipForward, Settings, ExternalLink, Repeat
} from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  vastTagUrl?: string;
  autoNext?: boolean;
}

export default function VideoPlayer({ src, poster, title, vastTagUrl }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  
  const firedTrackingEvents = useRef<Set<string>>(new Set());
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapRef = useRef<number>(0); 

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  
  // Ad State
  const [adAttempted, setAdAttempted] = useState(false);
  const [isLoadingAd, setIsLoadingAd] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [actionAnim, setActionAnim] = useState<'forward' | 'rewind' | null>(null);

  // 🔥 VAST PRE-FETCH STATE
  const [preloadedAd, setPreloadedAd] = useState<{
    mediaUrl: string;
    clickThroughUrl: string | null;
    trackingUrls: { [key: string]: string[] };
  } | null>(null);

  const [adState, setAdState] = useState({
    isPlaying: false,
    skipOffset: 5, 
  });
  const [adCountdown, setAdCountdown] = useState(5);

  // ==========================================
  // 1. BUNNY STREAM HLS.JS INTEGRATION
  // ==========================================
  useEffect(() => {
    const video = videoRef.current;
    if (!video || adState.isPlaying || !src) return;

    // Cleanup previous instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
    }

    if (src.includes('.m3u8') && Hls.isSupported()) {
      const hls = new Hls({
        maxMaxBufferLength: 30, // Tube optimization: prevent excessive buffering costs
        startLevel: -1, // Auto quality
      });
      
      hls.loadSource(src);
      hls.attachMedia(video);
      hlsRef.current = hls;

    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native support (Safari / iOS)
      video.src = src;
    } else {
      // Fallback for raw .mp4
      video.src = src;
    }

    return () => {
      if (hlsRef.current) hlsRef.current.destroy();
    };
  }, [src, adState.isPlaying]);

  // ==========================================
  // 2. VAST BACKGROUND PRE-FETCHING
  // ==========================================
  useEffect(() => {
    if (!vastTagUrl) return;

    const fetchAd = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(vastTagUrl, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (!response.ok) return;
        
        const text = await response.text();
        const xmlDoc = new DOMParser().parseFromString(text, 'text/xml');
        const mediaFile = xmlDoc.getElementsByTagName('MediaFile')[0]?.textContent?.trim();
        
        if (!mediaFile) return;

        const clickThrough = xmlDoc.getElementsByTagName('ClickThrough')[0]?.textContent?.trim() || null;
        const trackingEvents: { [key: string]: string[] } = { impression: [] };
        
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
        for (let i = 0; i < impressionNodes.length; i++) {
          const url = impressionNodes[i].textContent?.trim();
          if (url) trackingEvents['impression'].push(url);
        }

        // Cache it silently in the background!
        setPreloadedAd({
          mediaUrl: mediaFile,
          clickThroughUrl: clickThrough,
          trackingUrls: trackingEvents
        });
      } catch (error) {
        console.warn("VAST Prefetch skipped/failed.");
      }
    };

    fetchAd();
  }, [vastTagUrl]);

  // ==========================================
  // 3. INITIALIZATION & MEMORY
  // ==========================================
  useEffect(() => {
    const savedVol = localStorage.getItem('porncater_vol');
    if (savedVol !== null) {
      const parsed = parseFloat(savedVol);
      setVolume(parsed);
      setIsMuted(parsed === 0);
      if (videoRef.current) videoRef.current.volume = parsed;
    }
  }, []);

  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying && !adState.isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 2500);
    }
  }, [isPlaying, adState.isPlaying]);

  useEffect(() => {
    resetControlsTimeout();
    return () => { if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current); };
  }, [isPlaying, resetControlsTimeout]);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // ==========================================
  // 4. AD ENGINE & TRACKING
  // ==========================================
  const fireTrackingPixel = (urls: string[] | undefined) => {
    if (!urls) return;
    urls.forEach(url => {
      if (url && !firedTrackingEvents.current.has(url)) {
        firedTrackingEvents.current.add(url);
        new window.Image().src = url;
      }
    });
  };

  const skipAd = () => {
    if (preloadedAd) fireTrackingPixel(preloadedAd.trackingUrls['skip']);
    setAdState({ isPlaying: false, skipOffset: 5 });
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    
    // Resume Main Video
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }, 50);
  };

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
      return;
    }

    // 🔥 ZERO-LATENCY AD INJECTION
    if (!adAttempted && preloadedAd) {
      setAdAttempted(true);
      setAdState({ isPlaying: true, skipOffset: 5 });
      video.src = preloadedAd.mediaUrl;
      video.load();
      video.play().catch(() => {});
      setIsPlaying(true);
      fireTrackingPixel(preloadedAd.trackingUrls['impression']);
      fireTrackingPixel(preloadedAd.trackingUrls['start']);
      return;
    }

    video.play().catch(() => {});
    setIsPlaying(true);
  };

  // ==========================================
  // 5. BULLETPROOF MOBILE TOUCH ZONES
  // ==========================================
  const handleZoneTouch = (zone: 'left' | 'center' | 'right') => {
    if (adState.isPlaying) return;

    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double Tap Detected
      const video = videoRef.current;
      if (!video) return;

      if (zone === 'right') {
        video.currentTime = Math.min(video.currentTime + 10, video.duration);
        showActionAnimation('forward');
      } else if (zone === 'left') {
        video.currentTime = Math.max(video.currentTime - 10, 0);
        showActionAnimation('rewind');
      } else {
        toggleFullscreen();
      }
      resetControlsTimeout();
    } else {
      // Single Tap Detected
      if (window.innerWidth < 768) {
        setShowControls(!showControls);
      } else {
        togglePlay();
      }
      resetControlsTimeout();
    }
    
    lastTapRef.current = now;
  };

  const showActionAnimation = (type: 'forward' | 'rewind') => {
    setActionAnim(type);
    setTimeout(() => setActionAnim(null), 500);
  };

  // ==========================================
  // 6. VIDEO EVENT HANDLERS
  // ==========================================
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    const progressPercent = (video.currentTime / video.duration) * 100;
    setProgress(progressPercent);
    setCurrentTime(video.currentTime);

    if (adState.isPlaying && preloadedAd) {
      const timeLeft = Math.max(0, Math.ceil(adState.skipOffset - video.currentTime));
      setAdCountdown(timeLeft);

      if (progressPercent >= 25) fireTrackingPixel(preloadedAd.trackingUrls['firstQuartile']);
      if (progressPercent >= 50) fireTrackingPixel(preloadedAd.trackingUrls['midpoint']);
      if (progressPercent >= 75) fireTrackingPixel(preloadedAd.trackingUrls['thirdQuartile']);
    }
  };

  const handleVideoEnded = () => {
    if (adState.isPlaying && preloadedAd) {
      fireTrackingPixel(preloadedAd.trackingUrls['complete']);
      skipAd();
    } else {
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

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    localStorage.setItem('porncater_vol', newVolume.toString());
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      const newVol = volume || 1;
      video.volume = newVol;
      setIsMuted(false);
      localStorage.setItem('porncater_vol', newVol.toString());
    } else {
      video.volume = 0;
      setIsMuted(true);
      localStorage.setItem('porncater_vol', '0');
    }
  };

  const changeSpeed = (rate: number) => {
    if (adState.isPlaying) return;
    if (videoRef.current) videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    if (!isFullscreen) container.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div 
      ref={containerRef}
      className={`relative bg-black w-full h-full group flex items-center justify-center font-sans select-none overflow-hidden touch-manipulation ${!showControls && isPlaying ? 'cursor-none' : 'cursor-default'}`}
      onMouseMove={resetControlsTimeout}
      onMouseLeave={() => { if (isPlaying) setShowControls(false); }}
      onMouseEnter={() => setIsHovering(true)}
    >
      <video
        ref={videoRef}
        poster={adState.isPlaying ? undefined : poster}
        loop={!adState.isPlaying && isLooping}
        preload="metadata"
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleVideoEnded}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        playsInline 
      />

      {/* 🔥 INVISIBLE TOUCH ZONES FOR FLAWLESS DOUBLE TAP */}
      {!adState.isPlaying && (
        <>
          <div className="absolute top-0 left-0 w-1/3 h-[calc(100%-60px)] z-10" onClick={() => handleZoneTouch('left')} />
          <div className="absolute top-0 left-1/3 w-1/3 h-[calc(100%-60px)] z-10" onClick={() => handleZoneTouch('center')} />
          <div className="absolute top-0 right-0 w-1/3 h-[calc(100%-60px)] z-10" onClick={() => handleZoneTouch('right')} />
        </>
      )}

      {/* DOUBLE TAP ANIMATIONS */}
      {actionAnim && (
        <div className={`absolute top-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-md rounded-full p-4 pointer-events-none animate-pulse z-20 ${actionAnim === 'forward' ? 'right-1/4' : 'left-1/4'}`}>
           {actionAnim === 'forward' ? <SkipForward size={32} className="text-white" /> : <SkipBack size={32} className="text-white" />}
        </div>
      )}

      {/* AD INTERACTION LAYERS */}
      {adState.isPlaying && preloadedAd && (
        <>
          {preloadedAd.clickThroughUrl && (
            <a 
              href={preloadedAd.clickThroughUrl} 
              target="_blank" 
              rel="noopener noreferrer nofollow" 
              className="absolute inset-0 z-20 cursor-pointer flex items-start justify-end p-4"
              aria-label="Visit Advertisement Sponsor"
            >
              <div className="bg-rose-700 text-white font-bold text-[10px] px-4 py-2 uppercase tracking-widest flex items-center gap-2 hover:bg-rose-600 transition-colors shadow-lg">
                Visit Sponsor <ExternalLink size={12} strokeWidth={2.5} />
              </div>
            </a>
          )}

          <div className="absolute bottom-20 right-0 z-30 pointer-events-auto">
            {adCountdown > 0 ? (
              <div className="bg-black/90 border-l-2 border-zinc-600 text-zinc-300 text-[10px] uppercase font-bold tracking-widest px-5 py-3">
                Skip ad in <span className="text-white text-sm">{adCountdown}</span>
              </div>
            ) : (
              <button 
                onClick={(e) => { e.stopPropagation(); skipAd(); }}
                className="bg-black/90 hover:bg-zinc-900 border-l-2 border-rose-600 text-white font-bold text-xs uppercase px-6 py-3 transition-colors flex items-center gap-2"
              >
                Skip Ad <SkipForward size={14} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </>
      )}

      {/* LOADING SPINNER */}
      {isLoadingAd && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-3 text-white text-[10px] uppercase tracking-widest font-bold z-20">
          <div className="w-10 h-10 border-[3px] border-t-rose-600 border-zinc-800 rounded-full animate-spin" />
          Buffering
        </div>
      )}

      {/* GIANT PLAY BUTTON OVERLAY */}
      {!isPlaying && !adState.isPlaying && !isLoadingAd && (
        <button 
          onClick={togglePlay}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-14 flex items-center justify-center bg-rose-700 hover:bg-rose-600 text-white transition-colors z-30 shadow-[0_0_20px_rgba(190,18,60,0.5)] border border-rose-500/30 rounded-sm"
          aria-label="Play Video"
        >
          <Play size={32} className="ml-1" fill="currentColor" strokeWidth={0} />
        </button>
      )}

      {/* BOTTOM CONTROLS BAR */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent pt-16 pb-2 md:pb-4 px-2 md:px-4 transition-all duration-300 z-40 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'} ${adState.isPlaying || isLoadingAd ? 'hidden' : ''}`}
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="relative w-full py-3 -mt-3 mb-2 group/progress cursor-pointer flex items-center">
          <div className="relative w-full h-1.5 md:h-1 bg-zinc-800 group-hover/progress:h-2 transition-all">
            <input
              type="range"
              min="0" max="100" step="0.1"
              value={progress || 0}
              onChange={handleSeek}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50"
            />
            <div className="absolute top-0 left-0 h-full bg-rose-600 pointer-events-none shadow-[0_0_10px_rgba(225,29,72,0.8)]" style={{ width: `${progress}%` }} />
            <div className="absolute w-1 h-3 md:h-4 bg-white opacity-0 group-hover/progress:opacity-100 pointer-events-none z-40 transition-opacity -mt-1 md:-mt-1.5" style={{ left: `calc(${progress}% - 2px)` }} />
          </div>
        </div>

        <div className="flex items-center justify-between text-zinc-200 px-1 md:px-2">
          {/* LEFT SIDE */}
          <div className="flex items-center gap-4 md:gap-6 pointer-events-auto">
            <button onClick={togglePlay} className="hover:text-rose-500 transition-colors p-1">
              {isPlaying ? <Pause size={22} fill="currentColor" strokeWidth={0} /> : <Play size={22} fill="currentColor" strokeWidth={0} />}
            </button>

            <div className="hidden md:flex items-center gap-4 text-zinc-400">
              <button onClick={() => { if (videoRef.current) videoRef.current.currentTime -= 10; }} className="hover:text-white transition-colors">
                <SkipBack size={18} strokeWidth={2} />
              </button>
              <button onClick={() => { if (videoRef.current) videoRef.current.currentTime += 10; }} className="hover:text-white transition-colors">
                <SkipForward size={18} strokeWidth={2} />
              </button>
            </div>

            <div className="flex items-center gap-2 group/volume">
              <button onClick={toggleMute} className="hover:text-rose-500 transition-colors p-1 text-zinc-300">
                {isMuted || volume === 0 ? <VolumeX size={20} strokeWidth={2} /> : <Volume2 size={20} strokeWidth={2} />}
              </button>
              <div className="w-0 overflow-hidden group-hover/volume:w-16 transition-all duration-300 flex items-center">
                <input
                  type="range" min="0" max="1" step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-full h-1 bg-zinc-700 cursor-pointer appearance-none outline-none 
                             [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-1 [&::-webkit-slider-thumb]:h-3 
                             [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-none
                             [&::-moz-range-thumb]:w-1 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:border-none 
                             [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:rounded-none"
                />
              </div>
            </div>

            <span className="text-[11px] md:text-xs font-mono tracking-wider ml-1 select-none pointer-events-none">
              <span className="text-white">{formatTime(currentTime)}</span> 
              <span className="text-zinc-600 mx-1">/</span> 
              <span className="text-zinc-400">{formatTime(duration)}</span>
            </span>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-4 md:gap-6 pointer-events-auto">
            <button 
              onClick={() => setIsLooping(!isLooping)} 
              className={`transition-colors p-1 hidden sm:block ${isLooping ? 'text-rose-500' : 'text-zinc-400 hover:text-white'}`}
            >
              <Repeat size={18} strokeWidth={2} />
            </button>

            <div className="relative group/speed flex items-center gap-1.5 cursor-pointer text-zinc-400 hover:text-white transition-colors p-1">
              <Settings size={18} strokeWidth={2} className="group-hover/speed:rotate-90 transition-transform duration-300" />
              <div className="absolute bottom-full right-0 mb-4 bg-black/90 backdrop-blur-md border border-zinc-800 opacity-0 invisible group-hover/speed:opacity-100 group-hover/speed:visible transition-all flex flex-col py-2 rounded-sm shadow-2xl">
                <div className="px-4 py-1 text-[9px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Speed</div>
                {[0.5, 1, 1.25, 1.5, 2].map((rate) => (
                  <div 
                    key={rate}
                    onClick={() => changeSpeed(rate)}
                    className={`px-6 py-2 text-xs font-bold cursor-pointer hover:bg-zinc-800 flex items-center justify-between gap-4 ${playbackRate === rate ? 'text-rose-500' : 'text-zinc-300'}`}
                  >
                    {rate === 1 ? 'Normal' : `${rate}x`}
                    {playbackRate === rate && <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />}
                  </div>
                ))}
              </div>
            </div>

            <button onClick={toggleFullscreen} className="text-zinc-300 hover:text-rose-500 transition-colors p-1">
              {isFullscreen ? <Minimize size={20} strokeWidth={2} /> : <Maximize size={20} strokeWidth={2} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}