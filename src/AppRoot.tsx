import { lazy, Suspense } from 'react';

// The app shell brings in the main workspace and real-time client.
const App = lazy(() => import('./App'));

export default function AppRoot() {
  return (
    <Suspense fallback={<div aria-label="Loading Sera" style={{ height: '100%', width: '100%', backgroundColor: 'var(--bg-primary)' }} />}>
      <App />
    </Suspense>
  );
}
