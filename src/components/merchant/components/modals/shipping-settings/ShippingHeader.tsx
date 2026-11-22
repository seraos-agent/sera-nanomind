import { ChevronLeft, Check } from 'lucide-react';
import type { ThemeType } from '../../../../../theme';
import { getStoreEntityLabel, type StoreType } from '../../../types';

interface ShippingHeaderProps {
  theme: ThemeType;
  isMobileView?: boolean;
  storeType?: StoreType;
  atLeastOneActive: boolean;
  isSaved: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function ShippingHeader({
  theme,
  isMobileView,
  storeType,
  atLeastOneActive,
  isSaved,
  onClose,
  onSave,
}: ShippingHeaderProps) {
  const entity = getStoreEntityLabel(storeType);
  return (
    <div
      style={{
        background: theme.surface,
        borderBottom: `1px solid ${theme.border}`,
        padding: isMobileView ? '14px 16px' : '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          type="button"
          onClick={onClose}
          title="Kembali"
          style={{
            background: theme.surface2,
            border: `1px solid ${theme.border}`,
            borderRadius: '50%',
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: theme.ink,
            transition: 'all 0.15s ease',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = theme.border;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = theme.surface2;
          }}
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: theme.ink }}>
            Atur Pengiriman {entity}
          </div>
          <div style={{ fontSize: 12, color: theme.inkSoft, marginTop: 1 }}>
            Kelola metode pengiriman
          </div>
        </div>
      </div>

      {/* Quick Save on Desktop */}
      {!isMobileView && (
        <button
          type="button"
          onClick={onSave}
          disabled={!atLeastOneActive}
          style={{
            padding: '8px 18px',
            borderRadius: 10,
            background: atLeastOneActive ? theme.ink : theme.surface2,
            border: `1px solid ${atLeastOneActive ? theme.ink : theme.border}`,
            color: atLeastOneActive ? theme.bg : theme.inkSoft,
            fontSize: 12.5,
            fontWeight: 700,
            cursor: atLeastOneActive ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'all 0.15s ease',
          }}
        >
          {isSaved ? <Check size={16} /> : null}
          <span>{isSaved ? 'Tersimpan!' : 'Simpan'}</span>
        </button>
      )}
    </div>
  );
}

