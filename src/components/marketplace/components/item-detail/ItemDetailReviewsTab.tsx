import React from 'react';
import { StarIcon } from '../Icons';
import type { ReviewItem } from './types';

interface ItemDetailReviewsTabProps {
  itemRating: number;
  allReviews: ReviewItem[];
  storeName: string;
  onOpenAllReviews: () => void;
  onPreviewPhoto: (photo: string) => void;
}

export const ItemDetailReviewsTab: React.FC<ItemDetailReviewsTabProps> = ({
  itemRating,
  allReviews,
  storeName,
  onOpenAllReviews,
  onPreviewPhoto,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Rating Summary Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          background: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <StarIcon size={16} color="#EAB308" fill="#EAB308" />
          <span style={{ fontSize: '1.02rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {itemRating}
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>/ 5.0</span>
        </div>

        {allReviews.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={onOpenAllReviews}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-brand)',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                padding: '3px 6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
                borderRadius: '4px',
                transition: 'opacity 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              <span>Semua ({allReviews.length})</span>
              <span style={{ fontSize: '0.85rem', lineHeight: 1 }}>›</span>
            </button>
          </div>
        )}
      </div>

      {/* Reviews List */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          maxHeight: '190px',
          overflowY: 'auto',
          paddingRight: '2px',
        }}
      >
        {allReviews.length === 0 ? (
          <div
            style={{
              padding: '16px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-subtle)',
              border: '1px dashed var(--border-color)',
              textAlign: 'center',
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
            }}
          >
            Belum ada ulasan pembeli untuk produk ini.
          </div>
        ) : (
          allReviews.map((rev) => (
          <div
            key={rev.id}
            style={{
              padding: '8px 10px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-light)',
              display: 'flex',
              flexDirection: 'column',
              gap: '3px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: rev.avatarBg,
                    color: rev.avatarColor,
                    fontSize: '0.66rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {rev.author.charAt(0)}
                </div>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {rev.author}
                </span>
              </div>
              <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>
                {rev.date}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  size={10}
                  color={i < Math.floor(rev.rating) ? '#EAB308' : '#CBD5E1'}
                  fill={i < Math.floor(rev.rating) ? '#EAB308' : 'none'}
                />
              ))}
              {rev.variant && (
                <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginLeft: '4px' }}>
                  (Varian: {rev.variant})
                </span>
              )}
            </div>

            <p style={{ fontSize: '0.75rem', color: 'var(--text-sub)', lineHeight: 1.4, margin: '2px 0 0' }}>
              {rev.comment}
            </p>

            {/* Merchant Reply inside In-Card View */}
            {rev.reply && (
              <div
                style={{
                  marginTop: '4px',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  background: 'rgba(37, 99, 235, 0.05)',
                  borderLeft: '2.5px solid var(--color-brand)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}
              >
                <span style={{ fontSize: '0.66rem', fontWeight: 700, color: 'var(--color-brand)' }}>
                  Respon Toko ({storeName}):
                </span>
                <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-main)', lineHeight: 1.35 }}>
                  {rev.reply.text}
                </p>
              </div>
            )}

            {/* Review Photos Preview */}
            {rev.photos && rev.photos.length > 0 && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                {rev.photos.map((photo, pIdx) => (
                  <img
                    key={pIdx}
                    src={photo}
                    alt={`Foto ulasan ${rev.author}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onPreviewPhoto(photo);
                    }}
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '6px',
                      objectFit: 'cover',
                      border: '1px solid var(--border-color)',
                      cursor: 'pointer',
                      transition: 'opacity 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                  />
                ))}
              </div>
            )}
          </div>
        ))
        )}
      </div>
    </div>
  );
};

