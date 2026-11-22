import React, { useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import type { ThemeType } from "../../../../../theme";
import { dispatchBackButton } from "../../../../../utils/backButton";

interface SubPageLayoutProps {
  title: string;
  theme: ThemeType;
  isMobileView?: boolean;
  onBack: () => void;
  children: React.ReactNode;
}

export function SubPageLayout({
  title,
  theme,
  isMobileView,
  onBack,
  children
}: SubPageLayoutProps) {
  const handleBack = React.useCallback(() => {
    if (dispatchBackButton()) return;
    onBack();
  }, [onBack]);

  useEffect(() => {
    if (isMobileView) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleBack();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileView, handleBack]);

  return (
    <div
      onClick={(e) => {
        if (!isMobileView && e.target === e.currentTarget) {
          handleBack();
        }
      }}
      style={
        isMobileView
          ? {
              position: "fixed",
              inset: 0,
              zIndex: 100,
              background: theme.bg,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden"
            }
          : {
              position: "fixed",
              inset: 0,
              zIndex: 100,
              background: "rgba(9, 12, 18, 0.56)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "24px 20px",
              boxSizing: "border-box"
            }
      }
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={
          isMobileView
            ? {
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                background: theme.bg
              }
            : {
                width: "100%",
                maxWidth: 700,
                maxHeight: "90vh",
                borderRadius: 18,
                background: theme.bg,
                border: `1px solid ${theme.border}`,
                boxShadow: "0 24px 64px rgba(0, 0, 0, 0.34)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden"
              }
        }
      >
        {/* Dedicated Single Sticky Header */}
        <div
          style={{
            height: isMobileView ? 56 : 58,
            padding: isMobileView ? "0 14px" : "0 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
            background: theme.surface,
            borderBottom: `1px solid ${theme.border}`,
            zIndex: 10
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              type="button"
              onClick={handleBack}
              title="Kembali"
              style={{
                border: "none",
                background: "transparent",
                color: theme.ink,
                padding: 6,
                borderRadius: 8,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "opacity 0.15s ease"
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.opacity = "0.7";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.opacity = "1";
              }}
            >
              <ChevronLeft size={22} />
            </button>
            <div style={{ fontSize: 16, fontWeight: 700, color: theme.ink }}>
              {title}
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            boxSizing: "border-box",
            padding: isMobileView ? "16px 14px 60px" : "20px 22px 28px"
          }}
        >
          <div style={{ maxWidth: 640, margin: "0 auto", width: "100%", minWidth: 0, boxSizing: "border-box" }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

