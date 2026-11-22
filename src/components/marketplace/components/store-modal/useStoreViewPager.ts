import { useState, useRef, useCallback, useEffect } from 'react';
import { type StoreTab, STORE_TABS } from './types';

export function useStoreViewPager() {
  const [activeTab, setActiveTab] = useState<StoreTab>('PRODUK');
  const pagerRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScrollRef = useRef(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePagerScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      if (isProgrammaticScrollRef.current) return;
      const container = e.currentTarget;
      const width = container.clientWidth;
      if (!width) return;
      const scrollLeft = container.scrollLeft;
      const pageIndex = Math.round(scrollLeft / width);
      const newTab = STORE_TABS[pageIndex];
      if (newTab && newTab !== activeTab) {
        setActiveTab(newTab);
      }
    },
    [activeTab]
  );

  const handleTabChange = useCallback((t: StoreTab) => {
    setActiveTab(t);
    const targetIdx = STORE_TABS.indexOf(t);
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

  // Initial mount alignment
  useEffect(() => {
    const targetIdx = STORE_TABS.indexOf(activeTab);
    if (targetIdx > 0 && pagerRef.current) {
      pagerRef.current.scrollLeft = targetIdx * pagerRef.current.clientWidth;
    }
  }, []);

  // Screen resize alignment
  useEffect(() => {
    const handleResize = () => {
      const targetIdx = STORE_TABS.indexOf(activeTab);
      if (targetIdx !== -1 && pagerRef.current) {
        pagerRef.current.scrollLeft = targetIdx * pagerRef.current.clientWidth;
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeTab]);

  return {
    activeTab,
    pagerRef,
    handlePagerScroll,
    handleTabChange,
  };
}

