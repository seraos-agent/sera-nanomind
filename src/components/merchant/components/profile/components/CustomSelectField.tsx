import { useState, useEffect } from "react";
import { ChevronDown, Check, X } from "lucide-react";
import type { ThemeType } from "../../../../../theme";
import { registerBackHandler } from "../../../../../utils/backButton";

export interface CustomSelectOption {
  value: string;
  label: string;
  subtitle?: string;
}

export interface CustomSelectFieldProps {
  label: string;
  value: string;
  options: CustomSelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  theme: ThemeType;
  isMobileView?: boolean;
}

export function CustomSelectField({
  label,
  value,
  options,
  onChange,
  placeholder = "Pilih...",
  theme,
  isMobileView
}: CustomSelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((o) => o.value === value);

  // Close with Android back button on mobile if open
  useEffect(() => {
    if (!isOpen || !isMobileView) return;
    return registerBackHandler("custom_select_sheet", 95, () => {
      setIsOpen(false);
      return true;
    });
  }, [isOpen, isMobileView]);

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <label
        style={{
          display: "block",
          fontSize: 13,
          fontWeight: 600,
          color: theme.ink,
          marginBottom: 8
        }}
      >
        {label}
      </label>

      {/* Trigger Button - Matches height & rounded design of text inputs */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%",
          height: 48,
          padding: "0 16px",
          borderRadius: 14,
          border: `1px solid ${isOpen ? theme.accent : theme.border}`,
          background: theme.surface2,
          color: selectedOption ? theme.ink : theme.inkSoft,
          fontSize: 14,
          fontWeight: 500,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          outline: "none",
          transition: "all 0.15s ease",
          boxSizing: "border-box",
          gap: 10
        }}
      >
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flex: 1,
            textAlign: "left"
          }}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={18}
          color={isOpen ? theme.accent : theme.inkSoft}
          style={{
            flexShrink: 0,
            transition: "transform 0.2s ease",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)"
          }}
        />
      </button>

      {/* Open State: Modern Rounded Bottom Sheet (Mobile) or Rounded Popover (Desktop) */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setIsOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: isMobileView ? "rgba(0, 0, 0, 0.45)" : "transparent",
              backdropFilter: isMobileView ? "blur(3px)" : "none",
              zIndex: 9998
            }}
          />

          {isMobileView ? (
            /* Modern Mobile Rounded Bottom Sheet */
            <div
              style={{
                position: "fixed",
                left: 0,
                right: 0,
                bottom: 0,
                background: theme.surface,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                border: `1px solid ${theme.border}`,
                borderBottom: "none",
                boxShadow: "0 -12px 40px rgba(0, 0, 0, 0.2)",
                zIndex: 9999,
                maxHeight: "75vh",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden"
              }}
            >
              {/* Drag Handle Indicator */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  paddingTop: 10,
                  paddingBottom: 6
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 4.5,
                    borderRadius: 3,
                    background: theme.border
                  }}
                />
              </div>

              {/* Sheet Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 20px 14px",
                  borderBottom: `1px solid ${theme.border}`
                }}
              >
                <span
                  style={{ fontSize: 16, fontWeight: 700, color: theme.ink }}
                >
                  Pilih {label}
                </span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  style={{
                    background: theme.surface2,
                    border: "none",
                    borderRadius: "50%",
                    width: 28,
                    height: 28,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: theme.inkSoft,
                    cursor: "pointer"
                  }}
                >
                  <X size={15} />
                </button>
              </div>

              {/* Options Scrollable List */}
              <div
                style={{
                  padding: "12px 16px 28px",
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  maxHeight: "calc(75vh - 70px)"
                }}
              >
                {options.map((opt) => {
                  const isSelected = opt.value === value;
                  return (
                    <div
                      key={opt.value}
                      onClick={() => {
                        onChange(opt.value);
                        setIsOpen(false);
                      }}
                      style={{
                        padding: "13px 16px",
                        borderRadius: 14,
                        border: `1px solid ${
                          isSelected ? theme.accent : theme.border
                        }`,
                        background: isSelected
                          ? theme.accentSoft
                          : theme.surface,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        gap: 12
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 3,
                          flex: 1,
                          minWidth: 0
                        }}
                      >
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: isSelected ? 700 : 500,
                            color: isSelected
                              ? theme.isDark
                                ? "#FFFFFF"
                                : theme.accent
                              : theme.ink
                          }}
                        >
                          {opt.label}
                        </span>
                        {opt.subtitle && (
                          <span
                            style={{
                              fontSize: 12,
                              color: theme.inkSoft,
                              lineHeight: 1.3
                            }}
                          >
                            {opt.subtitle}
                          </span>
                        )}
                      </div>
                      {isSelected && (
                        <div
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: "50%",
                            background: theme.accent,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0
                          }}
                        >
                          <Check size={13} color="#FFFFFF" strokeWidth={2.8} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Desktop Rounded Floating Popover */
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                left: 0,
                right: 0,
                background: theme.surface,
                borderRadius: 16,
                border: `1px solid ${theme.border}`,
                boxShadow: "0 12px 32px rgba(0, 0, 0, 0.14)",
                zIndex: 9999,
                padding: 6,
                maxHeight: 280,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 4,
                boxSizing: "border-box"
              }}
            >
              {options.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <div
                    key={opt.value}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 10,
                      background: isSelected ? theme.accentSoft : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      transition: "background 0.12s ease",
                      gap: 10
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected)
                        (e.currentTarget as HTMLElement).style.background =
                          theme.surface2;
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected)
                        (e.currentTarget as HTMLElement).style.background =
                          "transparent";
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        flex: 1,
                        minWidth: 0
                      }}
                    >
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: isSelected ? 600 : 500,
                          color: isSelected
                            ? theme.isDark
                              ? "#FFFFFF"
                              : theme.accent
                            : theme.ink
                        }}
                      >
                        {opt.label}
                      </span>
                      {opt.subtitle && (
                        <span style={{ fontSize: 11, color: theme.inkSoft }}>
                          {opt.subtitle}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <Check size={16} color={theme.accent} strokeWidth={2.4} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

