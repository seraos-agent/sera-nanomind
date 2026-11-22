import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Calculator,
  Plus,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  Share2,
  Shield,
  Users,
  Lock,
  Save,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import type { ThemeType } from "../../../../../theme";
import type { MerchantStore } from "../../../types";
import type { OpenBillAuditLogEntry } from "../../pos/hooks/useAdaptivePosMode";
import { getApiBaseUrl } from "../../../../../config/marketplaceConfig";

interface CashierPermissions {
  canVoid: boolean;
  canDiscount: boolean;
  canViewDailyReport: boolean;
}

interface LinkedCashier {
  id: string;
  name: string;
  phone?: string;
  role: "CASHIER" | "SUPERVISOR";
  activationCode: string;
  hasPin: boolean;
  permissions: CashierPermissions;
  status: "ACTIVE" | "SHIFT_OPEN" | "DISABLED";
  isActivated?: boolean;
}

interface StorePosConfigState {
  taxEnabled: boolean;
  taxPercent: number;
  serviceChargeEnabled: boolean;
  serviceChargePercent: number;
  allowManualDiscount: boolean;
  allowOpenBill: boolean;
  hasSupervisorPin: boolean;
}

interface OpenShiftSummary {
  id: string;
  cashierName: string;
  openingCash: number;
  openedAt: number;
}

interface ClosedShiftRecord {
  id: string;
  cashierName: string;
  status: "OPEN" | "CLOSED";
  openingCash: number;
  cashIn: number;
  cashOut: number;
  expectedCash?: number;
  actualCash?: number;
  cashVariance?: number;
  openedAt: number;
  closedAt?: number;
  notes?: string;
}

interface PosSettingsSubpageFormProps {
  theme: ThemeType;
  store?: MerchantStore | null;
  onFeedback?: (message: string) => void;
}

/**
 * PosSettingsSubpageForm - Store Owner control panel inside Store Info for configuring
 * POS tax/service rules, supervisor PIN, and managing POS Cashier staff activation codes.
 */
export const PosSettingsSubpageForm: React.FC<PosSettingsSubpageFormProps> = ({
  theme,
  store,
  onFeedback
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [isAddingCashier, setIsAddingCashier] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [inlineBanner, setInlineBanner] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [posConfig, setPosConfig] = useState<StorePosConfigState>({
    taxEnabled: false,
    taxPercent: 11,
    serviceChargeEnabled: false,
    serviceChargePercent: 5,
    allowManualDiscount: false,
    allowOpenBill: true,
    hasSupervisorPin: false
  });
  const [supervisorPinInput, setSupervisorPinInput] = useState("");
  const [cashiers, setCashiers] = useState<LinkedCashier[]>([]);
  const [openShifts, setOpenShifts] = useState<OpenShiftSummary[]>([]);
  const [closedShifts, setClosedShifts] = useState<ClosedShiftRecord[]>([]);
  const [billAuditLogs, setBillAuditLogs] = useState<OpenBillAuditLogEntry[]>([]);

  // New cashier form state
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newRole, setNewRole] = useState<"CASHIER" | "SUPERVISOR">("CASHIER");
  const [newPin, setNewPin] = useState("");
  const [canVoid, setCanVoid] = useState(false);
  const [canDiscount, setCanDiscount] = useState(false);
  const [canViewReport, setCanViewReport] = useState(true);
  const [editingPinCashierId, setEditingPinCashierId] = useState<string | null>(null);
  const [editPinValue, setEditPinValue] = useState("");
  const [isUpdatingPin, setIsUpdatingPin] = useState(false);

  const onFeedbackRef = useRef(onFeedback);
  onFeedbackRef.current = onFeedback;

  const showBanner = useCallback((text: string, type: "success" | "error" = "success") => {
    setInlineBanner({ type, text });
    onFeedbackRef.current?.(text);
  }, []);

  const parseJsonSafe = async (res: Response) => {
    const raw = await res.text();
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const ensureStoreRegisteredOnServer = useCallback(async (): Promise<boolean> => {
    if (!store?.id || !store?.name) return false;
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/market/stores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...store,
          type: store.type === "BARANG" ? "GOODS" : store.type === "JASA" ? "SERVICE" : store.type
        })
      });
      return res.ok;
    } catch {
      return false;
    }
  }, [store]);

  const fetchPosSettings = useCallback(async () => {
    if (!store?.id) return;
    setIsLoading(true);
    try {
      const [res, openBillsRes, shiftsRes] = await Promise.all([
        fetch(`${getApiBaseUrl()}/api/market/stores/${store.id}/pos-config`, {
          headers: store.ownerId ? { "x-owner-email": store.ownerId } : undefined
        }),
        fetch(`${getApiBaseUrl()}/api/market/stores/${store.id}/pos-open-bills`),
        fetch(`${getApiBaseUrl()}/api/market/pos/shifts?storeId=${encodeURIComponent(store.id)}&status=CLOSED`)
      ]);
      const json = await parseJsonSafe(res);
      if (json?.success && json.data) {
        if (json.data.posConfig) {
          setPosConfig({
            ...json.data.posConfig,
            allowOpenBill: json.data.posConfig.allowOpenBill ?? true
          });
        }
        setCashiers(Array.isArray(json.data.linkedCashiers) ? json.data.linkedCashiers : []);
        setOpenShifts(Array.isArray(json.data.openShifts) ? json.data.openShifts : []);
      } else if (res.status === 404 && !json) {
        showBanner(
          "POS endpoint is not active on server (HTTP 404). Make sure backend is deployed or restarted.",
          "error"
        );
      }

      if (openBillsRes.ok) {
        const billsJson = await parseJsonSafe(openBillsRes);
        if (billsJson?.success && Array.isArray(billsJson.data?.auditLogs)) {
          setBillAuditLogs(billsJson.data.auditLogs);
        }
      }

      if (shiftsRes.ok) {
        const shiftsJson = await parseJsonSafe(shiftsRes);
        if (shiftsJson?.success && Array.isArray(shiftsJson.data)) {
          const sortedClosed = (shiftsJson.data as ClosedShiftRecord[])
            .filter((s) => s.status === "CLOSED")
            .sort((a, b) => (b.closedAt || b.openedAt) - (a.closedAt || a.openedAt));
          setClosedShifts(sortedClosed);
        }
      }
    } catch {
      showBanner("Failed to load POS settings from server.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [store?.id, store?.ownerId, showBanner]);

  useEffect(() => {
    void fetchPosSettings();
  }, [fetchPosSettings]);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store?.id) return;
    setIsSavingConfig(true);
    setInlineBanner(null);
    try {
      const payload: Record<string, unknown> = {
        taxEnabled: posConfig.taxEnabled,
        taxPercent: posConfig.taxPercent,
        serviceChargeEnabled: posConfig.serviceChargeEnabled,
        serviceChargePercent: posConfig.serviceChargePercent,
        allowManualDiscount: posConfig.allowManualDiscount,
        allowOpenBill: posConfig.allowOpenBill
      };
      if (supervisorPinInput.trim()) {
        payload.supervisorPin = supervisorPinInput.trim();
      }
      const sendPut = () =>
        fetch(`${getApiBaseUrl()}/api/market/stores/${store.id}/pos-config`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

      let res = await sendPut();
      let json = await parseJsonSafe(res);
      if (!res.ok && String(json?.error || "").toLowerCase().includes("not found")) {
        const synced = await ensureStoreRegisteredOnServer();
        if (synced) {
          res = await sendPut();
          json = await parseJsonSafe(res);
        }
      }
      if (!res.ok || !json?.success) {
        showBanner(
          json?.error ||
            `Failed to save POS settings (HTTP ${res.status}). Ensure backend server is up to date.`,
          "error"
        );
        return;
      }
      setPosConfig({
        ...json.data,
        allowOpenBill: json.data.allowOpenBill ?? true
      });
      setSupervisorPinInput("");
      try {
        window.dispatchEvent(
          new CustomEvent("sera_pos_config_updated", {
            detail: { storeId: store.id, posConfig: json.data }
          })
        );
      } catch {}
      showBanner("POS settings saved!", "success");
    } catch {
      showBanner("Failed to reach server. Check network connection or backend status.", "error");
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleCreateCashier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store?.id) {
      showBanner("Store data not found.", "error");
      return;
    }
    if (!newName.trim()) {
      showBanner("Cashier staff name is required.", "error");
      return;
    }
    const cleanPin = newPin.trim();
    if (!/^\d{4,6}$/.test(cleanPin)) {
      showBanner("Cashier PIN is required (4-6 digits).", "error");
      return;
    }
    setIsAddingCashier(true);
    setInlineBanner(null);
    try {
      const sendPost = () =>
        fetch(`${getApiBaseUrl()}/api/market/stores/${store.id}/cashiers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: newName.trim(),
            phone: newPhone.trim() || undefined,
            role: newRole,
            pinCode: cleanPin,
            permissions: {
              canVoid,
              canDiscount,
              canViewDailyReport: canViewReport
            }
          })
        });

      let res = await sendPost();
      let json = await parseJsonSafe(res);
      if (!res.ok && String(json?.error || "").toLowerCase().includes("not found")) {
        const synced = await ensureStoreRegisteredOnServer();
        if (synced) {
          res = await sendPost();
          json = await parseJsonSafe(res);
        }
      }
      if (!res.ok || !json?.success) {
        showBanner(
          json?.error ||
            `Failed to add cashier staff (HTTP ${res.status}). Ensure backend server is up to date.`,
          "error"
        );
        return;
      }
      setCashiers((prev) => [...prev, json.data]);
      setNewName("");
      setNewPhone("");
      setNewRole("CASHIER");
      setNewPin("");
      setCanVoid(false);
      setCanDiscount(false);
      setCanViewReport(true);
      setShowAddForm(false);
      showBanner(`Cashier "${json.data.name}" added (${json.data.activationCode}).`, "success");
    } catch {
      showBanner("Failed to reach server. Check network connection or backend status.", "error");
    } finally {
      setIsAddingCashier(false);
    }
  };

  const handleSaveCashierPin = async (cashier: LinkedCashier) => {
    if (!store?.id) return;
    const cleanPin = editPinValue.trim();
    if (!/^\d{4,6}$/.test(cleanPin)) {
      showBanner("Cashier PIN must be 4-6 digits.", "error");
      return;
    }
    setIsUpdatingPin(true);
    try {
      const res = await fetch(
        `${getApiBaseUrl()}/api/market/stores/${store.id}/cashiers/${cashier.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pinCode: cleanPin })
        }
      );
      const json = await parseJsonSafe(res);
      if (res.ok && json?.success) {
        setCashiers((prev) =>
          prev.map((c) => (c.id === cashier.id ? { ...c, hasPin: true } : c))
        );
        setEditingPinCashierId(null);
        setEditPinValue("");
        showBanner(`PIN saved for cashier "${cashier.name}".`, "success");
      } else {
        showBanner(json?.error || "Failed to save cashier PIN.", "error");
      }
    } catch {
      showBanner("Failed to save cashier PIN.", "error");
    } finally {
      setIsUpdatingPin(false);
    }
  };

  const handleCopyCode = (cashier: LinkedCashier) => {
    navigator.clipboard.writeText(cashier.activationCode);
    setCopiedId(cashier.id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleShareWhatsApp = (cashier: LinkedCashier) => {
    const cleanPhone = (cashier.phone || "").replace(/[^0-9]/g, "");
    const target = cleanPhone.startsWith("0") ? `62${cleanPhone.slice(1)}` : cleanPhone;
    const text = `Hello ${cashier.name}, here is your POS Cashier Activation Code for *${store?.name || "SERA"}*:\n\nActivation Code: *${cashier.activationCode}*\n\nOpen *POS Cashier* in the SERA app and enter the code above along with your *personal PIN (4-6 digits)* provided separately by the store owner to start your shift.`;
    const url = target
      ? `https://wa.me/${target}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const handleResetCode = async (cashier: LinkedCashier) => {
    if (!store?.id) return;
    try {
      const res = await fetch(
        `${getApiBaseUrl()}/api/market/stores/${store.id}/cashiers/${cashier.id}/reset-code`,
        { method: "POST" }
      );
      const json = await parseJsonSafe(res);
      if (json?.success && json.data?.activationCode) {
        setCashiers((prev) =>
          prev.map((c) =>
            c.id === cashier.id
              ? { ...c, activationCode: json.data.activationCode, isActivated: false }
              : c
          )
        );
        showBanner(`Code for ${cashier.name} updated to ${json.data.activationCode}.`, "success");
      } else {
        showBanner(json?.error || "Failed to reset activation code.", "error");
      }
    } catch {
      showBanner("Failed to reset activation code.", "error");
    }
  };

  const handleToggleDisable = async (cashier: LinkedCashier) => {
    if (!store?.id) return;
    const nextStatus = cashier.status === "DISABLED" ? "ACTIVE" : "DISABLED";
    try {
      const res = await fetch(
        `${getApiBaseUrl()}/api/market/stores/${store.id}/cashiers/${cashier.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus })
        }
      );
      const json = await parseJsonSafe(res);
      if (json?.success && json.data) {
        setCashiers((prev) => prev.map((c) => (c.id === cashier.id ? json.data : c)));
      } else {
        showBanner(json?.error || "Failed to update cashier status.", "error");
      }
    } catch {
      showBanner("Failed to update cashier status.", "error");
    }
  };

  const handleRemoveCashier = async (cashier: LinkedCashier) => {
    if (!store?.id) return;
    try {
      const res = await fetch(
        `${getApiBaseUrl()}/api/market/stores/${store.id}/cashiers/${cashier.id}`,
        { method: "DELETE" }
      );
      const json = await parseJsonSafe(res);
      if (json?.success) {
        setCashiers((prev) => prev.filter((c) => c.id !== cashier.id));
        showBanner(`Cashier "${cashier.name}" removed.`, "success");
      } else {
        showBanner(json?.error || "Failed to remove cashier.", "error");
      }
    } catch {
      showBanner("Failed to remove cashier.", "error");
    }
  };

  if (!store?.id) {
    return (
      <div
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 16,
          padding: 20,
          fontSize: 13,
          color: theme.inkSoft
        }}
      >
        Store is not registered yet. Save the store profile first to configure POS settings and Cashier staff.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, width: "100%", minWidth: 0, boxSizing: "border-box" }}>
      {inlineBanner && (
        <div
          style={{
            padding: "11px 14px",
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 12.5,
            fontWeight: 600,
            background:
              inlineBanner.type === "error"
                ? "rgba(239, 68, 68, 0.12)"
                : "rgba(16, 185, 129, 0.12)",
            color: inlineBanner.type === "error" ? "#EF4444" : "#10B981",
            border:
              inlineBanner.type === "error"
                ? "1px solid rgba(239, 68, 68, 0.3)"
                : "1px solid rgba(16, 185, 129, 0.3)"
          }}
        >
          {inlineBanner.type === "error" ? (
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
          ) : (
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
          )}
          <span style={{ flex: 1 }}>{inlineBanner.text}</span>
        </div>
      )}

      {/* Section 1: POS Tax, Service Charge & Security Rules */}
      <form
        onSubmit={handleSaveConfig}
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 18,
          padding: 18,
          display: "flex",
          flexDirection: "column",
          gap: 14,
          width: "100%",
          minWidth: 0,
          boxSizing: "border-box"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Calculator size={18} color={theme.accent} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: theme.ink }}>
              Tax, Service Charge &amp; POS Security Rules
            </h4>
            <p style={{ margin: 0, fontSize: 11, color: theme.inkSoft }}>
              Applied automatically across POS Cashier terminals for this store
            </p>
          </div>
        </div>

        {/* Tax Toggle & Percent */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            padding: "10px 12px",
            borderRadius: 12,
            background: theme.surface2,
            border: `1px solid ${theme.border}`
          }}
        >
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: theme.ink, cursor: "pointer", flex: 1, minWidth: 0 }}>
            <input
              type="checkbox"
              checked={posConfig.taxEnabled}
              onChange={(e) => setPosConfig((p) => ({ ...p, taxEnabled: e.target.checked }))}
            />
            Enable Tax (VAT / Sales Tax)
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
            <input
              type="number"
              min={0}
              max={100}
              disabled={!posConfig.taxEnabled}
              value={posConfig.taxPercent}
              onChange={(e) =>
                setPosConfig((p) => ({ ...p, taxPercent: Math.min(100, Math.max(0, Number(e.target.value) || 0)) }))
              }
              style={{
                width: 58,
                padding: "5px 8px",
                borderRadius: 8,
                border: `1px solid ${theme.border}`,
                background: theme.surface,
                color: theme.ink,
                fontSize: 13,
                textAlign: "right"
              }}
            />
            <span style={{ fontSize: 12, color: theme.inkSoft }}>%</span>
          </div>
        </div>

        {/* Service Charge Toggle & Percent */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            padding: "10px 12px",
            borderRadius: 12,
            background: theme.surface2,
            border: `1px solid ${theme.border}`
          }}
        >
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: theme.ink, cursor: "pointer", flex: 1, minWidth: 0 }}>
            <input
              type="checkbox"
              checked={posConfig.serviceChargeEnabled}
              onChange={(e) => setPosConfig((p) => ({ ...p, serviceChargeEnabled: e.target.checked }))}
            />
            Enable Service Charge
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
            <input
              type="number"
              min={0}
              max={100}
              disabled={!posConfig.serviceChargeEnabled}
              value={posConfig.serviceChargePercent}
              onChange={(e) =>
                setPosConfig((p) => ({
                  ...p,
                  serviceChargePercent: Math.min(100, Math.max(0, Number(e.target.value) || 0))
                }))
              }
              style={{
                width: 58,
                padding: "5px 8px",
                borderRadius: 8,
                border: `1px solid ${theme.border}`,
                background: theme.surface,
                color: theme.ink,
                fontSize: 13,
                textAlign: "right"
              }}
            />
            <span style={{ fontSize: 12, color: theme.inkSoft }}>%</span>
          </div>
        </div>

        {/* Allow Manual Discount */}
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 12px",
            borderRadius: 12,
            background: theme.surface2,
            border: `1px solid ${theme.border}`,
            fontSize: 13,
            fontWeight: 600,
            color: theme.ink,
            cursor: "pointer"
          }}
        >
          <input
            type="checkbox"
            checked={posConfig.allowManualDiscount}
            onChange={(e) => setPosConfig((p) => ({ ...p, allowManualDiscount: e.target.checked }))}
          />
          Allow Cashiers to Apply Manual Discounts
        </label>

        {/* Allow Open Bill vs Pay First */}
        <label
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            padding: "10px 12px",
            borderRadius: 12,
            background: theme.surface2,
            border: `1px solid ${theme.border}`,
            fontSize: 13,
            fontWeight: 600,
            color: theme.ink,
            cursor: "pointer"
          }}
        >
          <input
            type="checkbox"
            checked={posConfig.allowOpenBill}
            onChange={(e) => setPosConfig((p) => ({ ...p, allowOpenBill: e.target.checked }))}
            style={{ marginTop: 2 }}
          />
          <div>
            <div>Enable Open Bill (Hold Table Tab / Pay Later)</div>
            <div style={{ fontSize: 11, fontWeight: 400, color: theme.inkSoft, marginTop: 2 }}>
              {store?.type === "FOOD"
                ? "If disabled, customers must pay upfront at the register before orders are processed."
                : "If disabled, cashiers must settle payment immediately without holding temporary tabs."}
            </div>
          </div>
        </label>

        {/* Supervisor PIN */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: theme.ink, display: "flex", alignItems: "center", gap: 5 }}>
              <Lock size={13} /> Supervisor Authorization PIN (for Voids)
            </label>
            {posConfig.hasSupervisorPin && (
              <span style={{ fontSize: 11, fontWeight: 600, color: "#10B981" }}>PIN Active</span>
            )}
          </div>
          <input
            type="password"
            inputMode="numeric"
            value={supervisorPinInput}
            onChange={(e) => setSupervisorPinInput(e.target.value)}
            placeholder={posConfig.hasSupervisorPin ? "Enter to change PIN (leave blank to keep)" : "Example: 8888"}
            style={{
              width: "100%",
              padding: "9px 12px",
              borderRadius: 10,
              border: `1px solid ${theme.border}`,
              background: theme.surface2,
              color: theme.ink,
              fontSize: 13,
              outline: "none",
              boxSizing: "border-box"
            }}
          />
        </div>

        <button
          type="submit"
          disabled={isSavingConfig}
          style={{
            padding: "11px 14px",
            borderRadius: 12,
            border: "none",
            background: theme.accent,
            color: "#FFFFFF",
            fontSize: 13,
            fontWeight: 700,
            cursor: isSavingConfig ? "wait" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6
          }}
        >
          <Save size={15} />
          <span>{isSavingConfig ? "Saving..." : "Save POS Settings"}</span>
        </button>
      </form>

      {/* Section 2: POS Cashier Staff Management */}
      <div
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 18,
          padding: 18,
          display: "flex",
          flexDirection: "column",
          gap: 14,
          width: "100%",
          minWidth: 0,
          boxSizing: "border-box"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
            <Users size={18} color={theme.accent} style={{ flexShrink: 0 }} />
            <div style={{ minWidth: 0 }}>
              <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: theme.ink }}>
                POS Cashier Staff ({cashiers.length})
              </h4>
              <p style={{ margin: 0, fontSize: 11, color: theme.inkSoft }}>
                Generate activation codes so staff can operate POS Cashier
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowAddForm((v) => !v)}
            style={{
              padding: "7px 12px",
              borderRadius: 10,
              border: "none",
              background: theme.accent,
              color: "#fff",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 5,
              flexShrink: 0,
              whiteSpace: "nowrap"
            }}
          >
            <Plus size={14} />
            <span>Add</span>
          </button>
        </div>

        {openShifts.length > 0 && (
          <div
            style={{
              padding: "9px 12px",
              borderRadius: 10,
              background: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              fontSize: 12,
              color: "#10B981",
              fontWeight: 600
            }}
          >
            Active Shift: {openShifts.map((s) => `${s.cashierName} (Opening Rp ${s.openingCash.toLocaleString("id-ID")})`).join(", ")}
          </div>
        )}

        {showAddForm && (
          <form
            onSubmit={handleCreateCashier}
            style={{
              background: theme.surface2,
              border: `1px solid ${theme.border}`,
              borderRadius: 14,
              padding: 14,
              display: "flex",
              flexDirection: "column",
              gap: 10,
              width: "100%",
              minWidth: 0,
              boxSizing: "border-box"
            }}
          >
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Cashier Staff Name (required)"
              required
              style={{
                width: "100%",
                minWidth: 0,
                boxSizing: "border-box",
                padding: "9px 12px",
                borderRadius: 9,
                border: `1px solid ${theme.border}`,
                background: theme.surface,
                color: theme.ink,
                fontSize: 13
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input
                type="text"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="WhatsApp No. (optional)"
                style={{
                  width: "100%",
                  minWidth: 0,
                  boxSizing: "border-box",
                  padding: "9px 12px",
                  borderRadius: 9,
                  border: `1px solid ${theme.border}`,
                  background: theme.surface,
                  color: theme.ink,
                  fontSize: 13
                }}
              />
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                required
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="Cashier PIN 4-6 digits (required)"
                style={{
                  width: "100%",
                  minWidth: 0,
                  boxSizing: "border-box",
                  padding: "9px 12px",
                  borderRadius: 9,
                  border: `1px solid ${theme.border}`,
                  background: theme.surface,
                  color: theme.ink,
                  fontSize: 13
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              {(["CASHIER", "SUPERVISOR"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setNewRole(r);
                    if (r === "SUPERVISOR") {
                      setCanVoid(true);
                      setCanDiscount(true);
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: "7px",
                    borderRadius: 8,
                    border: `1px solid ${newRole === r ? theme.accent : theme.border}`,
                    background: newRole === r ? `${theme.accent}18` : theme.surface,
                    color: newRole === r ? theme.accent : theme.inkSoft,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  {r === "SUPERVISOR" ? "Supervisor" : "Cashier"}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, fontSize: 12, color: theme.ink }}>
              <label style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <input type="checkbox" checked={canVoid} onChange={(e) => setCanVoid(e.target.checked)} />
                Can Void
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <input type="checkbox" checked={canDiscount} onChange={(e) => setCanDiscount(e.target.checked)} />
                Can Discount
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <input type="checkbox" checked={canViewReport} onChange={(e) => setCanViewReport(e.target.checked)} />
                View Reports
              </label>
            </div>

            <button
              type="submit"
              disabled={isAddingCashier}
              style={{
                padding: "10px",
                borderRadius: 10,
                border: "none",
                background: theme.accent,
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                cursor: isAddingCashier ? "wait" : "pointer"
              }}
            >
              {isAddingCashier ? "Generating Code..." : "Create Cashier Account & Code"}
            </button>
          </form>
        )}

        {isLoading ? (
          <div style={{ fontSize: 12, color: theme.inkSoft }}>Loading cashier staff list...</div>
        ) : cashiers.length === 0 ? (
          <div style={{ fontSize: 12, color: theme.inkSoft }}>
            No cashier staff registered yet. Click <strong>Add</strong> to create an activation code <strong>KS-XXXXXX</strong>.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {cashiers.map((c) => (
              <div
                key={c.id}
                style={{
                  background: theme.surface2,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 14,
                  padding: 12,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  opacity: c.status === "DISABLED" ? 0.65 : 1
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: theme.ink, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <span>{c.name}</span>
                      <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 6, background: theme.surface, border: `1px solid ${theme.border}`, color: theme.inkSoft }}>
                        {c.role}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: theme.inkSoft, marginTop: 2 }}>
                      Code: <strong style={{ color: theme.accent }}>{c.activationCode}</strong>
                      {c.hasPin ? (
                        <span style={{ color: "#10B981", fontWeight: 600 }}> • PIN Active</span>
                      ) : (
                        <span style={{ color: "#D97706", fontWeight: 600 }}> • No PIN Set</span>
                      )}
                      {c.status === "SHIFT_OPEN" && " • On Shift"}
                      {c.status === "DISABLED" && " • Disabled"}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(c)}
                      title="Copy Code"
                      style={{
                        padding: "6px 8px",
                        borderRadius: 8,
                        border: `1px solid ${theme.border}`,
                        background: theme.surface,
                        color: copiedId === c.id ? "#10B981" : theme.ink,
                        cursor: "pointer"
                      }}
                    >
                      {copiedId === c.id ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleShareWhatsApp(c)}
                      title="Send via WhatsApp"
                      style={{
                        padding: "6px 8px",
                        borderRadius: 8,
                        border: `1px solid ${theme.border}`,
                        background: theme.surface,
                        color: "#10B981",
                        cursor: "pointer"
                      }}
                    >
                      <Share2 size={14} />
                    </button>
                  </div>
                </div>

                {editingPinCashierId === c.id && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      flexWrap: "wrap",
                      background: theme.surface,
                      border: `1px solid ${theme.border}`,
                      borderRadius: 10,
                      padding: 8
                    }}
                  >
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={6}
                      value={editPinValue}
                      onChange={(e) => setEditPinValue(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="New PIN (4-6 digits)"
                      autoFocus
                      style={{
                        flex: 1,
                        minWidth: 130,
                        padding: "6px 10px",
                        borderRadius: 8,
                        border: `1px solid ${theme.border}`,
                        background: theme.surface2,
                        color: theme.ink,
                        fontSize: 12.5,
                        letterSpacing: 2,
                        outline: "none"
                      }}
                    />
                    <button
                      type="button"
                      disabled={isUpdatingPin || !/^\d{4,6}$/.test(editPinValue.trim())}
                      onClick={() => void handleSaveCashierPin(c)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 8,
                        border: "none",
                        background: theme.accent,
                        color: "#fff",
                        fontSize: 11.5,
                        fontWeight: 700,
                        opacity: isUpdatingPin || !/^\d{4,6}$/.test(editPinValue.trim()) ? 0.55 : 1,
                        cursor: isUpdatingPin || !/^\d{4,6}$/.test(editPinValue.trim()) ? "not-allowed" : "pointer"
                      }}
                    >
                      {isUpdatingPin ? "Saving..." : "Save PIN"}
                    </button>
                    <button
                      type="button"
                      disabled={isUpdatingPin}
                      onClick={() => {
                        setEditingPinCashierId(null);
                        setEditPinValue("");
                      }}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 8,
                        border: `1px solid ${theme.border}`,
                        background: theme.surface2,
                        color: theme.inkSoft,
                        fontSize: 11.5,
                        fontWeight: 600,
                        cursor: "pointer"
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, fontSize: 11 }}>
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, color: theme.inkSoft }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, whiteSpace: "nowrap" }}>
                      <Shield size={11} /> Void: {c.permissions.canVoid ? "Yes" : "PIN"}
                    </span>
                    <span style={{ whiteSpace: "nowrap" }}>Discount: {c.permissions.canDiscount ? "Yes" : "No"}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPinCashierId((prev) => (prev === c.id ? null : c.id));
                        setEditPinValue("");
                      }}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: c.hasPin ? theme.ink : "#D97706",
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 3,
                        whiteSpace: "nowrap"
                      }}
                    >
                      <Lock size={11} /> {c.hasPin ? "Change PIN" : "Set PIN"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleResetCode(c)}
                      style={{ background: "transparent", border: "none", color: theme.inkSoft, fontSize: 11, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 3, whiteSpace: "nowrap" }}
                    >
                      <RefreshCw size={11} /> Reset
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleToggleDisable(c)}
                      style={{ background: "transparent", border: "none", color: c.status === "DISABLED" ? "#10B981" : "#F59E0B", fontSize: 11, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
                    >
                      {c.status === "DISABLED" ? "Enable" : "Disable"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleRemoveCashier(c)}
                      style={{ background: "transparent", border: "none", color: "#EF4444", fontSize: 11, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center" }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 3: Closed Shift History & Cash Drawer Variance */}
      <div
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 18,
          padding: 18,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          width: "100%",
          minWidth: 0,
          boxSizing: "border-box"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h4 style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: theme.ink }}>
              Closed Shift History &amp; Drawer Variance
            </h4>
            <p style={{ margin: 0, fontSize: 11, color: theme.inkSoft }}>
              Opening cash, expected system cash vs actual counted cash at shift close
            </p>
          </div>
          <button
            type="button"
            onClick={() => void fetchPosSettings()}
            style={{
              background: theme.surface2,
              border: `1px solid ${theme.border}`,
              color: theme.inkSoft,
              borderRadius: 8,
              padding: "5px 10px",
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              flexShrink: 0,
              whiteSpace: "nowrap"
            }}
          >
            <RefreshCw size={11} /> Reload
          </button>
        </div>

        {closedShifts.length === 0 ? (
          <div
            style={{
              fontSize: 12,
              color: theme.inkSoft,
              textAlign: "center",
              padding: "14px 10px",
              background: theme.surface2,
              borderRadius: 12
            }}
          >
            No closed shift history from POS terminals yet.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 280, overflowY: "auto" }}>
            {closedShifts.slice(0, 20).map((shift) => {
              const variance = Number(shift.cashVariance || 0);
              const isMatch = variance === 0;
              const isShort = variance < 0;
              const openedDate = new Date(shift.openedAt);
              const closedDate = new Date(shift.closedAt || shift.openedAt);
              const fmtTime = (d: Date) =>
                d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
              const fmtDay = closedDate.toLocaleDateString("en-US", {
                day: "numeric",
                month: "short"
              });

              return (
                <div
                  key={shift.id}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 12,
                    background: theme.surface2,
                    border: `1px solid ${
                      isShort
                        ? "rgba(239, 68, 68, 0.3)"
                        : !isMatch
                          ? "rgba(245, 158, 11, 0.3)"
                          : theme.border
                    }`,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: theme.ink }}>
                        {shift.cashierName}
                      </span>
                      <span style={{ fontSize: 11, color: theme.inkSoft, marginLeft: 8 }}>
                        {fmtDay}, {fmtTime(openedDate)} - {fmtTime(closedDate)}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        padding: "3px 8px",
                        borderRadius: 999,
                        background: isMatch
                          ? "rgba(16, 185, 129, 0.14)"
                          : isShort
                            ? "rgba(239, 68, 68, 0.14)"
                            : "rgba(245, 158, 11, 0.16)",
                        color: isMatch ? "#10B981" : isShort ? "#EF4444" : "#D97706"
                      }}
                    >
                      {isMatch
                        ? "Drawer Matched"
                        : isShort
                          ? `Short -Rp ${Math.abs(variance).toLocaleString("id-ID")}`
                          : `Over +Rp ${variance.toLocaleString("id-ID")}`}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                      gap: 8,
                      fontSize: 11
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ color: theme.inkSoft }}>Opening Cash</div>
                      <div style={{ fontWeight: 700, color: theme.ink }}>
                        Rp {(shift.openingCash || 0).toLocaleString("id-ID")}
                      </div>
                      {(shift.cashIn > 0 || shift.cashOut > 0) && (
                        <div style={{ fontSize: 10, color: theme.inkSoft }}>
                          {shift.cashIn > 0 ? `+${shift.cashIn.toLocaleString("id-ID")} ` : ""}
                          {shift.cashOut > 0 ? `-${shift.cashOut.toLocaleString("id-ID")}` : ""}
                        </div>
                      )}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ color: theme.inkSoft }}>System Cash</div>
                      <div style={{ fontWeight: 700, color: theme.ink }}>
                        Rp {(shift.expectedCash ?? 0).toLocaleString("id-ID")}
                      </div>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ color: theme.inkSoft }}>Actual Cash</div>
                      <div style={{ fontWeight: 700, color: theme.ink }}>
                        Rp {(shift.actualCash ?? 0).toLocaleString("id-ID")}
                      </div>
                    </div>
                  </div>

                  {shift.notes && (
                    <div style={{ fontSize: 11, color: theme.inkSoft, fontStyle: "italic" }}>
                      Notes: &ldquo;{shift.notes}&rdquo;
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 4: Open Bill Audit Log (Table Moves & Unpaid Cancellations) */}
      <div
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 18,
          padding: 18,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          width: "100%",
          minWidth: 0,
          boxSizing: "border-box"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h4 style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: theme.ink }}>
              Table Open Bill Audit Log
            </h4>
            <p style={{ margin: 0, fontSize: 11, color: theme.inkSoft }}>
              Audit trail for table transfers &amp; unpaid bill cancellations
            </p>
          </div>
          <button
            type="button"
            onClick={() => void fetchPosSettings()}
            style={{
              background: theme.surface2,
              border: `1px solid ${theme.border}`,
              color: theme.inkSoft,
              borderRadius: 8,
              padding: "5px 10px",
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              flexShrink: 0,
              whiteSpace: "nowrap"
            }}
          >
            <RefreshCw size={11} /> Reload
          </button>
        </div>

        {billAuditLogs.length === 0 ? (
          <div
            style={{
              fontSize: 12,
              color: theme.inkSoft,
              textAlign: "center",
              padding: "14px 10px",
              background: theme.surface2,
              borderRadius: 12
            }}
          >
            No table transfer or open bill cancellation logs yet.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 240, overflowY: "auto" }}>
            {billAuditLogs.slice(0, 20).map((log) => {
              const isCancelled = log.action === "CANCELLED";
              return (
                <div
                  key={log.id}
                  style={{
                    padding: "9px 12px",
                    borderRadius: 10,
                    background: theme.surface2,
                    border: `1px solid ${isCancelled ? "rgba(239, 68, 68, 0.25)" : theme.border}`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 10
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: 999,
                          background: isCancelled ? "rgba(239, 68, 68, 0.14)" : `${theme.accent}18`,
                          color: isCancelled ? "#EF4444" : theme.accent
                        }}
                      >
                        {isCancelled ? "CANCEL BILL" : "MOVE TABLE"}
                      </span>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: theme.ink }}>
                        {log.label}
                      </span>
                      <span style={{ fontSize: 11, color: theme.inkSoft }}>
                        ({log.itemCount} items • Rp {(log.totalAmount || 0).toLocaleString("id-ID")})
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: theme.inkSoft, marginTop: 2 }}>
                      By <strong style={{ color: theme.ink }}>{log.actorName}</strong>
                      {log.detail ? ` • ${log.detail}` : ""}
                    </div>
                  </div>
                  <div style={{ fontSize: 10.5, color: theme.inkSoft, whiteSpace: "nowrap" }}>
                    {new Date(log.createdAt).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
