import { Check, AlertCircle } from "lucide-react";
import type { ThemeType } from "../../../../../theme";
import type { StoreCourierConfig } from "../../../types";

interface CourierConfigFormProps {
  config: StoreCourierConfig;
  setConfig: React.Dispatch<React.SetStateAction<StoreCourierConfig>>;
  theme: ThemeType;
  isMobileView?: boolean;
  isSaving: boolean;
  saveSuccess: boolean;
  errorMessage: string;
  onSave: () => void;
}

export function CourierConfigForm({
  config,
  setConfig,
  theme,
  isMobileView,
  isSaving,
  saveSuccess,
  errorMessage,
  onSave
}: CourierConfigFormProps) {
  return (
    <div
      style={{
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderRadius: 20,
        padding: isMobileView ? "20px 16px" : "24px 22px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
      }}
    >
      <div style={{ marginBottom: 18 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: theme.ink }}>
          Delivery Fee Settings
        </h3>
        <p style={{ fontSize: 12.5, color: theme.inkSoft, margin: "3px 0 0 0", lineHeight: 1.45 }}>
          Pricing rules for your store fleet when buyers select <b>Store Courier</b>.
        </p>
      </div>

      <form
        onSubmit={e => {
          e.preventDefault();
          onSave();
        }}
      >
        {/* Pricing Model Selector */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: theme.ink, marginBottom: 8 }}>
            Pricing Calculation Method
          </label>
          <div
            style={{
              display: "flex",
              background: theme.surface2,
              padding: 4,
              borderRadius: 14,
              gap: 4,
              border: `1px solid ${theme.border}`
            }}
          >
            <button
              type="button"
              onClick={() => setConfig(prev => ({ ...prev, pricingType: "FLAT" }))}
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: 10,
                border: "none",
                background: config.pricingType === "FLAT" ? theme.surface : "transparent",
                color: config.pricingType === "FLAT" ? theme.ink : theme.inkSoft,
                fontSize: 13,
                fontWeight: config.pricingType === "FLAT" ? 700 : 500,
                cursor: "pointer",
                boxShadow: config.pricingType === "FLAT" ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                transition: "all 0.15s ease"
              }}
            >
              Flat Rate
            </button>
            <button
              type="button"
              onClick={() => setConfig(prev => ({ ...prev, pricingType: "PER_KM" }))}
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: 10,
                border: "none",
                background: config.pricingType === "PER_KM" ? theme.surface : "transparent",
                color: config.pricingType === "PER_KM" ? theme.ink : theme.inkSoft,
                fontSize: 13,
                fontWeight: config.pricingType === "PER_KM" ? 700 : 500,
                cursor: "pointer",
                boxShadow: config.pricingType === "PER_KM" ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                transition: "all 0.15s ease"
              }}
            >
              Per Kilometer (KM)
            </button>
          </div>
        </div>

        {/* Flat Rate / Base Rate Input */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: theme.ink, marginBottom: 8 }}>
            {config.pricingType === "FLAT" ? "Flat Delivery Fee" : "Base Rate (Rp)"}
          </label>
          <div
            style={{
              display: "flex",
              alignItems: "stretch",
              height: 48,
              background: theme.surface2,
              borderRadius: 14,
              border: `1px solid ${theme.border}`,
              overflow: "hidden"
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "0 14px",
                fontSize: 13,
                fontWeight: 700,
                color: theme.inkSoft,
                borderRight: `1px solid ${theme.border}`,
                userSelect: "none"
              }}
            >
              Rp
            </div>
            <input
              type="number"
              min={0}
              step={500}
              value={config.flatRate}
              onChange={e => setConfig(prev => ({ ...prev, flatRate: Number(e.target.value) || 0 }))}
              style={{
                flex: 1,
                border: "none",
                background: "transparent",
                padding: "0 14px",
                fontSize: 14,
                fontWeight: 600,
                color: theme.ink,
                outline: "none"
              }}
            />
          </div>
          <span style={{ fontSize: 12, color: theme.inkSoft, marginTop: 6, display: "block", lineHeight: 1.4 }}>
            Example: Rp 5.000 flat across nearby neighborhoods.
          </span>
        </div>

        {/* Per KM Rate (Only if PER_KM selected) */}
        {config.pricingType === "PER_KM" && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: theme.ink, marginBottom: 8 }}>
              Additional Rate per Kilometer
            </label>
            <div
              style={{
                display: "flex",
                alignItems: "stretch",
                height: 48,
                background: theme.surface2,
                borderRadius: 14,
                border: `1px solid ${theme.border}`,
                overflow: "hidden"
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "0 14px",
                  fontSize: 13,
                  fontWeight: 700,
                  color: theme.inkSoft,
                  borderRight: `1px solid ${theme.border}`,
                  userSelect: "none"
                }}
              >
                Rp
              </div>
              <input
                type="number"
                min={0}
                step={500}
                value={config.perKmRate}
                onChange={e => setConfig(prev => ({ ...prev, perKmRate: Number(e.target.value) || 0 }))}
                style={{
                  flex: 1,
                  border: "none",
                  background: "transparent",
                  padding: "0 14px",
                  fontSize: 14,
                  fontWeight: 600,
                  color: theme.ink,
                  outline: "none"
                }}
              />
            </div>
          </div>
        )}

        {/* Hairline Divider Between Pricing & Delivery Rules */}
        <div style={{ height: 1, background: theme.border, margin: "22px 0 18px 0" }} />

        {/* Section 2: Coverage & Delivery Terms */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: theme.ink, marginBottom: 2 }}>
            Coverage &amp; Delivery Terms
          </div>
          <div style={{ fontSize: 12.5, color: theme.inkSoft }}>
            Maximum delivery distance limit and estimated arrival time
          </div>
        </div>

        {/* Max Delivery Radius */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: theme.ink, marginBottom: 8 }}>
            Maximum Delivery Distance
          </label>
          <div
            style={{
              display: "flex",
              alignItems: "stretch",
              height: 48,
              background: theme.surface2,
              borderRadius: 14,
              border: `1px solid ${theme.border}`,
              overflow: "hidden"
            }}
          >
            <input
              type="number"
              min={1}
              max={30}
              value={config.maxDistanceKm}
              onChange={e => setConfig(prev => ({ ...prev, maxDistanceKm: Number(e.target.value) || 5 }))}
              style={{
                flex: 1,
                border: "none",
                background: "transparent",
                padding: "0 14px",
                fontSize: 14,
                fontWeight: 600,
                color: theme.ink,
                outline: "none"
              }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "0 14px",
                fontSize: 12.5,
                fontWeight: 700,
                color: theme.inkSoft,
                borderLeft: `1px solid ${theme.border}`,
                userSelect: "none"
              }}
            >
              KM
            </div>
          </div>
        </div>

        {/* Free Delivery Threshold */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: theme.ink }}>
              Free Shipping Min. Order
            </label>
            <span
              style={{
                fontSize: 11,
                color: theme.inkSoft,
                fontWeight: 600,
                padding: "2px 8px",
                background: theme.surface2,
                borderRadius: 6,
                border: `1px solid ${theme.border}`
              }}
            >
              Optional
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "stretch",
              height: 48,
              background: theme.surface2,
              borderRadius: 14,
              border: `1px solid ${theme.border}`,
              overflow: "hidden"
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "0 14px",
                fontSize: 13,
                fontWeight: 700,
                color: theme.inkSoft,
                borderRight: `1px solid ${theme.border}`,
                userSelect: "none"
              }}
            >
              Rp
            </div>
            <input
              type="number"
              min={0}
              step={5000}
              value={config.freeDeliveryThreshold ?? 0}
              onChange={e => setConfig(prev => ({ ...prev, freeDeliveryThreshold: Number(e.target.value) || 0 }))}
              placeholder="0 if no promo"
              style={{
                flex: 1,
                border: "none",
                background: "transparent",
                padding: "0 14px",
                fontSize: 14,
                fontWeight: 600,
                color: theme.ink,
                outline: "none"
              }}
            />
          </div>
          <span style={{ fontSize: 12, color: theme.inkSoft, marginTop: 6, display: "block", lineHeight: 1.4 }}>
            Example: Orders above Rp 50.000 automatically get free shipping.
          </span>
        </div>

        {/* Estimated Delivery Time */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: theme.ink, marginBottom: 8 }}>
            Estimated Delivery Time
          </label>
          <input
            type="text"
            value={config.estimatedMinutes}
            onChange={e => setConfig(prev => ({ ...prev, estimatedMinutes: e.target.value }))}
            placeholder="Example: 30-45 Mins or Same-Day Slots"
            style={{
              width: "100%",
              boxSizing: "border-box",
              height: 48,
              padding: "0 14px",
              borderRadius: 14,
              border: `1px solid ${theme.border}`,
              background: theme.surface2,
              color: theme.ink,
              fontSize: 13.5,
              fontWeight: 500,
              outline: "none"
            }}
          />
        </div>

        {/* Feedback Messages */}
        {saveSuccess && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 14px",
              background: theme.surface2,
              border: `1px solid ${theme.border}`,
              color: theme.ink,
              borderRadius: 12,
              fontSize: 12.5,
              fontWeight: 600,
              marginBottom: 16
            }}
          >
            <Check size={16} color="#10B981" />
            <span>Settings saved successfully.</span>
          </div>
        )}

        {errorMessage && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 14px",
              background: "#EF444415",
              color: "#EF4444",
              borderRadius: 12,
              fontSize: 12.5,
              fontWeight: 500,
              marginBottom: 16
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSaving}
          style={{
            width: "100%",
            height: 48,
            borderRadius: 20,
            border: "none",
            background: theme.ink,
            color: theme.bg,
            fontSize: 14,
            fontWeight: 700,
            cursor: isSaving ? "not-allowed" : "pointer",
            opacity: isSaving ? 0.7 : 1,
            boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
            transition: "all 0.15s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8
          }}
        >
          {isSaving ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
