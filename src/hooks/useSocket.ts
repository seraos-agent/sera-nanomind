import { useEffect, useState, useCallback, useRef } from "react";
import type { BillingState } from "./useBilling";
import type { MemoryVaultDescriptor } from "../types/MemoryVault";
import { deviceMemoryVault, deviceVaultDescriptor, type DeviceVaultDescriptor } from "../storage/DeviceMemoryVault";
import { reconcileMessages, sortMessagesChronologically } from "../utils/messageOrder";
import { LocalNanoMindSocket } from "../services/localSocket";
import {
  DEFAULT_COMMERCE_CONNECTORS,
  DEMO_AGREEMENTS,
  DEMO_TRIGGERS,
} from "../services/demoCommerceSeed";
import {
  executeCommerceProposal,
  runHybridCommerceTurn,
  type HybridProposalData,
} from "../services/firebaseHybridAi";

export interface GoogleDriveConnectionState {
  provider: "GOOGLE_DRIVE";
  status: "CONNECTED" | "NOT_CONNECTED" | "UNAVAILABLE";
  vaultFolderId?: string;
  connectedAt?: string;
}

export interface ThreadsConnectionState {
  provider: "THREADS";
  status: "CONNECTED" | "NOT_CONNECTED" | "UNAVAILABLE";
  username?: string;
  name?: string;
  profilePictureUrl?: string;
  threadsUserId?: string;
  connectedAt?: string;
}

export interface TelegramConnectionState {
  provider: "TELEGRAM";
  status: "CONNECTED" | "NOT_CONNECTED" | "UNAVAILABLE";
}

export interface WhatsAppConnectionState {
  provider: "WHATSAPP";
  status: "CONNECTED" | "NOT_CONNECTED" | "UNAVAILABLE";
  phoneNumber?: string;
}

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

export function useSocket(
  setBillingState: React.Dispatch<React.SetStateAction<BillingState>>,
  setMode: (mode: "light" | "dark") => void,
  deviceScope: string = "anonymous"
) {
  const [socket, setSocket] = useState<LocalNanoMindSocket | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [currentActivity, setCurrentActivity] = useState<any | null>(null);
  const [memoryVault] = useState<MemoryVaultDescriptor | null>({
    status: "ACTIVE",
    label: "Encrypted AES-GCM Browser Vault",
    detail: "Local IndexedDB memory vault active with Firebase AI Logic Hybrid Inference.",
  } as any);
  const [deviceVault, setDeviceVault] = useState<DeviceVaultDescriptor>(() => deviceVaultDescriptor("CHECKING"));
  const [googleDrive] = useState<GoogleDriveConnectionState>({ provider: "GOOGLE_DRIVE", status: "UNAVAILABLE" });
  const [threads] = useState<ThreadsConnectionState>({ provider: "THREADS", status: "UNAVAILABLE" });
  const [telegram] = useState<TelegramConnectionState>({ provider: "TELEGRAM", status: "UNAVAILABLE" });
  const [whatsapp] = useState<WhatsAppConnectionState>({ provider: "WHATSAPP", status: "UNAVAILABLE" });
  const [governanceRecommendations, setGovernanceRecommendations] = useState<any[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const deviceVaultWriteQueue = useRef(Promise.resolve());
  const skipNextDeviceVaultWrite = useRef(false);
  const isCancelledRef = useRef(false);
  const proposalRegistryRef = useRef<Map<string, HybridProposalData>>(new Map());
  const messagesRef = useRef<any[]>([]);
  messagesRef.current = messages;

  const localChatKey = `chat-history:${deviceScope}`;

  useEffect(() => {
    let active = true;
    setDeviceVault(deviceVaultDescriptor("CHECKING"));
    void deviceMemoryVault
      .get<any[]>(localChatKey)
      .then((history) => {
        if (!active) return;
        setMessages((previous) => reconcileMessages(previous || [], history || []));
        setDeviceVault(deviceVaultDescriptor("ACTIVE"));
      })
      .catch(() => {
        if (active) setDeviceVault(deviceVaultDescriptor("UNAVAILABLE"));
      });
    return () => {
      active = false;
    };
  }, [localChatKey]);

  useEffect(() => {
    if (deviceVault.status !== "ACTIVE") return;
    if (skipNextDeviceVaultWrite.current) {
      skipNextDeviceVaultWrite.current = false;
      return;
    }
    const durableMessages = messages.filter((message) => message.type !== "activity" && !message.streaming);
    deviceVaultWriteQueue.current = deviceVaultWriteQueue.current
      .catch(() => undefined)
      .then(() => deviceMemoryVault.set(localChatKey, durableMessages))
      .catch(() => setDeviceVault(deviceVaultDescriptor("UNAVAILABLE")));
  }, [messages, localChatKey, deviceVault.status]);

  const streamReply = useCallback(
    (
      fullText: string,
      id: number,
      actionLinks?: any[],
      cognitiveSteps?: any[],
      durationSeconds?: number,
      hadTools?: boolean,
      images?: string[]
    ) => {
      setCurrentActivity(null);
      const replyTimestamp = typeof id === "number" && id > 1e11 ? id : Date.now();
      setMessages((prev) =>
        sortMessagesChronologically([
          ...prev,
          {
            id,
            createdAt: replyTimestamp,
            timestamp: replyTimestamp,
            role: "agent",
            content: fullText,
            images,
            streaming: false,
            actionLinks,
            cognitiveSteps,
            durationSeconds,
            hadTools,
          },
        ])
      );
    },
    []
  );

  const cancelChat = useCallback(() => {
    isCancelledRef.current = true;
    setCurrentActivity(null);
  }, []);

  const deleteDeviceMemory = useCallback(() => {
    skipNextDeviceVaultWrite.current = true;
    setMessages([]);
    deviceVaultWriteQueue.current = deviceVaultWriteQueue.current
      .catch(() => undefined)
      .then(() => deviceMemoryVault.delete(localChatKey))
      .catch(() => setDeviceVault(deviceVaultDescriptor("UNAVAILABLE")));
  }, [localChatKey]);

  const respondToGovernanceRecommendation = useCallback(
    (recommendationId: string, _decision: "APPROVED" | "REJECTED" | "MODIFIED") => {
      setGovernanceRecommendations((prev) => prev.filter((r) => r.id !== recommendationId));
    },
    []
  );

  const executeChatTurn = useCallback(
    async (text: string, images?: string[], documents?: any[], modelTier?: "flash" | "high") => {
      isCancelledRef.current = false;
      const now = Date.now();

      setCurrentActivity({
        phase: "THINKING",
        subText:
          modelTier === "high"
            ? "Routing via Cloud Reasoning (Firebase AI Logic)"
            : "Routing via Hybrid On-Device First (Gemini Nano)",
        cognitiveSteps: [],
        startTime: now,
      });

      const result = await runHybridCommerceTurn({
        text,
        images,
        documents,
        modelTier: modelTier || "flash",
        history: messagesRef.current.slice(-8),
        onActivity: (act) => {
          if (!isCancelledRef.current) {
            setCurrentActivity(act);
          }
        },
      });

      if (isCancelledRef.current) return;

      setCurrentActivity(null);

      if (result.content) {
        streamReply(
          result.content,
          Date.now(),
          undefined,
          result.cognitiveSteps,
          result.durationSeconds,
          result.hadTools
        );
      }

      if (result.proposal) {
        proposalRegistryRef.current.set(result.proposal.proposalId, result.proposal);
        const proposalTime = Date.now() + 5;
        setMessages((prev) =>
          sortMessagesChronologically([
            ...prev,
            {
              id: proposalTime,
              createdAt: proposalTime,
              timestamp: proposalTime,
              role: "agent",
              proposal: result.proposal,
            },
          ])
        );
      }
    },
    [streamReply]
  );

  useEffect(() => {
    const localSocket = new LocalNanoMindSocket();
    setSocket(localSocket);
    setIsAuthenticated(true);

    setBillingState((prev) => ({
      ...prev,
      tier: "HYBRID",
      isPayAsYouGoUnlocked: true,
      isEceranUnlocked: true,
    }));

    const emitConnectors = () => {
      const connectors = readJson("sera_active_connectors", DEFAULT_COMMERCE_CONNECTORS);
      localSocket.dispatchIncoming("connector:catalog", connectors);
      localSocket.dispatchIncoming("connector:status_changed", connectors);
    };

    const emitAutomations = () => {
      const triggers = readJson("sera_nanomind_triggers", DEMO_TRIGGERS);
      const agreements = readJson("sera_nanomind_agreements", DEMO_AGREEMENTS);
      localSocket.dispatchIncoming("automations:update", triggers);
      localSocket.dispatchIncoming("autonomy-agreements:update", agreements);
    };

    localSocket.setOutboundHandler((event: string, payload?: any) => {
      if (event === "auth:login" || event === "auth:challenge") {
        localSocket.dispatchIncoming("auth:success", {
          token: localStorage.getItem("sera_session_token") || "nanomind-local-session",
          email: localStorage.getItem("sera_user_email") || "founder@seraos.xyz",
        });
        return;
      }

      if (event === "billing:fetch") {
        localSocket.dispatchIncoming("billing:update", {
          tier: "HYBRID",
          isPayAsYouGoUnlocked: true,
        });
        return;
      }

      if (event === "connector:list") {
        emitConnectors();
        return;
      }

      if (event === "connector:activate" || event === "connector:deactivate") {
        const targetId = payload?.connectorId;
        const nextActive = event === "connector:activate";
        const current = readJson("sera_active_connectors", DEFAULT_COMMERCE_CONNECTORS);
        const updated = current.map((c: any) =>
          c.id === targetId ? { ...c, isActive: nextActive } : c
        );
        writeJson("sera_active_connectors", updated);
        localSocket.dispatchIncoming("connector:catalog", updated);
        localSocket.dispatchIncoming("connector:status_changed", updated);
        return;
      }

      if (event === "automations:fetch" || event === "autonomy-agreements:fetch") {
        emitAutomations();
        return;
      }

      if (event === "automations:delete") {
        const triggers = readJson("sera_nanomind_triggers", DEMO_TRIGGERS);
        const updated = triggers.filter((t: any) => t.id !== payload);
        writeJson("sera_nanomind_triggers", updated);
        localSocket.dispatchIncoming("automations:update", updated);
        return;
      }

      if (event === "autonomy-agreements:revoke") {
        const agreements = readJson("sera_nanomind_agreements", DEMO_AGREEMENTS);
        const updated = agreements.map((a: any) =>
          a.id === payload ? { ...a, status: "REVOKED", updatedAt: Date.now() } : a
        );
        writeJson("sera_nanomind_agreements", updated);
        localSocket.dispatchIncoming("autonomy-agreements:update", updated);
        return;
      }

      if (event === "chat:clear") {
        deleteDeviceMemory();
        return;
      }

      if (event === "chat:cancel") {
        cancelChat();
        return;
      }

      if (event === "chat:proposal_response") {
        const { proposalId, action } = payload || {};
        const proposal =
          proposalRegistryRef.current.get(proposalId) ||
          messagesRef.current.find((m) => m.proposal?.proposalId === proposalId)?.proposal;
        if (proposal) {
          const confirmation = executeCommerceProposal(proposal, action);
          streamReply(confirmation, Date.now());
          emitAutomations();
        }
        return;
      }

      if (event === "ui:set_theme" && payload) {
        setMode(payload);
      }
    });

    // Dispatch initial connector & automation states
    setTimeout(() => {
      emitConnectors();
      emitAutomations();
    }, 0);

    return () => {
      localSocket.close();
    };
  }, [cancelChat, deleteDeviceMemory, setBillingState, setMode, streamReply]);

  const sendMessage = useCallback(
    (text: string, images?: string[], documents?: any[], modelTier?: "flash" | "high") => {
      if ((!text || !text.trim()) && (!images || images.length === 0) && (!documents || documents.length === 0)) {
        return;
      }
      const clientMessageId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const msgId = Date.now();
      const userMsg = {
        id: msgId,
        clientMessageId,
        createdAt: msgId,
        timestamp: msgId,
        role: "user",
        content: text,
        images,
        documents,
        status: "sent",
      };

      setMessages((prev) => sortMessagesChronologically([...prev, userMsg]));
      void executeChatTurn(text, images, documents, modelTier);
    },
    [executeChatTurn]
  );

  return {
    socket,
    messages,
    setMessages,
    sendMessage,
    isAuthenticated,
    streamReply,
    currentActivity,
    cancelChat,
    memoryVault,
    deviceVault,
    deleteDeviceMemory,
    googleDrive,
    connectGoogleDrive: useCallback(() => {}, []),
    disconnectGoogleDrive: useCallback(() => {}, []),
    threads,
    connectThreads: useCallback(() => {}, []),
    disconnectThreads: useCallback(() => {}, []),
    telegram,
    telegramLinkCode: null,
    generateTelegramLink: useCallback(() => {}, []),
    whatsapp,
    whatsappLinkData: null,
    generateWhatsAppLink: useCallback(() => {}, []),
    disconnectWhatsApp: useCallback(() => {}, []),
    getWhatsAppStatus: useCallback(() => {}, []),
    governanceRecommendations,
    respondToGovernanceRecommendation,
  };
}
