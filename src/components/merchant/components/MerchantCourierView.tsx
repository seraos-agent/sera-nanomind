import type { ThemeType } from "../../../theme";
import type { MerchantStore } from "../types";
import { formatIndonesianPhone } from "./courier/utils/courierUtils";
import { useMerchantCouriers } from "./courier/hooks/useMerchantCouriers";
import { MerchantCourierHeader } from "./courier/components/MerchantCourierHeader";
import { CourierFleetList } from "./courier/components/CourierFleetList";
import { CourierConfigForm } from "./courier/components/CourierConfigForm";
import { AddCourierModal } from "./courier/components/AddCourierModal";
import { UnlinkCourierModal } from "./courier/components/UnlinkCourierModal";
import { ResetCourierCodeModal } from "./courier/components/ResetCourierCodeModal";
import { SetCourierPinModal } from "./courier/components/SetCourierPinModal";
import { CourierToast } from "./courier/components/CourierToast";

export { formatIndonesianPhone };

export interface MerchantCourierViewProps {
  store: MerchantStore | null;
  theme: ThemeType;
  isMobileView?: boolean;
  onRefreshStore?: () => Promise<void>;
  embedded?: boolean;
}

export function MerchantCourierView({
  store,
  theme,
  isMobileView,
  onRefreshStore,
  embedded = false
}: MerchantCourierViewProps) {
  const couriers = useMerchantCouriers({ store, onRefreshStore });

  return (
    <div
      style={{
        maxWidth: embedded ? "100%" : 600,
        margin: "0 auto",
        padding: embedded ? 0 : isMobileView ? "16px 14px 80px" : "24px 20px 80px",
        fontFamily: "inherit",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 18
      }}
    >
      {/* 1. Header Card */}
      <MerchantCourierHeader
        theme={theme}
        isMobileView={isMobileView}
        storeType={store?.type}
        courierCount={couriers.linkedCouriers.length}
        enabled={couriers.config.enabled}
        onToggleEnabled={() => couriers.setConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
        onOpenAddModal={() => couriers.setShowAddModal(true)}
      />

      {/* 2. Fleet Cards & Rates Config Form */}
      <CourierFleetList
        linkedCouriers={couriers.linkedCouriers}
        theme={theme}
        isMobileView={isMobileView}
        copiedCourierCode={couriers.copiedCourierCode}
        onOpenAddModal={() => couriers.setShowAddModal(true)}
        onCopyCode={couriers.handleCopyCourierCode}
        onShareWhatsApp={couriers.handleShareCourierWhatsApp}
        onRequestResetCode={couriers.setCourierToReset}
        onRequestSetPin={couriers.setCourierToSetPin}
        onRequestUnlink={couriers.setCourierToDelete}
      />

      <CourierConfigForm
        config={couriers.config}
        setConfig={couriers.setConfig}
        theme={theme}
        isMobileView={isMobileView}
        isSaving={couriers.isSaving}
        saveSuccess={couriers.saveSuccess}
        errorMessage={couriers.errorMessage}
        onSave={couriers.handleSaveConfig}
      />

      {/* 3. In-App Modals */}
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

      {/* 4. In-App Action Toast */}
      <CourierToast toast={couriers.actionToast} />
    </div>
  );
}

export default MerchantCourierView;
