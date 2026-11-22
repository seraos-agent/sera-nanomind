import type { ThemeType } from '../../../../../theme';
import { ShippingToggleSwitch } from './ShippingToggleSwitch';

interface RegularCourierCardProps {
  theme: ThemeType;
  isMobileView?: boolean;
  regularCourier: boolean;
  onToggleRegularCourier: () => void;
}

export function RegularCourierCard({
  theme,
  isMobileView,
  regularCourier,
  onToggleRegularCourier,
}: RegularCourierCardProps) {
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
        transition: 'all 0.15s ease',
      }}
    >
      <div
        onClick={onToggleRegularCourier}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 700, color: theme.ink }}>
            Ekspedisi Reguler
          </div>

          <ShippingToggleSwitch checked={regularCourier} theme={theme} />
        </div>

        <p style={{ margin: 0, fontSize: 13, color: theme.inkSoft, lineHeight: 1.45 }}>
          Pengiriman paket pesanan melalui jasa kurir logistik (JNE, J&T, SiCepat).
        </p>
      </div>
    </div>
  );
}

