import { useState, useEffect } from "react";
import { Cpu, ShieldCheck, CheckCircle2, HardDrive, Wifi, WifiOff, Save, Trash2, RefreshCw } from "lucide-react";
import type { ThemeType } from "../../../theme";
import {
  clearRuntimeFirebaseConfig,
  getHybridCapabilitiesStatus,
  getRuntimeFirebaseConfig,
  initializeNanoModelManually,
  probeNanoDiagnosticState,
  saveRuntimeFirebaseConfig,
  type HybridCapabilitiesStatus,
  type NanoDiagnosticState,
} from "../../../services/firebaseHybridAi";

interface StorageVaultViewProps {
  theme: ThemeType;
  isMobileView?: boolean;
  googleDrive?: { status: string; url?: string } | null;
  onConnectGoogleDrive?: () => void;
  onDisconnectGoogleDrive?: () => void;
}

export function StorageVaultView({
  theme,
  isMobileView,
}: StorageVaultViewProps) {
  const [status, setStatus] = useState<HybridCapabilitiesStatus>(() => getHybridCapabilitiesStatus("flash"));
  const [nanoDiag, setNanoDiag] = useState<NanoDiagnosticState | null>(null);
  const [swReady, setSwReady] = useState<boolean>(() =>
    Boolean(typeof navigator !== "undefined" && "serviceWorker" in navigator && navigator.serviceWorker.controller)
  );
  const [isInitializingNano, setIsInitializingNano] = useState(false);
  const [nanoProgress, setNanoProgress] = useState<number | null>(null);
  const existingCfg = getRuntimeFirebaseConfig();

  const [apiKey, setApiKey] = useState(existingCfg?.apiKey || "");
  const [projectId, setProjectId] = useState(existingCfg?.projectId || "");
  const [appId, setAppId] = useState(existingCfg?.appId || "");
  const [configJsonPaste, setConfigJsonPaste] = useState("");
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);

  const refreshDiagnostics = async () => {
    const diag = await probeNanoDiagnosticState();
    setNanoDiag(diag);
    setStatus(getHybridCapabilitiesStatus("flash", diag.availability));
  };

  useEffect(() => {
    void refreshDiagnostics();
    const updateSwState = () => {
      if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
        setSwReady(Boolean(navigator.serviceWorker.controller));
      }
    };
    const onNetworkChange = () => {
      void refreshDiagnostics();
    };
    updateSwState();
    window.addEventListener("online", onNetworkChange);
    window.addEventListener("offline", onNetworkChange);
    window.addEventListener("sera_sw_ready", updateSwState);

    const swContainer = typeof navigator !== "undefined" && "serviceWorker" in navigator ? navigator.serviceWorker : null;
    swContainer?.addEventListener("controllerchange", updateSwState);
    swContainer?.ready.then(updateSwState).catch(() => {});

    return () => {
      window.removeEventListener("online", onNetworkChange);
      window.removeEventListener("offline", onNetworkChange);
      window.removeEventListener("sera_sw_ready", updateSwState);
      swContainer?.removeEventListener("controllerchange", updateSwState);
    };
  }, []);

  const handleInitializeNano = async () => {
    setIsInitializingNano(true);
    setNanoProgress(null);
    try {
      const diag = await initializeNanoModelManually((pct) => {
        setNanoProgress(pct);
      });
      setNanoDiag(diag);
      setStatus(getHybridCapabilitiesStatus("flash", diag.availability));
    } finally {
      setIsInitializingNano(false);
    }
  };

  const handleSaveConfig = () => {
    if (configJsonPaste.trim()) {
      try {
        const cleaned = configJsonPaste
          .trim()
          .replace(/^[^{]*/, "")
          .replace(/;$/, "")
          .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
          .replace(/'/g, '"');
        const parsed = JSON.parse(cleaned);
        if (parsed.apiKey && parsed.projectId) {
          saveRuntimeFirebaseConfig({
            apiKey: parsed.apiKey,
            projectId: parsed.projectId,
            authDomain: parsed.authDomain,
            storageBucket: parsed.storageBucket,
            messagingSenderId: parsed.messagingSenderId,
            appId: parsed.appId,
            appCheckDebugToken: "true",
          });
          setApiKey(parsed.apiKey);
          setProjectId(parsed.projectId);
          setAppId(parsed.appId || "");
          setConfigJsonPaste("");
          void refreshDiagnostics();
          setSavedFeedback("Firebase configuration saved & Hybrid AI initialized.");
          setTimeout(() => setSavedFeedback(null), 3500);
          return;
        }
      } catch {
        setSavedFeedback("Could not parse Firebase config snippet. Enter API Key & Project ID below.");
        setTimeout(() => setSavedFeedback(null), 3500);
        return;
      }
    }

    if (!apiKey.trim() || !projectId.trim()) {
      setSavedFeedback("Please enter both Firebase API Key and Project ID.");
      setTimeout(() => setSavedFeedback(null), 3000);
      return;
    }

    saveRuntimeFirebaseConfig({
      apiKey: apiKey.trim(),
      projectId: projectId.trim(),
      appId: appId.trim() || undefined,
      appCheckDebugToken: "true",
    });
    void refreshDiagnostics();
    setSavedFeedback("Firebase AI Logic & App Check debug token active.");
    setTimeout(() => setSavedFeedback(null), 3500);
  };

  const handleClearConfig = () => {
    clearRuntimeFirebaseConfig();
    setApiKey("");
    setProjectId("");
    setAppId("");
    void refreshDiagnostics();
    setSavedFeedback("Cleared runtime Firebase config (on-device Nano mode only).");
    setTimeout(() => setSavedFeedback(null), 3000);
  };

  const nanoAvailability = nanoDiag?.availability || status.nanoAvailability;
  const nanoReady = nanoAvailability === "available";

  return (
    <div style={{ animation: "walletPageIn 300ms ease forwards" }}>
      <div style={{ fontFamily: "Fraunces, serif", fontSize: isMobileView ? 24 : 32, fontWeight: 500, color: theme.ink, marginBottom: 8, letterSpacing: -0.5 }}>
        Storage Vault & Hybrid AI
      </div>
      <div style={{ fontSize: 14, color: theme.inkSoft, marginBottom: isMobileView ? 24 : 36 }}>
        Local AES-GCM encrypted browser storage and Firebase AI Logic Hybrid Inference configuration.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobileView ? "repeat(1, 1fr)" : "repeat(auto-fill, minmax(320px, 1fr))", gap: isMobileView ? 12 : 20 }}>
        {/* Card 1: Encrypted Device Memory Vault */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: isMobileView ? "18px 14px" : "22px 18px", borderRadius: 18, border: `1px solid ${theme.border}`, background: theme.surface2 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ width: 42, height: 42, borderRadius: 14, background: theme.surface, border: `1px solid ${theme.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <HardDrive size={20} color={theme.ink} />
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 999, border: `1px solid ${theme.border}`, background: theme.statusSoft, color: theme.status, display: "flex", alignItems: "center", gap: 4 }}>
              <CheckCircle2 size={12} /> AES-GCM 256-BIT
            </span>
          </div>
          <div>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: isMobileView ? 15 : 17, fontWeight: 600, color: theme.ink, marginBottom: 4 }}>
              Device Memory Vault
            </div>
            <div style={{ fontSize: 13, color: theme.inkSoft, lineHeight: 1.5 }}>
              Non-extractable Web Crypto AES-GCM key inside IndexedDB keeps chat continuity, POS ledger state, and store memory strictly on-device.
            </div>
          </div>
          <div style={{ marginTop: "auto", paddingTop: 10, borderTop: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", gap: 6, fontSize: 12, color: theme.inkSoft }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>Storage Engine</span>
              <span style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 600, color: theme.ink }}>IndexedDB · Local-Only</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>Offline App Cache</span>
              <span style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 600, color: swReady ? "#10b981" : theme.inkSoft }}>
                {swReady ? "Active (Offline Ready)" : "Standby (Dev / Loading)"}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Firebase AI Logic Hybrid Engine & App Check */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: isMobileView ? "18px 14px" : "22px 18px", borderRadius: 18, border: `1px solid ${theme.border}`, background: theme.surface2 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ width: 42, height: 42, borderRadius: 14, background: theme.surface, border: `1px solid ${theme.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Cpu size={20} color={theme.accent} />
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 999, border: `1px solid ${theme.border}`, background: nanoReady || (status.isOnline && status.firebaseConfigured) ? theme.statusSoft : theme.surface, color: nanoReady || (status.isOnline && status.firebaseConfigured) ? theme.status : !status.isOnline ? "#f59e0b" : theme.inkSoft, display: "flex", alignItems: "center", gap: 4 }}>
              {status.isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
              {nanoReady ? "GEMINI NANO READY" : !status.isOnline ? "OFFLINE · NANO NEEDED" : status.firebaseConfigured ? "CLOUD FALLBACK READY" : "SETUP REQUIRED"}
            </span>
          </div>

          <div>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: isMobileView ? 15 : 17, fontWeight: 600, color: theme.ink, marginBottom: 4 }}>
              Firebase AI Logic Hybrid Engine
            </div>
            <div style={{ fontSize: 13, color: theme.inkSoft, lineHeight: 1.5 }}>
              Runs on-device <strong>Gemini Nano</strong> via <code style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11 }}>{status.activeInferenceMode}</code> and falls back to <strong>Gemini 3.5 Flash</strong> in the cloud.
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: 12, borderRadius: 12, background: theme.surface, border: `1px solid ${theme.border}`, fontSize: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: theme.inkSoft }}>Network Status</span>
              <span style={{ fontWeight: 600, color: status.isOnline ? "#10b981" : "#f59e0b" }}>
                {status.isOnline ? "Online" : "Offline"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: theme.inkSoft }}>Chrome Gemini Nano</span>
              <span style={{ fontWeight: 600, color: nanoReady ? "#10b981" : nanoAvailability === "downloadable" || nanoAvailability === "downloading" ? "#f59e0b" : "#ef4444" }}>
                {nanoAvailability.toUpperCase()}
              </span>
            </div>
            {nanoDiag?.detailMessage && (
              <div style={{ fontSize: 11, color: theme.inkSoft, lineHeight: 1.4 }}>
                {nanoDiag.detailMessage}
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
              <span style={{ color: theme.inkSoft }}>Firebase App Check</span>
              <span style={{ fontWeight: 600, color: status.appCheckActive ? "#10b981" : theme.inkSoft, display: "flex", alignItems: "center", gap: 4 }}>
                <ShieldCheck size={12} /> {status.appCheckActive ? "Protected" : "Pending Config"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: theme.inkSoft }}>Project ID</span>
              <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: theme.ink }}>
                {status.projectId || "Not Configured"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleInitializeNano}
            disabled={isInitializingNano}
            style={{
              width: "100%",
              padding: "9px 12px",
              borderRadius: 10,
              border: `1px solid ${theme.border}`,
              background: theme.surface,
              color: theme.ink,
              fontSize: 12.5,
              fontWeight: 600,
              cursor: isInitializingNano ? "default" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <RefreshCw size={14} className={isInitializingNano ? "animate-spin" : undefined} />
            {isInitializingNano
              ? (nanoProgress !== null ? `Initializing Gemini Nano (${nanoProgress}%)...` : "Checking / Initializing Gemini Nano...")
              : "Check / Initialize Gemini Nano On-Device"}
          </button>

          {/* Runtime Firebase Config Form */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
            <textarea
              value={configJsonPaste}
              onChange={(e) => setConfigJsonPaste(e.target.value)}
              placeholder="Paste firebaseConfig snippet here (optional) or fill fields below..."
              rows={2}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "8px 10px",
                borderRadius: 10,
                border: `1px solid ${theme.border}`,
                background: theme.surface,
                color: theme.ink,
                fontSize: 12,
                fontFamily: "JetBrains Mono, monospace",
                resize: "vertical",
              }}
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="VITE_FIREBASE_API_KEY"
                style={{
                  padding: "8px 10px",
                  borderRadius: 10,
                  border: `1px solid ${theme.border}`,
                  background: theme.surface,
                  color: theme.ink,
                  fontSize: 12,
                }}
              />
              <input
                type="text"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                placeholder="VITE_FIREBASE_PROJECT_ID"
                style={{
                  padding: "8px 10px",
                  borderRadius: 10,
                  border: `1px solid ${theme.border}`,
                  background: theme.surface,
                  color: theme.ink,
                  fontSize: 12,
                }}
              />
            </div>

            {savedFeedback && (
              <div style={{ fontSize: 12, color: theme.status, fontWeight: 500 }}>
                {savedFeedback}
              </div>
            )}

            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button
                type="button"
                onClick={handleSaveConfig}
                style={{
                  flex: 1,
                  padding: "9px 12px",
                  borderRadius: 10,
                  border: "none",
                  background: theme.ink,
                  color: theme.bg,
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <Save size={14} /> Save & Initialize
              </button>
              {status.firebaseConfigured && (
                <button
                  type="button"
                  onClick={handleClearConfig}
                  style={{
                    padding: "9px 12px",
                    borderRadius: 10,
                    border: `1px solid ${theme.border}`,
                    background: "transparent",
                    color: "#ef4444",
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  <Trash2 size={14} /> Reset
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
