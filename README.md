# SERA NanoMind — Hybrid On-Device & Cloud Agentic Commerce OS

Built for the **#BuildHybridAI 2026** Firebase Hackathon.

**SERA NanoMind** is an offline-first agentic commerce operating system uniting a conversational AI command deck (**ChatView**) with a live **Marketplace**, **Mitra Store** (merchant management), **Mitra Kasir** (Point-of-Sale terminal with shifts, table management, and kitchen tickets), and **Mitra Kurir** (store courier dispatch & COD settlement).

Powered by **Firebase AI Logic Hybrid Inference (`firebase/ai`)** and protected by **Firebase App Check (`firebase/app-check`)**, SERA NanoMind prioritizes on-device inference via **Gemini Nano** for zero-cost, offline-capable store & cash drawer intelligence, and seamlessly falls back to **Gemini 3.5 Flash** in the cloud for deep reasoning or multimodal inputs.

---

## Key Architecture & Hybrid AI Highlights

1. **Firebase AI Logic Hybrid Inference (`src/services/firebaseHybridAi.ts`)**
   - Uses `getAI(app, { backend: new GoogleAIBackend() })` and `getGenerativeModel(ai, { mode: InferenceMode.PREFER_ON_DEVICE, inCloudParams: { model: "gemini-3.5-flash-lite" } })` in default **Flash / Hybrid** mode (with automatic failover to `gemini-3.5-flash`).
   - Switches to `InferenceMode.PREFER_IN_CLOUD` when the user toggles **High** mode for deeper cloud reasoning.
   - Displays live routing telemetry inside **CognitiveProcessCard** (`On-Device Gemini Nano` vs `Cloud Fallback (gemini-3.5-flash-lite / gemini-3.5-flash)`).

2. **Firebase App Check Protection**
   - Initializes `initializeAppCheck` with `ReCaptchaEnterpriseProvider` in production and supports `FIREBASE_APPCHECK_DEBUG_TOKEN` for local/hackathon demo environments.

3. **Human-in-the-Loop Commerce Proposals (`ProposalCard`)**
   - Conversational commands such as *"Add Iced Caramel Latte Rp 29.000 stock 30"*, *"Restock Arabica Beans to 25"*, or *"Create POS order table 4: 2 Es Kopi Susu via QRIS"* generate interactive approval cards (`CREATE_PRODUCT`, `UPDATE_STOCK`, `CREATE_POS_ORDER`, `SCHEDULE_GOAL`).
   - Clicking **Approve** mutates local state immediately across **Mitra Store**, **Mitra Kasir**, **Marketplace**, and **Active Intents**—even when completely offline.

4. **Encrypted Device Memory Vault (`src/storage/DeviceMemoryVault.ts`)**
   - Persists chat continuity locally using **IndexedDB** encrypted with a non-extractable **Web Crypto AES-GCM 256-bit** key.

5. **Offline-First Commerce Runtime (`src/services/demoCommerceSeed.ts` & `src/services/localMarketApiInterceptor.ts`)**
   - Pre-seeded with *Kopi NanoMind Roastery*, 8 coffee/pastry items, an open POS shift, 3 POS transactions, and active courier stops so every module works immediately out of the box.

---

## Quickstart

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Firebase (Optional `.env.local` or In-App UI)
Copy `.env.example` to `.env.local` and fill in your Firebase Web App credentials (with **AI Logic / Gemini Developer API** and **App Check** enabled in Firebase Console):

```bash
cp .env.example .env.local
```

Alternatively, you can paste your `firebaseConfig` directly inside the app under **Workspace → Storage Vault & Hybrid AI**.

### 3. Run Locally
```bash
npm run dev
```

### 4. Production Build
```bash
npm run build
```

---

## Enabling Gemini Nano On-Device in Chrome Desktop
1. Use Chrome Desktop **v139+** (or Chrome Canary/Dev).
2. Open `chrome://flags` and enable `#prompt-api-for-gemini-nano` (and `#prompt-api-for-gemini-nano-multimodal-input` if testing images).
3. Restart Chrome. SERA NanoMind will automatically route `InferenceMode.PREFER_ON_DEVICE` prompts locally on your device.

---

## License
MIT License — see [LICENSE](./LICENSE).
