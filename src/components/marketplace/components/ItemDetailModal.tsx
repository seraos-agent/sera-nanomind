import React, { useState, useEffect } from 'react';
import type { MarketplaceItem, MarketplaceStore } from '../types';
import { WhatsAppIcon } from './Icons';
import { registerBackHandler, dispatchBackButton } from '../../../utils/backButton';
import { ItemDetailGallery } from './item-detail/ItemDetailGallery';
import { ItemStoreCard } from './item-detail/ItemStoreCard';
import { ItemDetailReviewsTab } from './item-detail/ItemDetailReviewsTab';
import { ItemAllReviewsModal } from './item-detail/ItemAllReviewsModal';
import { ItemDetailReportModal } from './item-detail/ItemDetailReportModal';
import { ItemDetailLightbox } from './item-detail/ItemDetailLightbox';
import { ItemOrderControls } from './item-detail/ItemOrderControls';
import { useItemReviews } from './item-detail/useItemReviews';

interface ItemDetailModalProps {
  item: MarketplaceItem;
  store?: MarketplaceStore;
  onClose: () => void;
  onAddToCart: (
    item: MarketplaceItem,
    quantity: number,
    selectedVariant?: { name: string; price: number },
    bookingDate?: string,
    notes?: string,
    selectedImage?: string
  ) => void;
  onSelectStore: (storeId: string) => void;
}

const MoreVerticalIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.1"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'block' }}
  >
    <circle cx="12" cy="12" r="1.5" />
    <circle cx="12" cy="5" r="1.5" />
    <circle cx="12" cy="19" r="1.5" />
  </svg>
);

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  store,
  onClose,
  onAddToCart,
  onSelectStore,
}) => {
  const isService = item.type === 'SERVICE';
  const [selectedImage, setSelectedImage] = useState(item.images[0]);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(item.variants ? item.variants[0] : undefined);
  const [bookingDate, setBookingDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return `${tomorrow.toISOString().split('T')[0]} 10:00`;
  });
  const [customerNotes, setCustomerNotes] = useState('');
  const [activeInfoTab, setActiveInfoTab] = useState<'DESKRIPSI' | 'ULASAN'>('DESKRIPSI');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAllReviewsModalOpen, setIsAllReviewsModalOpen] = useState(false);
  const [previewReviewPhoto, setPreviewReviewPhoto] = useState<string | null>(null);

  // Reviews hook
  const {
    allReviews,
    reviewsWithPhotosCount,
    selectedRatingFilter,
    setSelectedRatingFilter,
    filteredReviews,
  } = useItemReviews(item, isService);

  // LIFO Back Button Stack for Sub-modals inside ItemDetailModal
  useEffect(() => {
    const unregs: Array<() => void> = [];

    if (previewReviewPhoto) {
      unregs.push(
        registerBackHandler('detail_photo_lightbox', 95, () => {
          setPreviewReviewPhoto(null);
          return true;
        })
      );
    }
    if (isReportModalOpen) {
      unregs.push(
        registerBackHandler('detail_report_modal', 90, () => {
          setIsReportModalOpen(false);
          return true;
        })
      );
    }
    if (isAllReviewsModalOpen) {
      unregs.push(
        registerBackHandler('detail_reviews_modal', 85, () => {
          setIsAllReviewsModalOpen(false);
          return true;
        })
      );
    }
    if (isMenuOpen) {
      unregs.push(
        registerBackHandler('detail_menu', 75, () => {
          setIsMenuOpen(false);
          return true;
        })
      );
    }

    return () => {
      unregs.forEach((u) => u());
    };
  }, [previewReviewPhoto, isReportModalOpen, isAllReviewsModalOpen, isMenuOpen]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleShareProduct = () => {
    const url = `${window.location.origin}?item=${item.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
    showToast('🔗 Product link copied to clipboard!');
    setIsMenuOpen(false);
  };

  const handleOpenReport = () => {
    setIsMenuOpen(false);
    setIsReportModalOpen(true);
  };

  const handleSubmitReport = (reason: string) => {
    setIsReportModalOpen(false);
    showToast(`🚩 Report "${reason}" submitted to the SERA team.`);
  };

  const currentPrice = selectedVariant ? selectedVariant.price : item.price;
  const totalPrice = currentPrice * quantity;

  const handleWhatsAppChat = () => {
    const waNumber = store?.whatsapp || '6281234567891';
    const text = encodeURIComponent(
      `Hello ${item.storeName}, I am interested in "${item.name}" (Rp ${item.price.toLocaleString('id-ID')}). Is it still available?`
    );
    window.open(`https://wa.me/${waNumber}?text=${text}`, '_blank');
  };

  const handleAction = () => {
    onAddToCart(
      item,
      quantity,
      selectedVariant,
      isService ? bookingDate : undefined,
      customerNotes || undefined,
      selectedImage
    );
    onClose();
  };

  const renderPopoverMenu = () => (
    <>
      <div onClick={() => setIsMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
      <div
        style={{
          position: 'absolute',
          top: '38px',
          right: 0,
          width: '180px',
          background: 'var(--bg-card, #FFFFFF)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.14)',
          zIndex: 50,
          padding: '6px',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          animation: 'fadeIn 0.15s ease',
        }}
      >
        <button
          onClick={handleShareProduct}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 12px',
            borderRadius: '8px',
            border: 'none',
            background: 'none',
            color: 'var(--text-main)',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            textAlign: 'left',
            width: '100%',
            transition: 'background 0.12s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-subtle)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
        >
          <span>🔗</span>
          <span>Share Product</span>
        </button>

        <button
          onClick={handleOpenReport}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 12px',
            borderRadius: '8px',
            border: 'none',
            background: 'none',
            color: '#DC2626',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            textAlign: 'left',
            width: '100%',
            transition: 'background 0.12s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(220, 38, 38, 0.1)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
        >
          <span>🚩</span>
          <span>Report Product</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="product-detail-overlay" onClick={onClose}>
      <div className="product-detail-card" onClick={(e) => e.stopPropagation()}>
        {/* Mobile Sticky Top Navigation Bar */}
        <div className="product-detail-header-mobile">
          <button
            onClick={() => {
              if (dispatchBackButton()) return;
              onClose();
            }}
            aria-label="Back"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'none',
              border: 'none',
              color: 'var(--text-main)',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>

          <div
            style={{
              flex: 1,
              fontSize: '0.9rem',
              fontWeight: 700,
              color: 'var(--text-main)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              textAlign: 'center',
              padding: '0 8px',
            }}
          >
            {item.name}
          </div>

          {/* 3-Dots Dropdown Menu */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Pilihan Lainnya"
              title="Pilihan Lainnya"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: isMenuOpen ? 'var(--bg-subtle)' : 'transparent',
                border: 'none',
                color: 'var(--text-main)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.15s ease',
              }}
            >
              <MoreVerticalIcon size={20} />
            </button>

            {isMenuOpen && renderPopoverMenu()}
          </div>
        </div>

        {/* Desktop Floating Top-Right Controls (Menu + Close) */}
        <div
          className="product-detail-desktop-close"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            alignItems: 'center',
            gap: '8px',
            zIndex: 20,
          }}
        >
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              title="Product Options"
              aria-label="Product Options"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.15s ease',
              }}
            >
              <MoreVerticalIcon size={18} />
            </button>
            {isMenuOpen && renderPopoverMenu()}
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              cursor: 'pointer',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content Container */}
        <div className="product-detail-scrollable">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
              padding: '20px',
            }}
          >
            {/* Left Column: Image Gallery & Store Card */}
            <div>
              <ItemDetailGallery
                images={item.images}
                name={item.name}
                stock={item.stock}
                isService={isService}
                selectedImage={selectedImage}
                onSelectImage={setSelectedImage}
              />

              <ItemStoreCard
                store={store}
                storeId={item.storeId}
                storeName={item.storeName}
                location={item.location}
                rating={item.rating}
                fallbackImage={item.images[0]}
                hasMultipleImages={item.images.length > 1}
                onSelectStore={onSelectStore}
                onClose={onClose}
              />
            </div>

            {/* Right Column: Details & Order Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Title */}
              <h2
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  lineHeight: 1.35,
                  margin: 0,
                  paddingRight: '76px',
                }}
              >
                {item.name}
              </h2>

              {/* Price Box */}
              <div
                style={{
                  background: 'var(--bg-subtle)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '2px' }}>
                  Unit Price
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <div
                    style={{
                      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                      fontSize: '1.15rem',
                      fontWeight: 700,
                      color: 'var(--text-main)',
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '2px',
                      lineHeight: 1.2,
                    }}
                  >
                    <span>Rp</span>
                    <span>{currentPrice.toLocaleString('id-ID')}</span>
                  </div>
                  {item.originalPrice && (
                    <div
                      style={{
                        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                        fontSize: '0.76rem',
                        color: 'var(--text-muted)',
                        textDecoration: 'line-through',
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: '1.5px',
                        lineHeight: 1.2,
                      }}
                    >
                      <span>Rp</span>
                      <span>{item.originalPrice.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                </div>
                {isService && item.duration && (
                  <div style={{ fontSize: '0.74rem', color: 'var(--color-service)', fontWeight: 600, marginTop: '4px' }}>
                    ⏱️ Durasi Pengerjaan: {item.duration}
                  </div>
                )}
                {!isService && item.weight !== undefined && item.weight > 0 && (() => {
                  const isMl = item.weightUnit === 'ml';
                  return (
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span>{isMl ? 'Volume:' : 'Berat:'}</span>
                      <strong style={{ color: 'var(--text-main)', fontWeight: 600 }}>
                        {item.weight >= 1000
                          ? `${(item.weight / 1000).toLocaleString('id-ID')} ${isMl ? 'L' : 'kg'}`
                          : `${item.weight} ${isMl ? 'ml' : 'g'}`}
                      </strong>
                      {item.weight >= 1000 && (
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                          ({item.weight.toLocaleString('id-ID')} {isMl ? 'ml' : 'gram'})
                        </span>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Tab Switcher: Description | Reviews */}
              <div style={{ marginTop: '2px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    borderBottom: '1px solid var(--border-color)',
                    marginBottom: '10px',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setActiveInfoTab('DESKRIPSI')}
                    style={{
                      padding: '6px 2px 8px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: activeInfoTab === 'DESKRIPSI' ? 'var(--color-brand)' : 'var(--text-muted)',
                      background: 'none',
                      border: 'none',
                      borderBottom:
                        activeInfoTab === 'DESKRIPSI' ? '2px solid var(--color-brand)' : '2px solid transparent',
                      cursor: 'pointer',
                      transition: 'color 0.12s ease, border-color 0.12s ease',
                    }}
                  >
                    Description
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveInfoTab('ULASAN')}
                    style={{
                      padding: '6px 2px 8px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: activeInfoTab === 'ULASAN' ? 'var(--color-brand)' : 'var(--text-muted)',
                      background: 'none',
                      border: 'none',
                      borderBottom:
                        activeInfoTab === 'ULASAN' ? '2px solid var(--color-brand)' : '2px solid transparent',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      transition: 'color 0.12s ease, border-color 0.12s ease',
                    }}
                  >
                    <span>Reviews</span>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        background: activeInfoTab === 'ULASAN' ? 'var(--color-brand-bg)' : 'var(--bg-subtle)',
                        color: activeInfoTab === 'ULASAN' ? 'var(--color-brand)' : 'var(--text-muted)',
                        padding: '1px 6px',
                        borderRadius: '999px',
                        fontWeight: 600,
                      }}
                    >
                      {allReviews.length}
                    </span>
                  </button>
                </div>

                <div style={{ minHeight: '120px' }}>
                  {activeInfoTab === 'DESKRIPSI' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {!isService && item.weight !== undefined && item.weight > 0 && (() => {
                        const isMl = item.weightUnit === 'ml';
                        return (
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: 'var(--bg-subtle)',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              color: 'var(--text-main)',
                              width: 'fit-content',
                              border: '1px solid var(--border-color)',
                            }}
                          >
                            <span style={{ color: 'var(--text-muted)' }}>
                              {isMl ? 'Spesifikasi Volume:' : 'Spesifikasi Berat:'}
                            </span>
                            <strong>
                              {item.weight >= 1000
                                ? `${(item.weight / 1000).toLocaleString('id-ID')} ${isMl ? 'L' : 'kg'}`
                                : `${item.weight} ${isMl ? 'ml' : 'gram'}`}
                            </strong>
                          </div>
                        );
                      })()}
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-sub)', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-line' }}>
                        {item.description}
                      </p>
                    </div>
                  ) : (
                    <ItemDetailReviewsTab
                      itemRating={item.rating}
                      allReviews={allReviews}
                      storeName={item.storeName}
                      onOpenAllReviews={() => setIsAllReviewsModalOpen(true)}
                      onPreviewPhoto={setPreviewReviewPhoto}
                    />
                  )}
                </div>
              </div>

              {/* Order Controls: Variants, Quantity / Date, Notes, Desktop CTA */}
              <ItemOrderControls
                item={item}
                store={store}
                isService={isService}
                selectedVariant={selectedVariant}
                onSelectVariant={setSelectedVariant}
                bookingDate={bookingDate}
                onChangeBookingDate={setBookingDate}
                quantity={quantity}
                onChangeQuantity={setQuantity}
                totalPrice={totalPrice}
                customerNotes={customerNotes}
                onChangeCustomerNotes={setCustomerNotes}
                onWhatsAppChat={handleWhatsAppChat}
                onAction={handleAction}
              />
            </div>
          </div>
        </div>

        {/* Sticky Bottom Action Bar (Mobile Only): Icon-Only WhatsApp + Bold CTA */}
        <div className="product-detail-bottom-bar-mobile">
          <button
            onClick={handleWhatsAppChat}
            aria-label="Chat Seller on WhatsApp"
            title="Chat Seller on WhatsApp"
            style={{
              width: '46px',
              height: '46px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface, #FFFFFF)',
              border: '1.5px solid var(--border-color, #CBD5E1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <WhatsAppIcon size={24} />
          </button>

          <button
            onClick={handleAction}
            className={isService ? 'btn btn-service' : 'btn btn-goods'}
            style={{
              flex: 1,
              padding: '12px 14px',
              fontSize: '0.9rem',
              fontWeight: 800,
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              whiteSpace: 'nowrap',
            }}
          >
            {isService ? 'Book Now' : 'Add to Cart'}
          </button>
        </div>

        {/* In-Modal Toast Notification */}
        {toastMessage && (
          <div
            style={{
              position: 'absolute',
              bottom: '76px',
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

        {/* Interactive Report Product Dialog */}
        <ItemDetailReportModal
          isOpen={isReportModalOpen}
          itemName={item.name}
          onClose={() => setIsReportModalOpen(false)}
          onSubmit={handleSubmitReport}
        />

        {/* Modal Halaman Semua Ulasan (Dedicated All Reviews Modal - Fullscreen Mobile) */}
        <ItemAllReviewsModal
          isOpen={isAllReviewsModalOpen}
          itemName={item.name}
          itemRating={item.rating}
          allReviewsCount={allReviews.length}
          reviewsWithPhotosCount={reviewsWithPhotosCount}
          selectedRatingFilter={selectedRatingFilter}
          onSelectRatingFilter={setSelectedRatingFilter}
          filteredReviews={filteredReviews}
          storeName={item.storeName}
          onClose={() => setIsAllReviewsModalOpen(false)}
          onPreviewPhoto={setPreviewReviewPhoto}
        />

        {/* Lightbox Modal untuk Preview Foto Ulasan Pembeli */}
        <ItemDetailLightbox
          photoUrl={previewReviewPhoto}
          onClose={() => setPreviewReviewPhoto(null)}
        />
      </div>
    </div>
  );
};
