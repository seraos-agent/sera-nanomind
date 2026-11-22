export function parseBarChart(rawText: string) {
  const lines = rawText.trim().split('\n');
  let title = '';
  let description = '';
  let footer = '';
  const items: Array<{ label: string; value?: string; percentage: number }> = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.toLowerCase().startsWith('title:')) {
      title = trimmed.slice(6).trim();
    } else if (trimmed.toLowerCase().startsWith('description:') || trimmed.toLowerCase().startsWith('desc:')) {
      description = trimmed.replace(/^(description|desc):/i, '').trim();
    } else if (trimmed.toLowerCase().startsWith('footer:') || trimmed.toLowerCase().startsWith('note:')) {
      footer = trimmed.replace(/^(footer|note):/i, '').trim();
    } else if (trimmed.includes('|')) {
      const parts = trimmed.split('|').map(p => p.trim());
      if (parts.length >= 2) {
        const label = parts[0];
        const value = parts.length >= 3 ? parts[1] : undefined;
        const pctStr = parts.length >= 3 ? parts[2] : parts[1];
        let pct = parseFloat(pctStr.replace('%', ''));
        if (isNaN(pct)) pct = 50;
        items.push({ label, value, percentage: pct });
      }
    } else if (trimmed.includes(',')) {
      const parts = trimmed.split(',').map(p => p.trim());
      if (parts.length >= 2) {
        const label = parts[0];
        const value = parts.length >= 3 ? parts[1] : undefined;
        const pctStr = parts.length >= 3 ? parts[2] : parts[1];
        let pct = parseFloat(pctStr.replace('%', ''));
        if (isNaN(pct)) pct = 50;
        items.push({ label, value, percentage: pct });
      }
    }
  }

  return { title, description, footer, items };
}

export function normalizeMarkdownContent(content: string): string {
  if (typeof content !== 'string') return content;
  return content.replace(/(?<!-)\s*\u2014\s*(?!-)/g, ', ');
}

export function isImageUrl(url: string | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  return /\.(png|jpg|jpeg|webp|gif|svg)(\?.*)?$/i.test(url) ||
         url.includes('dashscope-result') ||
         url.includes('aliyuncs.com');
}

export function extractImageUrlsFromText(text: string): { urls: string[]; cleanedText: string } {
  if (!text || typeof text !== 'string') return { urls: [], cleanedText: text || '' };

  const urls: string[] = [];
  let cleaned = text;

  const mdImgRegex = /!\[.*?\]\((https?:\/\/[^\s\)]+)\)/g;
  let match: RegExpExecArray | null;
  while ((match = mdImgRegex.exec(text)) !== null) {
    if (match[1] && !urls.includes(match[1])) {
      urls.push(match[1]);
    }
  }
  cleaned = cleaned.replace(mdImgRegex, '');

  const mdLinkImgRegex = /\[.*?\]\((https?:\/\/[^\s\)]+(?:\.(?:png|jpg|jpeg|webp|gif|svg)|dashscope|aliyuncs|blob\.core\.windows\.net|images\.unsplash\.com)[^\s\)]*)\)/gi;
  while ((match = mdLinkImgRegex.exec(text)) !== null) {
    if (match[1] && !urls.includes(match[1])) {
      urls.push(match[1]);
    }
  }
  cleaned = cleaned.replace(mdLinkImgRegex, '');

  const rawImgRegex = /(https?:\/\/[^\s<>"'\)]+?(?:\.(?:png|jpg|jpeg|webp|gif|svg)(?:\?[^\s<>"'\)]*)?|dashscope-result[^\s<>"'\)]*|aliyuncs\.com\/[^\s<>"'\)]*))/gi;
  while ((match = rawImgRegex.exec(cleaned)) !== null) {
    const rawUrl = match[1];
    if (rawUrl && !urls.includes(rawUrl)) {
      urls.push(rawUrl);
    }
  }
  cleaned = cleaned.replace(/^\s*https?:\/\/[^\s<>"'\)]+?(?:\.(?:png|jpg|jpeg|webp|gif|svg)(?:\?[^\s<>"'\)]*)?|dashscope-result[^\s<>"'\)]*|aliyuncs\.com\/[^\s<>"'\)]*)\s*$/gim, '');

  return { urls, cleanedText: cleaned.trim() };
}
