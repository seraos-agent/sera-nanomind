import { useState } from "react";

export interface BillingState {
  tier: string;
  agentCredits: number;
  isPayAsYouGoUnlocked: boolean;
  isEceranUnlocked: boolean;
  tierExpiresAt: number | undefined;
  error?: string;
}

export const INITIAL_BILLING: BillingState = {
  tier: "FREE",
  agentCredits: 0,
  isPayAsYouGoUnlocked: false,
  isEceranUnlocked: false,
  tierExpiresAt: undefined,
};

export function useBilling() {
  const [billingState, setBillingState] = useState<BillingState>(INITIAL_BILLING);

  return {
    billingState,
    setBillingState,
  };
}
