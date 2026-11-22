import type { ThemeType } from '../../../../../theme';

interface ShippingToggleSwitchProps {
  checked: boolean;
  theme: ThemeType;
}

export function ShippingToggleSwitch({ checked, theme }: ShippingToggleSwitchProps) {
  return (
    <div
      style={{
        width: 44,
        height: 26,
        borderRadius: 13,
        background: checked ? theme.ink : theme.surface2,
        border: `1px solid ${checked ? theme.ink : theme.border}`,
        position: 'relative',
        boxSizing: 'border-box',
        transition: 'background 0.2s ease, border-color 0.2s ease',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 20,
          height: 20,
          minWidth: 20,
          minHeight: 20,
          aspectRatio: '1 / 1',
          borderRadius: '50%',
          background: checked ? theme.bg : theme.surface,
          border: checked ? 'none' : `1px solid ${theme.border}`,
          position: 'absolute',
          top: 2,
          left: 2,
          boxSizing: 'border-box',
          flexShrink: 0,
          transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), background 0.2s ease',
          transform: checked ? 'translateX(18px)' : 'translateX(0)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.15)',
        }}
      />
    </div>
  );
}

