import type { ThemeType } from "../../../theme";
import type { DriverProfile, DeliveryStop } from "../types";

export * from "../types";

export interface StoreDeliveryQueueViewProps {
  theme: ThemeType;
  driver: DriverProfile;
  isOnline?: boolean;
  onToggleOnline?: () => void;
  onPendingCountChange?: (count: number) => void;
  isMobileView?: boolean;
  activeTab?: "orders" | "map";
  onSwitchToMap?: (stop?: DeliveryStop) => void;
  onSwitchToList?: () => void;
  onOpenSettlement?: () => void;
  onOpenProfile?: () => void;
  onUpdateDriver?: (updated: Partial<DriverProfile>) => void;
  onUnlinkStore?: () => void;
}
