import { useState, useEffect, useCallback } from 'react';
import type { CartItem, MarketplaceItem, MarketplaceOrder } from '../types';
import { getMarketApiUrl } from '../utils/api';
import { safeSetStorage } from '../../../utils/safeStorage';

export function useMarketplaceCart(onToast?: (message: string) => void) {
  // Cart state persisted in localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('sera_market_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('sera_market_cart', JSON.stringify(cart));
    } catch {
      // Ignore storage write errors
    }
  }, [cart]);

  // Customer orders state persisted in localStorage
  const [customerOrders, setCustomerOrders] = useState<MarketplaceOrder[]>(() => {
    try {
      const saved = localStorage.getItem('sera_customer_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    safeSetStorage('sera_customer_orders', JSON.stringify(customerOrders));
  }, [customerOrders]);

  // Sync active customer orders in real-time from backend, storage, and custom events
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'sera_customer_orders' && e.newValue) {
        try {
          setCustomerOrders(JSON.parse(e.newValue));
        } catch { }
      }
    };
    window.addEventListener('storage', handleStorageChange);

    const syncOrdersWithBackend = async () => {
      try {
        const raw = localStorage.getItem('sera_customer_orders');
        if (!raw) return;
        const storedOrders: MarketplaceOrder[] = JSON.parse(raw);
        const activeOrders = storedOrders.filter(
          o => o.orderStatus !== 'COMPLETED' && o.orderStatus !== 'CANCELLED'
        );
        if (activeOrders.length === 0) return;

        let changed = false;
        const updated = await Promise.all(
          storedOrders.map(async (ord) => {
            if (ord.orderStatus === 'COMPLETED' || ord.orderStatus === 'CANCELLED') return ord;
            try {
              const res = await fetch(getMarketApiUrl(`/api/market/orders/${ord.id}`));
              if (res.ok) {
                const data = await res.json();
                if (data?.success && data?.data?.orderStatus && data.data.orderStatus !== ord.orderStatus) {
                  changed = true;
                  return { ...ord, orderStatus: data.data.orderStatus };
                }
              }
            } catch { }
            return ord;
          })
        );

        if (changed) {
          setCustomerOrders(updated);
          try {
            localStorage.setItem('sera_customer_orders', JSON.stringify(updated));
          } catch { }
        }
      } catch { }
    };

    syncOrdersWithBackend();
    const orderInterval = setInterval(syncOrdersWithBackend, 4000);

    const handleOrderStatusChanged = (e: any) => {
      const { orderId, status } = e.detail || {};
      if (!orderId || !status) return;
      setCustomerOrders(prev =>
        prev.map(o => (o.id === orderId ? { ...o, orderStatus: status } : o))
      );
    };
    window.addEventListener('sera:order-status-changed', handleOrderStatusChanged);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('sera:order-status-changed', handleOrderStatusChanged);
      clearInterval(orderInterval);
      window.removeEventListener('focus', syncOrdersWithBackend);
    };
  }, []);

  const addToCart = useCallback((
    item: MarketplaceItem,
    quantity: number = 1,
    selectedVariant?: { name: string; price: number },
    bookingDate?: string,
    notes?: string,
    selectedImage?: string
  ) => {
    const chosenImage = selectedImage || item.images[0];
    setCart(prev => {
      const existingIdx = prev.findIndex(c =>
        c.item.id === item.id &&
        c.selectedVariant?.name === selectedVariant?.name &&
        c.bookingDate === bookingDate &&
        (c.selectedImage || c.item.images[0]) === chosenImage
      );
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx].quantity += quantity;
        return updated;
      } else {
        return [...prev, { item, quantity, selectedVariant, bookingDate, notes, selectedImage: chosenImage }];
      }
    });

    if (onToast) onToast('✓ Added to cart');
  }, [onToast]);

  const updateQuantity = useCallback((index: number, newQty: number) => {
    if (newQty <= 0) {
      setCart(prev => prev.filter((_, i) => i !== index));
    } else {
      setCart(prev => {
        const updated = [...prev];
        if (updated[index]) {
          updated[index].quantity = newQty;
        }
        return updated;
      });
    }
  }, []);

  const removeItem = useCallback((index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  }, []);

  const completeOrder = useCallback((orderId: string) => {
    setCustomerOrders(prev => {
      const updated = prev.map(o =>
        o.id === orderId ? { ...o, orderStatus: 'COMPLETED' as const } : o
      );
      try {
        localStorage.setItem('sera_customer_orders', JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });

    if (onToast) {
      onToast('✓ Order completed! Feel free to leave a product review in the Completed tab.');
    }
  }, [onToast]);

  const addOrder = useCallback((order: MarketplaceOrder) => {
    setCustomerOrders(prev => [order, ...prev]);
  }, []);

  const removePurchasedItems = useCallback((purchased: CartItem[]) => {
    setCart(prev =>
      prev.filter(
        c =>
          !purchased.some(
            p =>
              p.item.id === c.item.id &&
              p.selectedVariant?.name === c.selectedVariant?.name &&
              (p.selectedImage || p.item.images[0]) === (c.selectedImage || c.item.images[0]) &&
              p.bookingDate === c.bookingDate
          )
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const totalCartCount = cart.reduce((acc, c) => acc + c.quantity, 0);

  return {
    cart,
    setCart,
    customerOrders,
    setCustomerOrders,
    addToCart,
    updateQuantity,
    removeItem,
    removePurchasedItems,
    completeOrder,
    addOrder,
    clearCart,
    totalCartCount,
  };
}
