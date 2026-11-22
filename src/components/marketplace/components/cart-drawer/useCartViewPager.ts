import { useState, useRef, useCallback, useEffect } from 'react';
import { type CartTab, CART_TABS } from './types';

export function useCartViewPager(isOpen: boolean, initialTab: CartTab = 'CART') {
  const [activeTab, setActiveTab] = useState<CartTab>(initialTab);
  const pagerRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScrollRef = useRef(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePagerScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (isProgrammaticScrollRef.current) return;
    const container = e.currentTarget;
    const width = container.clientWidth;
    if (!width) return;
    const scrollLeft = container.scrollLeft;
    const pageIndex = Math.round(scrollLeft / width);
    const newTab = CART_TABS[pageIndex];
    if (newTab && newTab !== activeTab) {
      setActiveTab(newTab);
    }
  }, [activeTab]);

  const handleTabChange = useCallback((t: CartTab) => {
    setActiveTab(t);
    const targetIdx = CART_TABS.indexOf(t);
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

  // Sync scroll on open or when initialTab changes
  useEffect(() => {
    if (isOpen) {
      if (initialTab && initialTab !== activeTab) {
        setActiveTab(initialTab);
      }
      const targetTab = initialTab || activeTab;
      const targetIdx = CART_TABS.indexOf(targetTab);
      if (targetIdx >= 0 && pagerRef.current) {
        requestAnimationFrame(() => {
          if (pagerRef.current) {
            pagerRef.current.scrollLeft = targetIdx * pagerRef.current.clientWidth;
          }
        });
      }
    }
  }, [isOpen, initialTab]);

  // Sync scroll on window resize
  useEffect(() => {
    if (!isOpen) return;
    const handleResize = () => {
      const targetIdx = CART_TABS.indexOf(activeTab);
      if (targetIdx !== -1 && pagerRef.current) {
        pagerRef.current.scrollLeft = targetIdx * pagerRef.current.clientWidth;
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, activeTab]);

  return {
    activeTab,
    pagerRef,
    handlePagerScroll,
    handleTabChange,
  };
}
