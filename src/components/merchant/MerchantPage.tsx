import { useState, useEffect, useRef, useCallback } from "react";
import { registerBackHandler, dispatchBackButton } from "../../utils/backButton";
import { safeSetStorage, cleanupBloatedOrdersStorage } from "../../utils/safeStorage";
import {
  type MerchantStore,
  type MerchantProduct,
  type MerchantOrder,
  type MerchantPageProps,
  type MerchantViewType,
  type MerchantReview,
  normalizeStoreType,
  isStoreCurrentlyOpen
} from "./types";
import {
  mapMarketplaceOrderToMerchant,
  loadInitialMerchantStore,
  loadInitialMerchantProducts,
  loadInitialMerchantOrders
} from "./utils/merchantStorageLoaders";
import { MerchantErrorBoundary } from "./components/MerchantErrorBoundary";
import { MerchantHeader } from "./components/MerchantHeader";
import { MerchantProductsView } from "./components/MerchantProductsView";
import { MerchantOrdersView } from "./components/MerchantOrdersView";
import { MerchantProfileView } from "./components/MerchantProfileView";
import { MerchantPosView } from "./components/MerchantPosView";
import { MerchantCourierView } from "./components/MerchantCourierView";
import { ProductModal } from "./components/modals/ProductModal";
import { DeleteCategoryModal } from "./components/modals/DeleteCategoryModal";
import { DeleteProductModal } from "./components/modals/DeleteProductModal";
import { StoreSavedModal } from "./components/modals/StoreSavedModal";
import { Check, AlertCircle } from "lucide-react";
import { getApiBaseUrl } from "../../config/marketplaceConfig";

import { useMerchantStoreProfileForm } from "./hooks/useMerchantStoreProfileForm";
import { useMerchantProductForm } from "./hooks/useMerchantProductForm";
import { useMerchantRemoteSync } from "./hooks/useMerchantRemoteSync";
import { useMerchantOrderActions } from "./hooks/useMerchantOrderActions";

// Re-export types for backward compatibility
export * from "./types";

function MerchantPageInner({
  theme,
  onBack,
  isMobileView,
  userEmail,
  socket
}: MerchantPageProps) {
  useEffect(() => {
    cleanupBloatedOrdersStorage();
  }, []);

  const [store, setStore] = useState<MerchantStore | null>(loadInitialMerchantStore);

  // Dynamic schedule reconciliation: keeps store.isOpen synchronized with clock & operational schedule
  useEffect(() => {
    if (!store) return;
    const interval = setInterval(() => {
      const liveStatus = isStoreCurrentlyOpen(store);
      if (store.isOpen !== liveStatus.isOpen) {
        setStore(prev => {
          if (!prev) return null;
          const updated = { ...prev, isOpen: liveStatus.isOpen };
          try {
            safeSetStorage("sera_merchant_store", JSON.stringify(updated));
            window.dispatchEvent(new Event("sera_merchant_store_updated"));
          } catch {}
          return updated;
        });
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [store]);

  const [products, setProducts] = useState<MerchantProduct[]>(loadInitialMerchantProducts);
  const [orders, setOrders] = useState<MerchantOrder[]>(loadInitialMerchantOrders);

  const [currentView, setCurrentView] = useState<MerchantViewType>(() => {
    const saved = localStorage.getItem("sera_merchant_current_view") as MerchantViewType;
    if (saved === "courier") return "profile";
    return saved || "products";
  });

  useEffect(() => {
    safeSetStorage("sera_merchant_current_view", currentView);
  }, [currentView]);

  const [reviews, setReviews] = useState<MerchantReview[]>([]);

  // Native CSS Scroll-Snap ViewPager Controller
  const pagerRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScrollRef = useRef(false);
  const scrollTimeoutRef = useRef<any>(null);
  const MERCHANT_VIEW_ORDER: MerchantViewType[] = ["profile", "products", "pos", "orders"];
  const normalizedCurrentView: MerchantViewType = currentView === "payments" ? "profile" : currentView;

  const handlePagerScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (isProgrammaticScrollRef.current) return;
    const container = e.currentTarget;
    const width = container.clientWidth;
    if (!width) return;
    const scrollLeft = container.scrollLeft;
    const pageIndex = Math.round(scrollLeft / width);
    const newView = MERCHANT_VIEW_ORDER[pageIndex];
    if (newView && newView !== currentView) {
      setCurrentView(newView);
    }
  }, [currentView]);

  const handleViewChange = useCallback((v: MerchantViewType) => {
    setCurrentView(v);
    const targetIdx = MERCHANT_VIEW_ORDER.indexOf(v === "payments" ? "profile" : v);
    if (targetIdx !== -1 && pagerRef.current) {
      isProgrammaticScrollRef.current = true;
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      pagerRef.current.scrollTo({
        left: targetIdx * pagerRef.current.clientWidth,
        behavior: 'smooth'
      });
      scrollTimeoutRef.current = setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 450);
    }
  }, []);

  useEffect(() => {
    const handleSetView = (e: Event) => {
      const customEvent = e as CustomEvent<{ view: MerchantViewType; orderId?: string }>;
      const target = customEvent.detail?.view;
      if (target && MERCHANT_VIEW_ORDER.includes(target)) {
        handleViewChange(target);
      }
    };
    window.addEventListener("sera:merchant-set-view", handleSetView);
    return () => window.removeEventListener("sera:merchant-set-view", handleSetView);
  }, [handleViewChange]);

  useEffect(() => {
    const targetIdx = MERCHANT_VIEW_ORDER.indexOf(normalizedCurrentView);
    if (targetIdx > 0 && pagerRef.current) {
      pagerRef.current.scrollLeft = targetIdx * pagerRef.current.clientWidth;
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const targetIdx = MERCHANT_VIEW_ORDER.indexOf(normalizedCurrentView);
      if (targetIdx !== -1 && pagerRef.current) {
        pagerRef.current.scrollLeft = targetIdx * pagerRef.current.clientWidth;
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [normalizedCurrentView]);

  const storeProfile = useMerchantStoreProfileForm({
    store,
    setStore,
    products,
    setProducts,
    userEmail
  });

  const productForm = useMerchantProductForm({
    store,
    setStore,
    setProducts
  });

  const orderActions = useMerchantOrderActions({
    store,
    setOrders
  });

  const remoteSync = useMerchantRemoteSync({
    store,
    setStore,
    products,
    setProducts,
    orders,
    setOrders,
    setReviews,
    userEmail,
    socket,
    mapMarketplaceOrderToMerchant
  });

  useEffect(() => {
    const unregs: Array<() => void> = [];

    if (storeProfile.showSaveSuccessModal) {
      unregs.push(
        registerBackHandler("merchant_save_modal", 80, () => {
          storeProfile.setShowSaveSuccessModal(false);
          return true;
        })
      );
    }
    if (productForm.productToDelete) {
      unregs.push(
        registerBackHandler("merchant_del_product_modal", 75, () => {
          productForm.setProductToDelete(null);
          return true;
        })
      );
    }
    if (productForm.categoryToDelete) {
      unregs.push(
        registerBackHandler("merchant_del_cat_modal", 75, () => {
          productForm.setCategoryToDelete(null);
          return true;
        })
      );
    }
    if (productForm.productModalOpen) {
      unregs.push(
        registerBackHandler("merchant_product_modal", 70, () => {
          productForm.setProductModalOpen(false);
          return true;
        })
      );
    }
    if (productForm.selectedCategoryDetail) {
      unregs.push(
        registerBackHandler("merchant_cat_detail", 50, () => {
          productForm.setSelectedCategoryDetail(null);
          return true;
        })
      );
    }

    return () => {
      unregs.forEach((u) => u());
    };
  }, [
    storeProfile.showSaveSuccessModal,
    storeProfile.setShowSaveSuccessModal,
    productForm.productToDelete,
    productForm.setProductToDelete,
    productForm.categoryToDelete,
    productForm.setCategoryToDelete,
    productForm.productModalOpen,
    productForm.setProductModalOpen,
    productForm.selectedCategoryDetail,
    productForm.setSelectedCategoryDetail
  ]);

  const handleMerchantBack = () => {
    if (dispatchBackButton()) return;
    if (storeProfile.showSaveSuccessModal) {
      storeProfile.setShowSaveSuccessModal(false);
      return;
    }
    if (productForm.productToDelete) {
      productForm.setProductToDelete(null);
      return;
    }
    if (productForm.categoryToDelete) {
      productForm.setCategoryToDelete(null);
      return;
    }
    if (productForm.productModalOpen) {
      productForm.setProductModalOpen(false);
      return;
    }
    if (productForm.selectedCategoryDetail) {
      productForm.setSelectedCategoryDetail(null);
      return;
    }
    if (onBack) {
      onBack();
    }
  };

  const storeType = normalizeStoreType(store?.type);

  const handleResetStore = useCallback(async () => {
    const currentStoreId = store?.id;
    if (currentStoreId) {
      try {
        await fetch(`${getApiBaseUrl()}/api/market/stores/${encodeURIComponent(currentStoreId)}`, {
          method: "DELETE"
        });
      } catch (err) {
        console.warn("Failed to delete store from backend:", err);
      }
    }

    const keysToRemove = [
      "sera_merchant_store",
      "sera_merchant_store_draft",
      "sera_merchant_products",
      "sera_merchant_orders",
      "sera_merchant_current_view",
      "sera_merchant_shipping_config",
      "sera_merchant_wa_verified"
    ];
    keysToRemove.forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch {}
    });

    if (currentStoreId) {
      try {
        localStorage.removeItem(`sera_merchant_wa_verified_${currentStoreId}`);
        localStorage.removeItem(`sera_merchant_wa_verified_num_${currentStoreId}`);
      } catch {}
    }

    setStore(null);
    setProducts([]);
    setOrders([]);
    storeProfile.resetFormFields();
    setCurrentView("profile");

    try {
      window.dispatchEvent(new Event("sera_merchant_store_updated"));
    } catch {}
  }, [store?.id, storeProfile]);

  const renderProductEditor = (inline: boolean) => (
    <ProductModal
      isOpen={productForm.productModalOpen}
      onClose={() => productForm.setProductModalOpen(false)}
      editingProduct={productForm.editingProduct}
      storeType={storeType}
      store={store}
      theme={theme}
      prodName={productForm.prodName}
      setProdName={productForm.setProdName}
      prodNormalPrice={productForm.prodNormalPrice}
      setProdNormalPrice={productForm.setProdNormalPrice}
      prodCostPrice={productForm.prodCostPrice}
      setProdCostPrice={productForm.setProdCostPrice}
      prodDiscountType={productForm.prodDiscountType}
      setProdDiscountType={productForm.setProdDiscountType}
      prodDiscountValue={productForm.prodDiscountValue}
      setProdDiscountValue={productForm.setProdDiscountValue}
      prodStock={productForm.prodStock}
      setProdStock={productForm.setProdStock}
      prodWeight={productForm.prodWeight}
      setProdWeight={productForm.setProdWeight}
      prodWeightUnit={productForm.prodWeightUnit}
      setProdWeightUnit={productForm.setProdWeightUnit}
      prodCategory={productForm.prodCategory}
      setProdCategory={productForm.setProdCategory}
      prodDescription={productForm.prodDescription}
      setProdDescription={productForm.setProdDescription}
      prodBarcode={productForm.prodBarcode}
      setProdBarcode={productForm.setProdBarcode}
      prodImages={productForm.prodImages}
      setProdImages={productForm.setProdImages}
      hasVariants={productForm.hasVariants}
      setHasVariants={productForm.setHasVariants}
      variants={productForm.variants}
      setVariants={productForm.setVariants}
      onSave={productForm.handleSaveProduct}
      isSaving={productForm.isSaving}
      isSuccess={productForm.isSuccess}
      isMobileView={isMobileView}
      inline={inline}
    />
  );

  const renderMerchantView = (view: MerchantViewType, isAdjacent = false) => {
    const isDesktopSplit = !isMobileView && (view === "pos" || view === "profile" || view === "payments" || view === "products" || view === "orders");
    return (
      <div
        style={{
          width: "100%",
          minHeight: isDesktopSplit ? 0 : "100%",
          height: isDesktopSplit ? "100%" : undefined,
          display: isDesktopSplit ? "flex" : undefined,
          flexDirection: isDesktopSplit ? "column" : undefined,
          overflow: isDesktopSplit ? "hidden" : undefined,
          boxSizing: "border-box"
        }}
      >
        {view === "products" && (
          <MerchantProductsView
            theme={theme}
            isMobileView={isMobileView}
            store={store}
            storeType={storeType}
            products={products}
            selectedFilterCategory={productForm.selectedFilterCategory}
            setSelectedFilterCategory={isAdjacent ? () => {} : productForm.setSelectedFilterCategory}
            selectedCategoryDetail={productForm.selectedCategoryDetail}
            setSelectedCategoryDetail={isAdjacent ? () => {} : productForm.setSelectedCategoryDetail}
            isAddingCategory={productForm.isAddingCategory}
            setIsAddingCategory={isAdjacent ? () => {} : productForm.setIsAddingCategory}
            newCategoryName={productForm.newCategoryName}
            setNewCategoryName={isAdjacent ? () => {} : productForm.setNewCategoryName}
            handleSaveCategory={productForm.handleSaveCategory}
            setCategoryToDelete={isAdjacent ? () => {} : productForm.setCategoryToDelete}
            handleOpenAddProduct={isAdjacent ? () => {} : productForm.handleOpenAddProduct}
            handleOpenEditProduct={isAdjacent ? () => {} : productForm.handleOpenEditProduct}
            handleDeleteProduct={isAdjacent ? () => {} : productForm.handleDeleteProduct}
            setProdCategory={isAdjacent ? () => {} : productForm.setProdCategory}
            isProductEditorOpen={isAdjacent ? false : productForm.productModalOpen}
            onCloseProductEditor={isAdjacent ? undefined : () => productForm.setProductModalOpen(false)}
            inlineProductEditor={
              !isMobileView && !isAdjacent && productForm.productModalOpen
                ? renderProductEditor(true)
                : null
            }
          />
        )}

        {view === "orders" && (
          <MerchantOrdersView
            orders={orders}
            theme={theme}
            isMobileView={isMobileView}
            onUpdateOrderStatus={isAdjacent ? () => {} : orderActions.handleUpdateOrderStatus}
            onRequestCourier={isAdjacent ? () => {} : orderActions.handleRequestCourier}
            store={store}
            reviews={reviews}
            onRefreshReviews={remoteSync.fetchRemoteReviews}
          />
        )}

        {(view === "profile" || view === "payments") && (
          <MerchantProfileView
            theme={theme}
            isMobileView={isMobileView}
            editBannerUrl={storeProfile.editBannerUrl}
            setEditBannerUrl={isAdjacent ? () => {} : storeProfile.setEditBannerUrl}
            editLogoUrl={storeProfile.editLogoUrl}
            setEditLogoUrl={isAdjacent ? () => {} : storeProfile.setEditLogoUrl}
            editName={storeProfile.editName}
            setEditName={isAdjacent ? () => {} : storeProfile.setEditName}
            editType={storeProfile.editType}
            setEditType={isAdjacent ? () => {} : storeProfile.setEditType}
            editCategory={storeProfile.editCategory}
            setEditCategory={isAdjacent ? () => {} : storeProfile.setEditCategory}
            editDescription={storeProfile.editDescription}
            setEditDescription={isAdjacent ? () => {} : storeProfile.setEditDescription}
            editWhatsapp={storeProfile.editWhatsapp}
            setEditWhatsapp={isAdjacent ? () => {} : storeProfile.setEditWhatsapp}
            editCity={storeProfile.editCity}
            setEditCity={isAdjacent ? () => {} : storeProfile.setEditCity}
            editDistrict={storeProfile.editDistrict}
            setEditDistrict={isAdjacent ? () => {} : storeProfile.setEditDistrict}
            editVillage={storeProfile.editVillage}
            setEditVillage={isAdjacent ? () => {} : storeProfile.setEditVillage}
            editAddress={storeProfile.editAddress}
            setEditAddress={isAdjacent ? () => {} : storeProfile.setEditAddress}
            editLatitude={storeProfile.editLatitude}
            setEditLatitude={isAdjacent ? () => {} : storeProfile.setEditLatitude}
            editLongitude={storeProfile.editLongitude}
            setEditLongitude={isAdjacent ? () => {} : storeProfile.setEditLongitude}
            editOpenDays={storeProfile.editOpenDays}
            setEditOpenDays={isAdjacent ? () => {} : storeProfile.setEditOpenDays}
            editIs24Hours={storeProfile.editIs24Hours}
            setEditIs24Hours={isAdjacent ? () => {} : storeProfile.setEditIs24Hours}
            editOpenTime={storeProfile.editOpenTime}
            setEditOpenTime={isAdjacent ? () => {} : storeProfile.setEditOpenTime}
            editCloseTime={storeProfile.editCloseTime}
            setEditCloseTime={isAdjacent ? () => {} : storeProfile.setEditCloseTime}
            editDailyCustomHours={storeProfile.editDailyCustomHours}
            setEditDailyCustomHours={isAdjacent ? () => {} : storeProfile.setEditDailyCustomHours}
            onSaveProfile={isAdjacent ? () => {} : storeProfile.handleSaveAllProfileChanges}
            editBankName={storeProfile.editBankName}
            setEditBankName={isAdjacent ? () => {} : storeProfile.setEditBankName}
            editDanaPhone={storeProfile.editDanaPhone}
            setEditDanaPhone={isAdjacent ? () => {} : storeProfile.setEditDanaPhone}
            editDanaName={storeProfile.editDanaName}
            setEditDanaName={isAdjacent ? () => {} : storeProfile.setEditDanaName}
            editQrisImageUrl={storeProfile.editQrisImageUrl}
            setEditQrisImageUrl={isAdjacent ? () => {} : storeProfile.setEditQrisImageUrl}
            editAcceptCod={storeProfile.editAcceptCod}
            setEditAcceptCod={isAdjacent ? () => {} : storeProfile.setEditAcceptCod}
            handleQrisUpload={isAdjacent ? () => {} : storeProfile.handleQrisUpload}
            referralCopied={storeProfile.referralCopied}
            handleCopyReferralCode={isAdjacent ? () => {} : storeProfile.handleCopyReferralCode}
            onSavePayments={isAdjacent ? () => {} : storeProfile.handleSaveAllProfileChanges}
            initialSubTab={view === "payments" ? "payments" : "profile"}
            shippingConfig={store?.shippingConfig}
            onUpdateShippingConfig={isAdjacent ? () => {} : storeProfile.handleUpdateShippingConfig}
            store={store}
            onRefreshStore={storeProfile.handleRefreshStore}
            isWhatsappVerified={Boolean(
              (store?.verified &&
                store?.whatsapp &&
                store.whatsapp ===
                  storeProfile.editWhatsapp.replace(/[^0-9]/g, "")) ||
                (typeof window !== "undefined" &&
                  !!store?.id &&
                  localStorage.getItem(`sera_merchant_wa_verified_${store.id}`) ===
                    "true" &&
                  localStorage.getItem(`sera_merchant_wa_verified_num_${store.id}`) ===
                    storeProfile.editWhatsapp.replace(/[^0-9]/g, ""))
            )}
            onVerifyWhatsapp={isAdjacent ? () => {} : storeProfile.handleVerifyStoreWhatsapp}
            onResetStore={isAdjacent ? () => {} : handleResetStore}
            onRegisterStore={isAdjacent ? undefined : storeProfile.handleRegisterStore}
          />
        )}

        {view === "pos" && (
          <MerchantPosView
            theme={theme}
            store={store}
            products={products.filter((p) => p.status !== "DRAFT")}
            socket={socket}
            isMobileView={isMobileView}
            isActive={normalizedCurrentView === "pos"}
            onUpdateProducts={
              isAdjacent
                ? () => {}
                : (updated) =>
                    setProducts((prev) => [
                      ...updated,
                      ...prev.filter((p) => p.status === "DRAFT")
                    ])
            }
            onAddOrder={isAdjacent ? () => {} : ((newOrder) => setOrders((prev) => [newOrder, ...prev]))}
          />
        )}

        {view === "courier" && (
          <MerchantCourierView
            store={store}
            theme={theme}
            isMobileView={isMobileView}
            onRefreshStore={isAdjacent ? async () => {} : storeProfile.handleRefreshStore}
          />
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: theme.bg,
        position: "relative",
        minWidth: 0,
        minHeight: 0
      }}
    >
      <MerchantHeader
        theme={theme}
        onBack={handleMerchantBack}
        store={store}
        onToggleOpenStatus={storeProfile.handleToggleOpenStatus}
        isMobileView={isMobileView}
        currentView={normalizedCurrentView}
        setCurrentView={handleViewChange}
        orderCount={
          orders.filter(
            (o) =>
              o.status === "PENDING" ||
              o.status === "CONFIRMED" ||
              o.status === "PROCESSING"
          ).length
        }
        onOpenProfileEditor={storeProfile.handleOpenProfileEditor}
      />

      <div
        ref={pagerRef}
        onScroll={handlePagerScroll}
        className="viewpager-container no-scrollbar"
        style={{
          flex: 1,
          width: "100%",
          display: "flex",
          flexDirection: "row",
          overflowX: "auto",
          overflowY: "hidden",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          overscrollBehaviorX: "contain"
        }}
      >
        {MERCHANT_VIEW_ORDER.map((viewKey) => (
          <div
            key={viewKey}
            className="viewpager-pane"
            style={{
              flex: "0 0 100%",
              width: "100%",
              minWidth: "100%",
              maxWidth: "100%",
              height: "100%",
              overflowY: !isMobileView && (viewKey === "pos" || viewKey === "profile" || viewKey === "products" || viewKey === "orders") ? "hidden" : "auto",
              overflowX: "hidden",
              position: "relative",
              WebkitOverflowScrolling: "touch",
              overscrollBehaviorY: "contain",
              contain:
                viewKey === "pos" ||
                viewKey !== normalizedCurrentView
                  ? "content"
                  : undefined,
              scrollSnapAlign: "start",
              scrollSnapStop: "always",
              boxSizing: "border-box"
            }}
          >
            {renderMerchantView(viewKey, false)}
          </div>
        ))}
      </div>

      {isMobileView && renderProductEditor(false)}

      {productForm.saveToast && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(24, 24, 27, 0.94)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            color: "#FFFFFF",
            border: "1px solid rgba(255, 255, 255, 0.16)",
            padding: "10px 20px",
            borderRadius: 9999,
            fontSize: 13,
            fontWeight: 600,
            zIndex: 10000,
            boxShadow: "0 12px 36px rgba(0, 0, 0, 0.35)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            whiteSpace: "nowrap",
            width: "max-content",
            maxWidth: "calc(100vw - 32px)",
            pointerEvents: "none",
            animation: "fadeIn 0.15s ease"
          }}
        >
          {productForm.saveToast.type === "error" ? (
            <AlertCircle size={16} style={{ color: "#EF4444", flexShrink: 0 }} />
          ) : (
            <Check size={15} strokeWidth={2.8} style={{ color: "#FFFFFF", flexShrink: 0 }} />
          )}
          <span style={{ whiteSpace: "nowrap" }}>{productForm.saveToast.message}</span>
        </div>
      )}

      <DeleteCategoryModal
        category={productForm.categoryToDelete}
        onClose={() => productForm.setCategoryToDelete(null)}
        onConfirm={(cat) => {
          productForm.handleDeleteCategory(cat);
          productForm.setCategoryToDelete(null);
        }}
        theme={theme}
      />

      <DeleteProductModal
        product={productForm.productToDelete}
        onClose={() => productForm.setProductToDelete(null)}
        onConfirm={productForm.handleConfirmDeleteProduct}
        theme={theme}
      />

      <StoreSavedModal
        isOpen={storeProfile.showSaveSuccessModal}
        onClose={() => storeProfile.setShowSaveSuccessModal(false)}
        theme={theme}
      />
    </div>
  );
}

export function MerchantPage(props: MerchantPageProps) {
  return (
    <MerchantErrorBoundary theme={props.theme} onBack={props.onBack}>
      <MerchantPageInner {...props} />
    </MerchantErrorBoundary>
  );
}
