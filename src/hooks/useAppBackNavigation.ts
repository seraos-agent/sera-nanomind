import { useState, useEffect, useRef } from "react";
import type { MutableRefObject } from "react";
import type { SidebarView } from "../components/sidebar/Sidebar";
import { dispatchBackButton, registerBackHandler } from "../utils/backButton";

interface UseAppBackNavigationParams {
  isMobileView: boolean;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isMobileViewRef: MutableRefObject<boolean>;
  sidebarOpenRef: MutableRefObject<boolean>;
  currentViewRef: MutableRefObject<SidebarView>;
  goBackView: () => void;
}

export function useAppBackNavigation({
  isMobileView,
  sidebarOpen,
  setSidebarOpen,
  isMobileViewRef,
  sidebarOpenRef,
  currentViewRef,
  goBackView,
}: UseAppBackNavigationParams) {
  const lastBackPressRef = useRef<number>(0);
  const [exitToast, setExitToast] = useState(false);

  // Unified LIFO Back Stack: Register mobile sidebar drawer
  useEffect(() => {
    if (isMobileView && sidebarOpen) {
      return registerBackHandler('mobile_sidebar', 95, () => {
        setSidebarOpen(false);
        return true;
      });
    }
  }, [isMobileView, sidebarOpen, setSidebarOpen]);

  // Native Android Hardware Back Button Handling
  useEffect(() => {
    let removeListener: (() => void) | null = null;
    import('@capacitor/app')
      .then(({ App: CapApp }) => {
        CapApp.addListener('backButton', () => {
          if (dispatchBackButton()) {
            return;
          }

          if (isMobileViewRef.current && sidebarOpenRef.current) {
            setSidebarOpen(false);
            return;
          }

          if (currentViewRef.current !== 'chat') {
            goBackView();
            return;
          }

          const now = Date.now();
          if (now - lastBackPressRef.current < 2000) {
            CapApp.minimizeApp();
          } else {
            lastBackPressRef.current = now;
            setExitToast(true);
            setTimeout(() => setExitToast(false), 2000);
          }
        }).then(listener => {
          removeListener = () => listener.remove();
        });
      })
      .catch(() => {});

    return () => {
      if (removeListener) removeListener();
    };
  }, [goBackView, isMobileViewRef, sidebarOpenRef, currentViewRef, setSidebarOpen]);

  return { exitToast };
}
