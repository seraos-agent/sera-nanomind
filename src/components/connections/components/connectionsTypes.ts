import { HardDrive, ShoppingBag } from "lucide-react";
import type { ThemeType } from "../../../theme";
import type { ThreadsConnectionState } from "../../../hooks/useSocket";

export type WorkspaceFeatureView = "marketplace" | "merchant" | "cashier" | "driver";

export interface WorkspacePageProps {
  theme: ThemeType;
  onBack: () => void;
  isMobileView?: boolean;
  socket?: any;
  threads?: ThreadsConnectionState;
  onConnectThreads?: () => void;
  onDisconnectThreads?: () => void;
  telegram?: any;
  telegramLinkCode?: string | null;
  onGenerateTelegramLink?: () => void;
  whatsapp?: { status: string; phoneNumber?: string } | null;
  whatsappLinkData?: { code: string; deepLink: string } | null;
  onGenerateWhatsAppLink?: () => void;
  onDisconnectWhatsApp?: () => void;
  googleDrive?: { status: string; url?: string } | null;
  onConnectGoogleDrive?: () => void;
  onDisconnectGoogleDrive?: () => void;
  onOpenFeature?: (view: WorkspaceFeatureView) => void;
}

export interface ConnectorSummary {
  id: string;
  name: string;
  category: string;
  description: string;
  riskSummary: string;
  network?: string;
  alwaysActive: boolean;
  isActive: boolean;
  toolCount: number;
  toolNames: string[];
}

export interface ConnectedPlatform {
  client_id: string;
  client_name: string;
  created_at: number;
}

export const CATEGORIES = [
  {
    id: "commerce",
    name: "Commerce & Operations",
    icon: ShoppingBag,
    description: "Marketplace storefront, store hub, POS cash register, and courier fleet",
  },
  {
    id: "storage",
    name: "Storage Vault & Hybrid AI",
    icon: HardDrive,
    description: "AES-GCM encrypted browser memory vault and Firebase AI Logic hybrid inference engine",
  },
];

export const CATEGORY_ICON_MAP: Record<string, any> = {
  commerce: ShoppingBag,
  storage: HardDrive,
};
