import { ChevronLeft, X } from "lucide-react";
import type { ThemeType } from "../../../theme";
import type { DriverProfile } from "../types";
import { DriverProfileView } from "../DriverProfileView";
import { StoreCourierSettlementView } from "../StoreCourierSettlementView";

interface DriverModalOverlayProps {
  activeModal: "settlement" | "profile" | null;
  onClose: () => void;
  theme: ThemeType;
  driver: DriverProfile;
  isMobileView?: boolean;
  onUpdateDriver: (updated: Partial<DriverProfile>) => void;
  onUnlinkStore: () => void;
}

export function DriverModalOverlay({
  activeModal,
  onClose,
  theme,
  driver,
  isMobileView,
  onUpdateDriver,
  onUnlinkStore
}: DriverModalOverlayProps) {
  if (!activeModal) return null;

  return (
    <div
      onClick={() => activeModal !== "settlement" && onClose()}
      style={
        activeModal === "settlement"
          ? {
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              background: theme.bg,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden"
            }
          : {
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 14
            }
      }
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={
          activeModal === "settlement"
            ? {
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                background: theme.bg,
                overflow: "hidden"
              }
            : {
                width: "100%",
                maxWidth: 580,
                maxHeight: "90vh",
                background: theme.surface,
                borderRadius: 16,
                border: `1px solid ${theme.border}`,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                boxShadow: "0 20px 40px rgba(0,0,0,0.25)"
              }
        }
      >
        {/* Modal Header */}
        <div
          style={{
            paddingTop: activeModal === "settlement" ? 14 : 12,
            paddingBottom: activeModal === "settlement" ? 14 : 12,
            paddingLeft: 18,
            paddingRight: 18,
            borderBottom: `1px solid ${theme.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: theme.surface
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {activeModal === "settlement" && (
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: theme.ink,
                  padding: "4px 6px 4px 0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 6
                }}
                aria-label="Kembali"
              >
                <ChevronLeft size={22} />
              </button>
            )}
            <span style={{ fontSize: 15, fontWeight: 700, color: theme.ink }}>
              {activeModal === "settlement" ? "Rekap & Setoran Kas COD" : "Informasi Profil Kurir"}
            </span>
          </div>
          {activeModal !== "settlement" && (
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: theme.inkSoft,
                padding: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 6
              }}
              aria-label="Tutup"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: activeModal === "settlement" ? (isMobileView ? "16px 14px 32px" : "24px 20px 40px") : 16,
            background: activeModal === "settlement" ? theme.bg : undefined
          }}
        >
          <div
            style={{
              maxWidth: activeModal === "settlement" ? 640 : undefined,
              margin: activeModal === "settlement" ? "0 auto" : undefined,
              width: "100%"
            }}
          >
            {activeModal === "settlement" && (
              <StoreCourierSettlementView
                theme={theme}
                driver={driver}
                isMobileView={isMobileView}
                onClose={onClose}
              />
            )}
            {activeModal === "profile" && (
              <DriverProfileView
                theme={theme}
                driver={driver}
                onUpdateDriver={onUpdateDriver}
                isMobileView={isMobileView}
                onUnlinkStore={onUnlinkStore}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
