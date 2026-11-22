import React from 'react';

interface CheckoutShippingSectionProps {
  name: string;
  onChangeName: (value: string) => void;
  phone: string;
  onChangePhone: (value: string) => void;
  address: string;
  onChangeAddress: (value: string) => void;
  bookingDate: string;
  onChangeBookingDate: (value: string) => void;
  notes: string;
  onChangeNotes: (value: string) => void;
  hasGoods: boolean;
  hasService: boolean;
  shippingMethod: 'STORE_DELIVERY' | 'SERA_INSTANT' | 'PICKUP';
  onChangeShippingMethod: (method: 'STORE_DELIVERY' | 'SERA_INSTANT' | 'PICKUP') => void;
  storeDeliveryFee: number;
  isFreeStoreDelivery: boolean;
  onOpenMapPicker: () => void;
}

export const CheckoutShippingSection: React.FC<CheckoutShippingSectionProps> = ({
  name,
  onChangeName,
  phone,
  onChangePhone,
  address,
  onChangeAddress,
  bookingDate,
  onChangeBookingDate,
  notes,
  onChangeNotes,
  hasGoods,
  hasService,
  shippingMethod,
  onChangeShippingMethod,
  storeDeliveryFee,
  isFreeStoreDelivery,
  onOpenMapPicker
}) => {
  return (
    <>
      <div>
        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
          Nama lengkap
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => onChangeName(e.target.value)}
          placeholder="Contoh: Budi Santoso"
          style={{
            width: '100%',
            padding: '12px 14px',
            borderRadius: '12px',
            background: 'var(--bg-surface, #FFFFFF)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-main)',
            fontSize: '0.9rem',
            fontWeight: 500,
            outline: 'none'
          }}
        />
      </div>

      <div>
        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
          Nomor WhatsApp
        </label>
        <input
          type="tel"
          required
          value={phone}
          onChange={(e) => onChangePhone(e.target.value)}
          placeholder="Contoh: 081234567890"
          style={{
            width: '100%',
            padding: '12px 14px',
            borderRadius: '12px',
            background: 'var(--bg-surface, #FFFFFF)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-main)',
            fontSize: '0.9rem',
            fontWeight: 500,
            outline: 'none'
          }}
        />
      </div>

      {hasGoods && (
        <div>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '8px' }}>
            Pengiriman
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            <button
              type="button"
              onClick={() => onChangeShippingMethod('STORE_DELIVERY')}
              style={{
                padding: '10px 12px',
                borderRadius: '12px',
                border: `1.5px solid ${shippingMethod === 'STORE_DELIVERY' ? 'var(--text-main)' : 'var(--border-color)'}`,
                background: shippingMethod === 'STORE_DELIVERY' ? 'var(--bg-subtle)' : 'var(--bg-surface, #FFFFFF)',
                color: 'var(--text-main)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>Kurir Toko</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px', fontWeight: 500 }}>
                {isFreeStoreDelivery ? 'Gratis' : `Rp ${storeDeliveryFee.toLocaleString('id-ID')}`}
              </div>
            </button>

            <button
              type="button"
              onClick={() => onChangeShippingMethod('SERA_INSTANT')}
              style={{
                padding: '10px 12px',
                borderRadius: '12px',
                border: `1.5px solid ${shippingMethod === 'SERA_INSTANT' ? 'var(--text-main)' : 'var(--border-color)'}`,
                background: shippingMethod === 'SERA_INSTANT' ? 'var(--bg-subtle)' : 'var(--bg-surface, #FFFFFF)',
                color: 'var(--text-main)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>Mitra Kurir</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px', fontWeight: 500 }}>
                Rp 14.000
              </div>
            </button>

            <button
              type="button"
              onClick={() => onChangeShippingMethod('PICKUP')}
              style={{
                padding: '10px 12px',
                borderRadius: '12px',
                border: `1.5px solid ${shippingMethod === 'PICKUP' ? 'var(--text-main)' : 'var(--border-color)'}`,
                background: shippingMethod === 'PICKUP' ? 'var(--bg-subtle)' : 'var(--bg-surface, #FFFFFF)',
                color: 'var(--text-main)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>Ambil ke Toko</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px', fontWeight: 500 }}>
                Gratis
              </div>
            </button>
          </div>
        </div>
      )}

      {hasGoods && shippingMethod !== 'PICKUP' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Alamat pengiriman
            </label>
            <button
              type="button"
              onClick={onOpenMapPicker}
              style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-color)',
                padding: '4px 10px',
                borderRadius: '14px',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--text-main)',
                cursor: 'pointer',
                transition: 'background 0.15s ease'
              }}
            >
              {address.trim() ? 'Pilih lewat Peta' : '+ Pilih di Peta'}
            </button>
          </div>
          <textarea
            required
            rows={4}
            value={address}
            onChange={(e) => onChangeAddress(e.target.value)}
            placeholder="Ketik alamat lengkap (nama jalan, nomor rumah, RT/RW, kecamatan, kota) atau klik Pilih lewat Peta di atas..."
            style={{
              width: '100%',
              minHeight: '92px',
              padding: '12px 14px',
              borderRadius: '12px',
              background: 'var(--bg-surface, #FFFFFF)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              fontSize: '0.9rem',
              fontWeight: 500,
              lineHeight: 1.5,
              outline: 'none',
              resize: 'vertical'
            }}
          />
        </div>
      )}

      {hasGoods && shippingMethod === 'PICKUP' && (
        <div style={{
          padding: '11px 14px',
          borderRadius: '12px',
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border-color)',
          fontSize: '0.8rem',
          color: 'var(--text-sub)',
          lineHeight: 1.45
        }}>
          Pesanan disiapkan oleh toko. Tunjukkan nama pemesan ke kasir saat mengambil pesanan.
        </div>
      )}

      {hasService && (
        <div>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
            Jadwal kunjungan jasa
          </label>
          <input
            type="text"
            value={bookingDate}
            onChange={(e) => onChangeBookingDate(e.target.value)}
            placeholder="Contoh: Besok pukul 10:00 WIB"
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: '12px',
              background: 'var(--bg-surface, #FFFFFF)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              fontSize: '0.9rem',
              fontWeight: 500,
              outline: 'none'
            }}
          />
        </div>
      )}

      <div>
        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
          Catatan (opsional)
        </label>
        <input
          type="text"
          value={notes}
          onChange={(e) => onChangeNotes(e.target.value)}
          placeholder="Instruksi tambahan untuk toko atau kurir..."
          style={{
            width: '100%',
            padding: '12px 14px',
            borderRadius: '12px',
            background: 'var(--bg-surface, #FFFFFF)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-main)',
            fontSize: '0.88rem',
            fontWeight: 500,
            outline: 'none'
          }}
        />
      </div>
    </>
  );
};
