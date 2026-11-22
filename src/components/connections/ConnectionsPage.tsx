import { useState, useEffect } from "react";
import { ChevronLeft as CloseIcon } from "lucide-react";
import { registerBackHandler, dispatchBackButton } from "../../utils/backButton";
import { ActivationModal } from "./ActivationModal";
import {
  CATEGORIES,
  type WorkspacePageProps,
  type ConnectorSummary,
} from "./components/connectionsTypes";
import { ConnectorCard } from "./components/ConnectorCard";
import { StorageVaultView } from "./components/StorageVaultView";
import { DEFAULT_COMMERCE_CONNECTORS } from "../../services/demoCommerceSeed";

export function ConnectionsPage({
  theme,
  onBack,
  isMobileView,
  socket,
  googleDrive,
  onConnectGoogleDrive,
  onDisconnectGoogleDrive,
  onOpenFeature,
}: WorkspacePageProps) {
  const sidePad = isMobileView ? 16 : 32;
  const titleSize = isMobileView ? 22 : 36;

  const [activeCategory, setActiveCategory] = useState<string | null>(() => {
    const saved = localStorage.getItem("sera_active_category");
    if (saved && ["commerce", "storage"].includes(saved)) {
      return saved;
    }
    return null;
  });

  const [connectors, setConnectors] = useState<ConnectorSummary[]>(() => {
    try {
      const saved = localStorage.getItem("sera_active_connectors");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_COMMERCE_CONNECTORS;
  });
  const [activationTarget, setActivationTarget] = useState<ConnectorSummary | null>(null);

  useEffect(() => {
    const unregs: (() => void)[] = [];

    if (activationTarget) {
      unregs.push(
        registerBackHandler("connections_act_modal", 70, () => {
          setActivationTarget(null);
          return true;
        })
      );
    }

    if (activeCategory !== null) {
      unregs.push(
        registerBackHandler("connections_category", 30, () => {
          setActiveCategory(null);
          return true;
        })
      );
    }

    return () => {
      unregs.forEach((u) => u());
    };
  }, [activationTarget, activeCategory]);

  const handleConnectionsBack = () => {
    if (dispatchBackButton()) return;
    if (activationTarget) {
      setActivationTarget(null);
      return;
    }
    if (activeCategory !== null) {
      setActiveCategory(null);
      return;
    }
    if (onBack) {
      onBack();
    }
  };

  useEffect(() => {
    if (!socket) return;

    socket.emit("connector:list");

    const handleCatalog = (data: ConnectorSummary[]) => {
      if (Array.isArray(data) && data.length > 0) {
        setConnectors(data);
      }
    };
    const handleStatusChanged = (data: ConnectorSummary[]) => {
      if (Array.isArray(data) && data.length > 0) {
        setConnectors(data);
      }
    };

    socket.on("connector:catalog", handleCatalog);
    socket.on("connector:status_changed", handleStatusChanged);

    return () => {
      socket.off("connector:catalog", handleCatalog);
      socket.off("connector:status_changed", handleStatusChanged);
    };
  }, [socket]);

  useEffect(() => {
    if (activeCategory === null) {
      localStorage.removeItem("sera_active_category");
    } else {
      localStorage.setItem("sera_active_category", activeCategory);
    }
  }, [activeCategory]);

  const handleActivate = (connectorId: string) => {
    if (!socket) return;
    socket.emit("connector:activate", { connectorId });
  };

  const handleDeactivate = (connectorId: string) => {
    if (!socket) return;
    socket.emit("connector:deactivate", { connectorId });
  };

  const connectorsByCategory = connectors.reduce<Record<string, ConnectorSummary[]>>((acc, c) => {
    if (!acc[c.category]) acc[c.category] = [];
    acc[c.category].push(c);
    return acc;
  }, {});

  const getCategoryCount = (catId: string): number => {
    if (catId === "storage") return 2; // DeviceMemoryVault + Firebase Hybrid AI Engine
    return connectorsByCategory[catId]?.length || 0;
  };

  const renderCategories = () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: isMobileView ? "repeat(1, 1fr)" : "repeat(auto-fill, minmax(260px, 1fr))",
        gap: isMobileView ? 12 : 20,
      }}
    >
      {CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        const capCount = getCategoryCount(cat.id);
        return (
          <div
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: isMobileView ? 12 : 16,
              padding: isMobileView ? "20px 16px" : "28px 24px",
              borderRadius: 20,
              border: `1px solid ${theme.border}`,
              background: theme.surface2,
              transition: "transform 200ms ease, border-color 200ms ease",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.borderColor = theme.inkSoft;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = theme.border;
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div
                style={{
                  width: isMobileView ? 44 : 52,
                  height: isMobileView ? 44 : 52,
                  borderRadius: 16,
                  background: theme.surface,
                  border: `1px solid ${theme.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon size={isMobileView ? 20 : 24} color={theme.ink} strokeWidth={1.5} />
              </div>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: theme.inkSoft,
                  background: theme.surface,
                  border: `1px solid ${theme.border}`,
                  padding: "4px 10px",
                  borderRadius: 12,
                }}
              >
                {capCount} {capCount === 1 ? "Module" : "Modules"}
              </span>
            </div>
            <div>
              <div
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: isMobileView ? 15 : 17,
                  fontWeight: 600,
                  color: theme.ink,
                  marginBottom: 4,
                }}
              >
                {cat.name}
              </div>
              <div style={{ fontSize: 13, color: theme.inkSoft, lineHeight: 1.4 }}>
                {cat.description}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderCapabilities = (catId: string) => {
    if (catId === "storage") {
      return (
        <StorageVaultView
          theme={theme}
          isMobileView={isMobileView}
          googleDrive={googleDrive}
          onConnectGoogleDrive={onConnectGoogleDrive}
          onDisconnectGoogleDrive={onDisconnectGoogleDrive}
        />
      );
    }

    const category = CATEGORIES.find((c) => c.id === catId);
    const caps = connectorsByCategory[catId] || [];

    return (
      <div style={{ animation: "walletPageIn 300ms ease forwards" }}>
        <div
          style={{
            fontFamily: "Fraunces, serif",
            fontSize: isMobileView ? 24 : 32,
            fontWeight: 500,
            color: theme.ink,
            marginBottom: 8,
            letterSpacing: -0.5,
          }}
        >
          {category?.name}
        </div>
        <div style={{ fontSize: 14, color: theme.inkSoft, marginBottom: isMobileView ? 24 : 36 }}>
          {category?.description}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobileView ? "repeat(1, 1fr)" : "repeat(auto-fill, minmax(260px, 1fr))",
            gap: isMobileView ? 12 : 20,
          }}
        >
          {caps.map((connector) => (
            <ConnectorCard
              key={connector.id}
              connector={connector}
              theme={theme}
              isMobileView={isMobileView}
              onActivate={handleActivate}
              onDeactivate={handleDeactivate}
              onOpenFeature={onOpenFeature}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: theme.bg,
        animation: "walletPageIn 400ms cubic-bezier(.4,0,.2,1) forwards",
        minWidth: 0,
        minHeight: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: isMobileView ? "12px 16px" : "12px 24px",
          borderBottom: "none",
          background: theme.bg,
          flexShrink: 0,
        }}
      >
        <button
          onClick={handleConnectionsBack}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: theme.inkSoft,
            padding: 4,
            display: "flex",
            borderRadius: 6,
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = theme.surface2)}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <CloseIcon size={18} />
        </button>
        <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 15, color: theme.ink }}>
          Workspace
        </span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: `${isMobileView ? 24 : 48}px ${sidePad}px` }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          {activeCategory === null ? (
            <>
              <div
                style={{
                  fontFamily: "Fraunces, serif",
                  fontSize: titleSize,
                  fontWeight: 400,
                  color: theme.ink,
                  marginBottom: 12,
                  letterSpacing: -0.5,
                  textAlign: "center",
                }}
              >
                The world Sera can operate in.
              </div>
              <div
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: isMobileView ? 14 : 16,
                  color: theme.inkSoft,
                  marginBottom: 48,
                  textAlign: "center",
                  maxWidth: 480,
                  margin: "0 auto 48px",
                  lineHeight: 1.5,
                }}
              >
                Explore commerce modules, encrypted browser storage, and Firebase AI Logic hybrid inference settings.
              </div>
              {renderCategories()}
            </>
          ) : (
            renderCapabilities(activeCategory)
          )}
        </div>
      </div>

      {/* Activation Modal */}
      {activationTarget && (
        <ActivationModal
          theme={theme}
          connector={activationTarget}
          onActivate={handleActivate}
          onClose={() => setActivationTarget(null)}
        />
      )}
    </div>
  );
}
