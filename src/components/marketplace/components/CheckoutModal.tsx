import React, { useState, useEffect, useRef } from 'react';
import type { CartItem, MarketplaceOrder, StoreCourierConfig } from '../types';
import { getMarketApiUrl } from '../utils/api';
import { StoreLocationPickerModal, type StoreLocationResult } from '../../merchant/components/modals/StoreLocationPickerModal';
import { THEME, type ThemeType } from '../../../theme';
import { compressImageFile } from '../../../utils/imageCompressor';
import { submitCheckoutOrder } from './checkout/checkoutOrderSubmitter';
import { CheckoutShippingSection } from './checkout/CheckoutShippingSection';
import { CheckoutPaymentSection } from './checkout/CheckoutPaymentSection';

interface CheckoutModalProps {
  items: CartItem[];
  onClose: () => void;
  onSuccess: (order: MarketplaceOrder) => void;
  onOpenAddressSettings?: () => void;
  theme?: ThemeType;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  items,
  onClose,
  onSuccess,
  theme,
}) => {
  const [name, setName] = useState(() => (
    typeof window !== 'undefined'
      ? localStorage.getItem('sera_customer_name') || localStorage.getItem('sera_user_name') || ''
      : ''
  ));
  const [phone, setPhone] = useState(() => (
    typeof window !== 'undefined'
      ? localStorage.getItem('sera_customer_phone') || localStorage.getItem('sera_user_phone') || ''
      : ''
  ));
  const [address, setAddress] = useState(() => (
    typeof window !== 'undefined' ? localStorage.getItem('sera_customer_address') || '' : ''
  ));
  const [destCoords, setDestCoords] = useState<{ lat: number; lng: number } | undefined>(() => {
    if (typeof window === 'undefined') return undefined;
    const rawLat = localStorage.getItem('sera_customer_lat');
    const rawLng = localStorage.getItem('sera_customer_lng');
    if (rawLat && rawLng && !isNaN(parseFloat(rawLat)) && !isNaN(parseFloat(rawLng))) {
      return { lat: parseFloat(rawLat), lng: parseFloat(rawLng) };
    }
    return undefined;
  });
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);

  const handleConfirmMapLocation = (result: StoreLocationResult) => {
    setDestCoords({ lat: result.lat, lng: result.lng });
    if (result.fullAddress) setAddress(result.fullAddress);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('sera_customer_lat', String(result.lat));
        localStorage.setItem('sera_customer_lng', String(result.lng));
        if (result.fullAddress) localStorage.setItem('sera_customer_address', result.fullAddress);
      } catch { }
    }
    setIsMapPickerOpen(false);
  };

  const [bookingDate, setBookingDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return `${tomorrow.toISOString().split('T')[0]} 10:00`;
  });
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'QRIS' | 'DANA' | 'TRANSFER' | 'COD'>('QRIS');
  const [paymentProof, setPaymentProof] = useState<string | null>(null);
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [shippingMethod, setShippingMethod] = useState<'STORE_DELIVERY' | 'SERA_INSTANT' | 'PICKUP'>('STORE_DELIVERY');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [storeCourierConfig, setStoreCourierConfig] = useState<StoreCourierConfig | null>(null);
  const [storeData, setStoreData] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('sera_merchant_store');
        if (saved) return JSON.parse(saved);
      } catch { }
    }
    return null;
  });
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    const storeId = items[0]?.item.storeId;
    if (!storeId) return;
    fetch(getMarketApiUrl(`/api/market/stores/${storeId}`))
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data?.store) {
          setStoreData((prev: any) => ({ ...prev, ...json.data.store }));
          if (json.data.store.courierConfig) {
            setStoreCourierConfig(json.data.store.courierConfig);
          }
        }
      })
      .catch(() => { });
  }, [items]);

  const subtotal = items.reduce((acc, c) => {
    const price = c.selectedVariant ? c.selectedVariant.price : c.item.price;
    return acc + price * c.quantity;
  }, 0);

  const hasGoods = items.some(i => i.item.type === 'GOODS');
  const hasService = items.some(i => i.item.type === 'SERVICE');

  let storeDeliveryFee = 5000;
  let isFreeStoreDelivery = false;
  if (storeCourierConfig) {
    if (storeCourierConfig.freeDeliveryThreshold && subtotal >= storeCourierConfig.freeDeliveryThreshold) {
      storeDeliveryFee = 0;
      isFreeStoreDelivery = true;
    } else {
      storeDeliveryFee = storeCourierConfig.flatRate || 5000;
    }
  }

  const deliveryOrServiceFee = !hasGoods
    ? 0
    : shippingMethod === 'PICKUP'
      ? 0
      : shippingMethod === 'STORE_DELIVERY'
        ? storeDeliveryFee
        : 14000;

  const totalAmount = subtotal + deliveryOrServiceFee;
  const isAddressMissing = hasGoods && shippingMethod !== 'PICKUP' && !address.trim();

  const storeId = items[0]?.item.storeId || 'default-store';
  const storeName = items[0]?.item.storeName || storeData?.name || 'SERA Market';

  const storePaymentProvider = storeData?.bankName || 'BCA';
  const storeAccountNumber = storeData?.bankAccount || storeData?.danaPhone || '081234567890';
  const storeAccountHolder = storeData?.bankHolder || storeData?.danaName || storeName;
  const storeQrisUrl = storeData?.qrisImageUrl || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=QRIS-${encodeURIComponent(storeName)}`;

  const handleCopy = (text: string, fieldId: string) => {
    if (!navigator?.clipboard) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDownloadQris = (url: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `QRIS-${(storeName || 'store').replace(/\s+/g, '_')}.png`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a payment proof image file (JPG, PNG, or WebP)');
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      setErrorMessage('Maximum file size is 12MB');
      return;
    }

    setIsUploadingProof(true);
    setErrorMessage('');
    try {
      const compressedDataUrl = await compressImageFile(file, {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.65
      });
      setPaymentProof(compressedDataUrl);
    } catch {
      setErrorMessage('Failed to process image file. Please try again.');
    } finally {
      setIsUploadingProof(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setErrorMessage('Name and WhatsApp number are required.');
      return;
    }
    if (isAddressMissing) {
      setErrorMessage('Delivery address is required in Profile Settings for courier delivery.');
      return;
    }
    if (!paymentProof) {
      setErrorMessage('Please upload a payment proof photo or screenshot first.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const order = await submitCheckoutOrder({
        storeId,
        storeName,
        items,
        subtotal,
        deliveryOrServiceFee,
        totalAmount,
        name,
        phone,
        address,
        destCoords,
        bookingDate,
        notes,
        hasGoods,
        hasService,
        shippingMethod,
        paymentMethod,
        paymentProof
      });
      onSuccess(order);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        style={{
          background: 'var(--bg-surface, #FFFFFF)',
          border: '1px solid var(--border-color)',
          borderRadius: '20px',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '22px 20px',
          boxShadow: 'var(--shadow-modal)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              Order Checkout
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Complete shipping & payment details
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--bg-subtle)',
              border: 'none',
              color: 'var(--text-sub)',
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            ✕
          </button>
        </div>

        {errorMessage && (
          <div style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            color: '#DC2626',
            padding: '11px 14px',
            borderRadius: '12px',
            fontSize: '0.82rem',
            marginBottom: '16px',
            fontWeight: 600
          }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <CheckoutShippingSection
            name={name}
            onChangeName={setName}
            phone={phone}
            onChangePhone={setPhone}
            address={address}
            onChangeAddress={setAddress}
            bookingDate={bookingDate}
            onChangeBookingDate={setBookingDate}
            notes={notes}
            onChangeNotes={setNotes}
            hasGoods={hasGoods}
            hasService={hasService}
            shippingMethod={shippingMethod}
            onChangeShippingMethod={setShippingMethod}
            storeDeliveryFee={storeDeliveryFee}
            isFreeStoreDelivery={isFreeStoreDelivery}
            onOpenMapPicker={() => setIsMapPickerOpen(true)}
          />

          <CheckoutPaymentSection
            paymentMethod={paymentMethod}
            onChangePaymentMethod={setPaymentMethod}
            storeName={storeName}
            storeQrisUrl={storeQrisUrl}
            storePaymentProvider={storePaymentProvider}
            storeAccountNumber={storeAccountNumber}
            storeAccountHolder={storeAccountHolder}
            totalAmount={totalAmount}
            subtotal={subtotal}
            deliveryOrServiceFee={deliveryOrServiceFee}
            itemCount={items.length}
            copiedField={copiedField}
            onCopy={handleCopy}
            onDownloadQris={handleDownloadQris}
            fileInputRef={fileInputRef}
            paymentProof={paymentProof}
            isUploadingProof={isUploadingProof}
            onFileChange={handleFileChange}
          />

          <button
            type="submit"
            disabled={isSubmitting || isAddressMissing || !paymentProof}
            style={{
              width: '100%',
              padding: '14px 20px',
              borderRadius: '24px',
              border: 'none',
              background: 'var(--color-brand)',
              color: '#FFFFFF',
              fontSize: '0.92rem',
              fontWeight: 700,
              marginTop: '2px',
              opacity: (isAddressMissing || !paymentProof) ? 0.45 : 1,
              cursor: (isAddressMissing || !paymentProof) ? 'not-allowed' : 'pointer',
              transition: 'opacity 0.15s ease'
            }}
          >
            {isSubmitting
              ? 'Processing order...'
              : !paymentProof
                ? 'Upload payment proof to continue'
                : 'Place order'}
          </button>
        </form>
      </div>

      <StoreLocationPickerModal
        isOpen={isMapPickerOpen}
        onClose={() => setIsMapPickerOpen(false)}
        title="Delivery Address Pin"
        initialLat={destCoords?.lat}
        initialLng={destCoords?.lng}
        initialAddress={address}
        onConfirmLocation={handleConfirmMapLocation}
        theme={theme || (typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark' ? THEME.dark : THEME.light)}
        isMobileView={typeof window !== 'undefined' && window.innerWidth < 768}
      />
    </div>
  );
};
