export function parseOrderItems(itemsSummary?: string): string[] {
  if (!itemsSummary) return [];
  const trimmed = itemsSummary.trim();
  if (!trimmed) return [];
  if (trimmed.includes("\n")) {
    return trimmed.split("\n").map((s) => s.trim()).filter(Boolean);
  }
  // Split on comma followed by a quantity indicator like "2x", "1 x", "2pcs"
  const qtySplit = trimmed.split(/,\s*(?=\d+\s*[xX]|\d+\s*pcs)/);
  if (qtySplit.length > 1) {
    return qtySplit.map((s) => s.trim()).filter(Boolean);
  }
  // Fallback: split by comma if each segment looks like a distinct item
  const commaSplit = trimmed.split(/,\s*/);
  if (commaSplit.length > 1) {
    return commaSplit.map((s) => s.trim()).filter(Boolean);
  }
  return [trimmed];
}

