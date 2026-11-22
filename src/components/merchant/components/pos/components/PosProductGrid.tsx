import React from "react";
import { Search, Camera, FileText, Printer, ShoppingBag, Plus, X, LayoutGrid, List, Barcode } from "lucide-react";
import type { ThemeType } from "../../../../../theme";
import type { MerchantProduct, StoreType } from "../../../types";

export interface PosProductGridProps {
  theme: ThemeType;
  isMobileView?: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  categoryList: string[];
  filteredProducts: MerchantProduct[];
  onOpenScanner: () => void;
  onOpenReport: () => void;
  onOpenPrinterSettings?: () => void;
  onSelectProduct: (p: MerchantProduct) => void;
  onSelectVariantModal: (p: MerchantProduct) => void;
  storeType?: StoreType;
  viewMode?: "grid" | "list";
  onToggleViewMode?: (mode: "grid" | "list") => void;
  showScannerButton?: boolean;
  onBarcodeEnter?: (code: string) => void;
  extraHeaderContent?: React.ReactNode;
}

const DEFAULT_POS_CARD_IMAGE =
  "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=360&auto=format&fit=crop&q=75";

/**
 * Rewrites Unsplash URLs to lightweight 360px thumbnails for snappy POS/Cashier mobile grids.
 */
function getOptimizedPosCardImage(url?: string): string {
  const candidate = url || DEFAULT_POS_CARD_IMAGE;
  if (!candidate.includes("images.unsplash.com")) {
    return candidate;
  }
  let optimized = candidate.includes("w=")
    ? candidate.replace(/w=\d+/, "w=360")
    : `${candidate}${candidate.includes("?") ? "&" : "?"}w=360&auto=format&fit=crop`;
  optimized = optimized.includes("q=")
    ? optimized.replace(/q=\d+/, "q=75")
    : `${optimized}${optimized.includes("?") ? "&" : "?"}q=75`;
  return optimized;
}

export const PosProductGrid: React.FC<PosProductGridProps> = React.memo(({
  theme,
  isMobileView,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  categoryList,
  filteredProducts,
  onOpenScanner,
  onOpenReport,
  onOpenPrinterSettings,
  onSelectProduct,
  onSelectVariantModal,
  storeType,
  viewMode = "grid",
  onToggleViewMode,
  showScannerButton = true,
  onBarcodeEnter,
  extraHeaderContent
}) => {
  return (
    <div
      className="pos-product-grid-root"
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        minWidth: 0
      }}
    >
      <style>{`
        .pos-product-grid-root,
        .pos-product-grid-root * {
          transition: none !important;
        }
      `}</style>
      {/* Top Actions Bar */}
      <div
        style={{
          display: "flex",
          flexDirection: isMobileView ? "column" : "row",
          alignItems: isMobileView ? "stretch" : "center",
          gap: isMobileView ? 8 : 10
        }}
      >
        {/* Search Input */}
        <div
          style={{
            position: "relative",
            flex: isMobileView ? undefined : 1,
            width: isMobileView ? "100%" : undefined,
            minWidth: isMobileView ? 0 : 200
          }}
        >
          <Search
            size={16}
            color={theme.inkSoft}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)"
            }}
          />
          <input
            type="text"
            placeholder={
              storeType === "FOOD"
                ? "Cari menu makanan atau minuman..."
                : "Cari nama produk atau scan / ketik barcode..."
            }
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && onBarcodeEnter && searchQuery.trim()) {
                e.preventDefault();
                onBarcodeEnter(searchQuery.trim());
              }
            }}
            style={{
              width: "100%",
              padding: "10px 12px 10px 36px",
              borderRadius: 10,
              border: `1px solid ${theme.border}`,
              background: theme.surface,
              color: theme.ink,
              fontSize: 13,
              outline: "none",
              boxSizing: "border-box"
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: theme.inkSoft
              }}
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Action Buttons Strip */}
        <div
          className="no-scrollbar"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexShrink: 0,
            overflowX: isMobileView ? "auto" : undefined,
            scrollbarWidth: "none"
          }}
        >
        {/* Scan Barcode Button (hidden for FOOD stores when showScannerButton is false) */}
        {showScannerButton && (
          <button
            type="button"
            onClick={onOpenScanner}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: isMobileView ? 6 : 8,
              padding: isMobileView ? "8px 11px" : "9px 15px",
              borderRadius: 10,
              background: theme.surface,
              color: theme.ink,
              border: `1px solid ${theme.border}`,
              fontSize: isMobileView ? 12 : 13,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              whiteSpace: "nowrap",
              flexShrink: 0,
              transition: "all 0.15s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = theme.inkSoft;
              e.currentTarget.style.background = theme.surface2;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = theme.border;
              e.currentTarget.style.background = theme.surface;
            }}
          >
            <Camera size={isMobileView ? 16 : 18} color="currentColor" />
            <span>{isMobileView ? "Scan" : "Scan Barcode"}</span>
          </button>
        )}

        {/* Grid / List View Switcher */}
        {onToggleViewMode && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "stretch",
              borderRadius: 10,
              border: `1px solid ${theme.border}`,
              background: theme.surface,
              overflow: "hidden",
              flexShrink: 0,
              transition: "none"
            }}
          >
            <button
              type="button"
              onClick={() => onToggleViewMode("grid")}
              title="Tampilan Grid Foto"
              style={{
                padding: isMobileView ? "7px 9px" : "8px 10px",
                border: "none",
                outline: "none",
                background: viewMode === "grid" ? `${theme.accent}18` : "transparent",
                color: viewMode === "grid" ? theme.accent : theme.inkSoft,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "none",
                WebkitTapHighlightColor: "transparent",
                userSelect: "none"
              }}
            >
              <LayoutGrid size={16} />
            </button>
            <div style={{ width: 1, background: theme.border, flexShrink: 0 }} />
            <button
              type="button"
              onClick={() => onToggleViewMode("list")}
              title="Tampilan Tabel Data & Barcode"
              style={{
                padding: isMobileView ? "7px 9px" : "8px 10px",
                border: "none",
                outline: "none",
                background: viewMode === "list" ? `${theme.accent}18` : "transparent",
                color: viewMode === "list" ? theme.accent : theme.inkSoft,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "none",
                WebkitTapHighlightColor: "transparent",
                userSelect: "none"
              }}
            >
              <List size={16} />
            </button>
          </div>
        )}

        {/* Rekap Kasir Button */}
        <button
          type="button"
          onClick={onOpenReport}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            flex: isMobileView ? 1 : undefined,
            gap: 6,
            padding: isMobileView ? "8px 11px" : "9px 14px",
            borderRadius: 10,
            background: theme.surface,
            color: theme.ink,
            border: `1px solid ${theme.border}`,
            fontSize: isMobileView ? 12 : 13,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            whiteSpace: "nowrap",
            transition: "all 0.15s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = theme.inkSoft;
            e.currentTarget.style.background = theme.surface2;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = theme.border;
            e.currentTarget.style.background = theme.surface;
          }}
        >
          <FileText size={15} color="currentColor" />
          <span>{isMobileView ? "Rekap" : "Rekap Kasir"}</span>
        </button>

        {onOpenPrinterSettings && (
          <button
            type="button"
            onClick={onOpenPrinterSettings}
            title="Pengaturan Printer Thermal"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              padding: isMobileView ? "8px 11px" : "9px 12px",
              borderRadius: 10,
              background: theme.surface,
              color: theme.ink,
              border: `1px solid ${theme.border}`,
              fontSize: isMobileView ? 12 : 13,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              whiteSpace: "nowrap",
              flexShrink: 0,
              transition: "all 0.15s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = theme.inkSoft;
              e.currentTarget.style.background = theme.surface2;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = theme.border;
              e.currentTarget.style.background = theme.surface;
            }}
          >
            <Printer size={15} color="currentColor" />
            <span>Printer</span>
          </button>
        )}
        </div>
      </div>

      {/* Category Chips Bar (Smooth Horizontal Scroll Without Scrollbar) */}
      <div
        className="no-scrollbar"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          overflowX: "auto",
          paddingBottom: 4,
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch"
        }}
      >
        {categoryList.map((cat) => {
          const active = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onSelectCategory(cat)}
              style={{
                padding: "6px 14px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: active ? 700 : 500,
                border: `1px solid ${active ? theme.ink : theme.border}`,
                background: theme.surface,
                color: active ? theme.ink : theme.inkSoft,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.15s ease"
              }}
            >
              {cat === "ALL" ? (storeType === "FOOD" ? "Semua Menu" : "Semua Produk") : cat}
            </button>
          );
        })}
      </div>

      {/* Optional Extra Header Strip (e.g. Held Bills / Open Tables) */}
      {extraHeaderContent}

      {/* Product Cards Grid or Compact Data/Barcode List */}
      {filteredProducts.length === 0 ? (
        <div
          style={{
            padding: 40,
            textAlign: "center",
            background: theme.surface,
            borderRadius: 14,
            border: `1px solid ${theme.border}`,
            color: theme.inkSoft
          }}
        >
          <ShoppingBag size={36} style={{ opacity: 0.4, marginBottom: 8 }} />
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
            Tidak ada produk yang cocok
          </p>
          <p style={{ margin: 0, fontSize: 12, marginTop: 4 }}>
            {storeType === "FOOD"
              ? "Coba ubah kata kunci pencarian atau pilih kategori lain"
              : "Coba ubah kata kunci pencarian atau scan barcode produk"}
          </p>
        </div>
      ) : viewMode === "list" ? (
        <div
          key="pos-list-container"
          style={{
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: 14,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            transition: "none"
          }}
        >
          {filteredProducts.map((p, idx) => {
            const isOutOfStock = p.type === "GOODS" && p.stock !== undefined && p.stock <= 0;
            const hasVar = p.variants && p.variants.length > 0;
            const displayPrice = hasVar
              ? Math.min(...(p.variants?.map((v) => v.price) || [p.price]))
              : p.price;

            return (
              <div
                key={`list-${p.id}`}
                onClick={() => {
                  if (isOutOfStock) return;
                  if (hasVar) {
                    onSelectVariantModal(p);
                  } else {
                    onSelectProduct(p);
                  }
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: isMobileView ? "11px 12px" : "10px 14px",
                  borderBottom: idx === filteredProducts.length - 1 ? "none" : `1px solid ${theme.border}`,
                  opacity: isOutOfStock ? 0.5 : 1,
                  cursor: isOutOfStock ? "not-allowed" : "pointer",
                  userSelect: "none",
                  transition: "none"
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: theme.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {p.name}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8, marginTop: 3, fontSize: 11, color: theme.inkSoft }}>
                    {p.barcode && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontFamily: "JetBrains Mono, monospace" }}>
                        <Barcode size={12} /> {p.barcode}
                      </span>
                    )}
                    <span>{p.category}</span>
                    {hasVar && <span>• {p.variants!.length} varian</span>}
                    <span style={{ fontWeight: 600, color: isOutOfStock ? "#EF4444" : "#10B981" }}>
                      {p.type === "GOODS"
                        ? (isOutOfStock ? "Habis" : `Stok: ${p.stock ?? 0}`)
                        : (p.duration || "Layanan")}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: theme.accent }}>
                      {hasVar ? "Mulai " : ""}Rp {displayPrice.toLocaleString("id-ID")}
                    </div>
                    {!hasVar && p.originalPrice && p.originalPrice > p.price && (
                      <div style={{ fontSize: 10, color: theme.inkSoft, textDecoration: "line-through" }}>
                        Rp {p.originalPrice.toLocaleString("id-ID")}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={isOutOfStock}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isOutOfStock) return;
                      if (hasVar) {
                        onSelectVariantModal(p);
                      } else {
                        onSelectProduct(p);
                      }
                    }}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      border: isOutOfStock ? `1px solid ${theme.border}` : `1px solid ${theme.accent}30`,
                      background: isOutOfStock ? theme.surface2 : `${theme.accent}14`,
                      color: isOutOfStock ? theme.inkSoft : theme.accent,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: isOutOfStock ? "not-allowed" : "pointer"
                    }}
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          key="pos-grid-container"
          style={{
            display: "grid",
            gridTemplateColumns: isMobileView
              ? "repeat(2, minmax(0, 1fr))"
              : "repeat(auto-fill, minmax(138px, 1fr))",
            gap: isMobileView ? 10 : 8,
            transition: "none",
            contain: "layout paint"
          }}
        >
          {filteredProducts.map((p) => {
            const isOutOfStock = p.stock !== undefined && p.stock <= 0;
            const hasVar = p.variants && p.variants.length > 0;
            const displayPrice = hasVar
              ? Math.min(...(p.variants?.map((v) => v.price) || [p.price]))
              : p.price;

            return (
              <div
                key={`grid-${p.id}`}
                onClick={() => {
                  if (isOutOfStock) return;
                  if (hasVar) {
                    onSelectVariantModal(p);
                  } else {
                    onSelectProduct(p);
                  }
                }}
                style={{
                  background: theme.surface,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 12,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  opacity: isOutOfStock ? 0.5 : 1,
                  position: "relative",
                  cursor: isOutOfStock ? "not-allowed" : "pointer",
                  userSelect: "none",
                  transition: "none",
                  contain: "layout paint"
                }}
              >
                {/* Thumbnail Image (Full width edge-to-edge without frame) */}
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: isMobileView ? "1/1" : "4/3",
                    background: theme.surface2,
                    overflow: "hidden",
                    contain: "layout paint"
                  }}
                >
                  <img
                    src={getOptimizedPosCardImage(p.images[0])}
                    alt={p.name}
                    decoding="async"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transform: "translateZ(0)",
                      backfaceVisibility: "hidden"
                    }}
                  />
                  {/* Diskon badge di kanan atas jika ada */}
                  {p.originalPrice && p.price && p.originalPrice > p.price && (
                    <span
                      style={{
                        position: "absolute",
                        top: 6,
                        right: 6,
                        padding: "2px 6px",
                        borderRadius: 6,
                        fontSize: 9.5,
                        fontWeight: 700,
                        background: "#EF4444",
                        color: "#fff"
                      }}
                    >
                      -{Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)}%
                    </span>
                  )}

                  {/* Teks Stok di kiri bawah foto */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 6,
                      left: 6,
                      padding: "2px 7px",
                      borderRadius: 6,
                      fontSize: 10,
                      fontWeight: 600,
                      background: "rgba(15, 23, 42, 0.84)",
                      color: p.type === "GOODS" && (p.stock ?? 0) <= 0 ? "#F87171" : "#FFFFFF",
                      lineHeight: 1.2,
                      display: "flex",
                      alignItems: "center",
                      userSelect: "none"
                    }}
                  >
                    {p.type === "GOODS"
                      ? ((p.stock ?? 0) <= 0 ? "Habis" : `Stok: ${p.stock ?? 0}`)
                      : (p.duration || "Siap Booking")}
                  </div>
                </div>

                {/* Info & Action Controls */}
                <div
                  style={{
                    padding: isMobileView ? 10 : 8,
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                  }}
                >
                  {/* Product Name */}
                  <h4
                    style={{
                      margin: "0 0 3px",
                      fontSize: isMobileView ? 13 : 12,
                      fontWeight: 600,
                      color: theme.ink,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      lineHeight: 1.25,
                      minHeight: isMobileView ? 34 : 30
                    }}
                  >
                    {p.name}
                  </h4>

                  {/* Price and Add button */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: "auto",
                      paddingTop: 4
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "baseline", gap: 4, flexWrap: "wrap", minWidth: 0, flex: 1, marginRight: 4 }}>
                      <span
                        style={{
                          fontSize: isMobileView ? 13 : 12,
                          fontWeight: 700,
                          color: theme.accent
                        }}
                      >
                        {hasVar ? "Mulai " : ""}Rp {displayPrice.toLocaleString("id-ID")}
                      </span>
                      {!hasVar && p.originalPrice && p.originalPrice > p.price && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 500,
                            color: theme.inkSoft,
                            textDecoration: "line-through"
                          }}
                        >
                          Rp {p.originalPrice.toLocaleString("id-ID")}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isOutOfStock) return;
                        if (hasVar) {
                          onSelectVariantModal(p);
                        } else {
                          onSelectProduct(p);
                        }
                      }}
                      title={isOutOfStock ? "Stok habis" : (hasVar ? "Pilih varian" : "Tambah ke keranjang")}
                      style={{
                        width: isMobileView ? 32 : 26,
                        height: isMobileView ? 32 : 26,
                        borderRadius: 8,
                        border: isOutOfStock ? `1px solid ${theme.border}` : `1px solid ${theme.accent}30`,
                        background: isOutOfStock ? theme.surface2 : `${theme.accent}14`,
                        color: isOutOfStock ? theme.inkSoft : theme.accent,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: isOutOfStock ? "not-allowed" : "pointer",
                        transition: "all 0.15s ease",
                        padding: 0,
                        flexShrink: 0
                      }}
                    >
                      <Plus size={isMobileView ? 16 : 14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

