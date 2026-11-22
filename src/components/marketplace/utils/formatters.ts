/**
 * Formatting utilities for SERA Marketplace
 */

const ADMIN_CITY_PREFIX_RE = /^(?:Kota|Kabupaten|Kab\.?)\s+/i;
const ADMIN_DISTRICT_PREFIX_RE = /^(?:Kecamatan|Kec\.?)\s+/i;
const ADMIN_VILLAGE_PREFIX_RE = /^(?:Kelurahan|Kel\.?|Desa)\s+/i;
const PROVINCE_SUFFIX_RE =
  /\s*(?:,|\s)+\b(?:jawa\s+(?:timur|tengah|barat)|dki\s+jakarta|d\.?i\.?\s+yogyakarta|banten|bali|indonesia)\b.*$/i;
const STANDALONE_PROVINCE_RE =
  /^(?:jawa\s+(?:timur|tengah|barat)|dki\s+jakarta|d\.?i\.?\s+yogyakarta|banten|bali|indonesia)$/i;

function cleanLocationSegment(raw?: string, prefixPattern?: RegExp): string {
  if (!raw) return '';
  let text = String(raw).split(',')[0].trim();
  if (!text) return '';
  if (prefixPattern) {
    text = text.replace(prefixPattern, '').trim();
  }
  text = text.replace(PROVINCE_SUFFIX_RE, '').trim();
  if (STANDALONE_PROVINCE_RE.test(text)) return '';
  return text;
}

/**
 * Extracts subdistrict (Kecamatan) name from a formatted Indonesian address string.
 */
export function extractDistrictFromAddress(address?: string): string {
  if (!address) return '';
  const match = String(address).match(/\b(?:Kec\.?|Kecamatan)\s+([^,]+)/i);
  if (!match?.[1]) return '';
  return cleanLocationSegment(match[1], ADMIN_DISTRICT_PREFIX_RE);
}

/**
 * Extracts village (Desa / Kelurahan) name from a formatted Indonesian address string.
 */
export function extractVillageFromAddress(address?: string): string {
  if (!address) return '';
  const match = String(address).match(/\b(?:Kel\.?|Kelurahan|Desa)\s+([^,]+)/i);
  if (!match?.[1]) return '';
  return cleanLocationSegment(match[1], ADMIN_VILLAGE_PREFIX_RE);
}

export interface StoreLocationFormatInput {
  city?: string;
  district?: string;
  village?: string;
  address?: string;
  fallback?: string;
}

/**
 * Formats the compact hyperlocal store pin label ("City, District"),
 * falling back to ("City, Village") when district matches city name (e.g. Batu + Kec. Batu + Kel. Sisir -> "Batu, Sisir").
 */
export function formatStorePinLocation(input: StoreLocationFormatInput): string {
  const city = cleanLocationSegment(input.city, ADMIN_CITY_PREFIX_RE);
  const district = cleanLocationSegment(
    input.district || extractDistrictFromAddress(input.address),
    ADMIN_DISTRICT_PREFIX_RE
  );
  const village = cleanLocationSegment(
    input.village || extractVillageFromAddress(input.address),
    ADMIN_VILLAGE_PREFIX_RE
  );

  if (city && district) {
    if (city.toLowerCase() !== district.toLowerCase()) {
      return `${city}, ${district}`;
    }
    if (village && village.toLowerCase() !== city.toLowerCase()) {
      return `${city}, ${village}`;
    }
    return city;
  }

  if (city && village && city.toLowerCase() !== village.toLowerCase()) {
    return `${city}, ${village}`;
  }

  return city || district || village || input.fallback || 'Indonesia';
}

/**
 * Formats the expanded store area label ("City, District, Village") with case-insensitive deduplication.
 */
export function formatFullStoreArea(input: StoreLocationFormatInput): string {
  const city = cleanLocationSegment(input.city, ADMIN_CITY_PREFIX_RE);
  const district = cleanLocationSegment(
    input.district || extractDistrictFromAddress(input.address),
    ADMIN_DISTRICT_PREFIX_RE
  );
  const village = cleanLocationSegment(
    input.village || extractVillageFromAddress(input.address),
    ADMIN_VILLAGE_PREFIX_RE
  );

  const seen = new Set<string>();
  const parts: string[] = [];
  for (const part of [city, district, village]) {
    if (!part) continue;
    const lower = part.toLowerCase();
    if (seen.has(lower)) continue;
    seen.add(lower);
    parts.push(part);
  }

  if (parts.length > 0) {
    return parts.join(', ');
  }
  return input.fallback || 'Indonesia';
}

/**
 * Formats a city/area string preserving up to 2 cleaned segments (e.g. "Batu, Junrejo")
 * while stripping province suffixes and duplicate segments.
 *
 * Examples:
 * - "Batu, Junrejo" -> "Batu, Junrejo"
 * - "Kota Batu, Kec. Batu" -> "Batu"
 * - "Surabaya, Jawa Timur" -> "Surabaya"
 * - "Surabaya Jawa Timur" -> "Surabaya"
 */
export function formatShortCity(location?: string, fallback = 'Solo'): string {
  if (!location || !location.trim()) return fallback;

  const rawParts = location.split(',').map((s) => s.trim()).filter(Boolean);
  const cleanedParts: string[] = [];
  const seen = new Set<string>();

  for (const part of rawParts) {
    const cleaned = cleanLocationSegment(
      part,
      /^(?:Kota|Kabupaten|Kab\.?|Kecamatan|Kec\.?|Kelurahan|Kel\.?|Desa)\s+/i
    );
    if (!cleaned) continue;
    const lower = cleaned.toLowerCase();
    if (seen.has(lower)) continue;
    seen.add(lower);
    cleanedParts.push(cleaned);
    if (cleanedParts.length >= 2) break;
  }

  return cleanedParts.length > 0 ? cleanedParts.join(', ') : fallback;
}

/**
 * Formats numbers into clean compact counts (e.g. 850, 1.2rb, 15.4rb, 1.2jt)
 */
export function formatCompactCount(count?: number, fallback = '120'): string {
  if (count === undefined || count === null) return fallback;
  if (count <= 0) return '0';
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1).replace('.0', '') + 'jt';
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1).replace('.0', '') + 'rb';
  }
  return count.toString();
}

/**
 * Formats sold / order count:
 * - If count < 1000: "154 terjual" (tanpa tanda '+')
 * - If count >= 1000: "1rb+ terjual", "1.2rb+ terjual", etc.
 */
export function formatSoldCount(count?: number, isService = false): string {
  const label = isService ? 'dipesan' : 'terjual';
  if (count === undefined || count === null || count <= 0) return `0 ${label}`;
  if (count >= 1000000) {
    const val = (count / 1000000).toFixed(1).replace('.0', '');
    return `${val}jt+ ${label}`;
  }
  if (count >= 1000) {
    const val = (count / 1000).toFixed(1).replace('.0', '');
    return `${val}rb+ ${label}`;
  }
  return `${count} ${label}`;
}

/**
 * Formats a timestamp into an elegant date string (e.g. "19 Okt 2026, 14:30")
 */
export function formatOrderDate(timestamp?: number): string {
  if (!timestamp) return 'Hari ini';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return 'Hari ini';

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day} ${month} ${year}, ${hours}:${minutes}`;
}
