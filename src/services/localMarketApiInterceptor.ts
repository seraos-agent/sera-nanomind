import {
  DEMO_CASHIER_PROFILE,
  DEMO_CASHIER_SESSION,
  DEMO_CASHIER_SHIFT,
  DEMO_DRIVER_PROFILE,
  DEMO_POS_CONFIG,
  DEMO_POS_TRANSACTIONS,
  DEMO_PRODUCTS,
  DEMO_STORE,
  DEMO_STORE_ID,
} from './demoCommerceSeed';

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function parseBody(init?: RequestInit): any {
  if (!init?.body) return {};
  if (typeof init.body === 'string') {
    try {
      return JSON.parse(init.body);
    } catch {
      return {};
    }
  }
  return {};
}

const COMPLEMENTARY_STORES = [
  {
    id: 'nanomind-brew-gear',
    name: 'NanoMind Brew Gear',
    tagline: 'Precision Coffee Scales, Drippers & Ceramic Cups',
    description: 'Curated manual brewing tools and specialty coffee hardware for home baristas.',
    logoUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300',
    bannerUrl: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=900',
    type: 'GOODS',
    category: 'Hobbies & Lifestyle',
    rating: 4.9,
    totalProducts: 2,
    followers: 128,
    address: 'Jl. Surabaya No. 12, Klojen',
    city: 'Malang',
    isOpen: true,
    is24Hours: true,
    operatingHours: 'Every Day (24 Hours)',
    whatsapp: '081234567891',
    verified: true,
  },
  {
    id: 'nanomind-barista-care',
    name: 'Espresso Machine Care & Calibration',
    tagline: 'On-Site Boiler Descaling, Grinder Calibration & Maintenance',
    description: 'Certified technician service for commercial espresso machines and cafe grinders.',
    logoUrl: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=300',
    bannerUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=900',
    type: 'SERVICE',
    category: 'Electronics Repair & Maintenance',
    rating: 5.0,
    totalProducts: 1,
    followers: 64,
    address: 'Jl. Wilis No. 9, Malang',
    city: 'Malang',
    isOpen: true,
    is24Hours: true,
    operatingHours: 'Every Day (24 Hours)',
    whatsapp: '081234567892',
    verified: true,
  },
];

const COMPLEMENTARY_ITEMS = [
  {
    id: 'nm-gear-1',
    storeId: 'nanomind-brew-gear',
    storeName: 'NanoMind Brew Gear',
    name: 'Ceramic V60 Pour Over Dripper (02)',
    description: 'Heat-retaining ribbed ceramic dripper for clean, balanced manual extractions.',
    type: 'GOODS',
    category: 'Coffee Brewing Gear',
    price: 165000,
    currency: 'IDR',
    stock: 15,
    rating: 4.9,
    reviewsCount: 24,
    soldCount: 84,
    images: ['https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600'],
    location: 'Malang',
    tags: ['v60', 'dripper', 'brewing'],
    inStock: true,
  },
  {
    id: 'nm-gear-2',
    storeId: 'nanomind-brew-gear',
    storeName: 'NanoMind Brew Gear',
    name: 'Digital Espresso Precision Scale (0.1g)',
    description: 'Water-resistant coffee scale with integrated auto-tare and pour timer.',
    type: 'GOODS',
    category: 'Barista Equipment',
    price: 285000,
    currency: 'IDR',
    stock: 9,
    rating: 4.8,
    reviewsCount: 19,
    soldCount: 52,
    images: ['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600'],
    location: 'Malang',
    tags: ['scale', 'barista', 'equipment'],
    inStock: true,
  },
  {
    id: 'nm-srv-1',
    storeId: 'nanomind-barista-care',
    storeName: 'Espresso Machine Care & Calibration',
    name: 'Espresso Grouphead Tune-Up & Grinder Calibration',
    description: 'Full pressure check, gasket inspection, and burr alignment on-site at your cafe.',
    type: 'SERVICE',
    category: 'Electronics Repair & Maintenance',
    price: 250000,
    currency: 'IDR',
    duration: '90 mins',
    rating: 5.0,
    reviewsCount: 14,
    soldCount: 38,
    images: ['https://images.unsplash.com/photo-1511920170033-f8396924c348?w=600'],
    location: 'Malang',
    tags: ['service', 'electronics', 'espresso'],
    inStock: true,
  },
];

function buildMarketplaceProductFromMerchant(p: any, store: any) {
  return {
    id: p.id,
    storeId: p.storeId || store?.id || DEMO_STORE_ID,
    storeName: store?.name || DEMO_STORE.name,
    name: p.name,
    description: p.description || '',
    type: p.type === 'SERVICE' ? 'SERVICE' : 'GOODS',
    category: p.category || 'Signature Coffee',
    price: Number(p.price || 0),
    originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
    currency: 'IDR',
    stock: p.stock !== undefined ? Number(p.stock) : 20,
    barcode: p.barcode,
    rating: p.rating || 4.9,
    reviewsCount: 12,
    soldCount: p.soldCount ?? 42,
    images: Array.isArray(p.images) && p.images.length > 0 ? p.images : ['https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600'],
    badge: p.badge,
    status: p.status || 'ACTIVE',
    createdAt: p.createdAt || 0,
    location: store?.city || 'Malang',
    tags: [p.category || 'kopi', 'food'],
    inStock: (p.stock ?? 1) > 0,
    variants: p.variants,
  };
}

let isInstalled = false;

export function installLocalMarketApiInterceptor(): void {
  if (typeof window === 'undefined' || isInstalled) return;
  isInstalled = true;

  const nativeFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const rawUrl = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

    // Pass through non-API calls (CDN fonts, images, Firebase AI cloud endpoints, etc.)
    if (!rawUrl.includes('/api/')) {
      return nativeFetch(input, init);
    }

    const method = (init?.method || (input instanceof Request ? input.method : 'GET') || 'GET').toUpperCase();
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(rawUrl, window.location.origin);
    } catch {
      return nativeFetch(input, init);
    }

    const path = parsedUrl.pathname;
    const body = parseBody(init);

    const localStore = readJson<any>('sera_merchant_store', DEMO_STORE);
    const localProducts = readJson<any[]>('sera_merchant_products', DEMO_PRODUCTS);
    const localMerchantOrders = readJson<any[]>('sera_merchant_orders', []);
    const localCustomerOrders = readJson<any[]>('sera_customer_orders', []);
    const localShift = readJson<any>('sera_cashier_active_shift', DEMO_CASHIER_SHIFT);
    const localPosTxs = readJson<any[]>('sera_nanomind_pos_transactions', DEMO_POS_TRANSACTIONS);
    const localReviews = readJson<any[]>('sera_nanomind_reviews', [
      {
        id: 'rev-nm-1',
        storeId: DEMO_STORE_ID,
        itemId: 'nm-prod-1',
        itemName: 'Es Kopi Susu Gula Aren',
        customerName: 'Nadia Kusuma',
        rating: 5,
        comment: 'Smooth palm sugar balance, arrived warm/fresh quickly!',
        createdAt: Date.now() - 86400000,
      },
    ]);

    // 1. Upload media fallback (offline-safe data URL)
    if (path.startsWith('/api/upload/media')) {
      return jsonResponse({
        success: true,
        url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600',
      });
    }

    // 2. Profile sync
    if (path.startsWith('/api/profile')) {
      const savedProfile = readJson<any>('sera_user_profile_cache', {
        email: localStorage.getItem('sera_user_email') || 'founder@seraos.xyz',
        name: localStorage.getItem('sera_customer_name') || 'Kopi NanoMind Founder',
        phone: localStorage.getItem('sera_customer_phone') || '081234567890',
        address: localStorage.getItem('sera_customer_address') || 'Jl. Ijen Boulevard No. 24, Malang',
      });
      if (method === 'PUT' || method === 'POST' || method === 'PATCH') {
        const updated = { ...savedProfile, ...body };
        writeJson('sera_user_profile_cache', updated);
        return jsonResponse({ success: true, profile: updated, data: updated });
      }
      return jsonResponse({ success: true, profile: savedProfile, data: savedProfile });
    }

    // 3. POS Endpoints
    if (path === '/api/market/pos/activate' && method === 'POST') {
      const session = {
        sessionId: 'pos-session-nanomind-1',
        store: localStore,
        posConfig: DEMO_POS_CONFIG,
        cashier: DEMO_CASHIER_PROFILE,
        activeShift: localShift,
        items: localProducts,
      };
      writeJson('sera_cashier_session', session);
      return jsonResponse({ success: true, data: session });
    }

    if (path === '/api/market/pos/session/verify') {
      return jsonResponse({
        success: true,
        data: {
          valid: true,
          store: localStore,
          cashier: DEMO_CASHIER_PROFILE,
          posConfig: DEMO_POS_CONFIG,
        },
      });
    }

    if (path === '/api/market/pos/session/recover') {
      return jsonResponse({
        success: true,
        data: {
          ...DEMO_CASHIER_SESSION,
          store: localStore,
          activeShift: localShift,
          items: localProducts,
        },
      });
    }

    if (path === '/api/market/pos/session/disconnect') {
      return jsonResponse({ success: true });
    }

    if (path === '/api/market/pos/shifts' && method === 'GET') {
      const statusFilter = parsedUrl.searchParams.get('status');
      const shifts = localShift && (!statusFilter || localShift.status === statusFilter) ? [localShift] : [];
      return jsonResponse({ success: true, data: shifts });
    }

    if (path === '/api/market/pos/shifts/open' && method === 'POST') {
      const nextShift = {
        id: `shift-${Date.now()}`,
        storeId: body.storeId || localStore.id,
        cashierId: body.cashierId || DEMO_CASHIER_PROFILE.id,
        cashierName: body.cashierName || DEMO_CASHIER_PROFILE.name,
        status: 'OPEN',
        openingCash: Number(body.openingCash || 0),
        cashIn: 0,
        cashOut: 0,
        cashMovements: [],
        openedAt: Date.now(),
      };
      writeJson('sera_cashier_active_shift', nextShift);
      return jsonResponse({ success: true, data: nextShift });
    }

    if (path.match(/^\/api\/market\/pos\/shifts\/[^/]+\/cash-movement$/) && method === 'POST') {
      const movement = {
        id: `cm-${Date.now()}`,
        type: body.type === 'OUT' ? 'OUT' : 'IN',
        amount: Number(body.amount || 0),
        note: body.note || '',
        createdAt: Date.now(),
      };
      const updatedShift = {
        ...localShift,
        cashIn: movement.type === 'IN' ? (localShift.cashIn || 0) + movement.amount : (localShift.cashIn || 0),
        cashOut: movement.type === 'OUT' ? (localShift.cashOut || 0) + movement.amount : (localShift.cashOut || 0),
        cashMovements: [...(localShift.cashMovements || []), movement],
      };
      writeJson('sera_cashier_active_shift', updatedShift);
      return jsonResponse({ success: true, data: updatedShift });
    }

    if (path.match(/^\/api\/market\/pos\/shifts\/[^/]+\/close$/) && method === 'POST') {
      const closedShift = {
        ...localShift,
        status: 'CLOSED',
        actualCash: Number(body.actualCash || 0),
        closedAt: Date.now(),
        notes: body.notes,
      };
      writeJson('sera_cashier_active_shift', closedShift);
      return jsonResponse({ success: true, data: closedShift });
    }

    if (path === '/api/market/pos/transactions') {
      if (method === 'GET') {
        return jsonResponse({ success: true, data: localPosTxs });
      }
      if (method === 'POST') {
        const newTx = {
          id: body.id || `POS-NM-${Date.now().toString().slice(-4)}`,
          receiptNumber: body.receiptNumber || `POS-${Date.now()}`,
          createdAt: Date.now(),
          status: 'COMPLETED',
          ...body,
        };
        const nextTxs = [newTx, ...localPosTxs];
        writeJson('sera_nanomind_pos_transactions', nextTxs);
        return jsonResponse({ success: true, data: newTx });
      }
    }

    if (path.match(/^\/api\/market\/pos\/transactions\/[^/]+\/void$/) && method === 'POST') {
      const txId = path.split('/')[5];
      const nextTxs = localPosTxs.map((t: any) => (t.id === txId ? { ...t, status: 'VOIDED' } : t));
      writeJson('sera_nanomind_pos_transactions', nextTxs);
      return jsonResponse({ success: true });
    }

    // 4. Courier Endpoints
    if (path === '/api/market/stores/courier/pair' && method === 'POST') {
      return jsonResponse({
        success: true,
        data: {
          store: localStore,
          courier: localStore.linkedCouriers?.[0] || {
            id: DEMO_DRIVER_PROFILE.id,
            name: DEMO_DRIVER_PROFILE.name,
            phone: DEMO_DRIVER_PROFILE.phone,
            vehicleType: 'MOTOR',
            plateNumber: DEMO_DRIVER_PROFILE.plateNumber,
            activeSessionId: 'courier-session-nanomind-1',
          },
          sessionId: 'courier-session-nanomind-1',
        },
      });
    }

    if (path === '/api/market/stores/courier/session/verify') {
      return jsonResponse({
        success: true,
        data: {
          valid: true,
          store: localStore,
          courier: localStore.linkedCouriers?.[0] || {
            id: DEMO_DRIVER_PROFILE.id,
            name: DEMO_DRIVER_PROFILE.name,
            phone: DEMO_DRIVER_PROFILE.phone,
            vehicleType: 'MOTOR',
            plateNumber: DEMO_DRIVER_PROFILE.plateNumber,
            status: 'ONLINE',
          },
        },
      });
    }

    if (path === '/api/market/stores/courier/session/recover') {
      return jsonResponse({
        success: true,
        data: {
          store: localStore,
          courier: localStore.linkedCouriers?.[0] || DEMO_DRIVER_PROFILE,
          sessionId: 'courier-session-nanomind-1',
        },
      });
    }

    if (path === '/api/market/stores/courier/session/disconnect') {
      return jsonResponse({ success: true });
    }

    // 5. Stores & Store Sub-Resources
    if (path === '/api/market/stores') {
      if (method === 'GET') {
        const marketplaceLocalStore = {
          ...localStore,
          totalProducts: localProducts.length,
          type: localStore.type === 'JASA' ? 'SERVICE' : localStore.type === 'FOOD' ? 'FOOD' : 'GOODS',
          followers: 215,
        };
        return jsonResponse({
          success: true,
          data: [marketplaceLocalStore, ...COMPLEMENTARY_STORES],
        });
      }
      if (method === 'POST' || method === 'PUT') {
        const updatedStore = { ...localStore, ...body };
        writeJson('sera_merchant_store', updatedStore);
        return jsonResponse({ success: true, data: updatedStore });
      }
    }

    if (path.match(/^\/api\/market\/stores\/[^/]+$/)) {
      const storeId = path.split('/').pop();
      if (method === 'GET') {
        if (storeId === localStore.id) {
          return jsonResponse({
            success: true,
            data: {
              store: localStore,
              items: localProducts,
            },
          });
        }
        const compStore = COMPLEMENTARY_STORES.find((s) => s.id === storeId) || localStore;
        const compItems = COMPLEMENTARY_ITEMS.filter((i) => i.storeId === storeId);
        return jsonResponse({
          success: true,
          data: {
            store: compStore,
            items: compItems.length > 0 ? compItems : localProducts,
          },
        });
      }
      if (method === 'PUT' || method === 'PATCH') {
        const updatedStore = { ...localStore, ...body };
        writeJson('sera_merchant_store', updatedStore);
        return jsonResponse({ success: true, data: updatedStore });
      }
    }

    if (path.match(/^\/api\/market\/stores\/[^/]+\/pos-config$/)) {
      if (method === 'PUT' || method === 'POST') {
        const nextCfg = { ...DEMO_POS_CONFIG, ...body };
        return jsonResponse({ success: true, data: { posConfig: nextCfg, cashiers: [DEMO_CASHIER_PROFILE] } });
      }
      return jsonResponse({
        success: true,
        data: { posConfig: DEMO_POS_CONFIG, cashiers: [DEMO_CASHIER_PROFILE] },
      });
    }

    if (path.match(/^\/api\/market\/stores\/[^/]+\/pos-open-bills$/)) {
      return jsonResponse({ success: true, data: [] });
    }

    if (path.match(/^\/api\/market\/stores\/[^/]+\/courier-config$/)) {
      return jsonResponse({
        success: true,
        data: {
          courierConfig: localStore.courierConfig || DEMO_STORE.courierConfig,
          linkedCouriers: localStore.linkedCouriers || DEMO_STORE.linkedCouriers,
        },
      });
    }

    if (path.match(/^\/api\/market\/stores\/[^/]+\/courier\/[^/]+$/) && (method === 'PUT' || method === 'PATCH')) {
      const courierId = path.split('/').pop();
      const nextStatus = String(body.status || 'OFFLINE').toUpperCase() === 'ONLINE' ? 'ONLINE' : 'OFFLINE';
      const nextOnline = nextStatus === 'ONLINE';
      const updatedCouriers = Array.isArray(localStore.linkedCouriers)
        ? localStore.linkedCouriers.map((c: any) =>
            c.id === courierId ? { ...c, status: nextStatus } : c
          )
        : localStore.linkedCouriers;
      const updatedStore = { ...localStore, linkedCouriers: updatedCouriers };
      writeJson('sera_merchant_store', updatedStore);

      const savedDriver = readJson<any>('sera_driver_profile', null);
      if (savedDriver && savedDriver.id === courierId) {
        writeJson('sera_driver_profile', { ...savedDriver, isOnline: nextOnline });
      }
      try {
        localStorage.setItem('sera_driver_online_status', String(nextOnline));
      } catch {}

      return jsonResponse({ success: true, data: { id: courierId, status: nextStatus, isOnline: nextOnline } });
    }

    if (path.match(/^\/api\/market\/stores\/[^/]+\/status$/)) {
      const updatedStore = { ...localStore, ...body };
      writeJson('sera_merchant_store', updatedStore);
      return jsonResponse({ success: true, data: updatedStore });
    }

    // 6. Products
    if (path === '/api/market/products') {
      if (method === 'GET') {
        const storeFilter = parsedUrl.searchParams.get('storeId');
        const search = (parsedUrl.searchParams.get('search') || '').trim().toLowerCase();
        const mappedLocal = localProducts.map((p) => buildMarketplaceProductFromMerchant(p, localStore));
        let all = [...mappedLocal, ...COMPLEMENTARY_ITEMS];
        if (storeFilter) {
          all = all.filter((i) => i.storeId === storeFilter);
        }
        if (search) {
          all = all.filter(
            (i) =>
              i.name.toLowerCase().includes(search) ||
              i.description.toLowerCase().includes(search) ||
              i.category.toLowerCase().includes(search)
          );
        }
        return jsonResponse({
          success: true,
          data: all,
          hasMore: false,
          total: all.length,
        });
      }
      if (method === 'POST') {
        const newProd = {
          id: body.id || `nm-prod-${Date.now()}`,
          storeId: body.storeId || localStore.id,
          currency: 'IDR',
          rating: 5.0,
          location: localStore.city || 'Malang',
          ...body,
        };
        const updated = [newProd, ...localProducts];
        writeJson('sera_merchant_products', updated);
        writeJson('sera_cashier_products', updated);
        return jsonResponse({ success: true, data: newProd });
      }
    }

    if (path.match(/^\/api\/market\/products\/[^/]+$/)) {
      const prodId = path.split('/').pop();
      if (method === 'PUT' || method === 'PATCH') {
        const updated = localProducts.map((p) => (p.id === prodId ? { ...p, ...body } : p));
        writeJson('sera_merchant_products', updated);
        writeJson('sera_cashier_products', updated);
        return jsonResponse({ success: true, data: updated.find((p) => p.id === prodId) });
      }
      if (method === 'DELETE') {
        const updated = localProducts.filter((p) => p.id !== prodId);
        writeJson('sera_merchant_products', updated);
        writeJson('sera_cashier_products', updated);
        return jsonResponse({ success: true });
      }
    }

    // 7. Orders
    if (path === '/api/market/orders') {
      if (method === 'GET') {
        return jsonResponse({ success: true, data: localCustomerOrders });
      }
      if (method === 'POST') {
        const newOrder = {
          id: body.id || `ORD-NM-${Math.floor(100 + Math.random() * 900)}`,
          orderStatus: 'PENDING',
          createdAt: Date.now(),
          ...body,
        };
        writeJson('sera_customer_orders', [newOrder, ...localCustomerOrders]);
        return jsonResponse({ success: true, data: newOrder });
      }
    }

    if (path.match(/^\/api\/market\/orders\/[^/]+$/)) {
      const orderId = path.split('/').pop();
      const found = localCustomerOrders.find((o: any) => o.id === orderId) || localMerchantOrders.find((o: any) => o.id === orderId);
      return jsonResponse({ success: true, data: found || null });
    }

    if (path.match(/^\/api\/market\/orders\/[^/]+\/status$/)) {
      const orderId = path.split('/')[4];
      const nextStatus = body.status || body.orderStatus || 'PROCESSING';
      const updatedCustomer = localCustomerOrders.map((o: any) =>
        o.id === orderId ? { ...o, orderStatus: nextStatus } : o
      );
      const updatedMerchant = localMerchantOrders.map((o: any) =>
        o.id === orderId ? { ...o, status: nextStatus } : o
      );
      writeJson('sera_customer_orders', updatedCustomer);
      writeJson('sera_merchant_orders', updatedMerchant);
      return jsonResponse({ success: true, data: { id: orderId, status: nextStatus } });
    }

    // 8. Reviews
    if (path === '/api/market/reviews') {
      if (method === 'GET') {
        return jsonResponse({ success: true, data: localReviews });
      }
      if (method === 'POST') {
        const created = { id: `rev-${Date.now()}`, createdAt: Date.now(), ...body };
        writeJson('sera_nanomind_reviews', [created, ...localReviews]);
        return jsonResponse({ success: true, data: created });
      }
    }

    if (path.match(/^\/api\/market\/reviews\/[^/]+\/reply$/)) {
      const revId = path.split('/')[4];
      const updated = localReviews.map((r: any) =>
        r.id === revId ? { ...r, reply: { text: body.text || body.reply, repliedAt: Date.now() } } : r
      );
      writeJson('sera_nanomind_reviews', updated);
      return jsonResponse({ success: true });
    }

    // Graceful fallback for any other /api/ endpoint so offline mode never throws
    return jsonResponse({ success: true, data: {} });
  };
}
