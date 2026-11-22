import { useMemo } from "react";

export interface ProductDiscountResult {
  normalPriceNum: number;
  discVal: number;
  calculatedFinalPrice: number;
  savingsAmount: number;
  computedPercent: number;
  hasActiveDiscount: boolean;
}

export function useProductDiscount(
  normalPriceStr?: string,
  discountType: "%" | "nominal" = "%",
  discountValueStr?: string
): ProductDiscountResult {
  return useMemo(() => {
    const safePriceStr = String(normalPriceStr || "");
    const safeDiscStr = String(discountValueStr || "");
    const normalPriceNum = parseInt(safePriceStr.replace(/[^0-9]/g, ""), 10) || 0;
    const discVal = safeDiscStr.trim()
      ? parseFloat(safeDiscStr.replace(/[^0-9.]/g, ""))
      : 0;

    let calculatedFinalPrice = normalPriceNum > 0 ? normalPriceNum : 0;
    let savingsAmount = 0;
    let computedPercent = 0;
    const hasActiveDiscount = normalPriceNum > 0 && discVal > 0;

    if (hasActiveDiscount) {
      if (discountType === "%") {
        computedPercent = Math.min(99, Math.max(1, Math.round(discVal)));
        calculatedFinalPrice = Math.max(
          100,
          Math.round(normalPriceNum * (1 - computedPercent / 100))
        );
        savingsAmount = normalPriceNum - calculatedFinalPrice;
      } else {
        savingsAmount = Math.min(normalPriceNum - 100, Math.max(1, Math.round(discVal)));
        calculatedFinalPrice = Math.max(100, normalPriceNum - savingsAmount);
        computedPercent = Math.round((savingsAmount / normalPriceNum) * 100);
      }
    }

    return {
      normalPriceNum,
      discVal,
      calculatedFinalPrice,
      savingsAmount,
      computedPercent,
      hasActiveDiscount
    };
  }, [normalPriceStr, discountType, discountValueStr]);
}
