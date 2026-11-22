import { getApiBaseUrl } from "../../../../utils/platform";

export interface ImageAttachment {
  id: string;
  previewUrl: string;
  dataUrl?: string;
  publicUrl?: string;
  name: string;
  size: number;
  uploading: boolean;
  isVideo?: boolean;
  error?: string;
}

export interface DocumentAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  content?: string;
  base64?: string;
}

export function processMediaFileUpload(
  file: File,
  onAdd: (attachment: ImageAttachment) => void,
  onUpdate: (id: string, patch: Partial<ImageAttachment>) => void
) {
  const isVideo = file.type.startsWith('video/');
  const id = `${isVideo ? 'vid' : 'img'}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const previewUrl = URL.createObjectURL(file);
  const newAttachment: ImageAttachment = {
    id,
    previewUrl,
    name: file.name || (isVideo ? 'video.mp4' : 'image.png'),
    size: file.size,
    uploading: true,
    isVideo
  };
  onAdd(newAttachment);

  const apiUrl = getApiBaseUrl();

  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = async () => {
    const rawDataUrl = reader.result as string;

    if (isVideo) {
      // Video: Store raw dataUrl immediately without canvas resize
      onUpdate(id, { dataUrl: rawDataUrl });

      try {
        const res = await fetch(`${apiUrl}/api/upload/media`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataUrl: rawDataUrl, filename: file.name })
        });
        const data = await res.json();
        if (data && data.url && typeof data.url === 'string' && !data.url.startsWith('blob:')) {
          onUpdate(id, { publicUrl: data.url, uploading: false });
        } else {
          onUpdate(id, { publicUrl: rawDataUrl, uploading: false });
        }
      } catch {
        onUpdate(id, { publicUrl: rawDataUrl, uploading: false });
      }
      return;
    }

    // Smart Client-Side Resizing (Max 1600px) for fast image upload
    const img = new Image();
    img.src = rawDataUrl;
    img.onload = async () => {
      let finalDataUrl = rawDataUrl;
      try {
        const maxDim = 1600;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            finalDataUrl = canvas.toDataURL('image/jpeg', 0.88);
          }
        }
      } catch {
        finalDataUrl = rawDataUrl;
      }

      onUpdate(id, { dataUrl: finalDataUrl });

      try {
        const res = await fetch(`${apiUrl}/api/upload/media`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataUrl: finalDataUrl, filename: file.name })
        });
        const data = await res.json();
        if (data && data.url && typeof data.url === 'string' && !data.url.startsWith('blob:')) {
          onUpdate(id, { publicUrl: data.url, uploading: false });
        } else {
          onUpdate(id, { publicUrl: finalDataUrl, uploading: false });
        }
      } catch {
        onUpdate(id, { publicUrl: finalDataUrl, uploading: false });
      }
    };
  };
}

export function readDocumentFileAttachment(
  file: File,
  onAdd: (doc: DocumentAttachment) => void
) {
  const id = `doc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const ext = file.name.toLowerCase().split('.').pop() || '';
  const isBinary = ext === 'xlsx' || ext === 'xls' || ext === 'pdf';

  const reader = new FileReader();
  if (isBinary) {
    reader.readAsDataURL(file);
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1] || dataUrl;
      onAdd({
        id,
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        base64
      });
    };
  } else {
    reader.readAsText(file);
    reader.onload = () => {
      const text = reader.result as string;
      onAdd({
        id,
        name: file.name,
        size: file.size,
        type: file.type || 'text/plain',
        content: text
      });
    };
  }
}
