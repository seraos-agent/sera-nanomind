import React from "react";
import { Camera, X, Flashlight, ShoppingBag, Keyboard, RefreshCw, Check, AlertCircle } from "lucide-react";
import type { ThemeType } from "../../../../../theme";
import type { PosCartItem } from "../../../types";

interface ScannerDesktopLayoutProps {
  regionId: string;
  theme: ThemeType;
  title: string;
  continuous: boolean;
  isStarting: boolean;
  cameraError: string | null;
  lastScanned: string | null;
  hasTorch: boolean;
  isTorchOn: boolean;
  toggleTorch: () => void;
  manualCode: string;
  setManualCode: (val: string) => void;
  handleManualSubmit: (e: React.FormEvent) => void;
  cartItems?: PosCartItem[];
  totalCount: number;
  totalAmount: number;
  onProceedToPayment?: () => void;
  onClose: () => void;
}

export const ScannerDesktopLayout: React.FC<ScannerDesktopLayoutProps> = ({
  regionId,
  theme,
  title,
  continuous,
  isStarting,
  cameraError,
  lastScanned,
  hasTorch,
  isTorchOn,
  toggleTorch,
  manualCode,
  setManualCode,
  handleManualSubmit,
  cartItems,
  totalCount,
  totalAmount,
  onProceedToPayment,
  onClose,
}) => {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 16,
          width: "100%",
          maxWidth: 440,
          overflow: "hidden",
          boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 18px",
            borderBottom: `1px solid ${theme.border}`,
            background: theme.surface2,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: `${theme.accent}18`,
                color: theme.accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Camera size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: theme.ink }}>{title}</h3>
              <p style={{ margin: 0, fontSize: 11, color: theme.inkSoft }}>
                Point a barcode or QR code inside the frame
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: theme.inkSoft,
              cursor: "pointer",
              padding: 6,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Viewport Container */}
        <div
          style={{
            position: "relative",
            width: "100%",
            minHeight: 280,
            background: "#0A0D12",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <div
            id={regionId}
            style={{
              width: "100%",
              maxWidth: 380,
              overflow: "hidden",
              borderRadius: 12,
            }}
          />

          {/* Animated Overlay Scan Laser */}
          {!cameraError && !isStarting && (
            <div
              style={{
                position: "absolute",
                top: "22%",
                left: "15%",
                right: "15%",
                height: 2,
                background:
                  "linear-gradient(90deg, rgba(16,185,129,0) 0%, #10B981 50%, rgba(16,185,129,0) 100%)",
                pointerEvents: "none",
                animation: "scanLineAnim 1.8s ease-in-out infinite alternate",
              }}
            />
          )}

          {/* Starting Loader */}
          {isStarting && (
            <div
              style={{
                position: "absolute",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                color: "#FFFFFF",
              }}
            >
              <RefreshCw size={26} className="animate-spin" style={{ color: "#10B981" }} />
              <span style={{ fontSize: 12, opacity: 0.8 }}>Connecting to camera...</span>
            </div>
          )}

          {/* Success Flash on Scanned */}
          {lastScanned && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(16, 185, 129, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10,
                backdropFilter: "blur(2px)",
                transition: "all 0.2s ease",
              }}
            >
              <div
                style={{
                  background: "#10B981",
                  color: "#FFFFFF",
                  padding: "8px 16px",
                  borderRadius: 20,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                }}
              >
                <Check size={18} />
                <span>Terdeteksi: {lastScanned}</span>
              </div>
            </div>
          )}

          {/* Camera Error Message */}
          {cameraError && (
            <div
              style={{
                padding: 24,
                textAlign: "center",
                color: "#FFFFFF",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
              }}
            >
              <AlertCircle size={32} color="#F87171" />
              <p style={{ margin: 0, fontSize: 13, color: "#E2E8F0", lineHeight: 1.5, maxWidth: 320 }}>
                {cameraError}
              </p>
            </div>
          )}

          {/* Controls Bar at bottom of camera */}
          <div
            style={{
              position: "absolute",
              bottom: 12,
              display: "flex",
              alignItems: "center",
              gap: 10,
              zIndex: 5,
            }}
          >
            {hasTorch && (
              <button
                type="button"
                onClick={toggleTorch}
                style={{
                  background: isTorchOn ? "#F59E0B" : "rgba(255,255,255,0.2)",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: 20,
                  padding: "6px 12px",
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  backdropFilter: "blur(4px)",
                }}
              >
                <Flashlight size={14} />
                <span>{isTorchOn ? "Flash On" : "Turn On Flash"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Desktop Cart Bar */}
        {cartItems !== undefined && (
          <div
            style={{
              padding: "9px 14px",
              background: theme.surface2,
              borderTop: `1px solid ${theme.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  background: theme.surface,
                  border: `1px solid ${theme.border}`,
                  color: theme.ink,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ShoppingBag size={14} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: theme.ink }}>
                  {totalCount > 0 ? `${totalCount} Items` : "Empty Cart"}
                </span>
                {totalCount > 0 && (
                  <span style={{ fontSize: 13, fontWeight: 700, color: theme.ink }}>
                    • Rp {totalAmount.toLocaleString("id-ID")}
                  </span>
                )}
              </div>
            </div>
            {totalCount > 0 && onProceedToPayment && (
              <button
                type="button"
                onClick={onProceedToPayment}
                style={{
                  background: "#2563EB",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: 6,
                  padding: "5px 12px",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span>Pay</span>
              </button>
            )}
          </div>
        )}

        {/* Manual Barcode Input Fallback */}
        <div
          style={{
            padding: 14,
            background: theme.surface,
            borderTop: `1px solid ${theme.border}`,
          }}
        >
          <form onSubmit={handleManualSubmit} style={{ display: "flex", gap: 8 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Keyboard
                size={16}
                color={theme.inkSoft}
                style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}
              />
              <input
                type="text"
                placeholder="Or enter barcode manually..."
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 10px 8px 34px",
                  borderRadius: 8,
                  border: `1px solid ${theme.border}`,
                  background: theme.surface2,
                  color: theme.ink,
                  fontSize: 13,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <button
              type="submit"
              disabled={!manualCode.trim()}
              style={{
                background: manualCode.trim() ? theme.accent : theme.border,
                color: manualCode.trim() ? theme.accentInk : theme.inkSoft,
                border: "none",
                borderRadius: 8,
                padding: "8px 14px",
                fontSize: 12,
                fontWeight: 600,
                cursor: manualCode.trim() ? "pointer" : "not-allowed",
                whiteSpace: "nowrap",
              }}
            >
              Use
            </button>
          </form>

          {continuous && (
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: theme.surface2,
                  color: theme.ink,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 8,
                  padding: "6px 14px",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Finish Scan
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        #qr-shaded-region {
          display: none !important;
        }
        #${regionId} img {
          display: none !important;
        }
        #${regionId} canvas {
          display: none !important;
        }
        #${regionId} video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
        }
        @keyframes scanLineAnim {
          0% { top: 20%; }
          100% { top: 75%; }
        }
      `}</style>
    </div>
  );
};
