import type { CartItem, MarketplaceOrder } from '../../types';
import { getMarketApiUrl } from '../../utils/api';

interface SubmitCheckoutParams {
  storeId: string;
  storeName: string;
  items: CartItem[];
  subtotal: number;
  deliveryOrServiceFee: number;
  totalAmount: number;
  name: string;
  phone: string;
  address: string;
  destCoords?: { lat: number; lng: number };
  bookingDate: string;
  notes: string;
  hasGoods: boolean;
  hasService: boolean;
  shippingMethod: 'STORE_DELIVERY' | 'SERA_INSTANT' | 'PICKUP';
  paymentMethod: 'QRIS' | 'DANA' | 'TRANSFER' | 'COD';
  paymentProof: string;
}

function buildFallbackOrder(params: SubmitCheckoutParams, idSuffix: 'ID' | 'LCL'): MarketplaceOrder {
  const {
    storeId, storeName, items, subtotal, deliveryOrServiceFee, totalAmount,
    name, phone, address, destCoords, bookingDate, notes, hasGoods, hasService,
    shippingMethod, paymentMethod, paymentProof
  } = params;

  return {
    id: `ORD-${Date.now().toString(36).toUpperCase()}-${idSuffix}`,
    storeId,
    storeName,
    items: items.map(c => ({
      itemId: c.item.id,
      name: c.selectedVariant ? `${c.item.name} (${c.selectedVariant.name})` : c.item.name,
      price: c.selectedVariant ? c.selectedVariant.price : c.item.price,
      quantity: c.quantity,
      type: c.item.type,
      imageUrl: c.selectedImage || c.item.images[0],
      bookingDate: c.bookingDate,
      notes: c.notes
    })),
    subtotal,
    deliveryOrServiceFee,
    totalAmount,
    customer: {
      name,
      phone,
      address: hasGoods ? (shippingMethod === 'PICKUP' ? 'In-Store Pickup' : address) : undefined,
      bookingDate: hasService ? bookingDate : undefined,
      notes,
      destCoords: hasGoods && shippingMethod !== 'PICKUP' ? destCoords : undefined
    },
    destCoords: hasGoods && shippingMethod !== 'PICKUP' ? destCoords : undefined,
    shippingMethod: hasGoods ? shippingMethod : undefined,
    paymentMethod,
    paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PAID',
    paymentProofUrl: paymentProof || undefined,
    orderStatus: 'CONFIRMED',
    createdAt: Date.now()
  };
}

function dispatchOrderCreatedEvents(order: MarketplaceOrder): void {
  try {
    window.dispatchEvent(new CustomEvent('sera:new-market-order', { detail: order }));
    window.dispatchEvent(new CustomEvent('sera:new-merchant-order', { detail: order }));
  } catch { }
}

export async function submitCheckoutOrder(params: SubmitCheckoutParams): Promise<MarketplaceOrder> {
  const {
    storeId, items, deliveryOrServiceFee, name, phone, address,
    destCoords, bookingDate, notes, hasGoods, hasService,
    shippingMethod, paymentMethod, paymentProof
  } = params;

  if (typeof window !== 'undefined') {
    try {
      if (name.trim()) localStorage.setItem('sera_customer_name', name.trim());
      if (phone.trim()) localStorage.setItem('sera_customer_phone', phone.trim());
      if (address.trim() && shippingMethod !== 'PICKUP') {
        localStorage.setItem('sera_customer_address', address.trim());
      }
    } catch { }
  }

  try {
    const res = await fetch(getMarketApiUrl('/api/market/orders'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        storeId,
        items: items.map(c => ({
          itemId: c.item.id,
          quantity: c.quantity,
          notes: c.notes,
          bookingDate: c.bookingDate,
          imageUrl: c.selectedImage || c.item.images[0],
          price: c.selectedVariant ? c.selectedVariant.price : c.item.price,
          name: c.selectedVariant ? `${c.item.name} (${c.selectedVariant.name})` : c.item.name
        })),
        customer: {
          name,
          phone,
          address: hasGoods ? (shippingMethod === 'PICKUP' ? 'In-Store Pickup' : address) : undefined,
          bookingDate: hasService ? bookingDate : undefined,
          notes,
          destCoords: hasGoods && shippingMethod !== 'PICKUP' ? destCoords : undefined
        },
        destCoords: hasGoods && shippingMethod !== 'PICKUP' ? destCoords : undefined,
        shippingMethod: hasGoods ? shippingMethod : undefined,
        shippingCost: deliveryOrServiceFee,
        paymentMethod,
        paymentProofUrl: paymentProof || undefined
      })
    });

    if (res.ok) {
      const json = await res.json();
      const serverOrder = json.data || {};
      const enrichedOrder: MarketplaceOrder = {
        ...serverOrder,
        destCoords: serverOrder.destCoords || serverOrder.customer?.destCoords || (hasGoods && shippingMethod !== 'PICKUP' ? destCoords : undefined),
        customer: {
          ...serverOrder.customer,
          name: serverOrder.customer?.name || name,
          phone: serverOrder.customer?.phone || phone,
          address:
            serverOrder.customer?.address ||
            (hasGoods ? (shippingMethod === 'PICKUP' ? 'In-Store Pickup' : address) : undefined),
          bookingDate: serverOrder.customer?.bookingDate || (hasService ? bookingDate : undefined),
          notes: serverOrder.customer?.notes || notes,
          destCoords: serverOrder.customer?.destCoords || (hasGoods && shippingMethod !== 'PICKUP' ? destCoords : undefined)
        },
        shippingMethod: serverOrder.shippingMethod || (hasGoods ? shippingMethod : undefined),
        paymentProofUrl: paymentProof || serverOrder.paymentProofUrl || undefined
      };
      dispatchOrderCreatedEvents(enrichedOrder);
      return enrichedOrder;
    }

    const fallbackOrder = buildFallbackOrder(params, 'ID');
    dispatchOrderCreatedEvents(fallbackOrder);
    return fallbackOrder;
  } catch {
    const fallbackOrder = buildFallbackOrder(params, 'LCL');
    dispatchOrderCreatedEvents(fallbackOrder);
    return fallbackOrder;
  }
}
