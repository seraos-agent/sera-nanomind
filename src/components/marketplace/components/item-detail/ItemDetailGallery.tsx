import React, { useState, useRef, useEffect, useCallback } from 'react';

interface ItemDetailGalleryProps {
  images: string[];
  name: string;
  stock?: number;
  isService?: boolean;
  selectedImage: string;
  onSelectImage: (img: string) => void;
}

export const ItemDetailGallery: React.FC<ItemDetailGalleryProps> = ({
  images,
  name,
  stock,
  isService,
  selectedImage,
  onSelectImage,
}) => {
  const [activeIndex, setActiveIndex] = useState(() => {
    const idx = images.indexOf(selectedImage);
    return idx >= 0 ? idx : 0;
  });

  const sliderRef = useRef<HTMLDivElement>(null);
  const thumbnailsRef = useRef<HTMLDivElement>(null);
  const isMouseDownRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  // Sync state if selectedImage changes from outside
  useEffect(() => {
    const idx = images.indexOf(selectedImage);
    if (idx >= 0 && idx !== activeIndex) {
      setActiveIndex(idx);
      if (sliderRef.current) {
        const targetLeft = idx * sliderRef.current.clientWidth;
        if (Math.abs(sliderRef.current.scrollLeft - targetLeft) > 5) {
          sliderRef.current.scrollTo({ left: targetLeft, behavior: 'smooth' });
        }
      }
    }
  }, [selectedImage, images, activeIndex]);

  // Sync active thumbnail view
  useEffect(() => {
    if (thumbnailsRef.current && images.length > 1) {
      const activeThumb = thumbnailsRef.current.children[activeIndex] as HTMLElement;
      if (activeThumb) {
        activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeIndex, images.length]);

  // Handle continuous scroll event (touch swipe or drag)
  const handleScroll = useCallback(() => {
    if (!sliderRef.current || isMouseDownRef.current) return;
    const width = sliderRef.current.clientWidth;
    if (width <= 0) return;
    const newIdx = Math.round(sliderRef.current.scrollLeft / width);
    if (newIdx !== activeIndex && newIdx >= 0 && newIdx < images.length) {
      setActiveIndex(newIdx);
      onSelectImage(images[newIdx]);
    }
  }, [activeIndex, images, onSelectImage]);

  // Desktop Mouse Drag Gesture Support
  const handleMouseDown = (e: React.MouseEvent) => {
    if (images.length <= 1 || !sliderRef.current) return;
    isMouseDownRef.current = true;
    setIsDragging(true);
    startXRef.current = e.pageX;
    startScrollLeftRef.current = sliderRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current || !sliderRef.current) return;
    e.preventDefault();
    const walk = e.pageX - startXRef.current;
    sliderRef.current.scrollLeft = startScrollLeftRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    if (!isMouseDownRef.current) return;
    isMouseDownRef.current = false;
    setIsDragging(false);

    if (sliderRef.current) {
      const width = sliderRef.current.clientWidth;
      if (width > 0) {
        const targetIdx = Math.max(
          0,
          Math.min(images.length - 1, Math.round(sliderRef.current.scrollLeft / width))
        );
        sliderRef.current.scrollTo({ left: targetIdx * width, behavior: 'smooth' });
        setActiveIndex(targetIdx);
        onSelectImage(images[targetIdx]);
      }
    }
  };

  // Thumbnail Click Handler
  const handleThumbnailClick = (idx: number) => {
    setActiveIndex(idx);
    onSelectImage(images[idx]);
    if (sliderRef.current) {
      const targetLeft = idx * sliderRef.current.clientWidth;
      sliderRef.current.scrollTo({ left: targetLeft, behavior: 'smooth' });
    }
  };

  return (
    <div>
      {/* Main Image Slider Wrapper */}
      <div
        style={{
          width: '100%',
          aspectRatio: '1/1',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          background: '#F1F5F9',
          marginBottom: '10px',
          border: '1px solid var(--border-color)',
          position: 'relative',
        }}
      >
        {/* Hardware-accelerated Viewpager Slider (Scroll-snap track where previous/next photos slide together seamlessly) */}
        <div
          ref={sliderRef}
          onScroll={handleScroll}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className="viewpager-container no-scrollbar"
          style={{
            width: '100%',
            height: '100%',
            cursor: images.length > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
            userSelect: 'none',
          }}
        >
          {images.map((img, idx) => (
            <div
              key={idx}
              className="viewpager-pane"
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
              }}
            >
              <img
                src={img}
                alt={`${name} - photo ${idx + 1}`}
                draggable={false}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  userSelect: 'none',
                  pointerEvents: 'none',
                }}
              />
            </div>
          ))}
        </div>

        {/* Counter Badge (e.g. 1 / 4) - Floating on Top Right */}
        {images.length > 1 && (
          <div
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'rgba(15, 23, 42, 0.72)',
              backdropFilter: 'blur(8px)',
              color: '#FFFFFF',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: '999px',
              letterSpacing: '0.02em',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              zIndex: 10,
              pointerEvents: 'none',
            }}
          >
            {activeIndex + 1} / {images.length}
          </div>
        )}

        {/* Floating Stock Tag - Floating on Bottom Left */}
        {!isService && stock !== undefined && (
          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              background: 'rgba(15, 23, 42, 0.78)',
              backdropFilter: 'blur(6px)',
              color: '#FFFFFF',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '4px 9px',
              borderRadius: '6px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
              letterSpacing: '0.01em',
              zIndex: 10,
              pointerEvents: 'none',
            }}
          >
            <span>{stock} in stock</span>
          </div>
        )}
      </div>

      {/* Thumbnail Selector */}
      {images.length > 1 && (
        <div
          ref={thumbnailsRef}
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '4px',
            scrollbarWidth: 'none',
          }}
        >
          {images.map((img, i) => {
            const isSelected = activeIndex === i;
            return (
              <button
                key={i}
                type="button"
                onClick={() => handleThumbnailClick(i)}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: isSelected ? '2px solid var(--color-brand)' : '1px solid var(--border-color)',
                  background: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  flexShrink: 0,
                  opacity: isSelected ? 1 : 0.65,
                  transform: isSelected ? 'scale(1.04)' : 'scale(1)',
                  transition: 'opacity 0.15s ease, transform 0.15s ease, border-color 0.15s ease',
                  boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
                }}
              >
                <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};


