import type {
  MerchantProduct,
  MerchantStore,
  PosBasePaymentMethod,
  PosPaymentMethodType,
  PosPaymentPart,
  PosTransaction,
  ProductVariant
} from "../merchant/types";

export interface CashierPermissions {
  canVoid: boolean;
  canDiscount: boolean;
  canViewDailyReport: boolean;
}

export interface CashierProfile {
  id: string;
  name: string;
  phone?: string;
  role: "CASHIER" | "SUPERVISOR";
  activationCode?: string;
  hasPin: boolean;
  permissions: CashierPermissions;
  status: "ACTIVE" | "SHIFT_OPEN" | "DISABLED";
  activeSessionId?: string;
}

export interface CashierPosConfig {
  taxEnabled: boolean;
  taxPercent: number;
  serviceChargeEnabled: boolean;
  serviceChargePercent: number;
  allowManualDiscount: boolean;
  allowOpenBill?: boolean;
  hasSupervisorPin: boolean;
}

export interface CashierCashMovement {
  id: string;
  type: "IN" | "OUT";
  amount: number;
  note: string;
  createdAt: number;
}

export interface CashierShift {
  id: string;
  storeId: string;
  cashierId: string;
  cashierName: string;
  status: "OPEN" | "CLOSED";
  openingCash: number;
  cashIn: number;
  cashOut: number;
  cashMovements: CashierCashMovement[];
  expectedCash?: number;
  actualCash?: number;
  cashVariance?: number;
  openedAt: number;
  closedAt?: number;
  notes?: string;
}

export interface CashierSession {
  activationCode?: string;
  sessionId?: string;
  store: MerchantStore;
  posConfig: CashierPosConfig;
  cashier: CashierProfile;
}

/**
 * Maps a server-side POS transaction into the UI PosTransaction format
 * consumed by PosReceiptModal and PosReportModal.
 */
export function mapServerTxToUiTransaction(
  raw: any,
  catalogProducts: MerchantProduct[]
): PosTransaction {
  const mappedItems = (Array.isArray(raw.items) ? raw.items : []).map((it: any) => {
    const found = catalogProducts.find((p) => p.id === it.itemId);
    const product: MerchantProduct = found || {
      id: it.itemId,
      storeId: raw.storeId || "",
      name: it.name || it.itemId,
      description: "",
      type: "GOODS",
      category: "Umum",
      price: Number(it.price || 0),
      currency: "IDR",
      rating: 5,
      images: [],
      location: ""
    };

    const variant: ProductVariant | undefined =
      it.variantName || it.variantId
        ? product.variants?.find((v) => v.id === it.variantId || v.name === it.variantName) || {
            id: it.variantId || it.variantName,
            name: it.variantName || it.variantId,
            price: Number(it.price || product.price),
            costPrice: it.costPrice !== undefined ? Number(it.costPrice) : undefined
          }
        : undefined;

    const resolvedCostPrice =
      it.costPrice !== undefined
        ? Number(it.costPrice)
        : variant?.costPrice ?? product.costPrice;

    return {
      product,
      variant,
      quantity: Number(it.quantity || 1),
      subtotal: Number(it.subtotal || 0),
      costPrice: resolvedCostPrice,
      notes: it.notes ? String(it.notes) : undefined
    };
  });

  const mappedPayments: PosPaymentPart[] | undefined = Array.isArray(raw.payments)
    ? raw.payments
        .filter((p: any) => p && Number(p.amount) > 0)
        .map((p: any) => {
          const base: PosBasePaymentMethod =
            p.method === "QRIS" ? "QRIS" : p.method === "TRANSFER" ? "TRANSFER" : "CASH";
          return { method: base, amount: Number(p.amount) };
        })
    : undefined;

  const normalizedMethod: PosPaymentMethodType =
    raw.paymentMethod === "SPLIT" || (mappedPayments && mappedPayments.length > 1)
      ? "SPLIT"
      : raw.paymentMethod === "QRIS"
        ? "QRIS"
        : raw.paymentMethod === "TRANSFER"
          ? "TRANSFER"
          : "CASH";

  return {
    id: raw.id,
    storeId: raw.storeId,
    receiptNumber: raw.receiptNumber || raw.id,
    items: mappedItems,
    subtotalAmount: raw.subtotal !== undefined ? Number(raw.subtotal) : undefined,
    taxAmount: raw.taxAmount !== undefined ? Number(raw.taxAmount) : undefined,
    serviceChargeAmount:
      raw.serviceChargeAmount !== undefined ? Number(raw.serviceChargeAmount) : undefined,
    totalAmount: Number(raw.totalAmount || 0),
    discountAmount: Number(raw.discountAmount || 0),
    paymentMethod: normalizedMethod,
    payments: mappedPayments,
    amountPaid: Number(raw.amountPaid || raw.totalAmount || 0),
    changeAmount: Number(raw.changeAmount || 0),
    customerName: raw.customerName || `Kasir: ${raw.cashierName || "Staf"}`,
    customerPhone: raw.customerPhone,
    tableOrQueueNumber: raw.tableOrQueueNumber,
    shiftId: raw.shiftId ? String(raw.shiftId) : undefined,
    cashierId: raw.cashierId ? String(raw.cashierId) : undefined,
    cashierName: raw.cashierName ? String(raw.cashierName) : undefined,
    createdAt: Number(raw.createdAt || Date.now()),
    status: raw.status === "VOIDED" ? "VOIDED" : "COMPLETED",
    voidReason: raw.voidReason
  };
}
