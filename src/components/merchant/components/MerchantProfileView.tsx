import React, { useState, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import type { ThemeType } from "../../../theme";
import {
  type StoreType,
  type StoreShippingConfig,
  type MerchantStore,
  getStoreEntityLabel
} from "../types";
import { MerchantPaymentsView } from "./MerchantPaymentsView";
import { StoreLocationPickerModal } from "./modals/StoreLocationPickerModal";
import { ShippingSettingsModal } from "./modals/ShippingSettingsModal";
import { registerBackHandler } from "../../../utils/backButton";

// Modular Profile Components
import { SubPageLayout } from "./profile/components/SubPageLayout";
import { StoreSummaryCard } from "./profile/components/StoreSummaryCard";
import { HubNavigationMenu } from "./profile/components/HubNavigationMenu";
import { ProfileSubpageForm } from "./profile/components/ProfileSubpageForm";
import { LocationSubpageForm } from "./profile/components/LocationSubpageForm";
import { ScheduleSubpageForm } from "./profile/components/ScheduleSubpageForm";
import { StoreOnboardingRegistrationCard } from "./profile/components/StoreOnboardingRegistrationCard";
import { DevResetStoreBanner } from "./profile/components/DevResetStoreBanner";
import { ResetStoreConfirmModal } from "./profile/components/ResetStoreConfirmModal";
import { PosSettingsSubpageForm } from "./profile/components/PosSettingsSubpageForm";

export type InfoTokoViewMode = "hub" | "profile" | "location" | "schedule" | "payments" | "pos";

interface MerchantProfileViewProps {
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
  editDescription: string;
  setEditDescription: (v: string) => void;
  editWhatsapp: string;
  setEditWhatsapp: (v: string) => void;
  editCity: string;
  setEditCity: (v: string) => void;
  editDistrict?: string;
  setEditDistrict?: (v: string) => void;
  editVillage?: string;
  setEditVillage?: (v: string) => void;
  editAddress: string;
  setEditAddress: (v: string) => void;
  editLatitude?: number;
  setEditLatitude?: (v: number | undefined) => void;
  editLongitude?: number;
  setEditLongitude?: (v: number | undefined) => void;
  editOpenDays: string[];
  setEditOpenDays: (v: string[]) => void;
  editIs24Hours: boolean;
  setEditIs24Hours: (v: boolean) => void;
  editOpenTime: string;
  setEditOpenTime: (v: string) => void;
  editCloseTime: string;
  setEditCloseTime: (v: string) => void;
  editDailyCustomHours?: Record<string, { openTime: string; closeTime: string }>;
  setEditDailyCustomHours?: (v: Record<string, { openTime: string; closeTime: string }>) => void;
  onSaveProfile: (e: React.FormEvent) => void;
  // Embedded Payment Settings
  editBankName?: string;
  setEditBankName?: (v: string) => void;
  editDanaPhone: string;
  setEditDanaPhone: (v: string) => void;
  editDanaName: string;
  setEditDanaName: (v: string) => void;
  editQrisImageUrl: string;
  setEditQrisImageUrl: (v: string) => void;
  editAcceptCod: boolean;
  setEditAcceptCod: (v: boolean) => void;
  handleQrisUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  referralCopied: boolean;
  handleCopyReferralCode: () => void;
  onSavePayments?: (e: React.FormEvent) => void;
  initialSubTab?: "profile" | "payments";
  isWhatsappVerified?: boolean;
  onVerifyWhatsapp?: (phone: string) => void;
  shippingConfig?: StoreShippingConfig;
  onUpdateShippingConfig?: (config: StoreShippingConfig) => void;
  store?: MerchantStore | null;
  onRefreshStore?: () => Promise<void>;
  onResetStore?: () => Promise<void> | void;
  onRegisterStore?: () => Promise<any>;
}

export function MerchantProfileView({
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
  editDescription,
  setEditDescription,
  editWhatsapp,
  setEditWhatsapp,
  editCity,
  setEditCity,
  editDistrict = "",
  setEditDistrict,
  editVillage = "",
  setEditVillage,
  editAddress,
  setEditAddress,
  editLatitude,
  setEditLatitude,
  editLongitude,
  setEditLongitude,
  editOpenDays,
  setEditOpenDays,
  editIs24Hours,
  setEditIs24Hours,
  editOpenTime,
  setEditOpenTime,
  editCloseTime,
  setEditCloseTime,
  editDailyCustomHours = {},
  setEditDailyCustomHours,
  onSaveProfile,
  editBankName = "BCA",
  setEditBankName,
  editDanaPhone,
  setEditDanaPhone,
  editDanaName,
  setEditDanaName,
  editQrisImageUrl,
  setEditQrisImageUrl,
  editAcceptCod,
  setEditAcceptCod,
  handleQrisUpload,
  referralCopied,
  handleCopyReferralCode,
  onSavePayments,
  initialSubTab = "profile",
  isWhatsappVerified = false,
  onVerifyWhatsapp,
  shippingConfig,
  onUpdateShippingConfig,
  store,
  onRefreshStore,
  onResetStore,
  onRegisterStore
}: MerchantProfileViewProps) {
  const [viewMode, setViewMode] = useState<InfoTokoViewMode>(() => {
    if (initialSubTab === "payments") return "payments";
    return "hub";
  });
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<{ text: string } | null>(null);

  const isRegistered = Boolean(store);
  const isProfileComplete = Boolean(
    editName.trim().length >= 3 &&
      editType &&
      editCategory &&
      editWhatsapp.replace(/\D/g, "").length >= 9 &&
      editDescription.trim().length >= 5
  );
  const isLocationComplete = Boolean(
    editCity.trim() &&
      editAddress.trim() &&
      editLatitude !== undefined &&
      editLongitude !== undefined
  );
  const isScheduleComplete = Boolean(
    editOpenDays.length > 0 &&
      (editIs24Hours || (editOpenTime.trim() && editCloseTime.trim()))
  );
  const isPaymentsComplete = Boolean(
    (editDanaPhone.trim().length >= 5 && editDanaName.trim().length >= 2) ||
      editQrisImageUrl.trim()
  );
  const completedCount = [
    isProfileComplete,
    isLocationComplete,
    isScheduleComplete,
    isPaymentsComplete
  ].filter(Boolean).length;
  const isAllDataComplete = completedCount === 4;
  const isLocalTestingEnv =
    import.meta.env.DEV ||
    (typeof window !== "undefined" &&
      (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"));

  useEffect(() => {
    if (initialSubTab === "payments") {
      setViewMode("payments");
    }
  }, [initialSubTab]);

  useEffect(() => {
    if (viewMode !== "hub") {
      return registerBackHandler("merchant_info_subview", 55, () => {
        setViewMode("hub");
        return true;
      });
    }
  }, [viewMode]);

  const triggerFeedback = (text: string) => {
    setStatusFeedback({ text });
    setTimeout(() => setStatusFeedback(null), 3200);
  };

  const handleSaveSubForm = (e: React.FormEvent, msg: string) => {
    e.preventDefault();
    onSaveProfile(e);
    triggerFeedback(msg);
    setViewMode("hub");
  };

  const handleSavePaymentsSubForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSavePayments) {
      onSavePayments(e);
    } else {
      onSaveProfile(e);
    }
    triggerFeedback("Metode pembayaran berhasil disimpan!");
    setViewMode("hub");
  };

  return (
    <div
      style={{
        padding: isMobileView ? "16px 14px 60px" : "24px 20px 60px",
        maxWidth: 600,
        margin: "0 auto",
        width: "100%"
      }}
    >
      {/* 1. MENU HUB (MAIN STORE INFORMATION HUB) */}
      {viewMode === "hub" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {statusFeedback && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: 14,
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 13,
                fontWeight: 600,
                background: theme.statusSoft,
                color: theme.status,
                border: `1px solid ${theme.status}`
              }}
            >
              <CheckCircle2 size={16} />
              <span style={{ flex: 1 }}>{statusFeedback.text}</span>
            </div>
          )}

          <StoreSummaryCard
            theme={theme}
            isMobileView={isMobileView}
            storeType={editType}
            editBannerUrl={editBannerUrl}
            editLogoUrl={editLogoUrl}
            editName={editName}
            editCategory={editCategory}
            editCity={editCity}
            editDistrict={editDistrict}
            editVillage={editVillage}
            editAddress={editAddress}
          />

          <HubNavigationMenu
            theme={theme}
            storeType={editType}
            onNavigate={setViewMode}
            onOpenShippingModal={() => setIsShippingModalOpen(true)}
            isRegistered={isRegistered}
            completionStatus={{
              profile: isProfileComplete,
              location: isLocationComplete,
              schedule: isScheduleComplete,
              payments: isPaymentsComplete
            }}
          />

          {/* Store onboarding registration card shown while store is not yet registered */}
          {!isRegistered && (
            <StoreOnboardingRegistrationCard
              theme={theme}
              isMobileView={isMobileView}
              completedCount={completedCount}
              isAllDataComplete={isAllDataComplete}
              onRegisterStore={onRegisterStore}
              onFeedback={triggerFeedback}
            />
          )}

          {/* DEVELOPER TESTING MODE: RESET STORE (LOCAL DEV ONLY) */}
          {isLocalTestingEnv && isRegistered && onResetStore && (
            <DevResetStoreBanner
              theme={theme}
              onOpenResetModal={() => setIsResetModalOpen(true)}
            />
          )}
        </div>
      )}

      {/* 2. SUBPAGE: PROFILE & IDENTITY */}
      {viewMode === "profile" && (
        <SubPageLayout
          title="Profil & Identitas"
          theme={theme}
          isMobileView={isMobileView}
          onBack={() => setViewMode("hub")}
        >
          <ProfileSubpageForm
            theme={theme}
            isMobileView={isMobileView}
            editBannerUrl={editBannerUrl}
            setEditBannerUrl={setEditBannerUrl}
            editLogoUrl={editLogoUrl}
            setEditLogoUrl={setEditLogoUrl}
            editName={editName}
            setEditName={setEditName}
            editType={editType}
            setEditType={setEditType}
            editCategory={editCategory}
            setEditCategory={setEditCategory}
            editWhatsapp={editWhatsapp}
            setEditWhatsapp={setEditWhatsapp}
            isWhatsappVerified={isWhatsappVerified}
            onOpenWaModal={() => onVerifyWhatsapp?.(editWhatsapp)}
            editDescription={editDescription}
            setEditDescription={setEditDescription}
            onSubmit={(e) => handleSaveSubForm(e, `Profil ${getStoreEntityLabel(editType, true)} berhasil disimpan!`)}
            onResetStore={isLocalTestingEnv && isRegistered && onResetStore ? () => setIsResetModalOpen(true) : undefined}
          />
        </SubPageLayout>
      )}

      {/* 3. SUBPAGE: CONTACT & LOCATION */}
      {viewMode === "location" && (
        <SubPageLayout
          title="Kontak & Lokasi"
          theme={theme}
          isMobileView={isMobileView}
          onBack={() => setViewMode("hub")}
        >
          <LocationSubpageForm
            theme={theme}
            editWhatsapp={editWhatsapp}
            setEditWhatsapp={setEditWhatsapp}
            isWhatsappVerified={isWhatsappVerified}
            onOpenWaModal={() => onVerifyWhatsapp?.(editWhatsapp)}
            editLatitude={editLatitude}
            editLongitude={editLongitude}
            onOpenLocationModal={() => setIsLocationModalOpen(true)}
            editAddress={editAddress}
            setEditAddress={setEditAddress}
            editCity={editCity}
            setEditCity={setEditCity}
            editDistrict={editDistrict}
            setEditDistrict={setEditDistrict}
            editVillage={editVillage}
            setEditVillage={setEditVillage}
            onSubmit={(e) => handleSaveSubForm(e, "Kontak & lokasi berhasil disimpan!")}
          />
        </SubPageLayout>
      )}

      {/* 4. SUBPAGE: OPERATING SCHEDULE */}
      {viewMode === "schedule" && (
        <SubPageLayout
          title="Jadwal Operasional"
          theme={theme}
          isMobileView={isMobileView}
          onBack={() => setViewMode("hub")}
        >
          <ScheduleSubpageForm
            theme={theme}
            isMobileView={isMobileView}
            storeType={editType}
            editOpenDays={editOpenDays}
            setEditOpenDays={setEditOpenDays}
            editIs24Hours={editIs24Hours}
            setEditIs24Hours={setEditIs24Hours}
            editOpenTime={editOpenTime}
            setEditOpenTime={setEditOpenTime}
            editCloseTime={editCloseTime}
            setEditCloseTime={setEditCloseTime}
            editDailyCustomHours={editDailyCustomHours}
            setEditDailyCustomHours={setEditDailyCustomHours}
            onSubmit={(e) => handleSaveSubForm(e, "Jadwal operasional berhasil disimpan!")}
          />
        </SubPageLayout>
      )}

      {/* 5. SUBPAGE: PAYMENT METHODS */}
      {viewMode === "payments" && (
        <SubPageLayout
          title="Metode Pembayaran"
          theme={theme}
          isMobileView={isMobileView}
          onBack={() => setViewMode("hub")}
        >
          <MerchantPaymentsView
            theme={theme}
            isMobileView={isMobileView}
            storeType={editType}
            editBankName={editBankName}
            setEditBankName={setEditBankName}
            editDanaPhone={editDanaPhone}
            setEditDanaPhone={setEditDanaPhone}
            editDanaName={editDanaName}
            setEditDanaName={setEditDanaName}
            editQrisImageUrl={editQrisImageUrl}
            setEditQrisImageUrl={setEditQrisImageUrl}
            editAcceptCod={editAcceptCod}
            setEditAcceptCod={setEditAcceptCod}
            handleQrisUpload={handleQrisUpload}
            referralCopied={referralCopied}
            handleCopyReferralCode={handleCopyReferralCode}
            onSavePayments={handleSavePaymentsSubForm}
          />
        </SubPageLayout>
      )}

      {/* 6. SUBPAGE: POS & CASHIER STAFF SETTINGS */}
      {viewMode === "pos" && (
        <SubPageLayout
          title="Pengaturan POS & Kasir"
          theme={theme}
          isMobileView={isMobileView}
          onBack={() => setViewMode("hub")}
        >
          <PosSettingsSubpageForm
            theme={theme}
            store={store}
            onFeedback={triggerFeedback}
          />
        </SubPageLayout>
      )}

      {/* MODALS */}
      {isLocationModalOpen && (
        <StoreLocationPickerModal
          isOpen={isLocationModalOpen}
          onClose={() => setIsLocationModalOpen(false)}
          theme={theme}
          isMobileView={isMobileView}
          initialLat={editLatitude}
          initialLng={editLongitude}
          initialAddress={editAddress}
          storeName={editName}
          onConfirmLocation={(result) => {
            setEditLatitude?.(result.lat);
            setEditLongitude?.(result.lng);
            if (result.fullAddress) {
              setEditAddress(result.fullAddress);
            }
            if (result.city) {
              setEditCity(result.city);
            }
            if (result.district) {
              setEditDistrict?.(result.district);
            }
            if (result.village) {
              setEditVillage?.(result.village);
            }
            setIsLocationModalOpen(false);
          }}
        />
      )}

      {isShippingModalOpen && (
        <ShippingSettingsModal
          isOpen={isShippingModalOpen}
          onClose={() => setIsShippingModalOpen(false)}
          theme={theme}
          isMobileView={isMobileView}
          shippingConfig={shippingConfig}
          store={store}
          onRefreshStore={onRefreshStore}
          onSave={async (newConfig) => {
            onUpdateShippingConfig?.(newConfig);
            setIsShippingModalOpen(false);
            if (onRefreshStore) await onRefreshStore();
          }}
        />
      )}

      <ResetStoreConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        storeName={editName}
        onResetStore={onResetStore}
        theme={theme}
      />
    </div>
  );
}
