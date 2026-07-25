'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Hls from 'hls.js';
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
  const originalSrcRef = useRef(src);
  const firedTracking = useRef<Set<string>>(new Set());
  const controlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const singleTapTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTap = useRef(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLooping, setIsLooping] = useState(false);
  const [actionAnim, setActionAnim] = useState<'forward' | 'rewind' | null>(null);
  const [adAttempted, setAdAttempted] = useState(false);
  const [isLoadingAd, setIsLoadingAd] = useState(false);

  const [preloadedAd, setPreloadedAd] = useState<{
    mediaUrl: string;
    clickThroughUrl: string | null;
    trackingUrls: Record<string, string[]>;
  } | null>(null);

  const [adState, setAdState] = useState({ isPlaying: false, skipOffset: 5 });
  const [adCountdown, setAdCountdown] = useState(5);

  // ─── HLS ───────────────────────────────────────────────
  useEffect(() => {
    originalSrcRef.current = src;
    const video = videoRef.current;
    if (!video || adState.isPlaying || !src) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (src.includes('.m3u8') && Hls.isSupported()) {
      const hls = new Hls({
        maxMaxBufferLength: 30,
        startLevel: -1,
        enableWorker: true,
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hlsRef.current = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    } else {
      video.src = src;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, adState.isPlaying]);

  // ─── VAST PREFETCH ─────────────────────────────────────
  useEffect(() => {
    if (!vastTagUrl) return;
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 4500);

    fetch(vastTagUrl, { signal: controller.signal })
      .then(r => r.ok ? r.text() : Promise.reject())
      .then(text => {
        const doc = new DOMParser().parseFromString(text, 'text/xml');
        const media = doc.getElementsByTagName('MediaFile')[0]?.textContent?.trim();
        if (!media) return;

        const click = doc.getElementsByTagName('ClickThrough')[0]?.textContent?.trim() || null;
        const tracking: Record<string, string[]> = { impression: [] };

        Array.from(doc.getElementsByTagName('Tracking')).forEach(node => {
          const ev = node.getAttribute('event');
          const url = node.textContent?.trim();
          if (ev && url) {
            if (!tracking[ev]) tracking[ev] = [];
            tracking[ev].push(url);
          }
        });
        Array.from(doc.getElementsByTagName('Impression')).forEach(node => {
          const url = node.textContent?.trim();
          if (url) tracking.impression.push(url);
        });

        setPreloadedAd({ mediaUrl: media, clickThroughUrl: click, trackingUrls: tracking });
      })
      .catch(() => { });

    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [vastTagUrl]);

  // ─── VOLUME MEMORY ─────────────────────────────────────
  useEffect(() => {
    const v = localStorage.getItem('porncater_vol');
    if (v !== null) {
      const n = parseFloat(v);
      setVolume(n);
      setIsMuted(n === 0);
      if (videoRef.current) videoRef.current.volume = n;
    }
  }, []);

  // ─── CONTROLS AUTO-HIDE ────────────────────────────────
  const resetControls = useCallback(() => {
    setShowControls(true);
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    if (isPlaying && !adState.isPlaying) {
      controlsTimeout.current = setTimeout(() => setShowControls(false), 1800);
    }
  }, [isPlaying, adState.isPlaying]);

  useEffect(() => {
    resetControls();
    return () => { if (controlsTimeout.current) clearTimeout(controlsTimeout.current); };
  }, [isPlaying, resetControls]);

  useEffect(() => {
    const fn = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', fn);
    return () => document.removeEventListener('fullscreenchange', fn);
  }, []);

  // ─── KEYBOARD ──────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!containerRef.current?.contains(document.activeElement) && document.activeElement !== document.body) return;
      const v = videoRef.current;
      if (!v || adState.isPlaying) return;

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'arrowleft':
          e.preventDefault();
          v.currentTime = Math.max(0, v.currentTime - 5);
          showAnim('rewind');
          break;
        case 'arrowright':
          e.preventDefault();
          v.currentTime = Math.min(v.duration, v.currentTime + 5);
          showAnim('forward');
          break;
        case 'j':
          e.preventDefault();
          v.currentTime = Math.max(0, v.currentTime - 10);
          showAnim('rewind');
          break;
        case 'l':
          e.preventDefault();
          v.currentTime = Math.min(v.duration, v.currentTime + 10);
          showAnim('forward');
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case '0': case '1': case '2': case '3': case '4':
        case '5': case '6': case '7': case '8': case '9':
          e.preventDefault();
          v.currentTime = (parseInt(e.key) / 10) * v.duration;
          break;
      }
      resetControls();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // ─── TRACKING ──────────────────────────────────────────
  const fire = (urls?: string[]) => {
    if (!urls) return;
    urls.forEach(u => {
      if (u && !firedTracking.current.has(u)) {
        firedTracking.current.add(u);
        new Image().src = u;
      }
    });
  };

  // ─── AD ENGINE ─────────────────────────────────────────
  const skipAd = useCallback(() => {
    if (preloadedAd) fire(preloadedAd.trackingUrls.skip);
    setAdState({ isPlaying: false, skipOffset: 5 });
    setIsLoadingAd(false);
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);

    const video = videoRef.current;
    if (!video) return;

    // restore original
    video.src = originalSrcRef.current;
    video.load();
    setTimeout(() => {
      video.play().catch(() => { });
      setIsPlaying(true);
    }, 40);
  }, [preloadedAd]);

  const togglePlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
      return;
    }

    // zero-latency ad inject
    if (!adAttempted && preloadedAd) {
      setAdAttempted(true);
      setIsLoadingAd(true);
      setAdState({ isPlaying: true, skipOffset: 5 });
      video.src = preloadedAd.mediaUrl;
      video.load();
      try {
        await video.play();
        setIsPlaying(true);
        setIsLoadingAd(false);
        fire(preloadedAd.trackingUrls.impression);
        fire(preloadedAd.trackingUrls.start);
      } catch {
        setIsLoadingAd(false);
        setAdState({ isPlaying: false, skipOffset: 5 });
      }
      return;
    }

    video.play().catch(() => { });
    setIsPlaying(true);
  }, [isPlaying, adAttempted, preloadedAd]);

  // ─── TOUCH ZONES (clean double-tap) ────────────────────
  const showAnim = (type: 'forward' | 'rewind') => {
    setActionAnim(type);
    setTimeout(() => setActionAnim(null), 320);
  };

  const handleZone = (zone: 'left' | 'center' | 'right') => {
    if (adState.isPlaying) return;
    const now = Date.now();
    const DELAY = 280;

    if (now - lastTap.current < DELAY) {
      // DOUBLE
      if (singleTapTimeout.current) {
        clearTimeout(singleTapTimeout.current);
        singleTapTimeout.current = null;
      }
      const video = videoRef.current;
      if (!video) return;

      if (zone === 'right') {
        video.currentTime = Math.min(video.currentTime + 10, video.duration || 9999);
        showAnim('forward');
      } else if (zone === 'left') {
        video.currentTime = Math.max(video.currentTime - 10, 0);
        showAnim('rewind');
      } else {
        // center double = fullscreen
        toggleFullscreen();
      }
      resetControls();
    } else {
      // potential single – delay it
      lastTap.current = now;
      if (singleTapTimeout.current) clearTimeout(singleTapTimeout.current);
      singleTapTimeout.current = setTimeout(() => {
        if (zone === 'center') {
          togglePlay();
        } else {
          // left/right single just toggles controls on mobile
          if (window.innerWidth < 768) setShowControls(s => !s);
          else togglePlay();
        }
        resetControls();
        singleTapTimeout.current = null;
      }, DELAY);
    }
  };

  // ─── VIDEO EVENTS ──────────────────────────────────────
  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const p = (v.currentTime / v.duration) * 100;
    setProgress(p);
    setCurrentTime(v.currentTime);

    if (adState.isPlaying && preloadedAd) {
      setAdCountdown(Math.max(0, Math.ceil(adState.skipOffset - v.currentTime)));
      if (p >= 25) fire(preloadedAd.trackingUrls.firstQuartile);
      if (p >= 50) fire(preloadedAd.trackingUrls.midpoint);
      if (p >= 75) fire(preloadedAd.trackingUrls.thirdQuartile);
    }
  };

  const onEnded = () => {
    if (adState.isPlaying && preloadedAd) {
      fire(preloadedAd.trackingUrls.complete);
      skipAd();
    } else if (!isLooping) {
      setIsPlaying(false);
      setShowControls(true);
    }
  };

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (adState.isPlaying) return;
    const v = videoRef.current;
    if (!v) return;
    const t = (parseFloat(e.target.value) / 100) * v.duration;
    v.currentTime = t;
    setProgress(parseFloat(e.target.value));
  };

  const onVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const n = parseFloat(e.target.value);
    v.volume = n;
    setVolume(n);
    setIsMuted(n === 0);
    localStorage.setItem('porncater_vol', String(n));
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    if (isMuted) {
      const n = volume || 1;
      v.volume = n;
      setIsMuted(false);
      localStorage.setItem('porncater_vol', String(n));
    } else {
      v.volume = 0;
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
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  const fmt = (t: number) => {
    if (isNaN(t)) return '0:00';
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className={`relative bg-black w-full h-full flex items-center justify-center select-none overflow-hidden touch-manipulation outline-none ${!showControls && isPlaying ? 'cursor-none' : 'cursor-default'
        }`}
      onMouseMove={resetControls}
      onMouseLeave={() => { if (isPlaying) setShowControls(false); }}
      onClick={(e) => {
        // only play/pause if click is directly on the video area (not controls)
        if ((e.target as HTMLElement).closest('[data-controls]')) return;
        if (!isPlaying && !adState.isPlaying) togglePlay();
      }}
    >
      <video
        ref={videoRef}
        poster={adState.isPlaying ? undefined : poster}
        title={title}
        loop={!adState.isPlaying && isLooping}
        preload="metadata"
        playsInline
        className="w-full h-full object-contain"
        onTimeUpdate={onTimeUpdate}
        onEnded={onEnded}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* TOUCH ZONES – only while playing so center play button is never blocked */}
      {isPlaying && !adState.isPlaying && (
        <>
          <div
            className="absolute inset-y-0 left-0 w-1/3 z-10"
            onClick={() => handleZone('left')}
          />
          <div
            className="absolute inset-y-0 left-1/3 w-1/3 z-10"
            onClick={() => handleZone('center')}
          />
          <div
            className="absolute inset-y-0 right-0 w-1/3 z-10"
            onClick={() => handleZone('right')}
          />
        </>
      )}

      {/* HARD SEEK FLASH */}
      {actionAnim && (
        <div
          className={`absolute top-1/2 -translate-y-1/2 z-20 pointer-events-none flex items-center justify-center w-16 h-16 bg-black border border-white/30 ${actionAnim === 'forward' ? 'right-[18%]' : 'left-[18%]'
            }`}
        >
          {actionAnim === 'forward' ? (
            <SkipForward size={28} className="text-white" strokeWidth={2.5} />
          ) : (
            <SkipBack size={28} className="text-white" strokeWidth={2.5} />
          )}
        </div>
      )}

      {/* AD LAYER */}
      {adState.isPlaying && preloadedAd && (
        <>
          {preloadedAd.clickThroughUrl && (
            <a
              href={preloadedAd.clickThroughUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="absolute inset-0 z-20 flex items-start justify-end p-3"
              aria-label="Visit Advertisement"
            >
              <span className="bg-red-700 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 flex items-center gap-1.5 border border-red-500">
                Visit Sponsor <ExternalLink size={11} strokeWidth={2.5} />
              </span>
            </a>
          )}
          <div className="absolute bottom-16 right-0 z-30">
            {adCountdown > 0 ? (
              <div className="bg-black border-l-2 border-zinc-600 text-zinc-400 text-[10px] font-bold uppercase tracking-widest px-4 py-2.5">
                Skip in <span className="text-white">{adCountdown}</span>
              </div>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); skipAd(); }}
                className="bg-black hover:bg-zinc-900 border-l-2 border-red-600 text-white text-xs font-bold uppercase px-5 py-2.5 flex items-center gap-2"
              >
                Skip Ad <SkipForward size={13} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </>
      )}

      {/* LOADING */}
      {isLoadingAd && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40">
          <div className="w-9 h-9 border-2 border-zinc-700 border-t-red-600 animate-spin" />
        </div>
      )}

      {/* GIANT HARD PLAY BUTTON – only when paused */}
      {!isPlaying && !adState.isPlaying && !isLoadingAd && (
        <button
          onClick={(e) => { e.stopPropagation(); togglePlay(); }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-[72px] h-12 flex items-center justify-center bg-red-700 hover:bg-red-600 text-white border border-red-500 shadow-[0_0_0_1px_rgba(0,0,0,0.8)]"
          aria-label="Play"
        >
          <Play size={28} fill="currentColor" strokeWidth={0} className="ml-0.5" />
        </button>
      )}

      {/* BOTTOM BAR – sharp, minimal, hard */}
      <div
        data-controls
        className={`absolute bottom-0 inset-x-0 z-40 bg-gradient-to-t from-black via-black/90 to-transparent pt-12 pb-1.5 px-2 transition-opacity duration-150 ${showControls && !adState.isPlaying && !isLoadingAd ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* PROGRESS – hard thin red */}
        <div className="relative w-full h-1.5 mb-2 group/bar cursor-pointer">
          <div className="absolute inset-0 bg-zinc-800">
            <div
              className="absolute top-0 left-0 h-full bg-red-600"
              style={{ width: `${progress}%` }}
            />
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={0.1}
            value={progress || 0}
            onChange={onSeek}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white border border-black opacity-0 group-hover/bar:opacity-100 pointer-events-none"
            style={{ left: `calc(${progress}% - 5px)` }}
          />
        </div>

        <div className="flex items-center justify-between text-zinc-200">
          {/* LEFT */}
          <div className="flex items-center gap-3 md:gap-5">
            <button onClick={togglePlay} className="p-0.5 hover:text-red-500 transition-colors">
              {isPlaying ? (
                <Pause size={20} fill="currentColor" strokeWidth={0} />
              ) : (
                <Play size={20} fill="currentColor" strokeWidth={0} />
              )}
            </button>

            <div className="hidden md:flex items-center gap-3 text-zinc-500">
              <button
                onClick={() => {
                  if (videoRef.current) videoRef.current.currentTime -= 10;
                  showAnim('rewind');
                }}
                className="hover:text-white"
              >
                <SkipBack size={16} strokeWidth={2} />
              </button>
              <button
                onClick={() => {
                  if (videoRef.current) videoRef.current.currentTime += 10;
                  showAnim('forward');
                }}
                className="hover:text-white"
              >
                <SkipForward size={16} strokeWidth={2} />
              </button>
            </div>

            <div className="flex items-center gap-1.5 group/vol">
              <button onClick={toggleMute} className="p-0.5 text-zinc-400 hover:text-red-500">
                {isMuted || volume === 0 ? (
                  <VolumeX size={18} strokeWidth={2} />
                ) : (
                  <Volume2 size={18} strokeWidth={2} />
                )}
              </button>
              <div className="w-0 overflow-hidden group-hover/vol:w-14 transition-all duration-200">
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={onVolume}
                  className="w-full h-1 bg-zinc-700 appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-1.5 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-none
                    [&::-moz-range-thumb]:w-1.5 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:rounded-none"
                />
              </div>
            </div>

            <span className="text-[11px] font-mono tracking-tight tabular-nums ml-1 select-none">
              <span className="text-white">{fmt(currentTime)}</span>
              <span className="text-zinc-600 mx-0.5">/</span>
              <span className="text-zinc-500">{fmt(duration)}</span>
            </span>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={() => setIsLooping(l => !l)}
              className={`hidden sm:block p-0.5 ${isLooping ? 'text-red-500' : 'text-zinc-500 hover:text-white'}`}
            >
              <Repeat size={16} strokeWidth={2} />
            </button>

            <div className="relative group/speed">
              <button className="p-0.5 text-zinc-500 hover:text-white flex items-center">
                <Settings size={16} strokeWidth={2} className="group-hover/speed:rotate-90 transition-transform duration-200" />
              </button>
              <div className="absolute bottom-full right-0 mb-2 bg-black border border-zinc-800 opacity-0 invisible group-hover/speed:opacity-100 group-hover/speed:visible transition-opacity flex flex-col py-1 min-w-[90px] shadow-xl">
                <div className="px-3 py-1 text-[9px] uppercase tracking-widest text-zinc-600 font-bold">Speed</div>
                {[0.5, 1, 1.25, 1.5, 2].map(rate => (
                  <button
                    key={rate}
                    onClick={() => changeSpeed(rate)}
                    className={`px-3 py-1.5 text-xs text-left font-medium hover:bg-zinc-900 flex items-center justify-between ${playbackRate === rate ? 'text-red-500' : 'text-zinc-300'
                      }`}
                  >
                    {rate === 1 ? 'Normal' : `${rate}×`}
                    {playbackRate === rate && <span className="w-1 h-1 bg-red-500" />}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={toggleFullscreen} className="p-0.5 text-zinc-400 hover:text-red-500">
              {isFullscreen ? (
                <Minimize size={18} strokeWidth={2} />
              ) : (
                <Maximize size={18} strokeWidth={2} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}