import React from "react";
import type { ThemeType } from "../../../../../theme";
import type { StoreType } from "../../../types";
import type { ProductDiscountResult } from "../hooks/useProductDiscount";

interface ProductPricingSectionProps {
  theme: ThemeType;
  storeType: StoreType;
  hasVariants?: boolean;
  prodNormalPrice: string;
  setProdNormalPrice: (v: string) => void;
  prodCostPrice: string;
  setProdCostPrice: (v: string) => void;
  prodDiscountType: "%" | "nominal";
  setProdDiscountType: (v: "%" | "nominal") => void;
  prodDiscountValue: string;
  setProdDiscountValue: (v: string) => void;
  prodStock: string;
  setProdStock: (v: string) => void;
  prodWeight: string;
  setProdWeight: (v: string) => void;
  prodWeightUnit: "g" | "ml";
  setProdWeightUnit: (v: "g" | "ml") => void;
  discountResult: ProductDiscountResult;
  isMobileView?: boolean;
}

export const formatNumberWithDots = (raw: string | number | undefined): string => {
  if (raw === undefined || raw === null || raw === "") return "";
  const clean = String(raw).replace(/\D/g, "");
  if (!clean) return "";
  return Number(clean).toLocaleString("id-ID");
};

export const ProductPricingSection: React.FC<ProductPricingSectionProps> = ({
  theme,
  storeType,
  hasVariants = false,
  prodNormalPrice,
  setProdNormalPrice,
  prodCostPrice,
  setProdCostPrice,
  prodDiscountType,
  setProdDiscountType,
  prodDiscountValue,
  setProdDiscountValue,
  prodStock,
  setProdStock,
  prodWeight,
  setProdWeight,
  prodWeightUnit,
  setProdWeightUnit,
  discountResult,
  isMobileView
}) => {
  const { normalPriceNum, hasActiveDiscount, calculatedFinalPrice, savingsAmount, computedPercent } =
    discountResult;

  const isMl = prodWeightUnit === "ml";
  const weightFieldNode = (helperText?: string) => (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 5
        }}
      >
        <label style={{ fontSize: 12, fontWeight: 600, color: theme.ink }}>
          {isMl ? "Volume Produk" : "Berat Produk"}
        </label>
        {Number(prodWeight) > 0 && (
          <span style={{ fontSize: 11, color: theme.inkSoft }}>
            = {(Number(prodWeight) / 1000).toLocaleString("id-ID")} {isMl ? "L" : "kg"}
          </span>
        )}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: theme.surface2,
          border: `1px solid ${theme.border}`,
          borderRadius: 8,
          overflow: "hidden"
        }}
      >
        <input
          type="text"
          inputMode="numeric"
          placeholder={isMl ? "Contoh: 500" : "Contoh: 1.000"}
          value={formatNumberWithDots(prodWeight)}
          onChange={(e) => setProdWeight(e.target.value.replace(/\D/g, ""))}
          onKeyDown={(e) => {
            if (["e", "E", "+", "-", "."].includes(e.key)) {
              e.preventDefault();
            }
          }}
          style={{
            flex: 1,
            minWidth: 0,
            padding: "9px 12px",
            border: "none",
            background: "transparent",
            color: theme.ink,
            fontSize: 13,
            fontWeight: 500,
            outline: "none",
            boxSizing: "border-box"
          }}
        />
        {/* Toggle Segmented Pill: Gram vs ml */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "3px 4px",
            gap: 2,
            borderLeft: `1px solid ${theme.border}`,
            background: theme.surface,
            flexShrink: 0
          }}
        >
          <button
            type="button"
            onClick={() => setProdWeightUnit("g")}
            style={{
              padding: "4px 8px",
              fontSize: 11,
              fontWeight: prodWeightUnit === "g" ? 700 : 500,
              border: "none",
              borderRadius: 5,
              background: prodWeightUnit === "g" ? theme.accent : "transparent",
              color: prodWeightUnit === "g" ? "#ffffff" : theme.inkSoft,
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
          >
            Gram
          </button>
          <button
            type="button"
            onClick={() => setProdWeightUnit("ml")}
            style={{
              padding: "4px 8px",
              fontSize: 11,
              fontWeight: prodWeightUnit === "ml" ? 700 : 500,
              border: "none",
              borderRadius: 5,
              background: prodWeightUnit === "ml" ? theme.accent : "transparent",
              color: prodWeightUnit === "ml" ? "#ffffff" : theme.inkSoft,
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
          >
            ml
          </button>
        </div>
      </div>
      {helperText && (
        <span style={{ display: "block", marginTop: 5, fontSize: 11, color: theme.inkSoft }}>
          {helperText}
        </span>
      )}
    </div>
  );

  // When variants are enabled, individual prices and stocks are managed in ProductVariantManager.
  // We only render the product weight/volume field (for physical goods) to ensure shipping calculation remains accurate.
  if (hasVariants) {
    if (storeType === "JASA") return null;
    return (
      <div style={{ marginTop: 4 }}>
        {weightFieldNode("Estimasi berat untuk perhitungan ongkos kirim kurir toko & kurir instan.")}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobileView ? "1fr" : "repeat(auto-fit, minmax(210px, 1fr))",
          gap: 10
        }}
      >
        {/* Kolom 1: Harga Normal */}
        <div>
          <label
            style={{
              display: "block",
              fontSize: 12,
              fontWeight: 600,
              color: theme.ink,
              marginBottom: 5
            }}
          >
            Harga Normal <span style={{ color: "#EF4444" }}>*</span>
          </label>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: theme.surface2,
              border: `1px solid ${theme.border}`,
              borderRadius: 8,
              overflow: "hidden"
            }}
          >
            <span
              style={{
                padding: "9px 10px 9px 12px",
                fontSize: 12,
                fontWeight: 700,
                color: theme.inkSoft,
                borderRight: `1px solid ${theme.border}`,
                background: theme.surface,
                userSelect: "none"
              }}
            >
              Rp
            </span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Contoh: 25.000"
              value={formatNumberWithDots(prodNormalPrice)}
              onChange={(e) => setProdNormalPrice(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => {
                if (["e", "E", "+", "-", "."].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              style={{
                flex: 1,
                minWidth: 0,
                padding: "9px 12px",
                border: "none",
                background: "transparent",
                color: theme.ink,
                fontSize: 13,
                fontWeight: 600,
                outline: "none",
                boxSizing: "border-box"
              }}
            />
          </div>
        </div>

        {/* Kolom 2: Diskon Promo */}
        <div>
          <label
            style={{
              display: "block",
              fontSize: 12,
              fontWeight: 600,
              color: theme.ink,
              marginBottom: 5
            }}
          >
            Diskon Promo
          </label>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: theme.surface2,
              border: `1px solid ${theme.border}`,
              borderRadius: 8,
              overflow: "hidden"
            }}
          >
            <input
              type="text"
              inputMode="numeric"
              placeholder={prodDiscountType === "%" ? "Contoh: 20" : "Contoh: 5.000"}
              value={
                prodDiscountType === "%"
                  ? prodDiscountValue
                  : formatNumberWithDots(prodDiscountValue)
              }
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "");
                if (prodDiscountType === "%" && digits) {
                  const num = parseInt(digits, 10);
                  if (num > 100) {
                    setProdDiscountValue("100");
                    return;
                  }
                }
                setProdDiscountValue(digits);
              }}
              onKeyDown={(e) => {
                if (["e", "E", "+", "-", "."].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              style={{
                flex: 1,
                minWidth: 0,
                padding: "9px 12px",
                border: "none",
                background: "transparent",
                color: theme.ink,
                fontSize: 13,
                fontWeight: 600,
                outline: "none",
                boxSizing: "border-box"
              }}
            />
            {/* Toggle Segmented Pill: % vs Nominal Rp */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "3px 4px",
                gap: 2,
                borderLeft: `1px solid ${theme.border}`,
                background: theme.surface
              }}
            >
              <button
                type="button"
                onClick={() => setProdDiscountType("%")}
                style={{
                  padding: "4px 8px",
                  fontSize: 11,
                  fontWeight: prodDiscountType === "%" ? 700 : 500,
                  border: "none",
                  borderRadius: 5,
                  background: prodDiscountType === "%" ? theme.accent : "transparent",
                  color: prodDiscountType === "%" ? "#ffffff" : theme.inkSoft,
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                %
              </button>
              <button
                type="button"
                onClick={() => setProdDiscountType("nominal")}
                style={{
                  padding: "4px 8px",
                  fontSize: 11,
                  fontWeight: prodDiscountType === "nominal" ? 700 : 500,
                  border: "none",
                  borderRadius: 5,
                  background: prodDiscountType === "nominal" ? theme.accent : "transparent",
                  color: prodDiscountType === "nominal" ? "#ffffff" : theme.inkSoft,
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                Rp
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* LIVE SUMMARY BANNER: Harga Akhir & Hemat */}
      {normalPriceNum > 0 && (
        <div
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            background: hasActiveDiscount ? `${theme.accent}12` : theme.surface2,
            border: `1px solid ${hasActiveDiscount ? `${theme.accent}40` : theme.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 12,
            gap: 8,
            flexWrap: "wrap"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: theme.inkSoft, fontSize: 11 }}>
              Harga Bayar (Kasir & Toko):
            </span>
            <strong style={{ color: theme.ink, fontSize: 13 }}>
              Rp {calculatedFinalPrice.toLocaleString("id-ID")}
            </strong>
          </div>
          {hasActiveDiscount && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#EF4444",
                background: "#FEE2E2",
                padding: "2px 7px",
                borderRadius: 4
              }}
            >
              Hemat Rp {savingsAmount.toLocaleString("id-ID")} (-{computedPercent}%)
            </span>
          )}
        </div>
      )}

      {/* HARGA MODAL (OPSIONAL) + LIVE MARGIN */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 5,
            gap: 8,
            flexWrap: "wrap"
          }}
        >
          <label style={{ fontSize: 12, fontWeight: 600, color: theme.ink }}>
            Harga Modal{" "}
            <span style={{ fontSize: 11, fontWeight: 400, color: theme.inkSoft }}>(Opsional)</span>
          </label>
          {(() => {
            const costNum = parseInt(prodCostPrice.replace(/\D/g, ""), 10) || 0;
            if (costNum <= 0 || calculatedFinalPrice <= 0) return null;
            const unitProfit = calculatedFinalPrice - costNum;
            const marginPct = Math.round((unitProfit / calculatedFinalPrice) * 100);
            const isLoss = unitProfit < 0;
            return (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: isLoss ? "#EF4444" : "#059669",
                  background: isLoss ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.12)",
                  padding: "2px 8px",
                  borderRadius: 999
                }}
              >
                {isLoss
                  ? `Rugi Rp ${Math.abs(unitProfit).toLocaleString("id-ID")}`
                  : `Untung Rp ${unitProfit.toLocaleString("id-ID")} (${marginPct}%)`}
              </span>
            );
          })()}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: theme.surface2,
            border: `1px solid ${theme.border}`,
            borderRadius: 8,
            overflow: "hidden"
          }}
        >
          <span
            style={{
              padding: "9px 10px 9px 12px",
              fontSize: 12,
              fontWeight: 700,
              color: theme.inkSoft,
              borderRight: `1px solid ${theme.border}`,
              background: theme.surface,
              userSelect: "none"
            }}
          >
            Rp
          </span>
          <input
            type="text"
            inputMode="numeric"
            placeholder="Contoh: 15.000 (tidak tampil ke pembeli)"
            value={formatNumberWithDots(prodCostPrice)}
            onChange={(e) => setProdCostPrice(e.target.value.replace(/\D/g, ""))}
            onKeyDown={(e) => {
              if (["e", "E", "+", "-", "."].includes(e.key)) {
                e.preventDefault();
              }
            }}
            style={{
              flex: 1,
              minWidth: 0,
              padding: "9px 12px",
              border: "none",
              background: "transparent",
              color: theme.ink,
              fontSize: 13,
              fontWeight: 500,
              outline: "none",
              boxSizing: "border-box"
            }}
          />
        </div>
      </div>

      {/* STOK & BERAT (GOODS/FOOD) ATAU DURASI (JASA) */}
      {storeType === "JASA" ? (
        <div>
          <label
            style={{
              display: "block",
              fontSize: 12,
              fontWeight: 600,
              color: theme.ink,
              marginBottom: 5
            }}
          >
            Durasi Pengerjaan
          </label>
          <input
            type="text"
            placeholder="60 Menit"
            value={prodStock}
            onChange={(e) => setProdStock(e.target.value)}
            style={{
              width: "100%",
              padding: "9px 12px",
              borderRadius: 8,
              border: `1px solid ${theme.border}`,
              background: theme.surface2,
              color: theme.ink,
              fontSize: 13,
              fontWeight: 500,
              outline: "none",
              boxSizing: "border-box"
            }}
          />
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobileView ? "1fr" : "repeat(auto-fit, minmax(210px, 1fr))",
            gap: 10
          }}
        >
          {/* Kolom 1: Jumlah Stok */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 600,
                color: theme.ink,
                marginBottom: 5
              }}
            >
              Jumlah Stok
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="20"
              value={formatNumberWithDots(prodStock)}
              onChange={(e) => setProdStock(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => {
                if (["e", "E", "+", "-", "."].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: 8,
                border: `1px solid ${theme.border}`,
                background: theme.surface2,
                color: theme.ink,
                fontSize: 13,
                fontWeight: 500,
                outline: "none",
                boxSizing: "border-box"
              }}
            />
          </div>

          {/* Column 2: Product Weight / Volume */}
          {weightFieldNode()}
        </div>
      )}
    </div>
  );
};

