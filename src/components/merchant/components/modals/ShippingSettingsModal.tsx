import { ShieldCheck, AlertCircle } from 'lucide-react';
import type { ThemeType } from '../../../../theme';
import { getStoreEntityLabel, type StoreShippingConfig, type MerchantStore } from '../../types';
import { useMerchantCouriers } from '../courier/hooks/useMerchantCouriers';
import { AddCourierModal } from '../courier/components/AddCourierModal';
import { UnlinkCourierModal } from '../courier/components/UnlinkCourierModal';
import { ResetCourierCodeModal } from '../courier/components/ResetCourierCodeModal';
import { SetCourierPinModal } from '../courier/components/SetCourierPinModal';
import { CourierToast } from '../courier/components/CourierToast';

import { ShippingHeader } from './shipping-settings/ShippingHeader';
import { StoreDeliveryCard } from './shipping-settings/StoreDeliveryCard';
import { CourierFleetCard } from './shipping-settings/CourierFleetCard';
import { SelfPickupCard } from './shipping-settings/SelfPickupCard';
import { RegularCourierCard } from './shipping-settings/RegularCourierCard';
import { ShippingFooterBar } from './shipping-settings/ShippingFooterBar';
import { useShippingSettingsForm } from './shipping-settings/useShippingSettingsForm';

interface ShippingSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shippingConfig?: StoreShippingConfig;
  onSave: (config: StoreShippingConfig) => void;
  theme: ThemeType;
  isMobileView?: boolean;
  store?: MerchantStore | null;
  onRefreshStore?: () => Promise<void>;
}

export function ShippingSettingsModal({
  isOpen,
  onClose,
  shippingConfig,
  onSave,
  theme,
  isMobileView,
  store,
  onRefreshStore,
}: ShippingSettingsModalProps) {
  const couriers = useMerchantCouriers({ store: store ?? null, onRefreshStore });

  const {
    storeDelivery,
    setStoreDelivery,
    storeDeliveryPricingType,
    setStoreDeliveryPricingType,
    storeDeliveryFee,
    setStoreDeliveryFee,
    storeDeliveryFeePerKm,
    setStoreDeliveryFeePerKm,
    storeDeliveryMaxRadius,
    setStoreDeliveryMaxRadius,
    selfPickup,
    setSelfPickup,
    regularCourier,
    setRegularCourier,
    isSaved,
    atLeastOneActive,
    handleSave,
  } = useShippingSettingsForm({
    isOpen,
    onClose,
    shippingConfig,
    onSave,
  });

  if (!isOpen) return null;

  const entity = getStoreEntityLabel(store?.type);
  const entityLower = getStoreEntityLabel(store?.type, true);

  return (
    <div
      onClick={(e) => {
        if (!isMobileView && e.target === e.currentTarget) {
          onClose();
        }
      }}
      style={
        isMobileView
          ? {
              position: 'fixed',
              inset: 0,
              background: theme.bg,
              zIndex: 120,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }
          : {
              position: 'fixed',
              inset: 0,
              background: 'rgba(9, 12, 18, 0.56)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              zIndex: 120,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px 20px',
              boxSizing: 'border-box',
            }
      }
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Atur Pengiriman ${entity}`}
        style={
          isMobileView
            ? {
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                background: theme.bg,
              }
            : {
                width: '100%',
                maxWidth: 700,
                maxHeight: '90vh',
                borderRadius: 18,
                background: theme.bg,
                border: `1px solid ${theme.border}`,
                boxShadow: '0 24px 64px rgba(0, 0, 0, 0.34)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }
        }
      >
      {/* 1. Sticky Top Navigation Header */}
      <ShippingHeader
        theme={theme}
        isMobileView={isMobileView}
        storeType={store?.type}
        atLeastOneActive={atLeastOneActive}
        isSaved={isSaved}
        onClose={onClose}
        onSave={handleSave}
      />

      {/* 2. Scrollable Settings Content */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: isMobileView ? '16px 14px 24px' : '20px 22px 26px',
        }}
      >
        <div
          style={{
            maxWidth: 640,
            margin: '0 auto',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {/* Information Banner */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 14,
              background: theme.surface2,
              border: `1px solid ${theme.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <ShieldCheck size={16} color={theme.inkSoft} style={{ flexShrink: 0 }} />
            <div style={{ fontSize: 12.5, color: theme.inkSoft, lineHeight: 1.4 }}>
              Metode pengiriman yang aktif akan tampil sebagai pilihan checkout bagi pembeli di etalase toko Anda.
            </div>
          </div>

          {/* Option 1: Store Courier Delivery */}
          <StoreDeliveryCard
            theme={theme}
            isMobileView={isMobileView}
            storeType={store?.type}
            storeDelivery={storeDelivery}
            onToggleStoreDelivery={() => setStoreDelivery((prev) => !prev)}
            storeDeliveryMaxRadius={storeDeliveryMaxRadius}
            onChangeMaxRadius={setStoreDeliveryMaxRadius}
            storeDeliveryPricingType={storeDeliveryPricingType}
            onChangePricingType={setStoreDeliveryPricingType}
            storeDeliveryFee={storeDeliveryFee}
            onChangeFee={setStoreDeliveryFee}
            storeDeliveryFeePerKm={storeDeliveryFeePerKm}
            onChangeFeePerKm={setStoreDeliveryFeePerKm}
          />

          {/* Option 1.5: Dedicated Store Courier Fleet Card */}
          {storeDelivery && (
            <CourierFleetCard
              theme={theme}
              isMobileView={isMobileView}
              couriers={couriers}
            />
          )}

          {/* Option 2: Self Pickup at Store */}
          <SelfPickupCard
            theme={theme}
            isMobileView={isMobileView}
            storeType={store?.type}
            selfPickup={selfPickup}
            onToggleSelfPickup={() => setSelfPickup((prev) => !prev)}
          />

          {/* Option 3: Regular Third-Party Logistics */}
          <RegularCourierCard
            theme={theme}
            isMobileView={isMobileView}
            regularCourier={regularCourier}
            onToggleRegularCourier={() => setRegularCourier((prev) => !prev)}
          />

          {/* Warning Alert if No Shipping Method is Selected */}
          {!atLeastOneActive && (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: 14,
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#EF4444',
                fontSize: 12.5,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>Minimal satu metode pengiriman harus diaktifkan agar {entityLower} dapat melayani pesanan.</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Sticky Bottom Action Bar */}
      <ShippingFooterBar
        theme={theme}
        atLeastOneActive={atLeastOneActive}
        isSaved={isSaved}
        onClose={onClose}
        onSave={handleSave}
      />

      {/* Modals for Courier Fleet Management */}
      <AddCourierModal
        show={couriers.showAddModal}
        onClose={() => couriers.setShowAddModal(false)}
        onSubmit={couriers.handleAddCourier}
        theme={theme}
        isMobileView={isMobileView}
        name={couriers.newCourierName}
        setName={couriers.setNewCourierName}
        phone={couriers.newCourierPhone}
        setPhone={couriers.setNewCourierPhone}
        vehicle={couriers.newCourierVehicle}
        setVehicle={couriers.setNewCourierVehicle}
        plate={couriers.newCourierPlate}
        setPlate={couriers.setNewCourierPlate}
        newCourierPin={couriers.newCourierPin}
        setNewCourierPin={couriers.setNewCourierPin}
        isAdding={couriers.isAddingCourier}
      />

      <UnlinkCourierModal
        courier={couriers.courierToDelete}
        onClose={() => couriers.setCourierToDelete(null)}
        onConfirm={couriers.executeUnlinkCourier}
        isDeleting={couriers.isDeletingCourier}
        theme={theme}
      />

      <ResetCourierCodeModal
        courier={couriers.courierToReset}
        onClose={() => couriers.setCourierToReset(null)}
        onConfirm={couriers.executeResetCourierCode}
        isResetting={couriers.isResettingCode}
        theme={theme}
      />

      <SetCourierPinModal
        isOpen={Boolean(couriers.courierToSetPin)}
        courier={couriers.courierToSetPin}
        isUpdating={couriers.isUpdatingPin}
        theme={theme}
        onConfirm={couriers.executeUpdateCourierPin}
        onCancel={() => couriers.setCourierToSetPin(null)}
      />

      <CourierToast toast={couriers.actionToast} />
      </div>
    </div>
  );
}
