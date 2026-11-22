export type SocketListener = (...args: any[]) => void;

/**
 * In-memory Socket-compatible event bus for standalone local runtime execution.
 * Replaces socket.io-client so all existing SERA UI modules operate seamlessly offline.
 */
export class LocalNanoMindSocket {
  public connected = true;
  private listeners = new Map<string, Set<SocketListener>>();
  private outboundHandler: ((event: string, payload?: any) => void) | null = null;

  public setOutboundHandler(handler: (event: string, payload?: any) => void): void {
    this.outboundHandler = handler;
  }

  public on(event: string, listener: SocketListener): this {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
    return this;
  }

  public off(event: string, listener?: SocketListener): this {
    if (!listener) {
      this.listeners.delete(event);
      return this;
    }
    this.listeners.get(event)?.delete(listener);
    return this;
  }

  public dispatchIncoming(event: string, ...args: any[]): void {
    const set = this.listeners.get(event);
    if (!set) return;
    for (const fn of Array.from(set)) {
      try {
        fn(...args);
      } catch (err) {
        console.warn(`[LocalNanoMindSocket] Listener error on "${event}":`, err);
      }
    }
  }

  public emit(event: string, payload?: any): this {
    this.outboundHandler?.(event, payload);
    return this;
  }

  public close(): void {
    this.connected = false;
    this.listeners.clear();
  }
}

export type Socket = LocalNanoMindSocket;
