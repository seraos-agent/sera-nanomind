import React from 'react';
import type { MarketplaceOrder } from '../types';

interface OrderSuccessModalProps {
  order: MarketplaceOrder;
  onClose: () => void;
  onViewOrders?: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
  onViewOrders,
}) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-surface, #FFFFFF)',
          border: '1px solid var(--border-color, #E2E8F0)',
          borderRadius: 'var(--radius-xl, 20px)',
          maxWidth: '420px',
          width: '100%',
          padding: '24px 20px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-modal, 0 16px 40px rgba(0, 0, 0, 0.12))',
          boxSizing: 'border-box'
        }}
      >
        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: 800,
          color: 'var(--text-main, #0F172A)',
          margin: '0 0 6px 0',
          letterSpacing: '-0.2px'
        }}>
          Order Placed Successfully!
        </h2>

        <p style={{
          fontSize: '0.84rem',
          color: 'var(--text-sub, #475569)',
          lineHeight: 1.5,
          margin: 0,
          padding: '0 4px'
        }}>
          Thank you <strong>{order.customer.name}</strong>. Your order has been recorded in the store system.
        </p>

        {/* Receipt Detail Box */}
        <div style={{
          background: 'var(--bg-subtle, #F8FAFC)',
          border: '1px solid var(--border-color, #E2E8F0)',
          borderRadius: '16px',
          padding: '16px 18px',
          textAlign: 'left',
          fontSize: '0.82rem',
          margin: '20px 0',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted, #64748B)' }}>Order ID</span>
            <strong style={{ color: 'var(--text-main, #0F172A)', fontFamily: 'monospace', fontSize: '0.82rem', letterSpacing: '0.3px' }}>
              {order.id}
            </strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted, #64748B)' }}>Destination Store</span>
            <strong style={{ color: 'var(--text-main, #0F172A)' }}>{order.storeName}</strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted, #64748B)' }}>Payment</span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '2px 8px',
              borderRadius: '9999px',
              background: '#ECFDF5',
              border: '1px solid #A7F3D0',
              color: '#065F46',
              fontSize: '0.74rem',
              fontWeight: 700
            }}>
              {order.paymentMethod} • {order.paymentStatus}
            </span>
          </div>

          {order.customer.bookingDate && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted, #64748B)' }}>Service Schedule</span>
              <strong style={{ color: 'var(--color-brand, #059669)' }}>{order.customer.bookingDate}</strong>
            </div>
          )}

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '10px',
            marginTop: '2px',
            borderTop: '1px dashed var(--border-color, #E2E8F0)',
            fontSize: '0.92rem',
            fontWeight: 700
          }}>
            <span style={{ color: 'var(--text-main, #0F172A)' }}>Order Total</span>
            <span style={{ color: 'var(--color-brand, #059669)', fontSize: '1rem', fontWeight: 800 }}>
              Rp {order.totalAmount.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
          <button
            type="button"
            onClick={onViewOrders || onClose}
            style={{
              width: '100%',
              padding: '12px 20px',
              borderRadius: 'var(--radius-full, 9999px)',
              border: 'none',
              background: 'var(--color-brand, #059669)',
              color: '#FFFFFF',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.92')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            View Order Status
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: '100%',
              padding: '10px 20px',
              borderRadius: 'var(--radius-full, 9999px)',
              border: '1px solid var(--border-color, #E2E8F0)',
              background: 'transparent',
              color: 'var(--text-sub, #475569)',
              fontSize: '0.84rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--bg-subtle, #F8FAFC)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};
