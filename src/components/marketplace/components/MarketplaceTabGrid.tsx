import React, { useEffect, useRef } from 'react';
import { Search, Store } from 'lucide-react';
import type { MarketplaceItem, MarketplaceStore, MarketplaceFilterTab } from '../types';
import { HeroBanner } from './HeroBanner';
import { ItemCard } from './ItemCard';
import { StoreCard } from './StoreCard';
import { MarketplaceToolbar } from './MarketplaceToolbar';

export function MarketplaceSkeletonGrid() {
  return (
    <div className="products-grid" aria-busy="true" aria-label="Memuat daftar marketplace">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div
          key={idx}
          style={{
            background: 'var(--bg-card, #FFFFFF)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg, 14px)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            padding: 10,
            gap: 10,
          }}
        >
          <div
            style={{
              width: '100%',
              aspectRatio: '1 / 1',
              borderRadius: 10,
              background: 'var(--bg-subtle, #E2E8F0)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
          <div
            style={{
              height: 14,
              width: '78%',
              borderRadius: 6,
              background: 'var(--bg-subtle, #E2E8F0)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
          <div
            style={{
              height: 12,
              width: '48%',
              borderRadius: 6,
              background: 'var(--bg-subtle, #E2E8F0)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
        </div>
      ))}
    </div>
  );
}

export function InfiniteScrollSentinel({ onVisible, enabled = true }: { onVisible: () => void; enabled?: boolean }) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const el = sentinelRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const root = el.closest('.marketplace-tab-pane');
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          onVisible();
        }
      },
      { root, rootMargin: '240px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [onVisible, enabled]);

  return <div ref={sentinelRef} style={{ height: 1, width: '100%' }} aria-hidden="true" />;
}

interface MarketplaceTabBodyProps {
  type: MarketplaceFilterTab;
  selectedType: MarketplaceFilterTab;
  activeCategory: string | null;
  onSelectCategory: (cat: string | null) => void;
  onShowToast: (msg: string) => void;
  searchTarget: 'STORE' | 'PRODUCT';
  onSearchTargetChange: (target: 'STORE' | 'PRODUCT') => void;
  sortBy: 'popular' | 'price_asc' | 'price_desc' | 'rating';
  onSortByChange: (sort: 'popular' | 'price_asc' | 'price_desc' | 'rating') => void;
  openSortTab: MarketplaceFilterTab | null;
  onToggleSortTab: (tab: MarketplaceFilterTab) => void;
  onCloseSortTab: () => void;
  isLoading: boolean;
  hasMore: boolean;
  tabStores: MarketplaceStore[];
  tabItems: MarketplaceItem[];
  visibleCount: number;
  onLoadMore: () => void;
  onClearFilters: () => void;
  onSelectStore: (storeId: string) => void;
  onSelectItem: (item: MarketplaceItem) => void;
  onAddToCart: (item: MarketplaceItem) => void;
}

export const MarketplaceTabBody = React.memo(function MarketplaceTabBody({
  type,
  selectedType,
  activeCategory,
  onSelectCategory,
  onShowToast,
  searchTarget,
  onSearchTargetChange,
  sortBy,
  onSortByChange,
  openSortTab,
  onToggleSortTab,
  onCloseSortTab,
  isLoading,
  hasMore,
  tabStores,
  tabItems,
  visibleCount,
  onLoadMore,
  onClearFilters,
  onSelectStore,
  onSelectItem,
  onAddToCart,
}: MarketplaceTabBodyProps) {
  const isTabActive = type === selectedType;

  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>
      <HeroBanner
        selectedType={type}
        activeCategory={activeCategory}
        onSelectCategory={onSelectCategory}
        onShowToast={onShowToast}
      />

      <main
        className="container"
        style={{
          flex: 1,
          padding: '4px 16px 80px',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          overflowX: 'clip',
        }}
      >
        <MarketplaceToolbar
          type={type}
          searchTarget={searchTarget}
          onSearchTargetChange={onSearchTargetChange}
          sortBy={sortBy}
          onSortByChange={onSortByChange}
          openSortTab={openSortTab}
          onToggleSortTab={onToggleSortTab}
          onCloseSortTab={onCloseSortTab}
        />

        {searchTarget === 'STORE' ? (
          isLoading && tabStores.length === 0 ? (
            <MarketplaceSkeletonGrid />
          ) : tabStores.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '50px 20px',
                background: 'var(--bg-card, #FFFFFF)',
                borderRadius: 'var(--radius-lg)',
                border: '1px dashed var(--border-color)',
                margin: '20px 0',
              }}
            >
              <div style={{ display: 'inline-flex', color: 'var(--text-main, #111827)', marginBottom: 10 }}>
                <Store size={32} strokeWidth={1.75} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                Tidak ada toko atau merchant yang cocok
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                Coba gunakan kata kunci nama toko, kota, atau kategori lain.
              </p>
              <button
                onClick={onClearFilters}
                className="btn btn-secondary"
                style={{ padding: '8px 16px', fontSize: '0.82rem' }}
              >
                Lihat Semua Toko
              </button>
            </div>
          ) : (
            <>
              <div className="products-grid">
                {tabStores.slice(0, visibleCount).map(s => (
                  <StoreCard key={s.id} store={s} onSelect={onSelectStore} />
                ))}
              </div>
              {tabStores.length > visibleCount && (
                <InfiniteScrollSentinel onVisible={onLoadMore} enabled={isTabActive} />
              )}
            </>
          )
        ) : isLoading && tabItems.length === 0 ? (
          <MarketplaceSkeletonGrid />
        ) : tabItems.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '50px 20px',
              background: 'var(--bg-card, #FFFFFF)',
              borderRadius: 'var(--radius-lg)',
              border: '1px dashed var(--border-color)',
              margin: '20px 0',
            }}
          >
            <div style={{ display: 'inline-flex', color: 'var(--text-main, #111827)', marginBottom: 10 }}>
              <Search size={32} strokeWidth={1.75} />
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
              Tidak ada produk atau jasa yang cocok
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Coba gunakan kata kunci lain atau bersihkan pencarian yang aktif.
            </p>
            <button
              onClick={onClearFilters}
              className="btn btn-secondary"
              style={{ padding: '8px 16px', fontSize: '0.82rem' }}
            >
              Bersihkan Pencarian
            </button>
          </div>
        ) : (
          <>
            <div className="products-grid">
              {tabItems.slice(0, visibleCount).map(item => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onSelect={onSelectItem}
                  onAddToCart={onAddToCart}
                  onSelectStore={onSelectStore}
                />
              ))}
            </div>
            {(tabItems.length > visibleCount || hasMore) && (
              <InfiniteScrollSentinel onVisible={onLoadMore} enabled={isTabActive} />
            )}
          </>
        )}
      </main>
    </div>
  );
});
