import React from 'react';
import { FOOD_CATEGORIES } from './heroCategories';

interface FoodHeroSectionProps {
  activeCategory: string | null;
  onSelectCategory: (cat: string | null) => void;
  isMobileView?: boolean;
}

export const FoodHeroSection: React.FC<FoodHeroSectionProps> = ({
  activeCategory,
  onSelectCategory,
  isMobileView,
}) => {
  const [scrollProgress, setScrollProgress] = React.useState(0);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) {
      setScrollProgress(0);
      return;
    }
    const progress = Math.min(1, Math.max(0, el.scrollLeft / maxScroll));
    setScrollProgress(progress);
  };

  return (
    <div>
      {/* Universal Food Photo Banner */}
      <div
        style={{
          position: 'relative',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          marginBottom: '12px',
          boxShadow: 'var(--shadow-card)',
          height: '145px',
          background: '#1E293B'
        }}
      >
        <img
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&auto=format&fit=crop&q=80"
          alt="SERA Featured Culinary"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block'
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to right, rgba(15, 23, 42, 0.82) 0%, rgba(15, 23, 42, 0.35) 65%, transparent 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '0 20px',
            color: '#FFFFFF'
          }}
        >
          <span
            style={{
              display: 'inline-block',
              background: '#EF4444',
              color: '#FFFFFF',
              fontSize: '0.68rem',
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: 'var(--radius-full)',
              marginBottom: '6px',
              width: 'fit-content'
            }}
          >
            🔥 Artisan Food &amp; Cafe Picks
          </span>
          <h3
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              margin: 0,
              color: '#FFFFFF',
              fontFamily: 'var(--font-heading)',
              letterSpacing: '-0.02em'
            }}
          >
            Explore Signature Dishes &amp; Favorites
          </h3>
          <p
            style={{
              fontSize: '0.78rem',
              color: '#E2E8F0',
              margin: '4px 0 0',
              maxWidth: '400px'
            }}
          >
            From authentic local Kitchens and coffee shops to fresh daily snacks.
          </p>
        </div>
      </div>

      {/* Horizontal Food Category Bar */}
      <div style={{ padding: '4px 0 2px', marginBottom: '0px' }}>
        <div
          onScroll={isMobileView ? handleScroll : undefined}
          className="no-scrollbar"
          style={{
            display: 'flex',
            alignItems: 'start',
            justifyContent: 'flex-start',
            gap: '14px',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            padding: '2px 4px',
            maxWidth: '100%'
          }}
        >
          {FOOD_CATEGORIES.map((cat) => {
            const isAllItem = cat.name === '__ALL__';
            const isSelected = isAllItem
              ? activeCategory === null
              : activeCategory === cat.name;

            return (
              <button
                key={cat.id}
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
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px 6px',
                  outline: 'none',
                  userSelect: 'none',
                  flexShrink: 0,
                  minWidth: '66px'
                }}
              >
                <div
                  className="category-icon-circle"
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isSelected ? 'var(--border-color, #E2E8F0)' : 'var(--bg-subtle)',
                    border: 'none',
                    color: isSelected ? 'var(--text-main)' : 'var(--text-sub)',
                    boxShadow: 'none',
                    transition: 'background-color 0.18s ease, color 0.18s ease'
                  }}
                >
                  <span style={{ fontSize: '1.25rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    {cat.icon}
                  </span>
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
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Scroll Indicator (Mobile Only) */}
        {isMobileView && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              paddingTop: '3px',
              paddingBottom: '0px'
            }}
          >
            <div
              style={{
                width: '34px',
                height: '3.5px',
                backgroundColor: 'var(--border-color, #E2E8F0)',
                borderRadius: '999px',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  width: '15px',
                  height: '100%',
                  backgroundColor: '#EF4444',
                  borderRadius: '999px',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  transform: `translateX(${scrollProgress * 19}px)`,
                  transition: 'transform 0.08s ease-out'
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
