import React from 'react';
import type { MarketplaceStore } from '../../types';
import { MapPinIcon, StarIcon } from '../Icons';
import { formatFullStoreArea } from '../../utils/formatters';

interface StoreProfileBannerProps {
  store: MarketplaceStore;
}

export const StoreProfileBanner: React.FC<StoreProfileBannerProps> = ({
  store,
}) => {
  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: '#0F172A',
        minHeight: '148px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '24px 16px 16px',
      }}
    >
      {/* Background Image */}
      <img
        src={store.bannerUrl}
        alt={store.name}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />

      {/* Dark Vignette Gradient */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to bottom, rgba(15, 23, 42, 0.4) 0%, rgba(15, 23, 42, 0.76) 55%, rgba(15, 23, 42, 0.92) 100%)',
        }}
      />

      {/* Profile Info Row: Avatar + Name + Rating + Location + Followers */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        {/* Store Avatar */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div
            style={{
              width: '58px',
              height: '58px',
              borderRadius: '50%',
              overflow: 'hidden',
              background: '#FFFFFF',
              border: '2px solid rgba(255, 255, 255, 0.95)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            }}
          >
            <img
              src={store.logoUrl}
              alt={store.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>

        {/* Text Meta Column */}
        <div style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {/* Store Name Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {store.verified && (
              <span
                style={{
                  background: '#EF4444',
                  color: '#FFFFFF',
                  fontSize: '0.64rem',
                  fontWeight: 400,
                  padding: '1.5px 6px',
                  borderRadius: '3px',
                  lineHeight: 1.2,
                  letterSpacing: '0.2px',
                  flexShrink: 0,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                }}
              >
                Star
              </span>
            )}
            <h2
              style={{
                fontSize: '0.98rem',
                fontWeight: 600,
                color: '#FFFFFF',
                textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                lineHeight: 1.25,
                margin: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {store.name}
            </h2>
            {!store.isOpen && (
              <span
                style={{
                  padding: '2px 7px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.64rem',
                  fontWeight: 500,
                  background: 'rgba(220, 38, 38, 0.92)',
                  color: '#FFFFFF',
                  letterSpacing: '0.3px',
                  flexShrink: 0,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                }}
              >
                Tutup
              </span>
            )}
          </div>

          {/* Sub-Info Meta Row: Rating • Kota */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.74rem',
              color: 'rgba(255, 255, 255, 0.92)',
              textShadow: '0 1px 3px rgba(0,0,0,0.6)',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ color: '#FBBF24', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              <StarIcon size={12} color="#FBBF24" fill="#FBBF24" />
              <span>{store.rating}</span>
            </span>
            <span style={{ color: 'rgba(255, 255, 255, 0.45)' }}>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              <MapPinIcon size={11} color="#F87171" />
              <span>
                {formatFullStoreArea({
                  city: store.city,
                  district: store.district,
                  village: store.village,
                  address: store.address,
                  fallback: 'Indonesia'
                })}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

