import React, { useEffect, useMemo, useRef, useState } from "react";
import { useEscapeKey } from "../hooks/useEscapeKey";
import { useModalScrollLock } from "../hooks/useModalScrollLock";

interface VideoTutorialProps {
  youtubeUrl: string;
  tooltip?: string;
  title?: string;
}

interface DragState {
  pointerId: number;
  offsetX: number;
  offsetY: number;
}

interface VideoTutorialState {
  isOpen: boolean;
  isMini: boolean;
  isActive: boolean;
  embedUrl: string | null;
  miniPosition: { x: number; y: number };
  videoUrl: string;
  title: string;
}

const DEFAULT_STATE: VideoTutorialState = {
  isOpen: false,
  isMini: false,
  isActive: false,
  embedUrl: null,
  miniPosition: { x: 0, y: 0 },
  videoUrl: "",
  title: "Video Tutorial",
};

const listeners = new Set<() => void>();
let storeState: VideoTutorialState = DEFAULT_STATE;

const notify = () => {
  listeners.forEach((listener) => listener());
};

const setStoreState = (next: Partial<VideoTutorialState>) => {
  storeState = { ...storeState, ...next };
  notify();
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const useVideoTutorialStore = () => {
  const [state, setState] = useState(storeState);

  useEffect(() => {
    return subscribe(() => setState(storeState));
  }, []);

  return state;
};

const getVideoId = (url: string) => {
  if (!url) return "";
  const regExp =
    /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : "";
};

export const VideoTutorial: React.FC<VideoTutorialProps> = ({
  youtubeUrl,
  tooltip = "Ver video tutorial",
  title = "Video Tutorial",
}) => {
  const videoId = useMemo(() => getVideoId(youtubeUrl), [youtubeUrl]);

  const openModal = () => {
    if (!videoId) return;
    setStoreState({
      isOpen: true,
      isMini: false,
      isActive: false,
      embedUrl: null,
      videoUrl: youtubeUrl,
      title,
    });
  };

  return (
    <button
      type="button"
      onClick={openModal}
      title={tooltip}
      className={`vt-btn ${videoId ? "" : "vt-btn--disabled"}`}
      aria-disabled={!videoId}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </button>
  );
};

export const VideoTutorialModal: React.FC = () => {
  const store = useVideoTutorialStore();
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<DragState | null>(null);

  const activeVideoId = useMemo(
    () => getVideoId(store.videoUrl),
    [store.videoUrl]
  );

  const thumbnailUrl = useMemo(() => {
    return activeVideoId
      ? `https://img.youtube.com/vi/${activeVideoId}/hqdefault.jpg`
      : "";
  }, [activeVideoId]);

  useEscapeKey(() => {
    setStoreState({
      isOpen: false,
      isActive: false,
      isMini: false,
      embedUrl: null,
    });
  }, store.isOpen);

  useModalScrollLock(store.isOpen && !store.isMini);

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (event: PointerEvent) => {
      const state = dragStateRef.current;
      if (!state || event.pointerId !== state.pointerId) return;

      const rect = containerRef.current?.getBoundingClientRect();
      const width = rect?.width ?? 320;
      const height = rect?.height ?? 200;
      const maxX = window.innerWidth - width;
      const maxY = window.innerHeight - height;

      setStoreState({
        miniPosition: {
          x: Math.max(0, Math.min(event.clientX - state.offsetX, maxX)),
          y: Math.max(0, Math.min(event.clientY - state.offsetY, maxY)),
        },
      });
    };

    const handleUp = (event: PointerEvent) => {
      const state = dragStateRef.current;
      if (state && event.pointerId !== state.pointerId) return;
      dragStateRef.current = null;
      setIsDragging(false);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
    };
  }, [isDragging]);

  const closeModal = () => {
    setStoreState({
      isOpen: false,
      isActive: false,
      isMini: false,
      embedUrl: null,
    });
  };

  const activateVideo = () => {
    if (!activeVideoId) return;
    const url = `https://www.youtube-nocookie.com/embed/${activeVideoId}?autoplay=1&rel=0&modestbranding=1`;
    setStoreState({ embedUrl: url, isActive: true });
  };

  const minimize = () => {
    if (typeof window === "undefined") return;

    const width = Math.min(320, window.innerWidth - 32);
    const height = 40 + (width * 9) / 16;

    setStoreState({
      miniPosition: {
        x: Math.max(0, window.innerWidth - width - 16),
        y: Math.max(0, window.innerHeight - height - 16),
      },
      isMini: true,
    });
  };

  const maximize = () => setStoreState({ isMini: false });

  const handleDragStart = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!store.isMini) return;

    event.preventDefault();

    dragStateRef.current = {
      pointerId: event.pointerId,
      offsetX: event.clientX - store.miniPosition.x,
      offsetY: event.clientY - store.miniPosition.y,
    };

    setIsDragging(true);
  };

  if (!store.isOpen) return null;

  return (
    <>
      {!store.isMini && <div className="vt-overlay" onClick={closeModal} />}

      <div
        ref={containerRef}
        className={`vt-container ${store.isMini ? "vt-container--mini" : ""}`}
        style={
          store.isMini
            ? {
                left: `${store.miniPosition.x}px`,
                top: `${store.miniPosition.y}px`,
              }
            : undefined
        }
        role="dialog"
        aria-modal="true"
        aria-label={store.title}
      >
        <div
          className={`vt-header ${store.isMini ? "vt-header--draggable" : ""}`}
          onPointerDown={handleDragStart}
        >
          <div className="vt-header__left">
            <svg
              className="w-4 h-4 text-red-500 flex-shrink-0"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            <span className="vt-header__title">{store.title}</span>
          </div>

          <div className="vt-header__actions">
            {!store.isMini && store.isActive && (
              <button
                type="button"
                onClick={minimize}
                className="vt-header__btn"
                title="Modo mini"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 3h6m0 0v6m0-6l-7 7M9 21H3m0 0v-6m0 6l7-7"
                  />
                </svg>
              </button>
            )}

            {store.isMini && (
              <button
                type="button"
                onClick={maximize}
                className="vt-header__btn"
                title="Modo completo"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                  />
                </svg>
              </button>
            )}

            <button
              type="button"
              onClick={closeModal}
              className="vt-header__btn vt-header__btn--close"
              title="Cerrar"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="vt-body">
          <div className="vt-video-wrapper">
            {!store.isActive && (
              <button
                type="button"
                className="vt-thumb-btn"
                onClick={activateVideo}
                title="Reproducir video"
              >
                <img
                  src={thumbnailUrl}
                  alt="Miniatura del tutorial"
                  className="vt-thumb-img"
                  loading="lazy"
                />
                <div className="vt-thumb-overlay">
                  <div className="vt-play-icon">
                    <svg viewBox="0 0 68 48" className="w-16 h-12">
                      <path
                        d="M66.52,7.74C65.69,4.56,63.14,2.01,59.97,1.18C54.72,0,34,0,34,0S13.28,0,8.03,1.18C4.86,2.01,2.31,4.56,1.48,7.74C0.3,12.99,0,24,0,24s0.3,11.01,1.48,16.26c0.83,3.18,3.38,5.73,6.55,6.56C13.28,48,34,48,34,48s20.72,0,25.97-1.18c3.17-0.83,5.72-3.38,6.55-6.56C67.7,35.01,68,24,68,24S67.7,12.99,66.52,7.74z"
                        fill="#f00"
                      />
                      <path d="M 45,24 27,14 27,34" fill="#fff" />
                    </svg>
                  </div>
                  <p className="vt-thumb-label">Haz clic para reproducir</p>
                </div>
              </button>
            )}

            {store.isActive && store.embedUrl && (
              <iframe
                className="vt-iframe"
                src={store.embedUrl}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                title="Video tutorial"
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};
