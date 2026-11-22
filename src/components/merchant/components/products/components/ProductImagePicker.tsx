import React, { useState } from "react";
import { Camera, X, AlertCircle } from "lucide-react";
import type { ThemeType } from "../../../../../theme";
import type { StoreType } from "../../../types";
import { compressImageFile } from "../../../../../utils/imageCompressor";

interface ProductImagePickerProps {
  theme: ThemeType;
  storeType: StoreType;
  prodImages: string[];
  setProdImages: React.Dispatch<React.SetStateAction<string[]>>;
}

export const ProductImagePicker: React.FC<ProductImagePickerProps> = ({
  theme,
  storeType,
  prodImages,
  setProdImages
}) => {
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
    slotIndex: number
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadError(null);

    try {
      const newImages = [...prodImages];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith("image/")) {
          setUploadError(
            `Format file "${file.name}" tidak didukung. Harap pilih gambar (JPG, PNG, atau WEBP).`
          );
          continue;
        }

        // Smart client-side compression: scales down any photo resolution (even 15MB+) to ~50KB
        // Staged Draft Pattern: kept locally for instant preview without touching Cloudflare R2.
        // The image is ONLY uploaded to Cloudflare R2 when the merchant clicks "Simpan Produk".
        const compressed = await compressImageFile(file, {
          maxWidth: 720,
          maxHeight: 720,
          quality: 0.78
        });

        const targetIdx = slotIndex + i;
        if (targetIdx < newImages.length) {
          newImages[targetIdx] = compressed;
        } else if (newImages.length < 3) {
          newImages.push(compressed);
        }
      }
      setProdImages(newImages.slice(0, 3));
    } catch (err) {
      console.error("Failed to process image:", err);
      setUploadError("Gagal memproses foto. Silakan coba kembali.");
    } finally {
      e.target.value = "";
    }
  };

  const handleRemoveImage = (slotIndex: number) => {
    setProdImages((prev) => prev.filter((_, idx) => idx !== slotIndex));
  };

  return (
    <div
      style={{
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderRadius: 12,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 12
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: theme.ink }}>
          Foto {storeType === "FOOD" ? "Menu" : "Produk"}
        </label>
        <span style={{ fontSize: 11, color: theme.inkSoft }}>{prodImages.length}/3 Foto</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
        {[0, 1, 2].map((slotIndex) => {
          const imgUrl = prodImages[slotIndex];
          return (
            <div
              key={slotIndex}
              style={{
                position: "relative",
                aspectRatio: "1/1",
                borderRadius: 10,
                border: `1px ${imgUrl ? "solid" : "dashed"} ${theme.border}`,
                background: theme.surface2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden"
              }}
            >
              {imgUrl ? (
                <>
                  <img
                    src={imgUrl}
                    alt={`Foto ${slotIndex + 1}`}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  {slotIndex === 0 && (
                    <span
                      style={{
                        position: "absolute",
                        bottom: 4,
                        left: 4,
                        background: theme.accent,
                        color: "#FFFFFF",
                        fontSize: 9,
                        fontWeight: 700,
                        padding: "2px 6px",
                        borderRadius: 4
                      }}
                    >
                      Utama
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(slotIndex)}
                    title="Hapus Foto"
                    style={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: "rgba(0,0,0,0.6)",
                      color: "#FFFFFF",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      padding: 0
                    }}
                  >
                    <X size={12} />
                  </button>
                </>
              ) : (
                <label
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 5,
                    cursor: "pointer",
                    padding: 6,
                    boxSizing: "border-box"
                  }}
                >
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    style={{ display: "none" }}
                    onChange={(e) => handleFileSelect(e, slotIndex)}
                  />
                  <Camera size={18} color={theme.inkSoft} />
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 500,
                      color: theme.inkSoft,
                      textAlign: "center"
                    }}
                  >
                    {slotIndex === 0 ? "+ Foto Utama" : `+ Foto ${slotIndex + 1}`}
                  </span>
                </label>
              )}
            </div>
          );
        })}
      </div>

      {/* Upload Error Banner */}
      {uploadError && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 12px",
            borderRadius: 8,
            background: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.25)",
            color: "#EF4444",
            fontSize: 12,
            marginTop: 6
          }}
        >
          <AlertCircle size={15} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1, lineHeight: 1.3 }}>{uploadError}</span>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            style={{
              background: "none",
              border: "none",
              color: "#EF4444",
              cursor: "pointer",
              padding: 2,
              display: "flex",
              alignItems: "center"
            }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 4 }}>
        <span style={{ fontSize: 11, color: theme.inkSoft }}>
          Foto pertama otomatis menjadi foto sampul etalase toko.
        </span>
        <span style={{ fontSize: 10, color: theme.inkSoft, opacity: 0.85 }}>
          Maks. 3 foto • Maks. 5 MB per foto (JPG, PNG, WEBP) • Otomatis dikompres agar cepat dimuat pembeli.
        </span>
      </div>
    </div>
  );
};

