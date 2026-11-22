import React, { useState } from "react";
import { Upload, Trash2, ChevronLeft } from "lucide-react";
import type { ThemeType } from "../../../theme";
import { getStoreEntityLabel, type StoreType } from "../types";

interface MerchantPaymentsViewProps {
  theme: ThemeType;
  isMobileView?: boolean;
  storeType?: StoreType;
  editBankName?: string;
  setEditBankName?: (v: string) => void;
  editDanaPhone: string;
  setEditDanaPhone: (v: string) => void;
  editDanaName: string;
  setEditDanaName: (v: string) => void;
  editQrisImageUrl: string;
  setEditQrisImageUrl: (v: string) => void;
  editAcceptCod: boolean;
  setEditAcceptCod: (v: boolean) => void;
  handleQrisUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSavePayments: (e: React.FormEvent) => void;
  embedded?: boolean;
  onBack?: () => void;
  referralCopied?: boolean;
  handleCopyReferralCode?: () => void;
}

const BANK_PROVIDERS = ["BCA", "Mandiri", "BRI", "BNI", "BSI", "CIMB"];
const EWALLET_PROVIDERS = ["DANA", "GoPay", "OVO", "ShopeePay", "LinkAja"];

export function MerchantPaymentsView({
  theme,
  isMobileView,
  storeType,
  editBankName = "BCA",
  setEditBankName,
  editDanaPhone,
  setEditDanaPhone,
  editDanaName,
  setEditDanaName,
  editQrisImageUrl,
  setEditQrisImageUrl,
  editAcceptCod,
  setEditAcceptCod,
  handleQrisUpload,
  onSavePayments,
  embedded = false,
  onBack
}: MerchantPaymentsViewProps) {
  const entity = getStoreEntityLabel(storeType);
  // Automatically identify if the current provider is an E-Wallet or a Bank
  const [paymentType, setPaymentType] = useState<"BANK" | "EWALLET">(() => {
    const up = (editBankName || "").trim().toUpperCase();
    if (EWALLET_PROVIDERS.map(e => e.toUpperCase()).includes(up)) {
      return "EWALLET";
    }
    return "BANK";
  });

  const isBank = paymentType === "BANK";

  return (
    <div style={{
      padding: embedded ? 0 : (isMobileView ? "16px 14px 60px" : "24px 20px 60px"),
      maxWidth: embedded ? "100%" : 600,
      margin: embedded ? 0 : "0 auto",
      width: "100%"
    }}>
      {onBack && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 16
        }}>
          <button
            type="button"
            onClick={onBack}
            style={{
              background: theme.surface2,
              border: `1px solid ${theme.border}`,
              borderRadius: "50%",
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: theme.ink,
              transition: "all 0.15s ease",
              flexShrink: 0
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = theme.border; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = theme.surface2; }}
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: theme.ink }}>Payment Methods</div>
            <div style={{ fontSize: 12, color: theme.inkSoft }}>Configure your store bank account, QRIS, and cash options</div>
          </div>
        </div>
      )}

      <form onSubmit={onSavePayments} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {/* 1. RECEIVING BANK / E-WALLET CARD */}
        <div style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 20,
          padding: isMobileView ? "20px 16px" : "24px 22px",
          display: "flex",
          flexDirection: "column",
          gap: 16
        }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: theme.ink }}>
              Payout Account / E-Wallet
            </div>
            <div style={{ fontSize: 12.5, color: theme.inkSoft, marginTop: 2 }}>
              Direct transfer destination from buyers to your bank account or digital wallet
            </div>
          </div>

          {/* Segment Selector: Bank Account vs E-Wallet */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            background: theme.surface2,
            borderRadius: 14,
            padding: 4,
            border: `1px solid ${theme.border}`,
            gap: 4
          }}>
            <button
              type="button"
              onClick={() => {
                setPaymentType("BANK");
                if (EWALLET_PROVIDERS.map(e => e.toUpperCase()).includes(editBankName.trim().toUpperCase())) {
                  setEditBankName?.("BCA");
                }
              }}
              style={{
                padding: "9px 12px",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: isBank ? 700 : 500,
                cursor: "pointer",
                border: "none",
                background: isBank ? theme.surface : "transparent",
                color: isBank ? theme.ink : theme.inkSoft,
                boxShadow: isBank ? "0 1px 3px rgba(0, 0, 0, 0.08)" : "none",
                transition: "all 0.15s ease",
                textAlign: "center",
                userSelect: "none"
              }}
            >
              Bank Account
            </button>

            <button
              type="button"
              onClick={() => {
                setPaymentType("EWALLET");
                if (BANK_PROVIDERS.map(b => b.toUpperCase()).includes(editBankName.trim().toUpperCase())) {
                  setEditBankName?.("DANA");
                }
              }}
              style={{
                padding: "9px 12px",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: !isBank ? 700 : 500,
                cursor: "pointer",
                border: "none",
                background: !isBank ? theme.surface : "transparent",
                color: !isBank ? theme.ink : theme.inkSoft,
                boxShadow: !isBank ? "0 1px 3px rgba(0, 0, 0, 0.08)" : "none",
                transition: "all 0.15s ease",
                textAlign: "center",
                userSelect: "none"
              }}
            >
              E-Wallet
            </button>
          </div>

          {/* Quick Provider Chips depending on selected mode */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: theme.inkSoft }}>
              {isBank ? "Quick Bank Presets:" : "Quick E-Wallet Presets:"}
            </div>
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6
            }}>
              {(isBank ? BANK_PROVIDERS : EWALLET_PROVIDERS).map(provider => {
                const isSelected = editBankName.trim().toUpperCase() === provider.toUpperCase();
                return (
                  <button
                    key={provider}
                    type="button"
                    onClick={() => setEditBankName?.(provider)}
                    style={{
                      padding: "7px 14px",
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: isSelected ? 700 : 500,
                      cursor: "pointer",
                      background: isSelected ? theme.surface : theme.surface2,
                      color: isSelected ? theme.ink : theme.inkSoft,
                      border: `1.5px solid ${isSelected ? theme.ink : theme.border}`,
                      transition: "all 0.15s ease",
                      userSelect: "none"
                    }}
                  >
                    {provider}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Fields: Provider, Nomor Rekening / No HP, Nama Pemilik */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: theme.ink, marginBottom: 8 }}>
                {isBank ? "Bank Name" : "E-Wallet Provider"}
              </label>
              <input
                type="text"
                value={editBankName}
                onChange={e => setEditBankName?.(e.target.value)}
                placeholder={isBank ? "Example: Chase, BCA, Mandiri, SeaBank" : "Example: DANA, GoPay, OVO, PayPal"}
                style={{
                  width: "100%",
                  height: 48,
                  padding: "0 16px",
                  borderRadius: 14,
                  border: `1px solid ${theme.border}`,
                  background: theme.surface2,
                  color: theme.ink,
                  fontSize: 14,
                  fontWeight: 500,
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobileView ? "1fr" : "1fr 1fr", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: theme.ink, marginBottom: 8 }}>
                  {isBank ? "Account Number" : "E-Wallet Phone Number"}
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={editDanaPhone}
                  onChange={e => setEditDanaPhone(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder={isBank ? "Example: 1234567890" : "Example: 081234567890"}
                  style={{
                    width: "100%",
                    height: 48,
                    padding: "0 16px",
                    borderRadius: 14,
                    border: `1px solid ${theme.border}`,
                    background: theme.surface2,
                    color: theme.ink,
                    fontSize: 14,
                    fontWeight: 500,
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: theme.ink, marginBottom: 8 }}>
                  {isBank ? "Account Holder Name" : "E-Wallet Account Name"}
                </label>
                <input
                  type="text"
                  value={editDanaName}
                  onChange={e => setEditDanaName(e.target.value)}
                  placeholder={isBank ? "Matches bank statement" : "Registered account name"}
                  style={{
                    width: "100%",
                    height: 48,
                    padding: "0 16px",
                    borderRadius: 14,
                    border: `1px solid ${theme.border}`,
                    background: theme.surface2,
                    color: theme.ink,
                    fontSize: 14,
                    fontWeight: 500,
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. KARTU QRIS TOKO */}
        <div style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 20,
          padding: isMobileView ? "20px 16px" : "24px 22px",
          display: "flex",
          flexDirection: "column",
          gap: 16
        }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: theme.ink }}>
              {entity} QRIS (Universal)
            </div>
            <div style={{ fontSize: 12.5, color: theme.inkSoft, marginTop: 2 }}>
              Upload your QRIS code to accept instant payments from all mobile banking and e-wallet apps
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: isMobileView ? "column" : "row", gap: 16, alignItems: isMobileView ? "flex-start" : "center" }}>
            {/* QRIS Preview Box */}
            <div style={{
              width: 120,
              height: 120,
              borderRadius: 16,
              border: `1px solid ${theme.border}`,
              background: theme.surface2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              flexShrink: 0
            }}>
              {editQrisImageUrl ? (
                <img
                  src={editQrisImageUrl}
                  alt={`QRIS ${entity}`}
                  style={{ width: "100%", height: "100%", objectFit: "contain", padding: 6, boxSizing: "border-box" }}
                />
              ) : (
                <label style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  color: theme.inkSoft,
                  cursor: "pointer",
                  padding: 8,
                  textAlign: "center"
                }}>
                  <Upload size={22} color={theme.inkSoft} />
                  <span style={{ fontSize: 11, fontWeight: 600 }}>Choose QRIS Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleQrisUpload}
                    style={{ display: "none" }}
                  />
                </label>
              )}
            </div>

            {/* Upload & Delete Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <label style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "9px 18px",
                  borderRadius: 20,
                  background: theme.surface2,
                  border: `1px solid ${theme.border}`,
                  color: theme.ink,
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}>
                  <Upload size={14} color={theme.ink} />
                  <span>{editQrisImageUrl ? "Replace QRIS Image" : "Upload QRIS Image"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleQrisUpload}
                    style={{ display: "none" }}
                  />
                </label>

                {editQrisImageUrl && (
                  <button
                    type="button"
                    onClick={() => setEditQrisImageUrl("")}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "9px 14px",
                      borderRadius: 20,
                      background: theme.surface2,
                      border: `1px solid ${theme.border}`,
                      color: theme.inkSoft,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.15s ease"
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.color = "#EF4444";
                      (e.currentTarget as HTMLElement).style.borderColor = "#EF444455";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.color = theme.inkSoft;
                      (e.currentTarget as HTMLElement).style.borderColor = theme.border;
                    }}
                  >
                    <Trash2 size={13} />
                    <span>Remove</span>
                  </button>
                )}
              </div>
              <div style={{ fontSize: 11.5, color: theme.inkSoft, lineHeight: 1.4 }}>
                JPG, PNG, or WEBP format. Ensure the QR barcode is clear and sharp.
              </div>
            </div>
          </div>
        </div>

        {/* 3. CASH ON DELIVERY (COD) CARD */}
        <div style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 20,
          padding: isMobileView ? "20px 16px" : "24px 22px",
          display: "flex",
          flexDirection: "column",
          gap: 16
        }}>
          <div
            onClick={() => setEditAcceptCod(!editAcceptCod)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
              userSelect: "none"
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1, paddingRight: 14 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: theme.ink }}>
                Cash on Delivery (COD)
              </div>
              <div style={{ fontSize: 12.5, color: theme.inkSoft, lineHeight: 1.35 }}>
                {editAcceptCod
                  ? `${entity} accepts direct cash payment from buyers upon delivery`
                  : `${entity} only accepts digital cashless payments (Transfer / QRIS)`}
              </div>
            </div>

            {/* Tactile Toggle Switch */}
            <div
              style={{
                width: 50,
                height: 30,
                borderRadius: 20,
                background: editAcceptCod ? theme.ink : theme.surface2,
                border: `1.5px solid ${editAcceptCod ? theme.ink : theme.border}`,
                position: "relative",
                transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                cursor: "pointer",
                flexShrink: 0
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: editAcceptCod ? theme.bg : theme.inkSoft,
                  position: "absolute",
                  top: 3,
                  left: 3,
                  transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                  transform: editAcceptCod ? "translateX(20px)" : "translateX(0)",
                  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)"
                }}
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          style={{
            padding: "14px 28px",
            borderRadius: 20,
            background: theme.ink,
            color: theme.bg,
            border: "none",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 14px rgba(0, 0, 0, 0.12)",
            transition: "opacity 0.15s ease",
            marginTop: 4
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.opacity = "0.85";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.opacity = "1";
          }}
        >
          <span>Save Payment Methods</span>
        </button>
      </form>
    </div>
  );
}
