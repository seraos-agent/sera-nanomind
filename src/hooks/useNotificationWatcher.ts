import { useEffect, useRef } from 'react';
import type { SidebarView } from '../components/sidebar/Sidebar';
import {
  initNativeNotificationListener,
  dispatchDirectNotification,
  type NotificationDeepLink,
} from '../utils/notificationService';

interface UseNotificationWatcherOptions {
  socket: any;
  onNavigate: (view: SidebarView) => void;
}

function formatRupiah(amount: number): string {
  try {
    return 'Rp ' + Number(amount || 0).toLocaleString('id-ID');
  } catch {
    return `Rp ${amount}`;
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'CONFIRMED':
      return 'Dikonfirmasi Toko';
    case 'PREPARING':
    case 'PROCESSING':
      return 'Sedang Diproses Toko';
    case 'SHIPPED':
      return 'Sedang Diantar Kurir';
    case 'DELIVERED':
      return 'Telah Tiba di Tujuan';
    case 'COMPLETED':
      return 'Selesai';
    case 'CANCELLED':
      return 'Dibatalkan';
    default:
      return status;
  }
}

export function useNotificationWatcher({ socket, onNavigate }: UseNotificationWatcherOptions) {
  const onNavigateRef = useRef(onNavigate);
  onNavigateRef.current = onNavigate;

  // 1. Initialize native Capacitor notification listeners on startup
  useEffect(() => {
    initNativeNotificationListener();
  }, []);

  // 2. Global deep-link routing listener
  useEffect(() => {
    const handleDeepLinkNav = (e: Event) => {
      const customEvent = e as CustomEvent<NotificationDeepLink>;
      const deepLink = customEvent.detail;
      if (!deepLink || !deepLink.view) return;

      // Navigate main container view
      onNavigateRef.current(deepLink.view as SidebarView);

      // Trigger targeted secondary events with slight tick to ensure mounted component receives it
      setTimeout(() => {
        if (deepLink.view === 'merchant') {
          window.dispatchEvent(
            new CustomEvent('sera:merchant-set-view', {
              detail: { view: deepLink.tab || 'orders', orderId: deepLink.orderId },
            })
          );
        } else if (deepLink.view === 'driver') {
          window.dispatchEvent(
            new CustomEvent('sera:driver-set-tab', {
              detail: { tab: deepLink.tab || 'ACTIVE', stopId: deepLink.stopId, orderId: deepLink.orderId },
            })
          );
        } else if (deepLink.view === 'marketplace') {
          window.dispatchEvent(
            new CustomEvent('sera:marketplace-deep-link', {
              detail: { tab: deepLink.tab || 'PROCESSING', orderId: deepLink.orderId },
            })
          );
        }
      }, 60);
    };

    window.addEventListener('sera:deep-link-navigation', handleDeepLinkNav);
    return () => {
      window.removeEventListener('sera:deep-link-navigation', handleDeepLinkNav);
    };
  }, []);

  // 3. Socket event listener for incoming marketplace orders (Merchant notification)
  useEffect(() => {
    if (!socket) return;

    const handleSocketNewOrder = (order: any) => {
      if (!order || !order.id) return;

      // Check if current user owns a merchant store
      let isMerchantOwner = false;
      try {
        const rawStore = localStorage.getItem('sera_merchant_store');
        if (rawStore) {
          const store = JSON.parse(rawStore);
          if (store && (!order.storeId || store.id === order.storeId || store.name === order.storeName)) {
            isMerchantOwner = true;
          }
        }
      } catch {}

      if (isMerchantOwner) {
        dispatchDirectNotification({
          title: 'Pesanan Baru Masuk!',
          body: `Pesanan #${order.id} sebesar ${formatRupiah(order.totalAmount)} diterima`,
          type: 'merchant_order',
          deepLink: {
            view: 'merchant',
            tab: 'orders',
            orderId: order.id,
          },
        });
      }
    };

    const handleSocketOrderStatus = (data: any) => {
      if (!data || !data.id) return;
      const orderId = String(data.id);
      const newStatus = data.orderStatus || data.status;

      // Check if current device is the buyer who placed this order
      let isBuyerOrder = false;
      try {
        const rawCustomerOrders = localStorage.getItem('sera_customer_orders');
        if (rawCustomerOrders) {
          const orders = JSON.parse(rawCustomerOrders);
          if (Array.isArray(orders) && orders.some((o: any) => o.id === orderId)) {
            isBuyerOrder = true;
          }
        }
      } catch {}

      if (isBuyerOrder) {
        const label = getStatusLabel(newStatus);
        dispatchDirectNotification({
          title: `Status Pesanan: ${label}`,
          body: `Pesanan #${orderId} kini ${label.toLowerCase()}`,
          type: 'buyer_order',
          deepLink: {
            view: 'marketplace',
            tab: 'PROCESSING',
            orderId,
          },
        });
      }
    };

    socket.on('market:new_order', handleSocketNewOrder);
    socket.on('market:order_status_updated', handleSocketOrderStatus);

    return () => {
      socket.off('market:new_order', handleSocketNewOrder);
      socket.off('market:order_status_updated', handleSocketOrderStatus);
    };
  }, [socket]);

  // 4. Local in-app events (courier delivery assignment & buyer order status sync)
  useEffect(() => {
    const notifiedDeliveryIds = new Set<string>();

    // New Courier Delivery Assignment
    const handleLocalNewDelivery = (e: Event) => {
      const customEvent = e as CustomEvent<any>;
      const order = customEvent.detail;
      if (!order || !order.id) return;
      if (notifiedDeliveryIds.has(order.id)) return;
      notifiedDeliveryIds.add(order.id);

      // Check if an authentic store courier session is registered on this device
      let isCourierRegistered = false;
      try {
        const rawDriver = localStorage.getItem('sera_driver_profile');
        if (rawDriver) {
          const driver = JSON.parse(rawDriver);
          if (
            driver &&
            driver.isStoreCourier &&
            driver.linkedStoreId &&
            driver.linkedStoreId !== 'toko-berkah-sembako' &&
            driver.id !== 'drv-771' &&
            (!order.storeId || order.storeId === driver.linkedStoreId)
          ) {
            isCourierRegistered = true;
          }
        }
      } catch {}

      if (isCourierRegistered) {
        const dest = order.shippingAddress || order.destAddress || order.customerName || 'Pelanggan';
        dispatchDirectNotification({
          title: 'Tugas Pengantaran Baru!',
          body: `Paket #${order.id} ke ${dest} siap diantar`,
          type: 'courier_delivery',
          deepLink: {
            view: 'driver',
            tab: 'ACTIVE',
            orderId: order.id,
          },
        });
      }
    };

    // Local Order Status Changed (e.g. merchant updates status locally)
    const handleLocalOrderStatus = (e: Event) => {
      const customEvent = e as CustomEvent<{ orderId: string; status: string }>;
      const { orderId, status } = customEvent.detail || {};
      if (!orderId || !status) return;

      let isBuyerOrder = false;
      try {
        const rawCustomerOrders = localStorage.getItem('sera_customer_orders');
        if (rawCustomerOrders) {
          const orders = JSON.parse(rawCustomerOrders);
          if (Array.isArray(orders) && orders.some((o: any) => o.id === orderId)) {
            isBuyerOrder = true;
          }
        }
      } catch {}

      if (isBuyerOrder) {
        const label = getStatusLabel(status);
        dispatchDirectNotification({
          title: `Status Pesanan: ${label}`,
          body: `Pesanan #${orderId} kini ${label.toLowerCase()}`,
          type: 'buyer_order',
          deepLink: {
            view: 'marketplace',
            tab: 'PROCESSING',
            orderId,
          },
        });
      }
    };

    // Local New Order Placed (for instant feedback when testing on same client)
    const handleLocalNewOrder = (e: Event) => {
      const customEvent = e as CustomEvent<any>;
      const order = customEvent.detail;
      if (!order || !order.id) return;

      let isMerchantOwner = false;
      try {
        const rawStore = localStorage.getItem('sera_merchant_store');
        if (rawStore) {
          const store = JSON.parse(rawStore);
          if (store && (!order.storeId || store.id === order.storeId || store.name === order.storeName)) {
            isMerchantOwner = true;
          }
        }
      } catch {}

      if (isMerchantOwner) {
        dispatchDirectNotification({
          title: 'Pesanan Baru Masuk!',
          body: `Pesanan #${order.id} sebesar ${formatRupiah(order.totalAmount)} diterima`,
          type: 'merchant_order',
          deepLink: {
            view: 'merchant',
            tab: 'orders',
            orderId: order.id,
          },
        });
      }
    };

    window.addEventListener('sera:new-delivery-order', handleLocalNewDelivery);
    window.addEventListener('sera:order-status-changed', handleLocalOrderStatus);
    window.addEventListener('sera:new-market-order', handleLocalNewOrder);

    return () => {
      window.removeEventListener('sera:new-delivery-order', handleLocalNewDelivery);
      window.removeEventListener('sera:order-status-changed', handleLocalOrderStatus);
      window.removeEventListener('sera:new-market-order', handleLocalNewOrder);
    };
  }, []);
}

