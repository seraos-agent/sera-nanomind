import { useState } from 'react';
import type { MarketplaceOrder } from '../../types';
import { getMarketApiUrl } from '../../utils/api';
import type { ReviewedItemRecord } from './types';

export function useCartReviews(showToast: (msg: string) => void) {
  const [writingReviewKey, setWritingReviewKey] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewPhotos, setReviewPhotos] = useState<string[]>([]);
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);

  const [reviewedItems, setReviewedItems] = useState<Record<string, ReviewedItemRecord>>(() => {
    try {
      const saved = localStorage.getItem('sera_reviewed_items');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const handleStartReview = (orderId: string, itemId: string) => {
    const key = `${orderId}_${itemId}`;
    setWritingReviewKey(key);
    setReviewRating(5);
    setReviewComment('');
    setReviewPhotos([]);
  };

  const handleCancelReview = () => {
    setWritingReviewKey(null);
    setReviewComment('');
    setReviewPhotos([]);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file.size > 5 * 1024 * 1024) {
      showToast('Maximum photo size is 5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setReviewPhotos([reader.result as string]); // Max 1 photo per user spec
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemovePhoto = () => {
    setReviewPhotos([]);
  };

  const handleSubmitReview = async (
    order: MarketplaceOrder,
    item: any,
    onReviewSubmitted?: () => void
  ) => {
    if (!reviewComment.trim()) {
      showToast('Please write your review or rating comment.');
      return;
    }
    if (reviewComment.trim().length > 220) {
      showToast('Review maximum length is 220 characters.');
      return;
    }

    const author =
      (order.customer?.name || localStorage.getItem('sera_customer_name') || '').trim() ||
      'Buyer';

    const itemId = item.itemId || item.id;
    const reviewKey = `${order.id}_${itemId}`;

    try {
      setIsSubmittingReview(true);
      const res = await fetch(getMarketApiUrl('/api/market/reviews'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: order.storeId,
          itemId: itemId,
          itemName: item.name,
          customerName: author,
          rating: reviewRating,
          comment: reviewComment.trim(),
          orderId: order.id,
          variant: item.variant || item.selectedVariant?.name,
          photos: reviewPhotos.length > 0 ? reviewPhotos : undefined,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to submit review to server');
      }

      const nextReviewed = {
        ...reviewedItems,
        [reviewKey]: {
          rating: reviewRating,
          comment: reviewComment.trim(),
          photos: reviewPhotos,
          date: Date.now(),
        },
      };

      setReviewedItems(nextReviewed);
      localStorage.setItem('sera_reviewed_items', JSON.stringify(nextReviewed));

      showToast('✓ Review published successfully!');
      handleCancelReview();
      if (onReviewSubmitted) onReviewSubmitted();
    } catch (err: any) {
      showToast(`Failed: ${err.message}`);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return {
    writingReviewKey,
    reviewRating,
    setReviewRating,
    reviewComment,
    setReviewComment,
    reviewPhotos,
    isSubmittingReview,
    reviewedItems,
    handleStartReview,
    handleCancelReview,
    handlePhotoUpload,
    handleRemovePhoto,
    handleSubmitReview,
  };
}

