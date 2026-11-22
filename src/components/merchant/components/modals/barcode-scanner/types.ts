import type { ThemeType } from "../../../../../theme";
import type { PosCartItem } from "../../../types";

export interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDetected: (code: string) => void;
  theme: ThemeType;
  title?: string;
  continuous?: boolean;
  cartItems?: PosCartItem[];
  rawSubtotal?: number;
  productDiscountTotal?: number;
  manualDiscountNominal?: number;
  onUpdateManualDiscount?: (val: number) => void;
  totalAmount?: number;
  totalCount?: number;
  onUpdateQty?: (index: number, nextQty: number) => void;
  onRemoveItem?: (index: number) => void;
  onClearCart?: () => void;
  onProceedToPayment?: () => void;
}
