import type { StoreShippingConfig, MerchantStore } from '../../../types';
import type { ThemeType } from '../../../../../theme';

export interface ShippingSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shippingConfig?: StoreShippingConfig;
  onSave: (config: StoreShippingConfig) => void;
  theme: ThemeType;
  isMobileView?: boolean;
  store?: MerchantStore | null;
  onRefreshStore?: () => Promise<void>;
}

