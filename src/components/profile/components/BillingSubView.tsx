import { Zap, Lock, Loader2 } from 'lucide-react';
import type { ThemeType } from '../../../theme';
import type { BillingState } from '../../../hooks/useBilling';

interface BillingSubViewProps {
  theme: ThemeType;
  billingState: BillingState;
  currentTier: string;
  isUnlimited: boolean;
  agentCredits: number;
  selectedTopup: number;
  setSelectedTopup: (val: number) => void;
  isPayAsYouGoUnlocked: boolean;
  isProcessing: boolean;
  onSubscribePass: (tier: 'STARTER' | 'ENTERPRISE') => void;
  onTopupCredits: (amountRp: number) => void;
  onDevMockSubscribe: (tier: 'FREE' | 'STARTER' | 'ENTERPRISE') => void;
  onDevMockTopup: (amountUsdc: number) => void;
}

export function BillingSubView({
  theme,
  billingState,
  currentTier,
  isUnlimited,
  agentCredits,
  selectedTopup,
  setSelectedTopup,
  isPayAsYouGoUnlocked,
  isProcessing,
  onSubscribePass,
  onTopupCredits,
  onDevMockSubscribe,
  onDevMockTopup,
}: BillingSubViewProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Plan Status Card */}
      <div
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 20,
          padding: 22,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 13, color: theme.inkSoft, fontWeight: 600 }}>ACTIVE PLAN</div>
          <span style={{ fontSize: 11, fontWeight: 700, color: theme.status, background: theme.statusSoft, padding: '3px 8px', borderRadius: 8 }}>
            ACTIVE
          </span>
        </div>

        <div style={{ fontSize: 24, fontWeight: 800, color: theme.ink }}>
          {currentTier === 'ENTERPRISE' ? 'Enterprise Pass' : currentTier === 'STARTER' ? 'Starter Pass' : 'Free Explorer'}
        </div>

        <div style={{ fontSize: 13.5, color: theme.inkSoft }}>
          Remaining Quota: <strong style={{ color: theme.ink }}>{isUnlimited ? '∞ Unlimited' : `${agentCredits.toLocaleString('id-ID')} Credits`}</strong>
        </div>

        <div style={{ height: 1, background: theme.border, margin: '8px 0' }} />

        <div style={{ fontSize: 12, color: theme.inkSoft }}>
          {billingState.tierExpiresAt
            ? `Auto-renewal: ${new Date(billingState.tierExpiresAt).toLocaleDateString('en-US')}`
            : 'Free tier with no time limit'}
        </div>
      </div>

      {/* Upgrade Tiers (3 Options) */}
      <div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: theme.ink, margin: '0 0 12px' }}>
          Membership Plans
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Free */}
          <div
            style={{
              padding: 16,
              borderRadius: 16,
              border: `1px solid ${currentTier === 'FREE' ? theme.ink : theme.border}`,
              background: theme.surface,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: theme.ink }}>Free Explorer</div>
              <div style={{ fontSize: 13, color: theme.inkSoft, marginTop: 2 }}>Rp 0 / forever • 1,000,000 Starter Credits</div>
            </div>
            {currentTier === 'FREE' ? (
              <span style={{ fontSize: 12, fontWeight: 700, color: theme.inkSoft }}>Active ✓</span>
            ) : null}
          </div>

          {/* Starter */}
          <div
            style={{
              padding: 16,
              borderRadius: 16,
              border: `1.5px solid ${currentTier === 'STARTER' ? theme.status : theme.border}`,
              background: theme.surface,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: theme.ink }}>Starter Pass</span>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 6, background: theme.statusSoft, color: theme.status }}>
                  POPULAR
                </span>
              </div>
              <div style={{ fontSize: 13, color: theme.inkSoft, marginTop: 2 }}>Rp 75,000 / month • 1,500,000 Monthly Credits</div>
            </div>

            {currentTier === 'STARTER' ? (
              <span style={{ fontSize: 12, fontWeight: 700, color: theme.status }}>Active ✓</span>
            ) : (
              <button
                onClick={() => onSubscribePass('STARTER')}
                style={{
                  borderRadius: 20,
                  padding: '7px 16px',
                  border: 'none',
                  background: theme.ink,
                  color: theme.bg,
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Select
              </button>
            )}
          </div>

          {/* Enterprise */}
          <div
            style={{
              padding: 16,
              borderRadius: 16,
              border: `1.5px solid ${currentTier === 'ENTERPRISE' ? theme.accent : theme.border}`,
              background: theme.surface,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: theme.ink }}>Enterprise Pass</div>
              <div style={{ fontSize: 13, color: theme.inkSoft, marginTop: 2 }}>Rp 450,000 / month • 10,000,000 Monthly Credits</div>
            </div>

            {currentTier === 'ENTERPRISE' ? (
              <span style={{ fontSize: 12, fontWeight: 700, color: theme.accent }}>Active ✓</span>
            ) : (
              <button
                onClick={() => onSubscribePass('ENTERPRISE')}
                style={{
                  borderRadius: 20,
                  padding: '7px 16px',
                  border: 'none',
                  background: theme.ink,
                  color: theme.bg,
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Select
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Top Up On-Demand Grid */}
      <div
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 20,
          padding: 20,
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 700, color: theme.ink, margin: '0 0 4px' }}>
          Flexible Credit Top-Up
        </h3>
        <p style={{ fontSize: 13, color: theme.inkSoft, margin: '0 0 16px' }}>
          Compute credits never expire.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { val: 15000, credits: '200K', bonus: null },
            { val: 75000, credits: '1.2M', bonus: '+20%' },
            { val: 150000, credits: '2.6M', bonus: '+30%' },
            { val: 300000, credits: '6.0M', bonus: '+50%' },
          ].map(pkg => {
            const isSelected = selectedTopup === pkg.val;
            return (
              <button
                key={pkg.val}
                onClick={() => setSelectedTopup(pkg.val)}
                style={{
                  padding: 14,
                  borderRadius: 14,
                  border: `1.5px solid ${isSelected ? theme.ink : theme.border}`,
                  background: isSelected ? theme.surface2 : theme.surface,
                  color: theme.ink,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  position: 'relative',
                }}
              >
                {pkg.bonus && (
                  <div style={{ position: 'absolute', top: -7, right: -4, background: theme.statusSoft, color: theme.status, fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 6 }}>
                    {pkg.bonus}
                  </div>
                )}
                <span style={{ fontSize: 15, fontWeight: 700 }}>Rp {pkg.val.toLocaleString('id-ID')}</span>
                <span style={{ fontSize: 12, color: theme.inkSoft }}>{pkg.credits} Kredit</span>
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: 16 }}>
          {!isPayAsYouGoUnlocked ? (
            <button
              onClick={() => onSubscribePass('STARTER')}
              style={{
                width: '100%',
                padding: '12px 20px',
                borderRadius: 20,
                border: 'none',
                background: theme.ink,
                color: theme.bg,
                fontSize: 13.5,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <Lock size={15} />
              <span>Unlock Starter Pass to Top Up</span>
            </button>
          ) : (
            <button
              onClick={() => onTopupCredits(selectedTopup)}
              disabled={isProcessing}
              style={{
                width: '100%',
                padding: '12px 20px',
                borderRadius: 20,
                border: 'none',
                background: theme.ink,
                color: theme.bg,
                fontSize: 13.5,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {isProcessing ? (
                <>
                  <Loader2 size={16} className="spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Zap size={16} />
                  <span>Top Up Rp {selectedTopup.toLocaleString('id-ID')}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Dev Simulation */}
      {import.meta.env.DEV && (
        <div style={{ padding: 14, borderRadius: 14, background: theme.surface2, border: `1px dashed ${theme.border}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: theme.ink }}>Dev Simulator (Local):</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={() => onDevMockSubscribe('STARTER')}
              style={{ padding: '6px 12px', borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.surface, color: theme.ink, fontSize: 11, cursor: 'pointer' }}
            >
              Unlock Starter
            </button>
            <button
              onClick={() => onDevMockSubscribe('FREE')}
              style={{ padding: '6px 12px', borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.surface, color: theme.inkSoft, fontSize: 11, cursor: 'pointer' }}
            >
              Reset Free
            </button>
            <button
              onClick={() => onDevMockTopup(1)}
              style={{ padding: '6px 12px', borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.surface, color: theme.ink, fontSize: 11, cursor: 'pointer' }}
            >
              Mock Top-Up Rp 15K
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

