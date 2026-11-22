import { useState } from "react";
import type { ThemeType } from "../../../../../theme";
import { MerchantTermsModal } from "../../modals/MerchantTermsModal";

interface StoreOnboardingRegistrationCardProps {
  theme: ThemeType;
  isMobileView?: boolean;
  completedCount: number;
  isAllDataComplete: boolean;
  onRegisterStore?: () => Promise<any>;
  onFeedback: (msg: string) => void;
}

export function StoreOnboardingRegistrationCard({
  theme,
  isMobileView,
  completedCount,
  isAllDataComplete,
  onRegisterStore,
  onFeedback
}: StoreOnboardingRegistrationCardProps) {
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [isDisclaimerChecked, setIsDisclaimerChecked] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const canRegister = isAllDataComplete && hasReadTerms && isDisclaimerChecked && !isRegistering;

  return (
    <>
      <div
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 20,
          padding: isMobileView ? "18px 16px" : "22px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 14
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <span style={{ fontSize: 14.5, fontWeight: 700, color: theme.ink }}>
            Merchant Store Registration
          </span>
          <span
            style={{
              fontSize: 11.5,
              fontWeight: 700,
              color: isAllDataComplete ? "#10B981" : "#EF4444",
              background: isAllDataComplete ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.1)",
              padding: "3px 10px",
              borderRadius: 20
            }}
          >
            {completedCount}/4 Required
          </span>
        </div>

        {/* Button to open Full-Screen Terms & Regulations */}
        <button
          type="button"
          onClick={() => setIsTermsModalOpen(true)}
          style={{
            width: "100%",
            padding: "11px 14px",
            borderRadius: 12,
            background: theme.surface2,
            border: `1px solid ${hasReadTerms ? "#10B981" : theme.border}`,
            color: theme.ink,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8
          }}
        >
          <span>Rules &amp; Terms and Conditions</span>
          {hasReadTerms ? (
            <span style={{ fontSize: 11, fontWeight: 700, color: "#10B981" }}>
              Read
            </span>
          ) : (
            <span style={{ fontSize: 11, fontWeight: 600, color: theme.accent }}>
              Read
            </span>
          )}
        </button>

        {/* Disclaimer Checkbox */}
        <label
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            cursor: "pointer",
            userSelect: "none",
            padding: "4px 2px"
          }}
          onClick={(e) => {
            if (!hasReadTerms) {
              e.preventDefault();
              setIsTermsModalOpen(true);
            }
          }}
        >
          <input
            type="checkbox"
            checked={isDisclaimerChecked}
            onChange={(e) => {
              if (!hasReadTerms) {
                setIsTermsModalOpen(true);
                return;
              }
              setIsDisclaimerChecked(e.target.checked);
            }}
            style={{
              marginTop: 2,
              width: 17,
              height: 17,
              accentColor: theme.accent,
              cursor: "pointer",
              flexShrink: 0
            }}
          />
          <span style={{ fontSize: 12.5, color: theme.inkSoft, lineHeight: 1.45 }}>
            I confirm that the store information is accurate and agree to the{" "}
            <span
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsTermsModalOpen(true);
              }}
              style={{ color: theme.accent, fontWeight: 600, textDecoration: "underline" }}
            >
              SERA Merchant Rules &amp; Terms and Conditions
            </span>
            .
          </span>
        </label>

        {/* Register Submit Button */}
        <button
          type="button"
          disabled={!canRegister}
          onClick={async () => {
            if (!onRegisterStore || !canRegister) return;
            setIsRegistering(true);
            try {
              await onRegisterStore();
              onFeedback("Congratulations! Your store is now registered and active.");
            } catch (err: any) {
              onFeedback(err?.message || "Failed to register store.");
            } finally {
              setIsRegistering(false);
            }
          }}
          style={{
            width: "100%",
            padding: "13px 18px",
            borderRadius: 14,
            background: canRegister ? theme.ink : theme.surface2,
            color: canRegister ? theme.bg : theme.inkSoft,
            border: canRegister ? "none" : `1px solid ${theme.border}`,
            fontSize: 14,
            fontWeight: 700,
            cursor: canRegister ? "pointer" : "not-allowed",
            opacity: canRegister ? 1 : 0.65,
            transition: "all 0.15s ease",
            boxShadow: canRegister ? "0 4px 14px rgba(0, 0, 0, 0.14)" : "none"
          }}
        >
          {isRegistering ? "Registering Store..." : "Register Merchant Store"}
        </button>

        {!canRegister && (
          <div style={{ fontSize: 11.5, color: theme.inkSoft, textAlign: "center" }}>
            {!isAllDataComplete
              ? "Please complete all required sections above first."
              : !hasReadTerms
                ? "Please open and read the Merchant Rules first."
                : "Check the terms agreement box to enable registration."}
          </div>
        )}
      </div>

      {/* Full-Screen Store Partner Terms Modal */}
      <MerchantTermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        onConfirmRead={() => {
          setHasReadTerms(true);
          setIsDisclaimerChecked(true);
          setIsTermsModalOpen(false);
        }}
        theme={theme}
        isMobileView={isMobileView}
      />
    </>
  );
}
