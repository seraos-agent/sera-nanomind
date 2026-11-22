import React from 'react';
import { Camera, CheckCircle2, Trash2 } from 'lucide-react';
import type { ThemeType } from '../../../theme';

interface ProfileEditSubViewProps {
  theme: ThemeType;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  avatarUrl: string | null;
  userInitial: string;
  nameValue: string;
  setNameValue: (val: string) => void;
  nicknameValue: string;
  setNicknameValue: (val: string) => void;
  emailValue: string;
  phoneValue: string;
  isPhoneVerified: boolean;
  isSaving?: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEditPhotoClick: () => void;
  onRemovePhoto: () => void;
  onPhoneInputChange: (val: string) => void;
  onSaveProfile: (e?: React.FormEvent) => void;
  onOpenDeleteModal: () => void;
}

export function ProfileEditSubView({
  theme,
  fileInputRef,
  avatarUrl,
  userInitial,
  nameValue,
  setNameValue,
  nicknameValue,
  setNicknameValue,
  emailValue,
  phoneValue,
  isPhoneVerified,
  isSaving,
  onFileChange,
  onEditPhotoClick,
  onRemovePhoto,
  onPhoneInputChange,
  onSaveProfile,
  onOpenDeleteModal,
}: ProfileEditSubViewProps) {
  return (
    <form onSubmit={onSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 6 }}>
      {/* Big Centered Avatar with Edit Button */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileChange}
          accept="image/*"
          style={{ display: 'none' }}
        />

        <div
          onClick={onEditPhotoClick}
          title="Click to select a photo from gallery"
          style={{
            width: 96,
            height: 96,
            borderRadius: '50%',
            background: avatarUrl ? 'transparent' : '#6C8EBF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontSize: 40,
            fontWeight: 700,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
            position: 'relative',
            cursor: 'pointer',
            overflow: 'hidden',
            border: avatarUrl ? `2px solid ${theme.border}` : 'none',
            transition: 'transform 0.15s ease',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.transform = 'scale(1.03)')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.transform = 'scale(1)')}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Profile Photo"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <span
              style={{
                fontFamily: "Newsreader, 'Times New Roman', Georgia, serif",
                fontSize: 42,
                fontWeight: 700,
                color: '#FFFFFF',
                userSelect: 'none',
              }}
            >
              {userInitial}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            onClick={onEditPhotoClick}
            style={{
              borderRadius: 20,
              padding: '7px 18px',
              border: `1px solid ${theme.border}`,
              background: theme.surface,
              color: theme.ink,
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = theme.surface2)}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = theme.surface)}
          >
            <Camera size={14} />
            <span>Edit photo</span>
          </button>

          {avatarUrl && (
            <button
              type="button"
              onClick={onRemovePhoto}
              title="Revert to letter initial"
              style={{
                borderRadius: 20,
                padding: '7px 14px',
                border: `1px solid ${theme.border}`,
                background: 'transparent',
                color: '#ef4444',
                fontWeight: 600,
                fontSize: 12.5,
                cursor: 'pointer',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = theme.surface2)}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
            >
              Remove
            </button>
          )}
        </div>
      </div>

      {/* Form Input 1: Full Name */}
      <div>
        <label style={{ display: 'block', fontSize: 15, fontWeight: 600, color: theme.ink, marginBottom: 8 }}>
          Full name
        </label>
        <input
          type="text"
          value={nameValue}
          onChange={(e) => setNameValue(e.target.value)}
          placeholder="Example: John Doe"
          style={{
            width: '100%',
            padding: '14px 16px',
            borderRadius: 14,
            border: `1px solid ${theme.border}`,
            background: theme.surface,
            color: theme.ink,
            fontSize: 15,
            fontWeight: 500,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Form Input 2: Nickname */}
      <div>
        <label style={{ display: 'block', fontSize: 15, fontWeight: 600, color: theme.ink, marginBottom: 8 }}>
          Nickname
        </label>
        <input
          type="text"
          value={nicknameValue}
          onChange={(e) => setNicknameValue(e.target.value)}
          placeholder="Nickname (optional)"
          style={{
            width: '100%',
            padding: '14px 16px',
            borderRadius: 14,
            border: `1px solid ${theme.border}`,
            background: theme.surface,
            color: theme.ink,
            fontSize: 15,
            fontWeight: 500,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Form Input 3: Email Address */}
      <div>
        <label style={{ display: 'block', fontSize: 15, fontWeight: 600, color: theme.ink, marginBottom: 8 }}>
          Email address
        </label>
        <input
          type="email"
          value={emailValue}
          readOnly
          placeholder="name@email.com"
          style={{
            width: '100%',
            padding: '14px 16px',
            borderRadius: 14,
            border: `1px solid ${theme.border}`,
            background: theme.surface2,
            color: theme.inkSoft,
            fontSize: 15,
            fontWeight: 500,
            outline: 'none',
            boxSizing: 'border-box',
            cursor: 'not-allowed',
          }}
        />
        <div style={{ fontSize: 12, color: theme.inkSoft, marginTop: 5 }}>
          Login account email cannot be changed.
        </div>
      </div>

      {/* Form Input 4: WhatsApp */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <label style={{ fontSize: 15, fontWeight: 600, color: theme.ink }}>
            WhatsApp Number
          </label>

          {isPhoneVerified ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 12,
                fontWeight: 700,
                color: '#10B981',
                background: 'rgba(16, 185, 129, 0.12)',
                padding: '2px 8px',
                borderRadius: 12,
              }}
            >
              <CheckCircle2 size={12} />
              <span>Verified</span>
            </span>
          ) : (
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: theme.inkSoft,
                background: theme.surface2,
                border: `1px solid ${theme.border}`,
                padding: '2px 8px',
                borderRadius: 12,
              }}
            >
              WhatsApp verification coming soon
            </span>
          )}
        </div>

        <input
          type="tel"
          inputMode="numeric"
          value={phoneValue}
          onChange={(e) => onPhoneInputChange(e.target.value)}
          placeholder="Example: 081234567890"
          style={{
            width: '100%',
            padding: '14px 16px',
            borderRadius: 14,
            border: `1px solid ${theme.border}`,
            background: theme.surface,
            color: theme.ink,
            fontSize: 15,
            fontWeight: 500,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        <div style={{ fontSize: 12, color: theme.inkSoft, marginTop: 5 }}>
          Used for Marketplace order confirmation and security verification.
        </div>
      </div>

      {/* Submit Pill Button (Claude Style) */}
      <div style={{ marginTop: 12 }}>
        <button
          type="submit"
          disabled={isSaving}
          style={{
            width: '100%',
            padding: '14px 20px',
            borderRadius: 24,
            border: 'none',
            background: theme.ink,
            color: theme.bg,
            fontSize: 15,
            fontWeight: 700,
            cursor: isSaving ? 'not-allowed' : 'pointer',
            opacity: isSaving ? 0.65 : 1,
            transition: 'opacity 0.15s ease',
          }}
        >
          {isSaving ? 'Saving...' : 'Update profile'}
        </button>
      </div>

      {/* Delete Account Danger Action */}
      <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <button
          type="button"
          onClick={onOpenDeleteModal}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#ef4444',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            padding: '8px 16px',
            borderRadius: 20,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(239, 68, 68, 0.08)')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
        >
          <Trash2 size={16} />
          <span>Delete account</span>
        </button>
        <div style={{ fontSize: 12, color: theme.inkSoft, textAlign: 'center' }}>
          Delete profile data, conversation history, and local session
        </div>
      </div>
    </form>
  );
}

