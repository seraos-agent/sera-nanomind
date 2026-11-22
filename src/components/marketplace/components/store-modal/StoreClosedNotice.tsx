import React from 'react';

interface StoreClosedNoticeProps {
  isOpen?: boolean;
  style?: React.CSSProperties;
}

/**
 * Shared notice banner shown when a store is currently closed,
 * informing visitors they can still browse or place orders.
 */
export const StoreClosedNotice: React.FC<StoreClosedNoticeProps> = ({ isOpen, style }) => {
  if (isOpen) return null;

  return (
    <div
      style={{
        padding: '10px 12px',
        borderRadius: '10px',
        background: 'rgba(239, 68, 68, 0.08)',
        border: '1px solid rgba(239, 68, 68, 0.25)',
        color: '#B91C1C',
        fontSize: '0.78rem',
        lineHeight: 1.45,
        ...style,
      }}
    >
      <span>
        <strong>Toko Sedang Tutup.</strong> Anda tetap dapat melihat produk atau melakukan pemesanan (akan diproses saat toko buka).
      </span>
    </div>
  );
};

