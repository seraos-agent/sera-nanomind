export interface ReviewItem {
  id: string;
  author: string;
  rating: number;
  date: string;
  avatarBg: string;
  avatarColor: string;
  comment: string;
  variant?: string;
  photos?: string[];
  reply?: {
    text: string;
    repliedAt: number;
  };
}

export function formatRelativeTime(timestamp?: number): string {
  if (!timestamp) return 'Just now';
  const diffMs = Date.now() - timestamp;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${Math.max(1, diffMins)}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(timestamp).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

