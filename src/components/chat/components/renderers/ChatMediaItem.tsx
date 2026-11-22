import { useState, useEffect } from 'react';
import { Download, Loader2, ImageOff } from "lucide-react";
import type { ThemeType } from "../../../../theme";
import { handleInAppImageDownload } from "../../../../utils/imageDownload";
import { getCachedImage, fetchAndCacheImage, isUrlExpired, markUrlAsDead } from "../../../../utils/imageCache";

/**
 * ChatMediaItem - Self-caching media element with automatic local persistence
 * and graceful minimalist 24-hour expiration fallback.
 */
export function ChatMediaItem({
  src,
  alt = "attachment",
  theme,
  onLightbox,
  isMarkdownInline = false,
}: {
  src: string;
  alt?: string;
  theme: ThemeType;
  onLightbox?: (src: string) => void;
  isMarkdownInline?: boolean;
}) {
  const expiredInitial = isUrlExpired(src);
  const [currentSrc, setCurrentSrc] = useState<string | null>(expiredInitial ? null : src);
  const [isExpired, setIsExpired] = useState<boolean>(expiredInitial);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    if (!src) return;

    // 1. Check if the image already exists in the device's local indexedDB cache
    getCachedImage(src).then((cached) => {
      if (!isMounted) return;
      if (cached) {
        setCurrentSrc(cached);
        setIsExpired(false);
      } else if (isUrlExpired(src)) {
        // Expired remotely and not found in local IndexedDB: mark expired, do NOT fetch
        setIsExpired(true);
        setCurrentSrc(null);
      } else {
        // 2. Fetch and persist to device cache in background for post-24h longevity
        fetchAndCacheImage(src).then((cachedData) => {
          if (!isMounted) return;
          if (cachedData) {
            setCurrentSrc(cachedData);
          } else {
            setIsExpired(true);
            setCurrentSrc(null);
          }
        });
      }
    });

    return () => {
      isMounted = false;
    };
  }, [src]);

  const handleImageError = () => {
    // If remote image fails to load, mark dead and verify local cache before falling back
    markUrlAsDead(src);
    getCachedImage(src).then((cached) => {
      if (cached) {
        setCurrentSrc(cached);
        setIsExpired(false);
      } else {
        setIsExpired(true);
        setCurrentSrc(null);
      }
    });
  };

  // Minimalist expired card (clean & calm single-line strip without intrusive regenerate buttons)
  if (isExpired || !currentSrc) {
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 14px",
          borderRadius: 12,
          background: theme.isDark ? "#18181B" : theme.surface2,
          border: `1px solid ${theme.isDark ? "#2E2E33" : theme.border}`,
          color: theme.inkSoft,
          fontSize: 12.5,
          fontFamily: "Inter, sans-serif",
          margin: isMarkdownInline ? "8px 0" : "4px 0",
          userSelect: "none",
        }}
      >
        <ImageOff size={15} color={theme.inkSoft} style={{ opacity: 0.8 }} />
        <span>Temporary image preview has expired (24 hours)</span>
      </div>
    );
  }

  return (
    <div
      onClick={() => onLightbox?.(currentSrc || src)}
      style={{
        position: "relative",
        maxWidth: isMarkdownInline ? "100%" : 320,
        borderRadius: 14,
        overflow: "hidden",
        border: `1px solid ${theme.border}`,
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        cursor: "pointer",
        background: theme.surface2,
        userSelect: "none",
        WebkitTapHighlightColor: "transparent",
        marginTop: isMarkdownInline ? 10 : 0,
        marginBottom: isMarkdownInline ? 6 : 0,
      }}
    >
      <img
        src={currentSrc}
        alt={alt}
        onError={handleImageError}
        style={{
          maxWidth: "100%",
          maxHeight: isMarkdownInline ? 380 : 260,
          display: "block",
          objectFit: "cover",
        }}
      />
      <button
        type="button"
        disabled={isDownloading}
        onClick={async (e) => {
          e.stopPropagation();
          if (isDownloading) return;
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
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          background: "rgba(0, 0, 0, 0.55)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          color: "#FFF",
          borderRadius: "50%",
          width: 30,
          height: 30,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          border: "none",
          cursor: isDownloading ? "wait" : "pointer",
          padding: 0,
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(0, 0, 0, 0.8)";
          e.currentTarget.style.transform = "scale(1.08)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(0, 0, 0, 0.55)";
          e.currentTarget.style.transform = "scale(1)";
        }}
        title="Download to Gallery"
      >
        {isDownloading ? (
          <Loader2 size={14} className="animate-spin" style={{ animation: "spin 0.8s linear infinite" }} />
        ) : (
          <Download size={14} />
        )}
      </button>
    </div>
  );
}
