import { useState, useMemo, useCallback } from "react";
import type { MerchantProduct, ProductVariant, PosCartItem } from "../../../types";

export interface UsePosCartProps {
  onNotify?: (message: string) => void;
}

export function usePosCart({ onNotify }: UsePosCartProps = {}) {
  const [cart, setCart] = useState<PosCartItem[]>([]);
  const [manualDiscountNominal, setManualDiscountNominal] = useState<number>(0);
  const [showDiscountInput, setShowDiscountInput] = useState<boolean>(false);

  const addToCart = useCallback(
    (product: MerchantProduct, variant?: ProductVariant) => {
      setCart((prev) => {
        const existingIdx = prev.findIndex(
          (item) =>
            item.product.id === product.id &&
            (variant ? item.variant?.id === variant.id : !item.variant)
        );

        const itemPrice = variant ? variant.price : product.price;

        if (existingIdx >= 0) {
          const next = [...prev];
          const currentQty = next[existingIdx].quantity;
          const maxStock = variant?.stock ?? product.stock ?? 9999;
          if (currentQty >= maxStock) {
            onNotify?.(`Stok ${product.name} telah mencapai batas maksimum (${maxStock})`);
            return prev;
          }
          next[existingIdx].quantity += 1;
          next[existingIdx].subtotal = next[existingIdx].quantity * itemPrice;
          return next;
        } else {
          const maxStock = variant?.stock ?? product.stock ?? 9999;
          if (maxStock <= 0) {
            onNotify?.(`Stok ${product.name} habis`);
            return prev;
          }
          return [
            ...prev,
            {
              product,
              variant,
              quantity: 1,
              subtotal: itemPrice
            }
          ];
        }
      });
    },
    [onNotify]
  );

  const updateQuantity = useCallback(
    (index: number, nextQty: number) => {
      setCart((prev) => {
        const next = [...prev];
        if (nextQty <= 0) {
          return next.filter((_, i) => i !== index);
        }
        const item = next[index];
        const maxStock = item.variant?.stock ?? item.product.stock ?? 9999;
        if (nextQty > maxStock) {
          onNotify?.(`Stok hanya tersisa ${maxStock}`);
          return prev;
        }
        const itemPrice = item.variant ? item.variant.price : item.product.price;
        item.quantity = nextQty;
        item.subtotal = nextQty * itemPrice;
        if (item.kitchenSentQty !== undefined) {
          item.kitchenSentQty = Math.min(item.kitchenSentQty, nextQty);
        }
        return next;
      });
    },
    [onNotify]
  );

  const removeFromCart = useCallback((index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateItemNote = useCallback((index: number, notes: string) => {
    setCart((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, notes } : item))
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setManualDiscountNominal(0);
    setShowDiscountInput(false);
  }, []);

  // Calculated totals
  const rawSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.subtotal, 0);
  }, [cart]);

  const productDiscountTotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      if (item.product.originalPrice && item.product.originalPrice > item.product.price) {
        return sum + (item.product.originalPrice - item.product.price) * item.quantity;
      }
      return sum;
    }, 0);
  }, [cart]);

  const totalDiscount = useMemo(() => {
    return productDiscountTotal + manualDiscountNominal;
  }, [productDiscountTotal, manualDiscountNominal]);

  const finalTotal = useMemo(() => {
    return Math.max(0, rawSubtotal - manualDiscountNominal);
  }, [rawSubtotal, manualDiscountNominal]);

  const totalItemCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  return {
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
    finalTotal,
    totalItemCount
  };
}

