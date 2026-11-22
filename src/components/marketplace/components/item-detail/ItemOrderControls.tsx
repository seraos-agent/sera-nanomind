import React from 'react';
import type { MarketplaceItem, MarketplaceStore } from '../../types';
import { WhatsAppIcon } from '../Icons';

interface ItemOrderControlsProps {
  item: MarketplaceItem;
  store?: MarketplaceStore;
  isService: boolean;
  selectedVariant?: { name: string; price: number };
  onSelectVariant: (variant: { name: string; price: number }) => void;
  bookingDate: string;
  onChangeBookingDate: (val: string) => void;
  quantity: number;
  onChangeQuantity: (val: number) => void;
  totalPrice: number;
  customerNotes: string;
  onChangeCustomerNotes: (val: string) => void;
  onWhatsAppChat: () => void;
  onAction: () => void;
}

export const ItemOrderControls: React.FC<ItemOrderControlsProps> = ({
  item,
  store,
  isService,
  selectedVariant,
  onSelectVariant,
  bookingDate,
  onChangeBookingDate,
  quantity,
  onChangeQuantity,
  totalPrice,
  customerNotes,
  onChangeCustomerNotes,
  onWhatsAppChat,
  onAction,
}) => {
  return (
    <>
      {/* Variants Selector */}
      {item.variants && item.variants.length > 0 && (
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-sub)', marginBottom: '6px' }}>
            Pilihan Varian / Paket
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {item.variants.map((v) => (
              <button
                key={v.name}
                type="button"
                onClick={() => onSelectVariant(v)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: selectedVariant?.name === v.name ? '2px solid var(--color-brand)' : '1px solid var(--border-color)',
                  background: selectedVariant?.name === v.name ? 'var(--color-brand-bg)' : '#FFFFFF',
                  color: selectedVariant?.name === v.name ? 'var(--color-brand)' : 'var(--text-sub)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {v.name} (Rp {v.price.toLocaleString('id-ID')})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Service-Specific: Booking Date Input */}
      {isService && (
        <div
          style={{
            background: 'var(--color-service-bg)',
            border: '1px solid var(--color-service-border)',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-service)' }}>
            📅 Jadwal Layanan / Kunjungan:
          </label>
          <input
            type="text"
            value={bookingDate}
            onChange={(e) => onChangeBookingDate(e.target.value)}
            placeholder="Contoh: Besok pukul 10:00 WIB"
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-surface, #FFFFFF)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              fontSize: '0.85rem',
            }}
          />
          {item.bookingNotice && (
            <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>
              ℹ️ {item.bookingNotice}
            </div>
          )}
        </div>
      )}

      {/* Goods-Specific: Quantity Controls & Subtotal / Total Price */}
      {!isService && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            background: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
          }}
        >
          {/* Stepper Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-sub)' }}>
              Jumlah
            </span>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: 'var(--bg-surface, #FFFFFF)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              }}
            >
              <button
                type="button"
                onClick={() => onChangeQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                style={{
                  width: '32px',
                  height: '32px',
                  background: 'transparent',
                  border: 'none',
                  color: quantity <= 1 ? '#CBD5E1' : 'var(--text-main)',
                  cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (quantity > 1) e.currentTarget.style.background = '#F1F5F9';
                }}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                −
              </button>
              <span
                style={{
                  width: '32px',
                  textAlign: 'center',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  color: 'var(--text-main)',
                  userSelect: 'none',
                }}
              >
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => onChangeQuantity(quantity + 1)}
                style={{
                  width: '32px',
                  height: '32px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#F1F5F9')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                +
              </button>
            </div>
          </div>

          {/* Subtotal Display */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.2 }}>
              Total Harga
            </span>
            <div
              style={{
                fontSize: '0.94rem',
                fontWeight: 700,
                color: 'var(--color-brand)',
                display: 'flex',
                alignItems: 'baseline',
                gap: '2px',
                lineHeight: 1.25,
              }}
            >
              <span>Rp</span>
              <span>{totalPrice.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Customer Notes */}
      <div style={{ position: 'relative' }}>
        <textarea
          value={customerNotes}
          onChange={(e) => onChangeCustomerNotes(e.target.value.slice(0, 120))}
          maxLength={120}
          rows={2}
          placeholder="Catatan untuk penjual..."
          style={{
            width: '100%',
            padding: '8px 12px 20px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-main)',
            fontSize: '0.8rem',
            outline: 'none',
            resize: 'none',
            lineHeight: 1.4,
            fontFamily: 'inherit',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: '10px',
            bottom: '8px',
            fontSize: '0.66rem',
            color: customerNotes.length >= 120 ? '#EF4444' : 'var(--text-muted)',
            pointerEvents: 'none',
            fontWeight: 500,
          }}
        >
          {customerNotes.length}/120
        </div>
      </div>

      {/* Store Closed Warning Banner */}
      {store && !store.isOpen && (
        <div
          style={{
            margin: '8px 0 2px 0',
            padding: '8px 12px',
            borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            color: '#B91C1C',
            fontSize: '0.78rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>ℹ️</span>
          <span>
            <strong>Toko Tutup Sementara.</strong> Pesanan tetap dapat dibuat dan akan diproses saat toko buka kembali.
          </span>
        </div>
      )}

      {/* Desktop Action Buttons: WhatsApp Icon + Full Width CTA */}
      <div className="product-detail-desktop-actions" style={{ gap: '10px', marginTop: '10px', alignItems: 'center' }}>
        <button
          type="button"
          onClick={onWhatsAppChat}
          aria-label="Chat WhatsApp Penjual"
          title="Chat WhatsApp Penjual"
          style={{
            width: '44px',
            height: '44px',
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
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--text-muted)';
            e.currentTarget.style.background = 'var(--bg-subtle, #F8FAFC)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-color, #CBD5E1)';
            e.currentTarget.style.background = 'var(--bg-surface, #FFFFFF)';
          }}
        >
          <WhatsAppIcon size={22} />
        </button>

        <button
          type="button"
          onClick={onAction}
          className={isService ? 'btn btn-service' : 'btn btn-goods'}
          style={{
            flex: 1,
            padding: '12px 16px',
            fontSize: '0.9rem',
            fontWeight: 800,
            borderRadius: 'var(--radius-md)',
          }}
        >
          {isService ? 'Booking Sekarang' : 'Tambah ke Keranjang'}
        </button>
      </div>
    </>
  );
};

