import React, { useState } from "react";
import { CheckCircle2, ChefHat, Printer, Share2, RotateCcw, Settings, X } from "lucide-react";
import type { ThemeType } from "../../../../../theme";
import type { MerchantStore, PosTransaction } from "../../../types";
import { getPaymentMethodDisplayLabel } from "../../../utils/posPaymentUtils";
import {
  printKitchenTicketHybrid,
  printPosReceiptHybrid
} from "../printing/thermalPrintService";
import { PosKitchenTicketPrint } from "./PosKitchenTicketPrint";

export interface PosReceiptModalProps {
  completedTransaction: PosTransaction | null;
  onClose: () => void;
  theme: ThemeType;
  store: MerchantStore | null;
  onOpenPrinterSettings?: () => void;
  onNotify?: (message: string) => void;
}

export const PosReceiptModal: React.FC<PosReceiptModalProps> = ({
  completedTransaction,
  onClose,
  theme,
  store,
  onOpenPrinterSettings,
  onNotify
}) => {
  const [showWhatsAppPrompt, setShowWhatsAppPrompt] = useState(false);
  const [customerWhatsApp, setCustomerWhatsApp] = useState("");
  const [isPrinting, setIsPrinting] = useState(false);
  const [printNote, setPrintNote] = useState<string | null>(null);

  if (!completedTransaction) return null;

  const isFoodStore = store?.type === "FOOD";
  const isSplitPayment =
    completedTransaction.paymentMethod === "SPLIT" &&
    Array.isArray(completedTransaction.payments) &&
    completedTransaction.payments.length > 0;

  const kitchenTicketPayload = isFoodStore
    ? {
        store,
        orderType:
          completedTransaction.tableOrQueueNumber === "Takeaway"
            ? ("TAKEAWAY" as const)
            : ("DINE_IN" as const),
        tableLabel: completedTransaction.tableOrQueueNumber,
        receiptOrBillNumber: completedTransaction.receiptNumber,
        actorName:
          completedTransaction.cashierName ||
          (completedTransaction.customerName?.startsWith("Kasir:") ||
          completedTransaction.customerName?.startsWith("Cashier:")
            ? completedTransaction.customerName.replace(/^(?:Kasir|Cashier):\s*/i, "")
            : undefined),
        items: completedTransaction.items,
        printedAt: completedTransaction.createdAt
      }
    : null;

  const handlePrintKitchenTicket = async () => {
    if (!kitchenTicketPayload) return;
    setIsPrinting(true);
    setPrintNote(null);
    try {
      const res = await printKitchenTicketHybrid(kitchenTicketPayload);
      setPrintNote(res.message);
      if (onNotify) onNotify(res.message);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to print kitchen ticket.";
      setPrintNote(msg);
      if (onNotify) onNotify(msg);
    } finally {
      setIsPrinting(false);
    }
  };

  const handlePrintReceipt = async () => {
    setIsPrinting(true);
    setPrintNote(null);
    try {
      const res = await printPosReceiptHybrid(completedTransaction, store);
      setPrintNote(res.message);
      if (onNotify) onNotify(res.message);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to print thermal receipt.";
      setPrintNote(msg);
      if (onNotify) onNotify(msg);
    } finally {
      setIsPrinting(false);
    }
  };

  const handleSendWhatsAppReceipt = () => {
    if (!completedTransaction || !customerWhatsApp.trim()) return;
    const cleanPhone = customerWhatsApp.replace(/[^0-9]/g, "");
    const targetNumber = cleanPhone.startsWith("0")
      ? `62${cleanPhone.slice(1)}`
      : cleanPhone;

    const itemsText = completedTransaction.items
      .map(
        (it) =>
          `• ${it.quantity}x ${it.product.name}${
            it.variant ? ` (${it.variant.name})` : ""
          } = Rp ${it.subtotal.toLocaleString("id-ID")}`
      )
      .join("\n");

    const totalDiscountSaved =
      completedTransaction.discountAmount !== undefined
        ? completedTransaction.discountAmount
        : completedTransaction.items.reduce((sum, it) => {
            if (it.product.originalPrice && it.product.originalPrice > it.product.price) {
              return sum + (it.product.originalPrice - it.product.price) * it.quantity;
            }
            return sum;
          }, 0);
    const savingsLine =
      totalDiscountSaved > 0
        ? `Savings: Rp ${totalDiscountSaved.toLocaleString("id-ID")}\n`
        : "";

    const paymentText = isSplitPayment
      ? `Split (${completedTransaction.payments!
          .map((p) => `${getPaymentMethodDisplayLabel(p.method)} Rp ${p.amount.toLocaleString("id-ID")}`)
          .join(" + ")})`
      : getPaymentMethodDisplayLabel(completedTransaction.paymentMethod);

    const cashChangeLine =
      completedTransaction.paymentMethod === "CASH"
        ? `Paid: Rp ${completedTransaction.amountPaid.toLocaleString(
            "id-ID"
          )}\nChange: Rp ${completedTransaction.changeAmount.toLocaleString("id-ID")}\n`
        : isSplitPayment && completedTransaction.changeAmount > 0
          ? `Change: Rp ${completedTransaction.changeAmount.toLocaleString("id-ID")}\n`
          : "";

    const tableLine = completedTransaction.tableOrQueueNumber
      ? `Table/Order: ${completedTransaction.tableOrQueueNumber}\n`
      : "";

    const taxServiceLines = `${
      completedTransaction.taxAmount && completedTransaction.taxAmount > 0
        ? `Tax: Rp ${completedTransaction.taxAmount.toLocaleString("id-ID")}\n`
        : ""
    }${
      completedTransaction.serviceChargeAmount && completedTransaction.serviceChargeAmount > 0
        ? `Service: Rp ${completedTransaction.serviceChargeAmount.toLocaleString("id-ID")}\n`
        : ""
    }`;

    const message = `*PURCHASE RECEIPT ${store?.name || "SERA MERCHANT"}*
Receipt No: ${completedTransaction.receiptNumber}
Date: ${new Date(completedTransaction.createdAt).toLocaleString("en-US")}
${tableLine}--------------------------------
${itemsText}
--------------------------------
${taxServiceLines}*Total: Rp ${completedTransaction.totalAmount.toLocaleString("id-ID")}*
${savingsLine}Method: ${paymentText}
${cashChangeLine}Thank you for shopping at ${store?.name}!`;

    const url = `https://wa.me/${targetNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
    setShowWhatsAppPrompt(false);
    setCustomerWhatsApp("");
  };

  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16
        }}
      >
        <div
          style={{
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: 18,
            width: "100%",
            maxWidth: 420,
            padding: 20,
            boxShadow: "0 25px 50px rgba(0,0,0,0.35)",
            display: "flex",
            flexDirection: "column",
            gap: 16
          }}
        >
          {/* Success Icon */}
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: theme.surface2,
                border: `1px solid ${theme.border}`,
                color: theme.ink,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 8
              }}
            >
              <CheckCircle2 size={26} />
            </div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: theme.ink }}>
              Transaction Completed!
            </h3>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: theme.inkSoft }}>
              Online catalog stock deducted automatically
            </p>
          </div>

          {/* Printable Receipt Paper Card */}
          <div
            id="sera-thermal-receipt"
            style={{
              background: "#FFFFFF",
              color: "#111827",
              border: "1px dashed #D1D5DB",
              borderRadius: 12,
              padding: "16px 14px",
              fontFamily: "monospace",
              fontSize: 12,
              display: "flex",
              flexDirection: "column",
              gap: 6
            }}
          >
            <div style={{ textAlign: "center", fontWeight: "bold", fontSize: 14 }}>
              {store?.name || "SERA MERCHANT"}
            </div>
            <div style={{ textAlign: "center", fontSize: 10, color: "#6B7280" }}>
              {store?.address || "Downtown"}
            </div>
            <div style={{ textAlign: "center", fontSize: 10, color: "#6B7280" }}>
              WA: {store?.whatsapp || "081234567890"}
            </div>
            <div style={{ borderTop: "1px dashed #9CA3AF", margin: "4px 0" }} />

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10 }}>
              <span>No: {completedTransaction.receiptNumber}</span>
              <span>{new Date(completedTransaction.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
            {completedTransaction.tableOrQueueNumber && (
              <div style={{ fontSize: 10, fontWeight: "bold" }}>
                Order: {completedTransaction.tableOrQueueNumber}
              </div>
            )}

            <div style={{ borderTop: "1px dashed #9CA3AF", margin: "4px 0" }} />

            {/* Items */}
            {completedTransaction.items.map((it, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", lineHeight: 1.3 }}>
                <div style={{ flex: 1, paddingRight: 8 }}>
                  {it.quantity}x {it.product.name}
                  {it.variant ? ` (${it.variant.name})` : ""}
                </div>
                <div style={{ fontWeight: "bold" }}>
                  Rp {it.subtotal.toLocaleString("id-ID")}
                </div>
              </div>
            ))}

            <div style={{ borderTop: "1px dashed #9CA3AF", margin: "4px 0" }} />

            {completedTransaction.taxAmount !== undefined && completedTransaction.taxAmount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#4B5563" }}>
                <span>Tax:</span>
                <span>Rp {completedTransaction.taxAmount.toLocaleString("id-ID")}</span>
              </div>
            )}
            {completedTransaction.serviceChargeAmount !== undefined && completedTransaction.serviceChargeAmount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#4B5563" }}>
                <span>Service Charge:</span>
                <span>Rp {completedTransaction.serviceChargeAmount.toLocaleString("id-ID")}</span>
              </div>
            )}

            {/* Totals */}
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: 13 }}>
              <span>TOTAL:</span>
              <span>Rp {completedTransaction.totalAmount.toLocaleString("id-ID")}</span>
            </div>

            {(() => {
              const totalSavings =
                completedTransaction.discountAmount !== undefined
                  ? completedTransaction.discountAmount
                  : completedTransaction.items.reduce((sum, it) => {
                      if (it.product.originalPrice && it.product.originalPrice > it.product.price) {
                        return sum + (it.product.originalPrice - it.product.price) * it.quantity;
                      }
                      return sum;
                    }, 0);
              if (totalSavings <= 0) return null;
              return (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#059669", fontWeight: "bold" }}>
                  <span>SAVED:</span>
                  <span>- Rp {totalSavings.toLocaleString("id-ID")}</span>
                </div>
              );
            })()}

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
              <span>Method:</span>
              <span>
                {isSplitPayment
                  ? "Split (2 Methods)"
                  : getPaymentMethodDisplayLabel(completedTransaction.paymentMethod)}
              </span>
            </div>

            {isSplitPayment &&
              completedTransaction.payments!.map((part, idx) => (
                <div
                  key={`${part.method}-${idx}`}
                  style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "#374151", paddingLeft: 8 }}
                >
                  <span>• {getPaymentMethodDisplayLabel(part.method)}:</span>
                  <span>Rp {part.amount.toLocaleString("id-ID")}</span>
                </div>
              ))}

            {completedTransaction.paymentMethod === "CASH" && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                  <span>Paid:</span>
                  <span>Rp {completedTransaction.amountPaid.toLocaleString("id-ID")}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: "bold" }}>
                  <span>Change:</span>
                  <span>Rp {completedTransaction.changeAmount.toLocaleString("id-ID")}</span>
                </div>
              </>
            )}

            {isSplitPayment && completedTransaction.changeAmount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: "bold" }}>
                <span>Change:</span>
                <span>Rp {completedTransaction.changeAmount.toLocaleString("id-ID")}</span>
              </div>
            )}

            <div style={{ borderTop: "1px dashed #9CA3AF", margin: "4px 0" }} />
            <div style={{ textAlign: "center", fontSize: 10, color: "#4B5563" }}>
              Thank you for your visit!
            </div>
          </div>

          {printNote && (
            <div
              style={{
                fontSize: 11,
                color: theme.inkSoft,
                background: theme.surface2,
                border: `1px solid ${theme.border}`,
                borderRadius: 8,
                padding: "6px 10px",
                textAlign: "center"
              }}
            >
              {printNote}
            </div>
          )}

          {/* Receipt Actions */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              disabled={isPrinting}
              onClick={handlePrintReceipt}
              style={{
                flex: 1,
                minWidth: 115,
                padding: "10px",
                borderRadius: 10,
                border: `1px solid ${theme.border}`,
                background: theme.surface2,
                color: theme.ink,
                fontSize: 12,
                fontWeight: 600,
                cursor: isPrinting ? "wait" : "pointer",
                opacity: isPrinting ? 0.7 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6
              }}
            >
              <Printer size={16} />
              <span>{isPrinting ? "Printing..." : "Print Receipt"}</span>
            </button>

            {isFoodStore && (
              <button
                type="button"
                disabled={isPrinting}
                onClick={handlePrintKitchenTicket}
                title="Print preparation ticket to kitchen/barista (no prices)"
                style={{
                  flex: 1,
                  minWidth: 115,
                  padding: "10px",
                  borderRadius: 10,
                  border: `1px solid ${theme.border}`,
                  background: theme.surface2,
                  color: theme.ink,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: isPrinting ? "wait" : "pointer",
                  opacity: isPrinting ? 0.7 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6
                }}
              >
                <ChefHat size={16} />
                <span>Kitchen Ticket</span>
              </button>
            )}

            {onOpenPrinterSettings && (
              <button
                type="button"
                onClick={onOpenPrinterSettings}
                title="Printer Settings"
                style={{
                  padding: "10px",
                  borderRadius: 10,
                  border: `1px solid ${theme.border}`,
                  background: theme.surface2,
                  color: theme.ink,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Settings size={16} />
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowWhatsAppPrompt(true)}
              style={{
                flex: 1,
                minWidth: 125,
                padding: "10px",
                borderRadius: 10,
                border: "none",
                background: "#25D366",
                color: "#FFFFFF",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6
              }}
            >
              <Share2 size={16} />
              <span>Send WhatsApp</span>
            </button>
          </div>

          <PosKitchenTicketPrint payload={kitchenTicketPayload} />

          {/* New Transaction Button */}
          <button
            type="button"
            onClick={onClose}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: 10,
              background: theme.isDark ? "#24282D" : "#191C1F",
              color: "#FFFFFF",
              border: "none",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              boxShadow: "0 2px 6px rgba(0,0,0,0.12)"
            }}
          >
            <RotateCcw size={16} />
            <span>New Transaction</span>
          </button>
        </div>
      </div>

      {/* PROMPT: Customer WhatsApp Input */}
      {showWhatsAppPrompt && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16
          }}
        >
          <div
            style={{
              background: theme.surface,
              border: `1px solid ${theme.border}`,
              borderRadius: 16,
              width: "100%",
              maxWidth: 360,
              padding: 18,
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: theme.ink }}>
                Send Receipt via WhatsApp
              </h4>
              <button
                type="button"
                onClick={() => setShowWhatsAppPrompt(false)}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: theme.inkSoft }}
              >
                <X size={18} />
              </button>
            </div>
            <p style={{ margin: "0 0 12px", fontSize: 12, color: theme.inkSoft }}>
              Enter the buyer's WhatsApp number to send their digital receipt:
            </p>
            <input
              type="tel"
              inputMode="numeric"
              placeholder="0812xxxxxxx"
              value={customerWhatsApp}
              onChange={(e) => setCustomerWhatsApp(e.target.value.replace(/\D/g, ""))}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: `1px solid ${theme.border}`,
                background: theme.surface2,
                color: theme.ink,
                fontSize: 14,
                fontWeight: 600,
                outline: "none",
                marginBottom: 12,
                boxSizing: "border-box"
              }}
            />
            <button
              type="button"
              disabled={!customerWhatsApp.trim()}
              onClick={handleSendWhatsAppReceipt}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: 8,
                border: "none",
                background: "#25D366",
                color: "#FFFFFF",
                fontSize: 13,
                fontWeight: 700,
                cursor: customerWhatsApp.trim() ? "pointer" : "not-allowed"
              }}
            >
              Send Receipt Now
            </button>
          </div>
        </div>
      )}
    </>
  );
};

