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
  autoNext?: boolean;
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
    if (!vastTagUrl) return false;
    
    abortControllerRef.current = new AbortController();
    setIsLoadingAd(true);

    try {
      const timeoutId = setTimeout(() => abortControllerRef.current?.abort(), 2000); // 2 seconds max
      const response = await fetch(vastTagUrl, { signal: abortControllerRef.current.signal });
      clearTimeout(timeoutId);
      
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
    } catch (error) {
      setIsLoadingAd(false);
      return false;
    }
  };

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    // Instantly pause if playing
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
      return;
    }

    // Handle initial play / ad injection ONLY once
    if (!adAttempted && vastTagUrl) {
      setAdAttempted(true); // Never try again, even if it fails
      const adSuccess = await loadAd();
      if (adSuccess) return; 
    }

    // Standard play (Lightning fast)
    video.play().catch(() => {});
    setIsPlaying(true);
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
    
    // Slight timeout ensures React flushes the DOM before we tell the main video to play
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
        loop={!adState.isPlaying && isLooping}
        className="w-full h-full object-contain cursor-pointer"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleVideoEnded}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onClick={adState.isPlaying ? undefined : togglePlay}
      />

      {/* Ad Interaction Layers */}
      {adState.isPlaying && (
        <>
          {adState.clickThroughUrl && (
            <a 
              href={adState.clickThroughUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="absolute inset-0 z-20 cursor-pointer flex items-start justify-end p-4"
            >
              <div className="bg-black/90 border border-zinc-700 text-white text-xs px-4 py-2 flex items-center gap-2 hover:bg-zinc-800 transition-colors">
                Visit Advertiser <ExternalLink size={12} />
              </div>
            </a>
          )}

          <div className="absolute bottom-20 right-0 z-30 pointer-events-auto">
            {adCountdown > 0 ? (
              <div className="bg-black border-l-2 border-zinc-500 text-zinc-300 text-xs px-5 py-3">
                Skip ad in <span className="text-white font-bold">{adCountdown}</span>
              </div>
            ) : (
              <button 
                onClick={(e) => { e.stopPropagation(); skipAd(); }}
                className="bg-zinc-800 hover:bg-zinc-700 border-l-2 border-rose-600 text-white font-bold text-xs uppercase px-6 py-3 transition-colors"
              >
                Skip Ad
              </button>
            )}
          </div>
        </>
      )}

      {/* Loading Ad State */}
      {isLoadingAd && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-3 text-white text-xs uppercase font-bold z-20">
          <div className="w-8 h-8 border-2 border-t-rose-600 border-zinc-800 rounded-full animate-spin" />
          Loading
        </div>
      )}

      {/* Sharp Center Play Button */}
      {!isPlaying && !adState.isPlaying && !isLoadingAd && (
        <button 
          onClick={togglePlay}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-16 flex items-center justify-center bg-rose-700 hover:bg-rose-600 text-white transition-colors z-10"
        >
          <Play size={36} className="ml-1" fill="currentColor" strokeWidth={0} />
        </button>
      )}

      {/* Controls Bar */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-4 py-4 transition-opacity duration-200 z-20 ${showControls ? 'opacity-100' : 'opacity-0'} ${adState.isPlaying || isLoadingAd ? 'pointer-events-none opacity-0' : ''}`}>
        
        {/* Progress Bar (Sharp, flat) */}
        <div className="relative w-full h-1 bg-zinc-700 mb-4 group/progress cursor-pointer flex items-center">
          <input
            type="range"
            min="0"
            max="100"
            value={progress || 0}
            onChange={handleSeek}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
          />
          <div 
            className="absolute top-0 left-0 h-full bg-rose-600 pointer-events-none"
            style={{ width: `${progress}%` }}
          />
          <div 
            className="absolute w-1.5 h-3 bg-white opacity-0 group-hover/progress:opacity-100 pointer-events-none z-20"
            style={{ left: `calc(${progress}% - 3px)` }}
          />
        </div>

        <div className="flex items-center justify-between text-zinc-200">
          <div className="flex items-center gap-5 pointer-events-auto">
            <button onClick={togglePlay} className="hover:text-rose-500 transition-colors">
              {isPlaying ? <Pause size={20} fill="currentColor" strokeWidth={0} /> : <Play size={20} fill="currentColor" strokeWidth={0} />}
            </button>

            <div className="flex items-center gap-3 text-zinc-400">
              <button onClick={() => { if (videoRef.current) videoRef.current.currentTime -= 10; }} className="hover:text-white transition-colors">
                <SkipBack size={16} strokeWidth={2} />
              </button>
              <button onClick={() => { if (videoRef.current) videoRef.current.currentTime += 10; }} className="hover:text-white transition-colors">
                <SkipForward size={16} strokeWidth={2} />
              </button>
            </div>

            <div className="flex items-center gap-2 group/volume">
              <button onClick={toggleMute} className="hover:text-white transition-colors">
                {isMuted ? <VolumeX size={18} strokeWidth={2} /> : <Volume2 size={18} strokeWidth={2} />}
              </button>
              <div className="w-0 overflow-hidden group-hover/volume:w-16 transition-all duration-200 flex items-center">
                {/* Sharp Rectangle Volume Thumb */}
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-full h-1 bg-zinc-700 cursor-pointer appearance-none outline-none 
                             [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-1.5 [&::-webkit-slider-thumb]:h-3 
                             [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-none
                             [&::-moz-range-thumb]:w-1.5 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:border-none 
                             [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:rounded-none"
                />
              </div>
            </div>

            <span className="text-[11px] font-mono tracking-wider ml-2">
              <span className="text-white">{formatTime(currentTime)}</span> / <span className="text-zinc-500">{formatTime(duration)}</span>
            </span>
          </div>

          <div className="flex items-center gap-5 pointer-events-auto">
            <button 
              onClick={() => setIsLooping(!isLooping)} 
              className={`transition-colors ${isLooping ? 'text-rose-500' : 'text-zinc-400 hover:text-white'}`}
            >
              <Repeat size={16} strokeWidth={2} />
            </button>

            <div className="relative group/speed flex items-center gap-1 cursor-pointer text-zinc-400 hover:text-white transition-colors">
              <span className="text-[10px] font-bold">{playbackRate}x</span>
              <Settings size={14} strokeWidth={2} />
              
              <div className="absolute bottom-full right-0 mb-4 bg-zinc-900 border border-zinc-800 opacity-0 invisible group-hover/speed:opacity-100 group-hover/speed:visible transition-all">
                {[0.5, 1, 1.25, 1.5, 2].map((rate) => (
                  <div 
                    key={rate}
                    onClick={() => changeSpeed(rate)}
                    className={`px-4 py-2 text-[11px] font-bold cursor-pointer hover:bg-zinc-800 ${playbackRate === rate ? 'text-rose-500' : 'text-zinc-300'}`}
                  >
                    {rate}x
                  </div>
                ))}
              </div>
            </div>

            <button onClick={toggleFullscreen} className="text-zinc-400 hover:text-white transition-colors">
              {isFullscreen ? <Minimize size={18} strokeWidth={2} /> : <Maximize size={18} strokeWidth={2} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}