'use client';

import { useRef, useState, useEffect } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, 
  SkipBack, SkipForward, Settings, ExternalLink
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

  // Clean up any running network requests if the component unmounts
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const fireTrackingPixel = (urls: string[] | undefined) => {
    if (!urls) return;
    urls.forEach(url => {
      if (url && !firedTrackingEvents.current.has(url)) {
        firedTrackingEvents.current.add(url);
        // Using a modern, native image beacon fallback to prevent UI thread blockage
        const img = new Image();
        img.src = url;
      }
    });
  };

  const loadAd = async (): Promise<boolean> => {
    if (!vastTagUrl || adState.hasPlayed) return false;
    
    // Cancel any previous pending requests safely
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    setIsLoadingAd(true);

    try {
      // Set a strict 3-second timeout for the ad network to respond. 
      // If their server is slow or blocked by an ad-blocker, we bypass it immediately.
      const timeoutId = setTimeout(() => abortControllerRef.current?.abort(), 3000);

      const response = await fetch(vastTagUrl, { 
        signal: abortControllerRef.current.signal 
      });
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
      // Catches network failures, adblock dropouts, or timeouts gracefully
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
      setIsPlaying(false);
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
      className="relative bg-black w-full h-full group flex items-center justify-center font-sans select-none overflow-hidden"
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => { if (isPlaying) setShowControls(false); }}
    >
      <video
        ref={videoRef}
        src={adState.isPlaying ? (adState.mediaUrl || undefined) : src}
        poster={adState.isPlaying ? undefined : poster}
        className="w-full h-full object-contain cursor-pointer"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleVideoEnded}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onClick={adState.isPlaying ? undefined : togglePlay}
      />

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
              <div className="bg-black/60 backdrop-blur-sm border border-white/10 text-white text-xs px-3 py-2 rounded-sm flex items-center gap-2 hover:bg-rose-950/80 transition-all opacity-0 group-hover:opacity-100">
                Visit Advertiser <ExternalLink size={12} />
              </div>
            </a>
          )}

          <div className="absolute bottom-24 right-0 z-30 pointer-events-auto">
            {adCountdown > 0 ? (
              <div className="bg-black/80 border-l-4 border-rose-600 text-zinc-300 font-medium tracking-wide text-xs px-5 py-3 shadow-lg select-none">
                You can skip ad in <span className="text-white font-bold tabular-nums">{adCountdown}s</span>
              </div>
            ) : (
              <button 
                onClick={(e) => { e.stopPropagation(); skipAd(); }}
                className="bg-rose-700 hover:bg-rose-600 text-white font-bold tracking-widest text-xs uppercase px-6 py-3 shadow-[0_0_15px_rgba(225,29,72,0.4)] transition-all transform hover:scale-102"
              >
                Skip Advertisement
              </button>
            )}
          </div>

          <div className="absolute top-6 left-6 bg-black/50 backdrop-blur-sm border border-white/10 text-[10px] text-zinc-400 font-bold tracking-widest uppercase px-3 py-1.5 rounded-sm pointer-events-none z-30">
            Advertisement
          </div>
        </>
      )}

      {/* Cinematic Top Gradient */}
      <div className={`absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-500 pointer-events-none ${showControls && isFullscreen && !adState.isPlaying ? 'opacity-100' : 'opacity-0'}`}>
         {title && (
           <div className="p-6 text-white font-serif italic tracking-wide text-xl">
             {title}
           </div>
         )}
      </div>

      {/* Loading Spinner for Slow Ad Server Fetching */}
      {isLoadingAd && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-3 text-zinc-400 text-xs tracking-wider uppercase">
          <div className="w-8 h-8 border-2 border-t-rose-600 border-zinc-700 rounded-full animate-spin" />
          Loading content...
        </div>
      )}

      {/* Big Center Play Button */}
      {!isPlaying && !adState.isPlaying && !isLoadingAd && (
        <button 
          onClick={togglePlay}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-md border border-white/20 text-white hover:bg-rose-900/40 hover:border-rose-800 hover:scale-105 transition-all duration-500 group-hover:opacity-100"
        >
          <Play size={40} className="ml-2 opacity-90" fill="currentColor" strokeWidth={1} />
        </button>
      )}

      {/* Custom Controls Bottom Bar */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-6 py-8 transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0'} ${adState.isPlaying || isLoadingAd ? 'pointer-events-none opacity-40' : ''}`}>
        
        {/* Sleek Progress Bar */}
        <div className={`relative w-full h-1 bg-white/20 rounded-full mb-6 group/progress ${adState.isPlaying || isLoadingAd ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
          <input
            type="range"
            min="0"
            max="100"
            disabled={adState.isPlaying || isLoadingAd}
            value={progress || 0}
            onChange={handleSeek}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:pointer-events-none"
          />
          <div 
            className={`absolute top-0 left-0 h-full rounded-full pointer-events-none transition-colors ${adState.isPlaying || isLoadingAd ? 'bg-zinc-500' : 'bg-rose-700 group-hover/progress:bg-rose-600'}`}
            style={{ width: `${progress}%` }}
          />
          {!adState.isPlaying && !isLoadingAd && (
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 shadow-[0_0_10px_rgba(255,255,255,0.5)] pointer-events-none transition-opacity"
              style={{ left: `calc(${progress}% - 6px)` }}
            />
          )}
        </div>

        <div className="flex items-center justify-between text-zinc-300">
          <div className="flex items-center gap-6 pointer-events-auto">
            <button disabled={isLoadingAd} onClick={togglePlay} className="hover:text-white transition-colors duration-300 disabled:opacity-50">
              {isPlaying ? <Pause size={24} strokeWidth={1.5} fill="currentColor" /> : <Play size={24} strokeWidth={1.5} fill="currentColor" />}
            </button>

            <div className={`flex items-center gap-4 ${adState.isPlaying || isLoadingAd ? 'opacity-30 cursor-not-allowed' : 'text-zinc-400'}`}>
              <button disabled={adState.isPlaying || isLoadingAd} onClick={() => { if (videoRef.current) videoRef.current.currentTime -= 10; }} className="hover:text-white transition-colors duration-300 disabled:hover:text-zinc-400">
                <SkipBack size={18} strokeWidth={1.5} />
              </button>
              <button disabled={adState.isPlaying || isLoadingAd} onClick={() => { if (videoRef.current) videoRef.current.currentTime += 10; }} className="hover:text-white transition-colors duration-300 disabled:hover:text-zinc-400">
                <SkipForward size={18} strokeWidth={1.5} />
              </button>
            </div>

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

            <span className="text-[11px] font-medium tabular-nums tracking-widest uppercase ml-2 opacity-80">
              {formatTime(currentTime)} <span className="opacity-50 mx-1">/</span> {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-6 pointer-events-auto">
            <div className={`relative group/speed flex items-center gap-1 hover:text-white transition-colors duration-300 ${adState.isPlaying || isLoadingAd ? 'opacity-30 cursor-not-allowed pointer-events-none' : 'cursor-pointer'}`}>
              <span className="text-[11px] font-medium tracking-widest">{playbackRate}x</span>
              <Settings size={14} strokeWidth={1.5} />
              
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

            <button onClick={toggleFullscreen} className="hover:text-white transition-colors duration-300">
              {isFullscreen ? <Minimize size={20} strokeWidth={1.5} /> : <Maximize size={20} strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}