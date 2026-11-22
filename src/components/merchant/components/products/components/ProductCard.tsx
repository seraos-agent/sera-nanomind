import React from "react";
import { Camera, Edit2, Trash2 } from "lucide-react";
import type { ThemeType } from "../../../../../theme";
import type { MerchantProduct } from "../../../types";

interface ProductCardProps {
  product: MerchantProduct;
  theme: ThemeType;
  isMobileView?: boolean;
  onEdit: (product: MerchantProduct) => void;
  onDelete: (product: MerchantProduct) => void;
  aspectRatio?: string;
}

/**
 * Rewrites Unsplash image URLs to 400px thumbnails while passing uploaded R2/data URLs unchanged.
 */
function getOptimizedMerchantCardImage(url: string): string {
  if (!url.includes("images.unsplash.com")) {
    return url;
  }
  let optimized = url.includes("w=")
    ? url.replace(/w=\d+/, "w=400")
    : `${url}${url.includes("?") ? "&" : "?"}w=400&auto=format&fit=crop`;
  optimized = optimized.includes("q=")
    ? optimized.replace(/q=\d+/, "q=75")
    : `${optimized}${optimized.includes("?") ? "&" : "?"}q=75`;
  return optimized;
}

export const ProductCard: React.FC<ProductCardProps> = React.memo(({
  product,
  theme,
  isMobileView,
  onEdit,
  onDelete,
  aspectRatio
}) => {
  if (!product) return null;
  const p = product;
  const isOutOfStock = p.type === "GOODS" && (p.stock ?? 0) <= 0;
  const cardAspectRatio = aspectRatio || (isMobileView ? "1/1" : "4/3");

  return (
    <div
      style={{
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderRadius: isMobileView ? 10 : 12,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        contain: "layout paint"
      }}
    >
      {/* Image Thumbnail */}
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: cardAspectRatio,
          background: theme.surface2,
          overflow: "hidden",
          contain: "layout paint"
        }}
      >
        {p.images?.[0] ? (
          <img
            src={getOptimizedMerchantCardImage(p.images[0])}
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
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              color: theme.inkSoft,
              padding: 8,
              textAlign: "center"
            }}
          >
            <Camera size={24} strokeWidth={1.7} />
            <span style={{ fontSize: 10.5, fontWeight: 600 }}>Belum ada foto</span>
          </div>
        )}

        {/* Draft Badge */}
        {p.status === "DRAFT" && (
          <span
            style={{
              position: "absolute",
              top: 6,
              left: 6,
              padding: "2px 7px",
              borderRadius: 6,
              fontSize: 9.5,
              fontWeight: 700,
              background: "rgba(217, 119, 6, 0.92)",
              color: "#fff"
            }}
          >
            DRAFT
          </span>
        )}

        {/* Discount Badge */}
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

        {/* Stock text in bottom-left */}
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
            color: isOutOfStock ? "#F87171" : "#FFFFFF",
            lineHeight: 1.2,
            display: "flex",
            alignItems: "center",
            userSelect: "none"
          }}
        >
          {p.type === "GOODS"
            ? isOutOfStock
              ? "Habis"
              : `Stok: ${p.stock ?? 0}`
            : p.duration || "Siap Booking"}
        </div>

        {/* Variant count badge in bottom-right (opposite stock badge) */}
        {p.variants && p.variants.length > 0 && (
          <div
            style={{
              position: "absolute",
              bottom: 6,
              right: 6,
              padding: "2px 7px",
              borderRadius: 6,
              fontSize: 10,
              fontWeight: 600,
              background: "rgba(37, 99, 235, 0.92)",
              color: "#FFFFFF",
              lineHeight: 1.2,
              display: "flex",
              alignItems: "center",
              userSelect: "none"
            }}
          >
            {p.variants.length} Varian
          </div>
        )}
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
        <div>
          <div
            style={{
              fontSize: isMobileView ? 13 : 12,
              fontWeight: 600,
              color: theme.ink,
              lineHeight: 1.25,
              height: isMobileView ? 34 : 30,
              overflow: "hidden"
            }}
          >
            {p.name}
          </div>

          <div
            style={{
              fontSize: isMobileView ? 14 : 13,
              fontWeight: 700,
              color: theme.accent,
              marginTop: 4,
              display: "flex",
              alignItems: "baseline",
              gap: 6,
              whiteSpace: "nowrap",
              flexWrap: "nowrap"
            }}
          >
            {p.variants && p.variants.length > 0 ? (
              (() => {
                const prices = p.variants.map((v) => v.price || 0);
                const min = Math.min(...prices);
                return <span>Rp {(min || 0).toLocaleString("id-ID")}</span>;
              })()
            ) : (
              <>
                <span>Rp {(p.price || 0).toLocaleString("id-ID")}</span>
                {p.originalPrice && p.price && p.originalPrice > p.price && (
                  <span
                    style={{
                      fontSize: 10,
                      color: theme.inkSoft,
                      fontWeight: 400,
                      textDecoration: "line-through",
                      opacity: 0.85
                    }}
                  >
                    Rp {(p.originalPrice || 0).toLocaleString("id-ID")}
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: isMobileView ? 6 : 5,
            marginTop: 8,
            paddingTop: 6,
            borderTop: `1px solid ${theme.border}`
          }}
        >
          <button
            type="button"
            onClick={() => onEdit(p)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              padding: isMobileView ? "5px 0" : "4px 0",
              borderRadius: 6,
              background: theme.surface2,
              border: `1px solid ${theme.border}`,
              color: theme.ink,
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            <Edit2 size={11} />
            <span>Edit</span>
          </button>
          <button
            type="button"
            onClick={() => onDelete(p)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              padding: isMobileView ? "5px 0" : "4px 0",
              borderRadius: 6,
              background: "#EF444415",
              border: "1px solid #EF444430",
              color: "#EF4444",
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            <Trash2 size={11} />
            <span>Hapus</span>
          </button>
        </div>
      </div>
    </div>
  );
}, (prev, next) => (
  prev.product === next.product &&
  prev.theme === next.theme &&
  prev.isMobileView === next.isMobileView &&
  prev.aspectRatio === next.aspectRatio
));

