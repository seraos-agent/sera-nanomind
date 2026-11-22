import { useState, useEffect } from "react";
import { X, Plus, PanelLeftClose, PanelLeftOpen, Sun, Moon, Clock, Zap, Send, ShoppingBag, Store, Bike, Calculator } from "lucide-react";
import type { ThemeType } from "../../theme";
import type { BillingState } from "../../hooks/useBilling";

export type SidebarView = "chat" | "connections" | "automations" | "profile" | "threads_settings" | "merchant" | "driver" | "cashier" | "marketplace";

interface ConnectorSummary {
  id: string;
  name: string;
  isActive: boolean;
  alwaysActive: boolean;
  [key: string]: any;
}

interface SidebarProps {
  theme: ThemeType;
  open: boolean;
  onClose: () => void;
  onToggle?: () => void;
  isMobileView: boolean;
  currentView: SidebarView;
  onNavigate: (view: SidebarView) => void;
  billingState?: BillingState;
  userEmail?: string | null;
  mode?: 'light' | 'dark';
  onToggleMode?: () => void;
  activeConnectors?: ConnectorSummary[];
  googleDrive?: { status: string; url?: string } | null;
  threads?: { status: string } | null;
  telegram?: { status: string } | null;
  whatsapp?: { status: string } | null;
}

export function Sidebar({ theme, open, onClose, onToggle, isMobileView, currentView, onNavigate, billingState, userEmail, mode, onToggleMode, activeConnectors, googleDrive, threads, telegram, whatsapp }: SidebarProps) {
  const isOverlay = isMobileView;
  const sidebarWidth = open ? 252 : 68;

  // Synchronized Profile State (Name, Avatar, Initial)
  const getProfileData = () => {
    if (typeof window === 'undefined') {
      return {
        name: userEmail || 'Pengguna SERA',
        avatar: null as string | null,
        initial: 'S'
      };
    }
    const name =
      localStorage.getItem('sera_customer_name') ||
      localStorage.getItem('sera_user_name') ||
      localStorage.getItem('sera_user_nickname') ||
      userEmail ||
      'Pengguna SERA';
    const avatar = localStorage.getItem('sera_user_avatar');
    const initial = (name.trim().charAt(0) || (userEmail ? userEmail.trim().charAt(0) : '') || 'S').toUpperCase();
    return { name, avatar, initial };
  };

  const [profileData, setProfileData] = useState(getProfileData);

  useEffect(() => {
    const handleUpdate = () => {
      setProfileData(getProfileData());
    };

    window.addEventListener('sera_profile_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('sera_profile_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [userEmail]);

  useEffect(() => {
    setProfileData(getProfileData());
  }, [currentView, userEmail]);

  const navigate = (view: SidebarView) => {
    onNavigate(view);
    if (isMobileView) onClose();
  };

  // On mobile drawer, items act as clean launcher actions (no sticky/persistent active background)
  const isItemActive = (view: SidebarView) => {
    if (isMobileView) return false;
    return currentView === view;
  };

  const getItemColor = (view: SidebarView) => {
    if (isItemActive(view)) {
      return theme.isDark ? "#FFFFFF" : "#000000";
    }
    if (isMobileView) {
      return theme.isDark ? "#F5F5F7" : "#0F172A";
    }
    return theme.inkSoft;
  };

  const getItemWeight = (view: SidebarView) => {
    if (isItemActive(view)) return 600;
    return 500;
  };

  // Subtle elevated pill for active items on Web Desktop against True Black background
  const getItemBg = (view: SidebarView) => {
    if (isItemActive(view)) {
      return theme.isDark ? "#18181B" : theme.surface;
    }
    return "transparent";
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>, view: SidebarView) => {
    if (isMobileView) return; // Prevent sticky hover on mobile touchscreens
    if (currentView !== view) {
      (e.currentTarget as HTMLElement).style.background = theme.isDark ? "#18181B" : theme.surface;
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>, view: SidebarView) => {
    if (isMobileView) return;
    if (currentView !== view) {
      (e.currentTarget as HTMLElement).style.background = "transparent";
    }
  };

  return (
    <>
      <style>{`
        .sidebar-nav-container::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        .sidebar-nav-item {
          -webkit-tap-highlight-color: transparent;
        }
        .sidebar-nav-item:active {
          opacity: 0.7;
          background: rgba(255, 255, 255, 0.05) !important;
        }
      `}</style>
      {isOverlay && open && (
        <div
          onClick={onClose}
          style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 20 }}
        />
      )}
      <div
        style={{
          position: isOverlay ? "absolute" : "relative",
          zIndex: 21,
          top: 0, left: 0, bottom: 0,
          width: isOverlay ? 260 : sidebarWidth,
          background: theme.isDark ? "#000000" : theme.surface2,
          borderRight: `1px solid ${theme.border}`,
          overflow: "hidden",
          transition: "width 240ms cubic-bezier(.4,0,.2,1), transform 240ms cubic-bezier(.4,0,.2,1)",
          transform: isOverlay ? (open ? "translateX(0)" : "translateX(-100%)") : "none",
          display: "flex", flexDirection: "column", flexShrink: 0, height: "100%",
        }}
      >
        <div style={{ width: isOverlay ? 260 : sidebarWidth, padding: "16px 14px", display: "flex", flexDirection: "column", height: "100%", boxSizing: "border-box", transition: "width 240ms cubic-bezier(.4,0,.2,1)" }}>

          <div style={{ display: "flex", alignItems: "center", justifyContent: open ? "space-between" : "center", padding: open ? "2px 4px 20px" : "2px 0 24px", flexDirection: open ? "row" : "column", gap: open ? 0 : 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, overflow: "hidden" }}>
              <img src="/sera-logo.png" alt="Sera" style={{ width: 22, height: 22, objectFit: "contain", flexShrink: 0 }} />
              {open && <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 14, color: theme.ink }}>Sera</span>}
            </div>
            {!isOverlay && onToggle && (
              <button onClick={onToggle} style={{ background: "transparent", border: "none", cursor: "pointer", color: theme.inkSoft, padding: 4, display: "flex" }}>
                {open ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
              </button>
            )}
            {isOverlay && (
              <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: theme.inkSoft, padding: 4 }}>
                <X size={18} />
              </button>
            )}
          </div>


          <div
            className="sidebar-nav-container"
            style={{
              flex: 1,
              overflowY: "auto",
              overflowX: "hidden",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              display: "flex",
              flexDirection: "column",
              gap: 4,
              alignItems: open ? "stretch" : "center",
            }}
          >
            <div
              className="sidebar-nav-item"
              onClick={() => {
                navigate("connections");
              }}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: open ? "8px 6px" : "8px", cursor: "pointer", marginBottom: 6,
                justifyContent: open ? "flex-start" : "center", borderRadius: 8,
                background: getItemBg("connections"),
              }}
              onMouseEnter={e => handleMouseEnter(e, "connections")}
              onMouseLeave={e => handleMouseLeave(e, "connections")}
              title={!open ? "Workspace" : undefined}
            >
              <Plus size={15} color={getItemColor("connections")} style={{ flexShrink: 0 }} />
              {open && (
                <span style={{ flex: 1, fontFamily: "Inter, sans-serif", fontSize: 13, color: getItemColor("connections"), fontWeight: getItemWeight("connections"), whiteSpace: "nowrap" }}>
                  Workspace
                </span>
              )}
            </div>

            {/* Workspace-Activated Ecosystem Modules (Hidden until activated in Workspace) */}
            {([
              { id: "marketplace", view: "marketplace" as SidebarView, label: "Marketplace", icon: ShoppingBag },
              { id: "mitra_store", view: "merchant" as SidebarView, label: "Merchant Store", icon: Store },
              { id: "mitra_kurir", view: "driver" as SidebarView, label: "Courier Dispatch", icon: Bike },
              { id: "mitra_kasir", view: "cashier" as SidebarView, label: "POS Cashier", icon: Calculator },
            ]).filter(mod => activeConnectors?.some(c => c.id === mod.id && c.isActive)).map(mod => {
              const ModIcon = mod.icon;
              return (
                <div
                  key={mod.id}
                  className="sidebar-nav-item"
                  onClick={() => navigate(mod.view)}
                  title={!open ? mod.label : undefined}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: open ? "8px 6px" : "8px", borderRadius: 8,
                    cursor: "pointer", transition: "background 150ms",
                    marginBottom: 2,
                    justifyContent: open ? "flex-start" : "center",
                    background: getItemBg(mod.view),
                  }}
                  onMouseEnter={e => handleMouseEnter(e, mod.view)}
                  onMouseLeave={e => handleMouseLeave(e, mod.view)}
                >
                  <ModIcon size={18} color={getItemColor(mod.view)} style={{ flexShrink: 0 }} />
                  {open && (
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: getItemColor(mod.view), fontWeight: getItemWeight(mod.view), whiteSpace: "nowrap", flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>
                      {mod.label}
                    </span>
                  )}
                </div>
              );
            })}


            <div
              className="sidebar-nav-item"
              onClick={() => {
                navigate("automations" as SidebarView);
              }}
              title={!open ? "Active Intents" : undefined}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: open ? "8px 6px" : "8px", borderRadius: 8,
                cursor: "pointer", transition: "background 150ms",
                marginBottom: 2,
                justifyContent: open ? "flex-start" : "center",
                background: getItemBg("automations"),
              }}
              onMouseEnter={e => handleMouseEnter(e, "automations")}
              onMouseLeave={e => handleMouseLeave(e, "automations")}
            >
              <Clock size={18} color={getItemColor("automations")} style={{ flexShrink: 0 }} />
              {open && (
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: getItemColor("automations"), fontWeight: getItemWeight("automations"), whiteSpace: "nowrap", flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>
                  Active Intents
                </span>
              )}
            </div>



            {activeConnectors?.filter(c => {
              if (c.id === 'autonomy' || c.id === 'communication') return false;
              if (!['threads', 'telegram', 'whatsapp', 'google_drive'].includes(c.id)) return false;

              // Check live connection state for integrations requiring user authentication
              if (c.id === 'google_drive') return googleDrive?.status === 'CONNECTED';
              if (c.id === 'threads') return threads?.status === 'CONNECTED';
              if (c.id === 'telegram') return telegram?.status === 'CONNECTED';
              if (c.id === 'whatsapp') return whatsapp?.status === 'CONNECTED';

              return c.isActive;
            }).map((c) => {

              return (
                <div
                  key={c.id}
                  className="sidebar-nav-item"
                  onClick={() => navigate(c.id === 'threads' ? "threads_settings" : "connections" as SidebarView)}
                  title={!open ? c.name : undefined}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: open ? "8px 6px" : "8px", borderRadius: 8,
                    cursor: "pointer", transition: "background 150ms",
                    marginBottom: 2,
                    justifyContent: open ? "flex-start" : "center",
                    background: "transparent"
                  }}
                  onMouseEnter={e => { if (!isMobileView) (e.currentTarget as HTMLElement).style.background = theme.isDark ? "#18181B" : theme.surface; }}
                  onMouseLeave={e => { if (!isMobileView) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  {c.id === 'threads' ? (
                    <svg viewBox="0 0 192 192" width={18} height={18} fill={theme.ink} style={{ flexShrink: 0 }}>
                      <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.773 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.576 174.908 97.0135 175.059C74.2042 174.89 56.9538 167.575 45.7381 153.317C35.2355 139.966 29.8077 120.682 29.6052 96C29.8077 71.3178 35.2355 52.0336 45.7381 38.6827C56.9538 24.4249 74.2039 17.11 97.0132 16.9405C119.988 17.1113 137.539 24.4614 149.184 38.788C154.894 45.8136 159.199 54.6488 162.037 64.9503L178.184 60.6422C174.744 47.9622 169.331 37.0357 161.965 27.974C147.036 9.60668 125.202 0.195148 97.0695 0H96.9569C68.8816 0.19447 47.2921 9.6418 32.7883 28.0793C19.8819 44.4864 13.2244 67.3157 13.0007 95.9325L13 96L13.0007 96.0675C13.2244 124.684 19.8819 147.514 32.7883 163.921C47.2921 182.358 68.8816 191.806 96.9569 192H97.0695C122.03 191.827 139.624 185.292 154.118 170.811C173.081 151.866 172.51 128.119 166.26 113.541C161.776 103.087 153.227 94.5962 141.537 88.9883ZM98.4405 129.507C88.0005 130.095 77.1544 125.409 76.6196 115.372C76.2232 107.93 81.9158 99.626 99.0812 98.6368C101.047 98.5234 102.976 98.468 104.871 98.468C111.106 98.468 116.939 99.0737 122.242 100.233C120.264 124.935 108.662 128.946 98.4405 129.507Z" />
                    </svg>
                  ) : c.id === 'telegram' ? (
                    <Send size={18} color={theme.inkSoft} style={{ flexShrink: 0 }} />
                  ) : c.id === 'whatsapp' ? (
                    <svg viewBox="0 0 24 24" width={18} height={18} fill="#25D366" style={{ flexShrink: 0 }}>
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.65 3.742-.983zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                    </svg>
                  ) : c.id === 'google_drive' ? (
                    <img src="/google-drive.svg" width={18} height={18} style={{ flexShrink: 0, objectFit: "contain" }} />
                  ) : (
                    <Zap size={18} color={theme.inkSoft} style={{ flexShrink: 0 }} />
                  )}
                  {open && (
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: theme.inkSoft, fontWeight: 500, whiteSpace: "nowrap", flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>
                      {c.id === 'telegram' ? 'Telegram' : (c.id === 'whatsapp' ? 'WhatsApp' : (c.id === 'google_drive' ? 'Google Drive' : (c.id === 'threads' ? 'Threads' : c.name.split(' (')[0])))}
                    </span>
                  )}
                  {open && (
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", flexShrink: 0 }} />
                  )}
                </div>
              );
            })}
          </div>
          {onToggleMode && (
            <div
              className="sidebar-nav-item"
              onClick={onToggleMode}
              style={{
                marginTop: "auto",
                display: "flex", alignItems: "center", gap: 10, padding: open ? "10px 8px" : "8px", justifyContent: open ? "flex-start" : "center",
                cursor: "pointer", borderRadius: 8, transition: "opacity 150ms", marginBottom: 4, background: "transparent",
                color: theme.inkSoft
              }}
              onMouseEnter={e => { if (!isMobileView) (e.currentTarget as HTMLElement).style.opacity = "0.75"; }}
              onMouseLeave={e => { if (!isMobileView) (e.currentTarget as HTMLElement).style.opacity = "1"; }}
              title={mode === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {mode === 'dark' ? (
                <Sun size={18} color={theme.inkSoft} style={{ flexShrink: 0 }} />
              ) : (
                <Moon size={18} color={theme.inkSoft} style={{ flexShrink: 0 }} />
              )}
              {open && (
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: theme.inkSoft, fontWeight: 500, whiteSpace: "nowrap" }}>
                  {mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </span>
              )}
            </div>
          )}

          <div
            className="sidebar-nav-item"
            onClick={() => {
              navigate("profile");
            }}
            style={{
              borderTop: `1px solid ${theme.border}`,
              paddingTop: 12,
              marginTop: 8,
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: open ? "10px 8px" : "8px",
              justifyContent: open ? "flex-start" : "center",
              cursor: "pointer",
              borderRadius: 8,
              transition: "background 150ms",
              background: getItemBg("profile")
            }}
            onMouseEnter={e => handleMouseEnter(e, "profile")}
            onMouseLeave={e => handleMouseLeave(e, "profile")}
            title={!open ? profileData.name : undefined}
          >
            {/* Synchronized Circular Avatar / Initial */}
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: profileData.avatar ? "transparent" : "#6C8EBF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                fontSize: 12,
                fontWeight: 700,
                flexShrink: 0,
                overflow: "hidden",
                border: profileData.avatar ? `1px solid ${theme.border}` : "none",
              }}
            >
              {profileData.avatar ? (
                <img src={profileData.avatar} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ userSelect: "none", fontFamily: "Newsreader, 'Times New Roman', Georgia, serif" }}>
                  {profileData.initial}
                </span>
              )}
            </div>

            {open && (
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, overflow: "hidden", minWidth: 0 }}>
                <span
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 13,
                    color: getItemColor("profile"),
                    fontWeight: getItemWeight("profile"),
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    flex: 1
                  }}
                >
                  {profileData.name}
                </span>
                {billingState?.tier && (
                  <span style={{
                    fontFamily: "Inter, sans-serif", fontSize: 9, fontWeight: 700,
                    background: theme.isDark ? "#18181B" : theme.surface2,
                    color: theme.inkSoft,
                    border: `1px solid ${theme.border}`,
                    padding: "2px 6px", borderRadius: 4, letterSpacing: 0.5, flexShrink: 0
                  }}>
                    {billingState?.tier}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
