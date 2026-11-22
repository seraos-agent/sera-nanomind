import { X } from 'lucide-react';
import type { ThemeType } from '../../../theme';
import type { BalanceModalState } from './types';

interface ConfirmServiceModalProps {
  theme: ThemeType;
  balanceModal: BalanceModalState;
  onClose: () => void;
  onDevMockSubscribe: (tier: 'FREE' | 'STARTER' | 'ENTERPRISE') => void;
  onDevMockTopup: (amountUsdc: number) => void;
}

export function ConfirmServiceModal({
  theme,
  balanceModal,
  onClose,
  onDevMockSubscribe,
  onDevMockTopup,
}: ConfirmServiceModalProps) {
  if (!balanceModal || !balanceModal.isOpen) return null;

  return (
    <div
      className="profile-dialog-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        className="profile-dialog-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 420,
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 22,
          padding: 24,
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: theme.ink }}>Confirm Service</div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: theme.inkSoft, cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        <div
          style={{
            background: theme.surface2,
            border: `1px solid ${theme.border}`,
            borderRadius: 14,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: theme.inkSoft }}>Plan:</span>
            <span style={{ fontWeight: 600, color: theme.ink }}>{balanceModal.itemName}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: theme.inkSoft }}>Amount:</span>
            <span style={{ fontWeight: 800, color: theme.status, fontSize: 15 }}>
              Rp {balanceModal.requiredAmount.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
          {import.meta.env.DEV && balanceModal.tierKey && (
            <button
              onClick={() => {
                const tier = balanceModal.tierKey!;
                onClose();
                onDevMockSubscribe(tier);
              }}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 20,
                border: 'none',
                background: theme.ink,
                color: theme.bg,
                fontSize: 13.5,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Activate Directly via Dev Simulator
            </button>
          )}

          {import.meta.env.DEV && !balanceModal.tierKey && (
            <button
              onClick={() => {
                const mockAmount = balanceModal.requiredAmount >= 75000 ? 5 : 1;
                onClose();
                onDevMockTopup(mockAmount);
              }}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 20,
                border: 'none',
                background: theme.ink,
                color: theme.bg,
                fontSize: 13.5,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Top Up Directly via Dev Simulator
            </button>
          )}

          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: 20,
              border: `1px solid ${theme.border}`,
              background: 'transparent',
              color: theme.inkSoft,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cancel / Back
          </button>
        </div>
      </div>
    </div>
  );
}

