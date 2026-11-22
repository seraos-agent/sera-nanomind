import React from 'react';
import type { MarketplaceItem } from '../../types';
import { ItemCard } from '../ItemCard';
import { type StoreSortBy } from './types';
import { StoreClosedNotice } from './StoreClosedNotice';

interface StoreProductsTabPaneProps {
  isOpen?: boolean;
  stickyTop?: number;
  filteredStoreItems: MarketplaceItem[];
  sortBy: StoreSortBy;
  onSelectSort: (sort: StoreSortBy) => void;
  onPriceSortToggle: () => void;
  priceSortLabel: string;
  activeCategoryFilter: string | null;
  onClearCategoryFilter: () => void;
  onSelectItem: (item: MarketplaceItem) => void;
  onAddToCart: (item: MarketplaceItem) => void;
}

export const StoreProductsTabPane: React.FC<StoreProductsTabPaneProps> = ({
  isOpen,
  stickyTop = 48,
  filteredStoreItems,
  sortBy,
  onSelectSort,
  onPriceSortToggle,
  priceSortLabel,
  activeCategoryFilter,
  onClearCategoryFilter,
  onSelectItem,
  onAddToCart,
}) => {
  return (
    <div>
      {/* Sub-Sorting Bar for PRODUK (Sticky directly beneath pinned tab bar) */}
      <div
        className="store-sort-bar"
        style={{
          position: 'sticky',
          top: `${stickyTop}px`,
          zIndex: 25,
          borderBottom: 'none',
          boxShadow: 'none',
        }}
      >
        <button
          type="button"
          onClick={() => onSelectSort('populer')}
          className={`store-sort-btn ${sortBy === 'populer' ? 'active' : ''}`}
        >
          Populer
        </button>
        <button
          type="button"
          onClick={() => onSelectSort('terbaru')}
          className={`store-sort-btn ${sortBy === 'terbaru' ? 'active' : ''}`}
        >
          <span style={{ position: 'relative' }}>
            Terbaru
            <span
              style={{
                position: 'absolute',
                top: '-3px',
                right: '-6px',
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                background: '#EF4444',
              }}
            />
          </span>
        </button>
        <button
          type="button"
          onClick={() => onSelectSort('terlaris')}
          className={`store-sort-btn ${sortBy === 'terlaris' ? 'active' : ''}`}
        >
          Terlaris
        </button>
        <button
          type="button"
          onClick={onPriceSortToggle}
          className={`store-sort-btn ${sortBy === 'harga_asc' || sortBy === 'harga_desc' ? 'active' : ''}`}
        >
          {priceSortLabel}
        </button>
      </div>

      <StoreClosedNotice isOpen={isOpen} style={{ margin: '12px 16px 0' }} />

      {/* Active Category Filter Chip */}
      {activeCategoryFilter && (
        <div style={{ padding: '8px 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Kategori:</span>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-brand-bg)',
              border: '1px solid var(--color-brand)',
              color: 'var(--color-brand)',
              fontSize: '0.74rem',
              fontWeight: 700,
            }}
          >
            <span>{activeCategoryFilter}</span>
            <button
              type="button"
              onClick={onClearCategoryFilter}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-brand)',
                cursor: 'pointer',
                fontSize: '0.8rem',
                padding: 0,
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Products 2-Column Grid */}
      <div style={{ padding: '12px 14px 40px' }}>
        {filteredStoreItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>Tidak ada produk yang cocok</p>
            <p style={{ fontSize: '0.78rem', marginTop: '4px' }}>Coba ubah kata kunci pencarian atau kategori</p>
          </div>
        ) : (
          <div className="products-grid">
            {filteredStoreItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onSelect={onSelectItem}
                onAddToCart={onAddToCart}
                onSelectStore={() => {}}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

