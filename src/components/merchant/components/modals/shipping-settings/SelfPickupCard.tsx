import type { ThemeType } from '../../../../../theme';
import { getStoreEntityLabel, type StoreType } from '../../../types';
import { ShippingToggleSwitch } from './ShippingToggleSwitch';

interface SelfPickupCardProps {
  theme: ThemeType;
  isMobileView?: boolean;
  storeType?: StoreType;
  selfPickup: boolean;
  onToggleSelfPickup: () => void;
}

export function SelfPickupCard({
  theme,
  isMobileView,
  storeType,
  selfPickup,
  onToggleSelfPickup,
}: SelfPickupCardProps) {
  const entity = getStoreEntityLabel(storeType);
  const entityLower = getStoreEntityLabel(storeType, true);
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
        onClick={onToggleSelfPickup}
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
            Ambil di {entity}
          </div>

          <ShippingToggleSwitch checked={selfPickup} theme={theme} />
        </div>

        <p style={{ margin: 0, fontSize: 13, color: theme.inkSoft, lineHeight: 1.45 }}>
          Pembeli mengambil pesanan secara langsung di {entityLower} fisik Anda.
        </p>
      </div>
    </div>
  );
}

