import type { ThemeType } from "../../theme";

export const DANA_REFERRAL_CODE = "RDW4WK";

export type StoreType = 'BARANG' | 'FOOD' | 'JASA';

export const STORE_CATEGORIES: Record<StoreType, string[]> = {
  BARANG: [
    "Sembako & Kebutuhan Pokok",
    "Sayur, Buah & Bahan Segar",
    "Fashion & Pakaian",
    "Elektronik & Gadget",
    "Perlengkapan Rumah Tangga",
    "Kesehatan & Perawatan Diri",
    "Ibu & Bayi",
    "Hobi, Olahraga & Otomotif",
    "Alat Tulis & Kantor",
    "Bahan Bangunan & Perkakas"
  ],
  FOOD: [
    "Makanan Siap Saji & Aneka Nasi",
    "Camilan & Snack",
    "Kopi & Aneka Minuman",
    "Kuliner Khas & Tradisional",
    "Roti, Kue & Pastry",
    "Frozen Food & Siap Masak",
    "Dessert & Es Krim"
  ],
  JASA: [
    "Servis & Perbaikan Elektronik",
    "Jasa Kebersihan (Cleaning Service)",
    "Montir & Servis Kendaraan",
    "Barbershop & Salon Kecantikan",
    "Jasa Tukang & Renovasi Rumah",
    "Laundry & Cuci Sepatu",
    "Les Privat & Jasa Edukasi",
    "Jasa Fotografi & Desain"
  ]
};

export function getStoreProductCategories(customCategories?: string[]): string[] {
  return (customCategories || []).filter(c => Boolean(c?.trim()) && c.trim().toLowerCase() !== "umum");
}

export const normalizeStoreType = (type?: string): StoreType => {
  if (type === 'FOOD') return 'FOOD';
  if (type === 'JASA' || type === 'SERVICE') return 'JASA';
  return 'BARANG';
};

export interface MerchantStore {
  id: string;
  ownerId?: string;
  name: string;
  tagline?: string;
  description: string;
  logoUrl: string;
  bannerUrl: string;
  type: StoreType;
  category: string;
  rating: number;
  totalProducts: number;
  address: string;
  city: string;
  district?: string;
  village?: string;
  latitude?: number;
  longitude?: number;
  isOpen: boolean;
  isOpenManualOverride?: boolean | null;
  operatingHours: string;
  openTime?: string;
  closeTime?: string;
  openDays?: string[];
  is24Hours?: boolean;
  dailyCustomHours?: Record<string, { openTime: string; closeTime: string }>;
  whatsapp: string;
  verified: boolean;
  bankName?: string;
  bankAccount?: string;
  bankHolder?: string;
  danaPhone?: string;
  danaName?: string;
  qrisImageUrl?: string;
  acceptCod?: boolean;
  customCategories?: string[];
  shippingConfig?: StoreShippingConfig;
  courierConfig?: StoreCourierConfig;
  linkedCouriers?: StoreLinkedCourier[];
  acceptedPayments?: {
    qris: boolean;
    wallet: boolean;
    cod: boolean;
    transfer: boolean;
  };
  createdAt: number;
}

export interface StoreCourierConfig {
  enabled: boolean;
  pairingCode: string;
  pricingType: "FLAT" | "PER_KM";
  flatRate: number;
  perKmRate: number;
  freeDeliveryThreshold?: number;
  maxDistanceKm: number;
  estimatedMinutes: string;
  notes?: string;
}

export interface StoreLinkedCourier {
  id: string;
  name: string;
  phone: string;
  vehicleType: "MOTOR" | "MOBIL" | "PICKUP";
  plateNumber: string;
  activationCode?: string;
  hasPin?: boolean;
  status: "ONLINE" | "OFFLINE" | "BUSY";
  isActivated?: boolean;
  activatedAt?: number;
  linkedAt: number;
}

export interface StoreShippingConfig {
  seraInstant: boolean;
  selfPickup: boolean;
  regularCourier: boolean;
  storeDelivery?: boolean;
  storeDeliveryPricingType?: "FLAT" | "PER_KM";
  storeDeliveryFee?: number;
  storeDeliveryFeePerKm?: number;
  storeDeliveryMaxRadius?: number;
  storeDeliveryNotes?: string;
  pickupInstructions?: string;
}

export const DEFAULT_SHIPPING_CONFIG: StoreShippingConfig = {
  seraInstant: true,
  selfPickup: true,
  regularCourier: false,
  storeDelivery: true,
  storeDeliveryPricingType: "FLAT",
  storeDeliveryFee: 5000,
  storeDeliveryFeePerKm: 2000,
  storeDeliveryMaxRadius: 5,
  storeDeliveryNotes: "Pengantaran langsung oleh kurir toko untuk area sekitar.",
  pickupInstructions: "Silakan tunjukkan nama atau nomor pesanan ke kasir saat mengambil pesanan."
};

export const ALL_DAYS = [
  { id: "SENIN", label: "Sen", full: "Senin" },
  { id: "SELASA", label: "Sel", full: "Selasa" },
  { id: "RABU", label: "Rab", full: "Rabu" },
  { id: "KAMIS", label: "Kam", full: "Kamis" },
  { id: "JUMAT", label: "Jum", full: "Jumat" },
  { id: "SABTU", label: "Sab", full: "Sabtu" },
  { id: "MINGGU", label: "Min", full: "Minggu" }
];

export function formatScheduleString(
  openDays?: string[],
  openTime?: string,
  closeTime?: string,
  is24Hours?: boolean,
  dailyCustomHours?: Record<string, { openTime: string; closeTime: string }>
): string {
  if (!openDays || openDays.length === 0) return "Tutup Sementara";

  if (is24Hours) {
    let daysText = "";
    if (openDays.length === 7) daysText = "Setiap Hari";
    else if (openDays.length === 5 && !openDays.includes("SABTU") && !openDays.includes("MINGGU")) daysText = "Senin – Jumat";
    else if (openDays.length === 6 && !openDays.includes("MINGGU")) daysText = "Senin – Sabtu";
    else daysText = openDays.map((d) => ALL_DAYS.find((x) => x.id === d)?.label || d).join(", ");
    return `${daysText} (24 Jam)`;
  }

  const defaultOpen = openTime || "08:00";
  const defaultClose = closeTime || "21:00";

  const hasCustom = dailyCustomHours && Object.keys(dailyCustomHours).some(dayId => 
    openDays.includes(dayId) && 
    ((dailyCustomHours[dayId]?.openTime && dailyCustomHours[dayId].openTime !== defaultOpen) || 
     (dailyCustomHours[dayId]?.closeTime && dailyCustomHours[dayId].closeTime !== defaultClose))
  );

  if (!hasCustom) {
    let daysText = "";
    if (openDays.length === 7) {
      daysText = "Setiap Hari";
    } else if (
      openDays.length === 5 &&
      !openDays.includes("SABTU") &&
      !openDays.includes("MINGGU")
    ) {
      daysText = "Senin – Jumat";
    } else if (openDays.length === 6 && !openDays.includes("MINGGU")) {
      daysText = "Senin – Sabtu";
    } else {
      daysText = openDays
        .map((d) => ALL_DAYS.find((x) => x.id === d)?.label || d)
        .join(", ");
    }
    return `${daysText}, ${defaultOpen} - ${defaultClose} WIB`;
  }

  const groups: { [timeRange: string]: string[] } = {};
  openDays.forEach(dayId => {
    const hours = dailyCustomHours?.[dayId];
    const o = hours?.openTime || defaultOpen;
    const c = hours?.closeTime || defaultClose;
    const rangeKey = `${o} - ${c}`;
    if (!groups[rangeKey]) groups[rangeKey] = [];
    groups[rangeKey].push(dayId);
  });

  const formattedParts = Object.entries(groups).map(([range, days]) => {
    let dayLabel = "";
    if (days.length === 7) dayLabel = "Setiap Hari";
    else if (days.length === 6 && !days.includes("MINGGU")) dayLabel = "Senin – Sabtu";
    else if (days.length === 5 && !days.includes("SABTU") && !days.includes("MINGGU")) dayLabel = "Senin – Jumat";
    else if (days.length === 1) dayLabel = ALL_DAYS.find(x => x.id === days[0])?.full || days[0];
    else dayLabel = days.map(d => ALL_DAYS.find(x => x.id === d)?.label || d).join(", ");
    return `${dayLabel} (${range})`;
  });

  return `${formattedParts.join(", ")} WIB`;
}

export interface StoreOpenStatusResult {
  isOpen: boolean;
  statusLabel: string;
  statusDescription: string;
  isManualOverride: boolean;
  manualOverrideType?: "FORCE_OPEN" | "FORCE_CLOSE" | null;
}

/**
 * Evaluates live store open status based on operating days, hours, and optional merchant manual override.
 */
export function isStoreCurrentlyOpen(
  store?: Partial<MerchantStore> | null,
  referenceDate: Date = new Date()
): StoreOpenStatusResult {
  if (!store) {
    return {
      isOpen: false,
      statusLabel: "Tutup",
      statusDescription: "Data toko tidak tersedia",
      isManualOverride: false,
      manualOverrideType: null
    };
  }

  // 1. Check explicit manual override
  if (store.isOpenManualOverride === false) {
    return {
      isOpen: false,
      statusLabel: "Tutup Sementara",
      statusDescription: "Tutup Sementara (Manual)",
      isManualOverride: true,
      manualOverrideType: "FORCE_CLOSE"
    };
  }
  if (store.isOpenManualOverride === true) {
    return {
      isOpen: true,
      statusLabel: "Buka",
      statusDescription: "Buka (Manual Override)",
      isManualOverride: true,
      manualOverrideType: "FORCE_OPEN"
    };
  }

  // 2. Check 24-Hours mode
  const openDays = store.openDays || ["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU", "MINGGU"];
  const dayIndexMap = ["MINGGU", "SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU"];
  const currentDayId = dayIndexMap[referenceDate.getDay()];
  const currentDayInfo = ALL_DAYS.find(d => d.id === currentDayId);
  const currentDayLabel = currentDayInfo?.full || currentDayId;

  if (openDays.length === 0) {
    return {
      isOpen: false,
      statusLabel: "Tutup",
      statusDescription: "Tutup (Jadwal belum diatur)",
      isManualOverride: false,
      manualOverrideType: null
    };
  }

  // Check if today is an active operational day
  if (!openDays.includes(currentDayId)) {
    return {
      isOpen: false,
      statusLabel: "Tutup",
      statusDescription: `Tutup (Libur hari ${currentDayLabel})`,
      isManualOverride: false,
      manualOverrideType: null
    };
  }

  if (store.is24Hours) {
    return {
      isOpen: true,
      statusLabel: "Buka",
      statusDescription: "Buka (24 Jam)",
      isManualOverride: false,
      manualOverrideType: null
    };
  }

  // 3. Evaluate operational hours for today
  const custom = store.dailyCustomHours?.[currentDayId];
  const oTime = (custom?.openTime || store.openTime || "08:00").trim();
  const cTime = (custom?.closeTime || store.closeTime || "21:00").trim();

  const [openH, openM] = oTime.split(":").map(v => parseInt(v, 10) || 0);
  const [closeH, closeM] = cTime.split(":").map(v => parseInt(v, 10) || 0);

  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;
  const currentMinutes = referenceDate.getHours() * 60 + referenceDate.getMinutes();

  let isWithinHours = false;
  if (openMinutes < closeMinutes) {
    // Normal day shift (e.g. 08:00 - 21:00)
    isWithinHours = currentMinutes >= openMinutes && currentMinutes < closeMinutes;
  } else if (openMinutes > closeMinutes) {
    // Overnight shift (e.g. 18:00 - 02:00)
    isWithinHours = currentMinutes >= openMinutes || currentMinutes < closeMinutes;
  } else {
    // Same open and close time: Treat as open 24h for that day
    isWithinHours = true;
  }

  if (isWithinHours) {
    return {
      isOpen: true,
      statusLabel: "Buka",
      statusDescription: `Buka (Tutup pukul ${cTime} WIB)`,
      isManualOverride: false,
      manualOverrideType: null
    };
  } else {
    const nextTimeDesc = currentMinutes < openMinutes
      ? `Buka pukul ${oTime} WIB`
      : `Buka kembali sesuai jadwal`;
    return {
      isOpen: false,
      statusLabel: "Tutup",
      statusDescription: `Tutup (${nextTimeDesc})`,
      isManualOverride: false,
      manualOverrideType: null
    };
  }
}

export function formatTimeInput(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, "").slice(0, 4);
  if (!digits) return "";

  if (digits.length <= 2) {
    const hourNum = parseInt(digits, 10);
    if (digits.length === 2 && hourNum > 23) {
      return "23";
    }
    return digits;
  }

  let hour = digits.slice(0, 2);
  let min = digits.slice(2, 4);

  let hourNum = parseInt(hour, 10);
  if (hourNum > 23) hour = "23";

  if (min.length >= 1 && parseInt(min[0], 10) > 5) {
    min = "5" + min.slice(1);
  }
  if (min.length === 2 && parseInt(min, 10) > 59) {
    min = "59";
  }

  return `${hour}:${min}`;
}

export function sanitizeTimeOnBlur(val: string, fallback: string = "08:00"): string {
  const clean = val.trim();
  if (!clean) return fallback;

  if (/^\d{1,2}$/.test(clean)) {
    const h = Math.min(23, Math.max(0, parseInt(clean, 10)));
    return `${String(h).padStart(2, "0")}:00`;
  }

  const parts = clean.split(":");
  if (parts.length === 2) {
    const h = Math.min(23, Math.max(0, parseInt(parts[0] || "0", 10)));
    const m = Math.min(59, Math.max(0, parseInt(parts[1] || "0", 10)));
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  return fallback;
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  costPrice?: number;
  stock?: number;
}

export interface MerchantProduct {
  id: string;
  storeId: string;
  storeName?: string;
  name: string;
  description: string;
  type: 'GOODS' | 'SERVICE';
  category: string;
  price: number;
  costPrice?: number;
  originalPrice?: number;
  discountType?: '%' | 'nominal';
  discountValue?: number;
  currency: string;
  stock?: number;
  weight?: number; // in grams or ml depending on weightUnit
  weightUnit?: 'g' | 'ml';
  barcode?: string;
  brand?: string;
  addToMasterCatalog?: boolean;
  duration?: string;
  rating: number;
  images: string[];
  status?: 'ACTIVE' | 'DRAFT';
  variants?: ProductVariant[];
  badge?: string;
  location: string;
  createdAt?: number;
}

export type MerchantViewType = "products" | "orders" | "profile" | "payments" | "pos" | "courier";

export interface MerchantReview {
  id: string;
  storeId: string;
  itemId?: string;
  itemName?: string;
  customerName: string;
  rating: number;
  comment: string;
  variant?: string;
  photos?: string[];
  reply?: {
    text: string;
    repliedAt: number;
  };
  createdAt: number;
}


export interface PosCartItem {
  product: MerchantProduct;
  variant?: ProductVariant;
  quantity: number;
  subtotal: number;
  costPrice?: number;
  notes?: string;
  kitchenSentQty?: number;
}

export type PosBasePaymentMethod = 'CASH' | 'QRIS' | 'TRANSFER';
export type PosPaymentMethodType = PosBasePaymentMethod | 'SPLIT';

export interface PosPaymentPart {
  method: PosBasePaymentMethod;
  amount: number;
}

export interface PosTransaction {
  id: string;
  storeId: string;
  receiptNumber: string;
  items: PosCartItem[];
  subtotalAmount?: number;
  taxAmount?: number;
  serviceChargeAmount?: number;
  totalAmount: number;
  discountAmount?: number;
  paymentMethod: PosPaymentMethodType;
  payments?: PosPaymentPart[];
  amountPaid: number;
  changeAmount: number;
  customerName?: string;
  customerPhone?: string;
  cashierNote?: string;
  tableOrQueueNumber?: string;
  serverId?: string;
  shiftId?: string;
  cashierId?: string;
  cashierName?: string;
  createdAt: number;
  status?: 'COMPLETED' | 'VOIDED';
  voidReason?: string;
}

export interface MerchantOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  itemsSummary: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: 'PAID' | 'PENDING';
  paymentProofUrl?: string;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  shippingMethod?: 'SERA_INSTANT' | 'PICKUP' | 'REGULAR' | 'STORE_DELIVERY';
  shippingAddress?: string;
  destCoords?: { lat: number; lng: number };
  shippingCost?: number;
  customerNote?: string;
  courierStatus?: 'SEARCHING' | 'ACCEPTED' | 'PICKING_UP' | 'ON_THE_WAY' | 'DELIVERED';
  courierName?: string;
  courierPhone?: string;
  orderSource?: 'ONLINE' | 'POS';
  posTransactionId?: string;
  posReceiptNumber?: string;
  cashierName?: string;
  tableOrQueueNumber?: string;
  posVoided?: boolean;
  createdAtTs?: number;
}

export interface MerchantPageProps {
  theme: ThemeType;
  onBack: () => void;
  isMobileView?: boolean;
  userEmail?: string | null;
  socket?: any;
}

export const DEFAULT_SAMPLE_STORE: MerchantStore = {
  id: "toko-berkah-sembako",
  name: "Toko Berkah Sembako",
  tagline: "Pusat Sembako Murah & Kebutuhan Rumah Tangga",
  description: "Menyediakan beras, minyak goreng, gula, dan aneka kebutuhan pokok sehari-hari dengan harga grosir dan pengiriman cepat.",
  logoUrl: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=160",
  bannerUrl: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1200",
  type: "BARANG",
  category: "Sembako & Kebutuhan Pokok",
  rating: 4.9,
  totalProducts: 2,
  address: "Jl. Pasar Besar No. 12",
  city: "Solo",
  latitude: undefined,
  longitude: undefined,
  isOpen: true,
  isOpenManualOverride: null,
  operatingHours: "Setiap Hari, 07:30 - 21:00 WIB",
  openTime: "07:30",
  closeTime: "21:00",
  openDays: ["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU", "MINGGU"],
  is24Hours: false,
  whatsapp: "081234567890",
  verified: true,
  danaPhone: "081234567890",
  danaName: "Budi Santoso",
  qrisImageUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=DANA-MERCHANT-BERKAH",
  acceptCod: true,
  customCategories: ["Beras & Tepung", "Minyak & Bumbu"],
  bankName: "DANA",
  bankAccount: "081234567890",
  bankHolder: "Budi Santoso",
  shippingConfig: {
    seraInstant: true,
    selfPickup: true,
    regularCourier: false,
    pickupInstructions: "Silakan tunjukkan nama pemesan atau nomor pesanan ke kasir saat mengambil pesanan."
  },
  acceptedPayments: {
    qris: true,
    wallet: false,
    cod: true,
    transfer: false
  },
  createdAt: Date.now() - 86400000 * 7
};

export const DEFAULT_PRODUCTS: MerchantProduct[] = [
  {
    id: "prod-1",
    storeId: "toko-berkah-sembako",
    name: "Beras Rojolele Super Premium (5kg)",
    description: "Beras pulen pilihan kualitas super tanpa pemutih.",
    type: "GOODS",
    category: "Beras & Tepung",
    price: 72000,
    originalPrice: 75000,
    currency: "IDR",
    stock: 50,
    barcode: "8992753123456",
    rating: 5.0,
    images: ["https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500"],
    badge: "Terlaris",
    location: "Solo"
  },
  {
    id: "prod-2",
    storeId: "toko-berkah-sembako",
    name: "Minyak Goreng Sawit Pouch (2 Liter)",
    description: "Minyak goreng jernih berkualitas kemasan hemat pouch 2L.",
    type: "GOODS",
    category: "Minyak & Bumbu",
    price: 34000,
    currency: "IDR",
    stock: 80,
    barcode: "8991002345678",
    rating: 4.9,
    images: ["https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500"],
    location: "Solo"
  }
];

export const DEFAULT_ORDERS: MerchantOrder[] = [
  {
    id: "ORD-98214",
    customerName: "Budi Santoso",
    customerPhone: "081298765432",
    itemsSummary: "1x Beras Rojolele Super (5kg), 1x Minyak 2L",
    totalAmount: 106000,
    paymentMethod: "QRIS",
    paymentStatus: "PAID",
    status: "PROCESSING",
    createdAt: "14/10/26 • 08:30",
    shippingMethod: "SERA_INSTANT",
    shippingAddress: "Jl. Slamet Riyadi No. 142, Solo (Pintu Belakang BCA)",
    shippingCost: 8000
  },
  {
    id: "ORD-98230",
    customerName: "Ahmad Dahlan",
    customerPhone: "081388776655",
    itemsSummary: "1x Beras Rojolele Super (5kg)",
    totalAmount: 83000,
    paymentMethod: "QRIS",
    paymentStatus: "PAID",
    status: "SHIPPED",
    createdAt: "18/10/26 • 09:15",
    shippingMethod: "STORE_DELIVERY",
    shippingAddress: "Jl. Diponegoro No. 45 (Radius 2 km)",
    shippingCost: 5000,
    courierName: "test"
  },
  {
    id: "ORD-98240",
    customerName: "Hendro Wijaya",
    customerPhone: "081234567890",
    itemsSummary: "1x Beras Rojolele Super (5kg), 2x Ikan Lele Segar (1kg)",
    totalAmount: 150000,
    paymentMethod: "COD",
    paymentStatus: "PENDING",
    status: "SHIPPED",
    createdAt: "18/10/26 • 10:45",
    shippingMethod: "STORE_DELIVERY",
    shippingAddress: "Jl. Veteran No. 12, Solo",
    shippingCost: 5000,
    courierName: "test"
  },
  {
    id: "ORD-98188",
    customerName: "Siti Rahma",
    customerPhone: "085712345678",
    itemsSummary: "2x Minyak Goreng Sawit (2 Liter)",
    totalAmount: 68000,
    paymentMethod: "DANA",
    paymentStatus: "PAID",
    status: "COMPLETED",
    createdAt: "13/10/26 • 14:20",
    shippingMethod: "PICKUP",
    shippingAddress: "Ambil Sendiri di Toko",
    shippingCost: 0
  }
];

export function formatOrderDateTime(rawDate?: string | number): string {
  if (rawDate === undefined || rawDate === null || rawDate === "") return "";

  // Convert to string safely
  const str = String(rawDate).trim();

  // If already in target format DD/MM/YY • HH:mm
  if (/^\d{2}\/\d{2}\/\d{2}\s*•\s*\d{2}:\d{2}$/.test(str)) {
    return str;
  }

  // Handle legacy mock values
  if (str.includes("10 menit") || str.toLowerCase().includes("menit")) {
    return "14/10/26 • 08:30";
  }
  if (str.includes("Kemarin") || str.toLowerCase().includes("kemarin")) {
    return "13/10/26 • 14:20";
  }

  // Handle numeric timestamps (epoch ms or numeric string)
  const numericTimestamp = typeof rawDate === "number" ? rawDate : (/^\d+$/.test(str) ? Number(str) : NaN);
  const date = !isNaN(numericTimestamp) ? new Date(numericTimestamp) : new Date(str);

  if (isNaN(date.getTime())) {
    return str;
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} • ${hours}:${minutes}`;
}

export function compressImage(file: File, maxWidth = 800, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const elem = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        elem.width = width;
        elem.height = height;
        const ctx = elem.getContext("2d");
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(elem.toDataURL("image/jpeg", quality));
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

/**
 * Returns the localized merchant entity noun adapted to the store type ("Resto" for FOOD, "Toko" otherwise).
 */
export function getStoreEntityLabel(type?: StoreType | string, lowercase = false): string {
  const label = type === "FOOD" ? "Resto" : "Toko";
  return lowercase ? label.toLowerCase() : label;
}

