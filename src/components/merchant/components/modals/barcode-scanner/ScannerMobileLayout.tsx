import React from "react";
import { ChevronLeft, Flashlight, ShoppingBag, ChevronUp, Keyboard } from "lucide-react";
import type { ThemeType } from "../../../../../theme";
import type { PosCartItem } from "../../../types";
import { ScannerOverlay } from "./ScannerOverlay";
import { ScannerCartDrawer } from "./ScannerCartDrawer";

interface ScannerMobileLayoutProps {
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
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  cartItems?: PosCartItem[];
  totalCount: number;
  totalAmount: number;
  productDiscountTotal: number;
  manualDiscountNominal: number;
  onUpdateManualDiscount?: (val: number) => void;
  onUpdateQty?: (index: number, nextQty: number) => void;
  onRemoveItem?: (index: number) => void;
  onClearCart?: () => void;
  onProceedToPayment?: () => void;
  onClose: () => void;
}

export const ScannerMobileLayout: React.FC<ScannerMobileLayoutProps> = ({
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
  isCartDrawerOpen,
  setIsCartDrawerOpen,
  cartItems,
  totalCount,
  totalAmount,
  productDiscountTotal,
  manualDiscountNominal,
  onUpdateManualDiscount,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onProceedToPayment,
  onClose,
}) => {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#000000",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* Mobile Fullscreen Header Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          background: theme.isDark ? "rgba(18, 20, 23, 0.94)" : "rgba(255, 255, 255, 0.94)",
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${theme.border}`,
          color: theme.ink,
          flexShrink: 0,
          position: "relative",
          zIndex: 30,
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Kembali"
          style={{
            background: theme.isDark ? "rgba(255, 255, 255, 0.08)" : theme.surface2,
            border: `1px solid ${theme.border}`,
            color: theme.ink,
            cursor: "pointer",
            width: 36,
            height: 36,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ChevronLeft size={22} />
        </button>

        <div style={{ textAlign: "center", flex: 1, padding: "0 8px" }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: theme.ink }}>{title}</h3>
          <p style={{ margin: 0, fontSize: 11, color: theme.inkSoft }}>
            Arahkan barcode / QR ke dalam kotak
          </p>
        </div>

        {hasTorch ? (
          <button
            type="button"
            onClick={toggleTorch}
            style={{
              background: isTorchOn
                ? "#F59E0B"
                : theme.isDark
                ? "rgba(255, 255, 255, 0.08)"
                : theme.surface2,
              border: `1px solid ${isTorchOn ? "#F59E0B" : theme.border}`,
              color: isTorchOn ? "#FFFFFF" : theme.ink,
              cursor: "pointer",
              width: 36,
              height: 36,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Flashlight size={18} />
          </button>
        ) : (
          <div style={{ width: 36 }} />
        )}
      </div>

      {/* Fullscreen Viewport Area */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          position: "relative",
          width: "100%",
          background: "#000000",
          overflow: "hidden",
        }}
      >
        {/* Layer 1: HTML5 QR Code Full-Bleed Video Stream */}
        <div
          id={regionId}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            zIndex: 1,
          }}
        />

        {/* Layer 2: Reticle & Overlay Messages */}
        <ScannerOverlay
          cameraError={cameraError}
          isStarting={isStarting}
          lastScanned={lastScanned}
          reticleSize={250}
        />
      </div>

      {/* Bottom Bar: Docked Cart Bar, Manual Barcode Input & Finish Button */}
      <div
        style={{
          padding: "12px 16px 16px",
          background: theme.isDark ? "rgba(18, 20, 23, 0.96)" : "rgba(255, 255, 255, 0.96)",
          backdropFilter: "blur(16px)",
          borderTop: `1px solid ${theme.border}`,
          flexShrink: 0,
          zIndex: 30,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {/* Row 1: Docked Cart Bar */}
        {cartItems !== undefined && (
          <div
            onClick={() => setIsCartDrawerOpen(true)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "9px 12px",
              borderRadius: 10,
              background: theme.surface2,
              border: `1px solid ${theme.border}`,
              color: theme.ink,
              cursor: "pointer",
              transition: "all 0.15s ease",
              userSelect: "none",
            }}
          >
            {/* Left: Clean Icon + Compact Text */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: theme.surface,
                  border: `1px solid ${theme.border}`,
                  color: theme.ink,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <ShoppingBag size={16} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: theme.ink }}>
                  {totalCount > 0 ? `${totalCount} Item` : "Keranjang Kosong"}
                </span>
                {totalCount > 0 && (
                  <span style={{ fontSize: 13, fontWeight: 700, color: theme.ink }}>
                    • Rp {totalAmount.toLocaleString("id-ID")}
                  </span>
                )}
              </div>
            </div>

            {/* Right: Clean minimal pill */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "5px 10px",
                borderRadius: 8,
                background: theme.surface,
                border: `1px solid ${theme.border}`,
                fontSize: 11.5,
                fontWeight: 600,
                color: totalCount > 0 ? theme.ink : theme.inkSoft,
              }}
            >
              <span>{totalCount > 0 ? "Daftar" : "0 Item"}</span>
              <ChevronUp size={13} color={theme.inkSoft} />
            </div>
          </div>
        )}

        {/* Row 2: Manual Barcode Input */}
        <form onSubmit={handleManualSubmit} style={{ display: "flex", gap: 8 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Keyboard
              size={16}
              color={theme.inkSoft}
              style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              type="text"
              placeholder="Atau ketik barcode manual..."
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 12px 9px 38px",
                borderRadius: 10,
                border: `1px solid ${theme.border}`,
                background: theme.isDark ? "rgba(255, 255, 255, 0.08)" : theme.surface2,
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
              background: manualCode.trim()
                ? theme.accent
                : theme.isDark
                ? "rgba(255, 255, 255, 0.08)"
                : theme.surface2,
              color: manualCode.trim() ? theme.accentInk : theme.inkSoft,
              border: `1px solid ${manualCode.trim() ? theme.accent : theme.border}`,
              borderRadius: 10,
              padding: "9px 16px",
              fontSize: 13,
              fontWeight: 600,
              cursor: manualCode.trim() ? "pointer" : "not-allowed",
              whiteSpace: "nowrap",
            }}
          >
            Gunakan
          </button>
        </form>

        {/* Row 3: Finish Button */}
        {continuous && (
          <button
            type="button"
            onClick={onClose}
            style={{
              width: "100%",
              padding: "10px",
              background: theme.isDark ? "rgba(255, 255, 255, 0.08)" : theme.surface2,
              color: theme.ink,
              border: `1px solid ${theme.border}`,
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Selesai Scan
          </button>
        )}
      </div>

      {/* Slide-Up Bottom Sheet Drawer */}
      <ScannerCartDrawer
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
        theme={theme}
        cartItems={cartItems}
        totalCount={totalCount}
        totalAmount={totalAmount}
        productDiscountTotal={productDiscountTotal}
        manualDiscountNominal={manualDiscountNominal}
        onUpdateManualDiscount={onUpdateManualDiscount}
        onUpdateQty={onUpdateQty}
        onRemoveItem={onRemoveItem}
        onClearCart={onClearCart}
        onProceedToPayment={onProceedToPayment}
      />

      <style>{`
        #qr-shaded-region,
        #qr-shaded-region * {
          display: none !important;
          visibility: hidden !important;
          border: none !important;
        }
        #${regionId} > div:not(:has(video)) {
          border: none !important;
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
          border-radius: 0 !important;
          position: absolute !important;
          inset: 0 !important;
        }
        #${regionId} {
          width: 100% !important;
          height: 100% !important;
          position: absolute !important;
          inset: 0 !important;
          overflow: hidden !important;
          background: #000000 !important;
        }
        @keyframes scanLineAnim {
          0% { top: 12%; }
          100% { top: 84%; }
        }
        @keyframes slideUpDrawer {
          from {
            transform: translateY(100%);
            opacity: 0.8;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};
