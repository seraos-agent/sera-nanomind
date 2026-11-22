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
  if (!timestamp) return 'Baru saja';
  const diffMs = Date.now() - timestamp;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${Math.max(1, diffMins)} mnt lalu`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} jam lalu`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Kemarin';
  if (diffDays < 7) return `${diffDays} hari lalu`;
  return new Date(timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

