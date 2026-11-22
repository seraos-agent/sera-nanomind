import React from 'react';
import {
  ALL_CATEGORIES,
  STORE_CATEGORIES,
  SERVICE_CATEGORIES,
} from './hero/heroCategories';
import { FoodHeroSection } from './hero/FoodHeroSection';
import type { MarketplaceFilterTab } from '../types';

interface HeroBannerProps {
  selectedType: MarketplaceFilterTab;
  activeCategory: string | null;
  onSelectCategory: (cat: string | null) => void;
  onShowToast?: (msg: string) => void;
  isMobileView?: boolean;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  selectedType,
  activeCategory,
  onSelectCategory,
  onShowToast,
  isMobileView,
}) => {
  const [localToast, setLocalToast] = React.useState<string | null>(null);

  const triggerToast = (msg: string) => {
    if (onShowToast) {
      onShowToast(msg);
    } else {
      setLocalToast(msg);
      setTimeout(() => setLocalToast(null), 2500);
    }
  };

  const categories =
    selectedType === 'STORE'
      ? STORE_CATEGORIES
      : selectedType === 'SERVICE'
      ? SERVICE_CATEGORIES
      : ALL_CATEGORIES;

  const isFoodMode = selectedType === 'FOOD';
  const isServiceMode = selectedType === 'SERVICE';

  const serviceScrollRef = React.useRef<HTMLDivElement>(null);
  const serviceRedBarRef = React.useRef<HTMLDivElement>(null);
  const serviceRafIdRef = React.useRef<number | null>(null);

  const handleServiceScroll = () => {
    if (serviceRafIdRef.current) cancelAnimationFrame(serviceRafIdRef.current);
    serviceRafIdRef.current = requestAnimationFrame(() => {
      const container = serviceScrollRef.current;
      const bar = serviceRedBarRef.current;
      if (!container || !bar) return;
      const maxScroll = container.scrollWidth - container.clientWidth;
      const progress = maxScroll > 0 ? Math.min(1, Math.max(0, container.scrollLeft / maxScroll)) : 0;
      bar.style.transform = `translate3d(${progress * 22}px, 0, 0)`;
    });
  };

  React.useEffect(() => {
    if (serviceRedBarRef.current) {
      serviceRedBarRef.current.style.transform = 'translate3d(0, 0, 0)';
    }
    if (serviceScrollRef.current) {
      serviceScrollRef.current.scrollLeft = 0;
    }
  }, [selectedType]);

  return (
    <section style={{ padding: '12px 0 2px' }}>
      <div className="container">
        {isFoodMode ? (
          <FoodHeroSection activeCategory={activeCategory} onSelectCategory={onSelectCategory} isMobileView={isMobileView} />
        ) : isServiceMode ? (
          /* Service Dedicated 2-Row Swipeable Ribbon */
          <div style={{ padding: '4px 0 6px', marginBottom: '4px' }}>
            <div
              ref={serviceScrollRef}
              onScroll={isMobileView ? handleServiceScroll : undefined}
              className="service-category-swipe-grid"
            >
              {SERVICE_CATEGORIES.map((cat) => {
                const isAllItem = cat.name === '__ALL__';
                const isSelected = isAllItem
                  ? activeCategory === null
                  : activeCategory === cat.name;

                return (
                  <button
                    key={cat.id}
                    className="category-menu-item"
                    onClick={() => {
                      if (isAllItem) {
                        onSelectCategory(null);
                      } else {
                        onSelectCategory(isSelected ? null : cat.name);
                      }
                    }}
                    title={cat.label}
                    aria-label={cat.label}
                    style={{
                      scrollSnapAlign: 'start',
                      width: '100%',
                      padding: '4px 2px'
                    }}
                  >
                    <div
                      className="category-icon-circle"
                      style={{
                        background: isSelected ? 'var(--border-color, #E2E8F0)' : 'var(--bg-subtle)',
                        border: 'none',
                        color: isSelected ? 'var(--text-main)' : 'var(--text-sub)',
                        boxShadow: 'none',
                        transition: 'background-color 0.18s ease, color 0.18s ease'
                      }}
                    >
                      {cat.isDots ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <circle cx="7" cy="7" r="3" />
                          <circle cx="17" cy="7" r="3" />
                          <circle cx="7" cy="17" r="3" />
                          <circle cx="17" cy="17" r="3" />
                        </svg>
                      ) : (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.25rem'
                        }}>
                          {cat.icon}
                        </span>
                      )}
                    </div>

                    <span
                      className="category-menu-label"
                      style={{
                        color: isSelected ? 'var(--text-main)' : 'var(--text-sub)',
                        fontWeight: isSelected ? 700 : 500,
                        marginTop: '5px',
                        fontSize: '0.72rem',
                        lineHeight: 1.2,
                        textAlign: 'center',
                        maxWidth: '74px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Smooth Red Scroll Indicator (Mobile Only) */}
            {isMobileView && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '6px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '3.5px',
                    backgroundColor: 'var(--border-color, #E2E8F0)',
                    borderRadius: '999px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div
                    ref={serviceRedBarRef}
                    style={{
                      width: '16px',
                      height: '100%',
                      backgroundColor: '#EF4444',
                      borderRadius: '999px',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      transform: 'translate3d(0, 0, 0)',
                      willChange: 'transform',
                      transition: 'none'
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Default Category Menu Grid */
          <div style={{ padding: '4px 0 8px', marginBottom: '4px' }}>
            <div className="category-menu-grid">
              {categories.map((cat) => {
                const isAllItem = cat.name === '__ALL__';
                const isSelected = isAllItem
                  ? activeCategory === null
                  : activeCategory === cat.name;

                return (
                  <button
                    key={cat.id}
                    className="category-menu-item"
                    onClick={() => {
                      if (cat.isSoon) {
                        triggerToast(`${cat.label} category coming soon!`);
                        return;
                      }
                      if (isAllItem) {
                        onSelectCategory(null);
                      } else {
                        onSelectCategory(isSelected ? null : cat.name);
                      }
                    }}
                    title={cat.isSoon ? `${cat.label} (Coming Soon)` : cat.label}
                    aria-label={cat.label}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px 2px',
                      userSelect: 'none',
                      outline: 'none',
                      opacity: cat.isSoon ? 0.8 : 1,
                    }}
                  >
                    <div
                      className="category-icon-circle"
                      style={{
                        position: 'relative',
                        background: isSelected ? 'var(--border-color, #E2E8F0)' : 'var(--bg-subtle)',
                        border: 'none',
                        color: isSelected ? 'var(--text-main)' : 'var(--text-sub)',
                        boxShadow: 'none',
                        transition: 'background-color 0.18s ease, color 0.18s ease'
                      }}
                    >
                      {cat.isSoon && (
                        <span
                          style={{
                            position: 'absolute',
                            top: '-3px',
                            right: '-5px',
                            backgroundColor: '#EF4444',
                            color: '#FFFFFF',
                            fontSize: '0.52rem',
                            fontWeight: 700,
                            padding: '1px 4px',
                            borderRadius: '4px',
                            letterSpacing: '0.02em',
                            lineHeight: 1.1,
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
                            pointerEvents: 'none'
                          }}
                        >
                          Soon
                        </span>
                      )}
                      {cat.isDots ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <circle cx="7" cy="7" r="3" />
                          <circle cx="17" cy="7" r="3" />
                          <circle cx="7" cy="17" r="3" />
                          <circle cx="17" cy="17" r="3" />
                        </svg>
                      ) : (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.25rem'
                        }}>
                          {cat.icon}
                        </span>
                      )}
                    </div>

                    <span
                      className="category-menu-label"
                      style={{
                        color: isSelected ? 'var(--text-main)' : 'var(--text-sub)',
                        fontWeight: isSelected ? 700 : 500,
                        marginTop: '5px',
                        fontSize: '0.72rem',
                        lineHeight: 1.2,
                        textAlign: 'center',
                        maxWidth: '74px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Floating Local Toast Fallback */}
      {localToast && (
        <div
          style={{
            position: 'fixed',
            bottom: '80px',
            left: 0,
            right: 0,
            margin: '0 auto',
            width: 'fit-content',
            maxWidth: 'calc(100vw - 32px)',
            zIndex: 99,
            background: 'rgba(15, 23, 42, 0.95)',
            color: '#FFFFFF',
            fontWeight: 600,
            padding: '8px 16px',
            borderRadius: '999px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.22)',
            fontSize: '0.80rem',
            boxSizing: 'border-box',
            textAlign: 'center',
            animation: 'fadeIn 0.2s ease',
            pointerEvents: 'none',
          }}
        >
          {localToast}
        </div>
      )}
    </section>
  );
};
