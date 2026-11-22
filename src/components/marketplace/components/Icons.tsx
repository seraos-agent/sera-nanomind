import React from 'react';

export interface IconProps {
  size?: number;
  color?: string;
  style?: React.CSSProperties;
  className?: string;
}

/**
 * Modern vector Map Pin Icon (Shopee/Google Maps inspired)
 */
export const MapPinIcon: React.FC<IconProps> = ({
  size = 14,
  color = '#EF4444',
  style,
  className = ''
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    style={{
      display: 'inline-block',
      verticalAlign: 'middle',
      flexShrink: 0,
      color,
      ...style
    }}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7zm0 9.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"
    />
  </svg>
);

/**
 * Official vector WhatsApp Brand Icon
 */
export const WhatsAppIcon: React.FC<IconProps> = ({
  size = 20,
  style,
  className = ''
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={className}
    style={{
      display: 'inline-block',
      verticalAlign: 'middle',
      flexShrink: 0,
      ...style
    }}
  >
    <circle cx="12" cy="12" r="11" fill="#25D366" />
    <path
      fill="#FFFFFF"
      d="M17.5 14.3c-.3-.1-1.7-.8-1.9-.9-.2-.1-.4-.1-.6.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4-.1-.5-.1-.1-.6-1.5-.8-2-.2-.6-.5-.5-.6-.5h-.5c-.2 0-.5.1-.8.4-.3.3-1.1 1.1-1.1 2.6 0 1.5 1.1 3 1.3 3.2.2.2 2.2 3.4 5.3 4.7.7.3 1.3.5 1.8.7.8.2 1.5.2 2 .1.6-.1 1.7-.7 1.9-1.4.3-.7.3-1.3.2-1.4-.1-.1-.3-.2-.6-.4z"
    />
  </svg>
);

/**
 * Delivery Truck Icon with speed lines (clean delivery tracking)
 */
export const DeliveryTruckIcon: React.FC<IconProps> = ({
  size = 26,
  color = 'currentColor',
  style,
  className = ''
}) => (
  <svg
    width={size}
    height={Math.round(size * 0.7)}
    viewBox="0 0 32 22"
    fill="none"
    className={className}
    style={{
      display: 'inline-block',
      verticalAlign: 'middle',
      flexShrink: 0,
      ...style
    }}
  >
    {/* Speed lines */}
    <line x1="1" y1="8" x2="6" y2="8" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <line x1="3" y1="12" x2="7" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />

    {/* Cargo box */}
    <rect x="9" y="3" width="13" height="12" rx="1.5" fill={color} />

    {/* Truck cab */}
    <path
      d="M22 6H27L30 10V15H22V6Z"
      fill={color}
    />

    {/* Cab window cutout */}
    <path
      d="M23 7.5H26.2L28.5 10.5H23V7.5Z"
      fill="#FFFFFF"
    />

    {/* Left wheel */}
    <circle cx="14" cy="17" r="3" fill={color} />
    <circle cx="14" cy="17" r="1.2" fill="#FFFFFF" />

    {/* Right wheel */}
    <circle cx="26" cy="17" r="3" fill={color} />
    <circle cx="26" cy="17" r="1.2" fill="#FFFFFF" />
  </svg>
);

/**
 * Modern vector Users / Followers Icon
 */
export const UsersIcon: React.FC<IconProps> = ({
  size = 14,
  color = 'currentColor',
  style,
  className = ''
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{
      display: 'inline-block',
      verticalAlign: 'middle',
      flexShrink: 0,
      ...style
    }}
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

/**
 * Modern vector Star / Rating Icon
 */
export const StarIcon: React.FC<IconProps & { fill?: string }> = ({
  size = 14,
  color = '#EAB308',
  fill = '#EAB308',
  style,
  className = ''
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke={color}
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{
      display: 'inline-block',
      verticalAlign: 'middle',
      flexShrink: 0,
      ...style
    }}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

/**
 * Modern vector User / Profile Icon
 */
export const UserIcon: React.FC<IconProps> = ({
  size = 22,
  color = 'currentColor',
  style,
  className = ''
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{
      display: 'inline-block',
      verticalAlign: 'middle',
      flexShrink: 0,
      ...style
    }}
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

/**
 * Modern vector User with Enclosed Circle Icon
 */
export const UserCircleIcon: React.FC<IconProps> = ({
  size = 23,
  color = 'currentColor',
  style,
  className = ''
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{
      display: 'inline-block',
      verticalAlign: 'middle',
      flexShrink: 0,
      ...style
    }}
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="10" r="3" />
    <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
  </svg>
);

/**
 * Official Lucide UtensilsCrossed / All Food Icon
 */
export const AllFoodIcon: React.FC<IconProps> = ({ size = 21, color = 'currentColor', style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{ display: 'block', ...style }}
  >
    <path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8Z" />
    <path d="M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7" />
    <path d="m2.1 21.8 6.4-6.3" />
    <path d="m19 5-7 7" />
  </svg>
);

/**
 * Official Lucide Utensils / Makanan Icon
 */
export const MealFoodIcon: React.FC<IconProps> = ({ size = 21, color = 'currentColor', style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{ display: 'block', ...style }}
  >
    <path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2" />
    <path d="M15 2v18" />
    <path d="M9 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
    <path d="M9 14v8" />
  </svg>
);

/**
 * Official Lucide CupSoda / Minuman Icon
 */
export const DrinkFoodIcon: React.FC<IconProps> = ({ size = 21, color = 'currentColor', style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{ display: 'block', ...style }}
  >
    <path d="m6 8 1.75 12.28a2 2 0 0 0 2 1.72h4.5a2 2 0 0 0 2-1.72L18 8" />
    <path d="M5 8h14" />
    <path d="M7 15a6.47 6.47 0 0 1 5 0 6.47 6.47 0 0 0 5 0" />
    <path d="m12 8 1-6h2" />
  </svg>
);

/**
 * Official Lucide Cookie / Cemilan Snack Icon
 */
export const SnackFoodIcon: React.FC<IconProps> = ({ size = 21, color = 'currentColor', style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{ display: 'block', ...style }}
  >
    <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
    <path d="M8.5 8.5v.01" />
    <path d="M16 15.5v.01" />
    <path d="M12 12v.01" />
    <path d="M11 17v.01" />
    <path d="M7 14v.01" />
  </svg>
);

/**
 * Official Lucide Coffee / Kopi & Bakery Icon
 */
export const BakeryCoffeeIcon: React.FC<IconProps> = ({ size = 21, color = 'currentColor', style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{ display: 'block', ...style }}
  >
    <path d="M10 2v2" />
    <path d="M14 2v2" />
    <path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h12Z" />
    <path d="M6 2v2" />
    <path d="M17 12h1a2 2 0 0 1 0 4h-1" />
  </svg>
);

/**
 * Official Lucide Bike / Motor Vector Icon (Razor Sharp & Modern)
 */
export const MotorIcon: React.FC<IconProps> = ({ size = 21, color = 'currentColor', style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{ display: 'block', ...style }}
  >
    <circle cx="18.5" cy="17.5" r="3.5" />
    <circle cx="5.5" cy="17.5" r="3.5" />
    <circle cx="15" cy="5" r="1" />
    <path d="M12 17.5V14l-3-3 4-3 2 3h2" />
  </svg>
);

export const BikeIcon = MotorIcon;

/**
 * Official Lucide Car Vector Icon (Aerodynamic & Crisp)
 */
export const CarIcon: React.FC<IconProps> = ({ size = 21, color = 'currentColor', style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{ display: 'block', ...style }}
  >
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
    <circle cx="7" cy="17" r="2" />
    <path d="M9 17h6" />
    <circle cx="17" cy="17" r="2" />
  </svg>
);

/**
 * Modern vector Delivery Package Icon
 */
export const PackageIcon: React.FC<IconProps> = ({ size = 21, color = 'currentColor', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', ...style }}>
    <path d="m7.5 4.27 9 5.15" />
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="m3.3 7 8.7 5 8.7-5" />
    <path d="M12 22V12" />
  </svg>
);

/**
 * Official Lucide Sparkles / Jasa Kebersihan Cleaning Icon
 */
export const SparklesCleanIcon: React.FC<IconProps> = ({ size = 21, color = 'currentColor', style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{ display: 'block', ...style }}
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
);

/**
 * Modern vector Tools / Appliance Repair Icon
 */
export const ToolsWrenchIcon: React.FC<IconProps> = ({ size = 21, color = 'currentColor', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', ...style }}>
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

/**
 * Modern vector Construction / Hammer Icon
 */
export const HammerIcon: React.FC<IconProps> = ({ size = 21, color = 'currentColor', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', ...style }}>
    <path d="m15 12-8.5 8.5a2.12 2.12 0 1 1-3-3L12 9" />
    <path d="M17.64 15 22 10.64" />
    <path d="m20.91 3.26-6.55 6.55a2 2 0 0 1-2.83 0L9.8 8.08a2 2 0 0 1 0-2.83L16.35 1.7a2 2 0 0 1 2.83 0l1.73 1.73a2 2 0 0 1 0 2.83z" />
  </svg>
);

/**
 * Official Lucide Flower2 / Spa & Massage Icon
 */
export const SpaMassageIcon: React.FC<IconProps> = ({ size = 21, color = 'currentColor', style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{ display: 'block', ...style }}
  >
    <path d="M12 5a3 3 0 1 1 3 3m-3-3a3 3 0 1 0-3 3m3-3v1M9 8a3 3 0 1 0 3 3M9 8h1m5 0a3 3 0 1 1-3 3m3-3h-1m-2 3v-1" />
    <circle cx="12" cy="8" r="2" />
    <path d="M12 10v12" />
    <path d="M12 22c4.2 0 7-1.667 7-5-4.2 0-7 1.667-7 5Z" />
    <path d="M12 22c-4.2 0-7-1.667-7-5 4.2 0 7 1.667 7 5Z" />
  </svg>
);

/**
 * Modern vector Washing Machine / Laundry Icon
 */
export const WashingMachineIcon: React.FC<IconProps> = ({ size = 21, color = 'currentColor', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', ...style }}>
    <path d="M3 6h3" />
    <path d="M17 6h.01" />
    <rect width="18" height="20" x="3" y="2" rx="2" />
    <circle cx="12" cy="13" r="5" />
    <path d="M12 15a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
  </svg>
);

/**
 * Modern vector Shuttle Van / Travel Icon
 */
export const ShuttleVanIcon: React.FC<IconProps> = ({ size = 21, color = 'currentColor', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', ...style }}>
    <path d="M19 17h2c.6 0 1-.4 1-1V9c0-1.1-.9-2-2-2h-3l-2.4-3.6A2 2 0 0 0 13 3H5a2 2 0 0 0-2 2v11c0 .6.4 1 1 1h1" />
    <circle cx="7" cy="17" r="2.5" />
    <path d="M9.5 17h5" />
    <circle cx="17" cy="17" r="2.5" />
    <line x1="3" y1="9" x2="21" y2="9" />
  </svg>
);

/**
 * Modern vector Hotel / Villa / Building Icon
 */
export const HotelVillaIcon: React.FC<IconProps> = ({ size = 21, color = 'currentColor', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', ...style }}>
    <path d="M18 2H6a2 2 0 0 0-2 2v18h16V4a2 2 0 0 0-2-2Z" />
    <path d="M9 16v6" />
    <path d="M8 6h.01" />
    <path d="M16 6h.01" />
    <path d="M12 6h.01" />
    <path d="M12 10h.01" />
    <path d="M12 14h.01" />
    <path d="M16 10h.01" />
    <path d="M16 14h.01" />
    <path d="M8 10h.01" />
    <path d="M8 14h.01" />
  </svg>
);

/**
 * Modern vector Gift Box / Hampers Icon
 */
export const GiftBoxIcon: React.FC<IconProps> = ({ size = 21, color = 'currentColor', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', ...style }}>
    <rect x="3" y="8" width="18" height="4" rx="1" />
    <path d="M12 8v13" />
    <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
    <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 4.8 0 0 1 12 8a4.8 4.8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
  </svg>
);

/**
 * Modern vector Electricity / Lightning Icon
 */
export const ZapBoltIcon: React.FC<IconProps> = ({ size = 21, color = 'currentColor', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', ...style }}>
    <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

/**
 * Modern vector Laptop / Computer Icon
 */
export const LaptopIcon: React.FC<IconProps> = ({ size = 21, color = 'currentColor', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', ...style }}>
    <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16" />
  </svg>
);

/**
 * Modern vector Scissors / Barber Icon
 */
export const ScissorsIcon: React.FC<IconProps> = ({ size = 21, color = 'currentColor', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', ...style }}>
    <circle cx="6" cy="6" r="3" />
    <path d="M8.12 8.12 12 12" />
    <path d="M20 4 8.12 15.88" />
    <circle cx="6" cy="18" r="3" />
    <path d="M14.8 14.8 20 20" />
  </svg>
);

/**
 * Modern vector Car Wash Icon (Lucide Geometry)
 */
export const CarWashIcon: React.FC<IconProps> = ({ size = 21, color = 'currentColor', style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{ display: 'block', ...style }}
  >
    <path d="M12 2v2" />
    <path d="M7 3l1 2" />
    <path d="M17 3l-1 2" />
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
    <circle cx="7" cy="17" r="2" />
    <path d="M9 17h6" />
    <circle cx="17" cy="17" r="2" />
  </svg>
);

/**
 * Modern vector Water Drop / PDAM Icon
 */
export const WaterDropIcon: React.FC<IconProps> = ({ size = 21, color = 'currentColor', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', ...style }}>
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
  </svg>
);

/**
 * Modern vector Shield Cross / BPJS Icon
 */
export const ShieldCrossIcon: React.FC<IconProps> = ({ size = 21, color = 'currentColor', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', ...style }}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    <path d="M9 12h6" />
    <path d="M12 9v6" />
  </svg>
);

/**
 * Modern vector WiFi / Internet Icon
 */
export const WifiIcon: React.FC<IconProps> = ({ size = 21, color = 'currentColor', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', ...style }}>
    <path d="M12 20h.01" />
    <path d="M2 8.82a15 15 0 0 1 20 0" />
    <path d="M5 12.86a10 10 0 0 1 14 0" />
    <path d="M8.5 16.43a5 5 0 0 1 7 0" />
  </svg>
);

/**
 * Modern vector Credit Card / E-Wallet Icon
 */
export const CreditCardIcon: React.FC<IconProps> = ({ size = 21, color = 'currentColor', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', ...style }}>
    <rect width="20" height="14" x="2" y="5" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
  </svg>
);

/**
 * Modern vector Landmark / PBB Pajak Icon
 */
export const LandmarkIcon: React.FC<IconProps> = ({ size = 21, color = 'currentColor', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', ...style }}>
    <line x1="2" y1="22" x2="22" y2="22" />
    <line x1="3" y1="18" x2="21" y2="18" />
    <path d="M6 18v-7" />
    <path d="M10 18v-7" />
    <path d="M14 18v-7" />
    <path d="M18 18v-7" />
    <polygon points="12 2 20 7 4 7 12 2" />
  </svg>
);

/**
 * Modern vector Camera / Photo Icon
 */
export const CameraIcon: React.FC<IconProps> = ({
  size = 18,
  color = 'currentColor',
  style,
  className = ''
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{
      display: 'inline-block',
      verticalAlign: 'middle',
      flexShrink: 0,
      ...style
    }}
  >
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

/**
 * Modern vector Shopping Cart Icon (Minimalist e-commerce standard)
 */
export const CartIcon: React.FC<IconProps> = ({
  size = 20,
  color = 'currentColor',
  style,
  className = ''
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{
      display: 'inline-block',
      verticalAlign: 'middle',
      flexShrink: 0,
      ...style
    }}
  >
    <circle cx="8" cy="21" r="1.2" fill={color} />
    <circle cx="19" cy="21" r="1.2" fill={color} />
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
  </svg>
);

/**
 * Modern vector Processing / Clock Progress Icon
 */
export const ProcessingIcon: React.FC<IconProps> = ({
  size = 20,
  color = 'currentColor',
  style,
  className = ''
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{
      display: 'inline-block',
      verticalAlign: 'middle',
      flexShrink: 0,
      ...style
    }}
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

/**
 * Modern vector Check Circle Icon
 */
export const CheckCircleIcon: React.FC<IconProps> = ({
  size = 20,
  color = 'currentColor',
  style,
  className = ''
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{
      display: 'inline-block',
      verticalAlign: 'middle',
      flexShrink: 0,
      ...style
    }}
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

/**
 * Modern vector Chevron Left / Back Navigation Icon (<)
 */
export const ChevronLeftIcon: React.FC<IconProps> = ({
  size = 20,
  color = 'currentColor',
  style,
  className = ''
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2.3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{
      display: 'inline-block',
      verticalAlign: 'middle',
      flexShrink: 0,
      ...style
    }}
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

export const ArrowLeftIcon = ChevronLeftIcon;

