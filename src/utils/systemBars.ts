/**
 * System Bars (Status Bar & Navigation Bar) Synchronizer for SERA Native Mobile.
 * Uses direct window.AndroidSystemBars or Capacitor SystemBars plugin, falling back
 * to @capacitor/status-bar only if neither custom bridge succeeds.
 */
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

interface SystemBarsPluginInterface {
  setStyle(options: { isDark: boolean; color: string }): Promise<void>;
  getInsets(): Promise<{ top: number; bottom: number }>;
}

let initialSyncCompleted = false;

async function executeSystemBarsSync(isDark: boolean, targetColor: string): Promise<void> {
  // 1. Web meta theme-color for PWA & mobile web browsers
  if (typeof document !== 'undefined') {
    let metaTheme = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
    if (!metaTheme) {
      metaTheme = document.createElement('meta');
      metaTheme.name = 'theme-color';
      document.head.appendChild(metaTheme);
    }
    metaTheme.content = targetColor;
  }

  // 2. Native Android/iOS system bars
  if (Capacitor.isNativePlatform()) {
    let customBridgeHandled = false;

    // Prefer synchronous Android bridge when present
    try {
      const androidBridge = (window as any).AndroidSystemBars;
      if (androidBridge && typeof androidBridge.setSystemBars === 'function') {
        androidBridge.setSystemBars(isDark, targetColor);
        customBridgeHandled = true;
      }
    } catch (e) {
      console.debug('[SystemBars] Direct Android bridge error:', e);
    }

    if (!customBridgeHandled) {
      try {
        const nativeSystemBars = (Capacitor as any).Plugins?.SystemBars as
          | Partial<SystemBarsPluginInterface>
          | undefined;
        if (typeof nativeSystemBars?.setStyle === 'function') {
          await nativeSystemBars.setStyle({ isDark, color: targetColor });
          customBridgeHandled = true;
        }
      } catch (e) {
        console.debug('[SystemBars] NativeSystemBars error:', e);
      }
    }

    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--safe-area-top', '0px');
      document.documentElement.style.setProperty('--safe-area-bottom', '0px');
    }

    if (!customBridgeHandled) {
      try {
        await StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
        await StatusBar.setBackgroundColor({ color: targetColor });
      } catch (e) {
        console.debug('[SystemBars] Capacitor StatusBar error:', e);
      }
    }
  }
}

export async function syncSystemBars(isDark: boolean, customColor?: string): Promise<void> {
  const targetColor = customColor || (isDark ? '#000000' : '#FFFFFF');
  const isFirstSync = !initialSyncCompleted;
  initialSyncCompleted = true;

  await executeSystemBarsSync(isDark, targetColor);

  // Only run the 200ms warmup retry once during initial WebView startup
  if (isFirstSync && Capacitor.isNativePlatform()) {
    setTimeout(() => {
      executeSystemBarsSync(isDark, targetColor).catch(() => {});
    }, 200);
  }
}
