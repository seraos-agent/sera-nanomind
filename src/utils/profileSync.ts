import { getApiBaseUrl } from './platform';
import { safeSetStorage } from './safeStorage';

export interface UserDeliveryAddressDTO {
  label: string;
  recipientName: string;
  phone: string;
  streetAddress: string;
  city: string;
  postalCode?: string;
  notes: string;
  lat?: number;
  lng?: number;
}

export interface UserNotificationPreferencesDTO {
  sound: boolean;
  vibration: boolean;
  merchantOrders: boolean;
  courierDeliveries: boolean;
  buyerOrders: boolean;
}

export interface UserProfileDTO {
  userId: string;
  email: string;
  fullName: string;
  nickname: string;
  avatarUrl: string | null;
  avatarFileKey: string | null;
  phone: string;
  phoneVerified: boolean;
  phoneVerifiedAt: number | null;
  defaultAddress: UserDeliveryAddressDTO | null;
  timezone: string;
  language: string;
  trainAiOptIn: boolean;
  notificationPrefs: UserNotificationPreferencesDTO;
  createdAt: number;
  updatedAt: number;
}

export interface UserProfileUpdatePayload {
  fullName?: string;
  nickname?: string;
  avatarUrl?: string | null;
  avatarFileKey?: string | null;
  phone?: string;
  defaultAddress?: Partial<UserDeliveryAddressDTO> | null;
  timezone?: string;
  language?: string;
  trainAiOptIn?: boolean;
  notificationPrefs?: Partial<UserNotificationPreferencesDTO>;
}

export interface ProfileAuthContext {
  sessionToken?: string | null;
  isBypassed?: boolean;
}

function buildAuthHeaders(auth: ProfileAuthContext): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token =
    auth.sessionToken ||
    (typeof window !== 'undefined' ? localStorage.getItem('sera_session_token') : null);
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else if (auth.isBypassed) {
    headers['x-dev-bypass'] = 'true';
  }
  return headers;
}

export async function fetchUserProfileApi(
  auth: ProfileAuthContext
): Promise<{ persisted: boolean; profile: UserProfileDTO }> {
  const res = await fetch(`${getApiBaseUrl()}/api/profile`, {
    method: 'GET',
    headers: buildAuthHeaders(auth),
  });
  const data = await res.json();
  if (!res.ok || !data?.success || !data?.profile) {
    throw new Error(data?.error || 'Failed to load profile from server.');
  }
  return { persisted: Boolean(data.persisted), profile: data.profile };
}

export async function updateUserProfileApi(
  auth: ProfileAuthContext,
  patch: UserProfileUpdatePayload
): Promise<UserProfileDTO> {
  const res = await fetch(`${getApiBaseUrl()}/api/profile`, {
    method: 'PATCH',
    headers: buildAuthHeaders(auth),
    body: JSON.stringify(patch),
  });
  const data = await res.json();
  if (!res.ok || !data?.success || !data?.profile) {
    throw new Error(data?.error || 'Failed to save profile to server.');
  }
  return data.profile;
}

export async function deleteUserProfileApi(auth: ProfileAuthContext): Promise<void> {
  const res = await fetch(`${getApiBaseUrl()}/api/profile`, {
    method: 'DELETE',
    headers: buildAuthHeaders(auth),
  });
  const data = await res.json();
  if (!res.ok || !data?.success) {
    throw new Error(data?.error || 'Failed to delete account from server.');
  }
}

export function syncProfileToLocalCache(profile: UserProfileDTO): void {
  if (typeof window === 'undefined') return;

  const setOrRemove = (key: string, val?: string | null) => {
    if (val && val.trim()) {
      localStorage.setItem(key, val.trim());
    } else {
      localStorage.removeItem(key);
    }
  };

  setOrRemove('sera_user_name', profile.fullName);
  setOrRemove(
    'sera_customer_name',
    profile.fullName || profile.defaultAddress?.recipientName || ''
  );
  setOrRemove('sera_user_nickname', profile.nickname);

  if (profile.email && profile.email.trim()) {
    const cleanEmail = profile.email.trim();
    localStorage.setItem('sera_user_email', cleanEmail);
    localStorage.setItem('sera_saved_email', cleanEmail);
  }

  setOrRemove('sera_user_phone', profile.phone);
  setOrRemove('sera_customer_phone', profile.phone || profile.defaultAddress?.phone || '');

  if (profile.phoneVerified && profile.phone) {
    localStorage.setItem('sera_user_phone_verified', 'true');
    localStorage.setItem('sera_user_phone_verified_num', profile.phone);
  } else {
    localStorage.removeItem('sera_user_phone_verified');
    localStorage.removeItem('sera_user_phone_verified_num');
  }

  if (profile.avatarUrl) {
    safeSetStorage('sera_user_avatar', profile.avatarUrl);
  } else {
    localStorage.removeItem('sera_user_avatar');
  }
  setOrRemove('sera_user_avatar_key', profile.avatarFileKey);

  const addr = profile.defaultAddress;
  if (addr) {
    localStorage.setItem('sera_user_address_details', JSON.stringify(addr));
    const formatted = `${addr.streetAddress}${addr.city ? `, ${addr.city}` : ''}`.trim();
    setOrRemove('sera_customer_address', formatted);
    if (typeof addr.lat === 'number' && Number.isFinite(addr.lat) && typeof addr.lng === 'number' && Number.isFinite(addr.lng)) {
      localStorage.setItem('sera_customer_lat', String(addr.lat));
      localStorage.setItem('sera_customer_lng', String(addr.lng));
    } else {
      localStorage.removeItem('sera_customer_lat');
      localStorage.removeItem('sera_customer_lng');
    }
  } else {
    localStorage.removeItem('sera_user_address_details');
    localStorage.removeItem('sera_customer_address');
    localStorage.removeItem('sera_customer_lat');
    localStorage.removeItem('sera_customer_lng');
  }

  localStorage.setItem('sera_train_ai_opt_in', String(profile.trainAiOptIn ?? true));

  if (profile.notificationPrefs) {
    localStorage.setItem('sera_notification_preferences', JSON.stringify(profile.notificationPrefs));
    window.dispatchEvent(
      new CustomEvent('sera:notification-preferences-changed', {
        detail: profile.notificationPrefs,
      })
    );
  }

  window.dispatchEvent(new Event('sera_profile_updated'));
}

export function clearProfileLocalCache(options?: { clearSavedEmail?: boolean }): void {
  if (typeof window === 'undefined') return;
  const keys = [
    'sera_user_avatar',
    'sera_user_avatar_key',
    'sera_user_nickname',
    'sera_user_name',
    'sera_customer_name',
    'sera_user_phone',
    'sera_customer_phone',
    'sera_user_phone_verified',
    'sera_user_phone_verified_num',
    'sera_user_address_details',
    'sera_customer_address',
    'sera_customer_lat',
    'sera_customer_lng',
    'sera_train_ai_opt_in',
    'sera_notification_preferences',
  ];
  if (options?.clearSavedEmail) {
    keys.push('sera_saved_email');
  }
  for (const key of keys) {
    localStorage.removeItem(key);
  }
  window.dispatchEvent(new Event('sera_profile_updated'));
}

export function extractLegacyLocalProfile(): {
  hasAnyData: boolean;
  legacyAvatarDataUrl?: string;
  patch: UserProfileUpdatePayload;
} {
  if (typeof window === 'undefined') {
    return { hasAnyData: false, patch: {} };
  }

  const fullName =
    (localStorage.getItem('sera_customer_name') || localStorage.getItem('sera_user_name') || '').trim();
  const nickname = (localStorage.getItem('sera_user_nickname') || '').trim();
  const phone =
    (localStorage.getItem('sera_user_phone') || localStorage.getItem('sera_customer_phone') || '')
      .replace(/\D/g, '');
  const rawAvatar = (localStorage.getItem('sera_user_avatar') || '').trim();
  const rawTrainAi = localStorage.getItem('sera_train_ai_opt_in');
  const rawNotif = localStorage.getItem('sera_notification_preferences');
  const rawAddrDetails = localStorage.getItem('sera_user_address_details');
  const rawStreet = (localStorage.getItem('sera_customer_address') || '').trim();
  const rawLat = localStorage.getItem('sera_customer_lat');
  const rawLng = localStorage.getItem('sera_customer_lng');

  const patch: UserProfileUpdatePayload = {};
  let hasAnyData = false;
  let legacyAvatarDataUrl: string | undefined;

  if (fullName) {
    patch.fullName = fullName;
    hasAnyData = true;
  }
  if (nickname) {
    patch.nickname = nickname;
    hasAnyData = true;
  }
  if (phone) {
    patch.phone = phone;
    hasAnyData = true;
  }
  if (rawAvatar) {
    if (/^https?:\/\//i.test(rawAvatar)) {
      patch.avatarUrl = rawAvatar;
      hasAnyData = true;
    } else if (rawAvatar.startsWith('data:image/')) {
      legacyAvatarDataUrl = rawAvatar;
      hasAnyData = true;
    }
  }
  if (rawTrainAi !== null) {
    patch.trainAiOptIn = rawTrainAi !== 'false';
    hasAnyData = true;
  }
  if (rawNotif) {
    try {
      const parsed = JSON.parse(rawNotif);
      if (parsed && typeof parsed === 'object') {
        patch.notificationPrefs = parsed;
        hasAnyData = true;
      }
    } catch {}
  }

  let parsedAddr: Partial<UserDeliveryAddressDTO> | null = null;
  if (rawAddrDetails) {
    try {
      const obj = JSON.parse(rawAddrDetails);
      if (obj && typeof obj === 'object') {
        parsedAddr = {
          label: obj.label === 'Rumah' ? 'Home' : (obj.label || 'Home'),
          recipientName: obj.recipientName || fullName,
          phone: obj.phone || phone,
          streetAddress: obj.streetAddress || rawStreet,
          city: obj.city || '',
          postalCode: obj.postalCode,
          notes: obj.notes || '',
          ...(typeof obj.lat === 'number' ? { lat: obj.lat } : {}),
          ...(typeof obj.lng === 'number' ? { lng: obj.lng } : {}),
        };
      }
    } catch {}
  } else if (rawStreet) {
    parsedAddr = {
      label: 'Home',
      recipientName: fullName,
      phone,
      streetAddress: rawStreet,
      city: '',
      notes: '',
    };
  }

  if (parsedAddr) {
    if (parsedAddr.lat === undefined && rawLat && rawLng) {
      const lat = parseFloat(rawLat);
      const lng = parseFloat(rawLng);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        parsedAddr.lat = lat;
        parsedAddr.lng = lng;
      }
    }
    const addrNonEmpty = Boolean(
      parsedAddr.streetAddress || parsedAddr.city || parsedAddr.lat !== undefined
    );
    if (addrNonEmpty) {
      patch.defaultAddress = parsedAddr;
      hasAnyData = true;
    }
  }

  return { hasAnyData, legacyAvatarDataUrl, patch };
}
