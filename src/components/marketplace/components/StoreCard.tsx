import React from 'react';
import type { MarketplaceStore } from '../types';
import { MapPinIcon } from './Icons';
import { formatStorePinLocation } from '../utils/formatters';

interface StoreCardProps {
  store: MarketplaceStore;
  onSelect: (storeId: string) => void;
}

/**
 * Optimizes store image URL to render crisp landscape cards (480px width)
 * while maintaining lightweight payload and fast decoding on mobile grids.
 */
const getOptimizedStoreImage = (bannerUrl?: string, logoUrl?: string): string => {
  const candidate = bannerUrl || logoUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=480&auto=format&fit=crop&q=75';
  if (candidate.includes('images.unsplash.com')) {
    let optimized = candidate.includes('w=')
      ? candidate.replace(/w=\d+/, 'w=480')
      : `${candidate}${candidate.includes('?') ? '&' : '?'}w=480&auto=format&fit=crop`;
    optimized = optimized.includes('q=')
      ? optimized.replace(/q=\d+/, 'q=75')
      : `${optimized}${optimized.includes('?') ? '&' : '?'}q=75`;
    return optimized;
  }
  return candidate;
};

export const StoreCard: React.FC<StoreCardProps> = React.memo(({ store, onSelect }) => {
  const storeImageUrl = getOptimizedStoreImage(store.bannerUrl, store.logoUrl);

  return (
    <div
      onClick={() => onSelect(store.id)}
      style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-card)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: 'pointer',
        position: 'relative',
        contain: 'layout paint',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-card)';
      }}
    >
      {/* Store Photo Container */}
      <div className="item-card-image-box">
        <img
          src={storeImageUrl}
          alt={store.name}
          decoding="async"
          className="item-card-image"
          style={{
            filter: !store.isOpen ? 'grayscale(35%) brightness(0.92)' : undefined,
            opacity: !store.isOpen ? 0.88 : 1,
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=480&auto=format&fit=crop&q=75';
          }}
        />

        {/* Status Pill */}
        {!store.isOpen && (
          <div style={{ position: 'absolute', top: '6px', left: '6px', zIndex: 2 }}>
            <span
              style={{
                background: 'rgba(220, 38, 38, 0.94)',
                color: '#FFFFFF',
                fontSize: '0.62rem',
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: 'var(--radius-full)',
                letterSpacing: '0.02em',
              }}
            >
              Closed
            </span>
          </div>
        )}
      </div>

      {/* Store Card Info Body */}
      <div style={{ padding: '8px 10px 10px', display: 'flex', flexDirection: 'column', flex: 1, gap: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
          <span
            style={{
              fontWeight: 600,
              color: 'var(--text-sub)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              background: 'var(--bg-subtle)',
              padding: '1px 6px',
              borderRadius: 'var(--radius-sm)',
              maxWidth: '100%',
              overflow: 'hidden',
              whiteSpace: 'nowrap'
            }}
          >
            <MapPinIcon size={11} color="#EF4444" />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {formatStorePinLocation({
                city: store.city,
                district: store.district,
                village: store.village,
                address: store.address,
                fallback: 'Indonesia'
              })}
            </span>
          </span>
        </div>

        <h4
          style={{
            fontSize: '0.86rem',
            fontWeight: 700,
            color: 'var(--text-main)',
            margin: '1px 0 2px',
            lineHeight: 1.25,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {store.name}
        </h4>

        <p
          style={{
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '1.9rem',
          }}
        >
          {store.tagline || store.description || 'Trusted product and service provider.'}
        </p>

        <div
          style={{
            marginTop: 'auto',
            paddingTop: '2px',
            display: 'flex',
            alignItems: 'center',
            fontSize: '0.7rem',
            color: 'var(--text-muted)',
            whiteSpace: 'nowrap',
          }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            <span style={{ color: '#F59E0B', fontSize: '0.74rem' }}>★</span>
            <strong style={{ color: 'var(--text-main)', fontWeight: 700 }}>
              {(store.rating ?? 5.0).toFixed(1)}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
});

