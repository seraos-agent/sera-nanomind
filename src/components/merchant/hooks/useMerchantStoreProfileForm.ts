import React, { useState, useCallback, useEffect } from "react";
import { getApiBaseUrl } from "../../../config/marketplaceConfig";
import { safeSetStorage } from "../../../utils/safeStorage";
import { formatStorePinLocation } from "../../marketplace/utils/formatters";
import {
  type StoreType,
  type MerchantStore,
  type MerchantProduct,
  type StoreShippingConfig,
  DANA_REFERRAL_CODE,
  STORE_CATEGORIES,
  DEFAULT_SHIPPING_CONFIG,
  normalizeStoreType,
  formatScheduleString,
  isStoreCurrentlyOpen
} from "../types";
import {
  MERCHANT_DRAFT_KEY,
  loadStoreDraft,
  uploadStoreDataUrlIfNeeded
} from "../utils/merchantProfileUpload";

interface UseMerchantStoreProfileFormProps {
  store: MerchantStore | null;
  setStore: React.Dispatch<React.SetStateAction<MerchantStore | null>>;
  products: MerchantProduct[];
  setProducts: React.Dispatch<React.SetStateAction<MerchantProduct[]>>;
  userEmail?: string | null;
}

export function useMerchantStoreProfileForm({
  store,
  setStore,
  products,
  setProducts,
  userEmail
}: UseMerchantStoreProfileFormProps) {
  const initialDraft = !store ? loadStoreDraft() : {};
  const currentStoreType = normalizeStoreType(store?.type || initialDraft.type);

  // Edit Store Form States
  const [editName, setEditName] = useState(store?.name ?? initialDraft.name ?? "");
  const [editType, setEditType] = useState<StoreType>(currentStoreType);
  const [editDescription, setEditDescription] = useState(store?.description ?? initialDraft.description ?? "");
  const [editCategory, setEditCategory] = useState(
    store?.category ?? initialDraft.category ?? STORE_CATEGORIES[currentStoreType][0]
  );
  const [editCity, setEditCity] = useState(store?.city ?? initialDraft.city ?? "");
  const [editDistrict, setEditDistrict] = useState(store?.district ?? initialDraft.district ?? "");
  const [editVillage, setEditVillage] = useState(store?.village ?? initialDraft.village ?? "");
  const [editAddress, setEditAddress] = useState(store?.address ?? initialDraft.address ?? "");
  const [editLatitude, setEditLatitude] = useState<number | undefined>(store?.latitude ?? initialDraft.latitude);
  const [editLongitude, setEditLongitude] = useState<number | undefined>(store?.longitude ?? initialDraft.longitude);
  const [editOpenDays, setEditOpenDays] = useState<string[]>(() => {
    return store?.openDays || initialDraft.openDays || [];
  });
  const [editOpenTime, setEditOpenTime] = useState(store?.openTime ?? initialDraft.openTime ?? "08:00");
  const [editCloseTime, setEditCloseTime] = useState(store?.closeTime ?? initialDraft.closeTime ?? "21:00");
  const [editIs24Hours, setEditIs24Hours] = useState(store?.is24Hours ?? initialDraft.is24Hours ?? false);
  const [editDailyCustomHours, setEditDailyCustomHours] = useState<
    Record<string, { openTime: string; closeTime: string }>
  >(() => {
    return store?.dailyCustomHours || initialDraft.dailyCustomHours || {};
  });
  const [editWhatsapp, setEditWhatsapp] = useState(store?.whatsapp ?? initialDraft.whatsapp ?? "");
  const [editBannerUrl, setEditBannerUrl] = useState(store?.bannerUrl ?? initialDraft.bannerUrl ?? "");
  const [editLogoUrl, setEditLogoUrl] = useState(store?.logoUrl ?? initialDraft.logoUrl ?? "");

  // Payment States
  const [editBankName, setEditBankName] = useState(store?.bankName ?? initialDraft.bankName ?? "BCA");
  const [editDanaPhone, setEditDanaPhone] = useState(
    store?.bankAccount ?? store?.danaPhone ?? initialDraft.danaPhone ?? ""
  );
  const [editDanaName, setEditDanaName] = useState(
    store?.bankHolder ?? store?.danaName ?? initialDraft.danaName ?? ""
  );
  const [editQrisImageUrl, setEditQrisImageUrl] = useState(store?.qrisImageUrl ?? initialDraft.qrisImageUrl ?? "");
  const [editAcceptCod, setEditAcceptCod] = useState(
    store?.acceptCod ?? store?.acceptedPayments?.cod ?? initialDraft.acceptCod ?? true
  );
  const [referralCopied, setReferralCopied] = useState(false);
  const [showSaveSuccessModal, setShowSaveSuccessModal] = useState(false);

  // Auto-persist draft in localStorage when user is in unregistered draft mode
  useEffect(() => {
    if (store) return;
    const draftPayload = {
      name: editName,
      type: editType,
      description: editDescription,
      category: editCategory,
      city: editCity,
      district: editDistrict,
      village: editVillage,
      address: editAddress,
      latitude: editLatitude,
      longitude: editLongitude,
      openDays: editOpenDays,
      openTime: editOpenTime,
      closeTime: editCloseTime,
      is24Hours: editIs24Hours,
      dailyCustomHours: editDailyCustomHours,
      whatsapp: editWhatsapp,
      bannerUrl: editBannerUrl,
      logoUrl: editLogoUrl,
      bankName: editBankName,
      danaPhone: editDanaPhone,
      danaName: editDanaName,
      qrisImageUrl: editQrisImageUrl,
      acceptCod: editAcceptCod
    };
    try {
      safeSetStorage(MERCHANT_DRAFT_KEY, JSON.stringify(draftPayload));
    } catch {}
  }, [
    store,
    editName,
    editType,
    editDescription,
    editCategory,
    editCity,
    editDistrict,
    editVillage,
    editAddress,
    editLatitude,
    editLongitude,
    editOpenDays,
    editOpenTime,
    editCloseTime,
    editIs24Hours,
    editDailyCustomHours,
    editWhatsapp,
    editBannerUrl,
    editLogoUrl,
    editBankName,
    editDanaPhone,
    editDanaName,
    editQrisImageUrl,
    editAcceptCod
  ]);

  const resetFormFields = useCallback(() => {
    setEditName("");
    setEditType("BARANG");
    setEditDescription("");
    setEditCategory(STORE_CATEGORIES.BARANG[0]);
    setEditCity("");
    setEditDistrict("");
    setEditVillage("");
    setEditAddress("");
    setEditLatitude(undefined);
    setEditLongitude(undefined);
    setEditOpenDays([]);
    setEditOpenTime("08:00");
    setEditCloseTime("21:00");
    setEditIs24Hours(false);
    setEditDailyCustomHours({});
    setEditWhatsapp("");
    setEditBannerUrl("");
    setEditLogoUrl("");
    setEditBankName("BCA");
    setEditDanaPhone("");
    setEditDanaName("");
    setEditQrisImageUrl("");
    setEditAcceptCod(true);
    try {
      localStorage.removeItem(MERCHANT_DRAFT_KEY);
    } catch {}
  }, []);

  // Hydrate form fields when store is recovered asynchronously from the backend
  useEffect(() => {
    if (!store?.id) return;
    const normType = normalizeStoreType(store.type);
    setEditName(store.name ?? "");
    setEditType(normType);
    setEditDescription(store.description ?? "");
    setEditCategory(store.category ?? STORE_CATEGORIES[normType][0]);
    setEditCity(store.city ?? "");
    setEditDistrict(store.district ?? "");
    setEditVillage(store.village ?? "");
    setEditAddress(store.address ?? "");
    setEditLatitude(store.latitude);
    setEditLongitude(store.longitude);
    setEditOpenDays(store.openDays || []);
    setEditOpenTime(store.openTime ?? "08:00");
    setEditCloseTime(store.closeTime ?? "21:00");
    setEditIs24Hours(store.is24Hours ?? false);
    setEditDailyCustomHours(store.dailyCustomHours || {});
    setEditWhatsapp(store.whatsapp ?? "");
    setEditBannerUrl(store.bannerUrl ?? "");
    setEditLogoUrl(store.logoUrl ?? "");
    setEditBankName(store.bankName ?? "BCA");
    setEditDanaPhone(store.bankAccount ?? store.danaPhone ?? "");
    setEditDanaName(store.bankHolder ?? store.danaName ?? "");
    setEditQrisImageUrl(store.qrisImageUrl ?? "");
    setEditAcceptCod(store.acceptCod ?? store.acceptedPayments?.cod ?? true);
  }, [store?.id]);

  const handleToggleOpenStatus = async () => {
    if (!store) return;
    const currentStatus = isStoreCurrentlyOpen(store);
    const scheduleOnlyStatus = isStoreCurrentlyOpen({ ...store, isOpenManualOverride: null });

    let nextOverride: boolean | null = null;
    let nextIsOpen = false;

    if (currentStatus.isOpen) {
      if (store.isOpenManualOverride === true) {
        nextOverride = null;
        nextIsOpen = scheduleOnlyStatus.isOpen;
      } else {
        nextOverride = false;
        nextIsOpen = false;
      }
    } else {
      if (store.isOpenManualOverride === false) {
        nextOverride = null;
        nextIsOpen = scheduleOnlyStatus.isOpen;
      } else {
        nextOverride = true;
        nextIsOpen = true;
      }
    }

    const updated: MerchantStore = {
      ...store,
      isOpen: nextIsOpen,
      isOpenManualOverride: nextOverride
    };
    setStore(updated);
    try {
      localStorage.setItem("sera_merchant_store", JSON.stringify(updated));
      window.dispatchEvent(new Event("sera_merchant_store_updated"));
    } catch {}
    try {
      await fetch(`${getApiBaseUrl()}/api/market/stores/${store.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isOpen: nextIsOpen,
          isOpenManualOverride: nextOverride
        })
      }).catch(() => {});
    } catch (err) {
      console.warn("Failed to sync store status to backend:", err);
    }
  };

  const handleOpenProfileEditor = () => {
    if (store) {
      const normalized = normalizeStoreType(store.type);
      setEditName(store.name);
      setEditType(normalized);
      setEditCategory(store.category || STORE_CATEGORIES[normalized][0]);
      setEditDescription(store.description);
      setEditBannerUrl(store.bannerUrl);
      setEditLogoUrl(store.logoUrl);
      setEditWhatsapp(store.whatsapp);
      setEditCity(store.city);
      setEditDistrict(store.district || "");
      setEditVillage(store.village || "");
      setEditAddress(store.address);
      setEditLatitude(store.latitude);
      setEditLongitude(store.longitude);
      setEditOpenDays(
        store.openDays || ["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU", "MINGGU"]
      );
      setEditOpenTime(store.openTime || "08:00");
      setEditCloseTime(store.closeTime || "21:00");
      setEditIs24Hours(store.is24Hours || false);
      setEditDailyCustomHours(store.dailyCustomHours || {});
      setEditBankName(store.bankName || "BCA");
      setEditDanaPhone(store.bankAccount || store.danaPhone || "");
      setEditDanaName(store.bankHolder || store.danaName || "");
      setEditQrisImageUrl(store.qrisImageUrl || "");
      setEditAcceptCod(store.acceptCod ?? store.acceptedPayments?.cod ?? true);
    }
  };

  const handleCopyReferralCode = () => {
    navigator.clipboard.writeText(DANA_REFERRAL_CODE);
    setReferralCopied(true);
    setTimeout(() => setReferralCopied(false), 2000);
  };

  const handleQrisUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("QRIS image size is too large. Maximum 5 MB.");
        e.target.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setEditQrisImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAllProfileChanges = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!store) return;

    const generatedHours = formatScheduleString(
      editOpenDays,
      editOpenTime,
      editCloseTime,
      editIs24Hours,
      editDailyCustomHours
    );

    const evaluatedStatus = isStoreCurrentlyOpen({
      ...store,
      openDays: editOpenDays,
      openTime: editOpenTime.trim() || "08:00",
      closeTime: editCloseTime.trim() || "21:00",
      is24Hours: editIs24Hours,
      dailyCustomHours: editDailyCustomHours,
      isOpenManualOverride: store.isOpenManualOverride
    });

    const shouldBeOpen = evaluatedStatus.isOpen;

    const finalBanner = await uploadStoreDataUrlIfNeeded(editBannerUrl.trim() || store.bannerUrl, "banner");
    const finalLogo = await uploadStoreDataUrlIfNeeded(editLogoUrl.trim() || store.logoUrl, "logo");
    const finalQris = await uploadStoreDataUrlIfNeeded(editQrisImageUrl.trim(), "qris");

    const resolvedStoreName = editName.trim() || store.name;
    const resolvedId = (store.id === "toko-berkah-sembako" && resolvedStoreName.toLowerCase() !== "toko berkah sembako")
      ? (resolvedStoreName.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-") || "toko-glosir-malang")
      : store.id;

    const updated: MerchantStore = {
      ...store,
      id: resolvedId,
      isOpen: shouldBeOpen,
      isOpenManualOverride: store.isOpenManualOverride,
      name: resolvedStoreName,
      type: editType,
      category: editCategory,
      description: editDescription.trim(),
      bannerUrl: finalBanner,
      logoUrl: finalLogo,
      whatsapp: editWhatsapp.replace(/[^0-9]/g, "") || store.whatsapp,
      city: editCity.trim() || store.city,
      district: editDistrict.trim() || undefined,
      village: editVillage.trim() || undefined,
      address: editAddress.trim() || store.address,
      latitude: editLatitude !== undefined ? editLatitude : store.latitude,
      longitude: editLongitude !== undefined ? editLongitude : store.longitude,
      operatingHours: generatedHours,
      openDays: editOpenDays,
      openTime: editOpenTime.trim() || "08:00",
      closeTime: editCloseTime.trim() || "21:00",
      is24Hours: editIs24Hours,
      dailyCustomHours: editDailyCustomHours,
      danaPhone: editDanaPhone.replace(/[^0-9]/g, ""),
      danaName: editDanaName.trim(),
      qrisImageUrl: finalQris,
      acceptCod: editAcceptCod,
      bankName: editBankName.trim() || "BCA",
      bankAccount: editDanaPhone.replace(/[^0-9]/g, ""),
      bankHolder: editDanaName.trim(),
      acceptedPayments: {
        qris: Boolean(finalQris),
        wallet: true,
        cod: editAcceptCod,
        transfer: Boolean(editDanaPhone.trim())
      }
    };

    const syncedPinLocation = formatStorePinLocation({
      city: updated.city,
      district: updated.district,
      village: updated.village,
      address: updated.address,
      fallback: updated.city
    });

    setStore(updated);
    setProducts((prev) => prev.map((p) => ({ ...p, location: syncedPinLocation })));
    try {
      localStorage.setItem("sera_merchant_store", JSON.stringify(updated));
      window.dispatchEvent(new Event("sera_merchant_store_updated"));
    } catch {}
    setShowSaveSuccessModal(true);

    try {
      await fetch(`${getApiBaseUrl()}/api/market/stores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      });
      await fetch(`${getApiBaseUrl()}/api/market/stores/${store.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOpen: shouldBeOpen })
      }).catch(() => {});

      for (const p of products) {
        await fetch(`${getApiBaseUrl()}/api/market/products`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...p,
            storeId: updated.id,
            storeName: updated.name,
            location: syncedPinLocation
          })
        });
      }
    } catch {}
  };

  const handleVerifyStoreWhatsapp = (verifiedPhone: string) => {
    setEditWhatsapp(verifiedPhone);
    setStore((prev) => {
      if (!prev) return null;
      const updated = { ...prev, verified: true, whatsapp: verifiedPhone };
      if (typeof window !== "undefined" && prev.id) {
        localStorage.setItem(`sera_merchant_wa_verified_${prev.id}`, "true");
        localStorage.setItem(`sera_merchant_wa_verified_num_${prev.id}`, verifiedPhone);
      }
      fetch(`${getApiBaseUrl()}/api/market/stores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      }).catch(() => {});
      return updated;
    });
  };

  const handleUpdateShippingConfig = (shippingConfig: StoreShippingConfig) => {
    setStore((prev) => (prev ? { ...prev, shippingConfig } : null));
  };

  const handleRefreshStore = useCallback(async () => {
    if (store?.id) {
      try {
        const res = await fetch(`${getApiBaseUrl()}/api/market/stores/${store.id}`);
        const json = await res.json();
        if (json.success && json.data?.store) {
          setStore(json.data.store);
          localStorage.setItem("sera_merchant_store", JSON.stringify(json.data.store));
          window.dispatchEvent(new Event("sera_merchant_store_updated"));
        }
      } catch {}
    }
  }, [store?.id, setStore]);

  const handleRegisterStore = useCallback(async () => {
    const cleanName = editName.trim();
    const cleanWhatsapp = editWhatsapp.replace(/[^0-9]/g, "");
    const cleanCity = editCity.trim();
    const cleanAddress = editAddress.trim();

    if (!cleanName || cleanName.length < 3) {
      throw new Error("Store name is required (minimum 3 characters).");
    }
    if (!cleanWhatsapp || cleanWhatsapp.length < 9) {
      throw new Error("Valid store WhatsApp number is required.");
    }
    if (!cleanCity || !cleanAddress) {
      throw new Error("Store address and city are required.");
    }

    const finalBanner = await uploadStoreDataUrlIfNeeded(
      editBannerUrl.trim() || "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1200",
      "banner"
    );
    const finalLogo = await uploadStoreDataUrlIfNeeded(
      editLogoUrl.trim() || "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=160",
      "logo"
    );
    const finalQris = await uploadStoreDataUrlIfNeeded(editQrisImageUrl.trim(), "qris");

    const baseSlug = cleanName
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-");
    const storeId = baseSlug || `store-${Date.now().toString(36)}`;

    const generatedHours = formatScheduleString(
      editOpenDays,
      editOpenTime,
      editCloseTime,
      editIs24Hours,
      editDailyCustomHours
    );

    const newStore: MerchantStore = {
      id: storeId,
      ownerId: userEmail || undefined,
      name: cleanName,
      tagline: "Official SERA Merchant",
      description: editDescription.trim() || `Trusted products and services from ${cleanName}.`,
      logoUrl: finalLogo,
      bannerUrl: finalBanner,
      type: editType,
      category: editCategory || STORE_CATEGORIES[editType][0],
      rating: 5.0,
      totalProducts: products.length,
      address: cleanAddress,
      city: cleanCity,
      district: editDistrict.trim() || undefined,
      village: editVillage.trim() || undefined,
      latitude: editLatitude,
      longitude: editLongitude,
      isOpen: true,
      operatingHours: generatedHours,
      openDays: editOpenDays,
      openTime: editOpenTime.trim() || "08:00",
      closeTime: editCloseTime.trim() || "21:00",
      is24Hours: editIs24Hours,
      dailyCustomHours: editDailyCustomHours,
      whatsapp: cleanWhatsapp,
      verified: true,
      bankName: editBankName,
      bankAccount: editDanaPhone.trim(),
      bankHolder: editDanaName.trim(),
      danaPhone: editDanaPhone.trim(),
      danaName: editDanaName.trim(),
      qrisImageUrl: finalQris,
      acceptCod: editAcceptCod,
      acceptedPayments: {
        qris: Boolean(finalQris),
        wallet: Boolean(editDanaPhone.trim()),
        cod: editAcceptCod,
        transfer: Boolean(editBankName.trim() && editDanaPhone.trim())
      },
      shippingConfig: DEFAULT_SHIPPING_CONFIG,
      createdAt: Date.now()
    };

    try {
      const res = await fetch(`${getApiBaseUrl()}/api/market/stores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newStore,
          userId: userEmail || undefined
        })
      });
      const data = await res.json();
      if (data?.success && data?.data) {
        newStore.id = data.data.id || newStore.id;
      }
    } catch (err) {
      console.warn("Offline/local store registration:", err);
    }

    try {
      safeSetStorage("sera_merchant_store", JSON.stringify(newStore));
      localStorage.removeItem(MERCHANT_DRAFT_KEY);
      window.dispatchEvent(new Event("sera_merchant_store_updated"));
    } catch {}

    setStore(newStore);
    return newStore;
  }, [
    editName,
    editWhatsapp,
    editCity,
    editDistrict,
    editVillage,
    editAddress,
    editBannerUrl,
    editLogoUrl,
    editQrisImageUrl,
    editOpenDays,
    editOpenTime,
    editCloseTime,
    editIs24Hours,
    editDailyCustomHours,
    userEmail,
    editDescription,
    editType,
    editCategory,
    products.length,
    editLatitude,
    editLongitude,
    editBankName,
    editDanaPhone,
    editDanaName,
    editAcceptCod,
    setStore
  ]);

  return {
    editName,
    setEditName,
    editType,
    setEditType,
    editDescription,
    setEditDescription,
    editCategory,
    setEditCategory,
    editCity,
    setEditCity,
    editDistrict,
    setEditDistrict,
    editVillage,
    setEditVillage,
    editAddress,
    setEditAddress,
    editLatitude,
    setEditLatitude,
    editLongitude,
    setEditLongitude,
    editOpenDays,
    setEditOpenDays,
    editOpenTime,
    setEditOpenTime,
    editCloseTime,
    setEditCloseTime,
    editIs24Hours,
    setEditIs24Hours,
    editDailyCustomHours,
    setEditDailyCustomHours,
    editWhatsapp,
    setEditWhatsapp,
    editBannerUrl,
    setEditBannerUrl,
    editLogoUrl,
    setEditLogoUrl,
    editBankName,
    setEditBankName,
    editDanaPhone,
    setEditDanaPhone,
    editDanaName,
    setEditDanaName,
    editQrisImageUrl,
    setEditQrisImageUrl,
    editAcceptCod,
    setEditAcceptCod,
    referralCopied,
    showSaveSuccessModal,
    setShowSaveSuccessModal,
    handleToggleOpenStatus,
    handleOpenProfileEditor,
    handleCopyReferralCode,
    handleQrisUpload,
    handleSaveAllProfileChanges,
    handleVerifyStoreWhatsapp,
    handleUpdateShippingConfig,
    handleRefreshStore,
    handleRegisterStore,
    resetFormFields
  };
}
