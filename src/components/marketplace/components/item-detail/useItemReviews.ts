import { useState, useEffect, useMemo } from 'react';
import type { MarketplaceItem } from '../../types';
import { getMarketApiUrl } from '../../utils/api';
import type { ReviewItem } from './types';
import { formatRelativeTime } from './types';

export function useItemReviews(item: MarketplaceItem, _isService: boolean) {
  const [realReviews, setRealReviews] = useState<ReviewItem[]>([]);
  const [selectedRatingFilter, setSelectedRatingFilter] = useState('All');

  useEffect(() => {
    let cancelled = false;
    setSelectedRatingFilter('All');

    const fetchProductReviews = async () => {
      try {
        const res = await fetch(getMarketApiUrl(`/api/market/reviews?itemId=${encodeURIComponent(item.id)}`));
        if (!res.ok) {
          if (!cancelled) setRealReviews([]);
          return;
        }
        const json = await res.json();
        if (cancelled) return;

        if (Array.isArray(json.data)) {
          const mapped: ReviewItem[] = json.data.map((r: any) => ({
            id: r.id,
            author: r.customerName || 'Customer',
            rating: r.rating || 5,
            date: formatRelativeTime(r.createdAt),
            avatarBg: '#EFF6FF',
            avatarColor: '#1D4ED8',
            comment: r.comment,
            variant: r.variant,
            photos: r.photos,
            reply: r.reply,
          }));
          setRealReviews(mapped);
        } else {
          setRealReviews([]);
        }
      } catch {
        if (!cancelled) setRealReviews([]);
      }
    };

    void fetchProductReviews();
    return () => {
      cancelled = true;
    };
  }, [item.id]);

  const allReviews: ReviewItem[] = realReviews;

  const reviewsWithPhotosCount = useMemo(() => {
    return allReviews.filter((r) => r.photos && r.photos.length > 0).length;
  }, [allReviews]);

  const filteredReviews = useMemo(() => {
    if (selectedRatingFilter === 'With Photos') {
      return allReviews.filter((r) => r.photos && r.photos.length > 0);
    }
    if (selectedRatingFilter === '★ 5') {
      return allReviews.filter((r) => r.rating >= 4.8);
    }
    if (selectedRatingFilter === '★ 4') {
      return allReviews.filter((r) => r.rating >= 3.8 && r.rating < 4.8);
    }
    if (selectedRatingFilter === '★ 3') {
      return allReviews.filter((r) => r.rating >= 2.8 && r.rating < 3.8);
    }
    if (selectedRatingFilter === '★ 2') {
      return allReviews.filter((r) => r.rating >= 1.8 && r.rating < 2.8);
    }
    if (selectedRatingFilter === '★ 1') {
      return allReviews.filter((r) => r.rating < 1.8);
    }
    return allReviews;
  }, [allReviews, selectedRatingFilter]);

  return {
    allReviews,
    reviewsWithPhotosCount,
    selectedRatingFilter,
    setSelectedRatingFilter,
    filteredReviews,
  };
}
