import { useState, useEffect, useRef } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { playScanBeep } from "./sound";

interface UseBarcodeScannerOptions {
  isOpen: boolean;
  continuous: boolean;
  isMobile: boolean;
  onDetected: (code: string) => void;
  onClose: () => void;
}

export function useBarcodeScanner({
  isOpen,
  continuous,
  isMobile,
  onDetected,
  onClose,
}: UseBarcodeScannerOptions) {
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const regionId = "sera-barcode-scanner-viewport";
  const cooldownRef = useRef(false);

  // Synchronous and safe hardware camera teardown
  const stopScanner = () => {
    // 1. Immediately kill all active MediaStream tracks on any video element in the container
    try {
      const container = document.getElementById(regionId);
      const videoElements = container
        ? container.querySelectorAll("video")
        : document.querySelectorAll(`#${regionId} video`);

      videoElements.forEach((video) => {
        const stream = (video as HTMLVideoElement).srcObject as MediaStream | null;
        if (stream) {
          stream.getTracks().forEach((track) => {
            try {
              track.stop();
            } catch {}
          });
          (video as HTMLVideoElement).srcObject = null;
        }
      });
    } catch (err) {
      console.warn("[BarcodeScannerModal] MediaStream teardown error:", err);
    }

    // 2. Safely stop the Html5Qrcode instance
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          scannerRef.current
            .stop()
            .catch(() => {})
            .finally(() => {
              try {
                scannerRef.current?.clear();
              } catch {}
              scannerRef.current = null;
            });
        } else {
          try {
            scannerRef.current.clear();
          } catch {}
          scannerRef.current = null;
        }
      } catch {
        scannerRef.current = null;
      }
    }
    setIsTorchOn(false);
  };

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      setLastScanned(null);
      setCameraError(null);
      return;
    }

    let isMounted = true;
    setIsStarting(true);
    setCameraError(null);

    const startCamera = async () => {
      try {
        const elem = document.getElementById(regionId);
        if (!elem || !isMounted) return;

        const formatsToSupport = [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.QR_CODE,
        ];

        const html5QrCode = new Html5Qrcode(regionId, {
          formatsToSupport,
          verbose: false,
        });
        scannerRef.current = html5QrCode;

        const config = { fps: 15 };

        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            if (cooldownRef.current) return;
            cooldownRef.current = true;
            playScanBeep();
            setLastScanned(decodedText);
            onDetected(decodedText);

            if (!continuous) {
              stopScanner();
              onClose();
            } else {
              setTimeout(() => {
                cooldownRef.current = false;
                setLastScanned(null);
              }, 1500);
            }
          },
          () => {}
        );

        if (isMounted) {
          setIsStarting(false);
          try {
            const capabilities = html5QrCode.getRunningTrackCapabilities();
            if (capabilities && (capabilities as unknown as { torch?: boolean }).torch) {
              setHasTorch(true);
            }
          } catch {
            setHasTorch(false);
          }
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        setIsStarting(false);
        const errMsg = err instanceof Error ? err.message : String(err);
        console.warn("[BarcodeScannerModal] Camera error:", errMsg);
        setCameraError(
          "Kamera tidak dapat diakses atau izin ditolak. Anda dapat menggunakan input manual di bawah."
        );
      }
    };

    startCamera();

    return () => {
      isMounted = false;
      stopScanner();
    };
  }, [isOpen, continuous, isMobile]);

  const toggleTorch = async () => {
    if (!scannerRef.current || !hasTorch) return;
    try {
      const nextTorch = !isTorchOn;
      await scannerRef.current.applyVideoConstraints({
        advanced: [{ torch: nextTorch } as MediaTrackConstraintSet],
      });
      setIsTorchOn(nextTorch);
    } catch (err) {
      console.warn("Torch error:", err);
    }
  };

  return {
    regionId,
    isStarting,
    cameraError,
    lastScanned,
    hasTorch,
    isTorchOn,
    toggleTorch,
    stopScanner,
  };
}

