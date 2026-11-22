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
      setErrorMessage(`${entity} name is required (minimum 3 characters)!`);
      return;
    }
    if (!cleanWhatsapp || cleanWhatsapp.length < 9) {
      setErrorMessage("A valid active WhatsApp number is required!");
      return;
    }
    if (!cleanCity) {
      setErrorMessage(`${entity} city/area is required for delivery zones!`);
      return;
    }
    if (!cleanAddress) {
      setErrorMessage(`Full ${entityLower} address is required for order pickup!`);
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
        tagline: "Official SERA Merchant",
        description: description.trim() || `Trusted products and services from ${cleanName}.`,
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
        operatingHours: "Every Day, 08:00 - 21:00",
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
      setErrorMessage(err.message || "Failed to open store. Please try again.");
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
          title="Back"
        >
          <ChevronLeft size={20} />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Store size={18} color={theme.accent} />
          <span style={{ fontSize: 14, fontWeight: 700, color: theme.ink }}>
            Merchant Partner Registration
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
              Open Your SERA {entity}
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: theme.inkSoft, lineHeight: 1.45 }}>
              Complete your {entityLower} profile to start uploading {storeType === "FOOD" ? "menu items" : "products"} and serving buyers on SERA Marketplace.
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
          {/* 1. Store / Restaurant Name */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: theme.ink }}>
              {entity} / Brand Name <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder={storeType === "FOOD" ? "Example: Artisan Kitchen & Cafe" : "Example: Daily Harvest Market"}
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

          {/* 2. Business Type */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: theme.ink }}>
              Business Type <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 8
              }}
            >
              {[
                { type: "BARANG" as const, label: "Goods / Retail", icon: Package },
                { type: "FOOD" as const, label: "Food & Beverage", icon: Utensils },
                { type: "JASA" as const, label: "Services", icon: Wrench }
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

          {/* 3. Main Category */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: theme.ink }}>
              Main Category <span style={{ color: "#EF4444" }}>*</span>
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

          {/* 4. Store WhatsApp Number */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: theme.ink, display: "flex", alignItems: "center", gap: 6 }}>
              <Phone size={13} color="#16A34A" />
              <span>Store WhatsApp Number</span>
              <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="Example: 081234567890"
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
              Used by buyers for order confirmation and delivery coordination.
            </span>
          </div>

          {/* 5. City & Store Address */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: theme.ink, display: "flex", alignItems: "center", gap: 6 }}>
                <MapPin size={13} color="#EF4444" />
                <span>City / Regency</span>
                <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Example: Malang / Jakarta / Austin"
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
                Full {entity} Address <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street name, unit number, district, landmarks..."
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

          {/* 6. Short Description (Optional) */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: theme.ink, display: "flex", alignItems: "center", gap: 6 }}>
              <FileText size={13} color={theme.inkSoft} />
              <span>{entity} Description / Tagline (Optional)</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                storeType === "FOOD"
                  ? "Example: Serving fresh home-style meals & craft drinks"
                  : "Example: Fresh groceries and daily essentials"
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
              <span>Registering {entity}...</span>
            ) : (
              <>
                <CheckCircle2 size={18} />
                <span>Open {entity} Now</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

