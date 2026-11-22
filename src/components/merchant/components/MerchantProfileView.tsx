import React, { useState, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import type { ThemeType } from "../../../theme";
import {
  DEFAULT_SHIPPING_CONFIG,
  formatScheduleString,
  getStoreEntityLabel,
  type StoreType,
  type StoreShippingConfig,
  type MerchantStore
} from "../types";
import { formatStorePinLocation } from "../../marketplace/utils/formatters";
import { MerchantPaymentsView } from "./MerchantPaymentsView";
import { StoreLocationPickerModal } from "./modals/StoreLocationPickerModal";
import { ShippingSettingsModal } from "./modals/ShippingSettingsModal";
import { registerBackHandler } from "../../../utils/backButton";

// Modular Profile Components
import { SubPageLayout } from "./profile/components/SubPageLayout";
import { StoreSummaryCard, type StoreOverviewRow } from "./profile/components/StoreSummaryCard";
import { HubNavigationMenu, type HubNavigationMode } from "./profile/components/HubNavigationMenu";
import { ProfileSubpageForm } from "./profile/components/ProfileSubpageForm";
import { LocationSubpageForm } from "./profile/components/LocationSubpageForm";
import { ScheduleSubpageForm } from "./profile/components/ScheduleSubpageForm";
import { StoreOnboardingRegistrationCard } from "./profile/components/StoreOnboardingRegistrationCard";
import { DevResetStoreBanner } from "./profile/components/DevResetStoreBanner";
import { ResetStoreConfirmModal } from "./profile/components/ResetStoreConfirmModal";
import { PosSettingsSubpageForm } from "./profile/components/PosSettingsSubpageForm";

export type InfoTokoViewMode = HubNavigationMode;

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
    if (isMobileView) {
      setViewMode("hub");
    }
  };

  const handleSavePaymentsSubForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSavePayments) {
      onSavePayments(e);
    } else {
      onSaveProfile(e);
    }
    triggerFeedback("Payment methods saved!");
    if (isMobileView) {
      setViewMode("hub");
    }
  };

  const entity = getStoreEntityLabel(editType);
  const sectionTitles: Record<Exclude<InfoTokoViewMode, "hub">, string> = {
    profile: "Profile & Identity",
    payments: "Payment Methods",
    location: "Address & GPS Location",
    schedule: "Operating Hours",
    shipping: `${entity} Shipping`,
    pos: "POS & Cashier Settings"
  };

  const buildDesktopOverviewRows = (): StoreOverviewRow[] => {
    const locationSummary =
      editAddress.trim() ||
      formatStorePinLocation({
        city: editCity,
        district: editDistrict,
        village: editVillage,
        address: editAddress,
        fallback: "Address not set"
      });
    const scheduleSummary = formatScheduleString(
      editOpenDays,
      editOpenTime,
      editCloseTime,
      editIs24Hours,
      editDailyCustomHours
    );

    const paymentParts: string[] = [];
    if (editDanaPhone.trim()) paymentParts.push(`${editBankName || "Bank"} Transfer`);
    if (editQrisImageUrl.trim()) paymentParts.push("QRIS");
    if (editAcceptCod) paymentParts.push("COD");

    const effectiveShipping = shippingConfig ?? DEFAULT_SHIPPING_CONFIG;
    const shippingParts: string[] = [];
    if (effectiveShipping.storeDelivery ?? true) shippingParts.push("Store Delivery");
    if (effectiveShipping.selfPickup ?? true) shippingParts.push("Self Pickup");
    if (effectiveShipping.regularCourier) shippingParts.push("Regular Courier");

    return [
      {
        id: "location",
        label: "Address",
        value: locationSummary,
        badge:
          editLatitude !== undefined && editLongitude !== undefined
            ? "GPS Pinned"
            : undefined,
        onClick: () => setViewMode("location")
      },
      {
        id: "schedule",
        label: "Operating Hours",
        value: scheduleSummary,
        onClick: () => setViewMode("schedule")
      },
      {
        id: "whatsapp",
        label: "WhatsApp",
        value: editWhatsapp.trim() || "Not set",
        badge: isWhatsappVerified ? "Verified" : undefined,
        onClick: () => setViewMode("profile")
      },
      {
        id: "payments",
        label: "Payments",
        value: paymentParts.length > 0 ? paymentParts.join(", ") : "Not configured",
        onClick: () => setViewMode("payments")
      },
      {
        id: "shipping",
        label: "Shipping",
        value: shippingParts.length > 0 ? shippingParts.join(", ") : "Disabled",
        onClick: () => setViewMode("shipping")
      }
    ];
  };

  const renderSectionContent = (mode: Exclude<InfoTokoViewMode, "hub">) => {
    switch (mode) {
      case "profile":
        return (
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
            onSubmit={(e) => handleSaveSubForm(e, `${entity} profile saved!`)}
            onResetStore={
              isLocalTestingEnv && isRegistered && onResetStore
                ? () => setIsResetModalOpen(true)
                : undefined
            }
          />
        );
      case "location":
        return (
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
            onSubmit={(e) => handleSaveSubForm(e, "Address & location saved!")}
          />
        );
      case "schedule":
        return (
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
            onSubmit={(e) => handleSaveSubForm(e, "Operating hours saved!")}
          />
        );
      case "payments":
        return (
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
            embedded={!isMobileView}
          />
        );
      case "shipping":
        return (
          <ShippingSettingsModal
            isOpen={true}
            inline={!isMobileView}
            onClose={() => setViewMode("hub")}
            theme={theme}
            isMobileView={isMobileView}
            shippingConfig={shippingConfig}
            store={store}
            onRefreshStore={onRefreshStore}
            onSave={async (newConfig) => {
              onUpdateShippingConfig?.(newConfig);
              triggerFeedback("Shipping settings saved!");
              if (isMobileView) {
                setViewMode("hub");
              }
              if (onRefreshStore) await onRefreshStore();
            }}
          />
        );
      case "pos":
        return (
          <PosSettingsSubpageForm
            theme={theme}
            store={store}
            onFeedback={triggerFeedback}
          />
        );
    }
  };

  const renderSharedModals = () => (
    <>
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

      {isMobileView && isShippingModalOpen && (
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
    </>
  );

  // Desktop 2-column split workspace matching clean POS proportions
  if (!isMobileView) {
    return (
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "row",
          gap: 16,
          padding: "18px 22px",
          width: "100%",
          minHeight: 0,
          overflow: "hidden",
          alignItems: "stretch",
          boxSizing: "border-box"
        }}
      >
        {/* Left Column: Borderless Scrollable Content directly on theme.bg */}
        <div
          className="store-info-scroll"
          style={{
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
            paddingRight: 4
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              paddingBottom: 24
            }}
          >
            {statusFeedback && (
              <div
                style={{
                  padding: "11px 15px",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
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

            {viewMode === "hub" ? (
              <>
                <StoreSummaryCard
                  theme={theme}
                  isMobileView={false}
                  isDesktopHero={true}
                  storeType={editType}
                  editBannerUrl={editBannerUrl}
                  editLogoUrl={editLogoUrl}
                  editName={editName}
                  editCategory={editCategory}
                  editDescription={editDescription}
                  editCity={editCity}
                  editDistrict={editDistrict}
                  editVillage={editVillage}
                  editAddress={editAddress}
                  overviewRows={buildDesktopOverviewRows()}
                />

                {isLocalTestingEnv && isRegistered && onResetStore && (
                  <DevResetStoreBanner
                    theme={theme}
                    onOpenResetModal={() => setIsResetModalOpen(true)}
                  />
                )}
              </>
            ) : (
              <>
                <div
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: theme.ink,
                    paddingBottom: 2
                  }}
                >
                  {sectionTitles[viewMode]}
                </div>
                {renderSectionContent(viewMode)}
              </>
            )}
          </div>
        </div>

        {/* Right Column: Stationary Store Settings Menu */}
        <div
          style={{
            width: "clamp(210px, 26vw, 320px)",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: 14,
            minHeight: 0,
            overflowY: "auto"
          }}
        >
          <HubNavigationMenu
            theme={theme}
            storeType={editType}
            activeMode={viewMode}
            isDesktopSplit={true}
            onNavigate={setViewMode}
            onOpenShippingModal={() => setViewMode("shipping")}
            isRegistered={isRegistered}
            completionStatus={{
              profile: isProfileComplete,
              location: isLocationComplete,
              schedule: isScheduleComplete,
              payments: isPaymentsComplete
            }}
          />

          {!isRegistered && (
            <StoreOnboardingRegistrationCard
              theme={theme}
              isMobileView={false}
              completedCount={completedCount}
              isAllDataComplete={isAllDataComplete}
              onRegisterStore={onRegisterStore}
              onFeedback={triggerFeedback}
            />
          )}
        </div>

        {renderSharedModals()}
      </div>
    );
  }

  // Mobile 1-column hub + full-screen subpages/modals
  return (
    <div
      style={{
        padding: "16px 14px 60px",
        maxWidth: 600,
        margin: "0 auto",
        width: "100%"
      }}
    >
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

          {isLocalTestingEnv && isRegistered && onResetStore && (
            <DevResetStoreBanner
              theme={theme}
              onOpenResetModal={() => setIsResetModalOpen(true)}
            />
          )}
        </div>
      )}

      {viewMode !== "hub" && viewMode !== "shipping" && (
        <SubPageLayout
          title={sectionTitles[viewMode]}
          theme={theme}
          isMobileView={isMobileView}
          onBack={() => setViewMode("hub")}
        >
          {renderSectionContent(viewMode)}
        </SubPageLayout>
      )}

      {viewMode === "shipping" && renderSectionContent("shipping")}

      {renderSharedModals()}
    </div>
  );
}
