import {
  User,
  Sliders,
  CreditCard,
  ShieldCheck,
  MapPin,
  ChevronRight,
  LogOut,
  Bell,
} from 'lucide-react';
import type { ThemeType } from '../../../theme';

interface ProfileMainViewProps {
  theme: ThemeType;
  emailValue: string;
  userEmail?: string;
  currentTier: string;
  tokenPercent: number;
  isUnlimited: boolean;
  onOpenProfile: () => void;
  onOpenAddress: () => void;
  onOpenBilling: () => void;
  onOpenNotification: () => void;
  onOpenPrivacy: () => void;
  onDisconnect: () => void;
}

export function ProfileMainView({
  theme,
  emailValue,
  userEmail,
  currentTier,
  tokenPercent,
  isUnlimited,
  onOpenProfile,
  onOpenAddress,
  onOpenBilling,
  onOpenNotification,
  onOpenPrivacy,
  onDisconnect,
}: ProfileMainViewProps) {
  return (
    <>
      {/* Account Email & Tier Pill */}
      <div
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 18,
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div style={{ minWidth: 0, overflow: 'hidden' }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: theme.ink,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {emailValue || userEmail || 'user@seraos.xyz'}
          </div>
        </div>

        <div
          style={{
            background: theme.ink,
            color: theme.bg,
            fontSize: 12,
            fontWeight: 700,
            padding: '4px 12px',
            borderRadius: 20,
            flexShrink: 0,
            letterSpacing: 0.3,
          }}
        >
          {currentTier === 'ENTERPRISE' ? 'Enterprise' : currentTier === 'STARTER' ? 'Starter' : 'Free'}
        </div>
      </div>

      {/* Daily Token Usage Indicator Card */}
      <div
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 20,
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        {/* Progress Bar & Percentage Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              flex: 1,
              height: 8,
              borderRadius: 999,
              background: theme.border,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${tokenPercent}%`,
                height: '100%',
                borderRadius: 999,
                background:
                  tokenPercent > 30
                    ? theme.status || '#10B981'
                    : tokenPercent > 10
                    ? '#F59E0B'
                    : '#EF4444',
                transition: 'width 0.4s ease',
              }}
            />
          </div>

          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: tokenPercent > 30 ? theme.ink : '#EF4444',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              letterSpacing: '-0.2px',
            }}
          >
            {isUnlimited ? '∞' : `${tokenPercent}%`}
          </span>
        </div>

        {/* Token Label & Action Button Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: theme.ink }}>
              {currentTier === 'ENTERPRISE'
                ? 'Token Unlimited Enterprise'
                : currentTier === 'STARTER'
                ? '1.500.000 Token Starter'
                : '10.000 Token harian'}
            </span>
          </div>

          <button
            onClick={onOpenBilling}
            style={{
              background: theme.ink,
              color: theme.bg,
              border: 'none',
              borderRadius: 20,
              padding: '7px 18px',
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'opacity 0.15s ease',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Tingkatkan
          </button>
        </div>
      </div>

      {/* Menu Group 1: Profile, Address, Billing */}
      <div
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 20,
          overflow: 'hidden',
        }}
      >
        <div
          onClick={onOpenProfile}
          style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = theme.surface2)}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ color: theme.ink, display: 'flex', alignItems: 'center' }}>
              <User size={22} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: theme.ink }}>Profil</div>
          </div>
          <ChevronRight size={18} color={theme.inkSoft} />
        </div>

        <div style={{ height: 1, background: theme.border, margin: '0 20px' }} />

        <div
          onClick={onOpenAddress}
          style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = theme.surface2)}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ color: theme.ink, display: 'flex', alignItems: 'center' }}>
              <MapPin size={22} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: theme.ink }}>Alamat</div>
          </div>
          <ChevronRight size={18} color={theme.inkSoft} />
        </div>

        <div style={{ height: 1, background: theme.border, margin: '0 20px' }} />

        <div
          onClick={onOpenBilling}
          style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = theme.surface2)}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ color: theme.ink, display: 'flex', alignItems: 'center' }}>
              <CreditCard size={22} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: theme.ink }}>Penagihan</div>
          </div>
          <ChevronRight size={18} color={theme.inkSoft} />
        </div>
      </div>

      {/* Menu Group 2: Capabilities, Privacy, Logout */}
      <div
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 20,
          overflow: 'hidden',
        }}
      >
        <div
          onClick={onOpenBilling}
          style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = theme.surface2)}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ color: theme.ink, display: 'flex', alignItems: 'center' }}>
              <Sliders size={22} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: theme.ink }}>Kemampuan</div>
          </div>
          <ChevronRight size={18} color={theme.inkSoft} />
        </div>

        <div style={{ height: 1, background: theme.border, margin: '0 20px' }} />

        <div
          onClick={onOpenNotification}
          style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = theme.surface2)}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ color: theme.ink, display: 'flex', alignItems: 'center' }}>
              <Bell size={22} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: theme.ink }}>Notifikasi</div>
          </div>
          <ChevronRight size={18} color={theme.inkSoft} />
        </div>

        <div style={{ height: 1, background: theme.border, margin: '0 20px' }} />

        <div
          onClick={onOpenPrivacy}
          style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = theme.surface2)}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ color: theme.ink, display: 'flex', alignItems: 'center' }}>
              <ShieldCheck size={22} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: theme.ink }}>Privasi</div>
          </div>
          <ChevronRight size={18} color={theme.inkSoft} />
        </div>

        <div style={{ height: 1, background: theme.border, margin: '0 20px' }} />

        <div
          onClick={onDisconnect}
          style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = theme.surface2)}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ color: '#ef4444', display: 'flex', alignItems: 'center' }}>
              <LogOut size={22} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#ef4444' }}>Keluar Akun</div>
          </div>
          <ChevronRight size={18} color="#ef4444" />
        </div>
      </div>
    </>
  );
}

