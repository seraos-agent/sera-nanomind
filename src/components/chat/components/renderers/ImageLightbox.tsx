import { useState, useEffect, useRef } from 'react';
import { createPortal } from "react-dom";
import { Download, Loader2, X, ZoomIn, ZoomOut } from "lucide-react";
import { handleInAppImageDownload } from "../../../../utils/imageDownload";
import { getCachedImage } from "../../../../utils/imageCache";

export function ImageLightbox({ src, onClose }: { src: string; onClose: () => void }) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dismissProgress, setDismissProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (src) {
      getCachedImage(src).then((cached) => {
        if (cached) setCurrentSrc(cached);
      });
    }
  }, [src]);

  const initialDistanceRef = useRef<number | null>(null);
  const initialScaleRef = useRef<number>(1);
  const lastTapRef = useRef<number>(0);
  const touchStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Prevent background scrolling while lightbox is active
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  // Reset position when zoom is reset to 1
  useEffect(() => {
    if (scale <= 1) {
      setPosition({ x: 0, y: 0 });
    }
  }, [scale]);

  // Keyboard Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Double tap / double click to toggle zoom
  const handleDoubleTap = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      setScale(current => (current > 1.2 ? 1 : 2.5));
      setPosition({ x: 0, y: 0 });
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  };

  // Touch event handlers for mobile gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      initialDistanceRef.current = dist;
      initialScaleRef.current = scale;
      setIsDragging(false);
    } else if (e.touches.length === 1) {
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      setDragStart({ x: e.touches[0].clientX - position.x, y: e.touches[0].clientY - position.y });
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialDistanceRef.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = dist / initialDistanceRef.current;
      const newScale = Math.min(Math.max(initialScaleRef.current * factor, 0.8), 4.5);
      setScale(newScale);
    } else if (e.touches.length === 1 && isDragging) {
      const deltaX = e.touches[0].clientX - touchStartRef.current.x;
      const deltaY = e.touches[0].clientY - touchStartRef.current.y;

      if (scale > 1.05) {
        setPosition({
          x: e.touches[0].clientX - dragStart.x,
          y: e.touches[0].clientY - dragStart.y
        });
      } else {
        if (deltaY > 0) {
          setDismissProgress(deltaY);
          setPosition({ x: deltaX * 0.3, y: deltaY });
        }
      }
    }
  };

  const handleTouchEnd = () => {
    initialDistanceRef.current = null;
    setIsDragging(false);

    if (scale < 1) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }

    if (scale <= 1.05 && dismissProgress > 90) {
      onClose();
    } else {
      setDismissProgress(0);
      if (scale <= 1.05) {
        setPosition({ x: 0, y: 0 });
      }
    }
  };

  // Mouse wheel zoom on desktop
  const modalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = modalRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.25 : 0.25;
      setScale(s => Math.min(Math.max(s + delta, 1), 4));
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  // Mouse drag on desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1.05) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1.05) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const opacity = Math.max(0.15, 1 - dismissProgress / 300);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      ref={modalRef}
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `rgba(4, 5, 8, ${0.96 * opacity})`,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      {/* Floating Controls Toolbar (Top-Right) */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          top: 'max(16px, env(safe-area-inset-top, 16px))',
          right: 'max(16px, env(safe-area-inset-right, 16px))',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          zIndex: 1000000,
          background: 'rgba(24, 25, 30, 0.72)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: 30,
          padding: '5px 7px',
          boxShadow: '0 6px 24px rgba(0, 0, 0, 0.45)'
        }}
      >
        <button
          onClick={() => {
            setScale(current => (current > 1.2 ? 1 : 2.5));
            setPosition({ x: 0, y: 0 });
          }}
          title={scale > 1.2 ? "Reset Zoom" : "Zoom In"}
          style={{
            background: scale > 1.2 ? 'rgba(255, 255, 255, 0.25)' : 'transparent',
            border: 'none',
            color: '#fff',
            borderRadius: '50%',
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => { if (scale <= 1.2) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'; }}
          onMouseLeave={(e) => { if (scale <= 1.2) e.currentTarget.style.background = 'transparent'; }}
        >
          {scale > 1.2 ? <ZoomOut size={16} /> : <ZoomIn size={16} />}
        </button>

        <button
          type="button"
          disabled={isDownloading}
          onClick={async () => {
            if (!src || isDownloading) return;
            setIsDownloading(true);
            try {
              await Promise.all([
                handleInAppImageDownload(currentSrc || src, `Sera_Artwork_${Date.now()}.png`),
                new Promise((resolve) => setTimeout(resolve, 450))
              ]);
            } finally {
              setIsDownloading(false);
            }
          }}
          title="Download Resolusi Asli"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#fff',
            borderRadius: '50%',
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isDownloading ? 'wait' : 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          {isDownloading ? (
            <Loader2 size={16} className="animate-spin" style={{ animation: "spin 0.8s linear infinite" }} />
          ) : (
            <Download size={16} />
          )}
        </button>

        <div style={{ width: 1, height: 18, background: 'rgba(255, 255, 255, 0.15)', margin: '0 2px' }} />

        <button
          onClick={onClose}
          title="Close (Esc)"
          style={{
            background: 'rgba(239, 68, 68, 0.18)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            color: '#fff',
            borderRadius: '50%',
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.35)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.18)'}
        >
          <X size={17} />
        </button>
      </div>

      {/* Interactive Image Container */}
      <div
        onClick={handleDoubleTap}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{
          maxWidth: '96vw',
          maxHeight: '88vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})`,
          transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
          cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
          touchAction: 'none'
        }}
      >
        <img
          src={currentSrc || src}
          alt="Visual Artwork"
          draggable={false}
          style={{
            maxWidth: '100%',
            maxHeight: '84vh',
            objectFit: 'contain',
            borderRadius: 14,
            boxShadow: '0 24px 64px rgba(0, 0, 0, 0.75), 0 4px 16px rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            pointerEvents: 'none'
          }}
        />
      </div>
    </div>,
    document.body
  );
}
