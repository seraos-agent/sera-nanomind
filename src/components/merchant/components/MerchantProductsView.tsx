import React, { useEffect, useMemo, useState } from "react";
import { Briefcase, Package, Plus, Search, UtensilsCrossed, X } from "lucide-react";
import type { ThemeType } from "../../../theme";
import {
  type StoreType,
  type MerchantStore,
  type MerchantProduct,
  STORE_CATEGORIES,
  getStoreProductCategories
} from "../types";
import { ProductCard } from "./products/components/ProductCard";
import { ProductCategoryTabs } from "./products/components/ProductCategoryTabs";
import { ProductCategoryManager } from "./products/components/ProductCategoryManager";
import { ProductCategoryDetail } from "./products/components/ProductCategoryDetail";
import { ProductCategoriesSidebar } from "./products/components/ProductCategoriesSidebar";

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
  isProductEditorOpen?: boolean;
  onCloseProductEditor?: () => void;
  inlineProductEditor?: React.ReactNode;
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
  setProdCategory,
  isProductEditorOpen = false,
  onCloseProductEditor,
  inlineProductEditor
}: MerchantProductsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const allStoreCategories = useMemo(
    () => getStoreProductCategories(store?.customCategories) || [],
    [store?.customCategories]
  );
  const safeProducts = useMemo(
    () => (Array.isArray(products) ? products.filter(Boolean) : []),
    [products]
  );
  const activeProducts = useMemo(
    () => safeProducts.filter((p) => p.status !== "DRAFT"),
    [safeProducts]
  );
  const draftProducts = useMemo(
    () => safeProducts.filter((p) => p.status === "DRAFT"),
    [safeProducts]
  );

  const customCategorySet = useMemo(() => new Set(allStoreCategories), [allStoreCategories]);

  const desktopCategories = useMemo(() => {
    const macroCategories = new Set(Object.values(STORE_CATEGORIES).flat());
    const merged = new Set<string>(allStoreCategories);
    activeProducts.forEach((p) => {
      const c = p.category?.trim();
      if (
        c &&
        c.toLowerCase() !== "umum" &&
        c.toLowerCase() !== "general" &&
        c !== store?.category &&
        !macroCategories.has(c)
      ) {
        merged.add(c);
      }
    });
    return Array.from(merged);
  }, [allStoreCategories, activeProducts, store?.category]);

  useEffect(() => {
    if (
      !isMobileView &&
      selectedFilterCategory !== "ALL" &&
      selectedFilterCategory !== "DRAFT" &&
      selectedFilterCategory !== "KATEGORI" &&
      !desktopCategories.includes(selectedFilterCategory)
    ) {
      setSelectedFilterCategory("ALL");
    }
  }, [isMobileView, selectedFilterCategory, desktopCategories, setSelectedFilterCategory]);

  const effectiveDesktopFilter =
    selectedFilterCategory === "KATEGORI" ? "ALL" : selectedFilterCategory;

  const desktopDisplayedProducts = useMemo(() => {
    const byTab =
      effectiveDesktopFilter === "ALL"
        ? activeProducts
        : effectiveDesktopFilter === "DRAFT"
          ? draftProducts
          : activeProducts.filter((p) => p.category === effectiveDesktopFilter);

    const q = searchQuery.trim().toLowerCase();
    if (!q) return byTab;

    return byTab.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.barcode?.toLowerCase().includes(q)
    );
  }, [effectiveDesktopFilter, activeProducts, draftProducts, searchQuery]);

  const mobileDisplayedProducts =
    selectedFilterCategory === "ALL"
      ? activeProducts
      : selectedFilterCategory === "DRAFT"
        ? draftProducts
        : activeProducts.filter((p) => p.category === selectedFilterCategory);

  const addButtonLabel =
    storeType === "JASA"
      ? "New Service"
      : storeType === "FOOD"
        ? "New Menu"
        : "New Product";

  const handleDesktopAddClick = () => {
    handleOpenAddProduct();
    if (effectiveDesktopFilter !== "ALL" && effectiveDesktopFilter !== "DRAFT") {
      setProdCategory(effectiveDesktopFilter);
    }
  };

  const renderEmptyState = (
    filterKey: string,
    hasSearchFilter: boolean,
    onAddClick: () => void
  ) => (
    <div
      style={{
        padding: 36,
        borderRadius: 14,
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
        {hasSearchFilter ? (
          <Search size={26} strokeWidth={1.85} />
        ) : storeType === "FOOD" ? (
          <UtensilsCrossed size={28} strokeWidth={1.85} />
        ) : storeType === "JASA" ? (
          <Briefcase size={28} strokeWidth={1.85} />
        ) : (
          <Package size={28} strokeWidth={1.85} />
        )}
      </div>

      <div style={{ fontSize: 13.5, fontWeight: 700, color: theme.ink }}>
        {hasSearchFilter
          ? "No matching items found"
          : filterKey === "DRAFT"
            ? "No products in Drafts yet"
            : filterKey === "ALL"
              ? storeType === "FOOD"
                ? "No items in your menu yet"
                : storeType === "JASA"
                  ? "No services in your showcase yet"
                  : "No products in your store yet"
              : storeType === "FOOD"
                ? `No menu items in category "${filterKey}"`
                : `No products in category "${filterKey}"`}
      </div>

      <p style={{ margin: 0, fontSize: 12, color: theme.inkSoft, maxWidth: 420 }}>
        {hasSearchFilter
          ? "Try another keyword or clear your search filter."
          : filterKey === "DRAFT"
            ? "Products without photos (including items added via SERA chat) are saved here before publishing to Marketplace and POS."
            : storeType === "FOOD"
              ? "Start adding your menu items so buyers can order right away."
              : storeType === "JASA"
                ? "Start adding your services so buyers can book right away."
                : "Start stocking your catalog so buyers can shop right away."}
      </p>

      {hasSearchFilter ? (
        <button
          type="button"
          onClick={() => setSearchQuery("")}
          style={{
            marginTop: 6,
            padding: "8px 16px",
            borderRadius: 8,
            background: theme.surface2,
            color: theme.ink,
            border: `1px solid ${theme.border}`,
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer"
          }}
        >
          Clear Search
        </button>
      ) : (
        <button
          type="button"
          onClick={onAddClick}
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
      )}
    </div>
  );

  // Desktop 2-column split workspace matching Restaurant Info and POS
  if (!isMobileView) {
    const searchPlaceholder =
      storeType === "FOOD"
        ? "Search menu items by name or category..."
        : storeType === "JASA"
          ? "Search services by name or category..."
          : "Search products by name, category, or barcode...";

    return (
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "row",
          gap: 16,
          padding: "18px 22px",
          width: "100%",
          minHeight: 0,
          overflow: "hidden",
          alignItems: "stretch",
          boxSizing: "border-box"
        }}
      >
        {/* Left Column: Inline Editor OR Pinned Toolbar + Independently Scrollable Catalog Grid */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            gap: 14,
            overflowX: "clip",
            overflowY: "hidden"
          }}
        >
          {isProductEditorOpen && inlineProductEditor ? (
            <div
              className="menu-catalog-scroll"
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: "auto",
                overflowX: "hidden",
                paddingRight: 4
              }}
            >
              {inlineProductEditor}
            </div>
          ) : (
            <>
              {/* Pinned Toolbar */}
              <div
                style={{
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  flexWrap: "wrap"
                }}
              >
                {/* Search Input */}
                <div
                  style={{
                    flex: "1 1 220px",
                    minWidth: 180,
                    height: 38,
                    borderRadius: 10,
                    background: theme.surface,
                    border: `1px solid ${theme.border}`,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "0 12px",
                    boxSizing: "border-box"
                  }}
                >
                  <Search size={15} color={theme.inkSoft} style={{ flexShrink: 0 }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={searchPlaceholder}
                    aria-label="Search menu catalog"
                    style={{
                      flex: 1,
                      minWidth: 0,
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      color: theme.ink,
                      fontSize: 13
                    }}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      aria-label="Clear search"
                      style={{
                        background: "transparent",
                        border: "none",
                        padding: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: theme.inkSoft,
                        cursor: "pointer"
                      }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* All / Draft Toggle Pills */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFilterCategory("ALL");
                      setSelectedCategoryDetail(null);
                    }}
                    style={{
                      height: 38,
                      padding: "0 13px",
                      borderRadius: 10,
                      border:
                        effectiveDesktopFilter === "ALL"
                          ? `1px solid ${theme.ink}`
                          : `1px solid ${theme.border}`,
                      background:
                        effectiveDesktopFilter === "ALL" && theme.isDark
                          ? theme.surface2
                          : theme.surface,
                      color: effectiveDesktopFilter === "ALL" ? theme.ink : theme.inkSoft,
                      fontSize: 12.5,
                      fontWeight: effectiveDesktopFilter === "ALL" ? 700 : 500,
                      whiteSpace: "nowrap",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6
                    }}
                  >
                    <span>All</span>
                    <span style={{ fontSize: 11, opacity: 0.78 }}>({activeProducts.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFilterCategory("DRAFT");
                      setSelectedCategoryDetail(null);
                    }}
                    style={{
                      height: 38,
                      padding: "0 13px",
                      borderRadius: 10,
                      border:
                        effectiveDesktopFilter === "DRAFT"
                          ? "1px solid #D97706"
                          : `1px solid ${theme.border}`,
                      background:
                        effectiveDesktopFilter === "DRAFT"
                          ? "rgba(245, 158, 11, 0.12)"
                          : theme.surface,
                      color: effectiveDesktopFilter === "DRAFT" ? "#D97706" : theme.inkSoft,
                      fontSize: 12.5,
                      fontWeight: effectiveDesktopFilter === "DRAFT" ? 700 : 500,
                      whiteSpace: "nowrap",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6
                    }}
                  >
                    <span>Draft</span>
                    <span style={{ fontSize: 11, opacity: 0.85 }}>({draftProducts.length})</span>
                  </button>
                </div>

                {/* Primary Add Button */}
                <button
                  type="button"
                  onClick={handleDesktopAddClick}
                  style={{
                    height: 38,
                    padding: "0 14px",
                    borderRadius: 10,
                    background: theme.ink,
                    color: theme.bg,
                    border: "none",
                    fontSize: 13,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6
                  }}
                >
                  <Plus size={15} style={{ flexShrink: 0 }} />
                  <span>{addButtonLabel}</span>
                </button>
              </div>

              {/* Independently Scrollable Catalog Area */}
              <div
                className="menu-catalog-scroll"
                style={{
                  flex: 1,
                  minHeight: 0,
                  overflowY: "auto",
                  overflowX: "hidden",
                  paddingRight: 4
                }}
              >
                {desktopDisplayedProducts.length === 0 ? (
                  renderEmptyState(
                    effectiveDesktopFilter,
                    Boolean(searchQuery.trim()),
                    handleDesktopAddClick
                  )
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(min(172px, 100%), 1fr))",
                      gap: 12,
                      paddingBottom: 24,
                      contain: "layout paint"
                    }}
                  >
                    {desktopDisplayedProducts.map((p) => (
                      <ProductCard
                        key={p.id}
                        product={p}
                        theme={theme}
                        isMobileView={false}
                        onEdit={handleOpenEditProduct}
                        onDelete={handleDeleteProduct}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right Column: Stationary Categories Sidebar */}
        <div
          style={{
            width: "clamp(210px, 26vw, 310px)",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            overflowY: "auto"
          }}
        >
          <ProductCategoriesSidebar
            theme={theme}
            storeType={storeType}
            categories={desktopCategories}
            customCategorySet={customCategorySet}
            products={activeProducts}
            activeFilter={isProductEditorOpen ? "" : effectiveDesktopFilter}
            onSelectCategory={(cat) => {
              if (isProductEditorOpen) {
                onCloseProductEditor?.();
              }
              setSelectedFilterCategory(cat);
              setSelectedCategoryDetail(null);
            }}
            isAddingCategory={isAddingCategory}
            setIsAddingCategory={setIsAddingCategory}
            newCategoryName={newCategoryName}
            setNewCategoryName={setNewCategoryName}
            onSaveCategory={handleSaveCategory}
            onSetCategoryToDelete={setCategoryToDelete}
          />
        </div>
      </div>
    );
  }

  // Mobile 1-column view
  return (
    <div
      style={{
        padding: "16px 12px 48px",
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
      ) : mobileDisplayedProducts.length === 0 ? (
        renderEmptyState(selectedFilterCategory, false, handleOpenAddProduct)
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 10,
            contain: "layout paint"
          }}
        >
          {mobileDisplayedProducts.map((p) => (
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
