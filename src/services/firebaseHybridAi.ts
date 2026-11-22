import { Capacitor, registerPlugin } from '@capacitor/core';
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
  type AppCheck,
} from 'firebase/app-check';
import {
  getAI,
  getGenerativeModel,
  GoogleAIBackend,
  InferenceMode,
  InferenceSource,
  type Part,
} from 'firebase/ai';
import {
  DEMO_CASHIER_PROFILE,
  DEMO_STORE,
  DEMO_STORE_ID,
} from './demoCommerceSeed';

interface NanoAICoreStatusResult {
  aicoreInstalled: boolean;
  sdkInt: number;
  deviceModel: string;
  detail: string;
}

interface NanoAICoreGenerateResult {
  available: boolean;
  text?: string;
  error?: string;
}

interface NanoAICorePluginInterface {
  checkStatus(): Promise<NanoAICoreStatusResult>;
  generatePrompt(options: { prompt: string }): Promise<NanoAICoreGenerateResult>;
}

const NanoAICore = registerPlugin<NanoAICorePluginInterface>('NanoAICore');

export interface FirebaseRuntimeConfig {
  apiKey: string;
  authDomain?: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  recaptchaSiteKey?: string;
  appCheckDebugToken?: string;
}

export type NanoModelAvailability =
  | 'available'
  | 'downloadable'
  | 'downloading'
  | 'unavailable'
  | 'api_missing';

export interface NanoDiagnosticState {
  hasLanguageModelGlobal: boolean;
  hasLegacyAiGlobal: boolean;
  availability: NanoModelAvailability;
  firebaseCloudConfigured: boolean;
  appCheckActive: boolean;
  isOnline: boolean;
  detailMessage: string;
}

export interface HybridCapabilitiesStatus {
  firebaseConfigured: boolean;
  appCheckActive: boolean;
  chromePromptApiAvailable: boolean;
  nanoAvailability: NanoModelAvailability;
  isOnline: boolean;
  activeInferenceMode: 'PREFER_ON_DEVICE' | 'ONLY_ON_DEVICE' | 'PREFER_IN_CLOUD';
  projectId?: string;
}

export interface CognitiveActivityPayload {
  phase: 'THINKING' | 'WORKING' | 'COMPLETED';
  subText?: string;
  cognitiveSteps?: Array<{
    title: string;
    detail?: string;
    status?: 'completed' | 'active';
  }>;
  startTime?: number;
}

export interface HybridTurnInput {
  text: string;
  images?: string[];
  documents?: Array<{ name?: string; filename?: string; content?: string; text?: string }>;
  modelTier?: 'flash' | 'high';
  history?: Array<{ role: string; content?: string }>;
  onActivity?: (activity: CognitiveActivityPayload) => void;
}

export interface HybridProposalData {
  proposalId: string;
  intent: string;
  parameters: Record<string, any>;
}

export interface HybridTurnResult {
  content: string;
  proposal?: HybridProposalData;
  cognitiveSteps: Array<{
    title: string;
    detail?: string;
    status?: 'completed' | 'active';
  }>;
  durationSeconds: number;
  hadTools: boolean;
  executionEngine:
    | 'FIREBASE_ON_DEVICE'
    | 'FIREBASE_CLOUD'
    | 'CHROME_NANO_DIRECT'
    | 'UNAVAILABLE_DIAGNOSTIC';
}

const RUNTIME_CONFIG_STORAGE_KEY = 'sera_firebase_config';
const LOCAL_ON_DEVICE_APP_NAME = 'nanomind-local-on-device';

let cachedCloudApp: FirebaseApp | null = null;
let cachedAppCheck: AppCheck | null = null;
let cachedConfigKey = '';

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function getRuntimeFirebaseConfig(): FirebaseRuntimeConfig | null {
  const envApiKey = import.meta.env.VITE_FIREBASE_API_KEY?.trim();
  const envProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim();

  if (envApiKey && envProjectId) {
    return {
      apiKey: envApiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim() || `${envProjectId}.firebaseapp.com`,
      projectId: envProjectId,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim() || `${envProjectId}.firebasestorage.app`,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim(),
      appId: import.meta.env.VITE_FIREBASE_APP_ID?.trim() || '1:000000000000:web:nanomind',
      recaptchaSiteKey: import.meta.env.VITE_FIREBASE_RECAPTCHA_SITE_KEY?.trim(),
      appCheckDebugToken: import.meta.env.VITE_FIREBASE_APPCHECK_DEBUG_TOKEN?.trim() || 'true',
    };
  }

  if (typeof window !== 'undefined') {
    const saved = readJson<Partial<FirebaseRuntimeConfig> | null>(RUNTIME_CONFIG_STORAGE_KEY, null);
    if (saved?.apiKey && saved?.projectId) {
      return {
        apiKey: saved.apiKey.trim(),
        authDomain: saved.authDomain?.trim() || `${saved.projectId.trim()}.firebaseapp.com`,
        projectId: saved.projectId.trim(),
        storageBucket: saved.storageBucket?.trim() || `${saved.projectId.trim()}.firebasestorage.app`,
        messagingSenderId: saved.messagingSenderId?.trim(),
        appId: saved.appId?.trim() || '1:000000000000:web:nanomind',
        recaptchaSiteKey: saved.recaptchaSiteKey?.trim(),
        appCheckDebugToken: saved.appCheckDebugToken?.trim() || 'true',
      };
    }
  }

  return null;
}

export function saveRuntimeFirebaseConfig(config: FirebaseRuntimeConfig): void {
  writeJson(RUNTIME_CONFIG_STORAGE_KEY, config);
  cachedCloudApp = null;
  cachedAppCheck = null;
  cachedConfigKey = '';
}

export function clearRuntimeFirebaseConfig(): void {
  try {
    localStorage.removeItem(RUNTIME_CONFIG_STORAGE_KEY);
  } catch {}
  cachedCloudApp = null;
  cachedAppCheck = null;
  cachedConfigKey = '';
}

function ensureCloudFirebaseInitialized(): { app: FirebaseApp | null; appCheckActive: boolean } {
  const cfg = getRuntimeFirebaseConfig();
  if (!cfg) return { app: null, appCheckActive: false };

  const signature = `${cfg.apiKey}:${cfg.projectId}:${cfg.appId || ''}`;
  if (cachedCloudApp && cachedConfigKey === signature) {
    return { app: cachedCloudApp, appCheckActive: Boolean(cachedAppCheck || (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN) };
  }

  try {
    const existing = getApps().find((a) => a.name === '[DEFAULT]' || a.options.projectId === cfg.projectId);
    const app =
      existing ||
      initializeApp({
        apiKey: cfg.apiKey,
        authDomain: cfg.authDomain,
        projectId: cfg.projectId,
        storageBucket: cfg.storageBucket,
        messagingSenderId: cfg.messagingSenderId,
        appId: cfg.appId || '1:000000000000:web:nanomind',
      });

    cachedCloudApp = app;
    cachedConfigKey = signature;

    if (typeof window !== 'undefined' && !cachedAppCheck && cfg.recaptchaSiteKey) {
      const debugSetting = cfg.appCheckDebugToken;
      if (debugSetting === 'true') {
        (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
      } else if (debugSetting) {
        (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = debugSetting;
      }

      try {
        cachedAppCheck = initializeAppCheck(app, {
          provider: new ReCaptchaEnterpriseProvider(cfg.recaptchaSiteKey),
          isTokenAutoRefreshEnabled: true,
        });
      } catch (err) {
        console.warn('[FirebaseAppCheck] Initialization warning:', err);
      }
    }

    return { app, appCheckActive: Boolean(cachedAppCheck) };
  } catch (err) {
    console.warn('[FirebaseHybridAI] Cloud app initialization failed:', err);
    return { app: null, appCheckActive: false };
  }
}

/**
 * Ensures a local-only FirebaseApp exists so `@firebase/ai` (`ChromeAdapterImpl`)
 * can execute `InferenceMode.ONLY_ON_DEVICE` against Chrome Gemini Nano
 * even before cloud Firebase credentials are configured.
 */
function ensureLocalOnDeviceFirebaseApp(): FirebaseApp {
  const existing = getApps().find((a) => a.name === LOCAL_ON_DEVICE_APP_NAME);
  if (existing) return existing;

  return initializeApp(
    {
      apiKey: 'local-on-device-nano-only',
      projectId: 'sera-nanomind-local',
      appId: '1:000000000000:web:localnanomind',
    },
    LOCAL_ON_DEVICE_APP_NAME
  );
}

export function hasChromeBuiltInPromptApi(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean((self as any).LanguageModel || (window as any).ai?.languageModel);
}

export async function probeNanoDiagnosticState(): Promise<NanoDiagnosticState> {
  const cfg = getRuntimeFirebaseConfig();
  const { appCheckActive } = ensureCloudFirebaseInitialized();
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  const hasLanguageModelGlobal = typeof window !== 'undefined' && Boolean((self as any).LanguageModel);
  const hasLegacyAiGlobal = typeof window !== 'undefined' && Boolean((window as any).ai?.languageModel);

  let availability: NanoModelAvailability = 'api_missing';
  let detailMessage =
    'Chrome Built-in Prompt API (window.LanguageModel) is not exposed in this browser session.';

  if (hasLanguageModelGlobal) {
    try {
      const lm = (self as any).LanguageModel;
      const status =
        typeof lm.availability === 'function'
          ? await lm.availability({
              expectedInputs: [{ type: 'text', languages: ['en'] }],
              expectedOutputs: [{ type: 'text', languages: ['en'] }],
            })
          : 'available';

      if (status === 'available' || status === 'readily') {
        availability = 'available';
        detailMessage = 'Gemini Nano weights are downloaded and ready for 100% on-device inference.';
      } else if (status === 'downloadable' || status === 'after-download') {
        availability = 'downloadable';
        detailMessage = 'Gemini Nano is supported and downloadable. Click Initialize to download weights.';
      } else if (status === 'downloading') {
        availability = 'downloading';
        detailMessage = 'Gemini Nano weights are currently downloading in Chrome.';
      } else {
        availability = 'unavailable';
        detailMessage = `Chrome reported LanguageModel.availability() = "${status}". Check Chrome flags or GPU/disk requirements.`;
      }
    } catch (err: any) {
      availability = 'unavailable';
      detailMessage = `LanguageModel.availability() threw: ${err?.message || String(err)}`;
    }
  } else if (hasLegacyAiGlobal) {
    try {
      const legacy = (window as any).ai.languageModel;
      const caps = typeof legacy.capabilities === 'function' ? await legacy.capabilities() : null;
      const raw = caps?.available || 'readily';
      if (raw === 'readily' || raw === 'available') {
        availability = 'available';
        detailMessage = 'Legacy window.ai.languageModel is ready on-device.';
      } else if (raw === 'after-download' || raw === 'downloadable') {
        availability = 'downloadable';
        detailMessage = 'Legacy window.ai.languageModel is downloadable.';
      } else {
        availability = 'unavailable';
        detailMessage = `window.ai.languageModel status: ${raw}`;
      }
    } catch (err: any) {
      availability = 'unavailable';
      detailMessage = `window.ai.languageModel check failed: ${err?.message || String(err)}`;
    }
  } else if (Capacitor.isNativePlatform()) {
    try {
      const st = await NanoAICore.checkStatus();
      availability = st.aicoreInstalled ? 'available' : 'unavailable';
      detailMessage = st.detail || `Android ${st.deviceModel} (API ${st.sdkInt})`;
    } catch (err: any) {
      availability = 'unavailable';
      detailMessage = `Android AICore check failed: ${err?.message || String(err)}`;
    }
  }

  return {
    hasLanguageModelGlobal,
    hasLegacyAiGlobal,
    availability,
    firebaseCloudConfigured: Boolean(cfg),
    appCheckActive: Boolean(cfg && appCheckActive),
    isOnline,
    detailMessage,
  };
}

export async function initializeNanoModelManually(
  onProgress?: (percent: number) => void
): Promise<NanoDiagnosticState> {
  if (typeof window !== 'undefined' && (self as any).LanguageModel) {
    try {
      const localApp = ensureLocalOnDeviceFirebaseApp();
      const ai = getAI(localApp, { backend: new GoogleAIBackend() });
      const model = getGenerativeModel(ai, {
        mode: InferenceMode.ONLY_ON_DEVICE,
        onDeviceParams: {
          createOptions: {
            expectedInputs: [{ type: 'text', languages: ['en'] }],
            expectedOutputs: [{ type: 'text', languages: ['en'] }],
          },
        },
      });
      await model.initializeDeviceModel((progressValue) => {
        onProgress?.(Math.round(progressValue * 100));
      });
    } catch (err) {
      console.warn('[FirebaseHybridAI] initializeDeviceModel notice:', err);
    }
  }
  return probeNanoDiagnosticState();
}

export function getHybridCapabilitiesStatus(
  modelTier: 'flash' | 'high' = 'flash',
  nanoAvailability: NanoModelAvailability = hasChromeBuiltInPromptApi() ? 'available' : 'api_missing'
): HybridCapabilitiesStatus {
  const cfg = getRuntimeFirebaseConfig();
  const { appCheckActive } = ensureCloudFirebaseInitialized();
  return {
    firebaseConfigured: Boolean(cfg),
    appCheckActive: Boolean(cfg && appCheckActive),
    chromePromptApiAvailable: hasChromeBuiltInPromptApi(),
    nanoAvailability,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    activeInferenceMode: cfg
      ? modelTier === 'high'
        ? 'PREFER_IN_CLOUD'
        : 'PREFER_ON_DEVICE'
      : 'ONLY_ON_DEVICE',
    projectId: cfg?.projectId,
  };
}

function buildCommerceContextSnapshot() {
  const store = readJson<any>('sera_merchant_store', DEMO_STORE);
  const products = readJson<any[]>('sera_merchant_products', []);
  const merchantOrders = readJson<any[]>('sera_merchant_orders', []);
  const shift = readJson<any>('sera_cashier_active_shift', null);
  const posTxs = readJson<any[]>('sera_nanomind_pos_transactions', []);
  const driver = readJson<any>('sera_driver_profile', null);
  const triggers = readJson<any[]>('sera_nanomind_triggers', []);

  const lowStockProducts = products.filter((p) => Number(p.stock ?? 99) <= 5);
  const activeShiftTxs = shift
    ? posTxs.filter((t) => !t.shiftId || t.shiftId === shift.id).filter((t) => t.status !== 'VOIDED')
    : posTxs.filter((t) => t.status !== 'VOIDED');

  const posTotalSales = activeShiftTxs.reduce((acc, t) => acc + Number(t.totalAmount || 0), 0);
  const posCashSales = activeShiftTxs
    .filter((t) => t.paymentMethod === 'CASH')
    .reduce((acc, t) => acc + Number(t.totalAmount || 0), 0);
  const posQrisSales = activeShiftTxs
    .filter((t) => t.paymentMethod !== 'CASH')
    .reduce((acc, t) => acc + Number(t.totalAmount || 0), 0);

  const pendingOrders = merchantOrders.filter((o) => o.status === 'PENDING' || o.status === 'PROCESSING');
  const shippedOrders = merchantOrders.filter((o) => o.status === 'SHIPPED');

  return {
    store: {
      id: store.id,
      name: store.name,
      city: store.city,
      isOpen: store.isOpen,
      type: store.type,
    },
    products: products.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      stock: p.stock,
    })),
    lowStockProducts: lowStockProducts.map((p) => ({ id: p.id, name: p.name, stock: p.stock })),
    posShift: shift
      ? {
          id: shift.id,
          cashierName: shift.cashierName,
          status: shift.status,
          openingCash: shift.openingCash,
          cashOut: shift.cashOut || 0,
          transactionCount: activeShiftTxs.length,
          totalSales: posTotalSales,
          cashSales: posCashSales,
          nonCashSales: posQrisSales,
          expectedCashInDrawer:
            Number(shift.openingCash || 0) + posCashSales + Number(shift.cashIn || 0) - Number(shift.cashOut || 0),
        }
      : null,
    orders: {
      total: merchantOrders.length,
      pendingOrProcessing: pendingOrders.map((o) => ({
        id: o.id,
        customerName: o.customerName,
        totalAmount: o.totalAmount,
        status: o.status,
      })),
      shippedWithCourier: shippedOrders.map((o) => ({
        id: o.id,
        customerName: o.customerName,
        paymentMethod: o.paymentMethod,
        totalAmount: o.totalAmount,
        shippingAddress: o.shippingAddress,
      })),
    },
    courier: driver
      ? {
          name: driver.name,
          isOnline: driver.isOnline,
          plateNumber: driver.plateNumber,
          activeStopsCount: shippedOrders.length,
          codToCollect: shippedOrders
            .filter((o) => o.paymentMethod === 'COD')
            .reduce((acc, o) => acc + Number(o.totalAmount || 0), 0),
        }
      : null,
    activeTriggersCount: triggers.filter((t) => t.state === 'ACTIVE').length,
  };
}

function buildCompactSystemInstruction(snapshot: ReturnType<typeof buildCommerceContextSnapshot>): string {
  const productLines = snapshot.products
    .map((p) => `- ${p.name} [${p.id}]: Rp ${Number(p.price).toLocaleString('id-ID')}, stock=${p.stock}, cat=${p.category}`)
    .join('\n');

  const shiftSummary = snapshot.posShift
    ? `POS Shift (${snapshot.posShift.status}): cashier=${snapshot.posShift.cashierName}, txs=${snapshot.posShift.transactionCount}, totalSales=Rp ${snapshot.posShift.totalSales.toLocaleString('id-ID')}, cashSales=Rp ${snapshot.posShift.cashSales.toLocaleString('id-ID')}, nonCash=Rp ${snapshot.posShift.nonCashSales.toLocaleString('id-ID')}, openingCash=Rp ${snapshot.posShift.openingCash.toLocaleString('id-ID')}, cashOut=Rp ${snapshot.posShift.cashOut.toLocaleString('id-ID')}, expectedDrawerCash=Rp ${snapshot.posShift.expectedCashInDrawer.toLocaleString('id-ID')}`
    : 'POS Shift: closed';

  const courierSummary = snapshot.courier
    ? `Courier: ${snapshot.courier.name} (${snapshot.courier.plateNumber}, online=${snapshot.courier.isOnline}), activeStops=${snapshot.courier.activeStopsCount}, COD=Rp ${snapshot.courier.codToCollect.toLocaleString('id-ID')}`
    : 'Courier: unlinked';

  return [
    'You are SERA NanoMind, an offline-first hybrid AI commerce assistant.',
    'Reply naturally in the same language as the user (Indonesian or English), concisely and grounded strictly in the live local store data below.',
    `Store: ${snapshot.store.name} (${snapshot.store.city}, open=${snapshot.store.isOpen})`,
    'Catalog:',
    productLines,
    shiftSummary,
    courierSummary,
    `Orders: ${snapshot.orders.pendingOrProcessing.length} pending/processing, ${snapshot.orders.shippedWithCourier.length} out for delivery.`,
    '',
    'If the user explicitly asks to add a product, update stock/price, record a POS order, or create an automation, append ONE JSON tag at the very end wrapped in <<<PROPOSAL and PROPOSAL>>>:',
    'CREATE_PRODUCT: <<<PROPOSAL {"intent":"CREATE_PRODUCT","parameters":{"productName":"string","price":25000,"stock":20,"category":"Signature Coffee"}} PROPOSAL>>>',
    'UPDATE_STOCK: <<<PROPOSAL {"intent":"UPDATE_STOCK","parameters":{"productId":"id","productName":"name","newStock":25}} PROPOSAL>>>',
    'CREATE_POS_ORDER: <<<PROPOSAL {"intent":"CREATE_POS_ORDER","parameters":{"tableOrQueueNumber":"Meja 4","paymentMethod":"QRIS","itemsSummary":"2x Es Kopi Susu","items":[{"name":"Es Kopi Susu Gula Aren","quantity":2,"price":22000}],"totalAmount":44000}} PROPOSAL>>>',
    'SCHEDULE_GOAL: <<<PROPOSAL {"intent":"SCHEDULE_GOAL","parameters":{"goalName":"string","cronExpression":"0 21 * * *","description":"string"}} PROPOSAL>>>',
  ].join('\n');
}

function extractProposalFromText(rawText: string): { cleanText: string; proposal?: HybridProposalData } {
  const match = rawText.match(/<<<PROPOSAL\s*([\s\S]*?)\s*PROPOSAL>>>/i);
  if (!match) {
    return { cleanText: rawText.trim() };
  }

  const cleanText = rawText.replace(match[0], '').trim();
  try {
    const parsed = JSON.parse(match[1].trim());
    if (parsed && typeof parsed.intent === 'string') {
      return {
        cleanText,
        proposal: {
          proposalId: `prop-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          intent: parsed.intent,
          parameters: parsed.parameters || {},
        },
      };
    }
  } catch (err) {
    console.warn('[FirebaseHybridAI] Failed to parse proposal JSON:', err);
  }
  return { cleanText };
}

function formatIdr(amount: number): string {
  return `Rp ${Number(amount || 0).toLocaleString('id-ID')}`;
}

async function tryChromeDirectPromptApi(
  userPrompt: string,
  systemPrompt: string,
  onDownloadProgress?: (pct: number) => void
): Promise<{ text: string | null; error?: string }> {
  if (typeof window === 'undefined') {
    return { text: null, error: 'Window unavailable' };
  }

  const combinedPrompt = `${systemPrompt}\n\n---\nUser request: ${userPrompt}`;

  // Path A: Standard W3C / Chrome 138+ `self.LanguageModel`
  if ((self as any).LanguageModel) {
    try {
      const lm = (self as any).LanguageModel;
      const createOpts: Record<string, any> = {
        expectedInputs: [{ type: 'text', languages: ['en'] }],
        expectedOutputs: [{ type: 'text', languages: ['en'] }],
        monitor(m: any) {
          m?.addEventListener?.('downloadprogress', (e: any) => {
            if (typeof e?.loaded === 'number') {
              onDownloadProgress?.(Math.round(e.loaded * 100));
            }
          });
        },
      };
      const session = await lm.create(createOpts);
      let answer: string;
      try {
        // Newer Chrome Prompt API accepts plain string or message array
        answer = await session.prompt(combinedPrompt);
      } catch {
        answer = await session.prompt([
          { role: 'user', content: [{ type: 'text', value: combinedPrompt }] },
        ]);
      }
      session.destroy?.();
      if (typeof answer === 'string' && answer.trim()) {
        return { text: answer.trim() };
      }
    } catch (err: any) {
      console.warn('[ChromeNanoDirect] LanguageModel failed:', err);
      return { text: null, error: err?.message || String(err) };
    }
  }

  // Path B: Legacy Chrome 131-137 `window.ai.languageModel`
  if ((window as any).ai?.languageModel) {
    try {
      const session = await (window as any).ai.languageModel.create({ systemPrompt });
      const answer = await session.prompt(userPrompt);
      session.destroy?.();
      if (typeof answer === 'string' && answer.trim()) {
        return { text: answer.trim() };
      }
    } catch (err: any) {
      console.warn('[ChromeNanoDirect] window.ai.languageModel failed:', err);
      return { text: null, error: err?.message || String(err) };
    }
  }

  return { text: null, error: 'Chrome Built-in Prompt API is not exposed in this browser.' };
}

function buildDiagnosticFailureMessage(
  diag: NanoDiagnosticState,
  lastError?: string
): string {
  return [
    '### Gemini Nano & Cloud Fallback Not Yet Active in This Browser',
    '',
    'SERA NanoMind **never uses mock responses**, so this diagnostic appears because neither live inference engine is ready yet:',
    `* **Chrome Gemini Nano Status:** \`${diag.availability}\` (${diag.detailMessage})`,
    `* **Firebase Cloud Fallback Status:** ${diag.firebaseCloudConfigured ? 'Configured' : 'Not configured'}`,
    lastError ? `* **Runtime Error Detail:** \`${lastError}\`` : null,
    '',
    '**How to enable local Gemini Nano in Google Chrome Desktop:**',
    '1. Open `chrome://flags/#optimization-guide-on-device-model` and select **Enabled BypassPerfRequirement**.',
    '2. Open `chrome://flags/#prompt-api-for-gemini-nano` and select **Enabled**.',
    '3. Click **Relaunch** to restart Chrome.',
    '4. Open `chrome://components`, find **Optimization Guide On Device Model**, and click **Check for update** until downloaded.',
    '5. Return here, open **Workspace -> Storage Vault & Hybrid AI**, and click **Check / Initialize Gemini Nano**.',
    '',
    '*Optional:* Paste your `firebaseConfig` under **Workspace -> Storage Vault & Hybrid AI** so `PREFER_ON_DEVICE` can also fall back to **Gemini 3.5 Flash (Cloud)** when local Gemini Nano is unavailable.',
  ]
    .filter(Boolean)
    .join('\n');
}

export async function runHybridCommerceTurn(input: HybridTurnInput): Promise<HybridTurnResult> {
  const startTime = Date.now();
  const modelTier = input.modelTier || 'flash';
  const snapshot = buildCommerceContextSnapshot();
  const systemInstruction = buildCompactSystemInstruction(snapshot);
  const diag = await probeNanoDiagnosticState();
  const hasImages = Array.isArray(input.images) && input.images.length > 0;

  const docContext =
    input.documents && input.documents.length > 0
      ? '\n\nATTACHED DOCUMENTS:\n' +
        input.documents
          .map((d) => `File: ${d.name || d.filename}\n${(d.content || d.text || '').slice(0, 3000)}`)
          .join('\n---\n')
      : '';

  const historyContext =
    Array.isArray(input.history) && input.history.length > 0
      ? input.history
          .slice(-4)
          .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${String(m.content || '').slice(0, 240)}`)
          .join('\n')
      : '';

  const fullUserPrompt = `${historyContext ? `Recent chat:\n${historyContext}\n\n` : ''}${input.text}${docContext}`.trim();

  // For on-device ChromeAdapterImpl (which does not forward request.systemInstruction to session.prompt),
  // embed compact store context directly inside the prompt sent to generateContent.
  const promptWithEmbeddedContext = `${systemInstruction}\n\nUser: ${fullUserPrompt}`;

  input.onActivity?.({
    phase: 'THINKING',
    subText:
      modelTier === 'high'
        ? 'Checking Cloud Reasoning route (Firebase AI Logic)...'
        : `Checking On-Device Gemini Nano (${diag.availability})...`,
    startTime,
    cognitiveSteps: [
      {
        title: 'Hybrid Capability Probe',
        detail: `Chrome Gemini Nano: ${diag.availability} · Cloud Firebase: ${diag.firebaseCloudConfigured ? 'Configured' : 'Not configured'} · Network: ${diag.isOnline ? 'Online' : 'Offline'}`,
        status: 'active',
      },
    ],
  });

  let lastSdkError = '';

  // 0. Android Native AICore On-Device Bridge (Capacitor Android)
  if (
    Capacitor.isNativePlatform() &&
    modelTier !== 'high' &&
    !hasImages &&
    diag.availability === 'available'
  ) {
    input.onActivity?.({
      phase: 'WORKING',
      subText: 'Executing On-Device Gemini Nano via Android AICore...',
      startTime,
      cognitiveSteps: [
        {
          title: 'Hybrid Router: Android AICore Native Bridge',
          detail: `Device: ${diag.detailMessage}`,
          status: 'active',
        },
      ],
    });

    try {
      const aicoreRes = await NanoAICore.generatePrompt({ prompt: promptWithEmbeddedContext });
      if (aicoreRes?.available && aicoreRes.text?.trim()) {
        const { cleanText, proposal } = extractProposalFromText(aicoreRes.text);
        const durationSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));
        return {
          content: cleanText,
          proposal,
          durationSeconds,
          hadTools: true,
          executionEngine: 'FIREBASE_ON_DEVICE',
          cognitiveSteps: [
            {
              title: 'Executed On-Device via Android AICore (Gemini Nano)',
              detail: `Native AICore · $0 cloud cost · 100% offline-capable (${durationSeconds}s)`,
              status: 'completed',
            },
            {
              title: 'Live Commerce State Grounded',
              detail: `${snapshot.store.name}: ${snapshot.products.length} products · ${snapshot.posShift?.transactionCount || 0} POS txs`,
              status: 'completed',
            },
          ],
        };
      }
      if (aicoreRes?.error) {
        lastSdkError = aicoreRes.error;
        console.warn('[AndroidAICore] Falling back to Firebase Cloud:', aicoreRes.error);
      }
    } catch (err: any) {
      lastSdkError = err?.message || String(err);
      console.warn('[AndroidAICore] Bridge error, falling back to Firebase Cloud:', err);
    }
  }

  // 1. Official Firebase AI Logic SDK Path (`firebase/ai`)
  // Uses user's Firebase app (PREFER_ON_DEVICE / PREFER_IN_CLOUD) when configured,
  // OR local-only FirebaseApp (ONLY_ON_DEVICE) when `self.LanguageModel` exists on Chrome.
  const CLOUD_MODELS = ['gemini-3.5-flash-lite', 'gemini-3.5-flash'] as const;
  const { app: cloudApp, appCheckActive } = ensureCloudFirebaseInitialized();
  const canUseOnDevice =
    diag.hasLanguageModelGlobal &&
    (diag.availability === 'available' ||
      diag.availability === 'downloadable' ||
      diag.availability === 'downloading');
  const canRunFirebaseOnDeviceOnly = !cloudApp && canUseOnDevice && modelTier !== 'high';
  const activeApp = cloudApp || (canRunFirebaseOnDeviceOnly ? ensureLocalOnDeviceFirebaseApp() : null);

  if (activeApp) {
    const chosenMode = !cloudApp
      ? InferenceMode.ONLY_ON_DEVICE
      : modelTier === 'high'
        ? InferenceMode.PREFER_IN_CLOUD
        : InferenceMode.PREFER_ON_DEVICE;

    const ai = getAI(activeApp, { backend: new GoogleAIBackend() });
    const expectedInputs: Array<{ type: 'text' | 'image'; languages?: string[] }> = hasImages
      ? [{ type: 'text', languages: ['en'] }, { type: 'image' }]
      : [{ type: 'text', languages: ['en'] }];

    const modelCandidates =
      chosenMode === InferenceMode.ONLY_ON_DEVICE ? [CLOUD_MODELS[0]] : CLOUD_MODELS;

    for (let idx = 0; idx < modelCandidates.length; idx++) {
      const activeCloudModel = modelCandidates[idx];
      try {
        const model = getGenerativeModel(ai, {
          mode: chosenMode,
          inCloudParams: {
            model: activeCloudModel,
            systemInstruction,
          },
          onDeviceParams: {
            createOptions: {
              expectedInputs,
              expectedOutputs: [{ type: 'text', languages: ['en'] }],
            },
          },
        });

        if (idx === 0 && chosenMode !== InferenceMode.PREFER_IN_CLOUD && canUseOnDevice) {
          input.onActivity?.({
            phase: 'WORKING',
            subText:
              diag.availability === 'downloadable' || diag.availability === 'downloading'
                ? 'Initializing / downloading on-device Gemini Nano...'
                : 'Executing on-device Gemini Nano via Firebase AI Logic...',
            startTime,
            cognitiveSteps: [
              {
                title: 'Hybrid Router: Firebase AI Logic SDK',
                detail: `Mode: ${chosenMode} · Chrome Nano: ${diag.availability}`,
                status: 'completed',
              },
              {
                title: 'Preparing On-Device Gemini Nano Session',
                detail: `${snapshot.store.name} (${snapshot.products.length} products, ${snapshot.posShift?.transactionCount || 0} POS txs)`,
                status: 'active',
              },
            ],
          });

          await model.initializeDeviceModel((progress) => {
            const pct = Math.round(progress * 100);
            input.onActivity?.({
              phase: 'WORKING',
              subText: `Downloading Gemini Nano on-device (${pct}%)...`,
              startTime,
              cognitiveSteps: [
                {
                  title: 'Downloading On-Device Gemini Nano Weights',
                  detail: `${pct}% complete`,
                  status: 'active',
                },
              ],
            });
          });
        } else {
          input.onActivity?.({
            phase: 'WORKING',
            subText:
              idx === 0
                ? `Executing ${activeCloudModel} via Firebase AI Logic...`
                : `Failover to ${activeCloudModel} via Firebase AI Logic...`,
            startTime,
            cognitiveSteps: [
              {
                title: 'Hybrid Router: Firebase AI Logic Cloud',
                detail: `Model: ${activeCloudModel} · Mode: ${chosenMode} · App Check: ${appCheckActive ? 'Verified' : 'Standby'}`,
                status: 'active',
              },
            ],
          });
        }

        const parts: Array<string | Part> = [
          chosenMode !== InferenceMode.PREFER_IN_CLOUD && canUseOnDevice
            ? promptWithEmbeddedContext
            : fullUserPrompt,
        ];
        if (hasImages && input.images) {
          for (const img of input.images) {
            const match = img.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
            if (match) {
              parts.push({
                inlineData: {
                  mimeType: match[1],
                  data: match[2],
                },
              });
            }
          }
        }

        const result = await model.generateContent(parts);
        const rawReply = result.response.text();
        const { cleanText, proposal } = extractProposalFromText(rawReply);

        const responseSource = result.response.inferenceSource;
        const usedOnDevice = responseSource === InferenceSource.ON_DEVICE;
        const durationSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));

        return {
          content: cleanText,
          proposal,
          durationSeconds,
          hadTools: true,
          executionEngine: usedOnDevice ? 'FIREBASE_ON_DEVICE' : 'FIREBASE_CLOUD',
          cognitiveSteps: [
            {
              title: usedOnDevice
                ? 'Executed On-Device via Gemini Nano (Firebase AI Logic)'
                : `Executed via Cloud Fallback (${activeCloudModel})`,
              detail: usedOnDevice
                ? `InferenceSource: on_device · $0 cloud cost · 100% local privacy (${durationSeconds}s)`
                : `InferenceSource: in_cloud · App Check ${appCheckActive ? 'verified' : 'active'} (${durationSeconds}s)`,
              status: 'completed',
            },
            {
              title: 'Live Commerce State Grounded',
              detail: `${snapshot.store.name}: ${snapshot.products.length} products · ${snapshot.posShift?.transactionCount || 0} POS txs`,
              status: 'completed',
            },
          ],
        };
      } catch (err: any) {
        lastSdkError = err?.message || String(err);
        console.warn(`[FirebaseHybridAI] Model ${activeCloudModel} failed:`, err);
      }
    }
  }

  // 2. Direct Chrome Prompt API fallback (handles legacy `window.ai.languageModel` or string-prompt Chrome builds)
  if (!hasImages && (diag.hasLanguageModelGlobal || diag.hasLegacyAiGlobal)) {
    input.onActivity?.({
      phase: 'WORKING',
      subText: 'Running Chrome Built-in Gemini Nano directly...',
      startTime,
      cognitiveSteps: [
        {
          title: 'Direct On-Device Chrome Gemini Nano',
          detail: `Prompt API (${diag.availability}) · Offline-capable`,
          status: 'active',
        },
      ],
    });

    const direct = await tryChromeDirectPromptApi(fullUserPrompt, systemInstruction, (pct) => {
      input.onActivity?.({
        phase: 'WORKING',
        subText: `Downloading Gemini Nano (${pct}%)...`,
        startTime,
      });
    });

    if (direct.text) {
      const { cleanText, proposal } = extractProposalFromText(direct.text);
      const durationSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));
      return {
        content: cleanText,
        proposal,
        durationSeconds,
        hadTools: true,
        executionEngine: 'CHROME_NANO_DIRECT',
        cognitiveSteps: [
          {
            title: 'Executed On-Device via Chrome Gemini Nano',
            detail: `Real local Prompt API inference · $0 cost · Offline-ready (${durationSeconds}s)`,
            status: 'completed',
          },
          {
            title: 'Live Commerce State Grounded',
            detail: `${snapshot.store.name}: ${snapshot.products.length} products · ${snapshot.posShift?.transactionCount || 0} POS txs`,
            status: 'completed',
          },
        ],
      };
    }

    if (direct.error) {
      lastSdkError = lastSdkError ? `${lastSdkError} | ${direct.error}` : direct.error;
    }
  }

  // 3. No silent mock answers: report exact browser/Firebase diagnostics transparently
  const freshDiag = await probeNanoDiagnosticState();
  const durationSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));

  return {
    content: buildDiagnosticFailureMessage(freshDiag, lastSdkError || undefined),
    durationSeconds,
    hadTools: false,
    executionEngine: 'UNAVAILABLE_DIAGNOSTIC',
    cognitiveSteps: [
      {
        title: 'On-Device Gemini Nano & Cloud Fallback Unavailable',
        detail: `Chrome availability: ${freshDiag.availability} · Cloud configured: ${freshDiag.firebaseCloudConfigured}`,
        status: 'completed',
      },
    ],
  };
}

export function executeCommerceProposal(
  proposal: HybridProposalData,
  action: 'APPROVE' | 'REJECT'
): string {
  if (action === 'REJECT') {
    return `Proposal **${proposal.intent.replace(/_/g, ' ')}** rejected. No changes were made to local store data.`;
  }

  const p = proposal.parameters || {};

  if (proposal.intent === 'CREATE_PRODUCT') {
    const products = readJson<any[]>('sera_merchant_products', []);
    const newProduct = {
      id: `nm-prod-${Date.now()}`,
      storeId: DEMO_STORE_ID,
      name: p.productName || 'New NanoMind Product',
      description: p.description || 'Added via SERA NanoMind Hybrid Assistant.',
      type: 'GOODS',
      category: p.category || 'Signature Coffee',
      price: Number(p.price || 25000),
      currency: 'IDR',
      stock: Number(p.stock ?? 20),
      rating: 5.0,
      images: ['https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600'],
      badge: 'New',
      location: 'Malang',
    };
    const nextProducts = [newProduct, ...products];
    writeJson('sera_merchant_products', nextProducts);
    writeJson('sera_cashier_products', nextProducts);
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('sera_merchant_products_updated'));
    return `Successfully added **${newProduct.name}** (${formatIdr(newProduct.price)}, stock **${newProduct.stock}**) to **Merchant Store**, **POS Cashier**, and **Marketplace**.`;
  }

  if (proposal.intent === 'UPDATE_STOCK') {
    const products = readJson<any[]>('sera_merchant_products', []);
    let updatedName = p.productName || 'Product';
    const nextProducts = products.map((item) => {
      const matches =
        (p.productId && item.id === p.productId) ||
        (p.productName && item.name.toLowerCase() === String(p.productName).toLowerCase());
      if (matches) {
        updatedName = item.name;
        return {
          ...item,
          stock: p.newStock !== undefined ? Number(p.newStock) : item.stock,
          price: p.newPrice !== undefined ? Number(p.newPrice) : item.price,
        };
      }
      return item;
    });
    writeJson('sera_merchant_products', nextProducts);
    writeJson('sera_cashier_products', nextProducts);
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('sera_merchant_products_updated'));
    const updatedParts: string[] = [];
    if (p.newStock !== undefined) updatedParts.push(`stock to **${p.newStock}** units`);
    if (p.newPrice !== undefined) updatedParts.push(`price to **${formatIdr(Number(p.newPrice))}**`);
    const summary = updatedParts.length > 0 ? updatedParts.join(' and ') : 'details';
    return `Updated **${updatedName}** ${summary} across all local channels.`;
  }

  if (proposal.intent === 'CREATE_POS_ORDER') {
    const posTxs = readJson<any[]>('sera_nanomind_pos_transactions', []);
    const shift = readJson<any>('sera_cashier_active_shift', null);
    const items = Array.isArray(p.items) ? p.items : [];
    const totalAmount =
      Number(p.totalAmount) ||
      items.reduce((acc: number, it: any) => acc + Number(it.price || 0) * Number(it.quantity || 1), 0);

    const newTx = {
      id: `POS-NM-${Date.now().toString().slice(-4)}`,
      storeId: DEMO_STORE_ID,
      receiptNumber: `POS-NM-${Date.now().toString().slice(-6)}`,
      shiftId: shift?.id || 'shift-nanomind-1',
      cashierId: DEMO_CASHIER_PROFILE.id,
      cashierName: DEMO_CASHIER_PROFILE.name,
      tableOrQueueNumber: p.tableOrQueueNumber || 'Takeaway',
      customerName: p.customerName || 'POS Customer',
      paymentMethod: p.paymentMethod || 'CASH',
      subtotal: totalAmount,
      discountAmount: 0,
      taxAmount: 0,
      serviceChargeAmount: 0,
      totalAmount,
      amountPaid: totalAmount,
      changeAmount: 0,
      status: 'COMPLETED',
      createdAt: Date.now(),
      items: items.map((it: any, idx: number) => ({
        itemId: `pos-item-${idx}`,
        name: it.name,
        price: Number(it.price || 0),
        quantity: Number(it.quantity || 1),
        subtotal: Number(it.price || 0) * Number(it.quantity || 1),
      })),
    };

    writeJson('sera_nanomind_pos_transactions', [newTx, ...posTxs]);

    if (shift && newTx.paymentMethod === 'CASH') {
      writeJson('sera_cashier_active_shift', {
        ...shift,
        cashIn: Number(shift.cashIn || 0) + totalAmount,
      });
    }

    window.dispatchEvent(new Event('storage'));
    return `POS transaction **${newTx.receiptNumber}** (${newTx.tableOrQueueNumber} · ${formatIdr(totalAmount)} · ${newTx.paymentMethod}) recorded in **POS Cashier** shift.`;
  }

  if (proposal.intent === 'SCHEDULE_GOAL') {
    const triggers = readJson<any[]>('sera_nanomind_triggers', []);
    const goalName = p.goalName || 'Local Hybrid Store Automation';
    const newTrigger = {
      id: `trig-${Date.now()}`,
      goalName,
      cronExpression: p.cronExpression || '0 21 * * *',
      triggerType: 'RECURRING',
      state: 'ACTIVE',
      firePolicy: 'REPEAT',
      action: { type: goalName.toUpperCase().replace(/[^A-Z0-9]+/g, '_') },
      condition: {
        humanIntent: p.description || 'Executed on-device via SERA NanoMind.',
        internalCompiled: p.cronExpression || '0 21 * * *',
      },
      createdAt: Date.now(),
      nextRunAt: 'Scheduled locally',
      description: p.description || 'Executed on-device via SERA NanoMind.',
    };
    writeJson('sera_nanomind_triggers', [newTrigger, ...triggers]);
    window.dispatchEvent(new Event('storage'));
    return `New automation **${newTrigger.goalName}** is now active in **Active Intents**.`;
  }

  if (proposal.intent === 'ACTIVATE_AUTONOMY_AGREEMENT') {
    const agreements = readJson<any[]>('sera_nanomind_agreements', []);
    const now = Date.now();
    const newAgr = {
      id: `agr-${now}`,
      title: p.title || 'Hybrid Store Autonomy Agreement',
      intent: p.scope || 'Manage local commerce operations.',
      mode: p.mode === 'FULL_ACCESS' ? 'FULL_ACCESS' : 'ASSISTANT',
      scope: p.scope || 'Manage local commerce operations.',
      status: 'ACTIVE',
      lastActionSummary: 'Activated via ProposalCard approval.',
      nextActionSummary: 'Monitoring local commerce state.',
      createdAt: now,
      updatedAt: now,
    };
    writeJson('sera_nanomind_agreements', [newAgr, ...agreements]);
    window.dispatchEvent(new Event('storage'));
    return `Operating Agreement **${newAgr.title}** is now active in **Active Intents**.`;
  }

  return `Proposal **${proposal.intent}** approved.`;
}
