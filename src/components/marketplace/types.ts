export type MarketplaceItemType = 'GOODS' | 'SERVICE' | 'FOOD';
export type MarketplaceFilterTab = 'STORE' | 'FOOD' | 'SERVICE' | 'ALL';

export interface MarketplaceItem {
  id: string;
  storeId: string;
  storeName: string;
  name: string;
  description: string;
  type: MarketplaceItemType; // 'GOODS' vs 'SERVICE'
  category: string;
  price: number;
  originalPrice?: number;
  discountType?: '%' | 'nominal';
  discountValue?: number;
  barcode?: string;
  currency: string;
  stock?: number;
  weight?: number; // in grams or ml depending on weightUnit
  weightUnit?: 'g' | 'ml';
  duration?: string;
  bookingNotice?: string;
  rating: number;
  reviewsCount: number;
  soldCount: number;
  images: string[];
  badge?: string;
  location: string;
  tags: string[];
  variants?: Array<{ name: string; price: number }>;
  createdAt?: number;
}

export interface StoreCourierConfig {
  enabled: boolean;
  pairingCode: string;
  pricingType: 'FLAT' | 'PER_KM';
  flatRate: number;
  perKmRate: number;
  freeDeliveryThreshold?: number;
  maxDistanceKm: number;
  estimatedMinutes: string;
  notes?: string;
}

export interface MarketplaceStore {
  id: string;
  name: string;
  tagline: string;
  description: string;
  logoUrl: string;
  bannerUrl: string;
  type: 'GOODS' | 'SERVICE' | 'HYBRID' | 'FOOD';
  category: string;
  rating: number;
  totalProducts: number;
  followers?: number;
  address: string;
  city: string;
  district?: string;
  village?: string;
  isOpen: boolean;
  isOpenManualOverride?: boolean | null;
  operatingHours: string;
  openDays?: string[];
  openTime?: string;
  closeTime?: string;
  is24Hours?: boolean;
  whatsapp: string;
  verified: boolean;
  courierConfig?: StoreCourierConfig;
}

export interface CartItem {
  item: MarketplaceItem;
  quantity: number;
  selectedVariant?: { name: string; price: number };
  bookingDate?: string;
  notes?: string;
  selectedImage?: string;
}

export interface MarketplaceOrder {
  id: string;
  storeId: string;
  storeName: string;
  items: Array<{
    itemId: string;
    name: string;
    price: number;
    quantity: number;
    type: MarketplaceItemType;
    imageUrl?: string;
    bookingDate?: string;
    notes?: string;
  }>;
  subtotal: number;
  deliveryOrServiceFee: number;
  totalAmount: number;
  customer: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
    bookingDate?: string;
    notes?: string;
    destCoords?: { lat: number; lng: number };
  };
  destCoords?: { lat: number; lng: number };
  paymentMethod: 'QRIS' | 'DANA' | 'TRANSFER' | 'COD';
  paymentStatus: 'PAID' | 'PENDING';
  paymentProofUrl?: string;
  shippingMethod?: 'STORE_DELIVERY' | 'SERA_INSTANT' | 'PICKUP' | 'REGULAR';
  orderStatus: 'CONFIRMED' | 'PENDING' | 'PREPARING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';
  createdAt: number;
}

export interface MarketplaceReview {
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

