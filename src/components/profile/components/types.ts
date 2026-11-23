import type { AddressData } from './AddressSubView';

export type ProfileViewMode = 'main' | 'profile' | 'privacy' | 'address' | 'notification';

export interface StatusFeedback {
  type: 'success' | 'error' | 'info';
  text: string;
}

export interface BalanceModalState {
  isOpen: boolean;
  requiredAmount: number;
  itemName: string;
  tierKey?: 'STARTER' | 'ENTERPRISE';
}

export type { AddressData };

