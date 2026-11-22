import { Component, type ReactNode } from "react";
import type { ThemeType } from "../../../theme";

interface ErrorBoundaryProps {
  children: ReactNode;
  theme: ThemeType;
  onBack: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class MerchantErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error?.message || "Terjadi kendala memuat data toko." };
  }

  componentDidCatch(error: Error, info: any) {
    console.error("[MerchantErrorBoundary] Caught runtime error:", error, info);
  }

  handleResetAndReload = () => {
    try {
      localStorage.removeItem("sera_merchant_orders");
      localStorage.removeItem("sera_customer_orders");
    } catch {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const { theme, onBack } = this.props;
      return (
        <div
          style={{
            minHeight: "100vh",
            width: "100%",
            background: theme.bg,
            color: theme.ink,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            textAlign: "center",
            boxSizing: "border-box"
          }}
        >
          <div
            style={{
              maxWidth: 420,
              width: "100%",
              background: theme.surface,
              border: `1px solid ${theme.border}`,
              borderRadius: 16,
              padding: "24px 20px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 14,
              boxShadow: "0 10px 25px rgba(0,0,0,0.15)"
            }}
          >
            <div style={{ fontSize: 36 }}>🏪</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: theme.ink }}>
              Pemulihan Mitra Store
            </div>
            <div style={{ fontSize: 12.5, color: theme.inkSoft, lineHeight: 1.5 }}>
              Memori penyimpanan lokal browser sempat melebihi batas karena foto pesanan sebelumnya. Tekan tombol di bawah untuk membersihkan memori dan membuka toko.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", marginTop: 6 }}>
              <button
                type="button"
                onClick={this.handleResetAndReload}
                style={{
                  width: "100%",
                  padding: "10px 16px",
                  borderRadius: 10,
                  background: theme.accent,
                  color: "#FFFFFF",
                  border: "none",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer"
                }}
              >
                Bersihkan Cache &amp; Buka Toko
              </button>
              <button
                type="button"
                onClick={onBack}
                style={{
                  width: "100%",
                  padding: "10px 16px",
                  borderRadius: 10,
                  background: theme.surface2,
                  color: theme.ink,
                  border: `1px solid ${theme.border}`,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer"
                }}
              >
                Kembali ke Beranda
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
