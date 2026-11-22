import { useState, useEffect } from 'react';
import type { StoreShippingConfig } from '../../../types';
import { registerBackHandler } from '../../../../../utils/backButton';

interface UseShippingSettingsFormParams {
  isOpen: boolean;
  onClose: () => void;
  shippingConfig?: StoreShippingConfig;
  onSave: (config: StoreShippingConfig) => void;
  closeOnSave?: boolean;
  skipBackHandler?: boolean;
}

export function useShippingSettingsForm({
  isOpen,
  onClose,
  shippingConfig,
  onSave,
  closeOnSave = true,
  skipBackHandler = false,
}: UseShippingSettingsFormParams) {
  const [storeDelivery, setStoreDelivery] = useState(shippingConfig?.storeDelivery ?? true);
  const [storeDeliveryPricingType, setStoreDeliveryPricingType] = useState<'FLAT' | 'PER_KM'>(
    shippingConfig?.storeDeliveryPricingType ?? 'FLAT'
  );
  const [storeDeliveryFee, setStoreDeliveryFee] = useState<string>(
    shippingConfig?.storeDeliveryFee !== undefined ? String(shippingConfig.storeDeliveryFee) : '5000'
  );
  const [storeDeliveryFeePerKm, setStoreDeliveryFeePerKm] = useState<string>(
    shippingConfig?.storeDeliveryFeePerKm !== undefined ? String(shippingConfig.storeDeliveryFeePerKm) : '2000'
  );
  const [storeDeliveryMaxRadius, setStoreDeliveryMaxRadius] = useState<string>(
    shippingConfig?.storeDeliveryMaxRadius !== undefined ? String(shippingConfig.storeDeliveryMaxRadius) : '5'
  );
  const [storeDeliveryNotes, setStoreDeliveryNotes] = useState(
    shippingConfig?.storeDeliveryNotes ?? 'Direct delivery by store courier for nearby areas.'
  );
  const [selfPickup, setSelfPickup] = useState(shippingConfig?.selfPickup ?? true);
  const [regularCourier, setRegularCourier] = useState(shippingConfig?.regularCourier ?? false);
  const [pickupInstructions, setPickupInstructions] = useState(
    shippingConfig?.pickupInstructions ??
      'Please show the buyer name or order number to the cashier when picking up your order.'
  );
  const [isSaved, setIsSaved] = useState(false);

  // Register sequential back handler for shipping settings modal
  useEffect(() => {
    if (!isOpen || skipBackHandler) return;
    return registerBackHandler('shipping_settings_modal', 80, () => {
      onClose();
      return true;
    });
  }, [isOpen, skipBackHandler, onClose]);

  useEffect(() => {
    if (isOpen && shippingConfig) {
      setStoreDelivery(shippingConfig.storeDelivery ?? true);
      setStoreDeliveryPricingType(shippingConfig.storeDeliveryPricingType ?? 'FLAT');
      setStoreDeliveryFee(
        shippingConfig.storeDeliveryFee !== undefined ? String(shippingConfig.storeDeliveryFee) : '5000'
      );
      setStoreDeliveryFeePerKm(
        shippingConfig.storeDeliveryFeePerKm !== undefined ? String(shippingConfig.storeDeliveryFeePerKm) : '2000'
      );
      setStoreDeliveryMaxRadius(
        shippingConfig.storeDeliveryMaxRadius !== undefined ? String(shippingConfig.storeDeliveryMaxRadius) : '5'
      );
      setStoreDeliveryNotes(
        shippingConfig.storeDeliveryNotes ?? 'Direct delivery by store courier for nearby areas.'
      );
      setSelfPickup(shippingConfig.selfPickup ?? true);
      setRegularCourier(shippingConfig.regularCourier ?? false);
      setPickupInstructions(
        shippingConfig.pickupInstructions ??
          'Please show the buyer name or order number to the cashier when picking up your order.'
      );
      if (closeOnSave) {
        setIsSaved(false);
      }
    }
  }, [isOpen, shippingConfig, closeOnSave]);

  const atLeastOneActive = storeDelivery || selfPickup || regularCourier;

  const handleSave = () => {
    if (!atLeastOneActive) return;
    onSave({
      seraInstant: false,
      storeDelivery,
      storeDeliveryPricingType,
      storeDeliveryFee: Number(storeDeliveryFee) || 0,
      storeDeliveryFeePerKm: Number(storeDeliveryFeePerKm) || 0,
      storeDeliveryMaxRadius: Number(storeDeliveryMaxRadius) || 0,
      storeDeliveryNotes: storeDeliveryNotes.trim(),
      selfPickup,
      regularCourier,
      pickupInstructions: pickupInstructions.trim(),
    });
    setIsSaved(true);
    if (closeOnSave) {
      setTimeout(() => {
        onClose();
      }, 400);
    } else {
      setTimeout(() => {
        setIsSaved(false);
      }, 1800);
    }
  };

  return {
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
    storeDeliveryNotes,
    setStoreDeliveryNotes,
    selfPickup,
    setSelfPickup,
    regularCourier,
    setRegularCourier,
    pickupInstructions,
    setPickupInstructions,
    isSaved,
    atLeastOneActive,
    handleSave,
  };
}

