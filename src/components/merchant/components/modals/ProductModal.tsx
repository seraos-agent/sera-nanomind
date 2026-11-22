import React, { useState, useEffect } from "react";
import { Briefcase, Check, ChevronLeft, Package, RefreshCw, UtensilsCrossed } from "lucide-react";
import type { ThemeType } from "../../../../theme";
import type {
  StoreType,
  MerchantStore,
  MerchantProduct,
  ProductVariant
} from "../../types";
import { BarcodeScannerModal } from "./BarcodeScannerModal";
import { registerBackHandler } from "../../../../utils/backButton";
import { useProductDiscount } from "../products/hooks/useProductDiscount";
import { ProductBasicInfo } from "../products/components/ProductBasicInfo";
import { ProductPricingSection } from "../products/components/ProductPricingSection";
import { ProductVariantManager } from "../products/components/ProductVariantManager";
import { ProductImagePicker } from "../products/components/ProductImagePicker";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct: MerchantProduct | null;
  storeType: StoreType;
  store: MerchantStore | null;
  theme: ThemeType;
  prodName: string;
  setProdName: (v: string) => void;
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
  prodCategory: string;
  setProdCategory: (v: string) => void;
  prodDescription: string;
  setProdDescription: (v: string) => void;
  prodBarcode: string;
  setProdBarcode: (v: string) => void;
  prodImages: string[];
  setProdImages: React.Dispatch<React.SetStateAction<string[]>>;
  hasVariants: boolean;
  setHasVariants: (v: boolean) => void;
  variants: ProductVariant[];
  setVariants: React.Dispatch<React.SetStateAction<ProductVariant[]>>;
  onSave: (e: React.FormEvent) => void;
  isSaving?: boolean;
  isSuccess?: boolean;
  isMobileView?: boolean;
}

export function ProductModal({
  isOpen,
  onClose,
  editingProduct,
  storeType,
  store,
  theme,
  prodName,
  setProdName,
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
  prodCategory,
  setProdCategory,
  prodDescription,
  setProdDescription,
  prodBarcode,
  setProdBarcode,
  prodImages,
  setProdImages,
  hasVariants,
  setHasVariants,
  variants,
  setVariants,
  onSave,
  isSaving = false,
  isSuccess = false,
  isMobileView
}: ProductModalProps) {
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const discountResult = useProductDiscount(
    prodNormalPrice,
    prodDiscountType,
    prodDiscountValue
  );

  // Sequential Native Back Button Navigation for ProductModal root
  useEffect(() => {
    if (!isOpen) return;
    return registerBackHandler("product_modal_root", 70, () => {
      if (isSaving || isSuccess) return true;
      onClose();
      return true;
    });
  }, [isOpen, onClose, isSaving, isSuccess]);

  useEffect(() => {
    if (!isOpen || isMobileView) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isScannerOpen && !isSaving && !isSuccess) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isMobileView, isScannerOpen, isSaving, isSuccess, onClose]);

  if (!isOpen) return null;

  const modalTitle = editingProduct
    ? storeType === "JASA"
      ? "Edit Jasa"
      : storeType === "FOOD"
        ? "Edit Menu"
        : "Edit Produk"
    : storeType === "JASA"
      ? "Tambah Jasa"
      : storeType === "FOOD"
        ? "Tambah Menu Food"
        : "Tambah Barang";

  const modalSubtitle =
    storeType === "FOOD"
      ? "Lengkapi detail menu makanan atau minuman"
      : storeType === "JASA"
        ? "Lengkapi detail layanan untuk etalase jasa"
        : "Lengkapi informasi produk untuk etalase toko";

  const StoreHeaderIcon =
    storeType === "FOOD"
      ? UtensilsCrossed
      : storeType === "JASA"
        ? Briefcase
        : Package;

  return (
    <div
      onClick={(e) => {
        if (!isMobileView && e.target === e.currentTarget && !isSaving && !isSuccess) {
          onClose();
        }
      }}
      style={
        isMobileView
          ? {
              position: "fixed",
              inset: 0,
              background: theme.bg,
              zIndex: 120,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden"
            }
          : {
              position: "fixed",
              inset: 0,
              background: "rgba(9, 12, 18, 0.56)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              zIndex: 120,
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
        aria-label={modalTitle}
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
                maxWidth: 920,
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
      {/* HEADER (Sticky Top) */}
      <div
        style={{
          background: theme.surface,
          borderBottom: `1px solid ${theme.border}`,
          padding: isMobileView ? "12px 16px" : "14px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxSizing: "border-box",
          flexShrink: 0
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving || isSuccess}
            title="Kembali"
            style={{
              background: "transparent",
              border: "none",
              cursor: isSaving || isSuccess ? "not-allowed" : "pointer",
              color: theme.inkSoft,
              padding: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 6,
              transition: "color 0.15s ease"
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = theme.ink;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = theme.inkSoft;
            }}
          >
            <ChevronLeft size={20} />
          </button>
          {!isMobileView && (
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: `${theme.accent}14`,
                border: `1px solid ${theme.accent}28`,
                color: theme.accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}
            >
              <StoreHeaderIcon size={17} strokeWidth={2} />
            </div>
          )}
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: theme.ink }}>
              {modalTitle}
            </h3>
            <div style={{ fontSize: 11, color: theme.inkSoft, marginTop: 1 }}>
              {modalSubtitle}
            </div>
          </div>
        </div>
      </div>

      {/* SCROLLABLE FORM BODY */}
      <form
        id="product-form"
        noValidate
        onSubmit={onSave}
        style={
          isMobileView
            ? {
                flex: 1,
                overflowY: "auto",
                padding: "16px 16px 32px",
                display: "flex",
                flexDirection: "column",
                gap: 14,
                maxWidth: 640,
                width: "100%",
                margin: "0 auto",
                boxSizing: "border-box"
              }
            : {
                flex: 1,
                overflowY: "auto",
                padding: "18px 20px 22px",
                display: "grid",
                gridTemplateColumns: "minmax(0, 1.08fr) minmax(0, 0.92fr)",
                gap: 16,
                alignItems: "start",
                width: "100%",
                boxSizing: "border-box"
              }
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
          {/* CARD 1: INFORMASI MENU / PRODUK */}
          <ProductBasicInfo
            theme={theme}
            storeType={storeType}
            store={store}
            isMobileView={isMobileView}
            prodName={prodName}
            setProdName={setProdName}
            prodCategory={prodCategory}
            setProdCategory={setProdCategory}
            prodDescription={prodDescription}
            setProdDescription={setProdDescription}
            prodBarcode={prodBarcode}
            setProdBarcode={setProdBarcode}
            onOpenScanner={() => setIsScannerOpen(true)}
          />

          {!isMobileView && (
            /* CARD 3 (DESKTOP LEFT COLUMN): FOTO MENU / PRODUK */
            <ProductImagePicker
              theme={theme}
              storeType={storeType}
              prodImages={prodImages}
              setProdImages={setProdImages}
            />
          )}
        </div>

        {/* CARD 2: HARGA, STOK & VARIAN */}
        <div
          style={{
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: 12,
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 14,
            minWidth: 0
          }}
        >
          <ProductVariantManager
            theme={theme}
            storeType={storeType}
            hasVariants={hasVariants}
            setHasVariants={setHasVariants}
            variants={variants}
            setVariants={setVariants}
            calculatedFinalPrice={discountResult.calculatedFinalPrice}
            prodStock={prodStock}
          />

          <ProductPricingSection
            theme={theme}
            storeType={storeType}
            hasVariants={hasVariants}
            prodNormalPrice={prodNormalPrice}
            setProdNormalPrice={setProdNormalPrice}
            prodCostPrice={prodCostPrice}
            setProdCostPrice={setProdCostPrice}
            prodDiscountType={prodDiscountType}
            setProdDiscountType={setProdDiscountType}
            prodDiscountValue={prodDiscountValue}
            setProdDiscountValue={setProdDiscountValue}
            prodStock={prodStock}
            setProdStock={setProdStock}
            prodWeight={prodWeight}
            setProdWeight={setProdWeight}
            prodWeightUnit={prodWeightUnit}
            setProdWeightUnit={setProdWeightUnit}
            discountResult={discountResult}
            isMobileView={isMobileView}
          />
        </div>

        {isMobileView && (
          /* CARD 3 (MOBILE STACK): FOTO MENU / PRODUK */
          <ProductImagePicker
            theme={theme}
            storeType={storeType}
            prodImages={prodImages}
            setProdImages={setProdImages}
          />
        )}
      </form>

      {/* STICKY BOTTOM ACTION BAR */}
      <div
        style={{
          background: theme.surface,
          borderTop: `1px solid ${theme.border}`,
          padding: isMobileView ? "12px 16px" : "12px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: isMobileView ? "center" : "flex-end",
          boxSizing: "border-box",
          boxShadow: "0 -4px 16px rgba(0,0,0,0.06)",
          flexShrink: 0
        }}
      >
        <div
          style={
            isMobileView
              ? { maxWidth: 640, width: "100%", display: "flex", gap: 10 }
              : { display: "flex", gap: 10, width: "100%", maxWidth: 320 }
          }
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving || isSuccess}
            style={{
              flex: 1,
              padding: "11px 16px",
              borderRadius: 10,
              background: theme.surface2,
              color: theme.ink,
              border: `1px solid ${theme.border}`,
              fontSize: 13,
              fontWeight: 600,
              cursor: isSaving || isSuccess ? "not-allowed" : "pointer",
              opacity: isSaving || isSuccess ? 0.6 : 1,
              transition: "all 0.15s ease"
            }}
          >
            Batal
          </button>
          <button
            type="submit"
            form="product-form"
            disabled={isSaving || isSuccess}
            style={{
              flex: 2,
              padding: "11px 18px",
              borderRadius: 10,
              background: isSuccess ? theme.ink : isSaving ? theme.surface2 : theme.ink,
              color: isSuccess ? theme.surface : isSaving ? theme.inkSoft : theme.surface,
              border: isSaving ? `1px solid ${theme.border}` : `1px solid ${theme.ink}`,
              fontSize: 13,
              fontWeight: 700,
              cursor: isSaving || isSuccess ? "default" : "pointer",
              boxShadow: "none",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transform: isSuccess ? "scale(1.01)" : "scale(1)"
            }}
          >
            {isSuccess ? (
              <>
                <Check size={15} strokeWidth={2.5} />
                <span>Tersimpan</span>
              </>
            ) : isSaving ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <span>
                {prodImages.length === 0
                  ? "Simpan ke Draft"
                  : editingProduct?.status === "DRAFT"
                    ? "Terbitkan"
                    : "Simpan"}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onDetected={(code) => {
          setProdBarcode(code);
          setIsScannerOpen(false);
        }}
        theme={theme}
        title="Scan Barcode Produk"
      />
      </div>
    </div>
  );
}
