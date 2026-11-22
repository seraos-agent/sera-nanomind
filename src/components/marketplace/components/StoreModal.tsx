import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import type { MarketplaceStore, MarketplaceItem } from '../types';
import { registerBackHandler, dispatchBackButton } from '../../../utils/backButton';
import { type StoreTab, STORE_TABS } from './store-modal/types';
import { useStoreViewPager } from './store-modal/useStoreViewPager';
import { useStoreFilters } from './store-modal/useStoreFilters';
import { StoreHeader } from './store-modal/StoreHeader';
import { StoreProfileBanner } from './store-modal/StoreProfileBanner';
import { StoreProductsTabPane } from './store-modal/StoreProductsTabPane';
import { StoreCategoriesTabPane } from './store-modal/StoreCategoriesTabPane';
import { StoreAboutTabPane } from './store-modal/StoreAboutTabPane';
import { StoreReportModal } from './store-modal/StoreReportModal';

interface StoreModalProps {
  store: MarketplaceStore;
  items: MarketplaceItem[];
  onClose: () => void;
  onSelectItem: (item: MarketplaceItem) => void;
  onAddToCart: (item: MarketplaceItem) => void;
  cartCount?: number;
  onOpenCart?: () => void;
}

export const StoreModal: React.FC<StoreModalProps> = ({
  store,
  items,
  onClose,
  onSelectItem,
  onAddToCart,
  cartCount = 0,
  onOpenCart,
}) => {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // ViewPager hook (120 FPS independent-pane architecture matching MerchantPage)
  const { activeTab, pagerRef, handlePagerScroll, handleTabChange } = useStoreViewPager();
  const headerOverlayRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const paneRefs = useRef<Record<StoreTab, HTMLDivElement | null>>({
    TOKO: null,
    PRODUK: null,
    KATEGORI: null,
  });

  const [headerHeights, setHeaderHeights] = useState({ banner: 148, tabs: 48 });
  const headerHeightsRef = useRef(headerHeights);
  headerHeightsRef.current = headerHeights;

  const collapseOffsetRef = useRef(0);
  const isSyncingScrollRef = useRef(false);

  const applyOverlayTransform = useCallback((offset: number, animate: boolean) => {
    const el = headerOverlayRef.current;
    if (!el) return;
    el.style.transition = animate ? 'transform 0.2s cubic-bezier(0.22, 1, 0.36, 1)' : 'none';
    el.style.transform = `translate3d(0, ${-offset}px, 0)`;
  }, []);

  // Measure banner & tab bar heights dynamically to keep paddingTop and stickyTop exact
  useLayoutEffect(() => {
    const measure = () => {
      const bannerH = bannerRef.current ? Math.round(bannerRef.current.getBoundingClientRect().height) : 148;
      const tabsH = tabsRef.current ? Math.round(tabsRef.current.getBoundingClientRect().height) : 48;
      setHeaderHeights((prev) =>
        prev.banner === bannerH && prev.tabs === tabsH ? prev : { banner: bannerH, tabs: tabsH }
      );
    };

    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    if (bannerRef.current) ro.observe(bannerRef.current);
    if (tabsRef.current) ro.observe(tabsRef.current);
    return () => ro.disconnect();
  }, [store.id]);

  // Keep inactive panes aligned in [0 .. bannerH] so horizontal swipe never exposes top blank gap
  const syncInactivePanesHeader = useCallback((offset: number, excludeTab: StoreTab, bannerH: number) => {
    isSyncingScrollRef.current = true;
    for (const tab of STORE_TABS) {
      if (tab === excludeTab) continue;
      const pane = paneRefs.current[tab];
      if (!pane) continue;
      // Preserve deep scroll in PRODUK, while always keeping TOKO/KATEGORI anchored to top
      if (tab === 'PRODUK' && pane.scrollTop >= bannerH && offset <= bannerH) {
        continue;
      }
      if (Math.abs(pane.scrollTop - offset) >= 1) {
        pane.scrollTop = offset;
      }
    }
    requestAnimationFrame(() => {
      isSyncingScrollRef.current = false;
    });
  }, []);

  // Reset scroll & expand banner when switching to a different store
  useEffect(() => {
    collapseOffsetRef.current = 0;
    applyOverlayTransform(0, false);
    isSyncingScrollRef.current = true;
    for (const tab of STORE_TABS) {
      const pane = paneRefs.current[tab];
      if (pane) pane.scrollTop = 0;
    }
    requestAnimationFrame(() => {
      isSyncingScrollRef.current = false;
    });
  }, [store.id, applyOverlayTransform]);

  // Align active pane scroll and banner transform cleanly when switching tabs
  useEffect(() => {
    const bannerH = headerHeightsRef.current.banner;
    const pane = paneRefs.current[activeTab];
    if (!pane) return;

    if (activeTab === 'TOKO' || activeTab === 'KATEGORI') {
      const targetOffset = collapseOffsetRef.current;
      if (Math.abs(pane.scrollTop - targetOffset) >= 1) {
        isSyncingScrollRef.current = true;
        pane.scrollTop = targetOffset;
        requestAnimationFrame(() => {
          isSyncingScrollRef.current = false;
        });
      }
      return;
    }

    // Returning to PRODUK: keep its previous scroll position and glide banner to match
    const desiredOffset = Math.min(bannerH, Math.max(0, pane.scrollTop));
    if (Math.abs(desiredOffset - collapseOffsetRef.current) > 0.5) {
      collapseOffsetRef.current = desiredOffset;
      applyOverlayTransform(desiredOffset, true);
    }
  }, [activeTab, applyOverlayTransform]);

  const handlePaneScroll = (tabKey: StoreTab, e: React.UIEvent<HTMLDivElement>) => {
    if (tabKey !== activeTab || isSyncingScrollRef.current) return;
    const bannerH = headerHeightsRef.current.banner;
    if (bannerH <= 0) return;

    const nextOffset = Math.min(bannerH, Math.max(0, e.currentTarget.scrollTop));
    if (Math.abs(nextOffset - collapseOffsetRef.current) < 0.25) return;

    collapseOffsetRef.current = nextOffset;
    applyOverlayTransform(nextOffset, false);
    syncInactivePanesHeader(nextOffset, tabKey, bannerH);
  };

  // Filters hook
  const {
    storeSearch,
    setStoreSearch,
    sortBy,
    setSortBy,
    activeCategoryFilter,
    setActiveCategoryFilter,
    storeCategories,
    filteredStoreItems,
    handlePriceSortToggle,
    getPriceSortLabel,
  } = useStoreFilters(items);

  // LIFO Back Button Stack for Sub-modals inside StoreModal
  useEffect(() => {
    const unregs: Array<() => void> = [];

    if (isReportModalOpen) {
      unregs.push(
        registerBackHandler('store_report_modal', 85, () => {
          setIsReportModalOpen(false);
          return true;
        })
      );
    }
    if (activeCategoryFilter) {
      unregs.push(
        registerBackHandler('store_category_filter', 50, () => {
          setActiveCategoryFilter(null);
          return true;
        })
      );
    }
    if (storeSearch.trim()) {
      unregs.push(
        registerBackHandler('store_search', 40, () => {
          setStoreSearch('');
          return true;
        })
      );
    }

    return () => {
      unregs.forEach((u) => u());
    };
  }, [isReportModalOpen, activeCategoryFilter, storeSearch]);

  // Close report dialog or store modal cleanly with Escape on desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (isReportModalOpen) {
        setIsReportModalOpen(false);
        return;
      }
      if (!dispatchBackButton()) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isReportModalOpen, onClose]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleShareStore = () => {
    const url = `${window.location.origin}?store=${store.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
    showToast('🔗 Tautan toko berhasil disalin ke clipboard!');
  };

  const handleSubmitReport = () => {
    setIsReportModalOpen(false);
    showToast(`🚩 Laporan terhadap toko "${store.name}" berhasil dikirim ke tim SERA.`);
  };

  const handleWhatsAppChat = () => {
    const waUrl = `https://wa.me/${store.whatsapp}?text=Halo%20${encodeURIComponent(store.name)},%20saya%20melihat%20toko%20Anda%20di%20SERA%20Market.`;
    window.open(waUrl, '_blank');
  };

  const renderTabContent = (tab: StoreTab) => {
    if (tab === 'PRODUK') {
      return (
        <StoreProductsTabPane
          isOpen={store.isOpen}
          stickyTop={headerHeights.tabs}
          filteredStoreItems={filteredStoreItems}
          sortBy={sortBy}
          onSelectSort={setSortBy}
          onPriceSortToggle={handlePriceSortToggle}
          priceSortLabel={getPriceSortLabel()}
          activeCategoryFilter={activeCategoryFilter}
          onClearCategoryFilter={() => setActiveCategoryFilter(null)}
          onSelectItem={onSelectItem}
          onAddToCart={onAddToCart}
        />
      );
    }

    if (tab === 'KATEGORI') {
      return (
        <StoreCategoriesTabPane
          isOpen={store.isOpen}
          categories={storeCategories}
          onSelectCategory={(catName) => {
            const produkEl = paneRefs.current.PRODUK;
            if (produkEl) {
              isSyncingScrollRef.current = true;
              produkEl.scrollTop = collapseOffsetRef.current;
              requestAnimationFrame(() => {
                isSyncingScrollRef.current = false;
              });
            }
            setActiveCategoryFilter(catName);
            handleTabChange('PRODUK');
          }}
        />
      );
    }

    return <StoreAboutTabPane store={store} onWhatsAppChat={handleWhatsAppChat} />;
  };

  return (
    <div className="store-modal-overlay" onClick={onClose}>
      <div className="store-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Dynamic Header Bar */}
        <StoreHeader
          storeSearch={storeSearch}
          onSearchChange={setStoreSearch}
          onClearSearch={() => setStoreSearch('')}
          cartCount={cartCount}
          onOpenCart={onOpenCart}
          onBack={() => {
            if (dispatchBackButton()) return;
            onClose();
          }}
          onShareStore={handleShareStore}
          onOpenReport={() => setIsReportModalOpen(true)}
        />

        {/* Fixed-height ViewPager body + GPU-composited translate3d Banner/Tabs overlay (zero reflow) */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Native CSS Scroll-Snap ViewPager Container (120 FPS Pure GPU Composited) */}
          <div
            ref={pagerRef}
            onScroll={handlePagerScroll}
            className="viewpager-container no-scrollbar"
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'row',
              overflowX: 'auto',
              overflowY: 'hidden',
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              overscrollBehaviorX: 'contain',
            }}
          >
            {STORE_TABS.map((tabKey) => (
              <div
                key={tabKey}
                ref={(el) => {
                  paneRefs.current[tabKey] = el;
                }}
                onScroll={(e) => handlePaneScroll(tabKey, e)}
                className="viewpager-pane"
                style={{
                  flex: '0 0 100%',
                  width: '100%',
                  minWidth: '100%',
                  maxWidth: '100%',
                  height: '100%',
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  WebkitOverflowScrolling: 'touch',
                  overscrollBehaviorY: 'contain',
                  scrollSnapAlign: 'start',
                  scrollSnapStop: 'always',
                  boxSizing: 'border-box',
                }}
              >
                {/* Reserve space for overlay header & guarantee full banner collapse range on short panes */}
                <div
                  style={{
                    paddingTop: `${headerHeights.banner + headerHeights.tabs}px`,
                    minHeight: `calc(100% + ${headerHeights.banner}px)`,
                    boxSizing: 'border-box',
                  }}
                >
                  {renderTabContent(tabKey)}
                </div>
              </div>
            ))}
          </div>

          {/* Floating GPU Header Overlay: Banner (passthrough touches) + Pinned Tabs Bar */}
          <div
            ref={headerOverlayRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 28,
              pointerEvents: 'none',
              willChange: 'transform',
              transform: 'translate3d(0, 0px, 0)',
            }}
          >
            <div ref={bannerRef}>
              <StoreProfileBanner store={store} />
            </div>

            {/* Store Segmented Capsule Tabs Bar (Toko | Produk | Kategori) */}
            <div
              ref={tabsRef}
              className="store-tabs-bar"
              onWheel={(e) => {
                const activeEl = paneRefs.current[activeTab];
                if (activeEl && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                  activeEl.scrollTop += e.deltaY;
                }
              }}
              style={{
                pointerEvents: 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-surface, #FFFFFF)',
                borderBottom: '1px solid var(--border-light)',
                padding: '6px 16px',
                height: 'auto',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  maxWidth: '380px',
                  background: 'var(--bg-subtle, #F1F5F9)',
                  borderRadius: 'var(--radius-full, 9999px)',
                  padding: '3px',
                  border: '1px solid var(--border-color, #E2E8F0)',
                  boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.04)',
                }}
              >
                {(['TOKO', 'PRODUK', 'KATEGORI'] as const).map((tab) => {
                  const isActive = activeTab === tab;
                  const label = tab === 'TOKO' ? 'Toko' : tab === 'PRODUK' ? 'Produk' : 'Kategori';
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => handleTabChange(tab)}
                      style={{
                        flex: 1,
                        padding: '6px 0',
                        fontSize: '0.82rem',
                        fontWeight: isActive ? 700 : 500,
                        borderRadius: 'var(--radius-full, 9999px)',
                        border: 'none',
                        background: isActive ? 'var(--bg-surface, #FFFFFF)' : 'transparent',
                        color: isActive ? 'var(--text-main, #0F172A)' : 'var(--text-muted, #64748B)',
                        cursor: 'pointer',
                        boxShadow: isActive
                          ? '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)'
                          : 'none',
                        transition: 'all 0.18s ease',
                        userSelect: 'none',
                        textAlign: 'center',
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* In-Modal Toast Notification */}
        {toastMessage && (
          <div
            style={{
              position: 'absolute',
              bottom: '24px',
              left: 0,
              right: 0,
              margin: '0 auto',
              width: 'fit-content',
              maxWidth: 'calc(100% - 32px)',
              background: 'rgba(15, 23, 42, 0.95)',
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: '0.8rem',
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
              zIndex: 60,
              boxSizing: 'border-box',
              textAlign: 'center',
              animation: 'fadeIn 0.2s ease',
              pointerEvents: 'none',
            }}
          >
            {toastMessage}
          </div>
        )}

        {/* Interactive Report Store Dialog */}
        <StoreReportModal
          isOpen={isReportModalOpen}
          storeName={store.name}
          onClose={() => setIsReportModalOpen(false)}
          onSubmit={handleSubmitReport}
        />
      </div>
    </div>
  );
};
