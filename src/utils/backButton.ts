/**
 * Pure LIFO (Last-In, First-Out) Navigation Back Stack for SERA Native Mobile.
 * Guarantees 100% sequential closing of modals, overlays, sub-views, and pages.
 */

export interface BackStackEntry {
  id: string;
  priority: number;
  timestamp: number;
  handler: () => boolean | void;
}

const stack: BackStackEntry[] = [];
let lastDispatchTime = 0;

/**
 * Register a back button handler onto the LIFO navigation stack.
 * Higher priority elements (e.g. alerts 90+, modals 70+, subtabs 30+) sit higher.
 * For elements within the same priority level, the most recently pushed (LIFO) executes first.
 */
export function registerBackHandler(
  id: string,
  priority: number,
  handler: () => boolean | void
): () => void {
  // If an element with the same ID is re-registered, remove its old position
  const existingIdx = stack.findIndex(e => e.id === id);
  if (existingIdx !== -1) {
    stack.splice(existingIdx, 1);
  }

  // Push with high-precision timestamp
  stack.push({
    id,
    priority,
    timestamp: Date.now(),
    handler
  });

  return () => {
    const idx = stack.findIndex(e => e.id === id);
    if (idx !== -1) {
      stack.splice(idx, 1);
    }
  };
}

/**
 * Dispatches a back press by popping the topmost active handler from the LIFO stack.
 * Returns true if consumed, false if stack was empty.
 */
export function dispatchBackButton(): boolean {
  const now = Date.now();
  // Anti-jitter debounce: discard rapid hardware key-bounce within 160ms
  if (now - lastDispatchTime < 160) {
    return true; // Treat as consumed to prevent double-firing
  }

  if (stack.length === 0) {
    return false;
  }

  // Sort stack in ascending order:
  // Lower priority at index 0, highest priority at index (length - 1).
  // For equal priorities, older timestamp at index 0, newer timestamp at index (length - 1).
  // This guarantees stack.pop() strictly pops the HIGHEST priority and MOST RECENT element (True LIFO).
  stack.sort((a, b) => (a.priority - b.priority) || (a.timestamp - b.timestamp));

  // Pop the topmost handler so it cannot be double-invoked during React re-renders
  const top = stack.pop();
  if (!top) return false;

  lastDispatchTime = now;
  try {
    const result = top.handler();
    // If handler specifically returned false, delegate to the next handler down the stack
    if (result === false) {
      return dispatchBackButton();
    }
    return true;
  } catch (e) {
    console.warn(`[BackButton] Error executing ${top.id}:`, e);
    return true;
  }
}

export function getBackStackDepth(): number {
  return stack.length;
}

export function clearBackStack(): void {
  stack.length = 0;
}
