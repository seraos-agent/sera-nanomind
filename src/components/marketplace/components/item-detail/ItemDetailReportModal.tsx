import React, { useState } from 'react';

interface ItemDetailReportModalProps {
  isOpen: boolean;
  itemName: string;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

const REPORT_REASONS = [
  'Penipuan atau Barang Palsu',
  'Harga atau Informasi Menyesatkan',
  'Barang Terlarang atau Berbahaya',
  'Spam atau Duplikasi Produk',
  'Pelanggaran Hak Cipta',
];

export const ItemDetailReportModal: React.FC<ItemDetailReportModalProps> = ({
  isOpen,
  itemName,
  onClose,
  onSubmit,
}) => {
  const [reportReason, setReportReason] = useState(REPORT_REASONS[0]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(3px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '380px',
          background: 'var(--bg-surface, #FFFFFF)',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          animation: 'scaleIn 0.2s ease',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2rem' }}>🚩</span>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Laporkan Produk
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '1.1rem',
              padding: '4px',
            }}
          >
            ✕
          </button>
        </div>

        <p style={{ margin: '0 0 14px 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Bantu kami menjaga SERA Market tetap aman. Pilih alasan pelaporan untuk: <strong>{itemName}</strong>
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
          {REPORT_REASONS.map(reason => (
            <label
              key={reason}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '8px',
                border: reportReason === reason ? '1.5px solid var(--color-brand)' : '1px solid var(--border-color)',
                background: reportReason === reason ? 'rgba(37, 99, 235, 0.04)' : 'transparent',
                cursor: 'pointer',
                fontSize: '0.84rem',
                fontWeight: reportReason === reason ? 600 : 500,
                color: reportReason === reason ? 'var(--color-brand)' : 'var(--text-main)',
                transition: 'all 0.15s ease',
              }}
            >
              <input
                type="radio"
                name="reportReason"
                value={reason}
                checked={reportReason === reason}
                onChange={() => setReportReason(reason)}
                style={{ accentColor: 'var(--color-brand)' }}
              />
              <span>{reason}</span>
            </label>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'none',
              color: 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.84rem',
              cursor: 'pointer',
            }}
          >
            Batal
          </button>
          <button
            onClick={() => onSubmit(reportReason)}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              background: '#DC2626',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.84rem',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12)',
            }}
          >
            Kirim Laporan
          </button>
        </div>
      </div>
    </div>
  );
};

