import { Check } from 'lucide-react';
import type { ThemeType } from '../../../../../theme';

interface ShippingFooterBarProps {
  theme: ThemeType;
  atLeastOneActive: boolean;
  isSaved: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function ShippingFooterBar({
  theme,
  atLeastOneActive,
  isSaved,
  onClose,
  onSave,
}: ShippingFooterBarProps) {
  return (
    <div
      style={{
        flexShrink: 0,
        background: theme.surface,
        borderTop: `1px solid ${theme.border}`,
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        boxShadow: '0 -4px 16px rgba(0,0,0,0.06)',
      }}
    >
      <div
        style={{
          maxWidth: 600,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 10,
        }}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: 20,
            background: theme.surface2,
            border: `1px solid ${theme.border}`,
            color: theme.ink,
            fontSize: 13.5,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={onSave}
          disabled={!atLeastOneActive}
          style={{
            flex: 2,
            padding: '12px 16px',
            borderRadius: 20,
            background: atLeastOneActive ? theme.ink : theme.surface2,
            border: `1px solid ${atLeastOneActive ? theme.ink : theme.border}`,
            color: atLeastOneActive ? theme.bg : theme.inkSoft,
            fontSize: 13.5,
            fontWeight: 700,
            cursor: atLeastOneActive ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'all 0.15s ease',
            boxShadow: atLeastOneActive ? '0 4px 14px rgba(0, 0, 0, 0.12)' : 'none',
          }}
        >
          {isSaved ? <Check size={18} /> : null}
          <span>{isSaved ? 'Saved!' : 'Save Settings'}</span>
        </button>
      </div>
    </div>
  );
}

