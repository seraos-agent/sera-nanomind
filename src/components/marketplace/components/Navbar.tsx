import React, { useState } from 'react';
import type { MarketplaceFilterTab } from '../types';
import { UserIcon, CartIcon } from './Icons';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedType: MarketplaceFilterTab;
  onTypeChange: (t: MarketplaceFilterTab) => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenSellerModal?: () => void;
  onOpenProfile?: () => void;
  onBack?: () => void;
  isMobileView?: boolean;
}

// Pure Modern Vector SVG Icons for Navigation Tabs (Zero external package dependencies)
const ShoppingBagIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
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
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <path d="M3 6h18" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const FoodPlateIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'block' }}
  >
    {/* Symmetrical main plate */}
    <circle cx="12" cy="12" r="4.6" />
    <circle cx="12" cy="12" r="2.3" strokeWidth="1.2" opacity="0.45" />

    {/* Left fork */}
    <path d="M2.8 4v3.5a1.2 1.2 0 0 0 2.4 0V4" />
    <path d="M4 4v3.5" />
    <path d="M4 8.7V20" />

    {/* Right spoon */}
    <ellipse cx="20" cy="7" rx="1.4" ry="2.8" />
    <path d="M20 9.8V20" />
  </svg>
);

const WrenchIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
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
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z" />
  </svg>
);

const NAV_TABS = [
  { key: 'STORE' as MarketplaceFilterTab, label: 'Shop', icon: ShoppingBagIcon },
  { key: 'FOOD' as MarketplaceFilterTab, label: 'Food', icon: FoodPlateIcon },
  { key: 'SERVICE' as MarketplaceFilterTab, label: 'Services', icon: WrenchIcon },
];

const ArrowLeftIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const SearchIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

export const Navbar = React.forwardRef<HTMLElement, NavbarProps>(({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  cartCount,
  onOpenCart,
  onOpenProfile,
  onBack,
  isMobileView,
}, ref) => {
  const [hoveredTab, setHoveredTab] = useState<MarketplaceFilterTab | null>(null);

  const renderBackButton = () => {
    if (!onBack) return null;
    return (
      <button
        type="button"
        onClick={onBack}
        title="Back"
        aria-label="Back"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '34px',
          height: '34px',
          borderRadius: '50%',
          background: 'none',
          border: 'none',
          color: 'var(--text-main)',
          cursor: 'pointer',
          flexShrink: 0,
          transition: 'background 0.15s ease'
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.background = 'var(--bg-subtle)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.background = 'transparent';
        }}
      >
        <ArrowLeftIcon size={21} />
      </button>
    );
  };

  const renderSearchInput = (isDesktop: boolean) => (
    <div
      style={
        isDesktop
          ? { flex: '0 1 260px', minWidth: '110px', width: '100%', position: 'relative' }
          : { flex: 1, minWidth: 0, position: 'relative' }
      }
    >
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search stores or products..."
        className="marketplace-search-input"
      />
      <span className="marketplace-search-icon">
        <SearchIcon size={14} />
      </span>
      {searchQuery && (
        <button
          type="button"
          onClick={() => onSearchChange('')}
          className="marketplace-search-clear"
          style={{
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '0.75rem'
          }}
        >
          ✕
        </button>
      )}
    </div>
  );

  const renderRightActions = (showProfile: boolean) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
      {/* Cart Icon */}
      <button
        type="button"
        onClick={onOpenCart}
        title="Shopping Cart"
        aria-label="Shopping Cart"
        style={{
          position: 'relative',
          background: 'transparent',
          border: 'none',
          width: '36px',
          height: '36px',
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
        <CartIcon size={21} color="currentColor" />
        {cartCount > 0 && (
          <span style={{
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
            lineHeight: 1
          }}>
            {cartCount > 99 ? '99+' : cartCount}
          </span>
        )}
      </button>

      {showProfile && (
        /* User Profile Icon */
        <button
          type="button"
          onClick={onOpenProfile}
          title="Account & User Registration"
          aria-label="User Account"
          style={{
            position: 'relative',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-color)',
            width: '36px',
            height: '36px',
            cursor: 'pointer',
            color: 'var(--text-main)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg-surface, #FFFFFF)';
            e.currentTarget.style.borderColor = 'var(--color-brand)';
            e.currentTarget.style.color = 'var(--color-brand)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--bg-subtle)';
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.color = 'var(--text-main)';
          }}
        >
          <UserIcon size={19} color="currentColor" />
        </button>
      )}
    </div>
  );

  const renderCapsuleTabs = (isDesktop: boolean) => (
    <nav
      aria-label="Marketplace sections"
      className={isDesktop ? 'no-scrollbar' : undefined}
      style={
        isDesktop
          ? {
              flex: '0 1 auto',
              minWidth: 0,
              maxWidth: '100%',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }
          : {
              padding: '2px 12px 8px 12px',
              maxWidth: '440px',
              margin: '0 auto',
              boxSizing: 'border-box'
            }
      }
    >
      <div
        style={{
          display: isDesktop ? 'inline-flex' : 'flex',
          alignItems: 'center',
          background: 'var(--bg-subtle, #F1F5F9)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-full)',
          padding: '3px',
          gap: '2px',
          boxSizing: 'border-box',
          width: isDesktop ? 'auto' : '100%'
        }}
      >
        {NAV_TABS.map((tab) => {
          const isSelected = selectedType === tab.key;
          const isHovered = hoveredTab === tab.key;
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTypeChange(tab.key)}
              aria-current={isSelected ? 'page' : undefined}
              onMouseEnter={() => setHoveredTab(tab.key)}
              onMouseLeave={() => setHoveredTab(prev => (prev === tab.key ? null : prev))}
              style={{
                flex: isDesktop ? '0 0 auto' : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: isDesktop ? '6px 14px' : '6px 10px',
                minHeight: isDesktop ? '32px' : '34px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                background: isSelected ? 'var(--bg-surface, #FFFFFF)' : 'transparent',
                color: isSelected || isHovered ? 'var(--text-main)' : 'var(--text-muted)',
                cursor: 'pointer',
                boxShadow: isSelected ? '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)' : 'none',
                transition: 'all 0.18s ease',
                userSelect: 'none',
                outline: 'none',
                whiteSpace: 'nowrap'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: isSelected ? 'scale(1.05)' : 'none',
                transition: 'transform 0.15s ease',
                flexShrink: 0
              }}>
                <IconComponent size={isDesktop ? 16 : 17} />
              </div>
              <span style={{
                fontSize: '0.82rem',
                fontWeight: isSelected ? 700 : 500,
                letterSpacing: '-0.01em',
                lineHeight: 1
              }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );

  // Desktop single-row header: Back + compact Search (left), centered Capsule tabs, Cart & Profile (right)
  if (!isMobileView) {
    return (
      <header
        ref={ref}
        className="site-header"
        style={{ borderBottom: '1px solid var(--border-color)' }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '0 18px',
            height: '55px',
            width: '100%',
            boxSizing: 'border-box'
          }}
        >
          <div
            style={{
              flex: '1 1 0',
              minWidth: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: '10px'
            }}
          >
            {renderBackButton()}
            {renderSearchInput(true)}
          </div>

          {renderCapsuleTabs(true)}

          <div
            style={{
              flex: '1 1 0',
              minWidth: 'fit-content',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end'
            }}
          >
            {renderRightActions(false)}
          </div>
        </div>
      </header>
    );
  }

  // Mobile 2-row header
  return (
    <header ref={ref} className="site-header">
      <div className="container" style={{ padding: '0 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', height: '52px' }}>
          {renderBackButton()}
          {renderSearchInput(false)}
          {renderRightActions(true)}
        </div>
      </div>

      {renderCapsuleTabs(false)}
    </header>
  );
});

Navbar.displayName = 'Navbar';
