/**
 * SERA Central Notification Service
 * Handles native mobile status bar notifications, Web Notifications,
 * Web Audio synthetic chime, vibration, and deep-link navigation.
 * No in-app bell inbox required: direct deep-linking to target screen.
 */

import { isNativeMobile } from './platform';

export interface NotificationDeepLink {
  view: 'merchant' | 'driver' | 'marketplace' | 'chat';
  tab?: string;
  orderId?: string;
  stopId?: string;
}

export type NotificationType = 'merchant_order' | 'courier_delivery' | 'buyer_order' | 'system';

export interface NotificationPreferences {
  sound: boolean;
  vibration: boolean;
  merchantOrders: boolean;
  courierDeliveries: boolean;
  buyerOrders: boolean;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  sound: true,
  vibration: true,
  merchantOrders: true,
  courierDeliveries: true,
  buyerOrders: true,
};

export function getNotificationPreferences(): NotificationPreferences {
  if (typeof window === 'undefined') return DEFAULT_NOTIFICATION_PREFERENCES;
  try {
    const raw = localStorage.getItem('sera_notification_preferences');
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_NOTIFICATION_PREFERENCES,
        ...parsed,
      };
    }
  } catch {}
  return DEFAULT_NOTIFICATION_PREFERENCES;
}

export function saveNotificationPreferences(prefs: Partial<NotificationPreferences>): NotificationPreferences {
  const current = getNotificationPreferences();
  const updated: NotificationPreferences = {
    ...current,
    ...prefs,
  };
  try {
    localStorage.setItem('sera_notification_preferences', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('sera:notification-preferences-changed', { detail: updated }));
  } catch {}
  return updated;
}

export async function checkNotificationPermissionStatus(): Promise<'granted' | 'denied' | 'default'> {
  if (isNativeMobile()) {
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      const res = await LocalNotifications.checkPermissions();
      return res.display === 'granted' ? 'granted' : res.display === 'denied' ? 'denied' : 'default';
    } catch {
      return 'denied';
    }
  }

  if (typeof window !== 'undefined' && 'Notification' in window) {
    return Notification.permission;
  }

  return 'granted';
}

export async function requestNotificationPermission(): Promise<'granted' | 'denied' | 'default'> {
  if (isNativeMobile()) {
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      const res = await LocalNotifications.requestPermissions();
      return res.display === 'granted' ? 'granted' : 'denied';
    } catch {
      return 'denied';
    }
  }

  if (typeof window !== 'undefined' && 'Notification' in window) {
    try {
      const res = await Notification.requestPermission();
      return res;
    } catch {
      return 'denied';
    }
  }

  return 'granted';
}

export interface DirectNotificationPayload {
  id?: number;
  title: string;
  body: string;
  type?: NotificationType;
  deepLink: NotificationDeepLink;
  sound?: boolean;
  vibrate?: boolean;
}

let isChannelCreated = false;
let isNativeListenerAttached = false;

/**
 * Synthesizes a pleasant melodic 2-tone notification chime using Web Audio API.
 * Requires zero external audio file downloads and produces zero latency.
 */
export function playNotificationChime(): void {
  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // First Tone: F5 (698.46 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(698.46, now);
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.22);

    // Second Tone: A5 (880.00 Hz) - slightly higher pitch for uplifting chime
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.0, now + 0.1);
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.setValueAtTime(0.26, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.42);
  } catch (err) {
    console.warn('[NotificationService] Synthetic audio chime failed:', err);
  }
}

/**
 * Triggers haptic vibration pattern for notifications.
 */
export function triggerNotificationVibration(): void {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate([120, 60, 180]);
    }
  } catch {
    // Silent fallback
  }
}

/**
 * Initializes Capacitor local notifications channel on Android.
 */
async function ensureNotificationChannel(): Promise<void> {
  if (isChannelCreated || !isNativeMobile()) return;
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    await LocalNotifications.createChannel({
      id: 'sera_orders_channel',
      name: 'Pesanan & Pengiriman SERA',
      description: 'Notifikasi pesanan merchant, tugas kurir, dan progres pembeli',
      importance: 5, // High importance (Heads-up banner & sound)
      visibility: 1, // Public on lockscreen
      vibration: true,
      sound: undefined,
    });
    isChannelCreated = true;
  } catch (err) {
    console.warn('[NotificationService] Failed to create Android notification channel:', err);
  }
}

/**
 * Attaches the native Capacitor notification action listener once.
 */
export async function initNativeNotificationListener(): Promise<void> {
  if (isNativeListenerAttached || !isNativeMobile()) return;
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');

    // Request permissions on startup
    const permStatus = await LocalNotifications.checkPermissions();
    if (permStatus.display !== 'granted') {
      await LocalNotifications.requestPermissions();
    }

    await ensureNotificationChannel();

    LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
      const extra = action.notification.extra as NotificationDeepLink | undefined;
      if (extra && extra.view) {
        executeDeepLink(extra);
      }
    });

    isNativeListenerAttached = true;
  } catch (err) {
    console.warn('[NotificationService] Failed to init native listener:', err);
  }
}

/**
 * Executes deep-link navigation directly to target screen and tab.
 */
export function executeDeepLink(deepLink: NotificationDeepLink): void {
  if (typeof window === 'undefined') return;

  // 1. Dispatch global navigation event consumed by App.tsx
  window.dispatchEvent(
    new CustomEvent('sera:deep-link-navigation', {
      detail: deepLink,
    })
  );

  // 2. Dispatch targeted view events for immediate sub-tab focus
  if (deepLink.view === 'merchant' && deepLink.tab) {
    window.dispatchEvent(
      new CustomEvent('sera:merchant-set-view', {
        detail: { view: deepLink.tab, orderId: deepLink.orderId },
      })
    );
  } else if (deepLink.view === 'driver' && deepLink.tab) {
    window.dispatchEvent(
      new CustomEvent('sera:driver-set-tab', {
        detail: { tab: deepLink.tab, stopId: deepLink.stopId, orderId: deepLink.orderId },
      })
    );
  } else if (deepLink.view === 'marketplace') {
    window.dispatchEvent(
      new CustomEvent('sera:marketplace-deep-link', {
        detail: { tab: deepLink.tab || 'PROCESSING', orderId: deepLink.orderId },
      })
    );
  }
}

/**
 * Dispatches a direct deep-link notification across:
 * 1. Native status bar (Capacitor)
 * 2. Web browser notification (Web API)
 * 3. In-App Heads-Up Banner (floating dynamic toast)
 * 4. Audio chime and vibration
 */
export async function dispatchDirectNotification(payload: DirectNotificationPayload): Promise<void> {
  const notifId = payload.id || Math.floor(Math.random() * 899999 + 100000);
  const prefs = getNotificationPreferences();

  // 0. Filter notification by category preference
  if (payload.type === 'merchant_order' && !prefs.merchantOrders) {
    return;
  }
  if (payload.type === 'courier_delivery' && !prefs.courierDeliveries) {
    return;
  }
  if (payload.type === 'buyer_order' && !prefs.buyerOrders) {
    return;
  }

  // 1. Sound & Vibration based on user preferences
  if (payload.sound !== false && prefs.sound) {
    playNotificationChime();
  }
  if (payload.vibrate !== false && prefs.vibration) {
    triggerNotificationVibration();
  }

  // 2. Broadcast in-app Heads-Up banner event
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('sera:heads-up-notification', {
        detail: { ...payload, id: notifId },
      })
    );
  }

  // 3. Native Capacitor status bar notification
  if (isNativeMobile()) {
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      await ensureNotificationChannel();
      await LocalNotifications.schedule({
        notifications: [
          {
            id: notifId,
            title: payload.title,
            body: payload.body,
            channelId: 'sera_orders_channel',
            extra: payload.deepLink,
          },
        ],
      });
      return;
    } catch (err) {
      console.warn('[NotificationService] Native local notification error:', err);
    }
  }

  // 4. Web browser native notification fallback (when window is blurred or backgrounded)
  if (typeof window !== 'undefined' && 'Notification' in window) {
    try {
      if (Notification.permission === 'granted') {
        const n = new Notification(payload.title, {
          body: payload.body,
          icon: '/favicon.ico',
        });
        n.onclick = () => {
          window.focus();
          executeDeepLink(payload.deepLink);
          n.close();
        };
      } else if (Notification.permission === 'default') {
        Notification.requestPermission().then((perm) => {
          if (perm === 'granted') {
            const n = new Notification(payload.title, {
              body: payload.body,
              icon: '/favicon.ico',
            });
            n.onclick = () => {
              window.focus();
              executeDeepLink(payload.deepLink);
              n.close();
            };
          }
        });
      }
    } catch {
      // Ignored for environments restricting Notification constructor
    }
  }
}

