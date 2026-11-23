import ReactDOM from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import AppRoot from './AppRoot';
import './index.css';
import { ensureDemoCommerceSeeded } from './services/demoCommerceSeed';
import { installLocalMarketApiInterceptor } from './services/localMarketApiInterceptor';

if (typeof window !== 'undefined') {
  const filterPattern = /(?:\[PHANTOM\]|disconnected port object|Failed to send message to service worker|evmAsk)/i;
  (['error', 'warn', 'log', 'info'] as const).forEach(method => {
    const orig = console[method];
    console[method] = (...args: any[]) => {
      const str = args.map(a => (typeof a === 'string' ? a : (a?.message || a?.toString?.() || ''))).join(' ');
      if (filterPattern.test(str)) return;
      orig.apply(console, args);
    };
  });

  ensureDemoCommerceSeeded();
  installLocalMarketApiInterceptor();

  if (import.meta.env.PROD && 'serviceWorker' in navigator && !Capacitor.isNativePlatform()) {
    const registerSw = () => {
      const emitSwReady = () => {
        window.dispatchEvent(new CustomEvent('sera_sw_ready'));
      };

      navigator.serviceWorker.addEventListener('controllerchange', emitSwReady);
      navigator.serviceWorker.ready.then(emitSwReady).catch(() => {});

      navigator.serviceWorker
        .register('/sw.js', { updateViaCache: 'none' })
        .then((reg) => {
          reg.update().catch(() => {});
          if (navigator.serviceWorker.controller) {
            emitSwReady();
          }
        })
        .catch((err) => {
          console.warn('[SERA-PWA] Service worker registration skipped:', err);
        });
    };

    if (document.readyState === 'complete') {
      registerSw();
    } else {
      window.addEventListener('load', registerSw, { once: true });
    }
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <AppRoot />
);
