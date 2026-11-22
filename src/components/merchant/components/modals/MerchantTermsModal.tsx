import React from "react";
import { ChevronLeft } from "lucide-react";
import type { ThemeType } from "../../../../theme";

interface MerchantTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmRead: () => void;
  theme: ThemeType;
  isMobileView?: boolean;
}

export const MerchantTermsModal: React.FC<MerchantTermsModalProps> = ({
  isOpen,
  onClose,
  onConfirmRead,
  theme,
  isMobileView
}) => {
  if (!isOpen) return null;

  const sections = [
    {
      title: "1. Identity Authenticity & Store Data",
      body: "Partners must provide store details honestly and accurately, including store name, active WhatsApp number, map GPS coordinates, full address, and valid payment methods. Using fictitious data may result in rejection or store deactivation."
    },
    {
      title: "2. Product Standards, Pricing & Stock Availability",
      body: "Every uploaded product, food item, or service must use an appropriate photo, clear description, and fair, transparent pricing. Partners are responsible for maintaining accurate stock levels to avoid disappointing customers."
    },
    {
      title: "3. Prohibited Goods & Services",
      body: "Partners are strictly prohibited from selling illegal items, narcotics, sharp weapons or firearms, unapproved medications, counterfeit products, pornographic content, or other hazardous goods that violate applicable laws."
    },
    {
      title: "4. Service & Delivery Obligations",
      body: "Partners must respond to incoming orders within their configured operating hours. Orders must be packaged securely and handed over on time to couriers or customers picking up orders directly."
    },
    {
      title: "5. Payments, QRIS & Transaction Transparency",
      body: "Registered bank accounts, DANA accounts, or QRIS images must legitimately belong to the store owner or manager. Any form of payment fraud or transaction manipulation outside platform terms will be strictly penalized."
    },
    {
      title: "6. Admin Review & Violation Sanctions",
      body: "The SERA team reserves the right to review, temporarily suspend, or deactivate partner accounts if violations of these terms, buyer fraud reports, or system abuse are detected."
    }
  ];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        background: theme.bg,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }}
    >
      {/* Top Sticky Header */}
      <div
        style={{
          background: theme.surface,
          borderBottom: `1px solid ${theme.border}`,
          padding: isMobileView ? "14px 16px" : "16px 24px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexShrink: 0
        }}
      >
        <button
          type="button"
          onClick={onClose}
          title="Back"
          style={{
            background: theme.surface2,
            border: `1px solid ${theme.border}`,
            borderRadius: 10,
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: theme.ink,
            cursor: "pointer",
            flexShrink: 0
          }}
        >
          <ChevronLeft size={20} />
        </button>
        <div style={{ minWidth: 0, flex: 1 }}>
          <h2
            style={{
              margin: 0,
              fontSize: isMobileView ? 16 : 17,
              fontWeight: 700,
              color: theme.ink,
              lineHeight: 1.25
            }}
          >
            Terms & Conditions
          </h2>
          <div style={{ fontSize: 12, color: theme.inkSoft, marginTop: 2 }}>
            SERA Marketplace Partner Agreement
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: isMobileView ? "18px 16px 32px" : "28px 24px 40px",
          WebkitOverflowScrolling: "touch"
        }}
      >
        <div
          style={{
            maxWidth: 680,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 16
          }}
        >
          {/* Intro Banner */}
          <div
            style={{
              background: theme.surface,
              border: `1px solid ${theme.border}`,
              borderRadius: 18,
              padding: "16px 18px"
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, color: theme.ink }}>
              SERA Partnership Commitment
            </div>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: theme.inkSoft, lineHeight: 1.5 }}>
              Please read all terms and policies below carefully before submitting your SERA Store Partner registration.
            </p>
          </div>

          {/* Terms List */}
          <div
            style={{
              background: theme.surface,
              border: `1px solid ${theme.border}`,
              borderRadius: 18,
              padding: isMobileView ? "16px" : "22px",
              display: "flex",
              flexDirection: "column",
              gap: 18
            }}
          >
            {sections.map((sec) => (
              <div key={sec.title} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: theme.ink }}>
                  {sec.title}
                </h3>
                <p style={{ margin: 0, fontSize: 13, color: theme.inkSoft, lineHeight: 1.6 }}>
                  {sec.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Footer */}
      <div
        style={{
          background: theme.surface,
          borderTop: `1px solid ${theme.border}`,
          padding: isMobileView ? "14px 16px" : "16px 24px",
          flexShrink: 0
        }}
      >
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <button
            type="button"
            onClick={onConfirmRead}
            style={{
              width: "100%",
              padding: "13px 20px",
              borderRadius: 14,
              background: theme.ink,
              color: theme.bg,
              border: "none",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: "0 4px 14px rgba(0, 0, 0, 0.14)"
            }}
          >
            <span>I Have Read & Understood the Terms</span>
          </button>
        </div>
      </div>
    </div>
  );
};

