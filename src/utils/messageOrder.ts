/**
 * Utility functions for deterministic message timestamp extraction,
 * chronological sorting, and reliable deduplicating reconciliation.
 * 
 * Enforces Rule 7 (Universal Codebase Language: English Standard).
 */

export function getMessageTimestamp(msg: any): number {
  if (!msg) return 0;
  if (typeof msg.createdAt === 'number' && msg.createdAt > 0) return msg.createdAt;
  if (typeof msg.timestamp === 'number' && msg.timestamp > 0) return msg.timestamp;
  if (typeof msg.id === 'number' && msg.id > 1e11) return msg.id;
  if (typeof msg.id === 'string' && /^\d+$/.test(msg.id)) {
    const num = Number(msg.id);
    if (num > 1e11) return num;
  }
  if (typeof msg.clientMessageId === 'string') {
    const match = msg.clientMessageId.match(/^msg-(\d+)-/);
    if (match && match[1]) {
      const ts = Number(match[1]);
      if (ts > 1e11) return ts;
    }
  }
  return 0;
}

export function sortMessagesChronologically<T = any>(msgs: T[]): T[] {
  if (!Array.isArray(msgs) || msgs.length <= 1) return msgs || [];
  return [...msgs].sort((a: any, b: any) => {
    const timeA = getMessageTimestamp(a);
    const timeB = getMessageTimestamp(b);
    if (timeA !== timeB) return timeA - timeB;
    // Tie-breaker: if identical timestamp, user message always comes before agent reply
    if (a.role === 'user' && b.role === 'agent') return -1;
    if (a.role === 'agent' && b.role === 'user') return 1;
    return (Number(a.id) || 0) - (Number(b.id) || 0);
  });
}

/**
 * Reconciles two message lists (e.g. server history & local state),
 * deduplicating by clientMessageId, id, or content within a time window,
 * and returning a strictly chronologically sorted list.
 */
export function reconcileMessages(existing: any[], incoming: any[]): any[] {
  const existingList = Array.isArray(existing) ? existing : [];
  const incomingList = Array.isArray(incoming) ? incoming : [];

  if (existingList.length === 0) return sortMessagesChronologically(incomingList);
  if (incomingList.length === 0) return sortMessagesChronologically(existingList);

  const merged = [...incomingList];

  for (const localMsg of existingList) {
    if (!localMsg) continue;
    const localTime = getMessageTimestamp(localMsg);

    const matchIndex = merged.findIndex((serverMsg) => {
      if (!serverMsg) return false;
      if (localMsg.clientMessageId && serverMsg.clientMessageId) {
        return localMsg.clientMessageId === serverMsg.clientMessageId;
      }
      if (localMsg.id && serverMsg.id && localMsg.id === serverMsg.id) {
        return true;
      }
      if (localMsg.role === serverMsg.role && localMsg.content === serverMsg.content) {
        const serverTime = getMessageTimestamp(serverMsg);
        return Math.abs(localTime - serverTime) < 120000;
      }
      return false;
    });

    if (matchIndex >= 0) {
      // Merge properties preserving rich client metadata if server only had partial data
      const serverMsg = merged[matchIndex];
      merged[matchIndex] = {
        ...localMsg,
        ...serverMsg,
        createdAt: serverMsg.createdAt || localMsg.createdAt || localTime,
        timestamp: serverMsg.timestamp || localMsg.timestamp || localTime,
        durationSeconds: (typeof serverMsg.durationSeconds === 'number' && serverMsg.durationSeconds > 0)
          ? serverMsg.durationSeconds
          : localMsg.durationSeconds,
        hadTools: serverMsg.hadTools !== undefined
          ? serverMsg.hadTools
          : localMsg.hadTools,
        cognitiveSteps: (serverMsg.cognitiveSteps && serverMsg.cognitiveSteps.length > 0)
          ? serverMsg.cognitiveSteps
          : localMsg.cognitiveSteps,
        images: serverMsg.images || localMsg.images,
        documents: serverMsg.documents || localMsg.documents,
      };
    } else {
      merged.push(localMsg);
    }
  }

  return sortMessagesChronologically(merged);
}
