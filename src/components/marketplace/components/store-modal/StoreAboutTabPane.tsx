import React from 'react';
import type { MarketplaceStore } from '../../types';
import { MapPinIcon, StarIcon, WhatsAppIcon } from '../Icons';
import { StoreClosedNotice } from './StoreClosedNotice';

interface StoreAboutTabPaneProps {
  store: MarketplaceStore;
  onWhatsAppChat: () => void;
}

export const StoreAboutTabPane: React.FC<StoreAboutTabPaneProps> = ({
  store,
  onWhatsAppChat,
}) => {
  return (
    <div style={{ padding: '16px 16px 40px' }}>
      <StoreClosedNotice isOpen={store.isOpen} style={{ marginBottom: '12px' }} />
      <div
        style={{
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div>
          <h3
            style={{
              fontSize: '0.82rem',
              fontWeight: 600,
              color: 'var(--text-main)',
              margin: 0,
              marginBottom: '6px',
            }}
          >
            About Seller
          </h3>
          <p
            style={{
              fontSize: '0.82rem',
              color: 'var(--text-sub)',
              lineHeight: 1.55,
              margin: 0,
            }}
          >
            {store.description}
          </p>
        </div>

        <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', fontSize: '0.78rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <MapPinIcon size={13} color="#EF4444" />
                <span>Address:</span>
              </span>
              <div style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>
                {store.address}, {store.city}
              </div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Store Status:</span>
              <div
                style={{
                  fontWeight: 700,
                  color: store.isOpen ? '#16A34A' : '#DC2626',
                  marginTop: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <span>{store.isOpen ? 'Open Now' : 'Closed / On Break'}</span>
              </div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>⏰ Opening Hours:</span>
              <div style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>
                {store.operatingHours}
              </div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <StarIcon size={13} color="#EAB308" fill="#EAB308" />
                <span>Store Rating:</span>
              </span>
              <div style={{ fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
                {store.rating} / 5.0
              </div>
            </div>
            {store.whatsapp && (
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <WhatsAppIcon size={13} />
                  <span>WhatsApp:</span>
                </span>
                <div style={{ fontWeight: 600, color: '#16A34A', marginTop: '2px' }}>
                  {store.whatsapp}
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
          <button
            type="button"
            onClick={onWhatsAppChat}
            style={{
              width: '100%',
              padding: '11px 16px',
              fontSize: '0.88rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface, #FFFFFF)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-subtle, #F8FAFC)';
              e.currentTarget.style.borderColor = '#CBD5E1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--bg-surface, #FFFFFF)';
              e.currentTarget.style.borderColor = 'var(--border-color)';
            }}
          >
            <WhatsAppIcon size={20} />
            <span>Contact Seller via WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};

