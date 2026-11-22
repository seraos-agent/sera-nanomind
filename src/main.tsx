import ReactDOM from 'react-dom/client';
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
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <AppRoot />
);
