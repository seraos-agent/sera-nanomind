import { useState, useEffect, useLayoutEffect, useRef, useCallback, lazy, Suspense } from "react";
import { ShoppingBag } from "lucide-react";
import { THEME, FONT_LINK_ID } from "./theme";
import { useBilling, INITIAL_BILLING } from "./hooks/useBilling";
import { useUserProfile } from "./hooks/useUserProfile";
import { clearProfileLocalCache } from "./utils/profileSync";
import { useSocket } from "./hooks/useSocket";
import { Sidebar } from "./components/sidebar/Sidebar";
import { ChatView } from "./components/chat/ChatView";
import { ConnectionsPage } from "./components/connections/ConnectionsPage";
import { AutomationsPage } from "./components/automations/AutomationsPage";
import { ProfilePage } from "./components/profile/ProfilePage";
import { DriverPage } from "./components/driver/DriverPage";
import type { SidebarView } from "./components/sidebar/Sidebar";
import { DEFAULT_COMMERCE_CONNECTORS, ensureDemoCommerceSeeded } from "./services/demoCommerceSeed";

const MerchantPage = lazy(() => import("./components/merchant/MerchantPage").then(m => ({ default: m.MerchantPage })));
const CashierPage = lazy(() => import("./components/cashier/CashierPage").then(m => ({ default: m.CashierPage })));
const MarketplacePage = lazy(() => import("./components/marketplace/MarketplacePage"));

import { AuthGateways } from "./components/app/AuthGateways";
import { useAppBackNavigation } from "./hooks/useAppBackNavigation";
import { isNativeMobile } from "./utils/platform";
import { syncSystemBars } from "./utils/systemBars";
import { useNotificationWatcher } from "./hooks/useNotificationWatcher";
import { HeadsUpNotificationBanner } from "./components/notifications/HeadsUpNotificationBanner";

function useFonts() {
  useEffect(() => {
    if (document.getElementById(FONT_LINK_ID)) return;
    const link = document.createElement("link");
    link.id = FONT_LINK_ID;
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap";
    document.head.appendChild(link);
  }, []);
}

function InnerApp() {
  useFonts();
  const [mode, setMode] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("sera_theme");
    if (saved === "light" || saved === "dark") {
      return saved;
    }
    if (typeof window !== 'undefined') {
      const twa = (window as any).Telegram?.WebApp;
      if (twa?.initData && twa?.colorScheme) {
        return twa.colorScheme === 'dark' ? 'dark' : 'light';
      }
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return "light";
  });

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--safe-area-top', '0px');
      document.documentElement.style.setProperty('--safe-area-bottom', '0px');
    }

    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem("sera_theme");
      const twa = (window as any).Telegram?.WebApp;
      if (!savedTheme && twa?.initData && twa?.colorScheme) {
        setMode(twa.colorScheme === 'dark' ? 'dark' : 'light');
      }
    }
  }, []);

  useLayoutEffect(() => {
    let raf1 = 0;
    let raf2 = 0;

    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.classList.add('theme-switching');
      root.setAttribute('data-theme', mode);
      root.style.colorScheme = mode;
      root.classList.toggle('dark', mode === 'dark');
      root.classList.toggle('dark-mode', mode === 'dark');
      const bg = mode === 'dark' ? '#000000' : '#F3F4F6';
      root.style.backgroundColor = bg;
      if (document.body) {
        document.body.style.backgroundColor = bg;
      }

      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          root.classList.remove('theme-switching');
        });
      });
    }

    try {
      localStorage.setItem("sera_theme", mode);
    } catch {}
    void syncSystemBars(mode === 'dark');

    return () => {
      if (raf1) cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, [mode]);

  const [isMobileView, setIsMobileView] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  const [sidebarOpen, setSidebarOpen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  );
  const isMobileViewRef = useRef(isMobileView);
  isMobileViewRef.current = isMobileView;
  const sidebarOpenRef = useRef(sidebarOpen);
  sidebarOpenRef.current = sidebarOpen;

  useEffect(() => {
    try {
      localStorage.removeItem("sera_view");
    } catch {}
  }, []);

  const [currentView, setCurrentView] = useState<SidebarView>(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (params.has('store') || params.has('item') || params.has('tab')) {
          return "marketplace";
        }
      }
      const saved = sessionStorage.getItem("sera_session_view") as SidebarView | null;
      return saved && ["chat", "connections", "automations", "profile", "threads_settings", "merchant", "driver", "cashier", "marketplace"].includes(saved) ? saved : "chat";
    } catch {
      return "chat";
    }
  });
  const currentViewRef = useRef<SidebarView>(currentView);
  currentViewRef.current = currentView;

  const clearMarketplaceUrlParams = () => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (url.searchParams.has('store') || url.searchParams.has('item') || url.searchParams.has('tab')) {
      url.searchParams.delete('store');
      url.searchParams.delete('item');
      url.searchParams.delete('tab');
      window.history.replaceState({}, '', url.pathname + url.search + url.hash);
    }
  };

  const navigateToView = useCallback((nextView: SidebarView) => {
    if (isMobileViewRef.current) {
      setSidebarOpen(false);
    }
    if (nextView !== 'marketplace') {
      clearMarketplaceUrlParams();
    }
    setCurrentView(nextView);
  }, []);

  const goBackView = useCallback(() => {
    clearMarketplaceUrlParams();
    setCurrentView('chat');
    setSidebarOpen(true);
    try {
      sessionStorage.setItem("sera_session_view", "chat");
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleOpenMarketplace = (e: Event) => {
      const detail = (e as CustomEvent<{ storeId?: string; itemId?: string }>).detail;
      const url = new URL(window.location.href);
      url.searchParams.delete('store');
      url.searchParams.delete('item');
      if (detail?.storeId) url.searchParams.set('store', detail.storeId);
      if (detail?.itemId) url.searchParams.set('item', detail.itemId);
      window.history.pushState({}, '', url.pathname + url.search + url.hash);
      navigateToView('marketplace');
    };
    window.addEventListener('sera:open-marketplace', handleOpenMarketplace);
    return () => window.removeEventListener('sera:open-marketplace', handleOpenMarketplace);
  }, [navigateToView]);

  useEffect(() => {
    try {
      sessionStorage.setItem("sera_session_view", currentView);
    } catch {}
  }, [currentView]);

  const [sessionToken, setSessionToken] = useState<string | null>(() => {
    ensureDemoCommerceSeeded();
    return typeof window !== 'undefined' ? localStorage.getItem('sera_session_token') : null;
  });
  const [userEmail, setUserEmail] = useState<string | null>(() =>
    typeof window !== 'undefined' ? localStorage.getItem('sera_user_email') : null
  );

  const { billingState, setBillingState } = useBilling();
  const isUserAuthenticated = Boolean(sessionToken && userEmail);

  const activeDeviceScope = userEmail ? `email:${userEmail}` : 'anonymous';
  const {
    socket, isAuthenticated, messages, setMessages, sendMessage, currentActivity,
    cancelChat, deleteDeviceMemory, googleDrive, connectGoogleDrive, disconnectGoogleDrive,
    threads, connectThreads, disconnectThreads, telegram, telegramLinkCode,
    generateTelegramLink, whatsapp, whatsappLinkData, generateWhatsAppLink,
    disconnectWhatsApp, governanceRecommendations, respondToGovernanceRecommendation
  } = useSocket(setBillingState, setMode, activeDeviceScope);

  const theme = THEME[mode];

  useNotificationWatcher({ socket, onNavigate: navigateToView });

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setIsMobileView(isMobile);
      if (!isMobile) setSidebarOpen(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Pre-warm Marketplace chunk and initial catalog once main app is idle
  useEffect(() => {
    const runPrewarm = () => {
      import("./components/marketplace/MarketplacePage").catch(() => {});
      import("./components/marketplace/hooks/useMarketplaceData")
        .then((mod) => mod.prewarmMarketplaceData())
        .catch(() => {});
    };

    const timer = window.setTimeout(() => {
      const ric = (window as any).requestIdleCallback;
      if (typeof ric === "function") {
        ric(runPrewarm, { timeout: 2500 });
      } else {
        runPrewarm();
      }
    }, 1200);

    return () => window.clearTimeout(timer);
  }, []);

  const handleSendMessage = (text: string, images?: string[], documents?: any[], modelTier?: 'flash' | 'high') => {
    sendMessage(text, images, documents, modelTier);
  };

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const lastAccountKeyRef = useRef<string | null>(null);
  const [isBypassed, setIsBypassed] = useState(() =>
    typeof window !== 'undefined' ? new URLSearchParams(window.location.search).has('bypass') : false
  );
  const { userProfile, updateProfile, deleteAccount, resetProfile } = useUserProfile({
    socket,
    sessionToken,
    userEmail,
    isBypassed,
  });
  const [isLaunchCodeVerified, setIsLaunchCodeVerified] = useState(() => {
    if (typeof window !== 'undefined') {
      if (isNativeMobile()) return true;
      return localStorage.getItem('sera_launch_verified') === 'true';
    }
    return false;
  });
  const [activeConnectors, setActiveConnectors] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('sera_active_connectors');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_COMMERCE_CONNECTORS;
  });

  // Initialize Telegram WebApp configuration
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const twa = (window as any).Telegram.WebApp;
      try {
        twa.ready?.();
        twa.expand?.();
        twa.disableVerticalSwipes?.();
        twa.enableClosingConfirmation?.();
      } catch (e) {
        console.warn('[Telegram WebApp] Initialization warning:', e);
      }
    }
  }, []);

  // Automatically emit dev login if bypass was passed via URL
  useEffect(() => {
    if (isBypassed && socket) {
      socket.emit("auth:login", {});
      if (typeof window !== 'undefined' && window.history.replaceState) {
        const url = new URL(window.location.href);
        url.searchParams.delete('bypass');
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, [isBypassed, socket]);

  const { exitToast } = useAppBackNavigation({
    isMobileView,
    sidebarOpen,
    setSidebarOpen,
    isMobileViewRef,
    sidebarOpenRef,
    currentViewRef,
    goBackView,
  });

  const sessionTokenRef = useRef(sessionToken);
  sessionTokenRef.current = sessionToken;
  const userEmailRef = useRef(userEmail);
  userEmailRef.current = userEmail;
  const isAuthenticatedRef = useRef(isAuthenticated);
  isAuthenticatedRef.current = isAuthenticated;

  useEffect(() => {
    const currentAccountKey = isBypassed ? 'dev-bypassed' : (userEmail ? `email:${userEmail}` : 'disconnected');
    const isExplicitAccountSwitch =
      lastAccountKeyRef.current !== null &&
      lastAccountKeyRef.current !== 'disconnected' &&
      currentAccountKey !== 'disconnected' &&
      lastAccountKeyRef.current !== currentAccountKey;

    if (isExplicitAccountSwitch) {
      clearProfileLocalCache();
      resetProfile();
      setMessages([]);
      setBillingState(INITIAL_BILLING);
      setCurrentView("chat");
    }
    lastAccountKeyRef.current = currentAccountKey;
  }, [isBypassed, userEmail, setMessages, setBillingState, resetProfile]);

  // Bind socket auth listeners once per socket instance
  useEffect(() => {
    if (!socket) return;

    const requestChallenge = async () => {
      const savedSessionToken = sessionTokenRef.current || (typeof window !== 'undefined' ? localStorage.getItem('sera_session_token') : null);
      const savedEmail = userEmailRef.current || (typeof window !== 'undefined' ? localStorage.getItem('sera_user_email') : null);
      if (savedSessionToken && savedEmail) {
        socket.emit("auth:login", {
          token: savedSessionToken,
          email: savedEmail,
          userId: `email:${savedEmail}`
        });
      }
    };

    const handleAuthSuccess = (data: { token?: string; email?: string; userId?: string }) => {
      if (data?.token) {
        const finalEmail = data?.email || userEmailRef.current || (typeof window !== 'undefined' ? localStorage.getItem('sera_saved_email') : '') || '';
        localStorage.setItem('sera_session_token', data.token);
        if (finalEmail) {
          localStorage.setItem('sera_user_email', finalEmail);
          localStorage.setItem('sera_saved_email', finalEmail);
          setUserEmail((prev) => (prev !== finalEmail ? finalEmail : prev));
        }
        setSessionToken((prev) => (prev !== data.token ? data.token : prev));
      }
      socket.emit("billing:fetch");
      socket.emit('connector:list');
    };

    const handleAuthError = (err: any) => {
      if (err?.code === 'INVALID_TOKEN' || err?.code === 'SESSION_EXPIRED') {
        console.warn('[App] Session token definitively invalid or expired:', err?.message);
        localStorage.removeItem('sera_session_token');
        setSessionToken(null);
      } else {
        console.warn('[App] Transient socket auth blip, retaining local session credentials:', err?.message);
      }
      setBillingState(prev => ({
        ...prev,
        error: err?.message || "Authentication failed."
      }));
    };

    const handleSubscriptionRequired = () => {
      socket.emit("billing:fetch");
    };

    socket.on("auth:challenge", requestChallenge);
    socket.on("auth:success", handleAuthSuccess);
    socket.on("auth:error", handleAuthError);
    socket.on("subscription:required", handleSubscriptionRequired);
    socket.on('connector:catalog', setActiveConnectors);
    socket.on('connector:status_changed', setActiveConnectors);
    socket.emit('connector:list');

    if (socket.connected && !isAuthenticatedRef.current) {
      const savedToken = sessionTokenRef.current || (typeof window !== 'undefined' ? localStorage.getItem('sera_session_token') : null);
      const savedEmail = userEmailRef.current || (typeof window !== 'undefined' ? localStorage.getItem('sera_user_email') : null);
      if (savedToken && savedEmail) {
        socket.emit("auth:challenge");
      }
    }

    return () => {
      socket.off("auth:challenge", requestChallenge);
      socket.off("auth:success", handleAuthSuccess);
      socket.off("auth:error", handleAuthError);
      socket.off("subscription:required", handleSubscriptionRequired);
      socket.off('connector:catalog', setActiveConnectors);
      socket.off('connector:status_changed', setActiveConnectors);
    };
  }, [socket, setBillingState]);

  if (!isMounted) return null;

  if (!isUserAuthenticated && !isBypassed) {
    return (
      <AuthGateways
        mode={mode}
        isLaunchCodeVerified={isLaunchCodeVerified}
        socket={socket}
        onVerifyLaunchCode={() => {
          localStorage.setItem('sera_launch_verified', 'true');
          setIsLaunchCodeVerified(true);
        }}
        onBypass={() => setIsBypassed(true)}
        onAuthenticated={({ token, userId, email: loggedInEmail }) => {
          localStorage.setItem('sera_session_token', token);
          localStorage.setItem('sera_user_email', loggedInEmail);
          localStorage.setItem('sera_saved_email', loggedInEmail);
          setSessionToken(token);
          setUserEmail(loggedInEmail);
          if (socket) {
            socket.emit("auth:login", { token, userId, email: loggedInEmail });
          }
        }}
      />
    );
  }

  const shellHeight = isMobileView ? "var(--tg-viewport-height, 100dvh)" : "100vh";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: isMobileView ? "100dvh" : "100vh", width: "100vw", backgroundColor: mode === "light" ? "#f3f4f6" : "#000", fontFamily: "Inter, sans-serif", overflow: "hidden" }}>
      <style>{`
          body { margin: 0; padding: 0; overflow: hidden; }
          @keyframes chatui-blink { 50% { opacity: 0; } }
          @keyframes chatui-pulse { 0% { transform: scale(1); opacity: 0.7; } 100% { transform: scale(2.6); opacity: 0; } }
          .chatui-textarea::placeholder { color: ${theme.inkFaint}; }
          .chatui-textarea { scrollbar-width: thin; }
        `}</style>

      <div
        className="chatui-shell"
        style={{
          width: "100%",
          maxWidth: "100%",
          height: shellHeight,
          background: theme.bg,
          borderRadius: 0,
          border: "none",
          overflow: "hidden",
          display: "flex",
          position: "relative",
        }}
      >
        <HeadsUpNotificationBanner theme={theme} isMobileView={isMobileView} />

        <Sidebar
          theme={theme}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          isMobileView={isMobileView}
          currentView={currentView}
          onNavigate={navigateToView}
          billingState={billingState}
          userEmail={userEmail}
          mode={mode}
          onToggleMode={() => setMode(prev => prev === 'light' ? 'dark' : 'light')}
          activeConnectors={activeConnectors}
          googleDrive={googleDrive}
          threads={threads}
          telegram={telegram}
          whatsapp={whatsapp}
        />

        {currentView === "profile" ? <ProfilePage
          theme={theme}
          billingState={billingState}
          userEmail={userEmail || undefined}
          userProfile={userProfile}
          onUpdateProfile={updateProfile}
          onDeleteAccount={deleteAccount}
          isMobileView={isMobileView}
          mode={mode}
          socket={socket}
          onModeChange={setMode}
          onBack={goBackView}
          onDisconnect={() => {
            clearProfileLocalCache();
            resetProfile();
            localStorage.removeItem('sera_session_token');
            localStorage.removeItem('sera_user_email');
            setSessionToken(null);
            setUserEmail(null);
            socket?.emit('auth:logout');
            setIsBypassed(false);
          }}
        /> : currentView === "connections" ? (
          <ConnectionsPage
            theme={theme}
            socket={socket}
            isMobileView={isMobileView}
            threads={threads}
            onConnectThreads={connectThreads}
            onDisconnectThreads={disconnectThreads}
            telegram={telegram}
            telegramLinkCode={telegramLinkCode}
            onGenerateTelegramLink={generateTelegramLink}
            whatsapp={whatsapp}
            whatsappLinkData={whatsappLinkData}
            onGenerateWhatsAppLink={generateWhatsAppLink}
            onDisconnectWhatsApp={disconnectWhatsApp}
            googleDrive={googleDrive}
            onConnectGoogleDrive={connectGoogleDrive}
            onDisconnectGoogleDrive={disconnectGoogleDrive}
            onBack={goBackView}
            onOpenFeature={(view) => navigateToView(view)}
          />
        ) : currentView === "automations" ? (
          <AutomationsPage theme={theme} socket={socket} isMobileView={isMobileView} onBack={goBackView} />
        ) : currentView === "merchant" ? (
          <Suspense fallback={<div style={{ flex: 1, background: theme.bg }} />}>
            <MerchantPage theme={theme} isMobileView={isMobileView} userEmail={userEmail} socket={socket} onBack={goBackView} />
          </Suspense>
        ) : currentView === "driver" ? (
          <DriverPage theme={theme} isMobileView={isMobileView} userEmail={userEmail} onBack={goBackView} />
        ) : currentView === "cashier" ? (
          <Suspense fallback={<div style={{ flex: 1, background: theme.bg }} />}>
            <CashierPage theme={theme} isMobileView={isMobileView} userEmail={userEmail} socket={socket} onBack={goBackView} />
          </Suspense>
        ) : currentView === "marketplace" ? (
          <Suspense fallback={
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: theme.bg, color: theme.inkSoft }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <ShoppingBag size={32} color={theme.accent} />
                <span style={{ fontSize: 13, fontWeight: 500, fontFamily: "Inter, sans-serif" }}>Memuat Marketplace...</span>
              </div>
            </div>
          }>
            <MarketplacePage
              theme={theme}
              isMobileView={isMobileView}
              userEmail={userEmail}
              onBack={goBackView}
              onNavigateToMerchant={() => navigateToView("merchant")}
              onNavigateToDriver={() => navigateToView("driver")}
              onNavigateToProfile={() => navigateToView("profile")}
            />
          </Suspense>
        ) : (
          <ChatView
            theme={theme}
            messages={messages}
            setMessages={setMessages}
            isMobileView={isMobileView}
            onOpenSidebar={() => setSidebarOpen(true)}
            onSend={handleSendMessage}
            socket={socket}
            currentActivity={currentActivity}
            onCancelChat={cancelChat}
            governanceRecommendations={governanceRecommendations}
            onRespondGovernance={respondToGovernanceRecommendation}
            onClearChat={deleteDeviceMemory}
          />
        )}

        {exitToast && (
          <div style={{
            position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(15, 23, 42, 0.92)', color: '#FFFFFF', padding: '8px 18px',
            borderRadius: 24, fontSize: 13, fontWeight: 600, zIndex: 10000,
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)', pointerEvents: 'none', fontFamily: 'Inter, sans-serif'
          }}>
            Tekan sekali lagi untuk keluar
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return <InnerApp />;
}
