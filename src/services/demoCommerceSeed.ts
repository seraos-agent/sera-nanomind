import type {
  MerchantOrder,
  MerchantProduct,
  MerchantStore,
} from '../components/merchant/types';
import type {
  CashierPosConfig,
  CashierProfile,
  CashierSession,
  CashierShift,
} from '../components/cashier/types';
import type { DriverProfile } from '../components/driver/types';

export const DEMO_STORE_ID = 'kopi-nanomind-roastery';

export interface DemoTriggerItem {
  id: string;
  goalName?: string;
  cronExpression?: string;
  triggerType?: 'RECURRING' | 'THRESHOLD';
  state: 'ACTIVE' | 'COMPLETED';
  firePolicy: 'REPEAT' | 'ONCE';
  action: { type: string };
  condition: { humanIntent: string; internalCompiled?: string };
  lastFiredAt?: number;
  createdAt: number;
  nextRunAt?: string;
  description?: string;
}

export interface DemoOperatingAgreement {
  id: string;
  title: string;
  intent: string;
  mode: 'ASSISTANT' | 'FULL_ACCESS';
  scope?: string;
  status: 'ACTIVE' | 'REVOKED';
  lastActionSummary?: string;
  nextActionSummary?: string;
  createdAt: number;
  updatedAt: number;
}

export const DEMO_STORE: MerchantStore = {
  id: DEMO_STORE_ID,
  ownerId: 'founder@seraos.xyz',
  name: 'Kopi NanoMind Roastery',
  tagline: 'Specialty Coffee, Artisan Pastry & Local Hybrid AI Operations',
  description:
    'Independent specialty coffee roastery and bakery powered by offline-first hybrid POS, local courier dispatch, and on-device Gemini Nano intelligence.',
  logoUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300',
  bannerUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1000',
  type: 'FOOD',
  category: 'Kopi & Aneka Minuman',
  rating: 4.9,
  totalProducts: 8,
  address: 'Jl. Ijen Boulevard No. 24, Klojen',
  city: 'Malang',
  district: 'Klojen',
  village: 'Oro-oro Dowo',
  latitude: -7.9772,
  longitude: 112.6248,
  isOpen: true,
  isOpenManualOverride: true,
  operatingHours: 'Setiap Hari (24 Jam)',
  openTime: '07:00',
  closeTime: '22:00',
  openDays: ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU', 'MINGGU'],
  is24Hours: true,
  whatsapp: '081234567890',
  verified: true,
  bankName: 'BCA',
  danaPhone: '081234567890',
  danaName: 'Kopi NanoMind Roastery',
  acceptCod: true,
  customCategories: ['Signature Coffee', 'Artisan Pastry', 'Manual Brew', 'Coffee Beans'],
  shippingConfig: {
    seraInstant: true,
    selfPickup: true,
    regularCourier: false,
    storeDelivery: true,
    storeDeliveryPricingType: 'FLAT',
    storeDeliveryFee: 6000,
    storeDeliveryFeePerKm: 2500,
    storeDeliveryMaxRadius: 8,
    storeDeliveryNotes: 'Direct delivery by Kopi NanoMind internal courier fleet.',
    pickupInstructions: 'Show your order ID at the espresso bar counter.',
  },
  courierConfig: {
    enabled: true,
    pairingCode: 'KR-NANO01',
    pricingType: 'FLAT',
    flatRate: 6000,
    perKmRate: 2500,
    freeDeliveryThreshold: 100000,
    maxDistanceKm: 8,
    estimatedMinutes: '15-25 min',
    notes: 'Local internal delivery fleet',
  },
  linkedCouriers: [
    {
      id: 'drv-nanomind-1',
      name: 'Raka Aditya',
      phone: '081299887766',
      vehicleType: 'MOTOR',
      plateNumber: 'N 4421 AB',
      activationCode: 'KR-NANO01',
      hasPin: true,
      status: 'ONLINE',
      isActivated: true,
      activatedAt: Date.now() - 86400000,
      linkedAt: Date.now() - 86400000 * 3,
    },
  ],
  acceptedPayments: {
    qris: true,
    wallet: true,
    cod: true,
    transfer: true,
  },
  createdAt: Date.now() - 86400000 * 14,
};

export const DEMO_PRODUCTS: MerchantProduct[] = [
  {
    id: 'nm-prod-1',
    storeId: DEMO_STORE_ID,
    name: 'Es Kopi Susu Gula Aren',
    description: 'Double ristretto house blend with organic palm sugar and fresh silky milk.',
    type: 'GOODS',
    category: 'Signature Coffee',
    price: 22000,
    originalPrice: 25000,
    costPrice: 9500,
    currency: 'IDR',
    stock: 48,
    barcode: '899700100101',
    rating: 4.9,
    images: ['https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600'],
    badge: 'Bestseller',
    location: 'Malang',
  },
  {
    id: 'nm-prod-2',
    storeId: DEMO_STORE_ID,
    name: 'Matcha Oat Cold Whisk',
    description: 'Ceremonial grade Uji matcha whisked over oat milk and crystal ice.',
    type: 'GOODS',
    category: 'Signature Coffee',
    price: 28000,
    costPrice: 12000,
    currency: 'IDR',
    stock: 32,
    barcode: '899700100102',
    rating: 4.9,
    images: ['https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=600'],
    badge: 'Favorite',
    location: 'Malang',
  },
  {
    id: 'nm-prod-3',
    storeId: DEMO_STORE_ID,
    name: 'Artisanal Butter Croissant',
    description: 'Flaky 27-layer French cultured butter croissant baked fresh every morning.',
    type: 'GOODS',
    category: 'Artisan Pastry',
    price: 24000,
    costPrice: 10000,
    currency: 'IDR',
    stock: 18,
    barcode: '899700100103',
    rating: 4.8,
    images: ['https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600'],
    location: 'Malang',
  },
  {
    id: 'nm-prod-4',
    storeId: DEMO_STORE_ID,
    name: 'Japanese V60 Pour Over (Gayo)',
    description: 'Single-origin Aceh Gayo washed process brewed clean over crystal ice.',
    type: 'GOODS',
    category: 'Manual Brew',
    price: 32000,
    costPrice: 13000,
    currency: 'IDR',
    stock: 22,
    barcode: '899700100104',
    rating: 5.0,
    images: ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600'],
    badge: 'Single Origin',
    location: 'Malang',
  },
  {
    id: 'nm-prod-5',
    storeId: DEMO_STORE_ID,
    name: 'Pain au Chocolat',
    description: 'Laminated pastry filled with two batons of 70% dark Belgian chocolate.',
    type: 'GOODS',
    category: 'Artisan Pastry',
    price: 26000,
    costPrice: 11000,
    currency: 'IDR',
    stock: 14,
    barcode: '899700100105',
    rating: 4.8,
    images: ['https://images.unsplash.com/photo-1530610476181-d83430b64dcd?w=600'],
    location: 'Malang',
  },
  {
    id: 'nm-prod-6',
    storeId: DEMO_STORE_ID,
    name: 'Cold Brew Citrus Tonic',
    description: '18-hour cold-steeped Ethiopian beans layered with yuzu tonic water.',
    type: 'GOODS',
    category: 'Manual Brew',
    price: 30000,
    costPrice: 11500,
    currency: 'IDR',
    stock: 25,
    barcode: '899700100106',
    rating: 4.9,
    images: ['https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600'],
    location: 'Malang',
  },
  {
    id: 'nm-prod-7',
    storeId: DEMO_STORE_ID,
    name: 'House Blend Arabica Beans (250g)',
    description: 'Medium-dark roast Arabica beans with caramel, hazelnut, and cocoa notes.',
    type: 'GOODS',
    category: 'Coffee Beans',
    price: 85000,
    costPrice: 45000,
    currency: 'IDR',
    stock: 3,
    barcode: '899700100107',
    rating: 5.0,
    images: ['https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600'],
    badge: 'Low Stock',
    location: 'Malang',
  },
  {
    id: 'nm-prod-8',
    storeId: DEMO_STORE_ID,
    name: 'Oat Milk Barista Edition (1L)',
    description: 'Creamy plant-based barista oat milk crafted for silky microfoam.',
    type: 'GOODS',
    category: 'Coffee Beans',
    price: 42000,
    costPrice: 28000,
    currency: 'IDR',
    stock: 4,
    barcode: '899700100108',
    rating: 4.7,
    images: ['https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600'],
    badge: 'Low Stock',
    location: 'Malang',
  },
];

export const DEMO_CUSTOMER_ORDERS = [
  {
    id: 'ORD-NM-101',
    storeId: DEMO_STORE_ID,
    storeName: DEMO_STORE.name,
    items: [
      { itemId: 'nm-prod-1', name: 'Es Kopi Susu Gula Aren', price: 22000, quantity: 2, type: 'GOODS' },
      { itemId: 'nm-prod-3', name: 'Artisanal Butter Croissant', price: 24000, quantity: 1, type: 'GOODS' },
    ],
    subtotal: 68000,
    deliveryOrServiceFee: 6000,
    totalAmount: 74000,
    customer: {
      name: 'Nadia Kusuma',
      phone: '081233445566',
      address: 'Jl. Bandung No. 18, Klojen, Malang',
      notes: 'Less ice on both coffees please.',
      destCoords: { lat: -7.9685, lng: 112.6215 },
    },
    destCoords: { lat: -7.9685, lng: 112.6215 },
    paymentMethod: 'QRIS',
    paymentStatus: 'PAID',
    shippingMethod: 'STORE_DELIVERY',
    orderStatus: 'SHIPPED',
    createdAt: Date.now() - 1800000,
  },
  {
    id: 'ORD-NM-102',
    storeId: DEMO_STORE_ID,
    storeName: DEMO_STORE.name,
    items: [
      { itemId: 'nm-prod-2', name: 'Matcha Oat Cold Whisk', price: 28000, quantity: 2, type: 'GOODS' },
      { itemId: 'nm-prod-5', name: 'Pain au Chocolat', price: 26000, quantity: 2, type: 'GOODS' },
    ],
    subtotal: 108000,
    deliveryOrServiceFee: 6000,
    totalAmount: 114000,
    customer: {
      name: 'Arif Rahman',
      phone: '081355667788',
      address: 'Jl. Soekarno Hatta Kav. 9, Lowokwaru, Malang',
      notes: 'COD exact cash ready at lobby.',
      destCoords: { lat: -7.9467, lng: 112.6152 },
    },
    destCoords: { lat: -7.9467, lng: 112.6152 },
    paymentMethod: 'COD',
    paymentStatus: 'PENDING',
    shippingMethod: 'STORE_DELIVERY',
    orderStatus: 'SHIPPED',
    createdAt: Date.now() - 3600000,
  },
  {
    id: 'ORD-NM-103',
    storeId: DEMO_STORE_ID,
    storeName: DEMO_STORE.name,
    items: [
      { itemId: 'nm-prod-4', name: 'Japanese V60 Pour Over (Gayo)', price: 32000, quantity: 1, type: 'GOODS' },
      { itemId: 'nm-prod-7', name: 'House Blend Arabica Beans (250g)', price: 85000, quantity: 1, type: 'GOODS' },
    ],
    subtotal: 117000,
    deliveryOrServiceFee: 6000,
    totalAmount: 123000,
    customer: {
      name: 'Clara Wijaya',
      phone: '085711223344',
      address: 'Jl. Retawu No. 5, Malang',
      notes: 'Grind beans for V60 medium-fine.',
      destCoords: { lat: -7.9721, lng: 112.6194 },
    },
    destCoords: { lat: -7.9721, lng: 112.6194 },
    paymentMethod: 'QRIS',
    paymentStatus: 'PAID',
    shippingMethod: 'STORE_DELIVERY',
    orderStatus: 'PROCESSING',
    createdAt: Date.now() - 900000,
  },
  {
    id: 'ORD-NM-104',
    storeId: DEMO_STORE_ID,
    storeName: DEMO_STORE.name,
    items: [
      { itemId: 'nm-prod-6', name: 'Cold Brew Citrus Tonic', price: 30000, quantity: 2, type: 'GOODS' },
    ],
    subtotal: 60000,
    deliveryOrServiceFee: 0,
    totalAmount: 60000,
    customer: {
      name: 'Dimas Pratama',
      phone: '081900112233',
      address: 'Ambil di Toko',
      notes: 'Pickup at counter in 10 mins.',
    },
    paymentMethod: 'QRIS',
    paymentStatus: 'PAID',
    shippingMethod: 'PICKUP',
    orderStatus: 'COMPLETED',
    createdAt: Date.now() - 7200000,
  },
];

export const DEMO_MERCHANT_ORDERS: MerchantOrder[] = [
  {
    id: 'ORD-NM-101',
    customerName: 'Nadia Kusuma',
    customerPhone: '081233445566',
    itemsSummary: 'Es Kopi Susu Gula Aren (2x), Artisanal Butter Croissant (1x)',
    totalAmount: 74000,
    paymentMethod: 'QRIS',
    paymentStatus: 'PAID',
    status: 'SHIPPED',
    createdAt: '22/11/26 • 05:30',
    shippingMethod: 'STORE_DELIVERY',
    shippingAddress: 'Jl. Bandung No. 18, Klojen, Malang',
    destCoords: { lat: -7.9685, lng: 112.6215 },
    shippingCost: 6000,
    courierName: 'Raka Aditya',
    customerNote: 'Less ice on both coffees please.',
    orderSource: 'ONLINE',
  },
  {
    id: 'ORD-NM-102',
    customerName: 'Arif Rahman',
    customerPhone: '081355667788',
    itemsSummary: 'Matcha Oat Cold Whisk (2x), Pain au Chocolat (2x)',
    totalAmount: 114000,
    paymentMethod: 'COD',
    paymentStatus: 'PENDING',
    status: 'SHIPPED',
    createdAt: '22/11/26 • 05:00',
    shippingMethod: 'STORE_DELIVERY',
    shippingAddress: 'Jl. Soekarno Hatta Kav. 9, Lowokwaru, Malang',
    destCoords: { lat: -7.9467, lng: 112.6152 },
    shippingCost: 6000,
    courierName: 'Raka Aditya',
    customerNote: 'COD exact cash ready at lobby.',
    orderSource: 'ONLINE',
  },
  {
    id: 'ORD-NM-103',
    customerName: 'Clara Wijaya',
    customerPhone: '085711223344',
    itemsSummary: 'Japanese V60 Pour Over (1x), House Blend Arabica Beans (1x)',
    totalAmount: 123000,
    paymentMethod: 'QRIS',
    paymentStatus: 'PAID',
    status: 'PROCESSING',
    createdAt: '22/11/26 • 05:45',
    shippingMethod: 'STORE_DELIVERY',
    shippingAddress: 'Jl. Retawu No. 5, Malang',
    destCoords: { lat: -7.9721, lng: 112.6194 },
    shippingCost: 6000,
    customerNote: 'Grind beans for V60 medium-fine.',
    orderSource: 'ONLINE',
  },
  {
    id: 'ORD-NM-104',
    customerName: 'Dimas Pratama',
    customerPhone: '081900112233',
    itemsSummary: 'Cold Brew Citrus Tonic (2x)',
    totalAmount: 60000,
    paymentMethod: 'QRIS',
    paymentStatus: 'PAID',
    status: 'COMPLETED',
    createdAt: '22/11/26 • 04:15',
    shippingMethod: 'PICKUP',
    shippingAddress: 'Ambil di Toko',
    shippingCost: 0,
    orderSource: 'ONLINE',
  },
];

export const DEMO_POS_CONFIG: CashierPosConfig = {
  taxEnabled: false,
  taxPercent: 11,
  serviceChargeEnabled: false,
  serviceChargePercent: 5,
  allowManualDiscount: true,
  allowOpenBill: true,
  hasSupervisorPin: true,
};

export const DEMO_CASHIER_PROFILE: CashierProfile = {
  id: 'cashier-nanomind-1',
  name: 'Salsa Kirana (Barista & POS)',
  phone: '081234567801',
  role: 'SUPERVISOR',
  activationCode: 'KS-NANO01',
  hasPin: true,
  permissions: {
    canVoid: true,
    canDiscount: true,
    canViewDailyReport: true,
  },
  status: 'SHIFT_OPEN',
  activeSessionId: 'pos-session-nanomind-1',
};

export const DEMO_CASHIER_SESSION: CashierSession = {
  activationCode: 'KS-NANO01',
  sessionId: 'pos-session-nanomind-1',
  store: DEMO_STORE,
  posConfig: DEMO_POS_CONFIG,
  cashier: DEMO_CASHIER_PROFILE,
};

export const DEMO_CASHIER_SHIFT: CashierShift = {
  id: 'shift-nanomind-1',
  storeId: DEMO_STORE_ID,
  cashierId: 'cashier-nanomind-1',
  cashierName: 'Salsa Kirana (Barista & POS)',
  status: 'OPEN',
  openingCash: 500000,
  cashIn: 94000,
  cashOut: 25000,
  cashMovements: [
    {
      id: 'cm-1',
      type: 'OUT',
      amount: 25000,
      note: 'Restock crystal ice bags (petty cash)',
      createdAt: Date.now() - 5400000,
    },
  ],
  openedAt: Date.now() - 14400000,
};

export const DEMO_POS_TRANSACTIONS = [
  {
    id: 'POS-NM-001',
    storeId: DEMO_STORE_ID,
    receiptNumber: 'POS-20261122-001',
    shiftId: 'shift-nanomind-1',
    cashierId: 'cashier-nanomind-1',
    cashierName: 'Salsa Kirana',
    tableOrQueueNumber: 'Meja 2',
    customerName: 'Andi Wijaya',
    paymentMethod: 'CASH',
    subtotal: 68000,
    discountAmount: 0,
    taxAmount: 0,
    serviceChargeAmount: 0,
    totalAmount: 68000,
    amountPaid: 100000,
    changeAmount: 32000,
    status: 'COMPLETED',
    createdAt: Date.now() - 10800000,
    items: [
      { itemId: 'nm-prod-1', name: 'Es Kopi Susu Gula Aren', price: 22000, quantity: 2, subtotal: 44000 },
      { itemId: 'nm-prod-3', name: 'Artisanal Butter Croissant', price: 24000, quantity: 1, subtotal: 24000 },
    ],
  },
  {
    id: 'POS-NM-002',
    storeId: DEMO_STORE_ID,
    receiptNumber: 'POS-20261122-002',
    shiftId: 'shift-nanomind-1',
    cashierId: 'cashier-nanomind-1',
    cashierName: 'Salsa Kirana',
    tableOrQueueNumber: 'Takeaway',
    customerName: 'Bima Putra',
    paymentMethod: 'QRIS',
    subtotal: 60000,
    discountAmount: 0,
    taxAmount: 0,
    serviceChargeAmount: 0,
    totalAmount: 60000,
    amountPaid: 60000,
    changeAmount: 0,
    status: 'COMPLETED',
    createdAt: Date.now() - 7200000,
    items: [
      { itemId: 'nm-prod-4', name: 'Japanese V60 Pour Over (Gayo)', price: 32000, quantity: 1, subtotal: 32000 },
      { itemId: 'nm-prod-2', name: 'Matcha Oat Cold Whisk', price: 28000, quantity: 1, subtotal: 28000 },
    ],
  },
  {
    id: 'POS-NM-003',
    storeId: DEMO_STORE_ID,
    receiptNumber: 'POS-20261122-003',
    shiftId: 'shift-nanomind-1',
    cashierId: 'cashier-nanomind-1',
    cashierName: 'Salsa Kirana',
    tableOrQueueNumber: 'Meja 5',
    customerName: 'Rina Lestari',
    paymentMethod: 'CASH',
    subtotal: 26000,
    discountAmount: 0,
    taxAmount: 0,
    serviceChargeAmount: 0,
    totalAmount: 26000,
    amountPaid: 50000,
    changeAmount: 24000,
    status: 'COMPLETED',
    createdAt: Date.now() - 3600000,
    items: [
      { itemId: 'nm-prod-5', name: 'Pain au Chocolat', price: 26000, quantity: 1, subtotal: 26000 },
    ],
  },
];

export const DEMO_DRIVER_PROFILE: DriverProfile = {
  id: 'drv-nanomind-1',
  name: 'Raka Aditya (Kurir Mitra)',
  phone: '081299887766',
  serviceType: 'MOTOR',
  vehicleType: 'MOTOR',
  acceptedCategories: ['GOODS', 'FOOD', 'SEND'],
  vehicleBrand: 'Sepeda Motor Toko',
  plateNumber: 'N 4421 AB',
  rating: 4.95,
  totalTrips: 142,
  todayEarnings: 48000,
  city: 'Malang',
  isOnline: true,
  verified: true,
  isStoreCourier: true,
  linkedStoreId: DEMO_STORE_ID,
  linkedStoreName: DEMO_STORE.name,
  linkedStoreCode: 'KR-NANO01',
  linkedStoreAddress: DEMO_STORE.address,
  linkedStorePhone: DEMO_STORE.whatsapp,
  activeSessionId: 'courier-session-nanomind-1',
};

export const DEMO_TRIGGERS: DemoTriggerItem[] = [
  {
    id: 'trig-nanomind-stock',
    goalName: 'On-Device Low-Stock Inventory Watchdog',
    cronExpression: '*/30 * * * *',
    triggerType: 'THRESHOLD',
    state: 'ACTIVE',
    firePolicy: 'REPEAT',
    action: { type: 'ON_DEVICE_LOW_STOCK_WATCHDOG' },
    condition: {
      humanIntent: 'Alert via Gemini Nano when local store inventory drops below 5 units',
      internalCompiled: '*/30 * * * *',
    },
    lastFiredAt: Date.now() - 1800000,
    createdAt: Date.now() - 86400000 * 2,
    nextRunAt: 'Continuous local check (<= 5 units)',
    description:
      'Monitors local product catalog via Gemini Nano on-device and alerts when beans or barista milk drop below 5 units.',
  },
  {
    id: 'trig-nanomind-shift',
    goalName: 'End-of-Shift Cash Drawer Reconciliation',
    cronExpression: '0 22 * * *',
    triggerType: 'RECURRING',
    state: 'ACTIVE',
    firePolicy: 'REPEAT',
    action: { type: 'END_OF_SHIFT_CASH_RECONCILIATION' },
    condition: {
      humanIntent: 'Daily 22:00 WIB on-device cash vs QRIS ledger audit',
      internalCompiled: '0 22 * * *',
    },
    createdAt: Date.now() - 86400000,
    nextRunAt: 'Today, 22:00 WIB',
    description:
      'Summarizes local POS cash vs QRIS totals privately on-device before closing the cashier shift.',
  },
];

export const DEMO_AGREEMENTS: DemoOperatingAgreement[] = [
  {
    id: 'agr-nanomind-commerce',
    title: 'Local Commerce & POS Hybrid Assistant',
    intent: 'Read local store catalog, POS shift ledger, and courier queue; require ProposalCard approval before mutating inventory or orders.',
    mode: 'ASSISTANT',
    scope: 'Read local store catalog, POS shift ledger, and courier queue; require user approval via ProposalCard before modifying inventory or orders.',
    status: 'ACTIVE',
    lastActionSummary: 'Audited Kopi NanoMind Roastery catalog (8 items, 2 low stock) on-device.',
    nextActionSummary: 'Waiting for store manager or cashier prompts via ChatView.',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 3600000,
  },
];

export const DEFAULT_COMMERCE_CONNECTORS = [
  {
    id: 'marketplace',
    name: 'Marketplace',
    category: 'commerce',
    description: 'Storefront catalog, cart, and offline-ready order placement.',
    riskSummary: 'Reads local & marketplace catalog state.',
    alwaysActive: false,
    isActive: true,
    toolCount: 3,
    toolNames: ['search_catalog', 'inspect_store', 'place_order'],
  },
  {
    id: 'mitra_store',
    name: 'Mitra Store',
    category: 'commerce',
    description: 'Merchant dashboard for inventory, pricing, orders, and store schedule.',
    riskSummary: 'Proposes product and stock mutations via approval cards.',
    alwaysActive: false,
    isActive: true,
    toolCount: 4,
    toolNames: ['create_product', 'update_stock', 'list_orders', 'store_analytics'],
  },
  {
    id: 'mitra_kasir',
    name: 'Mitra Kasir',
    category: 'commerce',
    description: 'Point-of-Sale terminal with shift ledger, table bills, and offline receipts.',
    riskSummary: 'Reads shift cash drawer and creates POS orders on approval.',
    alwaysActive: false,
    isActive: true,
    toolCount: 3,
    toolNames: ['shift_summary', 'create_pos_order', 'audit_cash_drawer'],
  },
  {
    id: 'mitra_kurir',
    name: 'Mitra Kurir',
    category: 'commerce',
    description: 'Store courier delivery queue, COD settlement, and route tracking.',
    riskSummary: 'Reads active delivery stops and COD collection status.',
    alwaysActive: false,
    isActive: true,
    toolCount: 2,
    toolNames: ['courier_queue', 'cod_settlement_status'],
  },
];

export function ensureDemoCommerceSeeded(): void {
  if (typeof window === 'undefined') return;

  // Ensure frictionless judge/demo session without blocking on Launch Code or OTP gates
  if (!localStorage.getItem('sera_launch_verified')) {
    localStorage.setItem('sera_launch_verified', 'true');
  }
  if (!localStorage.getItem('sera_session_token')) {
    localStorage.setItem('sera_session_token', 'nanomind-local-session');
  }
  if (!localStorage.getItem('sera_user_email')) {
    localStorage.setItem('sera_user_email', 'founder@seraos.xyz');
  }
  if (!localStorage.getItem('sera_customer_name')) {
    localStorage.setItem('sera_customer_name', 'Kopi NanoMind Founder');
  }
  if (!localStorage.getItem('sera_active_connectors')) {
    localStorage.setItem('sera_active_connectors', JSON.stringify(DEFAULT_COMMERCE_CONNECTORS));
  }

  if (localStorage.getItem('sera_nanomind_seeded_v1') === 'true') {
    return;
  }

  try {
    localStorage.setItem('sera_merchant_store', JSON.stringify(DEMO_STORE));
    localStorage.setItem('sera_merchant_products', JSON.stringify(DEMO_PRODUCTS));
    localStorage.setItem('sera_cashier_products', JSON.stringify(DEMO_PRODUCTS));
    localStorage.setItem('sera_merchant_orders', JSON.stringify(DEMO_MERCHANT_ORDERS));
    localStorage.setItem('sera_customer_orders', JSON.stringify(DEMO_CUSTOMER_ORDERS));
    localStorage.setItem('sera_cashier_session', JSON.stringify(DEMO_CASHIER_SESSION));
    localStorage.setItem('sera_cashier_active_shift', JSON.stringify(DEMO_CASHIER_SHIFT));
    localStorage.setItem('sera_nanomind_pos_transactions', JSON.stringify(DEMO_POS_TRANSACTIONS));
    localStorage.setItem('sera_driver_profile', JSON.stringify(DEMO_DRIVER_PROFILE));
    localStorage.setItem('sera_nanomind_triggers', JSON.stringify(DEMO_TRIGGERS));
    localStorage.setItem('sera_nanomind_agreements', JSON.stringify(DEMO_AGREEMENTS));
    localStorage.setItem('sera_nanomind_seeded_v1', 'true');
  } catch (err) {
    console.warn('[DemoCommerceSeed] Failed to persist initial seed:', err);
  }
}
