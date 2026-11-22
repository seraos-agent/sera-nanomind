import React, { useState } from 'react';
import { UserIcon } from './Icons';

interface UserAuthModalProps {
  onClose: () => void;
  onSuccess?: (userData: { email: string; phone: string }) => void;
}

export const UserAuthModal: React.FC<UserAuthModalProps> = ({
  onClose,
  onSuccess
}) => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !phone.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setMessage('✅ Registration successful! Welcome to SERA Market.');
      if (onSuccess) {
        onSuccess({ email, phone });
      }
      setTimeout(() => {
        onClose();
      }, 1200);
    }, 600);
  };

  return (
    <div className="store-modal-overlay" onClick={onClose} style={{ zIndex: 100 }}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '400px',
          width: '92%',
          background: 'var(--bg-surface, #FFFFFF)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.18)',
          border: '1px solid var(--border-light)',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease',
          position: 'relative'
        }}
      >
        {/* Header Bar */}
        <div style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-brand)'
            }}>
              <UserIcon size={22} color="var(--color-brand)" />
            </div>
            <div>
              <h3 style={{
                fontSize: '1.05rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                fontFamily: 'var(--font-heading)',
                margin: 0
              }}>
                Create User Account
              </h3>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                Access your SERA orders, history & promos
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: 'none',
              background: 'var(--bg-subtle)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.85rem',
              fontWeight: 700,
              transition: 'all 0.15s ease'
            }}
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          {message ? (
            <div style={{
              padding: '16px',
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: 'var(--radius-md)',
              color: '#15803D',
              fontSize: '0.86rem',
              fontWeight: 700,
              textAlign: 'center',
              lineHeight: 1.5
            }}>
              {message}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Field 1: Email */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  marginBottom: '5px'
                }}>
                  Email Address <span style={{ color: 'var(--color-brand)' }}>*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.86rem',
                    color: 'var(--text-main)',
                    outline: 'none',
                    transition: 'border-color 0.15s ease'
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--color-brand)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border-color)')}
                />
              </div>

              {/* Field 2: WhatsApp Number */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  marginBottom: '5px'
                }}>
                  WhatsApp Number <span style={{ color: 'var(--color-brand)' }}>*</span>
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="081234******"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.86rem',
                    color: 'var(--text-main)',
                    outline: 'none',
                    transition: 'border-color 0.15s ease'
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--color-brand)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border-color)')}
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                  Used for instant verification & order notifications.
                </span>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  marginTop: '4px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmitting ? 'Processing...' : 'Continue to Sign Up / Sign In'}
              </button>

              <div style={{
                textAlign: 'center',
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                lineHeight: 1.5,
                marginTop: '4px'
              }}>
                🔒 Securely connected to <strong>SERA Cognitive Agent OS</strong>.
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
