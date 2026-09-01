"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Hls from "hls.js";
import {
  IcoPlay,
  IcoPause,
  IcoSkipTen,
  IcoVolume,
  IcoExpand,
  IcoCompress,
  IcoLoop,
  IcoPip,
  IcoOut,
  IcoSkipAd,
} from "./icons";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  vastTagUrl?: string;
  autoNext?: boolean;
}

type QualityLevel = { index: number; height: number; label: string };

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const SEEK_STEP = 10;

function fmt(t: number) {
  if (!Number.isFinite(t) || t < 0) return "0:00";
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = Math.floor(t % 60);
  if (h > 0) return `${h}:${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

function posKey(src: string) {
  return `pc_pos_${src.slice(-80)}`;
}

export default function VideoPlayer({
  src,
  poster,
  title,
  vastTagUrl,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const originalSrcRef = useRef(src);
  const firedTracking = useRef<Set<string>>(new Set());
  const controlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const singleTapTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTap = useRef(0);
  const lastTapZone = useRef<"left" | "center" | "right" | null>(null);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holding2x = useRef(false);
  const rateBeforeHold = useRef(1);
  const ignoreClick = useRef(false);
  const handlersRef = useRef<Record<string, () => void>>({});
  const showControlsRef = useRef(true);
  const draggingRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLooping, setIsLooping] = useState(false);
  const [actionAnim, setActionAnim] = useState<"forward" | "rewind" | null>(null);
  const [adAttempted, setAdAttempted] = useState(false);
  const [isLoadingAd, setIsLoadingAd] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [holdBoost, setHoldBoost] = useState(false);
  const [levels, setLevels] = useState<QualityLevel[]>([]);
  const [currentLevel, setCurrentLevel] = useState(-1);
  const [isIos, setIsIos] = useState(false);
  const [pipSupported, setPipSupported] = useState(false);
  const [error, setError] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);

  const [preloadedAd, setPreloadedAd] = useState<{
    mediaUrl: string;
    clickThroughUrl: string | null;
    trackingUrls: Record<string, string[]>;
  } | null>(null);

  const [adState, setAdState] = useState({ isPlaying: false, skipOffset: 5 });
  const [adCountdown, setAdCountdown] = useState(5);

  useEffect(() => {
    setIsIos(/iPad|iPhone|iPod/.test(navigator.userAgent));
    setPipSupported("pictureInPictureEnabled" in document);
    const savedVol = localStorage.getItem("porncater_vol");
    if (savedVol !== null) {
      const n = parseFloat(savedVol);
      if (Number.isFinite(n)) {
        setVolume(n);
        setIsMuted(n === 0);
        if (videoRef.current) videoRef.current.volume = n;
      }
    }
    const savedRate = localStorage.getItem("porncater_rate");
    if (savedRate) {
      const n = parseFloat(savedRate);
      if (SPEEDS.includes(n)) setPlaybackRate(n);
    }
  }, []);

  useEffect(() => {
    originalSrcRef.current = src;
    const video = videoRef.current;
    if (!video || adState.isPlaying || !src) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    setLevels([]);
    setCurrentLevel(-1);
    setError(false);

    if (src.includes(".m3u8") && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 60,
        maxBufferLength: 24,
        maxMaxBufferLength: 48,
        maxBufferHole: 0.5,
        startLevel: -1,
        capLevelToPlayerSize: true,
        startFragPrefetch: true,
        fragLoadingMaxRetry: 4,
        manifestLoadingMaxRetry: 3,
        abrEwmaDefaultEstimate: 800000,
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, (_e, data) => {
        const next: QualityLevel[] = data.levels
          .map((level, index) => ({
            index,
            height: level.height || 0,
            label: level.height ? `${level.height}p` : `${Math.round(level.bitrate / 1000)}k`,
          }))
          .filter((l) => l.height || l.label);
        next.sort((a, b) => b.height - a.height);
        setLevels(next);
      });
      hls.on(Hls.Events.LEVEL_SWITCHED, (_e, data) => {
        setCurrentLevel(data.level);
      });
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (!data.fatal) return;
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          setError(true);
        }
      });
      hlsRef.current = hls;
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    } else {
      video.src = src;
    }

    video.playbackRate = playbackRate;

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
    // playbackRate applied separately; don't rebuild HLS on speed change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, adState.isPlaying]);

  useEffect(() => {
    if (!vastTagUrl) return;
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 4500);

    fetch(vastTagUrl, { signal: controller.signal })
      .then((r) => (r.ok ? r.text() : Promise.reject()))
      .then((text) => {
        const doc = new DOMParser().parseFromString(text, "text/xml");
        const media = doc.getElementsByTagName("MediaFile")[0]?.textContent?.trim();
        if (!media) return;

        const click =
          doc.getElementsByTagName("ClickThrough")[0]?.textContent?.trim() || null;
        const tracking: Record<string, string[]> = { impression: [] };

        Array.from(doc.getElementsByTagName("Tracking")).forEach((node) => {
          const ev = node.getAttribute("event");
          const url = node.textContent?.trim();
          if (ev && url) {
            if (!tracking[ev]) tracking[ev] = [];
            tracking[ev].push(url);
          }
        });
        Array.from(doc.getElementsByTagName("Impression")).forEach((node) => {
          const url = node.textContent?.trim();
          if (url) tracking.impression.push(url);
        });

        setPreloadedAd({
          mediaUrl: media,
          clickThroughUrl: click,
          trackingUrls: tracking,
        });
      })
      .catch(() => {});

    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [vastTagUrl]);

  const resetControls = useCallback(() => {
    setShowControls(true);
    showControlsRef.current = true;
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    if (isPlaying && !adState.isPlaying && !settingsOpen) {
      controlsTimeout.current = setTimeout(() => {
        if (draggingRef.current) return;
        setShowControls(false);
        showControlsRef.current = false;
      }, 2400);
    }
  }, [isPlaying, adState.isPlaying, settingsOpen]);

  useEffect(() => {
    resetControls();
    return () => {
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    };
  }, [isPlaying, resetControls]);

  useEffect(() => {
    const fn = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", fn);
    return () => document.removeEventListener("fullscreenchange", fn);
  }, []);

  const fire = (urls?: string[]) => {
    if (!urls) return;
    urls.forEach((u) => {
      if (u && !firedTracking.current.has(u)) {
        firedTracking.current.add(u);
        new Image().src = u;
      }
    });
  };

  const showAnim = (type: "forward" | "rewind") => {
    setActionAnim(type);
    setTimeout(() => setActionAnim(null), 420);
  };

  const seekBy = useCallback((delta: number) => {
    const v = videoRef.current;
    if (!v || adState.isPlaying) return;
    const next = Math.min(Math.max(0, v.currentTime + delta), v.duration || 0);
    v.currentTime = next;
    setCurrentTime(next);
    if (v.duration) setProgress((next / v.duration) * 100);
    showAnim(delta > 0 ? "forward" : "rewind");
    resetControls();
  }, [adState.isPlaying, resetControls]);

  const skipAd = useCallback(() => {
    if (preloadedAd) fire(preloadedAd.trackingUrls.skip);
    setAdState({ isPlaying: false, skipOffset: 5 });
    setIsLoadingAd(false);
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);

    const video = videoRef.current;
    if (!video) return;

    setTimeout(() => {
      video.play().catch(() => {});
      setIsPlaying(true);
    }, 80);
  }, [preloadedAd]);

  const togglePlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
      return;
    }

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

    video.play().catch(() => setError(true));
    setIsPlaying(true);
  }, [isPlaying, adAttempted, preloadedAd]);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isMuted) {
      const n = volume || 1;
      v.volume = n;
      setIsMuted(false);
      localStorage.setItem("porncater_vol", String(n));
    } else {
      v.volume = 0;
      setIsMuted(true);
      localStorage.setItem("porncater_vol", "0");
    }
  }, [isMuted, volume]);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    const video = videoRef.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    if (!el || !video) return;
    if (isIos && video.webkitEnterFullscreen && !document.fullscreenElement) {
      video.webkitEnterFullscreen();
      return;
    }
    if (!document.fullscreenElement) el.requestFullscreen?.();
    else document.exitFullscreen?.();
  }, [isIos]);

  const togglePip = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !document.pictureInPictureEnabled) return;
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture();
      else await video.requestPictureInPicture();
    } catch {
      /* ignore */
    }
  }, []);

  const changeSpeed = useCallback((rate: number) => {
    if (adState.isPlaying) return;
    if (videoRef.current) videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
    localStorage.setItem("porncater_rate", String(rate));
  }, [adState.isPlaying]);

  const changeQuality = useCallback((index: number) => {
    if (!hlsRef.current) return;
    hlsRef.current.currentLevel = index;
    setCurrentLevel(index);
  }, []);

  handlersRef.current = {
    togglePlay,
    toggleMute,
    toggleFullscreen,
    seekBack: () => seekBy(-SEEK_STEP),
    seekFwd: () => seekBy(SEEK_STEP),
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const v = videoRef.current;
      if (!v || adState.isPlaying) return;
      const h = handlersRef.current;

      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault();
          h.togglePlay();
          break;
        case "arrowleft":
          e.preventDefault();
          h.seekBack();
          break;
        case "arrowright":
          e.preventDefault();
          h.seekFwd();
          break;
        case "j":
          e.preventDefault();
          seekBy(-10);
          break;
        case "l":
          e.preventDefault();
          seekBy(10);
          break;
        case "arrowup":
          e.preventDefault();
          {
            const n = Math.min(1, (isMuted ? 0 : volume) + 0.05);
            v.volume = n;
            setVolume(n);
            setIsMuted(n === 0);
            localStorage.setItem("porncater_vol", String(n));
          }
          break;
        case "arrowdown":
          e.preventDefault();
          {
            const n = Math.max(0, (isMuted ? 0 : volume) - 0.05);
            v.volume = n;
            setVolume(n);
            setIsMuted(n === 0);
            localStorage.setItem("porncater_vol", String(n));
          }
          break;
        case "m":
          e.preventDefault();
          h.toggleMute();
          break;
        case "f":
          e.preventDefault();
          h.toggleFullscreen();
          break;
        case ">":
        case ".":
          if (e.shiftKey || e.key === ">") {
            e.preventDefault();
            const i = SPEEDS.indexOf(playbackRate);
            if (i < SPEEDS.length - 1) changeSpeed(SPEEDS[i + 1]);
          }
          break;
        case "<":
        case ",":
          if (e.shiftKey || e.key === "<") {
            e.preventDefault();
            const i = SPEEDS.indexOf(playbackRate);
            if (i > 0) changeSpeed(SPEEDS[i - 1]);
          }
          break;
        case "0":
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
          e.preventDefault();
          if (v.duration) v.currentTime = (parseInt(e.key, 10) / 10) * v.duration;
          break;
      }
      resetControls();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    adState.isPlaying,
    seekBy,
    resetControls,
    volume,
    isMuted,
    playbackRate,
    changeSpeed,
  ]);

  const handleZone = (zone: "left" | "center" | "right", pointerType: string) => {
    if (adState.isPlaying || holding2x.current || ignoreClick.current) return;
    setSettingsOpen(false);
    const now = Date.now();
    const isTouch = pointerType === "touch";
    const DELAY = isTouch ? 260 : 0;

    if (isTouch && now - lastTap.current < 280 && lastTapZone.current === zone) {
      if (singleTapTimeout.current) {
        clearTimeout(singleTapTimeout.current);
        singleTapTimeout.current = null;
      }
      if (zone === "right") seekBy(SEEK_STEP);
      else if (zone === "left") seekBy(-SEEK_STEP);
      else togglePlay();
      lastTap.current = 0;
      lastTapZone.current = null;
      return;
    }

    lastTap.current = now;
    lastTapZone.current = zone;

    if (!isTouch) {
      togglePlay();
      resetControls();
      return;
    }

    if (singleTapTimeout.current) clearTimeout(singleTapTimeout.current);
    singleTapTimeout.current = setTimeout(() => {
      if (!showControlsRef.current) {
        resetControls();
      } else if (zone === "center") {
        togglePlay();
      } else {
        resetControls();
      }
      singleTapTimeout.current = null;
    }, DELAY);
  };

  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    if (draggingRef.current) return;
    const p = (v.currentTime / v.duration) * 100;
    setProgress(p);
    setCurrentTime(v.currentTime);
    if (v.buffered.length) {
      setBuffered((v.buffered.end(v.buffered.length - 1) / v.duration) * 100);
    }

    if (!adState.isPlaying && v.currentTime > 5) {
      try {
        sessionStorage.setItem(posKey(src), String(Math.floor(v.currentTime)));
      } catch {
        /* private mode */
      }
    }

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
      showControlsRef.current = true;
      try {
        sessionStorage.removeItem(posKey(src));
      } catch {
        /* ignore */
      }
    }
  };

  const seekToRatio = (ratio: number) => {
    const v = videoRef.current;
    if (!v || adState.isPlaying || !v.duration) return;
    const clamped = Math.min(Math.max(ratio, 0), 1);
    const t = clamped * v.duration;
    v.currentTime = t;
    setProgress(clamped * 100);
    setCurrentTime(t);
  };

  const ratioFromClientX = (clientX: number) => {
    const bar = barRef.current;
    if (!bar) return 0;
    const rect = bar.getBoundingClientRect();
    if (!rect.width) return 0;
    return Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
  };

  const previewAt = (ratio: number) => {
    if (!duration) return;
    const bar = barRef.current;
    setHoverTime(ratio * duration);
    setHoverX(ratio * (bar?.getBoundingClientRect().width || 0));
  };

  const onBarPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (adState.isPlaying || e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    draggingRef.current = true;
    setIsScrubbing(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    const ratio = ratioFromClientX(e.clientX);
    seekToRatio(ratio);
    previewAt(ratio);
    resetControls();
  };

  const onBarPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const ratio = ratioFromClientX(e.clientX);
    if (draggingRef.current) {
      e.preventDefault();
      seekToRatio(ratio);
      previewAt(ratio);
      return;
    }
    if (e.pointerType === "mouse") previewAt(ratio);
  };

  const onBarPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    seekToRatio(ratioFromClientX(e.clientX));
    draggingRef.current = false;
    setIsScrubbing(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
    if (e.pointerType !== "mouse") setHoverTime(null);
    resetControls();
  };

  const onVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const n = parseFloat(e.target.value);
    v.volume = n;
    setVolume(n);
    setIsMuted(n === 0);
    localStorage.setItem("porncater_vol", String(n));
  };

  const onPointerDownHold = (e: React.PointerEvent) => {
    if (adState.isPlaying || e.button !== 0) return;
    if (videoRef.current?.paused) return;
    if ((e.target as HTMLElement).closest("[data-controls]")) return;
    rateBeforeHold.current = playbackRate;
    holdTimer.current = setTimeout(() => {
      const v = videoRef.current;
      if (!v) return;
      holding2x.current = true;
      ignoreClick.current = true;
      v.playbackRate = 2;
      setHoldBoost(true);
    }, 380);
  };

  const onPointerUpHold = () => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    if (holding2x.current) {
      const v = videoRef.current;
      if (v) v.playbackRate = rateBeforeHold.current;
      holding2x.current = false;
      setHoldBoost(false);
      setTimeout(() => {
        ignoreClick.current = false;
      }, 50);
    }
  };

  const qualityLabel =
    currentLevel >= 0
      ? levels.find((l) => l.index === currentLevel)?.label || "Auto"
      : "Auto";

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className={`relative bg-black w-full h-full flex items-center justify-center select-none overflow-hidden touch-manipulation outline-none ${
        !showControls && isPlaying ? "cursor-none" : "cursor-default"
      }`}
      onMouseMove={resetControls}
      onMouseLeave={() => {
        if (isPlaying && !settingsOpen) {
          setShowControls(false);
          showControlsRef.current = false;
        }
        setHoverTime(null);
      }}
      onPointerDown={onPointerDownHold}
      onPointerUp={onPointerUpHold}
      onPointerCancel={onPointerUpHold}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("[data-controls]")) return;
        if ((e.target as HTMLElement).closest("[data-play-btn]")) return;
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
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => {
          setIsBuffering(false);
          setError(false);
        }}
        onCanPlay={() => setIsBuffering(false)}
        onLoadedMetadata={(e) => {
          const v = e.currentTarget;
          setDuration(v.duration);
          v.volume = isMuted ? 0 : volume;
          v.playbackRate = playbackRate;
          try {
            const saved = sessionStorage.getItem(posKey(src));
            const t = saved ? parseFloat(saved) : 0;
            if (t > 8 && t < v.duration - 8) v.currentTime = t;
          } catch {
            /* ignore */
          }
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => {
          if (!holding2x.current) setIsPlaying(false);
        }}
        onError={() => {
          if (!adState.isPlaying) setError(true);
        }}
      />

      {isPlaying && !adState.isPlaying && (
        <>
          <div
            className="absolute inset-y-0 left-0 w-1/3 z-10"
            onPointerUp={(e) => handleZone("left", e.pointerType)}
          />
          <div
            className="absolute inset-y-0 left-1/3 w-1/3 z-10"
            onPointerUp={(e) => handleZone("center", e.pointerType)}
          />
          <div
            className="absolute inset-y-0 right-0 w-1/3 z-10"
            onPointerUp={(e) => handleZone("right", e.pointerType)}
          />
        </>
      )}

      {actionAnim && (
        <div
          className={`absolute top-1/2 -translate-y-1/2 z-20 pointer-events-none flex items-center justify-center gap-1 h-12 px-3 bg-black/85 border border-white/15 text-white ${
            actionAnim === "forward" ? "right-[14%]" : "left-[14%]"
          }`}
        >
          <IcoSkipTen dir={actionAnim === "forward" ? "fwd" : "back"} size={26} />
          <span className="text-[11px] font-bold tabular-nums tracking-tight">10</span>
        </div>
      )}

      {holdBoost && (
        <div className="absolute top-3 right-3 z-20 pointer-events-none bg-red-700 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 border border-red-500">
          2×
        </div>
      )}

      {title && showControls && !adState.isPlaying && (
        <div className="absolute top-0 inset-x-0 z-20 pointer-events-none bg-gradient-to-b from-black/80 to-transparent px-3 py-2.5">
          <p className="text-[11px] md:text-xs font-medium text-white/90 truncate tracking-wide">
            {title}
          </p>
        </div>
      )}

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
                Visit Sponsor <IcoOut size={12} />
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
                onClick={(e) => {
                  e.stopPropagation();
                  skipAd();
                }}
                className="bg-black hover:bg-zinc-900 border-l-2 border-red-600 text-white text-xs font-bold uppercase px-5 py-2.5 flex items-center gap-2"
              >
                Skip Ad <IcoSkipAd size={14} />
              </button>
            )}
          </div>
        </>
      )}

      {(isLoadingAd || (isBuffering && isPlaying && !adState.isPlaying)) && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="flex items-end gap-[3px] h-6">
            <span className="w-[3px] h-3 bg-red-600 animate-pulse" />
            <span className="w-[3px] h-6 bg-red-600 animate-pulse [animation-delay:120ms]" />
            <span className="w-[3px] h-4 bg-red-600 animate-pulse [animation-delay:240ms]" />
          </div>
        </div>
      )}

      {error && !adState.isPlaying && (
        <button
          onClick={() => {
            setError(false);
            const v = videoRef.current;
            if (v) {
              v.load();
              v.play().catch(() => {});
            }
          }}
          className="absolute inset-0 z-30 flex items-center justify-center bg-black/70"
        >
          <span className="bg-red-700 hover:bg-red-600 text-white text-[11px] font-bold uppercase tracking-widest px-4 py-2 border border-red-500">
            Tap to retry
          </span>
        </button>
      )}

      {!isPlaying && !adState.isPlaying && !isLoadingAd && !error && (
        <button
          data-play-btn
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-[88px] h-[52px] flex items-center justify-center bg-red-700 hover:bg-red-600 text-white border border-red-400/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_0_0_1px_#000]"
          aria-label="Play"
        >
          <IcoPlay size={28} className="ml-1" />
        </button>
      )}

      <div
        data-controls
        className={`absolute bottom-0 inset-x-0 z-40 bg-gradient-to-t from-black via-black/90 to-transparent pt-10 pb-1.5 px-2 transition-opacity duration-100 ${
          showControls && !adState.isPlaying && !isLoadingAd
            ? "opacity-100"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          ref={barRef}
          className={`relative w-full h-5 md:h-3 mb-1.5 group/bar select-none touch-none ${
            isScrubbing ? "cursor-grabbing" : "cursor-pointer"
          }`}
          onPointerDown={onBarPointerDown}
          onPointerMove={onBarPointerMove}
          onPointerUp={onBarPointerUp}
          onPointerCancel={onBarPointerUp}
          onPointerLeave={() => {
            if (!draggingRef.current) setHoverTime(null);
          }}
        >
          <div
            className={`absolute left-0 right-0 top-1/2 -translate-y-1/2 bg-zinc-800 ${
              isScrubbing ? "h-1.5" : "h-1 md:h-[3px] group-hover/bar:h-1.5"
            }`}
          >
            <div
              className="absolute top-0 left-0 h-full bg-zinc-600"
              style={{ width: `${buffered}%` }}
            />
            <div
              className="absolute top-0 left-0 h-full bg-red-600"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div
            className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 bg-red-600 pointer-events-none ${
              isScrubbing ? "w-4 h-4" : "w-3 h-3 md:w-2 md:h-2 group-hover/bar:w-3 group-hover/bar:h-3"
            }`}
            style={{ left: `${progress}%` }}
          />
          {hoverTime !== null && (
            <div
              className="absolute -top-7 -translate-x-1/2 bg-black border border-zinc-700 text-white text-[10px] font-bold tabular-nums px-1.5 py-0.5 pointer-events-none"
              style={{ left: hoverX }}
            >
              {fmt(hoverTime)}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 text-white">
          <div className="flex items-center gap-0.5 sm:gap-1">
            <button
              onClick={togglePlay}
              className="h-9 w-9 flex items-center justify-center hover:bg-white/10 text-white"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <IcoPause size={18} /> : <IcoPlay size={18} className="ml-0.5" />}
            </button>

            <button
              onClick={() => seekBy(-SEEK_STEP)}
              className="h-9 px-1.5 flex items-center gap-0.5 hover:bg-white/10 text-zinc-200 hover:text-white"
              aria-label="Back 10 seconds"
            >
              <IcoSkipTen dir="back" size={22} />
              <span className="text-[10px] font-bold tabular-nums leading-none">10</span>
            </button>
            <button
              onClick={() => seekBy(SEEK_STEP)}
              className="h-9 px-1.5 flex items-center gap-0.5 hover:bg-white/10 text-zinc-200 hover:text-white"
              aria-label="Forward 10 seconds"
            >
              <span className="text-[10px] font-bold tabular-nums leading-none">10</span>
              <IcoSkipTen dir="fwd" size={22} />
            </button>

            {!isIos && (
              <div className="flex items-center group/vol">
                <button
                  onClick={toggleMute}
                  className="h-9 w-9 flex items-center justify-center hover:bg-white/10 text-zinc-200 hover:text-white"
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  <IcoVolume size={16} muted={isMuted || volume === 0} />
                </button>
                <div className="w-0 overflow-hidden group-hover/vol:w-[72px] transition-[width] duration-150">
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={onVolume}
                    className="w-[64px] ml-1 h-[3px] bg-zinc-700 appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[3px] [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-none
                      [&::-moz-range-thumb]:w-[3px] [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:rounded-none"
                  />
                </div>
              </div>
            )}
            {isIos && (
              <button
                onClick={toggleMute}
                className="h-9 w-9 flex items-center justify-center hover:bg-white/10 text-zinc-200"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                <IcoVolume size={16} muted={isMuted} />
              </button>
            )}

            <span className="hidden sm:inline text-[11px] font-mono tabular-nums select-none px-1.5">
              <span className="text-white">{fmt(currentTime)}</span>
              <span className="text-zinc-600 mx-0.5">/</span>
              <span className="text-zinc-400">{fmt(duration)}</span>
            </span>
            <span className="sm:hidden text-[11px] font-mono tabular-nums select-none px-1">
              {fmt(currentTime)}
            </span>
          </div>

          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setIsLooping((l) => !l)}
              className={`h-9 w-9 flex items-center justify-center hover:bg-white/10 ${isLooping ? "text-red-500" : "text-zinc-300 hover:text-white"}`}
              aria-label="Loop"
            >
              <IcoLoop size={15} />
            </button>

            {pipSupported && !isIos && (
              <button
                onClick={togglePip}
                className="hidden sm:flex h-9 w-9 items-center justify-center hover:bg-white/10 text-zinc-300 hover:text-white"
                aria-label="Picture in picture"
              >
                <IcoPip size={15} />
              </button>
            )}

            <div className="relative">
              <button
                onClick={() => setSettingsOpen((o) => !o)}
                className={`h-7 mx-0.5 px-1.5 text-[10px] font-bold tabular-nums tracking-wide border ${
                  settingsOpen || playbackRate !== 1
                    ? "border-red-600 text-red-500"
                    : "border-zinc-600 text-zinc-200 hover:border-white hover:text-white"
                }`}
                aria-label="Speed"
              >
                {playbackRate === 1 ? "1×" : `${playbackRate}×`}
              </button>
            </div>

            {levels.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setSettingsOpen((o) => !o)}
                  className={`h-7 px-1.5 text-[10px] font-bold uppercase tracking-wide border ${
                    settingsOpen
                      ? "border-red-600 text-red-500"
                      : "border-zinc-600 text-zinc-200 hover:border-white hover:text-white"
                  }`}
                  aria-label="Quality"
                >
                  {qualityLabel}
                </button>
              </div>
            )}

            <div className="relative">
              {settingsOpen && (
                <div className="absolute bottom-full right-0 mb-2 bg-black border border-zinc-700 min-w-[128px] py-1 z-50">
                  <div className="px-3 py-1 text-[9px] uppercase tracking-widest text-zinc-500 font-bold">
                    Speed
                  </div>
                  {SPEEDS.map((rate) => (
                    <button
                      key={rate}
                      onClick={() => changeSpeed(rate)}
                      className={`w-full px-3 py-1.5 text-[11px] text-left font-bold tabular-nums hover:bg-zinc-900 flex items-center justify-between ${
                        playbackRate === rate ? "text-red-500" : "text-zinc-200"
                      }`}
                    >
                      {rate === 1 ? "1×" : `${rate}×`}
                      {playbackRate === rate && <span className="w-1.5 h-1.5 bg-red-600" />}
                    </button>
                  ))}
                  {levels.length > 1 && (
                    <>
                      <div className="mt-1 border-t border-zinc-800 px-3 py-1 text-[9px] uppercase tracking-widest text-zinc-500 font-bold">
                        Quality
                      </div>
                      <button
                        onClick={() => changeQuality(-1)}
                        className={`w-full px-3 py-1.5 text-[11px] text-left font-bold hover:bg-zinc-900 flex items-center justify-between ${
                          currentLevel === -1 ? "text-red-500" : "text-zinc-200"
                        }`}
                      >
                        Auto
                        {currentLevel === -1 && <span className="w-1.5 h-1.5 bg-red-600" />}
                      </button>
                      {levels.map((level) => (
                        <button
                          key={level.index}
                          onClick={() => changeQuality(level.index)}
                          className={`w-full px-3 py-1.5 text-[11px] text-left font-bold hover:bg-zinc-900 flex items-center justify-between ${
                            currentLevel === level.index ? "text-red-500" : "text-zinc-200"
                          }`}
                        >
                          {level.label}
                          {currentLevel === level.index && (
                            <span className="w-1.5 h-1.5 bg-red-600" />
                          )}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={toggleFullscreen}
              className="h-9 w-9 flex items-center justify-center hover:bg-white/10 text-zinc-200 hover:text-white"
              aria-label="Fullscreen"
            >
              {isFullscreen ? <IcoCompress size={15} /> : <IcoExpand size={15} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
