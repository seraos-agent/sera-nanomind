import { Clock, CheckCircle2, Truck, Bike, Store } from "lucide-react";
import type { ThemeType } from "../../../../../theme";
import type { MerchantOrder } from "../../../types";

interface OrderDetailActionBarProps {
  order: MerchantOrder;
  currentStatus: MerchantOrder["status"];
  isActionPending: boolean;
  setIsActionPending: (pending: boolean) => void;
  theme: ThemeType;
  onClose: () => void;
  onUpdateOrderStatus?: (orderId: string, nextStatus: MerchantOrder["status"]) => void | Promise<void>;
  onRequestCourier?: (order: MerchantOrder) => void | Promise<void>;
}

export function OrderDetailActionBar({
  order,
  currentStatus,
  isActionPending,
  setIsActionPending,
  theme,
  onClose,
  onUpdateOrderStatus,
  onRequestCourier,
}: OrderDetailActionBarProps) {
  if (currentStatus === "COMPLETED" || currentStatus === "CANCELLED") {
    return null;
  }

  return (
    <div
      style={{
        padding: "12px 18px",
        background: theme.surface,
        borderTop: `1px solid ${theme.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 10,
        flexShrink: 0
      }}
    >

      {onUpdateOrderStatus && (currentStatus === "PENDING" || currentStatus === "CONFIRMED") && (
        <button
          type="button"
          disabled={isActionPending}
          onClick={async () => {
            if (isActionPending) return;
            setIsActionPending(true);
            try {
              await onUpdateOrderStatus(order.id, "PROCESSING");
              onClose();
            } catch (err) {
              console.warn("Failed to process order:", err);
            } finally {
              setIsActionPending(false);
            }
          }}
          style={{
            padding: "9px 18px",
            borderRadius: 8,
            background: theme.accent,
            border: "none",
            color: "#FFFFFF",
            fontSize: 12.5,
            fontWeight: 700,
            cursor: isActionPending ? "not-allowed" : "pointer",
            opacity: isActionPending ? 0.7 : 1,
            display: "flex",
            alignItems: "center",
            gap: 6
          }}
        >
          <Clock size={14} />
          <span>{isActionPending ? "Memproses..." : "Proses Pesanan"}</span>
        </button>
      )}

      {currentStatus === "PROCESSING" && (
        order.shippingMethod === "PICKUP" ? (
          <button
            type="button"
            disabled={isActionPending}
            onClick={async () => {
              if (isActionPending) return;
              setIsActionPending(true);
              try {
                if (onUpdateOrderStatus) await onUpdateOrderStatus(order.id, "COMPLETED");
                onClose();
              } catch (err) {
                console.warn("Failed to complete pickup order:", err);
              } finally {
                setIsActionPending(false);
              }
            }}
            style={{
              padding: "9px 18px",
              borderRadius: 8,
              background: "#D97706",
              border: "none",
              color: "#FFFFFF",
              fontSize: 12.5,
              fontWeight: 700,
              cursor: isActionPending ? "not-allowed" : "pointer",
              opacity: isActionPending ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
          >
            <Store size={14} />
            <span>{isActionPending ? "Memproses..." : "Siap Diambil Pembeli"}</span>
          </button>
        ) : (
          <button
            type="button"
            disabled={isActionPending}
            onClick={async () => {
              if (isActionPending) return;
              setIsActionPending(true);
              try {
                if (onRequestCourier) await onRequestCourier(order);
                else if (onUpdateOrderStatus) await onUpdateOrderStatus(order.id, "SHIPPED");
                onClose();
              } catch (err) {
                console.warn("Failed to dispatch courier:", err);
              } finally {
                setIsActionPending(false);
              }
            }}
            style={{
              padding: "9px 18px",
              borderRadius: 8,
              background: order.shippingMethod === "STORE_DELIVERY" ? "#059669" : "#10B981",
              border: "none",
              color: "#FFFFFF",
              fontSize: 12.5,
              fontWeight: 700,
              cursor: isActionPending ? "not-allowed" : "pointer",
              opacity: isActionPending ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
          >
            {isActionPending ? (
              <span>Memanggil Kurir...</span>
            ) : order.shippingMethod === "STORE_DELIVERY" ? (
              <>
                <Truck size={14} />
                <span>Kirim via Kurir Toko</span>
              </>
            ) : (
              <>
                <Bike size={14} />
                <span>Panggil Mitra Kurir</span>
              </>
            )}
          </button>
        )
      )}

      {currentStatus === "SHIPPED" && (
        <button
          type="button"
          disabled={true}
          title="Menunggu kurir menyelesaikan pengantaran paket ke pembeli"
          style={{
            padding: "9px 18px",
            borderRadius: 8,
            background: theme.surface2,
            border: `1px solid ${theme.border}`,
            color: theme.inkSoft,
            fontSize: 12.5,
            fontWeight: 600,
            cursor: "not-allowed",
            opacity: 0.75,
            display: "flex",
            alignItems: "center",
            gap: 6
          }}
        >
          <Clock size={14} />
          <span>Menunggu Kurir...</span>
        </button>
      )}

      {currentStatus === "DELIVERED" && (
        <button
          type="button"
          disabled={isActionPending}
          onClick={async () => {
            if (isActionPending) return;
            setIsActionPending(true);
            try {
              if (onUpdateOrderStatus) await onUpdateOrderStatus(order.id, "COMPLETED");
              onClose();
            } catch (err) {
              console.warn("Failed to complete order:", err);
            } finally {
              setIsActionPending(false);
            }
          }}
          style={{
            padding: "9px 18px",
            borderRadius: 8,
            background: "#059669",
            border: "none",
            color: "#FFFFFF",
            fontSize: 12.5,
            fontWeight: 700,
            cursor: isActionPending ? "not-allowed" : "pointer",
            opacity: isActionPending ? 0.7 : 1,
            display: "flex",
            alignItems: "center",
            gap: 6
          }}
        >
          <CheckCircle2 size={14} />
          <span>{isActionPending ? "Menyelesaikan..." : "Selesaikan Pesanan"}</span>
        </button>
      )}
    </div>
  );
}
