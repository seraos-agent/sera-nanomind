import { useState, useMemo } from 'react';
import type { MarketplaceItem } from '../../types';
import { type StoreSortBy, type StoreCategoryItem } from './types';

export function useStoreFilters(items: MarketplaceItem[]) {
  const [storeSearch, setStoreSearch] = useState('');
  const [sortBy, setSortBy] = useState<StoreSortBy>('populer');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string | null>(null);

  const storeCategories: StoreCategoryItem[] = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((i) => {
      const cat = i.category || 'Lainnya';
      map.set(cat, (map.get(cat) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [items]);

  const filteredStoreItems = useMemo(() => {
    let list = [...items];

    if (activeCategoryFilter) {
      list = list.filter((i) => (i.category || '').toLowerCase() === activeCategoryFilter.toLowerCase());
    }

    if (storeSearch.trim()) {
      const q = storeSearch.toLowerCase().trim();
      list = list.filter((i) => {
        if (!i) return false;
        return Boolean(
          (i.name && i.name.toLowerCase().includes(q)) ||
          (i.description && i.description.toLowerCase().includes(q)) ||
          (i.category && i.category.toLowerCase().includes(q)) ||
          (Array.isArray(i.tags) && i.tags.some((t) => typeof t === 'string' && t.toLowerCase().includes(q)))
        );
      });
    }

    if (sortBy === 'populer') {
      list.sort((a, b) => (b.soldCount || 0) * (b.rating || 0) - (a.soldCount || 0) * (a.rating || 0));
    } else if (sortBy === 'terbaru') {
      list.sort((a, b) => (b.id || '').localeCompare(a.id || ''));
    } else if (sortBy === 'terlaris') {
      list.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
    } else if (sortBy === 'harga_asc') {
      list.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === 'harga_desc') {
      list.sort((a, b) => (b.price || 0) - (a.price || 0));
    }

    return list;
  }, [items, activeCategoryFilter, storeSearch, sortBy]);

  const handlePriceSortToggle = () => {
    if (sortBy === 'harga_asc') {
      setSortBy('harga_desc');
    } else {
      setSortBy('harga_asc');
    }
  };

  const getPriceSortLabel = () => {
    if (sortBy === 'harga_asc') return 'Harga ↑';
    if (sortBy === 'harga_desc') return 'Harga ↓';
    return 'Harga ↕';
  };

  return {
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
  };
}

