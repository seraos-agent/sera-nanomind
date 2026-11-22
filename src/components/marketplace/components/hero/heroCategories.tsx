import React from 'react';
import {
  AllFoodIcon,
  MealFoodIcon,
  DrinkFoodIcon,
  SnackFoodIcon,
  BakeryCoffeeIcon,
  PackageIcon,
  SparklesCleanIcon,
  ToolsWrenchIcon,
  HammerIcon,
  SpaMassageIcon,
  WashingMachineIcon,
  ShuttleVanIcon,
  HotelVillaIcon,
  GiftBoxIcon,
  ZapBoltIcon,
  LaptopIcon,
  ScissorsIcon,
  CarWashIcon,
} from '../Icons';

export interface CategoryItemDef {
  id: string;
  name: string; // If '__ALL__', clears category filter
  label: string;
  icon?: React.ReactNode;
  isDots?: boolean;
  bg: string;
  color: string;
  isSoon?: boolean;
}

const StoreIcon: React.FC = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
    <path d="M3 9l1.5-5h15L21 9" />
    <path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
    <path d="M4 11.8V20a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8.2" />
    <path d="M9 21v-6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v6" />
  </svg>
);

const AppleIcon: React.FC = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
    <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" />
    <path d="M10 2c1 .5 2 2 2 5" />
    <path d="M12 4c1.8-1 3.5-.8 4.2.2" />
  </svg>
);

const PawPrintIcon: React.FC = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'block' }}>
    <ellipse cx="4.6" cy="9.5" rx="1.8" ry="2.5" transform="rotate(-25 4.6 9.5)" />
    <ellipse cx="9.3" cy="5.5" rx="1.9" ry="2.7" transform="rotate(-8 9.3 5.5)" />
    <ellipse cx="14.7" cy="5.5" rx="1.9" ry="2.7" transform="rotate(8 14.7 5.5)" />
    <ellipse cx="19.4" cy="9.5" rx="1.8" ry="2.5" transform="rotate(25 19.4 9.5)" />
    <path d="M12 11C9.4 11 7.2 12.6 7.2 14.8C7.2 17 8.6 19 10.2 19.2C11 19.3 11.5 18.7 12 18.7C12.5 18.7 13 19.3 13.8 19.2C15.4 19 16.8 17 16.8 14.8C16.8 12.6 14.6 11 12 11Z" />
  </svg>
);

const SproutIcon: React.FC = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
    <path d="M7 20h10" />
    <path d="M10 20c5.5-2.5.8-6.4 3-13" />
    <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
    <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
  </svg>
);

const HardHatIcon: React.FC = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
    <path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v2z" />
    <path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5" />
    <path d="M4 15v-3a6 6 0 0 1 6-6" />
    <path d="M14 6a6 6 0 0 1 6 6v3" />
  </svg>
);

const LipstickIcon: React.FC = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
);

const ArmchairIcon: React.FC = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
    <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" />
    <path d="M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H7v-2a2 2 0 0 0-4 0Z" />
    <path d="M5 18v2" />
    <path d="M19 18v2" />
  </svg>
);

export const ALL_CATEGORIES: CategoryItemDef[] = [
  { id: 'pertanian', name: 'Pertanian', label: 'Pertanian', icon: <SproutIcon />, bg: '#EFF6FF', color: '#2563EB' },
  { id: 'kuliner', name: 'Kuliner & Makanan', label: 'Kuliner', icon: <MealFoodIcon size={21} />, bg: '#EFF6FF', color: '#2563EB' },
  { id: 'kopi', name: 'Kuliner & Minuman', label: 'Kopi', icon: <BakeryCoffeeIcon size={21} />, bg: '#EFF6FF', color: '#2563EB' },
  { id: 'sepatu', name: 'Jasa Kebersihan & Perawatan', label: 'Cuci Sepatu', icon: <WashingMachineIcon size={21} />, bg: '#EFF6FF', color: '#2563EB' },
  { id: 'ac', name: 'Jasa Servis & Elektronik', label: 'Servis AC', icon: <ToolsWrenchIcon size={21} />, bg: '#EFF6FF', color: '#2563EB' },
  { id: 'barber', name: 'Perawatan & Kecantikan', label: 'Barber', icon: <ScissorsIcon size={21} />, bg: '#EFF6FF', color: '#2563EB' },
  { id: 'logistik', name: 'Pengiriman & Logistik', label: 'Kurir Toko', icon: <PackageIcon size={21} />, bg: '#EFF6FF', color: '#2563EB' },
  { id: 'all', name: '__ALL__', label: 'Lihat Semua', isDots: true, bg: '#EFF6FF', color: '#2563EB' },
];

export const STORE_CATEGORIES: CategoryItemDef[] = [
  { id: 'sembako', name: 'Sembako', label: 'Sembako', icon: <StoreIcon />, bg: '#F1F5F9', color: '#0F172A' },
  { id: 'sayur_buah', name: 'Sayur & Buah', label: 'Sayur & Buah', icon: <AppleIcon />, bg: '#FEF2F2', color: '#DC2626' },
  { id: 'petshop', name: 'Petshop', label: 'Petshop', icon: <PawPrintIcon />, bg: '#FFF7ED', color: '#EA580C' },
  { id: 'bangunan', name: 'Bangunan', label: 'Bangunan', icon: <HardHatIcon />, bg: '#FFFBEB', color: '#D97706' },
  { id: 'kecantikan', name: 'Kecantikan', label: 'Kecantikan', icon: <LipstickIcon />, bg: '#FFF1F2', color: '#E11D48', isSoon: true },
  { id: 'rumah', name: 'Rumah Tangga', label: 'Perabot', icon: <ArmchairIcon />, bg: '#F0FDFA', color: '#0D9488' },
  { id: 'pertanian', name: 'Pertanian', label: 'Pertanian', icon: <SproutIcon />, bg: '#F0FDF4', color: '#16A34A' },
  { id: 'all_store', name: '__ALL__', label: 'Semua', isDots: true, bg: '#F1F5F9', color: '#0F172A' },
];

export const FOOD_CATEGORIES: CategoryItemDef[] = [
  { id: 'all_food', name: '__ALL__', label: 'All', icon: <AllFoodIcon size={21} />, bg: '#F1F5F9', color: '#0F172A' },
  { id: 'makanan', name: 'Makanan', label: 'Makanan', icon: <MealFoodIcon size={21} />, bg: '#F1F5F9', color: '#0F172A' },
  { id: 'minuman', name: 'Minuman', label: 'Minuman', icon: <DrinkFoodIcon size={21} />, bg: '#F1F5F9', color: '#0F172A' },
  { id: 'cemilan', name: 'Cemilan', label: 'Cemilan', icon: <SnackFoodIcon size={21} />, bg: '#F1F5F9', color: '#0F172A' },
  { id: 'bakery_coffee', name: 'Bakery & Coffee', label: 'Bakery & Coffee', icon: <BakeryCoffeeIcon size={21} />, bg: '#F1F5F9', color: '#0F172A' },
];

export const SERVICE_CATEGORIES: CategoryItemDef[] = [
  { id: 'cleaning', name: 'Cleaning', label: 'Cleaning', icon: <SparklesCleanIcon size={21} />, bg: '#EFF6FF', color: '#2563EB' },
  { id: 'elektronik', name: 'Elektronik', label: 'Elektronik', icon: <ToolsWrenchIcon size={21} />, bg: '#EFF6FF', color: '#2563EB' },
  { id: 'tukang', name: 'Tukang', label: 'Tukang', icon: <HammerIcon size={21} />, bg: '#EFF6FF', color: '#2563EB' },
  { id: 'pijat', name: 'Pijat', label: 'Pijat', icon: <SpaMassageIcon size={21} />, bg: '#EFF6FF', color: '#2563EB' },
  { id: 'travel', name: 'Travel', label: 'Travel', icon: <ShuttleVanIcon size={21} />, bg: '#EFF6FF', color: '#2563EB' },
  { id: 'penginapan', name: 'Penginapan', label: 'Penginapan', icon: <HotelVillaIcon size={21} />, bg: '#EFF6FF', color: '#2563EB' },
  { id: 'laundry', name: 'Laundry', label: 'Laundry', icon: <WashingMachineIcon size={21} />, bg: '#EFF6FF', color: '#2563EB' },
  { id: 'hampers', name: 'Hampers', label: 'Hampers', icon: <GiftBoxIcon size={21} />, bg: '#EFF6FF', color: '#2563EB' },
  { id: 'listrik', name: 'Listrik', label: 'Listrik', icon: <ZapBoltIcon size={21} />, bg: '#EFF6FF', color: '#2563EB' },
  { id: 'laptop', name: 'Laptop', label: 'Laptop', icon: <LaptopIcon size={21} />, bg: '#EFF6FF', color: '#2563EB' },
  { id: 'barber', name: 'Barber', label: 'Barber', icon: <ScissorsIcon size={21} />, bg: '#EFF6FF', color: '#2563EB' },
  { id: 'cucimobil', name: 'Cuci Mobil', label: 'Cuci Mobil', icon: <CarWashIcon size={21} />, bg: '#EFF6FF', color: '#2563EB' },
  { id: 'all_services', name: '__ALL__', label: 'Semua', isDots: true, bg: '#EFF6FF', color: '#2563EB' },
];
