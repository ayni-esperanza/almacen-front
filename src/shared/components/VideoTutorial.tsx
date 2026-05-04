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

export const VideoTutorial: React.FC<VideoTutorialProps> = ({
  youtubeUrl,
  tooltip = "Ver video tutorial",
  title = "Video Tutorial",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMini, setIsMini] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [miniPosition, setMiniPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<DragState | null>(null);

  const videoId = useMemo(() => {
    if (!youtubeUrl) return "";
    const regExp =
      /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = youtubeUrl.match(regExp);
    return match ? match[1] : "";
  }, [youtubeUrl]);

  const thumbnailUrl = useMemo(() => {
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "";
  }, [videoId]);

  useEscapeKey(() => setIsOpen(false), isOpen);
  useModalScrollLock(isOpen && !isMini);

  useEffect(() => {
    if (!videoId) {
      setIsActive(false);
      setEmbedUrl(null);
    }
  }, [videoId]);

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

      setMiniPosition({
        x: Math.max(0, Math.min(event.clientX - state.offsetX, maxX)),
        y: Math.max(0, Math.min(event.clientY - state.offsetY, maxY)),
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

  const openModal = () => {
    if (!videoId) return;
    setIsOpen(true);
    setIsMini(false);
  };

  const closeModal = () => {
    setIsOpen(false);
    setIsActive(false);
    setIsMini(false);
    setEmbedUrl(null);
  };

  const activateVideo = () => {
    if (!videoId) return;
    const url = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
    setEmbedUrl(url);
    setIsActive(true);
  };

  const minimize = () => {
    if (typeof window === "undefined") return;

    const width = Math.min(320, window.innerWidth - 32);
    const height = 40 + (width * 9) / 16;

    setMiniPosition({
      x: Math.max(0, window.innerWidth - width - 16),
      y: Math.max(0, window.innerHeight - height - 16),
    });
    setIsMini(true);
  };

  const maximize = () => setIsMini(false);

  const handleDragStart = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isMini) return;

    event.preventDefault();

    dragStateRef.current = {
      pointerId: event.pointerId,
      offsetX: event.clientX - miniPosition.x,
      offsetY: event.clientY - miniPosition.y,
    };

    setIsDragging(true);
  };

  return (
    <>
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

      {isOpen && (
        <>
          {!isMini && <div className="vt-overlay" onClick={closeModal} />}

          <div
            ref={containerRef}
            className={`vt-container ${isMini ? "vt-container--mini" : ""}`}
            style={
              isMini
                ? {
                    left: `${miniPosition.x}px`,
                    top: `${miniPosition.y}px`,
                  }
                : undefined
            }
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            <div
              className={`vt-header ${isMini ? "vt-header--draggable" : ""}`}
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
                <span className="vt-header__title">{title}</span>
              </div>

              <div className="vt-header__actions">
                {!isMini && isActive && (
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

                {isMini && (
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
                {!isActive && (
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

                {isActive && embedUrl && (
                  <iframe
                    className="vt-iframe"
                    src={embedUrl}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    title="Video tutorial"
                  />
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
