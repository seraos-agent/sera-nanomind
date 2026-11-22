import React from "react";
import { parseOrderItems } from "../utils/orderItemParser";

interface OrderItemsListProps {
  itemsSummary?: string;
  fontSize?: number;
  inkColor?: string;
  inkSoftColor?: string;
}

export const OrderItemsList: React.FC<OrderItemsListProps> = ({
  itemsSummary,
  fontSize = 12.5,
  inkColor,
  inkSoftColor
}) => {
  const items = parseOrderItems(itemsSummary);
  if (items.length === 0) {
    return <div style={{ fontSize, color: inkColor, lineHeight: 1.4 }}>Pesanan Toko</div>;
  }
  if (items.length === 1) {
    return <div style={{ fontSize, color: inkColor, lineHeight: 1.4 }}>{items[0]}</div>;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3.5 }}>
      {items.map((item, idx) => (
        <div
          key={idx}
          style={{
            fontSize,
            color: inkColor,
            lineHeight: 1.4,
            display: "flex",
            alignItems: "flex-start",
            gap: 6
          }}
        >
          <span
            style={{
              color: inkSoftColor,
              fontWeight: 700,
              fontSize: fontSize - 1,
              minWidth: 14
            }}
          >
            {idx + 1}.
          </span>
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
};

