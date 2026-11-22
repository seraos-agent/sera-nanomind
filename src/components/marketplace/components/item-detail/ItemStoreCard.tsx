import React from 'react';
import type { MarketplaceStore } from '../../types';
import { MapPinIcon, StarIcon } from '../Icons';
import { formatFullStoreArea, formatShortCity } from '../../utils/formatters';

interface ItemStoreCardProps {
  store?: MarketplaceStore;
  storeId: string;
  storeName: string;
  location?: string;
  rating?: number;
  fallbackImage: string;
  hasMultipleImages?: boolean;
  onSelectStore: (storeId: string) => void;
  onClose: () => void;
}

export const ItemStoreCard: React.FC<ItemStoreCardProps> = ({
  store,
  storeId,
  storeName,
  location,
  rating,
  fallbackImage,
  hasMultipleImages = false,
  onSelectStore,
  onClose,
}) => {
  return (
    <div
      style={{
        marginTop: hasMultipleImages ? '10px' : '12px',
        padding: '12px 14px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg-subtle)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
      onClick={() => {
        onSelectStore(storeId);
        onClose();
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#F1F5F9';
        e.currentTarget.style.borderColor = 'var(--border-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'var(--bg-subtle)';
        e.currentTarget.style.borderColor = 'var(--border-color)';
      }}
    >
      {/* Store Avatar */}
      <div
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          overflow: 'hidden',
          background: '#FFFFFF',
          border: '1px solid var(--border-color)',
          flexShrink: 0,
          marginTop: '1px',
        }}
      >
        <img
          src={store?.logoUrl || fallbackImage}
          alt={storeName}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* Store Details Column */}
      <div style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header Row: Store Name & Kunjungi Toko */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            marginBottom: '7px',
          }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: '0.88rem',
              color: 'var(--text-main)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: 1.3,
            }}
          >
            {storeName}
          </div>

          {/* Kunjungi Toko Compact Indicator */}
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              color: 'var(--color-brand)',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2px',
            }}
          >
            <span>Kunjungi Toko</span>
            <span style={{ fontSize: '0.8rem', lineHeight: 1 }}>›</span>
          </span>
        </div>

        {/* Information Rows: Location, Rating */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {/* Row 1: Location */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.72rem',
              color: 'var(--text-sub)',
              lineHeight: 1.2,
            }}
          >
            <span style={{ width: '14px', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
              <MapPinIcon size={12} color="#EF4444" />
            </span>
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {formatFullStoreArea({
                city: store?.city,
                district: store?.district,
                village: store?.village,
                address: store?.address,
                fallback: formatShortCity(location, '')
              })}
            </span>
          </div>

          {/* Row 2: Rating */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.72rem',
              color: 'var(--text-sub)',
              lineHeight: 1.2,
            }}
          >
            <span style={{ width: '14px', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
              <StarIcon size={12} color="#EAB308" fill="#EAB308" />
            </span>
            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
              {store?.rating || rating || 4.9}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

