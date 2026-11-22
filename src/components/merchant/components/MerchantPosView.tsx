import { useState, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { registerBackHandler } from "../../../utils/backButton";
import { getApiBaseUrl } from "../../../config/marketplaceConfig";
import type { ThemeType } from "../../../theme";
import {
  type MerchantStore,
  type MerchantProduct,
  type MerchantOrder,
  type PosPaymentPart,
  getStoreProductCategories,
  STORE_CATEGORIES
} from "../types";
import { BarcodeScannerModal } from "./modals/BarcodeScannerModal";
import { PosReportModal } from "./modals/PosReportModal";
import { calculatePosChargeBreakdown } from "../utils/posPaymentUtils";
import {
  computeKitchenTicketPlan,
  printKitchenTicketHybrid
} from "./pos/printing/thermalPrintService";
import type { KitchenTicketPrintPayload } from "./pos/printing/printerTypes";

// Modular POS Hooks
import { usePosAudio } from "./pos/hooks/usePosAudio";
import { usePosCart } from "./pos/hooks/usePosCart";
import { usePosBarcodeScanner } from "./pos/hooks/usePosBarcodeScanner";
import { usePosTransactions } from "./pos/hooks/usePosTransactions";
import { useAdaptivePosMode, type HeldPosBill } from "./pos/hooks/useAdaptivePosMode";

// Modular POS UI Components
import { PosProductGrid } from "./pos/components/PosProductGrid";
import { PosCartDrawer } from "./pos/components/PosCartDrawer";
import {
  HeldBillsStrip,
  FoodTableSelector,
  HoldBillButton,
  PrintKitchenTicketButton,
  CancelTableBillModal,
  KitchenReprintConfirmModal
} from "./pos/components/AdaptivePosControls";
import { PosKitchenTicketPrint } from "./pos/components/PosKitchenTicketPrint";
import { PosPaymentModal } from "./pos/components/PosPaymentModal";
import { PosReceiptModal } from "./pos/components/PosReceiptModal";
import { PosVariantModal } from "./pos/components/PosVariantModal";
import { PrinterSettingsModal } from "./pos/printing/PrinterSettingsModal";

interface MerchantPosViewProps {
  theme: ThemeType;
  store: MerchantStore | null;
  products: MerchantProduct[];
  socket?: any;
  isMobileView?: boolean;
  isActive?: boolean;
  onUpdateProducts: (updated: MerchantProduct[]) => void;
  onAddOrder: (order: MerchantOrder) => void;
  onRequireRegistration?: () => void;
}

export function MerchantPosView({
  theme,
  store,
  products,
  socket,
  isMobileView,
  isActive = true,
  onUpdateProducts,
  onAddOrder,
  onRequireRegistration
}: MerchantPosViewProps) {
  // Toast Notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  }, []);

  // 1. Audio Hook
  const { playBeep } = usePosAudio();

  // 2. Cart Hook
  const {
    cart,
    setCart,
    addToCart,
    updateQuantity,
    updateItemNote,
    removeFromCart,
    clearCart,
    manualDiscountNominal,
    setManualDiscountNominal,
    showDiscountInput,
    setShowDiscountInput,
    rawSubtotal,
    productDiscountTotal,
    totalDiscount,
    finalTotal: cartTotalAfterDiscount,
    totalItemCount
  } = usePosCart({ onNotify: showToast });

  // 3. Transactions & History Hook
  const {
    posTransactions,
    completedTransaction,
    setCompletedTransaction,
    finalizeTransaction,
    voidTransaction
  } = usePosTransactions({
    store,
    products,
    socket,
    onUpdateProducts,
    onAddOrder,
    onPlayBeep: playBeep,
    onNotify: showToast
  });

  // Search & Categories States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // Modals & Drawers States
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isPrinterModalOpen, setIsPrinterModalOpen] = useState(false);
  const [activeVariantProduct, setActiveVariantProduct] = useState<MerchantProduct | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "QRIS" | "TRANSFER">("CASH");
  const [cashTendered, setCashTendered] = useState<string>("");
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  const [posConfig, setPosConfig] = useState<{
    taxEnabled: boolean;
    taxPercent: number;
    serviceChargeEnabled: boolean;
    serviceChargePercent: number;
    allowOpenBill: boolean;
  }>({
    taxEnabled: false,
    taxPercent: 11,
    serviceChargeEnabled: false,
    serviceChargePercent: 5,
    allowOpenBill: true
  });
  const allowOpenBill = posConfig.allowOpenBill;
  const [billToCancel, setBillToCancel] = useState<HeldPosBill | null>(null);
  const [isKitchenReprintConfirmOpen, setIsKitchenReprintConfirmOpen] = useState(false);
  const [kitchenReprintPayload, setKitchenReprintPayload] =
    useState<KitchenTicketPrintPayload | null>(null);

  useEffect(() => {
    if (!store?.id) {
      setPosConfig({
        taxEnabled: false,
        taxPercent: 11,
        serviceChargeEnabled: false,
        serviceChargePercent: 5,
        allowOpenBill: true
      });
      return;
    }
    let cancelled = false;
    fetch(`${getApiBaseUrl()}/api/market/stores/${store.id}/pos-config`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!cancelled && json?.success && json.data?.posConfig) {
          const cfg = json.data.posConfig;
          setPosConfig({
            taxEnabled: Boolean(cfg.taxEnabled),
            taxPercent: Number(cfg.taxPercent ?? 11),
            serviceChargeEnabled: Boolean(cfg.serviceChargeEnabled),
            serviceChargePercent: Number(cfg.serviceChargePercent ?? 5),
            allowOpenBill: cfg.allowOpenBill ?? true
          });
        }
      })
      .catch(() => {});

    const handleConfigUpdated = (event: Event) => {
      const detail = (event as CustomEvent)?.detail;
      if (detail?.storeId === store.id && detail?.posConfig) {
        const cfg = detail.posConfig;
        setPosConfig({
          taxEnabled: Boolean(cfg.taxEnabled),
          taxPercent: Number(cfg.taxPercent ?? 11),
          serviceChargeEnabled: Boolean(cfg.serviceChargeEnabled),
          serviceChargePercent: Number(cfg.serviceChargePercent ?? 5),
          allowOpenBill: cfg.allowOpenBill ?? true
        });
      }
    };
    window.addEventListener("sera_pos_config_updated", handleConfigUpdated);
    return () => {
      cancelled = true;
      window.removeEventListener("sera_pos_config_updated", handleConfigUpdated);
    };
  }, [store?.id]);

  const { taxAmount, serviceChargeAmount, finalTotal } = useMemo(
    () => calculatePosChargeBreakdown(cartTotalAfterDiscount, posConfig),
    [cartTotalAfterDiscount, posConfig]
  );

  // Automatically dismiss mobile cart drawer if navigating away from Kasir page
  useEffect(() => {
    if (!isActive) {
      setMobileCartOpen(false);
    }
  }, [isActive]);

  // 4. Hardware Barcode Scanner Hook
  const { handleManualBarcodeScan } = usePosBarcodeScanner({
    products,
    onBarcodeDetected: (matched) => {
      playBeep();
      addToCart(matched);
      showToast(`+1 ${matched.name}`);
    },
    onBarcodeNotFound: (code) => {
      showToast(`Produk barcode "${code}" tidak ditemukan`);
    }
  });

  // 5. Adaptive Store Mode (FOOD vs BARANG) & Held/Table Bills
  const adaptiveMode = useAdaptivePosMode({
    storeId: store?.id,
    storeType: store?.type,
    products,
    socket,
    actorName: "Store Owner",
    cart,
    manualDiscountNominal,
    setCart,
    setManualDiscountNominal,
    clearCart,
    addToCart,
    onManualBarcodeScan: handleManualBarcodeScan,
    onClearSearch: () => setSearchQuery(""),
    onPlayBeep: playBeep,
    onNotify: showToast
  });

  // Sequential Native Back Button Navigation for Merchant POS
  useEffect(() => {
    const unregs: (() => void)[] = [];

    if (isKitchenReprintConfirmOpen) {
      unregs.push(
        registerBackHandler("pos_kitchen_reprint", 91, () => {
          setIsKitchenReprintConfirmOpen(false);
          return true;
        })
      );
    }

    if (completedTransaction) {
      unregs.push(
        registerBackHandler("pos_receipt", 90, () => {
          setCompletedTransaction(null);
          return true;
        })
      );
    }

    if (billToCancel) {
      unregs.push(
        registerBackHandler("pos_cancel_table_bill", 88, () => {
          setBillToCancel(null);
          return true;
        })
      );
    }

    if (isPrinterModalOpen) {
      unregs.push(
        registerBackHandler("pos_printer_modal", 85, () => {
          setIsPrinterModalOpen(false);
          return true;
        })
      );
    }

    if (isPaymentModalOpen) {
      unregs.push(
        registerBackHandler("pos_payment_modal", 80, () => {
          setIsPaymentModalOpen(false);
          return true;
        })
      );
    }

    if (activeVariantProduct) {
      unregs.push(
        registerBackHandler("pos_variant_modal", 75, () => {
          setActiveVariantProduct(null);
          return true;
        })
      );
    }

    if (isReportModalOpen) {
      unregs.push(
        registerBackHandler("pos_report_modal", 75, () => {
          setIsReportModalOpen(false);
          return true;
        })
      );
    }

    if (mobileCartOpen) {
      unregs.push(
        registerBackHandler("pos_mobile_cart", 60, () => {
          setMobileCartOpen(false);
          return true;
        })
      );
    }

    if (searchQuery.trim()) {
      unregs.push(
        registerBackHandler("pos_search", 40, () => {
          setSearchQuery("");
          return true;
        })
      );
    }

    return () => {
      unregs.forEach((u) => u());
    };
  }, [
    isKitchenReprintConfirmOpen,
    completedTransaction,
    billToCancel,
    isPrinterModalOpen,
    isPaymentModalOpen,
    activeVariantProduct,
    isReportModalOpen,
    mobileCartOpen,
    searchQuery,
    setCompletedTransaction
  ]);

  // Prevent background scrolling when mobile cart drawer is open
  useEffect(() => {
    if (isMobileView && mobileCartOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isMobileView, mobileCartOpen]);

  // Cash Calculation
  const tenderedNum = parseInt(cashTendered.replace(/[^0-9]/g, ""), 10) || 0;
  const changeAmount = Math.max(0, tenderedNum - finalTotal);
  const isCashSufficient = tenderedNum >= finalTotal;

  // Category List calculation
  const categoryList = useMemo(() => {
    const customCats = getStoreProductCategories(store?.customCategories);
    const set = new Set<string>(customCats);
    const macroCategories = new Set(Object.values(STORE_CATEGORIES).flat());

    products.forEach((p) => {
      const c = p.category?.trim();
      if (
        c &&
        c.toLowerCase() !== "umum" &&
        c.toLowerCase() !== "general" &&
        c !== store?.category &&
        !macroCategories.has(c)
      ) {
        set.add(c);
      }
    });

    return ["ALL", ...Array.from(set)];
  }, [store?.customCategories, store?.category, products]);

  // Reset selected category if deleted
  useEffect(() => {
    if (selectedCategory !== "ALL" && !categoryList.includes(selectedCategory)) {
      setSelectedCategory("ALL");
    }
  }, [categoryList, selectedCategory]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== "ALL" && p.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = p.name.toLowerCase().includes(q);
        const matchBarcode = p.barcode ? p.barcode.toLowerCase().includes(q) : false;
        const matchCat = p.category ? p.category.toLowerCase().includes(q) : false;
        if (!matchName && !matchBarcode && !matchCat) return false;
      }
      return true;
    });
  }, [products, selectedCategory, searchQuery]);

  // Open Payment Handler
  const handleOpenPayment = () => {
    if (cart.length === 0) return;
    setCashTendered(finalTotal.toString());
    setIsPaymentModalOpen(true);
  };

  // Finalize Checkout Handler
  const handleFinalizeTransaction = (splitPayments?: PosPaymentPart[]) => {
    if (cart.length === 0) return;
    if (!splitPayments && paymentMethod === "CASH" && !isCashSufficient) {
      showToast("Nominal uang tunai belum mencukupi!");
      return;
    }

    finalizeTransaction({
      cart,
      finalTotal,
      totalDiscount,
      taxAmount,
      serviceChargeAmount,
      paymentMethod: splitPayments && splitPayments.length > 1 ? "SPLIT" : paymentMethod,
      payments: splitPayments,
      tenderedNum,
      changeAmount,
      tableOrQueueNumber: adaptiveMode.activeTableOrQueueLabel
    });

    setIsPaymentModalOpen(false);
    adaptiveMode.clearActiveHeldBillAfterCheckout();
    clearCart();
  };

  const kitchenPlan = useMemo(() => computeKitchenTicketPlan(cart), [cart]);

  const cartKitchenTicketPayload: KitchenTicketPrintPayload | null = useMemo(() => {
    if (kitchenReprintPayload) return kitchenReprintPayload;
    if (!adaptiveMode.isFoodStore || kitchenPlan.deltaItems.length === 0) return null;
    return {
      store,
      orderType: adaptiveMode.foodOrderType,
      tableLabel: adaptiveMode.activeTableOrQueueLabel,
      receiptOrBillNumber: adaptiveMode.activeTableBill?.id,
      actorName: "Store Owner",
      items: kitchenPlan.deltaItems,
      isAdditionalOrder: kitchenPlan.hasPreviouslySentItems
    };
  }, [
    kitchenReprintPayload,
    adaptiveMode.isFoodStore,
    adaptiveMode.foodOrderType,
    adaptiveMode.activeTableOrQueueLabel,
    adaptiveMode.activeTableBill?.id,
    kitchenPlan,
    store
  ]);

  const handlePrintCartKitchenTicket = async () => {
    if (!adaptiveMode.isFoodStore || cart.length === 0) return;
    if (kitchenPlan.deltaItems.length === 0) {
      setIsKitchenReprintConfirmOpen(true);
      return;
    }
    if (!cartKitchenTicketPayload) return;
    try {
      const res = await printKitchenTicketHybrid(cartKitchenTicketPayload);
      if (res.ok) {
        adaptiveMode.markCartSentToKitchen();
      }
      showToast(res.message);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Gagal mencetak tiket dapur.");
    }
  };

  const handleConfirmFullKitchenReprint = async () => {
    setIsKitchenReprintConfirmOpen(false);
    if (!adaptiveMode.isFoodStore || cart.length === 0) return;
    const fullPayload: KitchenTicketPrintPayload = {
      store,
      orderType: adaptiveMode.foodOrderType,
      tableLabel: adaptiveMode.activeTableOrQueueLabel,
      receiptOrBillNumber: adaptiveMode.activeTableBill?.id,
      actorName: "Store Owner",
      items: cart,
      isReprint: true
    };
    setKitchenReprintPayload(fullPayload);
    await new Promise((resolve) => setTimeout(resolve, 60));
    try {
      const res = await printKitchenTicketHybrid(fullPayload);
      showToast(res.message);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Gagal mencetak ulang tiket dapur.");
    } finally {
      setKitchenReprintPayload(null);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        width: "100%",
        minHeight: "100%",
        background: theme.bg,
        position: "relative"
      }}
    >
      {/* Toast Notification (Portaled so pane containment never clips or scrolls fixed banners) */}
      {toastMessage &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            style={{
              position: "fixed",
              bottom: isMobileView ? 88 : 28,
              left: "50%",
              transform: "translateX(-50%)",
              background: theme.isDark ? "#2A2E35" : "#F1F5F9",
              color: theme.ink,
              border: `1px solid ${theme.border}`,
              padding: "6px 14px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              zIndex: 9999,
              boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              maxWidth: "calc(100vw - 32px)",
              pointerEvents: "none",
              animation: "fadeIn 0.15s ease"
            }}
          >
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {toastMessage}
            </span>
          </div>,
          document.body
        )}

      {/* Main Dual-Column Content */}
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: isMobileView ? "column" : "row",
          gap: 16,
          padding: isMobileView ? "12px 14px 100px" : "18px 22px",
          width: "100%",
          boxSizing: "border-box"
        }}
      >
        {/* LEFT COLUMN: Product Catalog & Adaptive Grid/List */}
        <PosProductGrid
          theme={theme}
          isMobileView={isMobileView}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          categoryList={categoryList}
          filteredProducts={filteredProducts}
          storeType={store?.type}
          viewMode={adaptiveMode.gridViewMode}
          onToggleViewMode={adaptiveMode.setGridViewMode}
          showScannerButton={!adaptiveMode.isFoodStore}
          onBarcodeEnter={adaptiveMode.handleBarcodeEnter}
          extraHeaderContent={
            <HeldBillsStrip
              theme={theme}
              isFoodStore={adaptiveMode.isFoodStore}
              heldBills={adaptiveMode.heldBills}
              activeHeldBillId={adaptiveMode.activeHeldBillId}
              onResume={adaptiveMode.handleResumeHeldBill}
              onDelete={adaptiveMode.handleDeleteHeldBill}
            />
          }
          onOpenScanner={() => {
            if (!store && onRequireRegistration) {
              onRequireRegistration();
              return;
            }
            setIsScannerOpen(true);
          }}
          onOpenReport={() => setIsReportModalOpen(true)}
          onOpenPrinterSettings={() => setIsPrinterModalOpen(true)}
          onSelectProduct={(p) => {
            playBeep();
            addToCart(p);
            showToast(`+1 ${p.name}`);
          }}
          onSelectVariantModal={setActiveVariantProduct}
        />

        {/* RIGHT COLUMN: Kasir Cart & Bill (Desktop only) */}
        {!isMobileView && (
          <PosCartDrawer
            theme={theme}
            storeType={store?.type}
            foodOrderType={adaptiveMode.foodOrderType}
            isMobileView={false}
            cart={cart}
            mobileCartOpen={mobileCartOpen}
            onSetMobileCartOpen={setMobileCartOpen}
            totalItemCount={totalItemCount}
            finalTotal={finalTotal}
            totalDiscount={totalDiscount}
            manualDiscountNominal={manualDiscountNominal}
            showDiscountInput={showDiscountInput}
            onSetManualDiscountNominal={setManualDiscountNominal}
            onSetShowDiscountInput={setShowDiscountInput}
            taxAmount={taxAmount}
            taxLabel={`Pajak (${posConfig.taxPercent}%)`}
            serviceChargeAmount={serviceChargeAmount}
            serviceChargeLabel={`Service (${posConfig.serviceChargePercent}%)`}
            onUpdateQuantity={updateQuantity}
            onUpdateItemNote={adaptiveMode.isFoodStore ? updateItemNote : undefined}
            onRemoveFromCart={removeFromCart}
            onClearCart={() => {
              clearCart();
              adaptiveMode.setActiveHeldBillId(null);
            }}
            cartTopSlot={
              adaptiveMode.isFoodStore ? (
                <FoodTableSelector
                  theme={theme}
                  foodOrderType={adaptiveMode.foodOrderType}
                  tables={adaptiveMode.tables}
                  tableNumber={adaptiveMode.tableNumber}
                  openBillEnabled={allowOpenBill}
                  occupiedTableCounts={adaptiveMode.occupiedTableCounts}
                  activeTableBill={adaptiveMode.activeTableBill}
                  activeHeldBillId={adaptiveMode.activeHeldBillId}
                  onOpenTableBill={adaptiveMode.handleOpenTableBill}
                  onCancelTableBill={setBillToCancel}
                  onMoveTableBill={adaptiveMode.handleMoveTableBill}
                  onChangeOrderType={adaptiveMode.setFoodOrderType}
                  onChangeTableNumber={adaptiveMode.setTableNumber}
                  onAddTable={adaptiveMode.handleAddTable}
                  onRemoveTable={adaptiveMode.handleRemoveTable}
                />
              ) : undefined
            }
            secondaryActionSlot={
              allowOpenBill || adaptiveMode.activeHeldBillId || adaptiveMode.isFoodStore ? (
                <>
                  {adaptiveMode.isFoodStore && (
                    <PrintKitchenTicketButton
                      theme={theme}
                      disabled={cart.length === 0}
                      pendingCount={kitchenPlan.pendingCount}
                      hasPreviouslySent={kitchenPlan.hasPreviouslySentItems}
                      onClick={() => void handlePrintCartKitchenTicket()}
                    />
                  )}
                  {(allowOpenBill || adaptiveMode.activeHeldBillId) && (
                    <HoldBillButton
                      theme={theme}
                      disabled={cart.length === 0}
                      isFoodStore={adaptiveMode.isFoodStore}
                      onClick={adaptiveMode.handleHoldCurrentBill}
                    />
                  )}
                </>
              ) : undefined
            }
            onOpenPayment={handleOpenPayment}
          />
        )}
      </div>

      {/* MOBILE FOOTER & DRAWER: Kasir Cart (Docked directly at bottom as stationary footer) */}
      {isMobileView && isActive && (
        <PosCartDrawer
          theme={theme}
          storeType={store?.type}
          foodOrderType={adaptiveMode.foodOrderType}
          isMobileView={true}
          isActive={isActive}
          cart={cart}
          mobileCartOpen={mobileCartOpen}
          onSetMobileCartOpen={setMobileCartOpen}
          totalItemCount={totalItemCount}
          finalTotal={finalTotal}
          totalDiscount={totalDiscount}
          manualDiscountNominal={manualDiscountNominal}
          showDiscountInput={showDiscountInput}
          onSetManualDiscountNominal={setManualDiscountNominal}
          onSetShowDiscountInput={setShowDiscountInput}
          taxAmount={taxAmount}
          taxLabel={`Pajak (${posConfig.taxPercent}%)`}
          serviceChargeAmount={serviceChargeAmount}
          serviceChargeLabel={`Service (${posConfig.serviceChargePercent}%)`}
          onUpdateQuantity={updateQuantity}
          onUpdateItemNote={adaptiveMode.isFoodStore ? updateItemNote : undefined}
          onRemoveFromCart={removeFromCart}
          onClearCart={() => {
            clearCart();
            adaptiveMode.setActiveHeldBillId(null);
          }}
          cartTopSlot={
            adaptiveMode.isFoodStore ? (
              <FoodTableSelector
                theme={theme}
                foodOrderType={adaptiveMode.foodOrderType}
                tables={adaptiveMode.tables}
                tableNumber={adaptiveMode.tableNumber}
                openBillEnabled={allowOpenBill}
                occupiedTableCounts={adaptiveMode.occupiedTableCounts}
                activeTableBill={adaptiveMode.activeTableBill}
                activeHeldBillId={adaptiveMode.activeHeldBillId}
                onOpenTableBill={adaptiveMode.handleOpenTableBill}
                onCancelTableBill={setBillToCancel}
                onMoveTableBill={adaptiveMode.handleMoveTableBill}
                onChangeOrderType={adaptiveMode.setFoodOrderType}
                onChangeTableNumber={adaptiveMode.setTableNumber}
                onAddTable={adaptiveMode.handleAddTable}
                onRemoveTable={adaptiveMode.handleRemoveTable}
              />
            ) : undefined
          }
          secondaryActionSlot={
            allowOpenBill || adaptiveMode.activeHeldBillId || adaptiveMode.isFoodStore ? (
              <>
                {adaptiveMode.isFoodStore && (
                  <PrintKitchenTicketButton
                    theme={theme}
                    disabled={cart.length === 0}
                    pendingCount={kitchenPlan.pendingCount}
                    hasPreviouslySent={kitchenPlan.hasPreviouslySentItems}
                    onClick={() => void handlePrintCartKitchenTicket()}
                  />
                )}
                {(allowOpenBill || adaptiveMode.activeHeldBillId) && (
                  <HoldBillButton
                    theme={theme}
                    disabled={cart.length === 0}
                    isFoodStore={adaptiveMode.isFoodStore}
                    onClick={adaptiveMode.handleHoldCurrentBill}
                  />
                )}
              </>
            ) : undefined
          }
          onOpenPayment={handleOpenPayment}
        />
      )}

      {/* POS Fixed Modals (Portaled to body to isolate from scroll-pane containment) */}
      {typeof document !== "undefined" &&
        createPortal(
          <>
            {/* MODAL: Variant Selector */}
            <PosVariantModal
              product={activeVariantProduct}
              onClose={() => setActiveVariantProduct(null)}
              theme={theme}
              onSelectVariant={(product, variant) => {
                playBeep();
                addToCart(product, variant);
                showToast(`+1 ${product.name} (${variant.name})`);
                setActiveVariantProduct(null);
              }}
            />

            {/* MODAL: Checkout / Payment */}
            <PosPaymentModal
              isOpen={isPaymentModalOpen}
              onClose={() => setIsPaymentModalOpen(false)}
              theme={theme}
              store={store}
              finalTotal={finalTotal}
              totalItemCount={totalItemCount}
              paymentMethod={paymentMethod}
              onSetPaymentMethod={setPaymentMethod}
              cashTendered={cashTendered}
              onSetCashTendered={setCashTendered}
              isCashSufficient={isCashSufficient}
              changeAmount={changeAmount}
              tenderedNum={tenderedNum}
              onFinalizeTransaction={handleFinalizeTransaction}
            />

            {/* MODAL: Transaction Receipt & Success */}
            <PosReceiptModal
              completedTransaction={completedTransaction}
              onClose={() => setCompletedTransaction(null)}
              theme={theme}
              store={store}
              onOpenPrinterSettings={() => setIsPrinterModalOpen(true)}
              onNotify={showToast}
            />

            {/* MODAL: Hybrid Thermal Printer Settings */}
            {isPrinterModalOpen && (
              <PrinterSettingsModal
                isOpen={true}
                onClose={() => setIsPrinterModalOpen(false)}
                theme={theme}
                store={store}
                onNotify={showToast}
              />
            )}

            {/* CAMERA SCANNER MODAL */}
            <BarcodeScannerModal
              isOpen={isScannerOpen}
              onClose={() => setIsScannerOpen(false)}
              onDetected={handleManualBarcodeScan}
              theme={theme}
              title="Scan Barcode"
              continuous={true}
              cartItems={cart}
              rawSubtotal={rawSubtotal}
              productDiscountTotal={productDiscountTotal}
              manualDiscountNominal={manualDiscountNominal}
              onUpdateManualDiscount={setManualDiscountNominal}
              totalAmount={finalTotal}
              totalCount={totalItemCount}
              onUpdateQty={updateQuantity}
              onRemoveItem={removeFromCart}
              onClearCart={clearCart}
              onProceedToPayment={() => {
                setIsScannerOpen(false);
                setIsPaymentModalOpen(true);
              }}
            />

            {/* POS SHIFT & HISTORY REPORT MODAL */}
            <PosReportModal
              isOpen={isReportModalOpen}
              onClose={() => setIsReportModalOpen(false)}
              transactions={posTransactions}
              store={store}
              theme={theme}
              isMobileView={isMobileView}
              onReprintReceipt={(tx) => {
                setCompletedTransaction(tx);
                setIsReportModalOpen(false);
              }}
              onVoidTransaction={voidTransaction}
              onNotify={showToast}
            />

            <CancelTableBillModal
              bill={billToCancel}
              theme={theme}
              onClose={() => setBillToCancel(null)}
              onConfirm={() => {
                if (!billToCancel) return;
                void adaptiveMode.handleDeleteHeldBill(billToCancel.id, { cashierId: "owner" });
                if (adaptiveMode.activeHeldBillId === billToCancel.id) {
                  adaptiveMode.setActiveHeldBillId(null);
                  clearCart();
                }
                playBeep();
                showToast(`Open bill ${billToCancel.label} dibatalkan.`);
                setBillToCancel(null);
              }}
            />

            <KitchenReprintConfirmModal
              isOpen={isKitchenReprintConfirmOpen}
              theme={theme}
              tableLabel={adaptiveMode.activeTableOrQueueLabel}
              onClose={() => setIsKitchenReprintConfirmOpen(false)}
              onConfirmReprint={() => void handleConfirmFullKitchenReprint()}
            />
          </>,
          document.body
        )}

      <PosKitchenTicketPrint
        payload={completedTransaction ? null : cartKitchenTicketPayload}
      />

      {/* Drawer Animations */}
      <style>{`
        @keyframes slideUpDrawer {
          from {
            transform: translateY(100%);
            opacity: 0.8;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
