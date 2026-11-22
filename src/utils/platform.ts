/**
 * Platform & Network Utilities for SERA.
 * Standardizes API/WebSocket routing across Native Mobile (Capacitor) and Web.
 */

export function isNativeMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(
    (window as any).Capacitor?.isNativePlatform?.() ||
    window.location.protocol === 'capacitor:'
  );
}

export function getApiBaseUrl(): string {
  if (isNativeMobile()) {
    return 'https://api.seraos.xyz';
  }
  const envUrl = (import.meta.env.VITE_API_URL || '').replace(/[\r\n\t]/g, '').trim();
  if (envUrl) return envUrl;
  if (typeof window !== 'undefined') {
    const { hostname, port } = window.location;
    if (
      (hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.startsWith('172.')) &&
      (port === '5173' || port === '5174')
    ) {
      return `http://${hostname}:3001`;
    }
  }
  return 'https://api.seraos.xyz';
}

export function getWebSocketUrl(): string {
  if (isNativeMobile()) {
    return 'wss://api.seraos.xyz';
  }
  const envWs = (import.meta.env.VITE_WS_URL || '').replace(/[\r\n\t]/g, '').trim();
  if (envWs) return envWs;
  if (typeof window !== 'undefined') {
    const { hostname, port } = window.location;
    if (
      (hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.startsWith('172.')) &&
      (port === '5173' || port === '5174')
    ) {
      return `ws://${hostname}:3001`;
    }
  }
  return 'wss://api.seraos.xyz';
}

