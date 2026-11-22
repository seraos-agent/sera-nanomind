import React, { useState } from 'react';
import type { CartItem, MarketplaceOrder } from '../types';
import type { CartTab } from './cart-drawer/types';
import { ArrowLeftIcon } from './Icons';
import { useCartViewPager } from './cart-drawer/useCartViewPager';
import { useCartReviews } from './cart-drawer/useCartReviews';
import { CartTabPane } from './cart-drawer/CartTabPane';
import { ProcessingOrdersTabPane } from './cart-drawer/ProcessingOrdersTabPane';
import { CompletedOrdersTabPane } from './cart-drawer/CompletedOrdersTabPane';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onRemoveSelectedItems?: (selectedItems: CartItem[]) => void;
  onProceedToCheckout: (selectedItems: CartItem[]) => void;
  orders?: MarketplaceOrder[];
  onCompleteOrder?: (orderId: string) => void;
  onReviewSubmitted?: () => void;
  initialTab?: CartTab;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onRemoveSelectedItems,
  onProceedToCheckout,
  orders = [],
  onCompleteOrder,
  onReviewSubmitted,
  initialTab = 'CART',
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ViewPager controller
  const { activeTab, pagerRef, handlePagerScroll, handleTabChange } = useCartViewPager(isOpen, initialTab);

  // Reviews controller
  const {
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
  } = useCartReviews(showToast);

  if (!isOpen) return null;

  const processingOrders = orders.filter(
    (o) => o.orderStatus !== 'COMPLETED' && o.orderStatus !== 'CANCELLED'
  );

  const completedOrders = orders.filter((o) => o.orderStatus === 'COMPLETED');

  const handleWhatsAppContact = (order: MarketplaceOrder) => {
    const waText = encodeURIComponent(
      `Hello *${order.storeName}*, I would like to check on the status of my order: *${order.id}*. Order total Rp ${order.totalAmount.toLocaleString('id-ID')}. Thank you!`
    );
    window.open(`https://wa.me/6281234567890?text=${waText}`, '_blank');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 85,
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          height: '100%',
          background: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-modal)',
          animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          position: 'relative',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Toast Notification */}
        {toastMessage && (
          <div
            style={{
              position: 'absolute',
              top: '64px',
              left: '16px',
              right: '16px',
              zIndex: 100,
              background: 'rgba(15, 23, 42, 0.95)',
              color: '#FFFFFF',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            {toastMessage}
          </div>
        )}

        {/* Clean Unified Top Header (Height 52px, matched with Marketplace Navbar & Store Header) */}
        <div
          style={{
            height: '52px',
            padding: '0 14px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            flexShrink: 0,
            background: 'var(--bg-surface)',
          }}
        >
          {/* Left: Matched Back Button + Clean Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <button
              type="button"
              onClick={onClose}
              aria-label="Back"
              title="Back"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: 'none',
                border: 'none',
                color: 'var(--text-main)',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--bg-subtle)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
            >
              <ArrowLeftIcon size={21} />
            </button>

            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                margin: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              Shopping Cart
            </h2>
          </div>

          {/* Right: Item Count Pill */}
          {items.length > 0 && activeTab === 'CART' && (
            <span
              style={{
                fontSize: '0.76rem',
                fontWeight: 700,
                color: 'var(--color-brand)',
                background: 'var(--color-brand-bg, rgba(37, 99, 235, 0.08))',
                border: '1px solid var(--color-brand-border, rgba(37, 99, 235, 0.2))',
                borderRadius: 'var(--radius-full, 9999px)',
                padding: '3px 9px',
                flexShrink: 0,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>{items.length} Items</span>
            </span>
          )}
        </div>

        {/* 3-Tab Segmented Capsule Switcher: [ Cart ] [ In Progress ] [ Completed ] */}
        <div
          style={{
            padding: '8px 14px',
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-light, #E2E8F0)',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              background: 'var(--bg-subtle, #F1F5F9)',
              borderRadius: 'var(--radius-full, 9999px)',
              padding: '3px',
              border: '1px solid var(--border-color, #E2E8F0)',
              boxSizing: 'border-box',
            }}
          >
            <button
              type="button"
              onClick={() => handleTabChange('CART')}
              style={{
                flex: 1,
                padding: '6px 4px',
                borderRadius: 'var(--radius-full, 9999px)',
                border: 'none',
                background: activeTab === 'CART' ? 'var(--bg-surface, #FFFFFF)' : 'transparent',
                color: activeTab === 'CART' ? 'var(--text-main, #0F172A)' : 'var(--text-muted, #64748B)',
                fontWeight: activeTab === 'CART' ? 700 : 500,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow:
                  activeTab === 'CART'
                    ? '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)'
                    : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                transition: 'all 0.18s ease',
              }}
            >
              <span>Cart</span>
              {items.length > 0 && (
                <span
                  style={{
                    background: activeTab === 'CART' ? 'var(--color-brand)' : 'var(--border-color)',
                    color: activeTab === 'CART' ? '#FFFFFF' : 'var(--text-muted)',
                    fontSize: '0.65rem',
                    borderRadius: '999px',
                    minWidth: 17,
                    height: 17,
                    padding: '0 4px',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxSizing: 'border-box',
                  }}
                >
                  {items.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('PROCESSING')}
              style={{
                flex: 1,
                padding: '6px 4px',
                borderRadius: 'var(--radius-full, 9999px)',
                border: 'none',
                background: activeTab === 'PROCESSING' ? 'var(--bg-surface, #FFFFFF)' : 'transparent',
                color: activeTab === 'PROCESSING' ? 'var(--text-main, #0F172A)' : 'var(--text-muted, #64748B)',
                fontWeight: activeTab === 'PROCESSING' ? 700 : 500,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow:
                  activeTab === 'PROCESSING'
                    ? '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)'
                    : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                transition: 'all 0.18s ease',
              }}
            >
              <span>In Progress</span>
              {processingOrders.length > 0 && (
                <span
                  style={{
                    background: activeTab === 'PROCESSING' ? '#F59E0B' : 'var(--border-color)',
                    color: activeTab === 'PROCESSING' ? '#FFFFFF' : 'var(--text-muted)',
                    fontSize: '0.65rem',
                    borderRadius: '999px',
                    minWidth: 17,
                    height: 17,
                    padding: '0 4px',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxSizing: 'border-box',
                  }}
                >
                  {processingOrders.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('COMPLETED')}
              style={{
                flex: 1,
                padding: '6px 4px',
                borderRadius: 'var(--radius-full, 9999px)',
                border: 'none',
                background: activeTab === 'COMPLETED' ? 'var(--bg-surface, #FFFFFF)' : 'transparent',
                color: activeTab === 'COMPLETED' ? 'var(--text-main, #0F172A)' : 'var(--text-muted, #64748B)',
                fontWeight: activeTab === 'COMPLETED' ? 700 : 500,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow:
                  activeTab === 'COMPLETED'
                    ? '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)'
                    : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                transition: 'all 0.18s ease',
              }}
            >
              <span>Completed</span>
            </button>
          </div>
        </div>

        {/* Native CSS Scroll-Snap ViewPager Container (120 FPS Pure GPU Composited) */}
        <div
          ref={pagerRef}
          onScroll={handlePagerScroll}
          className="viewpager-container no-scrollbar"
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
          {/* TAB 1: KERANJANG AKTIF */}
          <CartTabPane
            items={items}
            onUpdateQuantity={onUpdateQuantity}
            onRemoveItem={onRemoveItem}
            onRemoveSelectedItems={onRemoveSelectedItems}
            onProceedToCheckout={onProceedToCheckout}
            onToast={showToast}
          />

          {/* TAB 2: PROSES PESANAN */}
          <ProcessingOrdersTabPane
            orders={processingOrders}
            onCompleteOrder={onCompleteOrder}
            onWhatsAppContact={handleWhatsAppContact}
          />

          {/* TAB 3: SELESAI & BERI ULASAN */}
          <CompletedOrdersTabPane
            orders={completedOrders}
            reviewedItems={reviewedItems}
            writingReviewKey={writingReviewKey}
            reviewRating={reviewRating}
            reviewComment={reviewComment}
            reviewPhotos={reviewPhotos}
            isSubmittingReview={isSubmittingReview}
            onStartReview={handleStartReview}
            onCancelReview={handleCancelReview}
            onChangeRating={setReviewRating}
            onChangeComment={setReviewComment}
            onPhotoUpload={handlePhotoUpload}
            onRemovePhoto={handleRemovePhoto}
            onSubmitReview={(ord, it) => handleSubmitReview(ord, it, onReviewSubmitted)}
          />
        </div>
      </div>
    </div>
  );
};
