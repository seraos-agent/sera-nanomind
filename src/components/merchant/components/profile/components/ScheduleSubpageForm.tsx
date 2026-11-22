import React, { useState, useEffect } from "react";
import { Check, Clock } from "lucide-react";
import type { ThemeType } from "../../../../../theme";
import {
  ALL_DAYS,
  formatScheduleString,
  formatTimeInput,
  getStoreEntityLabel,
  sanitizeTimeOnBlur,
  type StoreType
} from "../../../types";
import { CustomSelectField } from "./CustomSelectField";

export interface ScheduleSubpageFormProps {
  theme: ThemeType;
  isMobileView?: boolean;
  storeType?: StoreType;
  editOpenDays: string[];
  setEditOpenDays: (v: string[]) => void;
  editIs24Hours: boolean;
  setEditIs24Hours: (v: boolean) => void;
  editOpenTime: string;
  setEditOpenTime: (v: string) => void;
  editCloseTime: string;
  setEditCloseTime: (v: string) => void;
  editDailyCustomHours?: Record<string, { openTime: string; closeTime: string }>;
  setEditDailyCustomHours?: (v: Record<string, { openTime: string; closeTime: string }>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const ScheduleSubpageForm: React.FC<ScheduleSubpageFormProps> = ({
  theme,
  isMobileView,
  storeType,
  editOpenDays,
  setEditOpenDays,
  editIs24Hours,
  setEditIs24Hours,
  editOpenTime,
  setEditOpenTime,
  editCloseTime,
  setEditCloseTime,
  editDailyCustomHours = {},
  setEditDailyCustomHours,
  onSubmit
}) => {
  const entity = getStoreEntityLabel(storeType);
  const getInitialSchedulePreset = (days: string[]) => {
    if (days && days.length === 7) return "EVERYDAY";
    if (days && days.length === 6 && !days.includes("MINGGU")) return "MON_TO_SAT";
    if (days && days.length === 5 && !days.includes("SABTU") && !days.includes("MINGGU")) return "WEEKDAYS";
    return "CUSTOM";
  };

  const [schedulePresetMode, setSchedulePresetMode] = useState<string>(() =>
    getInitialSchedulePreset(editOpenDays)
  );

  useEffect(() => {
    setSchedulePresetMode(getInitialSchedulePreset(editOpenDays));
  }, [editOpenDays]);

  const handleSchedulePresetChange = (newMode: string) => {
    setSchedulePresetMode(newMode);
    if (newMode === "EVERYDAY") {
      setEditOpenDays(["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU", "MINGGU"]);
    } else if (newMode === "MON_TO_SAT") {
      setEditOpenDays(["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU"]);
    } else if (newMode === "WEEKDAYS") {
      setEditOpenDays(["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT"]);
    }
  };

  const [isCustomDailyHours, setIsCustomDailyHours] = useState(
    () => Object.keys(editDailyCustomHours || {}).length > 0
  );

  const handleToggleCustomDailyHours = () => {
    const nextVal = !isCustomDailyHours;
    setIsCustomDailyHours(nextVal);
    if (!nextVal) {
      setEditDailyCustomHours?.({});
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* 1. KARTU HARI OPERASIONAL */}
      <div
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 20,
          padding: isMobileView ? "20px 16px" : "24px 22px",
          display: "flex",
          flexDirection: "column",
          gap: 16
        }}
      >
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: theme.ink }}>
            Hari Operasional
          </div>
          <div style={{ fontSize: 12.5, color: theme.inkSoft, marginTop: 2 }}>
            Tentukan hari toko Anda aktif dan melayani pesanan
          </div>
        </div>

        {/* Dropdown Pola Hari Buka */}
        <CustomSelectField
          label="Pilihan Hari Buka"
          value={schedulePresetMode}
          options={[
            {
              value: "EVERYDAY",
              label: "Setiap Hari (Senin – Minggu)",
              subtitle: "Toko buka setiap hari penuh tanpa libur"
            },
            {
              value: "MON_TO_SAT",
              label: "Senin – Sabtu",
              subtitle: "Buka 6 hari dalam seminggu (Minggu libur)"
            },
            {
              value: "WEEKDAYS",
              label: "Senin – Jumat",
              subtitle: "Hari kerja reguler (Sabtu & Minggu libur)"
            },
            {
              value: "CUSTOM",
              label: "Kustom / Hari Tertentu",
              subtitle: "Pilih kombinasi hari buka secara manual"
            }
          ]}
          onChange={handleSchedulePresetChange}
          theme={theme}
          isMobileView={isMobileView}
        />

        {/* Preset Summary Info Banner */}
        {schedulePresetMode !== "CUSTOM" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 14px",
              background: theme.surface2,
              borderRadius: 14,
              border: `1px solid ${theme.border}`
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: "rgba(16, 185, 129, 0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}
            >
              <Check size={16} color="#10B981" />
            </div>
            <div style={{ fontSize: 12.5, color: theme.inkSoft, lineHeight: 1.4 }}>
              {schedulePresetMode === "EVERYDAY" && `${entity} beroperasi penuh setiap hari dari Senin hingga Minggu.`}
              {schedulePresetMode === "MON_TO_SAT" && `${entity} aktif Senin hingga Sabtu, hari Minggu otomatis libur.`}
              {schedulePresetMode === "WEEKDAYS" && `${entity} aktif pada hari kerja, akhir pekan (Sabtu & Minggu) libur.`}
            </div>
          </div>
        )}

        {/* Day Checkboxes for CUSTOM mode */}
        {schedulePresetMode === "CUSTOM" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: theme.inkSoft }}>
              Pilih Hari Aktif {entity}:
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobileView ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
                gap: 8
              }}
            >
              {ALL_DAYS.map((day) => {
                const isSelected = editOpenDays.includes(day.id);
                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setEditOpenDays(editOpenDays.filter((d) => d !== day.id));
                      } else {
                        setEditOpenDays([...editOpenDays, day.id]);
                      }
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "11px 14px",
                      borderRadius: 14,
                      background: isSelected ? (theme.isDark ? "#2A2A2A" : "#F4F4F5") : theme.surface2,
                      border: `1.5px solid ${isSelected ? theme.ink : theme.border}`,
                      color: theme.ink,
                      fontSize: 13,
                      fontWeight: isSelected ? 600 : 500,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      userSelect: "none"
                    }}
                  >
                    <span>{day.full}</span>
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 6,
                        background: isSelected ? theme.ink : "transparent",
                        border: `1.5px solid ${isSelected ? theme.ink : theme.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.15s ease"
                      }}
                    >
                      {isSelected && <Check size={13} color={theme.bg} strokeWidth={3} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 2. KARTU JAM OPERASIONAL & 24 JAM */}
      <div
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 20,
          padding: isMobileView ? "20px 16px" : "24px 22px",
          display: "flex",
          flexDirection: "column",
          gap: 18
        }}
      >
        {/* 24-Hours Toggle Switch */}
        <div
          onClick={() => setEditIs24Hours(!editIs24Hours)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
            userSelect: "none"
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1, paddingRight: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: theme.ink }}>
              Buka 24 Jam Non-Stop
            </div>
            <div style={{ fontSize: 12.5, color: theme.inkSoft, lineHeight: 1.35 }}>
              {editIs24Hours
                ? `${entity} aktif menerima pesanan sepanjang hari 24 jam`
                : `${entity} buka sesuai jam operasional harian di bawah`}
            </div>
          </div>

          <div
            style={{
              width: 50,
              height: 28,
              borderRadius: 14,
              background: editIs24Hours ? (theme.isDark ? "#10B981" : theme.ink) : theme.border,
              position: "relative",
              transition: "background 0.2s ease",
              flexShrink: 0
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: "#FFFFFF",
                position: "absolute",
                top: 3,
                left: 3,
                transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                transform: editIs24Hours ? "translateX(22px)" : "translateX(0)",
                boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)"
              }}
            />
          </div>
        </div>

        {!editIs24Hours && (
          <>
            <div style={{ height: 1, background: theme.border }} />

            {/* Quick Hour Presets */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: theme.inkSoft, marginBottom: 8 }}>
                Pilihan Jam Cepat:
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8
                }}
              >
                {[
                  { open: "08:00", close: "21:00", label: "08:00 – 21:00" },
                  { open: "09:00", close: "22:00", label: "09:00 – 22:00" },
                  { open: "07:00", close: "20:00", label: "07:00 – 20:00" },
                  { open: "10:00", close: "22:00", label: "10:00 – 22:00" }
                ].map((preset) => {
                  const isMatch = editOpenTime === preset.open && editCloseTime === preset.close;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setEditOpenTime(preset.open);
                        setEditCloseTime(preset.close);
                      }}
                      style={{
                        padding: "9px 12px",
                        borderRadius: 14,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        textAlign: "center",
                        background: isMatch ? theme.ink : theme.surface2,
                        color: isMatch ? theme.bg : theme.inkSoft,
                        border: `1px solid ${isMatch ? theme.ink : theme.border}`,
                        transition: "all 0.15s ease"
                      }}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Jam Buka & Jam Tutup Input Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
                alignItems: "stretch"
              }}
            >
              {/* Jam Buka Card */}
              <div
                style={{
                  background: theme.surface2,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 16,
                  padding: "12px 14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 600, color: theme.inkSoft }}>
                  Jam Buka
                </div>
                <input
                  type="text"
                  value={editOpenTime}
                  maxLength={5}
                  onChange={(e) => setEditOpenTime(formatTimeInput(e.target.value))}
                  onBlur={() => setEditOpenTime(sanitizeTimeOnBlur(editOpenTime, "08:00"))}
                  placeholder="08:00"
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: "none",
                    color: theme.ink,
                    fontSize: 20,
                    fontWeight: 800,
                    letterSpacing: "0.5px",
                    fontFamily: "monospace, Inter, sans-serif",
                    outline: "none",
                    padding: 0,
                    boxSizing: "border-box"
                  }}
                />
              </div>

              {/* Jam Tutup Card */}
              <div
                style={{
                  background: theme.surface2,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 16,
                  padding: "12px 14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 600, color: theme.inkSoft }}>
                  Jam Tutup
                </div>
                <input
                  type="text"
                  value={editCloseTime}
                  maxLength={5}
                  onChange={(e) => setEditCloseTime(formatTimeInput(e.target.value))}
                  onBlur={() => setEditCloseTime(sanitizeTimeOnBlur(editCloseTime, "21:00"))}
                  placeholder="21:00"
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: "none",
                    color: theme.ink,
                    fontSize: 20,
                    fontWeight: 800,
                    letterSpacing: "0.5px",
                    fontFamily: "monospace, Inter, sans-serif",
                    outline: "none",
                    padding: 0,
                    boxSizing: "border-box"
                  }}
                />
              </div>
            </div>

            {/* Daily Custom Hours Section */}
            <div
              style={{
                paddingTop: 14,
                borderTop: `1px dashed ${theme.border}`,
                display: "flex",
                flexDirection: "column",
                gap: 12
              }}
            >
              <div
                onClick={handleToggleCustomDailyHours}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  userSelect: "none"
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1, paddingRight: 12 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: theme.ink }}>
                    Atur Jam Berbeda per Hari
                  </div>
                  <div style={{ fontSize: 12, color: theme.inkSoft, lineHeight: 1.35 }}>
                    Atur jika ada hari yang buka setengah hari (misal Minggu) atau berbeda jam
                  </div>
                </div>

                <div
                  style={{
                    width: 50,
                    height: 30,
                    borderRadius: 20,
                    background: isCustomDailyHours ? theme.ink : theme.surface2,
                    border: `1.5px solid ${isCustomDailyHours ? theme.ink : theme.border}`,
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
                      background: isCustomDailyHours ? theme.bg : theme.inkSoft,
                      position: "absolute",
                      top: 3,
                      left: 3,
                      transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                      transform: isCustomDailyHours ? "translateX(20px)" : "translateX(0)",
                      boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)"
                    }}
                  />
                </div>
              </div>

              {isCustomDailyHours && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
                  {ALL_DAYS.filter((d) => editOpenDays.includes(d.id)).map((day) => {
                    const dayHours = editDailyCustomHours?.[day.id] || {
                      openTime: editOpenTime || "08:00",
                      closeTime: editCloseTime || "21:00"
                    };

                    return (
                      <div
                        key={day.id}
                        style={{
                          padding: "10px 14px",
                          borderRadius: 14,
                          background: theme.surface2,
                          border: `1px solid ${theme.border}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 10
                        }}
                      >
                        <span style={{ fontSize: 13.5, fontWeight: 700, color: theme.ink }}>
                          {day.full}
                        </span>

                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <input
                            type="text"
                            value={dayHours.openTime}
                            maxLength={5}
                            onChange={(e) => {
                              setEditDailyCustomHours?.({
                                ...editDailyCustomHours,
                                [day.id]: {
                                  ...dayHours,
                                  openTime: formatTimeInput(e.target.value)
                                }
                              });
                            }}
                            onBlur={() => {
                              setEditDailyCustomHours?.({
                                ...editDailyCustomHours,
                                [day.id]: {
                                  ...dayHours,
                                  openTime: sanitizeTimeOnBlur(dayHours.openTime, editOpenTime || "08:00")
                                }
                              });
                            }}
                            style={{
                              width: 65,
                              height: 36,
                              borderRadius: 8,
                              border: `1px solid ${theme.border}`,
                              background: theme.surface,
                              color: theme.ink,
                              fontSize: 13,
                              fontWeight: 700,
                              textAlign: "center",
                              fontFamily: "monospace, Inter, sans-serif",
                              outline: "none",
                              boxSizing: "border-box"
                            }}
                          />
                          <span style={{ fontSize: 12, color: theme.inkSoft, fontWeight: 500 }}>s/d</span>
                          <input
                            type="text"
                            value={dayHours.closeTime}
                            maxLength={5}
                            onChange={(e) => {
                              setEditDailyCustomHours?.({
                                ...editDailyCustomHours,
                                [day.id]: {
                                  ...dayHours,
                                  closeTime: formatTimeInput(e.target.value)
                                }
                              });
                            }}
                            onBlur={() => {
                              setEditDailyCustomHours?.({
                                ...editDailyCustomHours,
                                [day.id]: {
                                  ...dayHours,
                                  closeTime: sanitizeTimeOnBlur(dayHours.closeTime, editCloseTime || "21:00")
                                }
                              });
                            }}
                            style={{
                              width: 65,
                              height: 36,
                              borderRadius: 8,
                              border: `1px solid ${theme.border}`,
                              background: theme.surface,
                              color: theme.ink,
                              fontSize: 13,
                              fontWeight: 700,
                              textAlign: "center",
                              fontFamily: "monospace, Inter, sans-serif",
                              outline: "none",
                              boxSizing: "border-box"
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* 3. KARTU PREVIEW JADWAL */}
      <div
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 16,
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          gap: 12
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: editOpenDays.length > 0 ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0
          }}
        >
          <Clock size={18} color={editOpenDays.length > 0 ? "#10B981" : "#EF4444"} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11.5, color: theme.inkSoft }}>
            Format Jadwal yang Tampil di Marketplace:
          </div>
          <div
            style={{
              fontSize: 13.5,
              fontWeight: 700,
              color: theme.ink,
              marginTop: 2,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}
          >
            {formatScheduleString(
              editOpenDays,
              editOpenTime || "08:00",
              editCloseTime || "21:00",
              editIs24Hours,
              editDailyCustomHours
            )}
          </div>
        </div>
      </div>

      <button
        type="submit"
        style={{
          padding: "13px 28px",
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
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.opacity = "0.85";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.opacity = "1";
        }}
      >
        <span>Simpan Jadwal Operasional</span>
      </button>
    </form>
  );
};

