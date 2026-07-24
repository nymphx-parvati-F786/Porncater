'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
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
  const firedTrackingEvents = useRef<Set<string>>(new Set());
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Timer ref for auto-hiding controls
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

  const [adState, setAdState] = useState<{
    isPlaying: boolean;
    mediaUrl: string | null;
    clickThroughUrl: string | null;
    skipOffset: number;
    trackingUrls: { [key: string]: string[] };
  }>({
    isPlaying: false,
    mediaUrl: null,
    clickThroughUrl: null,
    skipOffset: 5, 
    trackingUrls: {},
  });

  const [adCountdown, setAdCountdown] = useState(5);

  // ==========================================
  // INITIALIZATION & MEMORY
  // ==========================================
  useEffect(() => {
    // 🔥 UX PRO-MOVE: Remember the user's volume preference across videos
    const savedVol = localStorage.getItem('porncater_vol');
    if (savedVol !== null) {
      const parsed = parseFloat(savedVol);
      setVolume(parsed);
      setIsMuted(parsed === 0);
      if (videoRef.current) videoRef.current.volume = parsed;
    }
  }, []);

  // ==========================================
  // SMART CONTROL HIDING & FULLSCREEN SYNC
  // ==========================================
  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    
    if (isPlaying && !adState.isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2500);
    }
  }, [isPlaying, adState.isPlaying]);

  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [isPlaying, resetControlsTimeout]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // ==========================================
  // KEYBOARD SHORTCUTS
  // ==========================================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      
      const video = videoRef.current;
      if (!video || adState.isPlaying) return;

      // Only allow spacebar play/pause if the player is in viewport to prevent page jumping
      const rect = containerRef.current?.getBoundingClientRect();
      const inView = rect && rect.top >= 0 && rect.bottom <= window.innerHeight;

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          if (inView || e.key === 'k') {
            e.preventDefault();
            togglePlay();
            resetControlsTimeout();
          }
          break;
        case 'arrowright':
          e.preventDefault();
          video.currentTime = Math.min(video.currentTime + 10, video.duration);
          resetControlsTimeout();
          break;
        case 'arrowleft':
          e.preventDefault();
          video.currentTime = Math.max(video.currentTime - 10, 0);
          resetControlsTimeout();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          resetControlsTimeout();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, adState.isPlaying, isFullscreen]);

  // ==========================================
  // AD ENGINE & TRACKING
  // ==========================================
  const fireTrackingPixel = (urls: string[] | undefined) => {
    if (!urls) return;
    urls.forEach(url => {
      if (url && !firedTrackingEvents.current.has(url)) {
        firedTrackingEvents.current.add(url);
        const img = new window.Image();
        img.src = url;
      }
    });
  };

  const loadAd = async (): Promise<boolean> => {
    if (!vastTagUrl) return false;
    
    abortControllerRef.current = new AbortController();
    setIsLoadingAd(true);

    try {
      // 🔥 THE ABORT FIX: Supply reason, handle catch gracefully
      const timeoutId = setTimeout(() => {
        abortControllerRef.current?.abort("VAST fetch timed out");
      }, 3000); 

      const response = await fetch(vastTagUrl, { signal: abortControllerRef.current.signal });
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error("Failed to load VAST XML");

      const text = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, 'text/xml');

      const mediaFile = xmlDoc.getElementsByTagName('MediaFile')[0]?.textContent?.trim();
      if (!mediaFile) throw new Error("No media");

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
      return true;
    } catch (error: any) {
      // 🔥 SILENT CATCH: Fallback to normal video if ad is blocked or slow
      setIsLoadingAd(false);
      if (error.name !== "AbortError" && error !== "VAST fetch timed out") {
        console.error("Ad Engine skipped:", error.message);
      }
      return false;
    }
  };

  // ==========================================
  // PLAYBACK & INTERACTION
  // ==========================================
  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
      return;
    }

    if (!adAttempted && vastTagUrl) {
      setAdAttempted(true);
      const adSuccess = await loadAd();
      if (adSuccess) return; 
    }

    video.play().catch(() => {});
    setIsPlaying(true);
  };

  // Mobile Double Tap to Seek
  const handleVideoTouch = (e: React.MouseEvent<HTMLVideoElement> | React.TouchEvent<HTMLVideoElement>) => {
    if (adState.isPlaying) return;

    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      const video = videoRef.current;
      if (!video) return;

      const rect = e.currentTarget.getBoundingClientRect();
      // 🔥 MOBILE TOUCH FIX: Account for changedTouches on touchEnd events
      const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as React.MouseEvent).clientX;
      const clickX = clientX - rect.left;
      
      if (clickX > rect.width / 2) {
        video.currentTime = Math.min(video.currentTime + 10, video.duration);
        showActionAnimation('forward');
      } else {
        video.currentTime = Math.max(video.currentTime - 10, 0);
        showActionAnimation('rewind');
      }
      resetControlsTimeout();
    } else {
      togglePlay();
      resetControlsTimeout();
    }
    
    lastTapRef.current = now;
  };

  const [actionAnim, setActionAnim] = useState<'forward' | 'rewind' | null>(null);
  const showActionAnimation = (type: 'forward' | 'rewind') => {
    setActionAnim(type);
    setTimeout(() => setActionAnim(null), 500);
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
    setAdState(prev => ({ ...prev, isPlaying: false }));
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
      className={`relative bg-black w-full h-full group flex items-center justify-center font-sans select-none overflow-hidden ${!showControls && isPlaying ? 'cursor-none' : 'cursor-default'}`}
      onMouseMove={resetControlsTimeout}
      onMouseLeave={() => { if (isPlaying) setShowControls(false); }}
      onMouseEnter={() => setIsHovering(true)}
    >
      {/* NATIVE VIDEO ELEMENT */}
      <video
        ref={videoRef}
        src={adState.isPlaying ? (adState.mediaUrl || undefined) : src}
        poster={adState.isPlaying ? undefined : poster}
        loop={!adState.isPlaying && isLooping}
        preload="metadata" // 🔥 SEO LCP FIX: Instantly fetches first frame data without wasting bandwidth
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleVideoEnded}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onClick={handleVideoTouch}
        onTouchEnd={handleVideoTouch}
        playsInline 
      />

      {/* DOUBLE TAP ANIMATIONS */}
      {actionAnim && (
        <div className={`absolute top-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-md rounded-full p-4 pointer-events-none animate-pulse ${actionAnim === 'forward' ? 'right-1/4' : 'left-1/4'}`}>
           {actionAnim === 'forward' ? <SkipForward size={32} className="text-white" /> : <SkipBack size={32} className="text-white" />}
        </div>
      )}

      {/* AD INTERACTION LAYERS */}
      {adState.isPlaying && (
        <>
          {adState.clickThroughUrl && (
            <a 
              href={adState.clickThroughUrl} 
              target="_blank" 
              rel="noopener noreferrer nofollow" 
              className="absolute inset-0 z-20 cursor-pointer flex items-start justify-end p-4"
              aria-label="Visit Advertisement Sponsor"
            >
              <div className="bg-rose-700 text-white font-bold text-[10px] px-4 py-2 uppercase tracking-widest flex items-center gap-2 hover:bg-rose-600 transition-colors">
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
                aria-label="Skip Advertisement"
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
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-14 flex items-center justify-center bg-rose-700 hover:bg-rose-600 text-white transition-colors z-10 shadow-[0_0_20px_rgba(190,18,60,0.5)] border border-rose-500/30"
          aria-label="Play Video"
        >
          <Play size={32} className="ml-1" fill="currentColor" strokeWidth={0} />
        </button>
      )}

      {/* BOTTOM CONTROLS BAR */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent pt-12 pb-2 md:pb-4 px-2 md:px-4 transition-all duration-300 z-20 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'} ${adState.isPlaying || isLoadingAd ? 'hidden' : ''}`}
        onClick={(e) => e.stopPropagation()} 
      >
        
        {/* 🔥 MOBILE UX FIX: Fat-finger padding wrapper for the progress bar */}
        <div className="relative w-full py-2 -mt-2 mb-2 group/progress cursor-pointer flex items-center">
          <div className="relative w-full h-1.5 md:h-1 bg-zinc-800 group-hover/progress:h-2 transition-all">
            <input
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={progress || 0}
              onChange={handleSeek}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
              aria-label="Seek Video Timeline"
            />
            {/* Active Progress */}
            <div 
              className="absolute top-0 left-0 h-full bg-rose-600 pointer-events-none shadow-[0_0_10px_rgba(225,29,72,0.8)]"
              style={{ width: `${progress}%` }}
            />
            {/* Scrubber Thumb */}
            <div 
              className="absolute w-1 h-3 md:h-4 bg-white opacity-0 group-hover/progress:opacity-100 pointer-events-none z-20 transition-opacity -mt-1 md:-mt-1.5"
              style={{ left: `calc(${progress}% - 2px)` }}
            />
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="flex items-center justify-between text-zinc-200 px-1 md:px-2">
          
          {/* LEFT SIDE */}
          <div className="flex items-center gap-4 md:gap-6 pointer-events-auto">
            <button onClick={togglePlay} aria-label={isPlaying ? "Pause" : "Play"} className="hover:text-rose-500 transition-colors p-1">
              {isPlaying ? <Pause size={22} fill="currentColor" strokeWidth={0} /> : <Play size={22} fill="currentColor" strokeWidth={0} />}
            </button>

            {/* PC Only Seek Buttons */}
            <div className="hidden md:flex items-center gap-4 text-zinc-400">
              <button onClick={() => { if (videoRef.current) videoRef.current.currentTime -= 10; }} aria-label="Rewind 10 Seconds" className="hover:text-white transition-colors">
                <SkipBack size={18} strokeWidth={2} />
              </button>
              <button onClick={() => { if (videoRef.current) videoRef.current.currentTime += 10; }} aria-label="Skip Forward 10 Seconds" className="hover:text-white transition-colors">
                <SkipForward size={18} strokeWidth={2} />
              </button>
            </div>

            <div className="flex items-center gap-2 group/volume">
              <button onClick={toggleMute} aria-label="Toggle Mute" className="hover:text-rose-500 transition-colors p-1 text-zinc-300">
                {isMuted || volume === 0 ? <VolumeX size={20} strokeWidth={2} /> : <Volume2 size={20} strokeWidth={2} />}
              </button>
              <div className="w-0 overflow-hidden group-hover/volume:w-16 transition-all duration-300 flex items-center">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  aria-label="Adjust Volume"
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
              aria-label="Toggle Loop Playback"
              className={`transition-colors p-1 hidden sm:block ${isLooping ? 'text-rose-500' : 'text-zinc-400 hover:text-white'}`}
            >
              <Repeat size={18} strokeWidth={2} />
            </button>

            <div className="relative group/speed flex items-center gap-1.5 cursor-pointer text-zinc-400 hover:text-white transition-colors p-1">
              <Settings size={18} strokeWidth={2} className="group-hover/speed:rotate-90 transition-transform duration-300" aria-label="Playback Speed Settings" />
              
              <div className="absolute bottom-full right-0 mb-4 bg-black/90 backdrop-blur-md border border-zinc-800 opacity-0 invisible group-hover/speed:opacity-100 group-hover/speed:visible transition-all flex flex-col py-2 rounded-sm shadow-2xl">
                <div className="px-4 py-1 text-[9px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Playback Speed</div>
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

            <button onClick={toggleFullscreen} aria-label="Toggle Fullscreen" className="text-zinc-300 hover:text-rose-500 transition-colors p-1">
              {isFullscreen ? <Minimize size={20} strokeWidth={2} /> : <Maximize size={20} strokeWidth={2} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}