import React from "react";
import { Camera, Trash2, RotateCcw, CheckCircle2 } from "lucide-react";
import type { ThemeType } from "../../../../../theme";
import type { StoreType } from "../../../types";
import { STORE_CATEGORIES, compressImage, getStoreEntityLabel } from "../../../types";
import { CustomSelectField } from "./CustomSelectField";

export interface ProfileSubpageFormProps {
  theme: ThemeType;
  isMobileView?: boolean;
  editBannerUrl: string;
  setEditBannerUrl: (v: string) => void;
  editLogoUrl: string;
  setEditLogoUrl: (v: string) => void;
  editName: string;
  setEditName: (v: string) => void;
  editType: StoreType;
  setEditType: (v: StoreType) => void;
  editCategory: string;
  setEditCategory: (v: string) => void;
  editWhatsapp?: string;
  setEditWhatsapp?: (v: string) => void;
  isWhatsappVerified?: boolean;
  onOpenWaModal?: () => void;
  editDescription: string;
  setEditDescription: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onResetStore?: () => void;
}

export const ProfileSubpageForm: React.FC<ProfileSubpageFormProps> = ({
  theme,
  isMobileView,
  editBannerUrl,
  setEditBannerUrl,
  editLogoUrl,
  setEditLogoUrl,
  editName,
  setEditName,
  editType,
  setEditType,
  editCategory,
  setEditCategory,
  editWhatsapp = "",
  setEditWhatsapp,
  isWhatsappVerified = false,
  onOpenWaModal,
  editDescription,
  setEditDescription,
  onSubmit,
  onResetStore
}) => {
  const entity = getStoreEntityLabel(editType);
  const entityLower = getStoreEntityLabel(editType, true);
  const handleBannerFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran banner terlalu besar. Maksimal ukuran file adalah 5 MB.");
        e.target.value = "";
        return;
      }
      try {
        const compressed = await compressImage(file, 1200, 0.85);
        setEditBannerUrl(compressed);
      } catch (err) {
        console.error("Failed to process banner image:", err);
      } finally {
        e.target.value = "";
      }
    }
  };

  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran logo terlalu besar. Maksimal ukuran file adalah 5 MB.");
        e.target.value = "";
        return;
      }
      try {
        const compressed = await compressImage(file, 500, 0.85);
        setEditLogoUrl(compressed);
      } catch (err) {
        console.error("Failed to process logo image:", err);
      } finally {
        e.target.value = "";
      }
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Banner & Logo Visual Box */}
      <div
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 20,
          overflow: "hidden",
          position: "relative"
        }}
      >
        {/* Banner Viewport */}
        <div
          style={{
            height: isMobileView ? 120 : 150,
            width: "100%",
            position: "relative",
            background: editBannerUrl ? "transparent" : theme.surface2,
            borderBottom: `1px solid ${theme.border}`
          }}
        >
          {editBannerUrl ? (
            <img
              src={editBannerUrl}
              alt={`Banner ${entity}`}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          ) : (
            <label
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                gap: 6,
                color: theme.inkSoft,
                fontSize: 12.5,
                fontWeight: 600,
                transition: "background 150ms ease"
              }}
            >
              <Camera size={16} />
              <span>Tambah Banner {entity}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleBannerFileChange}
                style={{ display: "none" }}
              />
            </label>
          )}

          {/* Floating Banner Actions */}
          {editBannerUrl && (
            <div
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                display: "flex",
                alignItems: "center",
                gap: 6,
                zIndex: 2
              }}
            >
              <label
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "5px 12px",
                  borderRadius: 20,
                  background: "rgba(0,0,0,0.6)",
                  color: "#FFFFFF",
                  fontSize: 11.5,
                  fontWeight: 600,
                  cursor: "pointer",
                  backdropFilter: "blur(8px)"
                }}
              >
                <Camera size={12} />
                <span>Ganti</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerFileChange}
                  style={{ display: "none" }}
                />
              </label>

              <button
                type="button"
                onClick={() => setEditBannerUrl("")}
                title="Hapus Banner"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 28,
                  height: 28,
                  borderRadius: 20,
                  background: "rgba(0,0,0,0.6)",
                  color: "#FFFFFF",
                  border: "none",
                  cursor: "pointer",
                  backdropFilter: "blur(8px)"
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.85)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.6)";
                }}
              >
                <Trash2 size={13} />
              </button>
            </div>
          )}
        </div>

        {/* Profile Identity Bar */}
        <div
          style={{
            padding: isMobileView ? "0 16px 16px" : "0 22px 18px",
            display: "flex",
            flexDirection: isMobileView ? "column" : "row",
            alignItems: isMobileView ? "flex-start" : "center",
            justifyContent: "space-between",
            position: "relative",
            gap: isMobileView ? 12 : 16
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14, minWidth: 0, flex: 1 }}>
            {/* Circular Avatar overlapping the banner */}
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                border: `3px solid ${theme.surface}`,
                background: theme.surface2,
                overflow: "hidden",
                position: "relative",
                boxShadow: "0 4px 14px rgba(0,0,0,0.10)",
                flexShrink: 0,
                marginTop: -36,
                zIndex: 2
              }}
            >
              {editLogoUrl ? (
                <img
                  src={editLogoUrl}
                  alt={`Logo ${entity}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: theme.inkSoft
                  }}
                >
                  <Camera size={22} />
                </div>
              )}

              <label
                title="Upload Foto Logo"
                style={{
                  position: "absolute",
                  inset: 0,
                  background: editLogoUrl ? "rgba(0,0,0,0.4)" : "transparent",
                  opacity: editLogoUrl ? 0 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#FFFFFF",
                  transition: "opacity 150ms ease"
                }}
                onMouseEnter={(e) => {
                  if (editLogoUrl) (e.currentTarget as HTMLElement).style.opacity = "1";
                }}
                onMouseLeave={(e) => {
                  if (editLogoUrl) (e.currentTarget as HTMLElement).style.opacity = "0";
                }}
              >
                <Camera size={18} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoFileChange}
                  style={{ display: "none" }}
                />
              </label>
            </div>

            <div style={{ paddingTop: 10, minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: 16.5,
                  fontWeight: 700,
                  color: theme.ink,
                  lineHeight: 1.3,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}
              >
                {editName.trim() || `Nama ${entity}`}
              </div>
              <div style={{ fontSize: 12.5, color: theme.inkSoft, marginTop: 2 }}>
                {editCategory || "Kategori Usaha"}
              </div>
            </div>
          </div>

          {/* Logo Action Buttons */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              paddingTop: isMobileView ? 0 : 8,
              flexShrink: 0
            }}
          >
            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "6px 14px",
                borderRadius: 20,
                background: theme.surface2,
                border: `1px solid ${theme.border}`,
                color: theme.ink,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 120ms ease"
              }}
            >
              <Camera size={13} color={theme.inkSoft} />
              <span>{editLogoUrl ? "Ganti Logo" : "Upload Logo"}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoFileChange}
                style={{ display: "none" }}
              />
            </label>

            {editLogoUrl && (
              <button
                type="button"
                onClick={() => setEditLogoUrl("")}
                title="Hapus Logo"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 30,
                  height: 30,
                  borderRadius: 20,
                  background: "transparent",
                  border: `1px solid ${theme.border}`,
                  color: theme.inkSoft,
                  cursor: "pointer"
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "#EF4444";
                  (e.currentTarget as HTMLElement).style.borderColor = "#EF444455";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = theme.inkSoft;
                  (e.currentTarget as HTMLElement).style.borderColor = theme.border;
                }}
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Form Card: Identitas & Deskripsi */}
      <div
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 20,
          padding: isMobileView ? "20px 16px" : "24px 22px",
          display: "flex",
          flexDirection: "column",
          gap: 20
        }}
      >
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: theme.ink, marginBottom: 8 }}>
            Nama {entity}
          </label>
          <input
            type="text"
            required
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder={`Nama ${entity} Anda`}
            style={{
              width: "100%",
              height: 48,
              padding: "0 16px",
              borderRadius: 14,
              border: `1px solid ${theme.border}`,
              background: theme.surface2,
              color: theme.ink,
              fontSize: 14,
              fontWeight: 500,
              boxSizing: "border-box",
              outline: "none"
            }}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobileView ? "1fr" : "1fr 1fr", gap: 16 }}>
          <CustomSelectField
            label="Jenis Toko"
            value={editType}
            options={[
              {
                value: "BARANG",
                label: "Barang",
                subtitle: "Retail, produk fisik & kebutuhan harian"
              },
              {
                value: "FOOD",
                label: "Food",
                subtitle: "Kuliner, makanan siap saji & aneka minuman"
              },
              {
                value: "JASA",
                label: "Jasa",
                subtitle: "Layanan profesional, montir & perbaikan"
              }
            ]}
            onChange={(newVal) => {
              const newType = newVal as StoreType;
              setEditType(newType);
              setEditCategory(STORE_CATEGORIES[newType][0]);
            }}
            theme={theme}
            isMobileView={isMobileView}
          />

          <CustomSelectField
            label="Kategori Usaha"
            value={editCategory}
            options={(STORE_CATEGORIES[editType] || []).map((cat) => ({
              value: cat,
              label: cat
            }))}
            onChange={(newVal) => setEditCategory(newVal)}
            theme={theme}
            isMobileView={isMobileView}
          />
        </div>

        {/* WhatsApp Toko */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: theme.ink }}>
              <span>Nomor WhatsApp {entity}</span>
              <span style={{ color: "#EF4444" }}>*</span>
            </label>
            {isWhatsappVerified ? (
              <span
                title="Nomor WhatsApp Terverifikasi"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#10B981"
                }}
              >
                <CheckCircle2 size={16} />
              </span>
            ) : onOpenWaModal && editWhatsapp && editWhatsapp.replace(/\D/g, "").length >= 9 ? (
              <button
                type="button"
                onClick={onOpenWaModal}
                style={{
                  background: theme.surface2,
                  border: `1px solid ${theme.border}`,
                  color: theme.ink,
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "3px 8px",
                  borderRadius: 8,
                  cursor: "pointer"
                }}
              >
                Verifikasi
              </button>
            ) : null}
          </div>
          <input
            type="tel"
            required
            value={editWhatsapp}
            onChange={(e) => setEditWhatsapp?.(e.target.value)}
            placeholder="Contoh: 081234567890"
            style={{
              width: "100%",
              height: 48,
              padding: "0 16px",
              borderRadius: 14,
              border: `1px solid ${theme.border}`,
              background: theme.surface2,
              color: theme.ink,
              fontSize: 14,
              fontWeight: 500,
              boxSizing: "border-box",
              outline: "none"
            }}
          />
          <span style={{ display: "block", fontSize: 11, color: theme.inkSoft, marginTop: 6 }}>
            Nomor ini terhubung dengan pelanggan untuk konfirmasi pesanan dan koordinasi pengiriman.
          </span>
        </div>

        <div>
          <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: theme.ink, marginBottom: 8 }}>
            Deskripsi {entity}
          </label>
          <textarea
            rows={4}
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder={`Ceritakan tentang ${entityLower} Anda, keunggulan ${editType === "FOOD" ? "menu" : "produk"}, dan layanan...`}
            style={{
              width: "100%",
              minHeight: 110,
              padding: "14px 16px",
              borderRadius: 14,
              border: `1px solid ${theme.border}`,
              background: theme.surface2,
              color: theme.ink,
              fontSize: 14,
              fontWeight: 500,
              lineHeight: 1.55,
              boxSizing: "border-box",
              fontFamily: "inherit",
              resize: "vertical",
              outline: "none"
            }}
          />
        </div>
      </div>

      <button
        type="submit"
        style={{
          padding: "13px 28px",
          borderRadius: 20,
          background: theme.ink,
          color: theme.bg,
          border: "none",
          fontSize: 14,
          fontWeight: 700,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 14px rgba(0, 0, 0, 0.12)",
          transition: "opacity 0.15s ease",
          marginTop: 4
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.opacity = "0.85";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.opacity = "1";
        }}
      >
        <span>Simpan Profil</span>
      </button>

      {onResetStore && (
        <div
          style={{
            marginTop: 20,
            paddingTop: 18,
            borderTop: `1px dashed ${theme.border}`,
            display: "flex",
            flexDirection: "column",
            gap: 8
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 700, color: "#ef4444", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Mode Pengujian (Testing)
          </span>
          <button
            type="button"
            onClick={onResetStore}
            style={{
              width: "100%",
              padding: "11px 16px",
              borderRadius: 14,
              background: theme.isDark ? "rgba(239, 68, 68, 0.08)" : "#fff5f5",
              color: "#ef4444",
              border: `1.5px dashed ${theme.isDark ? "rgba(239, 68, 68, 0.35)" : "#fca5a5"}`,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = theme.isDark ? "rgba(239, 68, 68, 0.16)" : "#fee2e2";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = theme.isDark ? "rgba(239, 68, 68, 0.08)" : "#fff5f5";
            }}
          >
            <RotateCcw size={15} />
            <span>Reset Toko Uji Coba (Mulai dari Awal)</span>
          </button>
        </div>
      )}
    </form>
  );
};

