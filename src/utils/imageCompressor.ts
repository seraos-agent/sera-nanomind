/**
 * Client-side image compression utility.
 * Resizes images down to maximum specified dimensions and compresses to JPEG,
 * reducing a 3-10MB mobile camera photo to ~30-60KB without visible quality loss for receipts.
 */

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  cropSquare?: boolean;
  mimeType?: string;
}

export function compressImageFile(file: File, options: CompressOptions = {}): Promise<string> {
  const { maxWidth = 800, maxHeight = 800, quality = 0.65, cropSquare = false, mimeType = "image/jpeg" } = options;

  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      return reject(new Error("File bukan format gambar yang valid"));
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      if (!rawDataUrl) {
        return reject(new Error("Gagal membaca data gambar"));
      }

      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            return resolve(rawDataUrl);
          }

          if (cropSquare) {
            // 1:1 Center-crop logic for avatars and profile pictures
            const minSourceDim = Math.min(img.width, img.height);
            const sourceX = Math.round((img.width - minSourceDim) / 2);
            const sourceY = Math.round((img.height - minSourceDim) / 2);
            const targetDim = Math.min(maxWidth, maxHeight, minSourceDim);

            canvas.width = Math.max(1, targetDim);
            canvas.height = Math.max(1, targetDim);

            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, sourceX, sourceY, minSourceDim, minSourceDim, 0, 0, canvas.width, canvas.height);
          } else {
            // Standard aspect-ratio preserving downscale
            let { width, height } = img;
            if (width > maxWidth || height > maxHeight) {
              if (width / height > maxWidth / maxHeight) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
              } else {
                width = Math.round((width * maxHeight) / height);
                height = maxHeight;
              }
            }

            canvas.width = Math.max(1, width);
            canvas.height = Math.max(1, height);

            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
          }

          const compressedDataUrl = canvas.toDataURL(mimeType, quality);
          resolve(compressedDataUrl);
        } catch {
          // Fallback to original data URL if canvas manipulation fails
          resolve(rawDataUrl);
        }
      };

      img.onerror = () => {
        reject(new Error("Gagal memuat format gambar"));
      };

      img.src = rawDataUrl;
    };

    reader.onerror = () => {
      reject(new Error("Gagal membaca file gambar"));
    };

    reader.readAsDataURL(file);
  });
}

