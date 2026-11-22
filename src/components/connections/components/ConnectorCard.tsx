import { Activity, CheckCircle2, Clock, Shield, Power, PowerOff, ShoppingBag, Store, Calculator, Bike, ExternalLink } from "lucide-react";
import type { ThemeType } from "../../../theme";
import type { ThreadsConnectionState } from "../../../hooks/useSocket";
import { CATEGORY_ICON_MAP, type ConnectorSummary, type WorkspaceFeatureView } from "./connectionsTypes";

const WORKSPACE_FEATURE_VIEW_MAP: Record<string, WorkspaceFeatureView> = {
  marketplace: "marketplace",
  mitra_store: "merchant",
  mitra_kasir: "cashier",
  mitra_kurir: "driver",
};

interface ConnectorCardProps {
  connector: ConnectorSummary;
  theme: ThemeType;
  isMobileView?: boolean;
  threads?: ThreadsConnectionState;
  telegram?: any;
  telegramLinkCode?: string | null;
  whatsapp?: { status: string; phoneNumber?: string } | null;
  onActivate: (connectorId: string) => void;
  onDeactivate: (connectorId: string) => void;
  onOpenFeature?: (view: WorkspaceFeatureView) => void;
}

export function ConnectorCard({
  connector,
  theme,
  isMobileView,
  threads,
  telegram,
  telegramLinkCode,
  whatsapp,
  onActivate,
  onDeactivate,
  onOpenFeature,
}: ConnectorCardProps) {
  const Icon = CATEGORY_ICON_MAP[connector.category] || Activity;
  const isThreads = connector.id === 'threads';
  const isTelegram = connector.id === 'telegram';
  const isWhatsApp = connector.id === 'whatsapp';
  const isWorkspaceModule = connector.category === 'commerce';
  const featureView = WORKSPACE_FEATURE_VIEW_MAP[connector.id];

  let isConnectorActive = connector.isActive;
  if (isThreads) isConnectorActive = threads?.status === 'CONNECTED';
  if (isTelegram) isConnectorActive = telegram?.status === 'CONNECTED';
  if (isWhatsApp) isConnectorActive = whatsapp?.status === 'CONNECTED' || connector.isActive;

  return (
    <div
      style={{
        display: "flex", flexDirection: "column", gap: 14,
        padding: isMobileView ? "18px 14px" : "22px 18px", borderRadius: 18, border: `1px solid ${theme.border}`,
        background: theme.surface2, transition: "transform 200ms ease",
        cursor: "default", position: "relative", overflow: "hidden"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ width: 42, height: 42, borderRadius: 14, background: theme.surface, border: `1px solid ${theme.border}`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          {connector.id === 'hyperliquid' ? (
            <img src="/hyperliquid.png" style={{ width: "100%", height: "100%", objectFit: "contain", padding: 4 }} />
          ) : connector.id === 'threads' ? (
            <svg viewBox="0 0 192 192" width={22} height={22} fill={theme.ink}>
              <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.773 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.576 174.908 97.0135 175.059C74.2042 174.89 56.9538 167.575 45.7381 153.317C35.2355 139.966 29.8077 120.682 29.6052 96C29.8077 71.3178 35.2355 52.0336 45.7381 38.6827C56.9538 24.4249 74.2039 17.11 97.0132 16.9405C119.988 17.1113 137.539 24.4614 149.184 38.788C154.894 45.8136 159.199 54.6488 162.037 64.9503L178.184 60.6422C174.744 47.9622 169.331 37.0357 161.965 27.974C147.036 9.60668 125.202 0.195148 97.0695 0H96.9569C68.8816 0.19447 47.2921 9.6418 32.7883 28.0793C19.8819 44.4864 13.2244 67.3157 13.0007 95.9325L13 96L13.0007 96.0675C13.2244 124.684 19.8819 147.514 32.7883 163.921C47.2921 182.358 68.8816 191.806 96.9569 192H97.0695C122.03 191.827 139.624 185.292 154.118 170.811C173.081 151.866 172.51 128.119 166.26 113.541C161.776 103.087 153.227 94.5962 141.537 88.9883ZM98.4405 129.507C88.0005 130.095 77.1544 125.409 76.6196 115.372C76.2232 107.93 81.9158 99.626 99.0812 98.6368C101.047 98.5234 102.976 98.468 104.871 98.468C111.106 98.468 116.939 99.0737 122.242 100.233C120.264 124.935 108.662 128.946 98.4405 129.507Z" />
            </svg>
          ) : connector.id === 'telegram' ? (
            <svg viewBox="0 0 24 24" width={22} height={22} fill={theme.ink} stroke="none">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.892-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
            </svg>
          ) : connector.id === 'whatsapp' ? (
            <svg viewBox="0 0 24 24" width={22} height={22} fill="#25D366">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.65 3.742-.983zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
            </svg>
          ) : connector.id === 'google_drive' ? (
            <img src="/google-drive.svg" style={{ width: 22, height: 22, objectFit: "contain" }} />
          ) : connector.id === 'claude_mcp' ? (
            <img src="/claude.svg" style={{ width: 22, height: 22, objectFit: "contain" }} />
          ) : connector.id === 'marketplace' ? (
            <ShoppingBag size={20} color={theme.ink} strokeWidth={1.5} />
          ) : connector.id === 'mitra_store' ? (
            <Store size={20} color={theme.ink} strokeWidth={1.5} />
          ) : connector.id === 'mitra_kasir' ? (
            <Calculator size={20} color={theme.ink} strokeWidth={1.5} />
          ) : connector.id === 'mitra_kurir' ? (
            <Bike size={20} color={theme.ink} strokeWidth={1.5} />
          ) : (
            <Icon size={20} color={theme.ink} strokeWidth={1.5} />
          )}
        </div>
        {connector.alwaysActive ? (
          <div style={{
            display: "flex", alignItems: "center", gap: 5,
            fontSize: 11, fontWeight: 600, color: "#6366f1",
            background: "rgba(99, 102, 241, 0.1)",
            border: "1px solid rgba(99, 102, 241, 0.2)",
            padding: "4px 10px", borderRadius: 20
          }}>
            <Shield size={12} /> Always On
          </div>
        ) : isConnectorActive ? (
          <div style={{
            display: "flex", alignItems: "center", gap: 5,
            fontSize: 11, fontWeight: 600, color: "#10b981",
            background: "rgba(16, 185, 129, 0.1)",
            border: "1px solid rgba(16, 185, 129, 0.2)",
            padding: "4px 10px", borderRadius: 20
          }}>
            <CheckCircle2 size={12} /> Active
          </div>
        ) : (
          <div style={{
            display: "flex", alignItems: "center", gap: 5,
            fontSize: 11, fontWeight: 600, color: theme.inkSoft,
            background: theme.surface, border: `1px solid ${theme.border}`,
            padding: "4px 10px", borderRadius: 20
          }}>
            <Clock size={12} /> Available
          </div>
        )}
      </div>

      <div>
        <div style={{ fontFamily: "Inter, sans-serif", fontSize: 15, fontWeight: 600, color: theme.ink, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
          {connector.name}
          {connector.network && (
            <span style={{ fontSize: 10, fontWeight: 500, color: theme.inkFaint, background: theme.surface, border: `1px solid ${theme.border}`, padding: "2px 8px", borderRadius: 8 }}>
              {connector.network}
            </span>
          )}
        </div>
        <div style={{ fontSize: 12, color: theme.inkSoft, lineHeight: 1.4 }}>
          {connector.description}
        </div>

        {isThreads && isConnectorActive && (threads?.username || threads?.threadsUserId) && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8, padding: "7px 12px",
            background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.25)",
            borderRadius: 10, fontSize: 12, color: theme.ink, fontWeight: 500, marginTop: 8
          }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", flexShrink: 0 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 1, overflow: "hidden" }}>
              <span style={{ fontWeight: 600, color: theme.ink, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                {threads.username ? `@${threads.username}` : `ID: ${threads.threadsUserId}`}
              </span>
              {threads.name && (
                <span style={{ fontSize: 10, color: theme.inkSoft }}>{threads.name}</span>
              )}
            </div>
          </div>
        )}

        {isWhatsApp && isConnectorActive && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8, padding: "7px 12px",
            background: "rgba(37, 211, 102, 0.08)", border: "1px solid rgba(37, 211, 102, 0.25)",
            borderRadius: 10, fontSize: 12, color: theme.ink, fontWeight: 500, marginTop: 8
          }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#25D366" }} />
            <span style={{ fontWeight: 600, color: theme.ink }}>
              {whatsapp?.phoneNumber ? `+${whatsapp.phoneNumber}` : 'Connected'}
            </span>
          </div>
        )}
      </div>

      {/* Action Button */}
      {!connector.alwaysActive && (
        <div style={{ marginTop: 4 }}>
          {isConnectorActive ? (
            <div style={{ display: "flex", gap: 8 }}>
              {isWorkspaceModule && featureView && onOpenFeature && (
                <button
                  onClick={() => onOpenFeature(featureView)}
                  style={{
                    flex: 1, padding: "8px 0", borderRadius: 10,
                    border: "none", background: theme.ink,
                    color: theme.bg, fontSize: 13, fontWeight: 600, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    transition: "opacity 200ms"
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                >
                  <ExternalLink size={14} /> Open
                </button>
              )}
              <button
                onClick={() => {
                  if (!isTelegram) {
                    onDeactivate(connector.id);
                  }
                }}
                style={{
                  flex: 1,
                  width: isWorkspaceModule && featureView && onOpenFeature ? undefined : "100%",
                  padding: "8px 0", borderRadius: 10,
                  border: `1px solid ${theme.border}`, background: "transparent",
                  color: isTelegram ? "#10b981" : "#ef4444",
                  fontSize: 13, fontWeight: 600, cursor: isTelegram ? "default" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  transition: "background 200ms"
                }}
                onMouseEnter={e => {
                  if (!isTelegram) e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
                }}
                onMouseLeave={e => {
                  if (!isTelegram) e.currentTarget.style.background = "transparent";
                }}
              >
                {isTelegram ? (
                  <><CheckCircle2 size={14} /> Connected</>
                ) : isWorkspaceModule ? (
                  <><PowerOff size={14} /> Deactivate</>
                ) : (
                  <><PowerOff size={14} /> Disconnect</>
                )}
              </button>
            </div>
          ) : isTelegram ? (
            <a
              href={telegramLinkCode ? `https://t.me/sera_osbot?start=${telegramLinkCode}` : "#"}
              target={telegramLinkCode ? "_blank" : undefined}
              rel="noopener noreferrer"
              onClick={(e) => {
                if (!telegramLinkCode) {
                  e.preventDefault();
                  onActivate(connector.id);
                }
              }}
              style={{
                width: "100%", padding: "8px 0", borderRadius: 10,
                border: "none", background: theme.ink,
                color: theme.bg, fontSize: 13, fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                textDecoration: "none", transition: "opacity 200ms"
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >
              <Power size={14} /> Connect
            </a>
          ) : (
            <button
              onClick={() => onActivate(connector.id)}
              style={{
                width: "100%", padding: "8px 0", borderRadius: 10,
                border: "none", background: theme.ink,
                color: theme.bg, fontSize: 13, fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                transition: "opacity 200ms"
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >
              <Power size={14} /> {isWorkspaceModule ? "Activate" : "Connect"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
