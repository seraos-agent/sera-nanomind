import type { ThemeType } from '../../../theme';

interface PrivacySubViewProps {
  theme: ThemeType;
  trainAiOptIn: boolean;
  onToggleAiTraining: () => void;
  onClearLocalCache: () => void;
}

export function PrivacySubView({
  theme,
  trainAiOptIn,
  onToggleAiTraining,
  onClearLocalCache,
}: PrivacySubViewProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 4 }}>
      {/* Card 1: Data Privacy & Sovereign Protection Guarantee */}
      <div
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 20,
          padding: '24px 22px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: theme.ink, margin: 0 }}>Data Privacy</h2>
          <div style={{ fontSize: 12.5, color: theme.inkSoft, marginTop: 2 }}>
            Managed by PT SERA TEKNOLOGI DIGITAL
          </div>
        </div>

        <p style={{ fontSize: 14, lineHeight: 1.6, color: theme.ink, margin: 0 }}>
          PT SERA TEKNOLOGI DIGITAL values transparent data governance and user information sovereignty. Protecting your data and integrations is our top priority. Your business documents, authentication credentials, and task history are strictly protected.
        </p>

        {/* Direct Link to Official Privacy Policy */}
        <div style={{ marginTop: 2, paddingTop: 14, borderTop: `1px solid ${theme.border}` }}>
          <a
            href="https://docs.seraos.xyz/docs/privacy"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 13.5,
              fontWeight: 600,
              color: theme.ink,
              textDecoration: 'underline',
              textUnderlineOffset: 4,
              cursor: 'pointer',
            }}
          >
            Learn more in the Official SERA OS Privacy Policy
          </a>
        </div>
      </div>

      {/* Card 2: AI Model Improvement Opt-in Toggle */}
      <div
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 20,
          padding: '24px 22px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: theme.ink, margin: 0 }}>
              AI Model Improvement
            </h2>
            <p style={{ fontSize: 13.5, lineHeight: 1.55, color: theme.inkSoft, margin: 0 }}>
              Allow anonymized conversation history to improve SERA Agent intelligence. All identities and personal data are filtered out automatically.
            </p>
          </div>

          {/* Accessible Pill Toggle Switch */}
          <button
            type="button"
            role="switch"
            aria-checked={trainAiOptIn}
            aria-label="Allow conversation history for SERA Agent training"
            onClick={onToggleAiTraining}
            style={{
              width: 52,
              height: 30,
              borderRadius: 16,
              background: trainAiOptIn ? theme.ink : theme.surface2,
              border: `1px solid ${trainAiOptIn ? theme.ink : theme.border}`,
              position: 'relative',
              cursor: 'pointer',
              padding: 0,
              transition: 'background 0.2s ease, border-color 0.2s ease',
              flexShrink: 0,
              marginTop: 2,
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: 3,
                left: trainAiOptIn ? 25 : 3,
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: trainAiOptIn ? theme.bg : theme.inkSoft,
                transition: 'left 0.2s ease, background 0.2s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.18)',
              }}
            />
          </button>
        </div>

        <div style={{ marginTop: 2 }}>
          <a
            href="https://docs.seraos.xyz/docs/privacy"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: theme.inkSoft,
              textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}
          >
            AI Training Privacy Policy
          </a>
        </div>
      </div>

      {/* Card 3: Local Session Cache & Memory Reset */}
      <div
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 20,
          padding: '22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: theme.ink }}>
            Clear Local Cache
          </div>
          <div style={{ fontSize: 12.5, color: theme.inkSoft, marginTop: 4, lineHeight: 1.45 }}>
            Delete temporary chat messages and cache files stored in this browser without signing out.
          </div>
        </div>

        <button
          type="button"
          onClick={onClearLocalCache}
          style={{
            padding: '9px 18px',
            borderRadius: 20,
            border: `1px solid ${theme.border}`,
            background: theme.surface2,
            color: theme.ink,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = '#ef4444';
            (e.currentTarget as HTMLElement).style.color = '#ef4444';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = theme.border;
            (e.currentTarget as HTMLElement).style.color = theme.ink;
          }}
        >
          Clear
        </button>
      </div>
    </div>
  );
}

