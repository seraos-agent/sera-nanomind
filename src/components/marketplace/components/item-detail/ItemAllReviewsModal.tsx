import React from 'react';
import { StarIcon, CameraIcon } from '../Icons';
import type { ReviewItem } from './types';

interface ItemAllReviewsModalProps {
  isOpen: boolean;
  itemName: string;
  itemRating: number;
  allReviewsCount: number;
  reviewsWithPhotosCount: number;
  selectedRatingFilter: string;
  onSelectRatingFilter: (filter: string) => void;
  filteredReviews: ReviewItem[];
  storeName: string;
  onClose: () => void;
  onPreviewPhoto: (photo: string) => void;
}

const RATING_FILTER_CHIPS = [
  { id: 'Semua', label: 'Semua' },
  { id: '★ 5', label: '★ 5' },
  { id: '★ 4', label: '★ 4' },
  { id: '★ 3', label: '★ 3' },
  { id: '★ 2', label: '★ 2' },
  { id: '★ 1', label: '★ 1' },
];

export const ItemAllReviewsModal: React.FC<ItemAllReviewsModalProps> = ({
  isOpen,
  itemName,
  itemRating,
  allReviewsCount,
  reviewsWithPhotosCount,
  selectedRatingFilter,
  onSelectRatingFilter,
  filteredReviews,
  storeName,
  onClose,
  onPreviewPhoto,
}) => {
  if (!isOpen) return null;

  return (
    <div className="all-reviews-modal-overlay" onClick={onClose}>
      <div className="all-reviews-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header: Single Back Button + Title */}
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'var(--bg-surface, #FFFFFF)',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            flexShrink: 0,
          }}
        >
          {/* Back Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Kembali"
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
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-subtle)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
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

          <div style={{ minWidth: 0, flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.25 }}>
              Semua Ulasan
            </h3>
            <p
              style={{
                margin: '2px 0 0',
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {itemName}
            </p>
          </div>
        </div>

        {/* Score & Filter Section */}
        <div
          style={{
            padding: '12px 16px',
            background: 'var(--bg-subtle)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          {/* Row 1: Score & Photo Filter Toggle */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
            }}
          >
            {/* Rating Score and Total Count */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <StarIcon size={15} color="#EAB308" fill="#EAB308" />
                <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1 }}>
                  {itemRating}
                </span>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ 5.0</span>
              </div>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                • {allReviewsCount} ulasan
              </span>
            </div>

            {/* Photo Filter Chip */}
            <button
              type="button"
              onClick={() => onSelectRatingFilter(selectedRatingFilter === 'Dengan Foto' ? 'Semua' : 'Dengan Foto')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 10px',
                borderRadius: '999px',
                fontSize: '0.72rem',
                fontWeight: 600,
                background: 'var(--bg-surface, #FFFFFF)',
                color: selectedRatingFilter === 'Dengan Foto' ? 'var(--text-main)' : 'var(--text-muted)',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
                transition: 'color 0.15s ease',
              }}
            >
              <CameraIcon size={12} color={selectedRatingFilter === 'Dengan Foto' ? 'var(--text-main)' : 'var(--text-muted)'} />
              <span>Foto ({reviewsWithPhotosCount})</span>
            </button>
          </div>

          {/* Row 2: Segmented Rating Selector (6 buttons grid) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr repeat(5, 1fr)',
              gap: '5px',
              width: '100%',
            }}
          >
            {RATING_FILTER_CHIPS.map((chip) => {
              const isChipActive = selectedRatingFilter === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => onSelectRatingFilter(chip.id)}
                  style={{
                    padding: '6px 2px',
                    borderRadius: '8px',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    textAlign: 'center',
                    background: 'var(--bg-surface, #FFFFFF)',
                    color: isChipActive ? 'var(--text-main)' : 'var(--text-muted)',
                    border: '1px solid var(--border-color)',
                    cursor: 'pointer',
                    transition: 'color 0.15s ease',
                  }}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Reviews List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          {filteredReviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              Tidak ada ulasan untuk filter rating ini.
            </div>
          ) : (
            filteredReviews.map((rev) => (
              <div
                key={rev.id}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-card, #FFFFFF)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '5px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        background: rev.avatarBg,
                        color: rev.avatarColor,
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {rev.author.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {rev.author}
                      </div>
                      <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>
                        Pembeli Terverifikasi • {rev.date}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginTop: '2px' }}>
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      size={11}
                      color={i < Math.floor(rev.rating) ? '#EAB308' : '#CBD5E1'}
                      fill={i < Math.floor(rev.rating) ? '#EAB308' : 'none'}
                    />
                  ))}
                  {rev.variant && (
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginLeft: '6px' }}>
                      (Varian: {rev.variant})
                    </span>
                  )}
                </div>

                <p style={{ fontSize: '0.78rem', color: 'var(--text-sub)', lineHeight: 1.45, margin: '2px 0 0' }}>
                  {rev.comment}
                </p>

                {/* Merchant Reply */}
                {rev.reply && (
                  <div
                    style={{
                      marginTop: '6px',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      background: 'rgba(37, 99, 235, 0.05)',
                      borderLeft: '2.5px solid var(--color-brand)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                    }}
                  >
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-brand)' }}>
                      Respon Toko ({storeName}):
                    </span>
                    <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--text-main)', lineHeight: 1.35 }}>
                      {rev.reply.text}
                    </p>
                  </div>
                )}

                {/* Review Photos */}
                {rev.photos && rev.photos.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
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
                          width: '58px',
                          height: '58px',
                          borderRadius: '8px',
                          objectFit: 'cover',
                          border: '1px solid var(--border-color)',
                          cursor: 'pointer',
                          transition: 'opacity 0.15s ease, transform 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '0.85';
                          e.currentTarget.style.transform = 'scale(1.03)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = '1';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

