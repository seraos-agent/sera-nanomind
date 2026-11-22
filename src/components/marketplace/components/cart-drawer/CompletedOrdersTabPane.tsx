import React from 'react';
import type { MarketplaceOrder } from '../../types';
import { CheckCircleIcon, StarIcon, CameraIcon } from '../Icons';
import { formatOrderDate } from '../../utils/formatters';
import type { ReviewedItemRecord } from './types';

interface CompletedOrdersTabPaneProps {
  orders: MarketplaceOrder[];
  reviewedItems: Record<string, ReviewedItemRecord>;
  writingReviewKey: string | null;
  reviewRating: number;
  reviewComment: string;
  reviewPhotos: string[];
  isSubmittingReview: boolean;
  onStartReview: (orderId: string, itemId: string) => void;
  onCancelReview: () => void;
  onChangeRating: (rating: number) => void;
  onChangeComment: (comment: string) => void;
  onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemovePhoto: () => void;
  onSubmitReview: (order: MarketplaceOrder, item: any) => void;
}

export const CompletedOrdersTabPane: React.FC<CompletedOrdersTabPaneProps> = ({
  orders,
  reviewedItems,
  writingReviewKey,
  reviewRating,
  reviewComment,
  reviewPhotos,
  isSubmittingReview,
  onStartReview,
  onCancelReview,
  onChangeRating,
  onChangeComment,
  onPhotoUpload,
  onRemovePhoto,
  onSubmitReview,
}) => {
  return (
    <div
      className="viewpager-pane"
      style={{
        flex: '0 0 100%',
        width: '100%',
        minWidth: '100%',
        maxWidth: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        scrollSnapAlign: 'start',
        scrollSnapStop: 'always',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        {orders.length === 0 ? (
          <div style={{ margin: 'auto', textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <div
              style={{
                margin: '0 auto 12px',
                display: 'flex',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                opacity: 0.65,
              }}
            >
              <CheckCircleIcon size={46} color="currentColor" />
            </div>
            <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px', fontSize: '0.95rem' }}>
              No Completed Orders Yet
            </div>
            <p style={{ fontSize: '0.78rem', lineHeight: 1.5, margin: 0 }}>
              Reviews and star ratings can only be submitted after your shopping order is marked complete.
            </p>
          </div>
        ) : (
          orders.map((ord) => (
            <div
              key={ord.id}
              style={{
                background: 'var(--bg-card, #FFFFFF)',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                flexShrink: 0,
              }}
            >
              {/* Store Header Bar */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'var(--bg-subtle)',
                  padding: '12px 14px',
                  borderBottom: '1px solid var(--border-light)',
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      color: 'var(--text-main)',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {ord.storeName}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {formatOrderDate(ord.createdAt)}
                  </div>
                </div>
                <span
                  style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: 'var(--bg-surface, #FFFFFF)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-sub)',
                    fontSize: '0.70rem',
                    fontWeight: 600,
                  }}
                >
                  Completed
                </span>
              </div>

              {/* Purchased Items & Review Actions */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {ord.items.map((it, itemIdx) => {
                  const itemId = it.itemId || (it as any).id;
                  const reviewKey = `${ord.id}_${itemId}`;
                  const existingReview = reviewedItems[reviewKey];
                  const isWritingThis = writingReviewKey === reviewKey;

                  return (
                    <div
                      key={itemIdx}
                      style={{
                        padding: '12px 14px',
                        borderBottom: itemIdx < ord.items.length - 1 ? '1px solid var(--border-light)' : 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '6px',
                            overflow: 'hidden',
                            background: '#E2E8F0',
                            flexShrink: 0,
                          }}
                        >
                          <img
                            src={
                              it.imageUrl ||
                              'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500'
                            }
                            alt=""
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontWeight: 700,
                              fontSize: '0.82rem',
                              color: 'var(--text-main)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {it.name}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {it.quantity}x • Rp {(it.price * it.quantity).toLocaleString('id-ID')}
                          </div>
                        </div>

                        {/* Review Button / Badge */}
                        <div>
                          {existingReview ? (
                            <div
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                background: 'rgba(16, 185, 129, 0.1)',
                                border: '1px solid rgba(16, 185, 129, 0.25)',
                                color: '#059669',
                                fontSize: '0.72rem',
                                fontWeight: 800,
                              }}
                            >
                              <span>✓ Reviewed</span>
                              <span style={{ color: '#EAB308', display: 'inline-flex', alignItems: 'center', gap: '1px' }}>
                                ★ {existingReview.rating}
                              </span>
                            </div>
                          ) : isWritingThis ? null : (
                            <button
                              type="button"
                              onClick={() => onStartReview(ord.id, itemId)}
                              style={{
                                padding: '5px 12px',
                                borderRadius: '6px',
                                background: 'var(--bg-surface, #FFFFFF)',
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-main)',
                                fontSize: '0.74rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'var(--text-main)';
                                e.currentTarget.style.background = 'var(--bg-subtle)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'var(--border-color)';
                                e.currentTarget.style.background = 'var(--bg-surface, #FFFFFF)';
                              }}
                            >
                              Leave a Review
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Existing Review Quote */}
                      {existingReview && (
                        <div
                          style={{
                            padding: '8px 10px',
                            borderRadius: '6px',
                            background: 'var(--bg-subtle)',
                            fontSize: '0.74rem',
                            color: 'var(--text-sub)',
                            lineHeight: 1.4,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px',
                          }}
                        >
                          {existingReview.comment && (
                            <div style={{ fontStyle: 'italic' }}>"{existingReview.comment}"</div>
                          )}
                          {existingReview.photos && existingReview.photos.length > 0 && (
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
                              {existingReview.photos.map((photo, pIdx) => (
                                <img
                                  key={pIdx}
                                  src={photo}
                                  alt=""
                                  style={{
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '6px',
                                    objectFit: 'cover',
                                    border: '1px solid var(--border-color)',
                                  }}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Expandable Review Form */}
                      {isWritingThis && (
                        <div
                          style={{
                            marginTop: '6px',
                            paddingTop: '10px',
                            borderTop: '1px solid var(--border-light)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                            animation: 'fadeIn 0.2s ease',
                          }}
                        >
                          {/* 5-Star Rating */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              padding: '2px 0',
                            }}
                          >
                            {[1, 2, 3, 4, 5].map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => onChangeRating(s)}
                                title={`Rating ${s} bintang`}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  padding: '2px 4px',
                                  cursor: 'pointer',
                                  transition: 'transform 0.15s ease',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
                                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                              >
                                <StarIcon
                                  size={24}
                                  color="#EAB308"
                                  fill={s <= reviewRating ? '#EAB308' : 'none'}
                                />
                              </button>
                            ))}
                          </div>

                          {/* Composer Box */}
                          <div
                            style={{
                              borderRadius: '10px',
                              border: '1px solid var(--border-color)',
                              background: 'var(--bg-surface, #FFFFFF)',
                              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                              padding: '10px 12px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '8px',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <textarea
                              value={reviewComment}
                              onChange={(e) => onChangeComment(e.target.value.slice(0, 220))}
                              maxLength={220}
                              placeholder="Share your feedback (product quality, taste, packaging)..."
                              rows={2}
                              style={{
                                width: '100%',
                                boxSizing: 'border-box',
                                padding: 0,
                                border: 'none',
                                outline: 'none',
                                background: 'transparent',
                                color: 'var(--text-main)',
                                fontSize: '0.78rem',
                                fontFamily: 'inherit',
                                resize: 'none',
                                lineHeight: 1.45,
                              }}
                            />

                            {/* Composer Toolbar */}
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                paddingTop: '6px',
                                borderTop: '1px solid rgba(0, 0, 0, 0.04)',
                              }}
                            >
                              {/* Photo Upload or Thumbnail */}
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                {reviewPhotos.length === 0 ? (
                                  <label
                                    title="Attach photo"
                                    style={{
                                      width: '28px',
                                      height: '28px',
                                      borderRadius: '6px',
                                      background: 'var(--bg-subtle)',
                                      border: '1px solid var(--border-color)',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      cursor: 'pointer',
                                      color: 'var(--text-muted)',
                                      transition: 'all 0.15s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.color = 'var(--color-brand)';
                                      e.currentTarget.style.borderColor = 'var(--color-brand)';
                                      e.currentTarget.style.background = 'rgba(37, 99, 235, 0.08)';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.color = 'var(--text-muted)';
                                      e.currentTarget.style.borderColor = 'var(--border-color)';
                                      e.currentTarget.style.background = 'var(--bg-subtle)';
                                    }}
                                  >
                                    <CameraIcon size={16} />
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={onPhotoUpload}
                                      style={{ display: 'none' }}
                                    />
                                  </label>
                                ) : (
                                  <div
                                    style={{
                                      position: 'relative',
                                      width: '32px',
                                      height: '32px',
                                      borderRadius: '6px',
                                      overflow: 'hidden',
                                      border: '1.5px solid var(--color-brand)',
                                      background: '#F1F5F9',
                                    }}
                                  >
                                    <img
                                      src={reviewPhotos[0]}
                                      alt=""
                                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    <button
                                      type="button"
                                      onClick={onRemovePhoto}
                                      title="Remove photo"
                                      style={{
                                        position: 'absolute',
                                        top: '1px',
                                        right: '1px',
                                        width: '13px',
                                        height: '13px',
                                        borderRadius: '50%',
                                        background: 'rgba(0,0,0,0.7)',
                                        color: '#FFFFFF',
                                        border: 'none',
                                        fontSize: '0.55rem',
                                        fontWeight: 800,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        padding: 0,
                                      }}
                                    >
                                      ✕
                                    </button>
                                  </div>
                                )}
                              </div>

                              {/* Cancel & Submit Buttons */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <button
                                  type="button"
                                  onClick={onCancelReview}
                                  style={{
                                    padding: '5px 12px',
                                    borderRadius: '999px',
                                    background: 'transparent',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--text-muted)',
                                    fontSize: '0.74rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                  }}
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onSubmitReview(ord, it)}
                                  disabled={isSubmittingReview}
                                  style={{
                                    padding: '5px 16px',
                                    borderRadius: '999px',
                                    background: 'var(--color-brand)',
                                    border: 'none',
                                    color: '#FFFFFF',
                                    fontSize: '0.74rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    opacity: isSubmittingReview ? 0.7 : 1,
                                    transition: 'opacity 0.15s ease',
                                  }}
                                >
                                  {isSubmittingReview ? 'Submitting...' : 'Submit'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Selesai Order Footer */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 14px',
                  background: 'var(--bg-subtle)',
                  borderTop: '1px dashed var(--border-color)',
                  fontSize: '0.72rem',
                }}
              >
                <div style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  {ord.id}
                </div>
                <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                  Total:{' '}
                  <span style={{ color: 'var(--color-goods)', fontWeight: 800 }}>
                    Rp {ord.totalAmount.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

