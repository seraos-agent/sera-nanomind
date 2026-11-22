export type DriverVehicleType = "MOTOR" | "MOBIL" | "PICKUP";
export type DriverServiceType = "MOTOR" | "MOBIL" | "PICKUP" | "CAR" | "SEND";
export type OrderCategory = "GOODS" | "FOOD" | "SEND" | "RIDE";

export function getDriverFleet(profile?: Partial<DriverProfile> | null): DriverVehicleType {
  if (!profile) return "MOTOR";
  if (profile.vehicleType === "PICKUP" || profile.serviceType === "PICKUP") return "PICKUP";
  if (profile.vehicleType === "MOBIL" || profile.serviceType === "MOBIL" || profile.serviceType === "CAR") return "MOBIL";
  return "MOTOR";
}

export interface DriverProfile {
  id: string;
  name: string;
  phone: string;
  serviceType: DriverServiceType;
  vehicleType?: DriverVehicleType;
  acceptedCategories: OrderCategory[];
  vehicleBrand: string;
  plateNumber: string;
  rating: number;
  totalTrips: number;
  todayEarnings: number;
  city: string;
  isOnline: boolean;
  verified: boolean;
  simNumber?: string;
  stnkNumber?: string;
  qrisImageUrl?: string;
  danaNumber?: string;
  danaAccountName?: string;
  isStoreCourier?: boolean;
  linkedStoreId?: string;
  linkedStoreName?: string;
  linkedStoreCode?: string;
  linkedStoreAddress?: string;
  linkedStorePhone?: string;
  activeSessionId?: string;
}

export type OrderStatus = "OFFER" | "ACCEPTED" | "PICKING_UP" | "ON_THE_WAY" | "COMPLETED";

export interface ActiveRideOrder {
  id: string;
  orderId?: string;
  storeId?: string;
  packageWeight?: string;
  customerName: string;
  customerPhone: string;
  serviceType: DriverServiceType;
  category: OrderCategory;
  merchantName?: string;
  itemsDescription?: string;
  pickupAddress: string;
  destAddress: string;
  pickupCoords?: { lat: number; lng: number };
  destCoords?: { lat: number; lng: number };
  distanceKm: number;
  estimatedMinutes: number;
  fareAmount: number;
  paymentMethod: "QRIS" | "CASH" | "DANA" | "WALLET";
  status: OrderStatus;
  note?: string;
}

export interface DeliveryStop {
  id: string;
  orderId: string;
  stopNumber: number;
  customerName: string;
  customerPhone: string;
  destAddress: string;
  destCoords?: { lat: number; lng: number };
  distanceKm: number;
  estimatedMinutes: number;
  itemsSummary?: string;
  totalAmount: number;
  paymentMethod: "QRIS" | "CASH" | "DANA" | "COD";
  isCod: boolean;
  codAmount: number;
  status: "PENDING" | "ACTIVE" | "COMPLETED";
  note?: string;
  completedAt?: string;
}

export const SAMPLE_DELIVERY_QUEUE: DeliveryStop[] = [
  {
    id: "STP-01",
    orderId: "ORD-9912",
    stopNumber: 1,
    customerName: "Budi Santoso",
    customerPhone: "08123456789",
    destAddress: "Jl. Melati No. 12, Solo Baru (Near Al-Hidayah Mosque)",
    distanceKm: 1.2,
    estimatedMinutes: 5,
    itemsSummary: "2x Royal Rice 5kg, 1x Cooking Oil 2L",
    totalAmount: 145000,
    paymentMethod: "COD",
    isCod: true,
    codAmount: 145000,
    status: "ACTIVE",
    note: "Green gate, please honk upon arrival"
  },
  {
    id: "STP-02",
    orderId: "ORD-9915",
    stopNumber: 2,
    customerName: "Siti Rahmawati",
    customerPhone: "081298765432",
    destAddress: "Fajar Indah Residence Block B-12, Solo",
    distanceKm: 2.8,
    estimatedMinutes: 9,
    itemsSummary: "3x Granulated Sugar 1kg, 2x Wheat Flour 1kg",
    totalAmount: 68000,
    paymentMethod: "QRIS",
    isCod: false,
    codAmount: 0,
    status: "PENDING",
    note: "Paid via Store QRIS. Leave at security post if nobody is home."
  },
  {
    id: "STP-03",
    orderId: "ORD-9920",
    stopNumber: 3,
    customerName: "Doni Prasetyo",
    customerPhone: "081377889900",
    destAddress: "Jl. Veteran No. 8, Gajahan, Pasar Kliwon, Solo",
    distanceKm: 4.5,
    estimatedMinutes: 14,
    itemsSummary: "1x Carton Instant Fried Noodles (40 pcs)",
    totalAmount: 118000,
    paymentMethod: "COD",
    isCod: true,
    codAmount: 118000,
    status: "PENDING",
    note: "Exact COD cash ready on the porch table"
  }
];

export type TripHistoryStatus = "COMPLETED" | "CANCELLED";

export interface CompletedTrip {
  id: string;
  orderId?: string;
  storeId?: string;
  customerName: string;
  customerPhone?: string;
  serviceType: DriverServiceType;
  category: OrderCategory;
  merchantName?: string;
  itemsDescription?: string;
  pickupAddress: string;
  destAddress: string;
  distanceKm: number;
  fareAmount: number;
  paymentMethod: "QRIS" | "CASH" | "DANA" | "WALLET";
  status: TripHistoryStatus;
  completedAt: string;
  timestamp: number;
  rating?: number;
  cancelReason?: string;
  note?: string;
}

/**
 * Format timestamp into standard Indonesian receipt style date:
 * e.g. "16 Okt 2026, 10:15 WIB" (Tanggal Bulan Tahun Jam)
 */
export function formatReceiptDate(dateOrTimestamp: Date | number = new Date()): string {
  const d = typeof dateOrTimestamp === "number" ? new Date(dateOrTimestamp) : dateOrTimestamp;
  const dateStr = d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
  const timeStr = d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit"
  });
  return `${dateStr}, ${timeStr} WIB`;
}

export function getVehicleBrandLabel(vehicleType?: DriverVehicleType): string {
  if (vehicleType === "PICKUP") return "Store Utility Pickup";
  if (vehicleType === "MOBIL") return "Store Van / Box Car";
  return "Store Delivery Motorcycle";
}

/**
 * Identifies unlinked or legacy hardcoded mock driver profiles
 * so they are purged instead of bypassing real store pairing.
 */
export function isLegacyDummyDriverProfile(profile: any): boolean {
  if (!profile || typeof profile !== "object") return true;
  if (!profile.isStoreCourier || !profile.linkedStoreId) return true;
  if (profile.id === "drv-771") return true;
  if (profile.linkedStoreId === "toko-berkah-sembako") return true;
  if (String(profile.name || "").trim().toLowerCase() === "bambang pamungkas") return true;
  return false;
}

/**
 * Constructs an authoritative DriverProfile exclusively from server store and courier records.
 */
export function buildDriverProfileFromServer(
  store: any,
  courier: any,
  sessionId?: string
): DriverProfile {
  const vehicleType = getDriverFleet(courier);
  return {
    id: String(courier?.id || ""),
    name: String(courier?.name || "Store Courier"),
    phone: String(courier?.phone || ""),
    serviceType: vehicleType,
    vehicleType,
    acceptedCategories: ["GOODS", "FOOD", "SEND"],
    vehicleBrand: getVehicleBrandLabel(vehicleType),
    plateNumber: String(courier?.plateNumber || "-"),
    rating: 5.0,
    totalTrips: 0,
    todayEarnings: 0,
    city: String(store?.city || ""),
    // Drivers always start OFFLINE until they explicitly toggle Online
    isOnline: false,
    verified: true,
    isStoreCourier: true,
    linkedStoreId: String(store?.id || store?.storeId || ""),
    linkedStoreName: String(store?.name || store?.storeName || ""),
    linkedStoreCode: "",
    linkedStoreAddress: String(store?.address || store?.storeAddress || ""),
    linkedStorePhone: String(store?.whatsapp || store?.storePhone || ""),
    activeSessionId: sessionId || courier?.activeSessionId
  };
}

export const INITIAL_SAMPLE_OFFER: ActiveRideOrder = {
  id: "DELIV-8820",
  customerName: "Budi Santoso",
  customerPhone: "08123456789",
  serviceType: "MOTOR",
  category: "GOODS",
  merchantName: "Java Grocer & Rice",
  itemsDescription: "2x Royal Rice 5kg (Total 10kg)",
  pickupAddress: "Java Grocer, Jl. Slamet Riyadi No. 45, Solo",
  destAddress: "Jl. Melati No. 12, Solo",
  distanceKm: 2.8,
  estimatedMinutes: 8,
  fareAmount: 14000,
  paymentMethod: "QRIS",
  status: "OFFER",
  note: "Java Grocer - Ready for pickup at cashier counter"
};

export const SAMPLE_TRIP_HISTORY: CompletedTrip[] = [
  {
    id: "DELIV-8812",
    customerName: "Siti Rahmawati",
    customerPhone: "0812-9876-5432",
    serviceType: "MOTOR",
    category: "FOOD",
    merchantName: "H. Slamet Kitchen",
    itemsDescription: "1x Crispy Duck Set, 1x Iced Orange",
    pickupAddress: "H. Slamet Kitchen, Slamet Riyadi",
    destAddress: "Solo Baru Residence Sector 2",
    distanceKm: 4.8,
    fareAmount: 22000,
    paymentMethod: "QRIS",
    status: "COMPLETED",
    completedAt: formatReceiptDate(Date.now() - 3600000),
    timestamp: Date.now() - 3600000,
    rating: 5,
    note: "Separate chili sauce please"
  },
  {
    id: "DELIV-8809",
    customerName: "Dimas Anggara",
    customerPhone: "0813-2233-4455",
    serviceType: "MOTOR",
    category: "GOODS",
    merchantName: "Java Grocer",
    itemsDescription: "2x Royal Rice 5kg, 1x Cooking Oil",
    pickupAddress: "Java Grocer, Jl. Slamet Riyadi No. 45",
    destAddress: "Pasar Gede Surakarta",
    distanceKm: 3.1,
    fareAmount: 16000,
    paymentMethod: "DANA",
    status: "COMPLETED",
    completedAt: formatReceiptDate(Date.now() - 7200000),
    timestamp: Date.now() - 7200000,
    rating: 5
  },
  {
    id: "DELIV-8805",
    customerName: "Hendro Prasetyo",
    customerPhone: "0857-1122-3344",
    serviceType: "MOTOR",
    category: "GOODS",
    merchantName: "Family Care Pharmacy",
    itemsDescription: "Cough Syrup & Vitamin C",
    pickupAddress: "Family Care Pharmacy Solo",
    destAddress: "Solo Grand Mall",
    distanceKm: 2.2,
    fareAmount: 14000,
    paymentMethod: "QRIS",
    status: "CANCELLED",
    cancelReason: "Store ran out of prescription stock",
    completedAt: formatReceiptDate(Date.now() - 10800000),
    timestamp: Date.now() - 10800000
  },
  {
    id: "DELIV-8801",
    customerName: "Artha Jaya Logistics Ltd.",
    customerPhone: "0812-4455-6677",
    serviceType: "MOTOR",
    category: "SEND",
    itemsDescription: "Corporate Deeds & Contracts",
    pickupAddress: "Solo Baru Notary Office",
    destAddress: "Regional Bank Slamet Riyadi Branch",
    distanceKm: 5.5,
    fareAmount: 24000,
    paymentMethod: "QRIS",
    status: "COMPLETED",
    completedAt: formatReceiptDate(Date.now() - 14400000),
    timestamp: Date.now() - 14400000,
    rating: 5,
    note: "Leave at 1st floor reception"
  },
  {
    id: "DELIV-8794",
    customerName: "Fajar Nugraha",
    customerPhone: "0878-9900-1122",
    serviceType: "MOTOR",
    category: "GOODS",
    merchantName: "Berkah Pantry Store",
    itemsDescription: "1x Fragrant Jasmine Rice 10kg",
    pickupAddress: "Berkah Pantry Store Solo",
    destAddress: "Alila Hotel Solo",
    distanceKm: 7.8,
    fareAmount: 32000,
    paymentMethod: "QRIS",
    status: "COMPLETED",
    completedAt: formatReceiptDate(Date.now() - 86400000),
    timestamp: Date.now() - 86400000,
    rating: 5
  }
];
