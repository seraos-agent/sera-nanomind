import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { ChevronLeft as ArrowLeftIcon, Wallet, LogOut, PowerOff } from "lucide-react";
import type { ThemeType } from "../../theme";
import { getApiBaseUrl } from "../../config/marketplaceConfig";
import { registerBackHandler, dispatchBackButton } from "../../utils/backButton";
import {
  getStoreProductCategories,
  normalizeStoreType,
  STORE_CATEGORIES,
  type MerchantProduct,
  type PosPaymentPart,
  type PosTransaction
} from "../merchant/types";
import {
  calculatePosChargeBreakdown,
  getTransactionCashAmount
} from "../merchant/utils/posPaymentUtils";
import { usePosAudio } from "../merchant/components/pos/hooks/usePosAudio";
import { usePosCart } from "../merchant/components/pos/hooks/usePosCart";
import { usePosBarcodeScanner } from "../merchant/components/pos/hooks/usePosBarcodeScanner";
import { useAdaptivePosMode, type HeldPosBill } from "../merchant/components/pos/hooks/useAdaptivePosMode";
import { PosProductGrid } from "../merchant/components/pos/components/PosProductGrid";
import { PosCartDrawer } from "../merchant/components/pos/components/PosCartDrawer";
import {
  HeldBillsStrip,
  FoodTableSelector,
  HoldBillButton,
  PrintKitchenTicketButton,
  CancelTableBillModal,
  KitchenReprintConfirmModal
} from "../merchant/components/pos/components/AdaptivePosControls";
import { PosKitchenTicketPrint } from "../merchant/components/pos/components/PosKitchenTicketPrint";
import { PosPaymentModal } from "../merchant/components/pos/components/PosPaymentModal";
import { PosReceiptModal } from "../merchant/components/pos/components/PosReceiptModal";
import { PosVariantModal } from "../merchant/components/pos/components/PosVariantModal";
import { PrinterSettingsModal } from "../merchant/components/pos/printing/PrinterSettingsModal";
import {
  computeKitchenTicketPlan,
  printKitchenTicketHybrid
} from "../merchant/components/pos/printing/thermalPrintService";
import type { KitchenTicketPrintPayload } from "../merchant/components/pos/printing/printerTypes";
import { BarcodeScannerModal } from "../merchant/components/modals/BarcodeScannerModal";
import { PosReportModal } from "../merchant/components/modals/PosReportModal";
import { StoreCashierPairingGate } from "./StoreCashierPairingGate";
import {
  OpenShiftView,
  CashMovementModal,
  CloseShiftModal,
  SupervisorPinModal
} from "./CashierShiftModals";
import {
  mapServerTxToUiTransaction,
  type CashierSession,
  type CashierShift
} from "./types";

const CASHIER_SESSION_KEY = "sera_cashier_session";
const CASHIER_SHIFT_KEY = "sera_cashier_active_shift";
const CASHIER_PRODUCTS_KEY = "sera_cashier_products";

function readCachedJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

interface CashierPageProps {
  theme: ThemeType;
  isMobileView?: boolean;
  userEmail?: string | null;
  socket?: any;
  onBack: () => void;
}

/**
 * CashierPage - Dedicated POS Cashier terminal view isolated from Owner Mode.
 * Pairs via KS-XXXX activation code and syncs shifts/transactions to the local or cloud POS API.
 */
export function CashierPage({ theme, isMobileView, userEmail, socket, onBack }: CashierPageProps) {
  const [session, setSession] = useState<CashierSession | null>(() =>
    readCachedJson<CashierSession | null>(CASHIER_SESSION_KEY, null)
  );
  const resolvedUserEmail = (
    userEmail ||
    (typeof window !== "undefined" ? localStorage.getItem("sera_user_email") : "") ||
    ""
  )
    .trim()
    .toLowerCase();
  const skipAutoRecoverRef = useRef(false);
  const [isRecovering, setIsRecovering] = useState<boolean>(() =>
    Boolean(!readCachedJson<CashierSession | null>(CASHIER_SESSION_KEY, null) && resolvedUserEmail)
  );
  const [activeShift, setActiveShift] = useState<CashierShift | null>(() => {
    const cachedSession = readCachedJson<CashierSession | null>(CASHIER_SESSION_KEY, null);
    const cachedShift = readCachedJson<CashierShift | null>(CASHIER_SHIFT_KEY, null);
    if (
      cachedSession &&
      cachedShift &&
      cachedShift.status === "OPEN" &&
      cachedShift.storeId === cachedSession.store.id &&
      cachedShift.cashierId === cachedSession.cashier.id
    ) {
      return cachedShift;
    }
    return null;
  });
  const [products, setProducts] = useState<MerchantProduct[]>(() =>
    readCachedJson<MerchantProduct[]>(CASHIER_PRODUCTS_KEY, [])
  );
  const [transactions, setTransactions] = useState<PosTransaction[]>([]);
  const [completedTransaction, setCompletedTransaction] = useState<PosTransaction | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [sessionNotice, setSessionNotice] = useState<string | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2600);
  }, []);

  // Search & UI modals
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isPrinterModalOpen, setIsPrinterModalOpen] = useState(false);
  const [activeVariantProduct, setActiveVariantProduct] = useState<MerchantProduct | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "QRIS" | "TRANSFER">("CASH");
  const [cashTendered, setCashTendered] = useState("");
  const [mobileCartOpen, setMobileCartOpen] = useState(false);

  // Shift & Void modals
  const [isCashMovementOpen, setIsCashMovementOpen] = useState(false);
  const [isCloseShiftOpen, setIsCloseShiftOpen] = useState(false);
  const [pendingVoidTx, setPendingVoidTx] = useState<PosTransaction | null>(null);
  const [billToCancelConfirm, setBillToCancelConfirm] = useState<HeldPosBill | null>(null);
  const [billToCancelPin, setBillToCancelPin] = useState<HeldPosBill | null>(null);
  const [isKitchenReprintConfirmOpen, setIsKitchenReprintConfirmOpen] = useState(false);
  const [kitchenReprintPayload, setKitchenReprintPayload] =
    useState<KitchenTicketPrintPayload | null>(null);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  const { playBeep } = usePosAudio();
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

  const canManualDiscount = Boolean(
    session?.posConfig?.allowManualDiscount || session?.cashier?.permissions?.canDiscount
  );

  const handleSetManualDiscount = useCallback(
    (val: number) => {
      if (!canManualDiscount) {
        showToast("Manual discounts are disabled by the store owner.");
        setManualDiscountNominal(0);
        return;
      }
      setManualDiscountNominal(val);
    },
    [canManualDiscount, setManualDiscountNominal, showToast]
  );

  const handleSetShowDiscountInput = useCallback(
    (show: boolean) => {
      if (show && !canManualDiscount) {
        showToast("Manual discounts are disabled by the store owner.");
        return;
      }
      setShowDiscountInput(show);
    },
    [canManualDiscount, setShowDiscountInput, showToast]
  );

  // Calculate tax & service charge from store POS config
  const { taxAmount, serviceChargeAmount, finalTotal } = useMemo(
    () => calculatePosChargeBreakdown(cartTotalAfterDiscount, session?.posConfig),
    [cartTotalAfterDiscount, session?.posConfig]
  );

  // Persist paired session, active shift, and catalog locally to prevent flash on navigation
  useEffect(() => {
    try {
      if (session) {
        localStorage.setItem(CASHIER_SESSION_KEY, JSON.stringify(session));
      } else {
        localStorage.removeItem(CASHIER_SESSION_KEY);
        localStorage.removeItem(CASHIER_SHIFT_KEY);
        localStorage.removeItem(CASHIER_PRODUCTS_KEY);
      }
    } catch {}
  }, [session]);

  useEffect(() => {
    try {
      if (activeShift && activeShift.status === "OPEN") {
        localStorage.setItem(CASHIER_SHIFT_KEY, JSON.stringify(activeShift));
      } else {
        localStorage.removeItem(CASHIER_SHIFT_KEY);
      }
    } catch {}
  }, [activeShift]);

  useEffect(() => {
    try {
      if (products.length > 0) {
        localStorage.setItem(CASHIER_PRODUCTS_KEY, JSON.stringify(products));
      }
    } catch {}
  }, [products]);

  const clearHeldBillRef = useRef<(() => void) | null>(null);

  const forceDisconnectWithNotice = useCallback((reason: string | null) => {
    setSessionNotice(reason);
    setSession(null);
    setActiveShift(null);
    setProducts([]);
    setTransactions([]);
    clearHeldBillRef.current?.();
    clearCart();
  }, [clearCart]);

  const mapVerifyReasonToNotice = (reasonCode?: string): string => {
    switch (reasonCode) {
      case "STORE_NOT_FOUND":
        return "Store not found on server. Please enter a new cashier activation code.";
      case "REMOVED":
        return "Your cashier account was removed by the store owner.";
      case "DISABLED":
        return "Your cashier account was temporarily disabled by the store owner.";
      case "RESET":
        return "Cashier activation was reset by the store. Please reactivate.";
      case "SESSION_TAKEN_OVER":
        return "This cashier code was activated on another device. This session has been closed.";
      default:
        return "Cashier session is no longer valid. Please reactivate.";
    }
  };

  const applyVerifiedCashierSession = useCallback(
    (verifyJson: any): boolean => {
      if (!verifyJson?.success || !verifyJson.data) return true;
      const data = verifyJson.data;
      if (data.valid === false) {
        if (data.reasonCode === "STORE_NOT_FOUND") {
          return false;
        }
        forceDisconnectWithNotice(mapVerifyReasonToNotice(data.reasonCode));
        return false;
      }

      const serverCashier = data.cashier;
      const nextConfig = data.posConfig;
      const serverStore = data.store;

      setSession((prev) => {
        if (!prev) return prev;
        const nextCashier = serverCashier
          ? {
              ...prev.cashier,
              name: serverCashier.name ?? prev.cashier.name,
              phone: serverCashier.phone ?? prev.cashier.phone,
              role: serverCashier.role ?? prev.cashier.role,
              activationCode: undefined,
              hasPin: serverCashier.hasPin !== undefined ? serverCashier.hasPin : prev.cashier.hasPin,
              permissions: serverCashier.permissions || prev.cashier.permissions,
              status: serverCashier.status || prev.cashier.status
            }
          : prev.cashier;
        const nextStore = serverStore
          ? {
              ...prev.store,
              name: serverStore.name || prev.store.name,
              address: serverStore.address ?? prev.store.address,
              city: serverStore.city ?? prev.store.city,
              district: serverStore.district ?? prev.store.district,
              whatsapp: serverStore.whatsapp ?? prev.store.whatsapp,
              operatingHours: serverStore.operatingHours ?? prev.store.operatingHours,
              isOpen: serverStore.isOpen !== undefined ? serverStore.isOpen : prev.store.isOpen
            }
          : prev.store;
        const resolvedConfig = nextConfig || prev.posConfig;
        if (
          JSON.stringify(prev.posConfig) === JSON.stringify(resolvedConfig) &&
          JSON.stringify(prev.cashier) === JSON.stringify(nextCashier) &&
          prev.store.name === nextStore.name &&
          prev.store.address === nextStore.address &&
          prev.store.whatsapp === nextStore.whatsapp
        ) {
          return prev;
        }
        return {
          ...prev,
          activationCode: undefined,
          store: nextStore,
          posConfig: resolvedConfig,
          cashier: nextCashier
        };
      });

      return true;
    },
    [forceDisconnectWithNotice]
  );

  // Hydrate catalog, open shift, shift transactions, and verify active store/cashier session from backend
  const hydrateCashierState = useCallback(async (activeSession: CashierSession) => {
    setIsSyncing(true);
    const baseUrl = getApiBaseUrl();
    try {
      const [storeRes, verifyRes, shiftsRes, txRes] = await Promise.all([
        fetch(`${baseUrl}/api/market/stores/${activeSession.store.id}`),
        fetch(`${baseUrl}/api/market/pos/session/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            storeId: activeSession.store.id,
            cashierId: activeSession.cashier.id,
            sessionId: activeSession.sessionId,
            userEmail: resolvedUserEmail || undefined
          })
        }),
        fetch(
          `${baseUrl}/api/market/pos/shifts?storeId=${encodeURIComponent(activeSession.store.id)}&cashierId=${encodeURIComponent(activeSession.cashier.id)}&status=OPEN`
        ),
        fetch(
          `${baseUrl}/api/market/pos/transactions?storeId=${encodeURIComponent(activeSession.store.id)}`
        )
      ]);

      if (verifyRes.ok) {
        const verifyJson = await verifyRes.json();
        const stillValid = applyVerifiedCashierSession(verifyJson);
        if (!stillValid) return;
      }

      let loadedProducts: MerchantProduct[] = [];
      if (storeRes.ok) {
        const storeJson = await storeRes.json();
        if (storeJson.success && Array.isArray(storeJson.data?.items)) {
          loadedProducts = storeJson.data.items;
          setProducts(loadedProducts);
        }
      }

      if (shiftsRes.ok) {
        const shiftsJson = await shiftsRes.json();
        if (shiftsJson.success && Array.isArray(shiftsJson.data)) {
          setActiveShift(shiftsJson.data[0] || null);
        }
      }

      if (txRes.ok) {
        const txJson = await txRes.json();
        if (txJson.success && Array.isArray(txJson.data)) {
          setTransactions(
            txJson.data.map((raw: any) => mapServerTxToUiTransaction(raw, loadedProducts))
          );
        }
      }
    } catch {
      showToast("Failed to sync cashier data from server.");
    } finally {
      setIsSyncing(false);
      setHasHydrated(true);
    }
  }, [showToast, applyVerifiedCashierSession, resolvedUserEmail]);

  const validateCashierSession = useCallback(async (activeSession: CashierSession) => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/market/pos/session/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: activeSession.store.id,
          cashierId: activeSession.cashier.id,
          sessionId: activeSession.sessionId,
          userEmail: resolvedUserEmail || undefined
        })
      });
      if (!res.ok) return;
      const json = await res.json();
      applyVerifiedCashierSession(json);
    } catch {}
  }, [applyVerifiedCashierSession, resolvedUserEmail]);

  useEffect(() => {
    if (session || !resolvedUserEmail || skipAutoRecoverRef.current) {
      setIsRecovering(false);
      return;
    }

    let cancelled = false;
    setIsRecovering(true);

    fetch(
      `${getApiBaseUrl()}/api/market/pos/session/recover?email=${encodeURIComponent(resolvedUserEmail)}`
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (cancelled) return;
        const recovered = json?.data;
        if (json?.success && recovered?.store && recovered?.cashier) {
          setSessionNotice(null);
          setSession({
            sessionId: recovered.sessionId || recovered.cashier?.activeSessionId,
            store: {
              ...recovered.store,
              type: normalizeStoreType(recovered.store.type)
            },
            posConfig: recovered.posConfig,
            cashier: recovered.cashier
          });
          setActiveShift(recovered.activeShift || null);
          if (Array.isArray(recovered.items)) {
            setProducts(recovered.items);
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) {
          setIsRecovering(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [session, resolvedUserEmail]);

  const sessionStoreId = session?.store.id;
  const sessionCashierId = session?.cashier.id;

  useEffect(() => {
    if (session && sessionStoreId && sessionCashierId) {
      void hydrateCashierState(session);
    }
    // Intentionally key hydration on store/cashier identity rather than the full session object
    // so updating session.posConfig does not re-trigger an infinite sync loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionStoreId, sessionCashierId, hydrateCashierState]);

  // Periodically verify cashier account status & single-device activeSessionId against server
  useEffect(() => {
    if (!session || !sessionStoreId || !sessionCashierId) return;
    const runCheck = () => {
      void validateCashierSession(session);
    };
    const interval = setInterval(runCheck, 10000);
    window.addEventListener("focus", runCheck);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", runCheck);
    };
  }, [sessionStoreId, sessionCashierId, session?.sessionId, validateCashierSession]);

  useEffect(() => {
    const handlePosConfigUpdated = (event: Event) => {
      const detail = (event as CustomEvent)?.detail;
      if (detail?.storeId && detail.storeId === sessionStoreId && detail?.posConfig) {
        setSession((prev) => {
          if (!prev) return prev;
          if (JSON.stringify(prev.posConfig) === JSON.stringify(detail.posConfig)) {
            return prev;
          }
          return { ...prev, posConfig: detail.posConfig };
        });
      }
    };
    window.addEventListener("sera_pos_config_updated", handlePosConfigUpdated);
    return () => window.removeEventListener("sera_pos_config_updated", handlePosConfigUpdated);
  }, [sessionStoreId]);

  useEffect(() => {
    const syncLocalCatalog = (event?: Event) => {
      if (
        event instanceof StorageEvent &&
        event.key &&
        event.key !== "sera_merchant_products" &&
        event.key !== CASHIER_PRODUCTS_KEY
      ) {
        return;
      }
      const latest = readCachedJson<MerchantProduct[]>(
        "sera_merchant_products",
        readCachedJson<MerchantProduct[]>(CASHIER_PRODUCTS_KEY, [])
      );
      if (Array.isArray(latest) && latest.length > 0) {
        setProducts(latest);
      }
    };
    window.addEventListener("sera_merchant_products_updated", syncLocalCatalog);
    window.addEventListener("storage", syncLocalCatalog);
    return () => {
      window.removeEventListener("sera_merchant_products_updated", syncLocalCatalog);
      window.removeEventListener("storage", syncLocalCatalog);
    };
  }, []);

  // Native back button navigation stack
  useEffect(() => {
    const unregs: (() => void)[] = [];
    if (isKitchenReprintConfirmOpen) {
      unregs.push(
        registerBackHandler("cashier_kitchen_reprint", 91, () => {
          setIsKitchenReprintConfirmOpen(false);
          return true;
        })
      );
    }
    if (pendingVoidTx || billToCancelPin) {
      unregs.push(
        registerBackHandler("cashier_supervisor_pin", 92, () => {
          setPendingVoidTx(null);
          setBillToCancelPin(null);
          return true;
        })
      );
    }
    if (completedTransaction) {
      unregs.push(
        registerBackHandler("cashier_receipt", 90, () => {
          setCompletedTransaction(null);
          return true;
        })
      );
    }
    if (billToCancelConfirm) {
      unregs.push(
        registerBackHandler("cashier_cancel_bill_confirm", 88, () => {
          setBillToCancelConfirm(null);
          return true;
        })
      );
    }
    if (isPrinterModalOpen) {
      unregs.push(
        registerBackHandler("cashier_printer_modal", 85, () => {
          setIsPrinterModalOpen(false);
          return true;
        })
      );
    }
    if (isCashMovementOpen) {
      unregs.push(
        registerBackHandler("cashier_cash_movement", 82, () => {
          setIsCashMovementOpen(false);
          return true;
        })
      );
    }
    if (isPaymentModalOpen) {
      unregs.push(
        registerBackHandler("cashier_payment", 80, () => {
          setIsPaymentModalOpen(false);
          return true;
        })
      );
    }
    if (isCloseShiftOpen) {
      unregs.push(
        registerBackHandler("cashier_close_shift", 80, () => {
          setIsCloseShiftOpen(false);
          return true;
        })
      );
    }
    if (activeVariantProduct) {
      unregs.push(
        registerBackHandler("cashier_variant_modal", 75, () => {
          setActiveVariantProduct(null);
          return true;
        })
      );
    }
    if (isReportModalOpen) {
      unregs.push(
        registerBackHandler("cashier_report", 75, () => {
          setIsReportModalOpen(false);
          return true;
        })
      );
    }
    if (mobileCartOpen) {
      unregs.push(
        registerBackHandler("cashier_mobile_cart", 60, () => {
          setMobileCartOpen(false);
          return true;
        })
      );
    }
    return () => unregs.forEach((u) => u());
  }, [
    isKitchenReprintConfirmOpen,
    pendingVoidTx,
    billToCancelPin,
    completedTransaction,
    billToCancelConfirm,
    isPrinterModalOpen,
    isCashMovementOpen,
    isPaymentModalOpen,
    isCloseShiftOpen,
    activeVariantProduct,
    isReportModalOpen,
    mobileCartOpen
  ]);

  const handleBack = () => {
    if (dispatchBackButton()) return;
    onBack();
  };

  const { handleManualBarcodeScan } = usePosBarcodeScanner({
    products,
    onBarcodeDetected: (matched) => {
      playBeep();
      addToCart(matched);
      showToast(`+1 ${matched.name}`);
    },
    onBarcodeNotFound: (code) => {
      showToast(`Product barcode "${code}" not found`);
    }
  });

  const adaptiveMode = useAdaptivePosMode({
    storeId: session?.store?.id,
    storeType: session?.store?.type,
    products,
    socket,
    actorName: session?.cashier?.name || "Cashier",
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
  clearHeldBillRef.current = () => adaptiveMode.setActiveHeldBillId(null);

  const categoryList = useMemo(() => {
    const customCats = getStoreProductCategories(session?.store?.customCategories);
    const set = new Set<string>(customCats);
    const macroCategories = new Set(Object.values(STORE_CATEGORIES).flat());

    products.forEach((p) => {
      if (p.status === "DRAFT") return;
      const c = p.category?.trim();
      if (
        c &&
        c.toLowerCase() !== "umum" &&
        c.toLowerCase() !== "general" &&
        c !== session?.store?.category &&
        !macroCategories.has(c)
      ) {
        set.add(c);
      }
    });

    return ["ALL", ...Array.from(set)];
  }, [session?.store?.customCategories, session?.store?.category, products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (p.status === "DRAFT") return false;
      if (selectedCategory !== "ALL" && p.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          p.name.toLowerCase().includes(q) ||
          (p.barcode ? p.barcode.toLowerCase().includes(q) : false) ||
          (p.category ? p.category.toLowerCase().includes(q) : false)
        );
      }
      return true;
    });
  }, [products, selectedCategory, searchQuery]);

  const tenderedNum = parseInt(cashTendered.replace(/[^0-9]/g, ""), 10) || 0;
  const changeAmount = Math.max(0, tenderedNum - finalTotal);
  const isCashSufficient = tenderedNum >= finalTotal;

  const shiftCashSales = useMemo(() => {
    if (!activeShift) return 0;
    return transactions
      .filter(
        (tx) =>
          tx.status !== "VOIDED" &&
          (tx.shiftId ? tx.shiftId === activeShift.id : tx.createdAt >= activeShift.openedAt)
      )
      .reduce((sum, tx) => sum + getTransactionCashAmount(tx), 0);
  }, [transactions, activeShift]);

  const handleOpenShift = async (openingCash: number, notes?: string) => {
    if (!session) return;
    setIsSubmittingAction(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/market/pos/shifts/open`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: session.store.id,
          cashierId: session.cashier.id,
          cashierName: session.cashier.name,
          openingCash,
          notes
        })
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        showToast(json.error || "Failed to open cashier shift.");
        return;
      }
      setActiveShift(json.data);
      showToast("Cashier shift opened.");
    } catch {
      showToast("Failed to connect to server.");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleRecordCashMovement = async (type: "IN" | "OUT", amount: number, note: string) => {
    if (!activeShift) return;
    setIsSubmittingAction(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/market/pos/shifts/${activeShift.id}/cash-movement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, amount, note })
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        showToast(json.error || "Failed to record cash movement.");
        return;
      }
      setActiveShift(json.data);
      setIsCashMovementOpen(false);
      showToast(type === "IN" ? "Cash-in recorded." : "Cash-out recorded.");
    } catch {
      showToast("Failed to connect to server.");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleConfirmCloseShift = async (actualCash: number, notes?: string) => {
    if (!activeShift) return;
    setIsSubmittingAction(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/market/pos/shifts/${activeShift.id}/close`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actualCash, notes })
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        showToast(json.error || "Failed to close shift.");
        return;
      }
      const variance = Number(json.data?.shift?.cashVariance || 0);
      setActiveShift(null);
      setIsCloseShiftOpen(false);
      clearCart();
      showToast(
        variance === 0
          ? "Shift closed. Cash drawer balanced!"
          : `Shift closed. Drawer variance: Rp ${variance.toLocaleString("id-ID")}`
      );
    } catch {
      showToast("Failed to connect to server.");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleFinalizeTransaction = async (splitPayments?: PosPaymentPart[]) => {
    if (!session || !activeShift || cart.length === 0) return;
    const hasSplit = Array.isArray(splitPayments) && splitPayments.length > 1;
    if (!hasSplit && paymentMethod === "CASH" && !isCashSufficient) {
      showToast("Insufficient cash tendered!");
      return;
    }

    const totalSplitPaid = hasSplit
      ? splitPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0)
      : 0;

    setIsSubmittingAction(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/market/pos/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: session.store.id,
          shiftId: activeShift.id,
          cashierId: session.cashier.id,
          cashierName: session.cashier.name,
          tableOrQueueNumber: adaptiveMode.activeTableOrQueueLabel,
          items: cart.map((item) => ({
            itemId: item.product.id,
            name: item.product.name,
            variantId: item.variant?.id,
            variantName: item.variant?.name,
            price: item.variant ? item.variant.price : item.product.price,
            quantity: item.quantity,
            notes: item.notes?.trim() || undefined
          })),
          discountAmount: manualDiscountNominal,
          taxAmount,
          serviceChargeAmount,
          paymentMethod: hasSplit ? "SPLIT" : paymentMethod,
          payments: hasSplit ? splitPayments : undefined,
          amountPaid: hasSplit
            ? totalSplitPaid
            : paymentMethod === "CASH"
              ? tenderedNum
              : finalTotal
        })
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        showToast(json.error || "Failed to save transaction.");
        return;
      }

      const updatedCatalogMap = new Map<string, MerchantProduct>(
        (json.data.updatedItems || []).map((u: MerchantProduct) => [u.id, u])
      );
      const nextProducts = products.map((p) => updatedCatalogMap.get(p.id) || p);
      setProducts(nextProducts);

      const uiTx = mapServerTxToUiTransaction(json.data.transaction, nextProducts);
      setTransactions((prev) => [uiTx, ...prev]);
      setCompletedTransaction(uiTx);
      setIsPaymentModalOpen(false);
      adaptiveMode.clearActiveHeldBillAfterCheckout();
      clearCart();
      playBeep();
    } catch {
      showToast("Failed to save transaction to server.");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const executeVoidTransaction = async (tx: PosTransaction, supervisorPin?: string) => {
    if (!session) return;
    setIsSubmittingAction(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/market/pos/transactions/${tx.id}/void`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cashierId: session.cashier.id,
          voidedBy: session.cashier.name,
          supervisorPin
        })
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        if (String(json.error || "").toLowerCase().includes("pin")) {
          setPendingVoidTx(tx);
        }
        showToast(json.error || "Failed to void transaction.");
        return;
      }

      setTransactions((prev) =>
        prev.map((t) => (t.id === tx.id ? { ...t, status: "VOIDED" } : t))
      );
      setPendingVoidTx(null);
      void hydrateCashierState(session);
      playBeep();
      showToast(`Transaction ${tx.receiptNumber} voided & stock restored.`);
    } catch {
      showToast("Failed to connect to server.");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleRequestVoid = (tx: PosTransaction) => {
    if (!session?.cashier.permissions.canVoid) {
      setPendingVoidTx(tx);
      return;
    }
    void executeVoidTransaction(tx);
  };

  const allowOpenBill = session?.posConfig?.allowOpenBill !== false;

  const kitchenPlan = useMemo(() => computeKitchenTicketPlan(cart), [cart]);

  const cartKitchenTicketPayload: KitchenTicketPrintPayload | null = useMemo(() => {
    if (kitchenReprintPayload) return kitchenReprintPayload;
    if (!adaptiveMode.isFoodStore || !session || kitchenPlan.deltaItems.length === 0) return null;
    return {
      store: session.store,
      orderType: adaptiveMode.foodOrderType,
      tableLabel: adaptiveMode.activeTableOrQueueLabel,
      receiptOrBillNumber: adaptiveMode.activeTableBill?.id,
      actorName: session.cashier.name,
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
    session
  ]);

  const handlePrintCartKitchenTicket = async () => {
    if (!adaptiveMode.isFoodStore || !session || cart.length === 0) return;
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
      showToast(err instanceof Error ? err.message : "Failed to print kitchen ticket.");
    }
  };

  const handleConfirmFullKitchenReprint = async () => {
    setIsKitchenReprintConfirmOpen(false);
    if (!adaptiveMode.isFoodStore || !session || cart.length === 0) return;
    const fullPayload: KitchenTicketPrintPayload = {
      store: session.store,
      orderType: adaptiveMode.foodOrderType,
      tableLabel: adaptiveMode.activeTableOrQueueLabel,
      receiptOrBillNumber: adaptiveMode.activeTableBill?.id,
      actorName: session.cashier.name,
      items: cart,
      isReprint: true
    };
    setKitchenReprintPayload(fullPayload);
    await new Promise((resolve) => setTimeout(resolve, 60));
    try {
      const res = await printKitchenTicketHybrid(fullPayload);
      showToast(res.message);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to reprint kitchen ticket.");
    } finally {
      setKitchenReprintPayload(null);
    }
  };

  const finalizeCancelTableBill = async (bill: HeldPosBill, supervisorPin?: string) => {
    const res = await adaptiveMode.handleDeleteHeldBill(bill.id, {
      cashierId: session?.cashier?.id,
      supervisorPin
    });
    if (!res.ok) {
      showToast(res.error || "Invalid Supervisor PIN.");
      return false;
    }
    if (adaptiveMode.activeHeldBillId === bill.id) {
      adaptiveMode.setActiveHeldBillId(null);
      clearCart();
    }
    playBeep();
    showToast(`Open bill ${bill.label} cancelled.`);
    return true;
  };

  const handleRequestCancelTableBill = (bill: HeldPosBill) => {
    if (session?.cashier.permissions.canVoid) {
      setBillToCancelConfirm(bill);
      return;
    }
    setBillToCancelPin(bill);
  };

  const handleVerifyAndCancelTableBill = async (bill: HeldPosBill, supervisorPin: string) => {
    if (!session) return;
    setIsSubmittingAction(true);
    try {
      const ok = await finalizeCancelTableBill(bill, supervisorPin);
      if (ok) {
        setBillToCancelPin(null);
      }
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleDisconnect = () => {
    skipAutoRecoverRef.current = true;
    if (session?.store?.id && session?.cashier?.id) {
      fetch(`${getApiBaseUrl()}/api/market/pos/session/disconnect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          storeId: session.store.id,
          cashierId: session.cashier.id
        })
      }).catch(() => {});
    }
    forceDisconnectWithNotice(null);
  };

  if (!session) {
    if (isRecovering) {
      return (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: theme.bg,
            color: theme.inkSoft,
            fontSize: 13
          }}
        >
          Restoring cashier session...
        </div>
      );
    }
    return (
      <StoreCashierPairingGate
        theme={theme}
        isMobileView={isMobileView}
        userEmail={userEmail}
        notice={sessionNotice}
        onBack={handleBack}
        onActivateSuccess={({ session: nextSession, activeShift: openShift, items }) => {
          skipAutoRecoverRef.current = false;
          setSessionNotice(null);
          setSession(nextSession);
          setActiveShift(openShift);
          setProducts(items);
        }}
      />
    );
  }

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: theme.bg,
        height: "100%",
        minHeight: 0,
        width: "100%",
        overflowY: "auto",
        overflowX: "hidden",
        WebkitOverflowScrolling: "touch",
        overscrollBehaviorY: "contain",
        position: "relative"
      }}
    >
      {/* Toast Notification */}
      {toastMessage && (
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
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            pointerEvents: "none"
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* Compact Terminal Top Bar */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 25,
          background: theme.surface,
          borderBottom: `1px solid ${theme.border}`,
          padding: isMobileView ? "10px 12px" : "12px 22px",
          display: "flex",
          flexDirection: isMobileView ? "column" : "row",
          alignItems: isMobileView ? "stretch" : "center",
          justifyContent: "space-between",
          gap: isMobileView ? 8 : 10
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: 1 }}>
            <button
              type="button"
              onClick={handleBack}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: theme.inkSoft,
                padding: 4,
                display: "flex",
                borderRadius: 6,
                flexShrink: 0
              }}
            >
              <ArrowLeftIcon size={20} />
            </button>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: theme.ink,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}
              >
                {session.store.name}
              </div>
              {!isMobileView && (
                <div style={{ fontSize: 11, color: theme.inkSoft, display: "flex", alignItems: "center", gap: 6 }}>
                  <span>{session.cashier.name}</span>
                  {activeShift && (
                    <span style={{ color: "#10B981", fontWeight: 600 }}>
                      • Shift Active
                    </span>
                  )}
                  {isSyncing && <span>• Syncing...</span>}
                </div>
              )}
            </div>
          </div>

          {isMobileView && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
              {activeShift && (
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: "#10B981",
                    background: "rgba(16, 185, 129, 0.12)",
                    border: "1px solid rgba(16, 185, 129, 0.25)",
                    padding: "3px 8px",
                    borderRadius: 999,
                    whiteSpace: "nowrap"
                  }}
                >
                  {isSyncing ? "Syncing..." : "Shift Active"}
                </span>
              )}
              <button
                type="button"
                onClick={handleDisconnect}
                title="Disconnect Cashier Terminal"
                style={{
                  padding: "6px 8px",
                  borderRadius: 8,
                  border: `1px solid ${theme.border}`,
                  background: "transparent",
                  color: theme.inkSoft,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <LogOut size={15} />
              </button>
            </div>
          )}
        </div>

        {isMobileView && activeShift && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
              paddingTop: 6,
              borderTop: `1px solid ${theme.border}`
            }}
          >
            <div
              style={{
                fontSize: 11.5,
                color: theme.inkSoft,
                fontWeight: 500,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                minWidth: 0
              }}
            >
              Cashier: <strong style={{ color: theme.ink }}>{session.cashier.name}</strong>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
              <button
                type="button"
                onClick={() => setIsCashMovementOpen(true)}
                style={{
                  padding: "5px 9px",
                  borderRadius: 8,
                  border: `1px solid ${theme.border}`,
                  background: theme.surface2,
                  color: theme.ink,
                  fontSize: 11.5,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4
                }}
              >
                <Wallet size={13} />
                <span>Cash</span>
              </button>
              <button
                type="button"
                onClick={() => setIsCloseShiftOpen(true)}
                style={{
                  padding: "5px 9px",
                  borderRadius: 8,
                  border: "1px solid rgba(245, 158, 11, 0.35)",
                  background: "rgba(245, 158, 11, 0.12)",
                  color: "#F59E0B",
                  fontSize: 11.5,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4
                }}
              >
                <PowerOff size={13} />
                <span>Close Shift</span>
              </button>
            </div>
          </div>
        )}

        {!isMobileView && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            {activeShift && (
              <>
                <button
                  type="button"
                  onClick={() => setIsCashMovementOpen(true)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 8,
                    border: `1px solid ${theme.border}`,
                    background: theme.surface2,
                    color: theme.ink,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 5
                  }}
                >
                  <Wallet size={14} />
                  <span>Cash</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsCloseShiftOpen(true)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 8,
                    border: "1px solid rgba(245, 158, 11, 0.35)",
                    background: "rgba(245, 158, 11, 0.12)",
                    color: "#F59E0B",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 5
                  }}
                >
                  <PowerOff size={14} />
                  <span>Close Shift</span>
                </button>
              </>
            )}
            <button
              type="button"
              onClick={handleDisconnect}
              title="Disconnect Cashier Terminal"
              style={{
                padding: "6px 8px",
                borderRadius: 8,
                border: `1px solid ${theme.border}`,
                background: "transparent",
                color: theme.inkSoft,
                cursor: "pointer",
                display: "flex",
                alignItems: "center"
              }}
            >
              <LogOut size={15} />
            </button>
          </div>
        )}
      </div>

      {/* Body: Wait for initial check if no cached shift yet, else Open Shift or Terminal */}
      {!activeShift && !hasHydrated ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            color: theme.inkSoft
          }}
        >
          Loading cashier session...
        </div>
      ) : !activeShift ? (
        <OpenShiftView
          theme={theme}
          storeName={session.store.name}
          cashier={session.cashier}
          isSubmitting={isSubmittingAction}
          onOpenShift={handleOpenShift}
          onDisconnect={handleDisconnect}
        />
      ) : (
        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: isMobileView ? "column" : "row",
            gap: isMobileView ? 12 : 16,
            padding: isMobileView ? "10px 12px 96px" : "18px 22px",
            width: "100%",
            boxSizing: "border-box"
          }}
        >
          <PosProductGrid
            theme={theme}
            isMobileView={isMobileView}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            categoryList={categoryList}
            filteredProducts={filteredProducts}
            storeType={session.store.type}
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
            onOpenScanner={() => setIsScannerOpen(true)}
            onOpenReport={() => {
              if (!session.cashier.permissions.canViewDailyReport) {
                showToast("Cashier report access is restricted by the store owner.");
                return;
              }
              setIsReportModalOpen(true);
            }}
            onOpenPrinterSettings={() => setIsPrinterModalOpen(true)}
            onSelectProduct={(p) => {
              playBeep();
              addToCart(p);
              showToast(`+1 ${p.name}`);
            }}
            onSelectVariantModal={setActiveVariantProduct}
          />

          <PosCartDrawer
            theme={theme}
            storeType={session.store.type}
            foodOrderType={adaptiveMode.foodOrderType}
            isMobileView={Boolean(isMobileView)}
            isActive={true}
            cart={cart}
            mobileCartOpen={mobileCartOpen}
            onSetMobileCartOpen={setMobileCartOpen}
            totalItemCount={totalItemCount}
            finalTotal={finalTotal}
            totalDiscount={totalDiscount}
            manualDiscountNominal={manualDiscountNominal}
            showDiscountInput={showDiscountInput}
            onSetManualDiscountNominal={handleSetManualDiscount}
            onSetShowDiscountInput={handleSetShowDiscountInput}
            onUpdateQuantity={updateQuantity}
            onRemoveFromCart={removeFromCart}
            onClearCart={() => {
              clearCart();
              adaptiveMode.setActiveHeldBillId(null);
            }}
            allowManualDiscount={canManualDiscount}
            taxAmount={taxAmount}
            taxLabel={`Tax (${session.posConfig.taxPercent}%)`}
            serviceChargeAmount={serviceChargeAmount}
            serviceChargeLabel={`Service (${session.posConfig.serviceChargePercent}%)`}
            onUpdateItemNote={adaptiveMode.isFoodStore ? updateItemNote : undefined}
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
                  onCancelTableBill={handleRequestCancelTableBill}
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
            onOpenPayment={() => {
              if (cart.length === 0) return;
              setCashTendered(finalTotal.toString());
              setIsPaymentModalOpen(true);
            }}
          />
        </div>
      )}

      {/* Reused POS Modals */}
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

      <PosPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        theme={theme}
        store={session.store}
        finalTotal={finalTotal}
        totalItemCount={totalItemCount}
        paymentMethod={paymentMethod}
        onSetPaymentMethod={setPaymentMethod}
        cashTendered={cashTendered}
        onSetCashTendered={setCashTendered}
        isCashSufficient={isCashSufficient}
        changeAmount={changeAmount}
        tenderedNum={tenderedNum}
        onFinalizeTransaction={(splitPayments) => void handleFinalizeTransaction(splitPayments)}
      />

      <PosKitchenTicketPrint
        payload={completedTransaction ? null : cartKitchenTicketPayload}
      />

      <PosReceiptModal
        completedTransaction={completedTransaction}
        onClose={() => setCompletedTransaction(null)}
        theme={theme}
        store={session.store}
        onOpenPrinterSettings={() => setIsPrinterModalOpen(true)}
        onNotify={showToast}
      />

      {isPrinterModalOpen && (
        <PrinterSettingsModal
          isOpen={true}
          onClose={() => setIsPrinterModalOpen(false)}
          theme={theme}
          store={session.store}
          onNotify={showToast}
        />
      )}

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
        onUpdateManualDiscount={handleSetManualDiscount}
        totalAmount={finalTotal}
        totalCount={totalItemCount}
        onUpdateQty={updateQuantity}
        onRemoveItem={removeFromCart}
        onClearCart={clearCart}
        onProceedToPayment={() => {
          setIsScannerOpen(false);
          setCashTendered(finalTotal.toString());
          setIsPaymentModalOpen(true);
        }}
      />

      <PosReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        transactions={transactions}
        store={session.store}
        theme={theme}
        isMobileView={isMobileView}
        showProfitSummary={session.cashier.role === "SUPERVISOR"}
        onReprintReceipt={(tx) => {
          setCompletedTransaction(tx);
          setIsReportModalOpen(false);
        }}
        onVoidTransaction={handleRequestVoid}
        onNotify={showToast}
      />

      <CashMovementModal
        isOpen={isCashMovementOpen}
        theme={theme}
        isSubmitting={isSubmittingAction}
        onClose={() => setIsCashMovementOpen(false)}
        onSubmit={handleRecordCashMovement}
      />

      <CloseShiftModal
        isOpen={isCloseShiftOpen}
        shift={activeShift}
        cashSales={shiftCashSales}
        theme={theme}
        isSubmitting={isSubmittingAction}
        onClose={() => setIsCloseShiftOpen(false)}
        onConfirmClose={handleConfirmCloseShift}
      />

      <CancelTableBillModal
        bill={billToCancelConfirm}
        theme={theme}
        onClose={() => setBillToCancelConfirm(null)}
        onConfirm={() => {
          if (!billToCancelConfirm) return;
          void finalizeCancelTableBill(billToCancelConfirm);
          setBillToCancelConfirm(null);
        }}
      />

      <KitchenReprintConfirmModal
        isOpen={isKitchenReprintConfirmOpen}
        theme={theme}
        tableLabel={adaptiveMode.activeTableOrQueueLabel}
        onClose={() => setIsKitchenReprintConfirmOpen(false)}
        onConfirmReprint={() => void handleConfirmFullKitchenReprint()}
      />

      <SupervisorPinModal
        isOpen={Boolean(pendingVoidTx || billToCancelPin)}
        theme={theme}
        isSubmitting={isSubmittingAction}
        title={billToCancelPin ? `Authorize Cancel Bill ${billToCancelPin.label}` : undefined}
        description={
          billToCancelPin
            ? `Cancelling an occupied unpaid open table bill requires the Supervisor PIN from the store owner.`
            : undefined
        }
        confirmLabel={billToCancelPin ? "Authorize & Cancel Bill" : undefined}
        onClose={() => {
          setPendingVoidTx(null);
          setBillToCancelPin(null);
        }}
        onConfirm={async (pin) => {
          if (pendingVoidTx) {
            await executeVoidTransaction(pendingVoidTx, pin);
            return;
          }
          if (billToCancelPin) {
            await handleVerifyAndCancelTableBill(billToCancelPin, pin);
          }
        }}
      />
    </div>
  );
}
