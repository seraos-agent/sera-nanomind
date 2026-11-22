import { useState, useEffect } from "react";
import type { BarcodeScannerModalProps } from "./barcode-scanner/types";
import { useBarcodeScanner } from "./barcode-scanner/useBarcodeScanner";
import { playScanBeep } from "./barcode-scanner/sound";
import { ScannerMobileLayout } from "./barcode-scanner/ScannerMobileLayout";
import { ScannerDesktopLayout } from "./barcode-scanner/ScannerDesktopLayout";
import { registerBackHandler } from "../../../../utils/backButton";

export function BarcodeScannerModal({
  isOpen,
  onClose,
  onDetected,
  theme,
  title = "Scan Barcode",
  continuous = false,
  cartItems,
  rawSubtotal: _rawSubtotal = 0,
  productDiscountTotal = 0,
  manualDiscountNominal = 0,
  onUpdateManualDiscount,
  totalAmount = 0,
  totalCount = 0,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onProceedToPayment,
}: BarcodeScannerModalProps) {
  const [manualCode, setManualCode] = useState("");
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Hardware Camera & Scanner Controller
  const {
    regionId,
    isStarting,
    cameraError,
    lastScanned,
    hasTorch,
    isTorchOn,
    toggleTorch,
    stopScanner,
  } = useBarcodeScanner({
    isOpen,
    continuous,
    isMobile,
    onDetected,
    onClose,
  });

  // Register sequential back handler for Cart Drawer (priority 95)
  useEffect(() => {
    if (!isOpen || !isCartDrawerOpen) return;
    return registerBackHandler("barcode_scanner_cart_drawer", 95, () => {
      setIsCartDrawerOpen(false);
      return true;
    });
  }, [isOpen, isCartDrawerOpen]);

  // Register sequential back handler: ensures hardware back terminates the camera before closing modal
  useEffect(() => {
    if (!isOpen) return;
    return registerBackHandler("barcode_scanner_modal", 90, () => {
      setIsCartDrawerOpen(false);
      stopScanner();
      onClose();
      return true;
    });
  }, [isOpen, onClose, stopScanner]);

  // Prevent background scrolling when barcode scanner modal is open
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = manualCode.trim();
    if (!clean) return;
    playScanBeep();
    onDetected(clean);
    setManualCode("");
    if (!continuous) {
      stopScanner();
      onClose();
    }
  };

  const handleClose = () => {
    setIsCartDrawerOpen(false);
    stopScanner();
    onClose();
  };

  const handlePayment = () => {
    stopScanner();
    setIsCartDrawerOpen(false);
    if (onProceedToPayment) {
      onProceedToPayment();
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  if (isMobile) {
    return (
      <ScannerMobileLayout
        regionId={regionId}
        theme={theme}
        title={title}
        continuous={continuous}
        isStarting={isStarting}
        cameraError={cameraError}
        lastScanned={lastScanned}
        hasTorch={hasTorch}
        isTorchOn={isTorchOn}
        toggleTorch={toggleTorch}
        manualCode={manualCode}
        setManualCode={setManualCode}
        handleManualSubmit={handleManualSubmit}
        isCartDrawerOpen={isCartDrawerOpen}
        setIsCartDrawerOpen={setIsCartDrawerOpen}
        cartItems={cartItems}
        totalCount={totalCount}
        totalAmount={totalAmount}
        productDiscountTotal={productDiscountTotal}
        manualDiscountNominal={manualDiscountNominal}
        onUpdateManualDiscount={onUpdateManualDiscount}
        onUpdateQty={onUpdateQty}
        onRemoveItem={onRemoveItem}
        onClearCart={onClearCart}
        onProceedToPayment={handlePayment}
        onClose={handleClose}
      />
    );
  }

  return (
    <ScannerDesktopLayout
      regionId={regionId}
      theme={theme}
      title={title}
      continuous={continuous}
      isStarting={isStarting}
      cameraError={cameraError}
      lastScanned={lastScanned}
      hasTorch={hasTorch}
      isTorchOn={isTorchOn}
      toggleTorch={toggleTorch}
      manualCode={manualCode}
      setManualCode={setManualCode}
      handleManualSubmit={handleManualSubmit}
      cartItems={cartItems}
      totalCount={totalCount}
      totalAmount={totalAmount}
      onProceedToPayment={handlePayment}
      onClose={handleClose}
    />
  );
}
