import React from "react";
import type { KitchenTicketPrintPayload } from "../printing/printerTypes";

interface PosKitchenTicketPrintProps {
  payload: KitchenTicketPrintPayload | null;
}

/**
 * Off-screen thermal markup for Kitchen / Barista Order Tickets (OS system print fallback).
 */
export const PosKitchenTicketPrint: React.FC<PosKitchenTicketPrintProps> = ({ payload }) => {
  if (!payload || payload.items.length === 0) return null;

  const ts = payload.printedAt || Date.now();
  const timeStr = new Date(ts).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit"
  });
  const modeTitle =
    payload.orderType === "TAKEAWAY"
      ? "TAKEAWAY"
      : `DINE-IN: ${payload.tableLabel || "Table"}`;
  const totalPortions = payload.items.reduce((sum, it) => sum + it.quantity, 0);
  const ticketTitle = payload.isAdditionalOrder
    ? "TAMBAHAN DAPUR / BAR"
    : payload.isReprint
      ? "CETAK ULANG DAPUR"
      : "TIKET DAPUR / BARISTA";

  return (
    <div id="sera-thermal-kitchen-ticket" style={{ display: "none" }}>
      <div style={{ textAlign: "center", fontWeight: "bold", fontSize: 13 }}>
        {ticketTitle}
      </div>
      <div style={{ textAlign: "center", fontSize: 10 }}>
        {payload.store?.name || "RESTO SERA"}
      </div>
      <div style={{ borderTop: "1px dashed #000", margin: "4px 0" }} />
      <div style={{ textAlign: "center", fontWeight: "bold", fontSize: 14, padding: "2px 0" }}>
        {modeTitle}
      </div>
      {payload.isAdditionalOrder && (
        <div style={{ textAlign: "center", fontWeight: "bold", fontSize: 10 }}>
          &gt;&gt;&gt; PESANAN TAMBAHAN &lt;&lt;&lt;
        </div>
      )}
      <div style={{ borderTop: "1px dashed #000", margin: "4px 0" }} />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10 }}>
        <span>Jam: {timeStr}</span>
        {payload.actorName && <span>Staff: {payload.actorName}</span>}
      </div>
      {payload.receiptOrBillNumber && (
        <div style={{ fontSize: 10 }}>Ref: {payload.receiptOrBillNumber}</div>
      )}
      <div style={{ borderTop: "1px dashed #000", margin: "4px 0" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {payload.items.map((item, idx) => (
          <div key={`${item.product.id}-${item.variant?.id || "base"}-${idx}`}>
            <div style={{ fontWeight: "bold", fontSize: 12 }}>
              [ ] {item.quantity}x {item.product.name}
              {item.variant ? ` (${item.variant.name})` : ""}
            </div>
            {item.notes && item.notes.trim() && (
              <div style={{ fontSize: 10, paddingLeft: 14 }}>
                Catatan: {item.notes.trim()}
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{ borderTop: "1px dashed #000", margin: "4px 0" }} />
      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: 11 }}>
        <span>Total Porsi:</span>
        <span>{totalPortions} item</span>
      </div>
      <div style={{ borderTop: "1px dashed #000", margin: "4px 0" }} />
      <div style={{ textAlign: "center", fontSize: 9 }}>
        Segera diproses oleh dapur
      </div>
    </div>
  );
};
