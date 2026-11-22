import React, { useState } from "react";
import {
  Store,
  ChevronLeft,
  Package,
  Utensils,
  Wrench,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Phone,
  FileText
} from "lucide-react";
import type { ThemeType } from "../../../theme";
import {
  type StoreType,
  type MerchantStore,
  STORE_CATEGORIES,
  DEFAULT_SHIPPING_CONFIG,
  getStoreEntityLabel
} from "../types";
import { getApiBaseUrl } from "../../../config/marketplaceConfig";
import { safeSetStorage } from "../../../utils/safeStorage";

interface MerchantOnboardingViewProps {
  theme: ThemeType;
  isMobileView?: boolean;
  userEmail?: string | null;
  onStoreCreated: (createdStore: MerchantStore) => void;
  onBack: () => void;
}

export function MerchantOnboardingView({
  theme,
  isMobileView,
  userEmail,
  onStoreCreated,
  onBack
}: MerchantOnboardingViewProps) {
  const [storeName, setStoreName] = useState("");
  const [storeType, setStoreType] = useState<StoreType>("BARANG");
  const [category, setCategory] = useState(STORE_CATEGORIES.BARANG[0]);
  const [whatsapp, setWhatsapp] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const entity = getStoreEntityLabel(storeType);
  const entityLower = getStoreEntityLabel(storeType, true);

  const handleTypeSelect = (type: StoreType) => {
    setStoreType(type);
    const availableCategories = STORE_CATEGORIES[type] || STORE_CATEGORIES.BARANG;
    setCategory(availableCategories[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanName = storeName.trim();
    const cleanWhatsapp = whatsapp.replace(/[^0-9]/g, "");
    const cleanCity = city.trim();
    const cleanAddress = address.trim();

    if (!cleanName || cleanName.length < 3) {
      setErrorMessage(`Nama ${entityLower} wajib diisi (minimal 3 karakter)!`);
      return;
    }
    if (!cleanWhatsapp || cleanWhatsapp.length < 9) {
      setErrorMessage("Nomor WhatsApp wajib diisi dengan nomor aktif yang valid!");
      return;
    }
    if (!cleanCity) {
      setErrorMessage(`Kota/wilayah ${entityLower} wajib diisi untuk penentuan area pengiriman!`);
      return;
    }
    if (!cleanAddress) {
      setErrorMessage(`Alamat lengkap ${entityLower} wajib diisi sebagai titik penjemputan pesanan!`);
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate clean URL slug from store name
      const baseSlug = cleanName
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-");
      const storeId = baseSlug || `store-${Date.now().toString(36)}`;

      const newStore: MerchantStore = {
        id: storeId,
        ownerId: userEmail || undefined,
        name: cleanName,
        tagline: "Mitra Resmi SERA",
        description: description.trim() || `Pusat produk dan layanan terpercaya dari ${cleanName}.`,
        logoUrl: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=160",
        bannerUrl: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1200",
        type: storeType,
        category: category || STORE_CATEGORIES[storeType][0],
        rating: 5.0,
        totalProducts: 0,
        address: cleanAddress,
        city: cleanCity,
        isOpen: true,
        isOpenManualOverride: null,
        operatingHours: "Setiap Hari, 08:00 - 21:00 WIB",
        openTime: "08:00",
        closeTime: "21:00",
        openDays: ["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU", "MINGGU"],
        is24Hours: false,
        whatsapp: cleanWhatsapp,
        verified: true,
        acceptCod: true,
        shippingConfig: DEFAULT_SHIPPING_CONFIG,
        acceptedPayments: {
          qris: true,
          wallet: true,
          cod: true,
          transfer: true
        },
        createdAt: Date.now()
      };

      // 1. Persist to local storage
      safeSetStorage("sera_merchant_store", JSON.stringify(newStore));
      safeSetStorage("sera_merchant_products", JSON.stringify([]));
      safeSetStorage("sera_merchant_orders", JSON.stringify([]));
      window.dispatchEvent(new Event("sera_merchant_store_updated"));

      // 2. Sync to Backend API
      try {
        await fetch(`${getApiBaseUrl()}/api/market/stores`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newStore)
        });
      } catch (err) {
        console.warn("[MerchantOnboardingView] Initial store cloud sync warning:", err);
      }

      onStoreCreated(newStore);
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal membuka toko. Silakan coba lagi.");
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: theme.bg,
        minHeight: "100%",
        overflowY: "auto",
        boxSizing: "border-box"
      }}
    >
      {/* Top Header */}
      <div
        style={{
          background: theme.surface,
          borderBottom: `1px solid ${theme.border}`,
          padding: isMobileView ? "12px 14px" : "14px 24px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          position: "sticky",
          top: 0,
          zIndex: 20
        }}
      >
        <button
          type="button"
          onClick={onBack}
          style={{
            background: "transparent",
            border: "none",
            color: theme.ink,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 6,
            borderRadius: 8
          }}
          title="Kembali"
        >
          <ChevronLeft size={20} />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Store size={18} color={theme.accent} />
          <span style={{ fontSize: 14, fontWeight: 700, color: theme.ink }}>
            Pendaftaran Mitra Store
          </span>
        </div>
      </div>

      {/* Main Form Content */}
      <div
        style={{
          maxWidth: 580,
          margin: "0 auto",
          width: "100%",
          padding: isMobileView ? "16px 14px 60px" : "28px 20px 60px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
          boxSizing: "border-box"
        }}
      >
        {/* Welcome Header Hero */}
        <div
          style={{
            background: theme.surface,
            borderRadius: 16,
            border: `1px solid ${theme.border}`,
            padding: isMobileView ? "18px 16px" : "24px 22px",
            display: "flex",
            alignItems: "center",
            gap: 16,
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: "rgba(239, 68, 68, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}
          >
            <Store size={26} color="#EF4444" />
          </div>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: theme.ink, lineHeight: 1.3 }}>
              Buka {entity} Mitra SERA
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: theme.inkSoft, lineHeight: 1.45 }}>
              Lengkapi data {entityLower}mu untuk mulai mengunggah {storeType === "FOOD" ? "menu" : "produk"} dan melayani pesanan pembeli di SERA Marketplace.
            </p>
          </div>
        </div>

        {/* Error Alert Message */}
        {errorMessage && (
          <div
            style={{
              padding: "11px 14px",
              borderRadius: 10,
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#EF4444",
              fontSize: 12.5,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 8
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Registration Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            background: theme.surface,
            borderRadius: 16,
            border: `1px solid ${theme.border}`,
            padding: isMobileView ? "20px 16px" : "26px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 18,
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
          }}
        >
          {/* 1. Nama Toko / Resto */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: theme.ink }}>
              Nama {entity} / Brand <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder={storeType === "FOOD" ? "Contoh: Warung Nasi Nusantara" : "Contoh: Toko Berkah Makmur"}
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: `1px solid ${theme.border}`,
                background: theme.bg,
                color: theme.ink,
                fontSize: 13,
                outline: "none",
                boxSizing: "border-box"
              }}
            />
          </div>

          {/* 2. Jenis Usaha */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: theme.ink }}>
              Jenis Usaha <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 8
              }}
            >
              {[
                { type: "BARANG" as const, label: "Barang / Sembako", icon: Package },
                { type: "FOOD" as const, label: "Kuliner / Makanan", icon: Utensils },
                { type: "JASA" as const, label: "Jasa & Layanan", icon: Wrench }
              ].map(({ type, label, icon: Icon }) => {
                const isSelected = storeType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleTypeSelect(type)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      padding: "10px 6px",
                      borderRadius: 10,
                      border: isSelected
                        ? `2px solid ${theme.accent}`
                        : `1px solid ${theme.border}`,
                      background: isSelected ? "rgba(239, 68, 68, 0.08)" : theme.bg,
                      color: isSelected ? theme.accent : theme.inkSoft,
                      cursor: "pointer",
                      fontSize: 11,
                      fontWeight: isSelected ? 700 : 500,
                      transition: "all 0.15s ease"
                    }}
                  >
                    <Icon size={18} color={isSelected ? theme.accent : theme.inkSoft} />
                    <span style={{ textAlign: "center", lineHeight: 1.2 }}>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Kategori Utama */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: theme.ink }}>
              Kategori Utama <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: `1px solid ${theme.border}`,
                background: theme.bg,
                color: theme.ink,
                fontSize: 13,
                outline: "none",
                boxSizing: "border-box",
                cursor: "pointer"
              }}
            >
              {(STORE_CATEGORIES[storeType] || STORE_CATEGORIES.BARANG).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Nomor WhatsApp Toko */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: theme.ink, display: "flex", alignItems: "center", gap: 6 }}>
              <Phone size={13} color="#16A34A" />
              <span>Nomor WhatsApp Toko</span>
              <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="Contoh: 081234567890"
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: `1px solid ${theme.border}`,
                background: theme.bg,
                color: theme.ink,
                fontSize: 13,
                outline: "none",
                boxSizing: "border-box"
              }}
            />
            <span style={{ fontSize: 10.5, color: theme.inkSoft }}>
              Digunakan pelanggan untuk konfirmasi pesanan dan koordinasi pengiriman.
            </span>
          </div>

          {/* 5. Kota & Alamat Toko */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: theme.ink, display: "flex", alignItems: "center", gap: 6 }}>
                <MapPin size={13} color="#EF4444" />
                <span>Kota / Kabupaten</span>
                <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Contoh: Malang / Solo / Jakarta"
                required
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: `1px solid ${theme.border}`,
                  background: theme.bg,
                  color: theme.ink,
                  fontSize: 13,
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: theme.ink }}>
                Alamat Lengkap {entity} <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Jl. Merdeka No. 10, RT 01/02, Kelurahan..."
                required
                rows={2}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: `1px solid ${theme.border}`,
                  background: theme.bg,
                  color: theme.ink,
                  fontSize: 13,
                  outline: "none",
                  boxSizing: "border-box",
                  resize: "vertical"
                }}
              />
            </div>
          </div>

          {/* 6. Deskripsi Singkat (Opsional) */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: theme.ink, display: "flex", alignItems: "center", gap: 6 }}>
              <FileText size={13} color={theme.inkSoft} />
              <span>Deskripsi / Slogan {entity} (Opsional)</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                storeType === "FOOD"
                  ? "Contoh: Sedia masakan rumahan hangat & minuman segar"
                  : "Contoh: Sedia aneka kebutuhan pokok murah dan segar"
              }
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: `1px solid ${theme.border}`,
                background: theme.bg,
                color: theme.ink,
                fontSize: 13,
                outline: "none",
                boxSizing: "border-box"
              }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              marginTop: 10,
              width: "100%",
              padding: "12px 18px",
              borderRadius: 12,
              background: isSubmitting ? theme.inkSoft : theme.accent,
              color: "#FFFFFF",
              border: "none",
              fontSize: 14,
              fontWeight: 700,
              cursor: isSubmitting ? "not-allowed" : "pointer",
              boxShadow: "0 4px 14px rgba(239, 68, 68, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "all 0.15s ease"
            }}
          >
            {isSubmitting ? (
              <span>Mendaftarkan {entity}...</span>
            ) : (
              <>
                <CheckCircle2 size={18} />
                <span>Buka {entity} Sekarang</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

