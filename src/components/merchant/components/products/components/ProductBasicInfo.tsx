import React from "react";
import { Barcode, Camera } from "lucide-react";
import type { ThemeType } from "../../../../../theme";
import { type StoreType, type MerchantStore, getStoreProductCategories } from "../../../types";

interface ProductBasicInfoProps {
  theme: ThemeType;
  storeType: StoreType;
  store: MerchantStore | null;
  isMobileView?: boolean;
  prodName: string;
  setProdName: (v: string) => void;
  prodCategory: string;
  setProdCategory: (v: string) => void;
  prodDescription: string;
  setProdDescription: (v: string) => void;
  prodBarcode: string;
  setProdBarcode: (v: string) => void;
  onOpenScanner: () => void;
}

export const ProductBasicInfo: React.FC<ProductBasicInfoProps> = ({
  theme,
  storeType,
  store,
  isMobileView,
  prodName,
  setProdName,
  prodCategory,
  setProdCategory,
  prodDescription,
  setProdDescription,
  prodBarcode,
  setProdBarcode,
  onOpenScanner
}) => {
  const maxNameLength = storeType === "FOOD" ? 30 : 60;
  const maxDescLength = storeType === "FOOD" ? 300 : 1000;

  return (
    <div
      style={{
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderRadius: 12,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 14
      }}
    >
      {/* Product Name */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 6
          }}
        >
          <label style={{ fontSize: 12, fontWeight: 600, color: theme.ink }}>
            {storeType === "JASA"
              ? "Nama Jasa"
              : storeType === "FOOD"
                ? "Nama Menu Food"
                : "Nama Produk Barang"}
          </label>
          <span
            style={{
              fontSize: 11,
              color: prodName.length >= maxNameLength ? "#EF4444" : theme.inkSoft,
              fontWeight: prodName.length >= maxNameLength ? 600 : 400
            }}
          >
            {prodName.length}/{maxNameLength}
          </span>
        </div>
        <textarea
          rows={2}
          maxLength={maxNameLength}
          placeholder={
            storeType === "JASA"
              ? "Contoh: Servis AC 1 PK"
              : storeType === "FOOD"
                ? "Contoh: Nasi Goreng Spesial Telur"
                : "Contoh: Beras Rojolele 5kg"
          }
          value={prodName}
          onChange={(e) => setProdName(e.target.value.replace(/[\r\n]/g, "").slice(0, maxNameLength))}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
            }
          }}
          style={{
            width: "100%",
            minWidth: 0,
            padding: "9px 12px",
            borderRadius: 8,
            border: `1px solid ${theme.border}`,
            background: theme.surface2,
            color: theme.ink,
            fontSize: 13,
            fontFamily: "inherit",
            lineHeight: 1.4,
            resize: "none",
            outline: "none",
            wordBreak: "break-word",
            boxSizing: "border-box"
          }}
        />
      </div>

      {/* Product Category */}
      <div>
        <label
          style={{
            display: "block",
            fontSize: 12,
            fontWeight: 600,
            color: theme.ink,
            marginBottom: 6
          }}
        >
          Kategori {storeType === "FOOD" ? "Menu" : "di Toko"}
        </label>
        <select
          value={prodCategory}
          onChange={(e) => setProdCategory(e.target.value)}
          style={{
            width: "100%",
            padding: "9px 12px",
            borderRadius: 8,
            border: `1px solid ${theme.border}`,
            background: theme.surface2,
            color: theme.ink,
            fontSize: 13,
            outline: "none",
            boxSizing: "border-box"
          }}
        >
          <option value="">- Tanpa Kategori (Tampil di Semua) -</option>
          {getStoreProductCategories(store?.customCategories).map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Product Description */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 6
          }}
        >
          <label style={{ fontSize: 12, fontWeight: 600, color: theme.ink }}>
            {storeType === "JASA"
              ? "Deskripsi Layanan / Jasa"
              : storeType === "FOOD"
                ? "Deskripsi Menu"
                : "Deskripsi Produk"}
          </label>
          <span
            style={{
              fontSize: 11,
              color: prodDescription.length >= maxDescLength ? "#EF4444" : theme.inkSoft,
              fontWeight: prodDescription.length >= maxDescLength ? 600 : 400
            }}
          >
            {prodDescription.length}/{maxDescLength}
          </span>
        </div>
        <textarea
          rows={3}
          maxLength={maxDescLength}
          placeholder={
            storeType === "JASA"
              ? "Jelaskan cakupan pengerjaan, garansi, estimasi durasi, atau keunggulan layanan..."
              : storeType === "FOOD"
                ? "Jelaskan rasa, porsi, bahan utama, tingkat kepedasan, atau saran penyajian..."
                : "Jelaskan spesifikasi, material/bahan, ukuran, atau keunggulan produk..."
          }
          value={prodDescription}
          onChange={(e) => setProdDescription(e.target.value.slice(0, maxDescLength))}
          style={{
            width: "100%",
            minWidth: 0,
            padding: "9px 12px",
            borderRadius: 8,
            border: `1px solid ${theme.border}`,
            background: theme.surface2,
            color: theme.ink,
            fontSize: 13,
            fontFamily: "inherit",
            lineHeight: 1.5,
            resize: "vertical",
            minHeight: 80,
            outline: "none",
            wordBreak: "break-word",
            boxSizing: "border-box"
          }}
        />
      </div>

      {/* Barcode / SKU Code (only relevant for retail goods / BARANG stores) */}
      {storeType !== "FOOD" && storeType !== "JASA" && (
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 6,
              gap: 8
            }}
          >
            <label
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: theme.ink,
                display: "flex",
                alignItems: "center",
                gap: 5
              }}
            >
              <Barcode size={14} color={theme.accent} />
              <span>{isMobileView ? "Barcode / SKU" : "Barcode / Kode SKU (Kasir)"}</span>
            </label>

            <button
              type="button"
              onClick={() => {
                const randomDigits = Math.floor(1000000000 + Math.random() * 9000000000);
                setProdBarcode(`899${randomDigits}`);
              }}
              title="Generate Barcode Acak"
              style={{
                background: "none",
                border: "none",
                color: theme.inkSoft,
                fontSize: 11,
                fontWeight: 500,
                cursor: "pointer",
                padding: "2px 0",
                textDecoration: "underline",
                textUnderlineOffset: 2
              }}
            >
              + Acak Barcode
            </button>
          </div>

          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center"
            }}
          >
            <input
              type="text"
              value={prodBarcode}
              onChange={(e) => setProdBarcode(e.target.value)}
              placeholder="Scan atau ketik kode barcode"
              style={{
                width: "100%",
                padding: "9px 85px 9px 12px",
                borderRadius: 8,
                border: `1px solid ${theme.border}`,
                background: theme.surface2,
                color: theme.ink,
                fontSize: 13,
                outline: "none",
                boxSizing: "border-box"
              }}
            />

            <button
              type="button"
              onClick={onOpenScanner}
              style={{
                position: "absolute",
                right: 5,
                padding: "5px 10px",
                borderRadius: 6,
                background: theme.surface,
                border: `1px solid ${theme.border}`,
                color: theme.ink,
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
              }}
            >
              <Camera size={13} color="currentColor" />
              <span>Scan</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

