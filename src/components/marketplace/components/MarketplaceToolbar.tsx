import React from 'react';
import type { MarketplaceFilterTab } from '../types';

interface MarketplaceToolbarProps {
  type: MarketplaceFilterTab;
  searchTarget: 'STORE' | 'PRODUCT';
  onSearchTargetChange: (target: 'STORE' | 'PRODUCT') => void;
  sortBy: 'popular' | 'price_asc' | 'price_desc' | 'rating';
  onSortByChange: (sortBy: 'popular' | 'price_asc' | 'price_desc' | 'rating') => void;
  openSortTab: MarketplaceFilterTab | null;
  onToggleSortTab: (tab: MarketplaceFilterTab) => void;
  onCloseSortTab: () => void;
}

export const MarketplaceToolbar: React.FC<MarketplaceToolbarProps> = ({
  type,
  searchTarget,
  onSearchTargetChange,
  sortBy,
  onSortByChange,
  openSortTab,
  onToggleSortTab,
  onCloseSortTab,
}) => {
  return (
    <div
      style={{
        position: 'relative',
        zIndex: 10,
        background: 'transparent',
        padding: '6px 0 12px 0',
        margin: '0 0 12px 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '10px',
        flexWrap: 'nowrap',
        borderBottom: '1px solid var(--border-color, rgba(226, 232, 240, 0.8))',
      }}
    >
      {/* Segmented Control: Product vs Store */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          flexShrink: 0,
          background: 'var(--bg-subtle, #F1F5F9)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-full)',
          padding: '3px',
          gap: '2px',
        }}
      >
        <button
          type="button"
          onClick={() => onSearchTargetChange('PRODUCT')}
          style={{
            padding: '5px 16px',
            fontSize: '0.8rem',
            fontWeight: searchTarget === 'PRODUCT' ? 700 : 500,
            borderRadius: 'var(--radius-full)',
            border: 'none',
            background: searchTarget === 'PRODUCT' ? 'var(--bg-card, #FFFFFF)' : 'transparent',
            color: searchTarget === 'PRODUCT' ? 'var(--text-main)' : 'var(--text-muted)',
            cursor: 'pointer',
            boxShadow:
              searchTarget === 'PRODUCT'
                ? '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)'
                : 'none',
            transition: 'all 0.18s ease',
            userSelect: 'none',
          }}
        >
          Products
        </button>
        <button
          type="button"
          onClick={() => onSearchTargetChange('STORE')}
          style={{
            padding: '5px 16px',
            fontSize: '0.8rem',
            fontWeight: searchTarget === 'STORE' ? 700 : 500,
            borderRadius: 'var(--radius-full)',
            border: 'none',
            background: searchTarget === 'STORE' ? 'var(--bg-card, #FFFFFF)' : 'transparent',
            color: searchTarget === 'STORE' ? 'var(--text-main)' : 'var(--text-muted)',
            cursor: 'pointer',
            boxShadow:
              searchTarget === 'STORE'
                ? '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)'
                : 'none',
            transition: 'all 0.18s ease',
            userSelect: 'none',
          }}
        >
          Stores
        </button>
      </div>

      {/* Sort Dropdown Popover */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <button
          type="button"
          onClick={() => onToggleSortTab(type)}
          style={{
            background: 'var(--bg-card, #FFFFFF)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-main)',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.78rem',
            fontWeight: 600,
            outline: 'none',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minWidth: '138px',
            gap: '6px',
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap',
          }}
        >
          <span>
            {sortBy === 'popular' && 'Most Popular'}
            {sortBy === 'rating' && 'Highest Rated'}
            {sortBy === 'price_asc' && 'Lowest Price'}
            {sortBy === 'price_desc' && 'Highest Price'}
          </span>
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              color: 'var(--text-muted)',
              transition: 'transform 0.2s ease',
              transform: openSortTab === type ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {openSortTab === type && (
          <>
            <div
              onClick={onCloseSortTab}
              style={{ position: 'fixed', inset: 0, zIndex: 40 }}
            />
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                right: 0,
                background: 'var(--bg-card, #FFFFFF)',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                boxShadow:
                  '0 10px 25px -4px rgba(15, 23, 42, 0.12), 0 6px 10px -4px rgba(15, 23, 42, 0.06)',
                padding: '4px',
                boxSizing: 'border-box',
                zIndex: 50,
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                animation: 'fadeIn 0.15s ease',
              }}
            >
              {[
                { value: 'popular', label: 'Most Popular' },
                { value: 'rating', label: 'Highest Rated' },
                ...(searchTarget === 'PRODUCT'
                  ? [
                      { value: 'price_asc', label: 'Lowest Price' },
                      { value: 'price_desc', label: 'Highest Price' },
                    ]
                  : []),
              ].map((opt) => {
                const isSelected = sortBy === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onSortByChange(opt.value as any);
                      onCloseSortTab();
                    }}
                    style={{
                      display: 'block',
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '7px 10px',
                      borderRadius: '8px',
                      border: 'none',
                      background: isSelected ? 'var(--color-brand-bg)' : 'transparent',
                      color: isSelected ? 'var(--color-brand)' : 'var(--text-main)',
                      fontSize: '0.76rem',
                      fontWeight: isSelected ? 600 : 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                      whiteSpace: 'nowrap',
                      transition: 'background 0.12s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = 'var(--bg-subtle, #F8FAFC)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

