import { useEffect, useRef } from "react";
import type { MerchantProduct } from "../../../types";

export interface UsePosBarcodeScannerProps {
  products: MerchantProduct[];
  onBarcodeDetected: (matchedProduct: MerchantProduct) => void;
  onBarcodeNotFound?: (code: string) => void;
}

export function usePosBarcodeScanner({
  products,
  onBarcodeDetected,
  onBarcodeNotFound
}: UsePosBarcodeScannerProps) {
  const barcodeBufferRef = useRef<string>("");
  const lastKeyTimeRef = useRef<number>(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not intercept if user is typing inside an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }

      const now = Date.now();
      if (now - lastKeyTimeRef.current > 150) {
        barcodeBufferRef.current = "";
      }
      lastKeyTimeRef.current = now;

      if (e.key === "Enter") {
        const scannedCode = barcodeBufferRef.current.trim();
        barcodeBufferRef.current = "";
        if (scannedCode.length >= 3) {
          const cleanCode = scannedCode.toLowerCase();
          const matched = products.find(
            (p) => p.barcode && p.barcode.trim().toLowerCase() === cleanCode
          );

          if (matched) {
            onBarcodeDetected(matched);
          } else {
            onBarcodeNotFound?.(scannedCode);
          }
        }
      } else if (e.key.length === 1) {
        barcodeBufferRef.current += e.key;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [products, onBarcodeDetected, onBarcodeNotFound]);

  return {
    handleManualBarcodeScan: (code: string) => {
      const cleanCode = code.trim().toLowerCase();
      const matched = products.find(
        (p) => p.barcode && p.barcode.trim().toLowerCase() === cleanCode
      );
      if (matched) {
        onBarcodeDetected(matched);
      } else {
        onBarcodeNotFound?.(code);
      }
    }
  };
}

