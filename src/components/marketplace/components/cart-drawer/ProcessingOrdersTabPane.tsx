import React from 'react';
import type { MarketplaceOrder } from '../../types';
import { ProcessingIcon, DeliveryTruckIcon, WhatsAppIcon } from '../Icons';

interface ProcessingOrdersTabPaneProps {
  orders: MarketplaceOrder[];
  onCompleteOrder?: (orderId: string) => void;
  onWhatsAppContact: (order: MarketplaceOrder) => void;
}

export const ProcessingOrdersTabPane: React.FC<ProcessingOrdersTabPaneProps> = ({
  orders,
  onCompleteOrder,
  onWhatsAppContact,
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
          gap: '12px',
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
              <ProcessingIcon size={46} color="currentColor" />
            </div>
            <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px', fontSize: '0.95rem' }}>
              Tidak Ada Pesanan Diproses
            </div>
            <p style={{ fontSize: '0.78rem', lineHeight: 1.5, margin: 0 }}>
              Pesanan baru yang sedang disiapkan penjual akan muncul di sini.
            </p>
          </div>
        ) : (
          orders.map((ord) => {
            const isCourierDelivery =
              ord.shippingMethod !== 'PICKUP' &&
              (!ord.customer?.address || ord.customer.address !== 'Ambil di Toko');
            const isShipped = ord.orderStatus === 'SHIPPED' || ord.orderStatus === 'DELIVERED';
            const isDelivered = ord.orderStatus === 'DELIVERED';

            return (
              <div
                key={ord.id}
                style={{
                  background: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  flexShrink: 0,
                }}
              >
                {/* Order Card Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: '0.92rem',
                      color: 'var(--text-main)',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {ord.storeName}
                  </div>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      color: isDelivered ? '#059669' : isShipped ? 'var(--color-brand)' : 'var(--text-muted)',
                    }}
                  >
                    {isDelivered
                      ? 'Pesanan Tiba'
                      : isShipped
                      ? 'Sedang Dikirim'
                      : !isCourierDelivery
                      ? 'Ambil di Toko'
                      : 'Sedang Diproses'}
                  </span>
                </div>

                {/* Delivery Timeline Tracker */}
                {isCourierDelivery && (
                  <div
                    style={{
                      padding: '4px 0 10px',
                      borderBottom: '1px solid var(--border-light)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                    }}
                  >
                    {/* Timeline Bar */}
                    <div style={{ width: '100%' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          position: 'relative',
                          height: '22px',
                          margin: '0 6px',
                        }}
                      >
                        {/* Dot: Proses */}
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: 'var(--text-main)',
                            zIndex: 2,
                            flexShrink: 0,
                          }}
                        />

                        {/* Active/Inactive Line (Dot to Truck) */}
                        <div
                          style={{
                            flex: 1,
                            height: 2,
                            background: isShipped ? 'var(--text-main)' : 'var(--border-color)',
                            transition: 'background 0.3s ease',
                            zIndex: 1,
                          }}
                        />

                        {/* Truck with Speedlines */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: isShipped ? 'var(--text-main)' : 'var(--text-muted)',
                            opacity: isShipped ? 1 : 0.4,
                            transition: 'all 0.3s ease',
                            zIndex: 2,
                            padding: '0 4px',
                            flexShrink: 0,
                          }}
                        >
                          <DeliveryTruckIcon size={24} color={isShipped ? 'var(--text-main)' : 'var(--text-muted)'} />
                        </div>

                        {/* Active/Inactive Line (Truck to Check) */}
                        <div
                          style={{
                            flex: 1,
                            height: 2,
                            background: isDelivered ? 'var(--text-main)' : 'var(--border-color)',
                            transition: 'background 0.3s ease',
                            zIndex: 1,
                          }}
                        />

                        {/* Check Circle: Tiba */}
                        <div
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: '50%',
                            border: isDelivered ? '1.5px solid var(--text-main)' : '1.5px solid var(--border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: isDelivered ? '#FFFFFF' : 'var(--text-muted)',
                            background: isDelivered ? 'var(--text-main)' : 'transparent',
                            transition: 'all 0.3s ease',
                            zIndex: 2,
                            flexShrink: 0,
                          }}
                        >
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                      </div>

                      {/* Labels: Proses, Dikirim, Tiba */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginTop: '5px',
                          fontSize: '0.72rem',
                          fontFamily: "'Inter', sans-serif",
                        }}
                      >
                        <div
                          style={{
                            color: 'var(--text-main)',
                            fontWeight: 700,
                            textAlign: 'left',
                            minWidth: '45px',
                          }}
                        >
                          Proses
                        </div>
                        <div
                          style={{
                            color: isShipped ? 'var(--text-main)' : 'var(--text-muted)',
                            fontWeight: isShipped ? 700 : 500,
                            textAlign: 'center',
                            flex: 1,
                            transition: 'color 0.3s ease',
                          }}
                        >
                          Dikirim
                        </div>
                        <div
                          style={{
                            color: isDelivered ? 'var(--text-main)' : 'var(--text-muted)',
                            fontWeight: isDelivered ? 700 : 500,
                            textAlign: 'right',
                            minWidth: '45px',
                            transition: 'color 0.3s ease',
                          }}
                        >
                          Tiba
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Items List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {ord.items.map((it, itemIdx) => (
                    <div
                      key={itemIdx}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem' }}
                    >
                      <div
                        style={{
                          width: '38px',
                          height: '38px',
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
                            fontWeight: 600,
                            color: 'var(--text-main)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {it.name}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {it.quantity}x @ Rp {it.price.toLocaleString('id-ID')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Total & Actions */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    paddingTop: '8px',
                    borderTop: '1px dashed var(--border-color)',
                    marginTop: '2px',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      Total Pembayaran • <span style={{ fontFamily: 'monospace' }}>{ord.id}</span>
                    </div>
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        color: 'var(--color-goods)',
                        lineHeight: 1.2,
                        marginTop: '2px',
                      }}
                    >
                      Rp {ord.totalAmount.toLocaleString('id-ID')}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => onWhatsAppContact(ord)}
                      style={{
                        height: '28px',
                        padding: '0 10px',
                        borderRadius: '6px',
                        background: 'var(--bg-surface, #FFFFFF)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-main)',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        boxSizing: 'border-box',
                      }}
                    >
                      <WhatsAppIcon size={14} />
                      <span>Chat</span>
                    </button>

                    {onCompleteOrder && (isDelivered || !isCourierDelivery) && (
                      <button
                        type="button"
                        onClick={() => onCompleteOrder(ord.id)}
                        style={{
                          height: '28px',
                          padding: '0 14px',
                          borderRadius: '6px',
                          background: 'var(--color-brand)',
                          border: 'none',
                          color: '#FFFFFF',
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: "'Inter', sans-serif",
                          boxSizing: 'border-box',
                        }}
                      >
                        <span>Selesai</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

