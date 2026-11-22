import React from 'react';
import { Upload, CheckCircle2, Copy, Check, Download } from 'lucide-react';

interface CheckoutPaymentSectionProps {
  paymentMethod: 'QRIS' | 'DANA' | 'TRANSFER' | 'COD';
  onChangePaymentMethod: (method: 'QRIS' | 'DANA' | 'TRANSFER' | 'COD') => void;
  storeName: string;
  storeQrisUrl: string;
  storePaymentProvider: string;
  storeAccountNumber: string;
  storeAccountHolder: string;
  totalAmount: number;
  subtotal: number;
  deliveryOrServiceFee: number;
  itemCount: number;
  copiedField: string | null;
  onCopy: (text: string, fieldId: string) => void;
  onDownloadQris: (url: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  paymentProof: string | null;
  isUploadingProof: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PAYMENT_OPTIONS = [
  { key: 'QRIS' as const, title: 'Instant QRIS', sub: 'All Banks & E-Wallets', available: true },
  { key: 'TRANSFER' as const, title: 'Bank / E-Wallet Transfer', sub: 'BCA, Mandiri, DANA, OVO, etc.', available: true },
  { key: 'COD' as const, title: 'Cash on Delivery', sub: 'Coming soon', available: false },
];

export const CheckoutPaymentSection: React.FC<CheckoutPaymentSectionProps> = ({
  paymentMethod,
  onChangePaymentMethod,
  storeName,
  storeQrisUrl,
  storePaymentProvider,
  storeAccountNumber,
  storeAccountHolder,
  totalAmount,
  subtotal,
  deliveryOrServiceFee,
  itemCount,
  copiedField,
  onCopy,
  onDownloadQris,
  fileInputRef,
  paymentProof,
  isUploadingProof,
  onFileChange
}) => {
  return (
    <>
      <div>
        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '8px' }}>
          Payment method
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          {PAYMENT_OPTIONS.map((pm, idx) => {
            const isSelected = paymentMethod === pm.key;
            const isAvailable = pm.available !== false;
            const isFullWidth = idx === 2;
            return (
              <button
                key={pm.key}
                type="button"
                disabled={!isAvailable}
                onClick={() => {
                  if (isAvailable) onChangePaymentMethod(pm.key);
                }}
                style={{
                  gridColumn: isFullWidth ? 'span 2' : 'auto',
                  padding: '11px 13px',
                  borderRadius: '12px',
                  border: `1.5px solid ${isSelected ? 'var(--text-main)' : 'var(--border-color)'}`,
                  background: isSelected ? 'var(--bg-subtle)' : 'var(--bg-surface, #FFFFFF)',
                  color: isAvailable ? 'var(--text-main)' : 'var(--text-muted)',
                  cursor: isAvailable ? 'pointer' : 'not-allowed',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  opacity: isAvailable ? 1 : 0.65,
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>{pm.title}</span>
                  {!isAvailable && (
                    <span style={{
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      padding: '1px 5px',
                      borderRadius: '4px',
                      background: 'var(--border-color)',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase'
                    }}>
                      Soon
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px', fontWeight: 500 }}>
                  {pm.sub}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{
        background: 'var(--bg-subtle)',
        border: '1px solid var(--border-color)',
        borderRadius: '14px',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {paymentMethod === 'QRIS' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Official Store QRIS
                </div>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '1px' }}>
                  {storeName}
                </div>
              </div>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: '6px',
                background: 'var(--bg-surface, #FFFFFF)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)'
              }}>
                All Payment Apps
              </span>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px',
              background: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid var(--border-color)'
            }}>
              <img
                src={storeQrisUrl}
                alt="Store QRIS"
                style={{
                  width: '175px',
                  height: '175px',
                  objectFit: 'contain',
                  borderRadius: '4px'
                }}
              />
              <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '6px', fontWeight: 500, textAlign: 'center' }}>
                Scan with BCA, Livin, GoPay, OVO, ShopeePay, DANA, etc.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => onDownloadQris(storeQrisUrl)}
                style={{
                  flex: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  background: 'var(--bg-surface, #FFFFFF)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Download size={13} />
                <span>Download QR</span>
              </button>

              <button
                type="button"
                onClick={() => onCopy(String(totalAmount), 'qris-amt')}
                style={{
                  flex: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  background: 'var(--bg-surface, #FFFFFF)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {copiedField === 'qris-amt' ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
                <span>{copiedField === 'qris-amt' ? 'Copied!' : `Copy Rp ${totalAmount.toLocaleString('id-ID')}`}</span>
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Bank / E-Wallet Transfer Destination
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginTop: '2px' }}>
                Send payment matching the total due to the store's official account:
              </div>
            </div>

            <div style={{
              background: 'var(--bg-surface, #FFFFFF)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  color: 'var(--text-main)',
                  letterSpacing: '0.3px'
                }}>
                  {storePaymentProvider}
                </span>

                <button
                  type="button"
                  onClick={() => onCopy(String(totalAmount), 'tf-amt')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: 'transparent',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    cursor: 'pointer'
                  }}
                >
                  {copiedField === 'tf-amt' ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
                  <span>{copiedField === 'tf-amt' ? 'Copied' : `Rp ${totalAmount.toLocaleString('id-ID')}`}</span>
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                    Account Number / E-Wallet Account
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, fontFamily: 'monospace', color: 'var(--text-main)', letterSpacing: '0.5px', marginTop: '1px' }}>
                    {storeAccountNumber}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onCopy(storeAccountNumber, 'tf-acc')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  {copiedField === 'tf-acc' ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
                  <span>{copiedField === 'tf-acc' ? 'Copied!' : 'Copy Number'}</span>
                </button>
              </div>

              <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Account Holder: <strong style={{ color: 'var(--text-main)' }}>{storeAccountHolder}</strong>
              </div>
            </div>
          </div>
        )}

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Payment Proof <span style={{ color: '#EF4444' }}>*Required</span>
            </label>
            {paymentProof && (
              <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <CheckCircle2 size={12} color="#10B981" />
                <span>Attached</span>
              </span>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={onFileChange}
          />

          {!paymentProof ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: '1.5px dashed var(--border-color)',
                background: 'var(--bg-surface, #FFFFFF)',
                color: 'var(--text-main)',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.15s ease'
              }}
            >
              <Upload size={16} color="var(--text-muted)" />
              <span>{isUploadingProof ? 'Loading image...' : 'Upload Transfer Proof Photo / Screenshot'}</span>
            </button>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'var(--bg-surface, #FFFFFF)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '8px 10px'
            }}>
              <img
                src={paymentProof}
                alt="Transfer Proof"
                style={{
                  width: '46px',
                  height: '46px',
                  objectFit: 'cover',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)'
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Transfer Proof Attached
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Photo ready to send to the store
                </div>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: '5px 10px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  cursor: 'pointer'
                }}
              >
                Change
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{
        background: 'var(--bg-subtle)',
        padding: '14px 16px',
        borderRadius: '14px',
        border: '1px solid var(--border-color)',
        fontSize: '0.82rem',
        color: 'var(--text-sub)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Subtotal ({itemCount} item)</span>
          <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Rp {subtotal.toLocaleString('id-ID')}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Delivery fee</span>
          <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>
            {deliveryOrServiceFee > 0 ? `Rp ${deliveryOrServiceFee.toLocaleString('id-ID')}` : 'Free'}
          </span>
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontWeight: 700,
          color: 'var(--text-main)',
          paddingTop: '8px',
          marginTop: '2px',
          borderTop: '1px solid var(--border-color)',
          fontSize: '0.92rem'
        }}>
          <span>Total payment</span>
          <span>Rp {totalAmount.toLocaleString('id-ID')}</span>
        </div>
      </div>
    </>
  );
};
