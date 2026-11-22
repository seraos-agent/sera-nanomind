import type { ThemeType } from '../../../../../theme';
import { CourierCard } from '../../courier/components/CourierCard';
import type { useMerchantCouriers } from '../../courier/hooks/useMerchantCouriers';

interface CourierFleetCardProps {
  theme: ThemeType;
  isMobileView?: boolean;
  couriers: ReturnType<typeof useMerchantCouriers>;
}

export function CourierFleetCard({
  theme,
  isMobileView,
  couriers,
}: CourierFleetCardProps) {
  return (
    <div
      style={{
        padding: isMobileView ? '18px 16px' : '20px 20px',
        borderRadius: 20,
        border: `1px solid ${theme.border}`,
        background: theme.surface,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        transition: 'all 0.15s ease',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: theme.ink }}>
            Kurir Toko
          </div>

          <button
            type="button"
            onClick={() => couriers.setShowAddModal(true)}
            style={{
              padding: '6px 16px',
              borderRadius: 20,
              background: theme.ink,
              color: theme.bg,
              border: 'none',
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer',
              flexShrink: 0,
              boxShadow: '0 2px 5px rgba(0,0,0,0.06)',
              transition: 'opacity 0.15s ease',
            }}
          >
            Tambah
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ fontSize: 12.5, color: theme.inkSoft }}>
            Staf pengantar pesanan langsung ke pembeli
          </div>

          <span
            style={{
              fontSize: 11.5,
              fontWeight: 600,
              color: theme.inkSoft,
              padding: '2px 8px',
              borderRadius: 10,
              background: theme.surface2,
              border: `1px solid ${theme.border}`,
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {couriers.linkedCouriers.length} Kurir
          </span>
        </div>
      </div>

      {/* Body: List or Clean Empty State */}
      {couriers.linkedCouriers.length === 0 ? (
        <div
          style={{
            padding: '20px 16px',
            textAlign: 'center',
            background: theme.surface2,
            borderRadius: 14,
            border: `1px dashed ${theme.border}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <div style={{ fontSize: 13, color: theme.inkSoft }}>
            Belum ada kurir terdaftar di toko Anda.
          </div>
          <button
            type="button"
            onClick={() => couriers.setShowAddModal(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: theme.ink,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              padding: 0,
              textDecoration: 'underline',
            }}
          >
            + Daftarkan Kurir Pertama
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {couriers.linkedCouriers.map((courier) => (
            <CourierCard
              key={courier.id}
              courier={courier}
              theme={theme}
              isMobileView={isMobileView}
              isCopied={Boolean(courier.activationCode && couriers.copiedCourierCode === courier.activationCode)}
              onCopyCode={couriers.handleCopyCourierCode}
              onShareWhatsApp={couriers.handleShareCourierWhatsApp}
              onRequestResetCode={couriers.setCourierToReset}
              onRequestSetPin={couriers.setCourierToSetPin}
              onRequestUnlink={couriers.setCourierToDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

