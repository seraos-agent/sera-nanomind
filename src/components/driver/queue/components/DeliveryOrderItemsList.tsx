import { parseOrderItems } from "../../../merchant/components/MerchantOrdersView";

interface DeliveryOrderItemsListProps {
  itemsSummary?: string;
  fontSize?: number;
  inkColor?: string;
  inkSoftColor?: string;
}

export function DeliveryOrderItemsList({
  itemsSummary,
  fontSize = 12.5,
  inkColor,
  inkSoftColor
}: DeliveryOrderItemsListProps) {
  const items = parseOrderItems(itemsSummary);
  if (items.length === 0) {
    return <div style={{ fontSize, color: inkColor, lineHeight: 1.4, fontWeight: 600 }}>Pesanan Toko</div>;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3.5 }}>
      {items.map((item, idx) => (
        <div
          key={idx}
          style={{
            fontSize,
            color: inkColor,
            fontWeight: 600,
            lineHeight: 1.45,
            display: "flex",
            alignItems: "baseline",
            gap: 6
          }}
        >
          <span
            style={{
              color: inkSoftColor || "#64748B",
              fontWeight: 700,
              fontSize: fontSize - 0.5,
              flexShrink: 0,
              whiteSpace: "nowrap",
              minWidth: items.length >= 10 ? 18 : 14
            }}
          >
            {idx + 1}.
          </span>
          <span style={{ flex: 1, wordBreak: "break-word" }}>{item}</span>
        </div>
      ))}
    </div>
  );
}
