import React from "react";
import { RefreshCw, Check, AlertCircle } from "lucide-react";

interface ScannerOverlayProps {
  cameraError: string | null;
  isStarting: boolean;
  lastScanned: string | null;
  reticleSize?: number;
}

export const ScannerOverlay: React.FC<ScannerOverlayProps> = ({
  cameraError,
  isStarting,
  lastScanned,
  reticleSize = 250,
}) => {
  return (
    <>
      {/* Aiming Reticle */}
      {!cameraError && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          <div
            style={{
              position: "relative",
              width: reticleSize,
              height: reticleSize,
            }}
          >
            {/* 4 Clean Minimalist Corner Brackets (Green #10B981) */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: 32,
                height: 32,
                borderTop: "3.5px solid #10B981",
                borderLeft: "3.5px solid #10B981",
                borderTopLeftRadius: 14,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: 32,
                height: 32,
                borderTop: "3.5px solid #10B981",
                borderRight: "3.5px solid #10B981",
                borderTopRightRadius: 14,
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                width: 32,
                height: 32,
                borderBottom: "3.5px solid #10B981",
                borderLeft: "3.5px solid #10B981",
                borderBottomLeftRadius: 14,
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 32,
                height: 32,
                borderBottom: "3.5px solid #10B981",
                borderRight: "3.5px solid #10B981",
                borderBottomRightRadius: 14,
              }}
            />

            {/* Animated Dynamic Laser Scan Line */}
            {!isStarting && (
              <div
                style={{
                  position: "absolute",
                  left: 6,
                  right: 6,
                  height: 2.5,
                  background:
                    "linear-gradient(90deg, rgba(16,185,129,0) 0%, #10B981 50%, rgba(16,185,129,0) 100%)",
                  animation: "scanLineAnim 1.8s ease-in-out infinite alternate",
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* Starting Loader */}
      {isStarting && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            color: "#FFFFFF",
            zIndex: 15,
            background: "#000000",
          }}
        >
          <RefreshCw size={32} className="animate-spin" style={{ color: "#10B981" }} />
          <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.85)" }}>
            Menyiapkan kamera scanner...
          </span>
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
            zIndex: 25,
            backdropFilter: "blur(2px)",
            transition: "all 0.2s ease",
          }}
        >
          <div
            style={{
              background: "#10B981",
              color: "#FFFFFF",
              padding: "10px 20px",
              borderRadius: 24,
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 14,
              fontWeight: 700,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.25)",
            }}
          >
            <Check size={20} />
            <span>Terdeteksi: {lastScanned}</span>
          </div>
        </div>
      )}

      {/* Camera Error Message */}
      {cameraError && (
        <div
          style={{
            position: "relative",
            zIndex: 25,
            padding: 24,
            textAlign: "center",
            color: "#FFFFFF",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <AlertCircle size={36} color="#F87171" />
          <p style={{ margin: 0, fontSize: 13, color: "#E2E8F0", lineHeight: 1.5, maxWidth: 320 }}>
            {cameraError}
          </p>
        </div>
      )}
    </>
  );
};

