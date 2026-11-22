import React, { useState } from 'react';
import { ArrowLeftIcon, CartIcon } from '../Icons';

interface StoreHeaderProps {
  storeSearch: string;
  onSearchChange: (val: string) => void;
  onClearSearch: () => void;
  cartCount?: number;
  onOpenCart?: () => void;
  onBack: () => void;
  onShareStore: () => void;
  onOpenReport: () => void;
}

const SearchIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.1"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'block' }}
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const MoreVerticalIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.1"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'block' }}
  >
    <circle cx="12" cy="12" r="1.5" />
    <circle cx="12" cy="5" r="1.5" />
    <circle cx="12" cy="19" r="1.5" />
  </svg>
);

export const StoreHeader: React.FC<StoreHeaderProps> = ({
  storeSearch,
  onSearchChange,
  onClearSearch,
  cartCount = 0,
  onOpenCart,
  onBack,
  onShareStore,
  onOpenReport,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="store-header-bar">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        title="Kembali"
        aria-label="Kembali"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '34px',
          height: '34px',
          borderRadius: '50%',
          background: 'transparent',
          border: 'none',
          color: 'var(--text-main)',
          cursor: 'pointer',
          flexShrink: 0,
          transition: 'background 0.15s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-subtle)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <ArrowLeftIcon size={21} />
      </button>

      {/* Center Area: Persistent Search Bar */}
      <div style={{ flex: 1, position: 'relative' }}>
        <input
          type="text"
          value={storeSearch}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari di Toko ini..."
          className="marketplace-search-input"
        />
        <span className="marketplace-search-icon">
          <SearchIcon size={14} />
        </span>
        {storeSearch && (
          <button
            type="button"
            onClick={onClearSearch}
            className="marketplace-search-clear"
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Right Action Icons: Cart & More Options Menu */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
        {/* Shopping Cart Icon in Store Header */}
        {onOpenCart && (
          <button
            type="button"
            onClick={onOpenCart}
            title="Keranjang Belanja"
            aria-label="Keranjang Belanja"
            style={{
              position: 'relative',
              background: 'transparent',
              border: 'none',
              width: '34px',
              height: '34px',
              cursor: 'pointer',
              color: 'var(--text-main)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-subtle)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <CartIcon size={20} color="currentColor" />
            {cartCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '1px',
                  right: '-1px',
                  background: '#EF4444',
                  color: '#FFFFFF',
                  fontSize: cartCount > 99 ? '0.56rem' : '0.65rem',
                  fontWeight: 800,
                  minWidth: '16px',
                  height: '16px',
                  borderRadius: 'var(--radius-full)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: cartCount > 99 ? '0 3px' : '0 4px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
                  lineHeight: 1,
                }}
              >
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </button>
        )}

        {/* More Options (3 Dots Dropdown Menu) */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            title="Pilihan Toko"
            aria-label="Pilihan Toko"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: isMenuOpen ? 'var(--bg-subtle)' : 'transparent',
              border: 'none',
              color: 'var(--text-main)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s ease',
            }}
          >
            <MoreVerticalIcon size={19} />
          </button>

          {/* Popover Dropdown Menu */}
          {isMenuOpen && (
            <>
              <div
                onClick={() => setIsMenuOpen(false)}
                style={{ position: 'fixed', inset: 0, zIndex: 40 }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '38px',
                  right: 0,
                  width: '180px',
                  background: 'var(--bg-card, #FFFFFF)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                  zIndex: 50,
                  padding: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  animation: 'fadeIn 0.15s ease',
                }}
              >
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onShareStore();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'none',
                    color: 'var(--text-main)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    transition: 'background 0.12s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-subtle)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                >
                  <span>🔗</span>
                  <span>Bagikan Toko</span>
                </button>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenReport();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'none',
                    color: '#DC2626',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    transition: 'background 0.12s ease',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = 'var(--color-danger-bg, rgba(220, 38, 38, 0.12))')
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                >
                  <span>🚩</span>
                  <span>Laporkan Toko</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

