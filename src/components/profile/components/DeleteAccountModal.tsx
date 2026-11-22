import { Loader2 } from 'lucide-react';
import type { ThemeType } from '../../../theme';

interface DeleteAccountModalProps {
  theme: ThemeType;
  isOpen: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirmDelete: () => void;
}

export function DeleteAccountModal({
  theme,
  isOpen,
  isDeleting,
  onClose,
  onConfirmDelete,
}: DeleteAccountModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="profile-dialog-overlay"
      onClick={() => !isDeleting && onClose()}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backdropFilter: 'blur(3px)',
      }}
    >
      <div
        className="profile-dialog-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 400,
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 22,
          padding: 24,
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: theme.ink }}>Hapus Akun?</div>
          <div style={{ fontSize: 12.5, color: '#ef4444', fontWeight: 600, marginTop: 2 }}>Tindakan Permanen</div>
        </div>

        <p style={{ fontSize: 13.5, lineHeight: 1.55, color: theme.inkSoft, margin: 0 }}>
          Apakah Anda yakin ingin menghapus akun ini? Seluruh data profil, sesi percakapan, cache lokal, dan preferensi AI Anda akan dihapus secara permanen dan tidak dapat dipulihkan.
        </p>

        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: 20,
              border: `1px solid ${theme.border}`,
              background: 'transparent',
              color: theme.ink,
              fontSize: 14,
              fontWeight: 600,
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              opacity: isDeleting ? 0.6 : 1,
            }}
          >
            Batal
          </button>

          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirmDelete}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: 20,
              border: 'none',
              background: '#ef4444',
              color: '#FFFFFF',
              fontSize: 14,
              fontWeight: 700,
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              opacity: isDeleting ? 0.8 : 1,
            }}
          >
            {isDeleting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Menghapus...</span>
              </>
            ) : (
              <span>Hapus akun</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

