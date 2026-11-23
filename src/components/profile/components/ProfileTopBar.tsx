import { ArrowLeft, Sun, Moon } from 'lucide-react';
import type { ThemeType } from '../../../theme';
import type { ProfileViewMode } from './types';

interface ProfileTopBarProps {
  theme: ThemeType;
  viewMode: ProfileViewMode;
  mode: 'light' | 'dark';
  onModeChange: (mode: 'light' | 'dark') => void;
  onBackClick: () => void;
}

export function ProfileTopBar({
  theme,
  viewMode,
  mode,
  onModeChange,
  onBackClick,
}: ProfileTopBarProps) {
  const getTitle = () => {
    switch (viewMode) {
      case 'profile':
        return 'Profile';
      case 'address':
        return 'Address';
      case 'privacy':
        return 'Privacy';
      case 'notification':
        return 'Notifications';
      default:
        return 'Settings';
    }
  };

  return (
    <div
      style={{
        height: 60,
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        background: theme.bg,
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      <button
        onClick={onBackClick}
        className="profile-button-secondary"
        aria-label="Back"
        style={{
          border: 'none',
          background: 'transparent',
          color: theme.ink,
          padding: 8,
          borderRadius: 8,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ArrowLeft size={22} />
      </button>

      <h1
        style={{
          fontFamily: "Newsreader, 'Times New Roman', Georgia, serif",
          fontSize: 22,
          fontWeight: 700,
          color: theme.ink,
          margin: 0,
          letterSpacing: -0.3,
        }}
      >
        {getTitle()}
      </h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button
          type="button"
          onClick={() => onModeChange(mode === 'dark' ? 'light' : 'dark')}
          aria-label={mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
          title={mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
          style={{
            border: 'none',
            background: 'transparent',
            outline: 'none',
            boxShadow: 'none',
            color: theme.ink,
            padding: 8,
            borderRadius: 8,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'opacity 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.75')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          {mode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </div>
  );
}

