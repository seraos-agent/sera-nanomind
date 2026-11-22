import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { MarketplaceItem, MarketplaceStore, MarketplaceOrder, MarketplaceFilterTab, CartItem } from './types';
import { Navbar } from './components/Navbar';
import { MarketplaceTabBody } from './components/MarketplaceTabGrid';
import { ItemDetailModal } from './components/ItemDetailModal';
import { StoreModal } from './components/StoreModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { SellerOnboardingModal } from './components/SellerOnboardingModal';
import { UserAuthModal } from './components/UserAuthModal';
import { useMarketplaceData } from './hooks/useMarketplaceData';
import { useMarketplaceCart } from './hooks/useMarketplaceCart';
import { filterAndSortItems, filterAndSortStores } from './utils/marketplaceFilters';
import { registerBackHandler, dispatchBackButton } from '../../utils/backButton';
import type { ThemeType } from '../../theme';
import './marketplace.css';

export interface MarketplacePageProps {
  theme?: ThemeType;
  isMobileView?: boolean;
  userEmail?: string | null;
  onBack?: () => void;
  onNavigateToMerchant?: () => void;
  onNavigateToDriver?: () => void;
  onNavigateToProfile?: () => void;
}

const TABS: MarketplaceFilterTab[] = ['STORE', 'FOOD', 'SERVICE'];
const PAGE_BATCH_SIZE = 24;

const INITIAL_VISIBLE_COUNTS: Record<MarketplaceFilterTab, number> = {
  ALL: PAGE_BATCH_SIZE,
  STORE: PAGE_BATCH_SIZE,
  FOOD: PAGE_BATCH_SIZE,
  SERVICE: PAGE_BATCH_SIZE,
};

const INITIAL_ACTIVE_CATEGORIES: Record<MarketplaceFilterTab, string | null> = {
  ALL: null,
  STORE: null,
  FOOD: null,
  SERVICE: null,
};

function parseMarketplaceTabParam(): MarketplaceFilterTab | null {
  if (typeof window === 'undefined') return null;
  const raw = new URLSearchParams(window.location.search).get('tab');
  if (!raw) return null;
  const normalized = raw.trim().toUpperCase();
  if (normalized === 'FOOD' || normalized === 'MAKANAN' || normalized === 'KULINER') return 'FOOD';
  if (normalized === 'SERVICE' || normalized === 'JASA' || normalized === 'LAYANAN') return 'SERVICE';
  if (normalized === 'STORE' || normalized === 'GOODS' || normalized === 'TOKO' || normalized === 'BARANG') return 'STORE';
  return null;
}

export function MarketplacePage({
  theme,
  isMobileView: _isMobileView,
  userEmail: _userEmail,
  onBack,
  onNavigateToMerchant,
  onNavigateToDriver: _onNavigateToDriver,
  onNavigateToProfile,
}: MarketplacePageProps) {
  const isDark = theme?.isDark ?? false;

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 2800);
  }, []);

  const {
    items,
    setItems,
    stores,
    setStores,
    isLoading,
    hasMore,
    loadMoreProducts,
    fetchStoreProducts,
    searchRemoteProducts,
  } = useMarketplaceData();
  const {
    cart,
    customerOrders,
    addToCart,
    updateQuantity,
    removeItem,
    removePurchasedItems,
    completeOrder,
    totalCartCount,
    addOrder,
  } = useMarketplaceCart(showToast);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<MarketplaceFilterTab>(() => parseMarketplaceTabParam() || 'FOOD');
  const [activeCategoryByTab, setActiveCategoryByTab] = useState<Record<MarketplaceFilterTab, string | null>>(
    INITIAL_ACTIVE_CATEGORIES
  );
  const [sortBy, setSortBy] = useState<'popular' | 'price_asc' | 'price_desc' | 'rating'>('popular');
  const [searchTarget, setSearchTarget] = useState<'STORE' | 'PRODUCT'>('PRODUCT');
  const [openSortTab, setOpenSortTab] = useState<MarketplaceFilterTab | null>(null);
  const [visibleCountByTab, setVisibleCountByTab] = useState<Record<MarketplaceFilterTab, number>>(
    INITIAL_VISIBLE_COUNTS
  );
  const tabPaneRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const productScrollByTabRef = useRef<Record<string, number>>({});
  const productVisibleByTabRef = useRef<Record<string, number>>({});
  const prevSearchTargetRef = useRef<'STORE' | 'PRODUCT'>(searchTarget);

  useEffect(() => {
    setVisibleCountByTab({ ...INITIAL_VISIBLE_COUNTS });
  }, [searchQuery, sortBy]);

  useEffect(() => {
    const prevTarget = prevSearchTargetRef.current;
    if (prevTarget === searchTarget) return;
    prevSearchTargetRef.current = searchTarget;

    const pane = tabPaneRefs.current[selectedType];
    if (searchTarget === 'STORE') {
      productVisibleByTabRef.current[selectedType] = visibleCountByTab[selectedType];
      if (pane) {
        productScrollByTabRef.current[selectedType] = pane.scrollTop;
        pane.scrollTop = 0;
      }
      setVisibleCountByTab((prev) => ({ ...prev, [selectedType]: PAGE_BATCH_SIZE }));
    } else {
      const savedVisible = productVisibleByTabRef.current[selectedType] || PAGE_BATCH_SIZE;
      const savedScroll = productScrollByTabRef.current[selectedType] || 0;
      setVisibleCountByTab((prev) => ({ ...prev, [selectedType]: savedVisible }));
      if (pane) {
        requestAnimationFrame(() => {
          pane.scrollTop = savedScroll;
        });
      }
    }
  }, [searchTarget, selectedType, visibleCountByTab]);

  const handleSelectCategoryForTab = useCallback((tab: MarketplaceFilterTab, cat: string | null) => {
    setActiveCategoryByTab((prev) => ({ ...prev, [tab]: cat }));
    setVisibleCountByTab((prev) => ({ ...prev, [tab]: PAGE_BATCH_SIZE }));
  }, []);

  const handleLoadMoreForTab = useCallback((tab: MarketplaceFilterTab) => {
    setVisibleCountByTab((prev) => ({ ...prev, [tab]: prev[tab] + PAGE_BATCH_SIZE }));
    if (hasMore) {
      void loadMoreProducts();
    }
  }, [hasMore, loadMoreProducts]);

  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) return;
    const timer = setTimeout(() => {
      void searchRemoteProducts(trimmed);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchRemoteProducts]);

  const [detailItem, setDetailItem] = useState<MarketplaceItem | null>(null);
  const [storeModalTarget, setStoreModalTarget] = useState<MarketplaceStore | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartDrawerTab, setCartDrawerTab] = useState<'CART' | 'PROCESSING' | 'COMPLETED'>('CART');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);
  const [confirmedOrder, setConfirmedOrder] = useState<MarketplaceOrder | null>(null);
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    const handleDeepLink = (e: Event) => {
      const customEvent = e as CustomEvent<{ tab?: 'CART' | 'PROCESSING' | 'COMPLETED'; orderId?: string }>;
      const tab = customEvent.detail?.tab || 'PROCESSING';
      setCartDrawerTab(tab);
      setIsCartOpen(true);
      setDetailItem(null);
      setStoreModalTarget(null);
      setIsCheckoutOpen(false);
      setConfirmedOrder(null);
      setIsSellerModalOpen(false);
      setIsProfileModalOpen(false);
    };
    window.addEventListener('sera:marketplace-deep-link', handleDeepLink);
    return () => window.removeEventListener('sera:marketplace-deep-link', handleDeepLink);
  }, []);

  useEffect(() => {
    const unregs: Array<() => void> = [];

    if (confirmedOrder) {
      unregs.push(registerBackHandler('market_confirmed', 80, () => {
        setConfirmedOrder(null);
        return true;
      }));
    }
    if (isCheckoutOpen) {
      unregs.push(registerBackHandler('market_checkout', 70, () => {
        setIsCheckoutOpen(false);
        setIsCartOpen(true);
        return true;
      }));
    }
    if (isCartOpen) {
      unregs.push(registerBackHandler('market_cart', 60, () => {
        setIsCartOpen(false);
        return true;
      }));
    }
    if (detailItem) {
      unregs.push(registerBackHandler('market_item_detail', 50, () => {
        setDetailItem(null);
        return true;
      }));
    }
    if (storeModalTarget) {
      unregs.push(registerBackHandler('market_store_detail', 45, () => {
        setStoreModalTarget(null);
        return true;
      }));
    }
    if (isSellerModalOpen) {
      unregs.push(registerBackHandler('market_seller', 40, () => {
        setIsSellerModalOpen(false);
        return true;
      }));
    }
    if (isProfileModalOpen) {
      unregs.push(registerBackHandler('market_profile', 40, () => {
        setIsProfileModalOpen(false);
        return true;
      }));
    }
    if (searchQuery.trim()) {
      unregs.push(registerBackHandler('market_search', 30, () => {
        setSearchQuery('');
        return true;
      }));
    }

    return () => {
      unregs.forEach(u => u());
    };
  }, [
    confirmedOrder,
    isCheckoutOpen,
    isCartOpen,
    detailItem,
    storeModalTarget,
    isSellerModalOpen,
    isProfileModalOpen,
    searchQuery,
  ]);

  const handleMarketplaceBack = () => {
    if (dispatchBackButton()) return;
    if (confirmedOrder) {
      setConfirmedOrder(null);
      return;
    }
    if (isCheckoutOpen) {
      setIsCheckoutOpen(false);
      setIsCartOpen(true);
      return;
    }
    if (isCartOpen) {
      setIsCartOpen(false);
      return;
    }
    if (detailItem) {
      setDetailItem(null);
      return;
    }
    if (storeModalTarget) {
      setStoreModalTarget(null);
      return;
    }
    if (isSellerModalOpen) {
      setIsSellerModalOpen(false);
      return;
    }
    if (isProfileModalOpen) {
      setIsProfileModalOpen(false);
      return;
    }
    if (searchQuery.trim()) {
      setSearchQuery('');
      return;
    }
    if (onBack) {
      onBack();
    }
  };

  const clearQueryParam = useCallback((key: 'store' | 'item' | 'tab') => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (url.searchParams.has(key)) {
      url.searchParams.delete(key);
      window.history.replaceState({}, '', url.pathname + url.search + url.hash);
    }
  }, []);

  const syncFromUrlParams = useCallback(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const storeQuery = params.get('store');
    const itemQuery = params.get('item');
    const tabParam = parseMarketplaceTabParam();

    if (tabParam) {
      setSelectedType(tabParam);
      setActiveCategoryByTab((prev) => ({ ...prev, [tabParam]: null }));
      const targetIdx = TABS.indexOf(tabParam);
      if (targetIdx !== -1 && pagerRef.current) {
        pagerRef.current.scrollLeft = targetIdx * pagerRef.current.clientWidth;
      }
      clearQueryParam('tab');
    }

    if (storeQuery && stores.length > 0) {
      const found = stores.find(
        s => s.id === storeQuery || (s.name && s.name.toLowerCase() === storeQuery.toLowerCase())
      );
      if (found) {
        setStoreModalTarget(found);
      }
    }
    if (itemQuery && items.length > 0) {
      const foundItem = items.find(i => i.id === itemQuery);
      if (foundItem) {
        setDetailItem(foundItem);
      }
    }
  }, [stores, items, clearQueryParam]);

  useEffect(() => {
    syncFromUrlParams();
  }, [syncFromUrlParams]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.addEventListener('sera:open-marketplace', syncFromUrlParams);
    window.addEventListener('popstate', syncFromUrlParams);
    return () => {
      window.removeEventListener('sera:open-marketplace', syncFromUrlParams);
      window.removeEventListener('popstate', syncFromUrlParams);
    };
  }, [syncFromUrlParams]);

  const filteredItemsByTab = useMemo(() => ({
    STORE: filterAndSortItems(items, 'STORE', searchQuery, activeCategoryByTab.STORE, sortBy, stores),
    FOOD: filterAndSortItems(items, 'FOOD', searchQuery, activeCategoryByTab.FOOD, sortBy, stores),
    SERVICE: filterAndSortItems(items, 'SERVICE', searchQuery, activeCategoryByTab.SERVICE, sortBy, stores),
  }), [items, searchQuery, activeCategoryByTab, sortBy, stores]);

  const filteredStoresByTab = useMemo(() => ({
    STORE: filterAndSortStores(stores, 'STORE', searchQuery, sortBy, activeCategoryByTab.STORE),
    FOOD: filterAndSortStores(stores, 'FOOD', searchQuery, sortBy, activeCategoryByTab.FOOD),
    SERVICE: filterAndSortStores(stores, 'SERVICE', searchQuery, sortBy, activeCategoryByTab.SERVICE),
  }), [stores, searchQuery, sortBy, activeCategoryByTab]);

  const pagerRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScrollRef = useRef(false);
  const scrollTimeoutRef = useRef<any>(null);

  const handlePagerScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (isProgrammaticScrollRef.current) return;
    const container = e.currentTarget;
    const width = container.clientWidth;
    if (!width) return;
    const scrollLeft = container.scrollLeft;
    const pageIndex = Math.round(scrollLeft / width);
    const newTab = TABS[pageIndex];
    if (newTab && newTab !== selectedType) {
      setSelectedType(newTab);
    }
  }, [selectedType]);

  const handleTypeChange = useCallback((t: MarketplaceFilterTab) => {
    setSelectedType(t);
    const targetIdx = TABS.indexOf(t);
    if (targetIdx !== -1 && pagerRef.current) {
      isProgrammaticScrollRef.current = true;
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      pagerRef.current.scrollTo({
        left: targetIdx * pagerRef.current.clientWidth,
        behavior: 'smooth',
      });
      scrollTimeoutRef.current = setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 450);
    }
  }, []);

  useEffect(() => {
    const syncInitialTabScroll = () => {
      const targetIdx = TABS.indexOf(selectedType);
      if (targetIdx > 0 && pagerRef.current) {
        pagerRef.current.scrollLeft = targetIdx * pagerRef.current.clientWidth;
      }
    };
    syncInitialTabScroll();
    const rafId = requestAnimationFrame(syncInitialTabScroll);
    return () => cancelAnimationFrame(rafId);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const targetIdx = TABS.indexOf(selectedType);
      if (targetIdx !== -1 && pagerRef.current) {
        pagerRef.current.scrollLeft = targetIdx * pagerRef.current.clientWidth;
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [selectedType]);

  const handleSelectStore = useCallback((storeId: string) => {
    const s = stores.find(str => str.id === storeId);
    if (s) {
      setStoreModalTarget(s);
      void fetchStoreProducts(s.id);
    }
  }, [stores, fetchStoreProducts]);

  const handleSelectItem = useCallback((selected: MarketplaceItem) => {
    setDetailItem(selected);
  }, []);

  const handleAddToCartItem = useCallback((it: MarketplaceItem) => {
    addToCart(it);
  }, [addToCart]);

  const handleToggleSortTab = useCallback((tab: MarketplaceFilterTab) => {
    setOpenSortTab(prev => (prev === tab ? null : tab));
  }, []);

  const handleCloseSortTab = useCallback(() => {
    setOpenSortTab(null);
  }, []);

  const handleStoreCreated = (newStore: MarketplaceStore, firstItem?: MarketplaceItem) => {
    setStores(prev => [newStore, ...prev]);
    if (firstItem) {
      setItems(prev => [firstItem, ...prev]);
    }
    showToast(`🎉 Store "${newStore.name}" is now open!`);
  };

  const storeModalItems = useMemo(() => {
    if (!storeModalTarget) return [];
    return items.filter(i => i.storeId === storeModalTarget.id);
  }, [items, storeModalTarget]);

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setActiveCategoryByTab((prev) => ({ ...prev, [selectedType]: null }));
    setVisibleCountByTab((prev) => ({ ...prev, [selectedType]: PAGE_BATCH_SIZE }));
  }, [selectedType]);

  const categoryHandlersByTab = useMemo(() => ({
    STORE: (cat: string | null) => handleSelectCategoryForTab('STORE', cat),
    FOOD: (cat: string | null) => handleSelectCategoryForTab('FOOD', cat),
    SERVICE: (cat: string | null) => handleSelectCategoryForTab('SERVICE', cat),
  }), [handleSelectCategoryForTab]);

  const loadMoreHandlersByTab = useMemo(() => ({
    STORE: () => handleLoadMoreForTab('STORE'),
    FOOD: () => handleLoadMoreForTab('FOOD'),
    SERVICE: () => handleLoadMoreForTab('SERVICE'),
  }), [handleLoadMoreForTab]);

  return (
    <div
      className={`marketplace-root ${isDark ? 'dark-mode' : ''}`}
      data-theme={isDark ? 'dark' : 'light'}
      style={{ width: '100%', height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
    >
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '80px',
            left: 0,
            right: 0,
            margin: '0 auto',
            width: 'fit-content',
            maxWidth: 'calc(100vw - 32px)',
            zIndex: 90,
            background: 'rgba(15, 23, 42, 0.95)',
            color: '#FFFFFF',
            fontWeight: 600,
            padding: '8px 16px',
            borderRadius: 'var(--radius-full)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.22)',
            fontSize: '0.80rem',
            boxSizing: 'border-box',
            textAlign: 'center',
            animation: 'fadeIn 0.2s ease',
            pointerEvents: 'none',
          }}
        >
          {toastMessage}
        </div>
      )}

      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedType={selectedType}
        onTypeChange={handleTypeChange}
        cartCount={totalCartCount}
        onOpenCart={() => {
          setCartDrawerTab('CART');
          setIsCartOpen(true);
        }}
        onOpenSellerModal={() => {
          if (onNavigateToMerchant) {
            onNavigateToMerchant();
          } else {
            setIsSellerModalOpen(true);
          }
        }}
        onOpenProfile={() => {
          if (onNavigateToProfile) {
            onNavigateToProfile();
          } else {
            setIsProfileModalOpen(true);
          }
        }}
        onBack={handleMarketplaceBack}
      />

      <div
        ref={pagerRef}
        onScroll={handlePagerScroll}
        className="marketplace-viewpager no-scrollbar"
        style={{
          flex: 1,
          width: '100%',
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
        {TABS.map(tabKey => (
          <div
            key={tabKey}
            ref={(el) => {
              tabPaneRefs.current[tabKey] = el;
            }}
            className="marketplace-tab-pane"
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
            <MarketplaceTabBody
              type={tabKey}
              selectedType={selectedType}
              activeCategory={activeCategoryByTab[tabKey]}
              onSelectCategory={categoryHandlersByTab[tabKey]}
              onShowToast={showToast}
              searchTarget={searchTarget}
              onSearchTargetChange={setSearchTarget}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              openSortTab={openSortTab}
              onToggleSortTab={handleToggleSortTab}
              onCloseSortTab={handleCloseSortTab}
              isLoading={isLoading}
              hasMore={hasMore}
              tabStores={filteredStoresByTab[tabKey]}
              tabItems={filteredItemsByTab[tabKey]}
              visibleCount={visibleCountByTab[tabKey]}
              onLoadMore={loadMoreHandlersByTab[tabKey]}
              onClearFilters={handleClearFilters}
              onSelectStore={handleSelectStore}
              onSelectItem={handleSelectItem}
              onAddToCart={handleAddToCartItem}
            />
          </div>
        ))}
      </div>

      {storeModalTarget && (
        <StoreModal
          store={stores.find(s => s.id === storeModalTarget.id) || storeModalTarget}
          items={storeModalItems}
          onClose={() => {
            setStoreModalTarget(null);
            clearQueryParam('store');
          }}
          onSelectItem={it => setDetailItem(it)}
          onAddToCart={it => addToCart(it)}
          cartCount={totalCartCount}
          onOpenCart={() => {
            setCartDrawerTab('CART');
            setIsCartOpen(true);
          }}
        />
      )}

      {detailItem && (
        <ItemDetailModal
          item={detailItem}
          store={stores.find(s => s.id === detailItem.storeId)}
          onClose={() => {
            setDetailItem(null);
            clearQueryParam('item');
          }}
          onAddToCart={(it, qty, variant, date, notes, selectedImage) => addToCart(it, qty, variant, date, notes, selectedImage)}
          onSelectStore={handleSelectStore}
        />
      )}

      <CartDrawer
        isOpen={isCartOpen}
        initialTab={cartDrawerTab}
        onClose={() => {
          setIsCartOpen(false);
          setCartDrawerTab('CART');
        }}
        items={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onRemoveSelectedItems={removePurchasedItems}
        onProceedToCheckout={(selectedItems) => {
          setCheckoutItems(selectedItems);
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        orders={customerOrders}
        onCompleteOrder={completeOrder}
      />

      {isCheckoutOpen && (
        <CheckoutModal
          items={checkoutItems.length > 0 ? checkoutItems : cart}
          theme={theme}
          onClose={() => setIsCheckoutOpen(false)}
          onSuccess={order => {
            setIsCheckoutOpen(false);
            addOrder(order);
            removePurchasedItems(checkoutItems.length > 0 ? checkoutItems : cart);
            setConfirmedOrder(order);
          }}
        />
      )}

      {confirmedOrder && (
        <OrderSuccessModal
          order={confirmedOrder}
          onClose={() => setConfirmedOrder(null)}
          onViewOrders={() => {
            setConfirmedOrder(null);
            setCartDrawerTab('PROCESSING');
            setIsCartOpen(true);
          }}
        />
      )}

      {isSellerModalOpen && (
        <SellerOnboardingModal
          onClose={() => setIsSellerModalOpen(false)}
          onStoreCreated={handleStoreCreated}
        />
      )}

      {isProfileModalOpen && (
        <UserAuthModal
          onClose={() => setIsProfileModalOpen(false)}
          onSuccess={u => {
            const displayName = u.email.split('@')[0] || u.phone;
            showToast(`👋 Welcome, ${displayName}! You have signed in.`);
          }}
        />
      )}
    </div>
  );
}

export default MarketplacePage;
