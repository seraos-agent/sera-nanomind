import React from "react";
import { Briefcase, Package, UtensilsCrossed } from "lucide-react";
import type { ThemeType } from "../../../theme";
import {
  type StoreType,
  type MerchantStore,
  type MerchantProduct,
  getStoreProductCategories
} from "../types";
import { ProductCard } from "./products/components/ProductCard";
import { ProductCategoryTabs } from "./products/components/ProductCategoryTabs";
import { ProductCategoryManager } from "./products/components/ProductCategoryManager";
import { ProductCategoryDetail } from "./products/components/ProductCategoryDetail";

interface MerchantProductsViewProps {
  theme: ThemeType;
  isMobileView?: boolean;
  store: MerchantStore | null;
  storeType: StoreType;
  products: MerchantProduct[];
  selectedFilterCategory: string;
  setSelectedFilterCategory: (cat: string) => void;
  selectedCategoryDetail: string | null;
  setSelectedCategoryDetail: (cat: string | null) => void;
  isAddingCategory: boolean;
  setIsAddingCategory: React.Dispatch<React.SetStateAction<boolean>>;
  newCategoryName: string;
  setNewCategoryName: (name: string) => void;
  handleSaveCategory: (e: React.FormEvent) => void;
  setCategoryToDelete: (cat: string | null) => void;
  handleOpenAddProduct: () => void;
  handleOpenEditProduct: (p: MerchantProduct) => void;
  handleDeleteProduct: (product: MerchantProduct) => void;
  setProdCategory: (cat: string) => void;
}

export function MerchantProductsView({
  theme,
  isMobileView,
  store,
  storeType,
  products,
  selectedFilterCategory,
  setSelectedFilterCategory,
  selectedCategoryDetail,
  setSelectedCategoryDetail,
  isAddingCategory,
  setIsAddingCategory,
  newCategoryName,
  setNewCategoryName,
  handleSaveCategory,
  setCategoryToDelete,
  handleOpenAddProduct,
  handleOpenEditProduct,
  handleDeleteProduct,
  setProdCategory
}: MerchantProductsViewProps) {
  const allStoreCategories = getStoreProductCategories(store?.customCategories) || [];
  const safeProducts = Array.isArray(products) ? products.filter(Boolean) : [];
  const activeProducts = safeProducts.filter((p) => p.status !== "DRAFT");
  const draftProducts = safeProducts.filter((p) => p.status === "DRAFT");
  const displayedProducts =
    selectedFilterCategory === "ALL"
      ? activeProducts
      : selectedFilterCategory === "DRAFT"
        ? draftProducts
        : activeProducts.filter((p) => p.category === selectedFilterCategory);

  return (
    <div
      style={{
        padding: isMobileView ? "16px 12px 48px" : "20px 20px 48px",
        maxWidth: 840,
        margin: "0 auto",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 16
      }}
    >
      {/* Action Buttons & Filter Tabs */}
      <ProductCategoryTabs
        theme={theme}
        storeType={storeType}
        totalProducts={activeProducts.length}
        totalDrafts={draftProducts.length}
        totalCategories={allStoreCategories.length}
        selectedFilterCategory={selectedFilterCategory}
        onSelectTab={(tab) => {
          setSelectedFilterCategory(tab);
          setSelectedCategoryDetail(null);
        }}
        isAddingCategory={isAddingCategory}
        onToggleAddCategory={() => {
          setSelectedFilterCategory("KATEGORI");
          setSelectedCategoryDetail(null);
          setIsAddingCategory((prev) => !prev);
        }}
        onOpenAddProduct={handleOpenAddProduct}
      />

      {/* VIEW CONTENT */}
      {selectedFilterCategory === "KATEGORI" ? (
        selectedCategoryDetail ? (
          /* Detail Kategori Tertentu */
          <ProductCategoryDetail
            theme={theme}
            categoryName={selectedCategoryDetail}
            products={activeProducts}
            isMobileView={isMobileView}
            onBack={() => setSelectedCategoryDetail(null)}
            onOpenAddProduct={(cat) => {
              handleOpenAddProduct();
              if (cat) setProdCategory(cat);
            }}
            onEditProduct={handleOpenEditProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        ) : (
          /* Daftar Kategori Toko & Form Tambah */
          <ProductCategoryManager
            theme={theme}
            storeType={storeType}
            isMobileView={isMobileView}
            categories={allStoreCategories}
            products={activeProducts}
            isAddingCategory={isAddingCategory}
            setIsAddingCategory={setIsAddingCategory}
            newCategoryName={newCategoryName}
            setNewCategoryName={setNewCategoryName}
            onSaveCategory={handleSaveCategory}
            onSelectCategoryDetail={(cat) => setSelectedCategoryDetail(cat)}
            onSetCategoryToDelete={setCategoryToDelete}
          />
        )
      ) : displayedProducts.length === 0 ? (
        /* Empty State */
        <div
          style={{
            padding: 36,
            borderRadius: 12,
            border: `1px dashed ${theme.border}`,
            background: theme.surface,
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10
          }}
        >
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: 16,
              background: `${theme.accent}14`,
              border: `1px solid ${theme.accent}28`,
              color: theme.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            {storeType === "FOOD" ? (
              <UtensilsCrossed size={28} strokeWidth={1.85} />
            ) : storeType === "JASA" ? (
              <Briefcase size={28} strokeWidth={1.85} />
            ) : (
              <Package size={28} strokeWidth={1.85} />
            )}
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: theme.ink }}>
            {selectedFilterCategory === "DRAFT"
              ? "No products in Drafts yet"
              : selectedFilterCategory === "ALL"
                ? storeType === "FOOD"
                  ? "No items in your menu yet"
                  : storeType === "JASA"
                    ? "No services in your showcase yet"
                    : "No products in your store yet"
                : storeType === "FOOD"
                  ? `No menu items in category "${selectedFilterCategory}"`
                  : `No products in category "${selectedFilterCategory}"`}
          </div>
          <p style={{ margin: 0, fontSize: 11, color: theme.inkSoft }}>
            {selectedFilterCategory === "DRAFT"
              ? "Products without photos (including items added via SERA chat) are saved here before publishing to Marketplace and POS."
              : storeType === "FOOD"
                ? "Start adding your menu items so buyers can order right away."
                : storeType === "JASA"
                  ? "Start adding your services so buyers can book right away."
                  : "Start stocking your catalog so buyers can shop right away."}
          </p>
          <button
            type="button"
            onClick={handleOpenAddProduct}
            style={{
              marginTop: 6,
              padding: "8px 16px",
              borderRadius: 8,
              background: theme.accent,
              color: "#FFFFFF",
              border: "none",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            {storeType === "FOOD"
              ? "+ Add Menu Item Now"
              : storeType === "JASA"
                ? "+ Add Service Now"
                : "+ Add Product Now"}
          </button>
        </div>
      ) : (
        /* Grid Produk */
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobileView
              ? "repeat(2, 1fr)"
              : "repeat(auto-fill, minmax(140px, 1fr))",
            gap: isMobileView ? 10 : 8,
            contain: "layout paint"
          }}
        >
          {displayedProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              theme={theme}
              isMobileView={isMobileView}
              onEdit={handleOpenEditProduct}
              onDelete={handleDeleteProduct}
            />
          ))}
        </div>
      )}
    </div>
  );
}
