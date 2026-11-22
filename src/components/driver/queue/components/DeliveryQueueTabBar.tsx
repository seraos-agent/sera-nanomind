import type { ThemeType } from "../../../../theme";

interface DeliveryQueueTabBarProps {
  theme: ThemeType;
  isMobileView?: boolean;
  queueTab: "ACTIVE" | "COMPLETED" | "PROFILE";
  pendingCount: number;
  completedCount: number;
  onSelectTab: (tab: "ACTIVE" | "COMPLETED" | "PROFILE") => void;
}

export function DeliveryQueueTabBar({
  theme,
  isMobileView,
  queueTab,
  pendingCount,
  completedCount,
  onSelectTab
}: DeliveryQueueTabBarProps) {
  return (
    <div
      style={{
        flexShrink: 0,
        width: "100%",
        boxSizing: "border-box",
        padding: isMobileView ? "8px 12px" : "10px 20px",
        background: theme.surface,
        borderBottom: `1px solid ${theme.border}`,
        display: "flex",
        justifyContent: "center"
      }}
    >
      <div
        style={{
          maxWidth: 760,
          width: "100%",
          display: "flex",
          alignItems: "center",
          background: theme.surface2,
          borderRadius: 9999,
          padding: "3px",
          border: `1px solid ${theme.border}`,
          boxSizing: "border-box"
        }}
      >
        <button
          type="button"
          onClick={() => onSelectTab("ACTIVE")}
          style={{
            flex: 1,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
            padding: isMobileView ? "6px 4px" : "7px 12px",
            borderRadius: 9999,
            border: "none",
            background: queueTab === "ACTIVE" ? theme.surface : "transparent",
            color: queueTab === "ACTIVE" ? theme.ink : theme.inkSoft,
            fontWeight: queueTab === "ACTIVE" ? 700 : 500,
            fontSize: isMobileView ? "0.78rem" : "0.82rem",
            cursor: "pointer",
            whiteSpace: "nowrap",
            boxShadow: queueTab === "ACTIVE" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            transition: "all 0.18s ease"
          }}
        >
          <span>To Deliver</span>
          {pendingCount > 0 && (
            <span
              style={{
                fontSize: "0.68rem",
                fontWeight: 800,
                padding: "1px 6px",
                borderRadius: 9999,
                background: queueTab === "ACTIVE" ? theme.surface2 : "rgba(0,0,0,0.05)",
                color: queueTab === "ACTIVE" ? theme.ink : theme.inkSoft,
                lineHeight: 1.4
              }}
            >
              {pendingCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => onSelectTab("COMPLETED")}
          style={{
            flex: 1,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
            padding: isMobileView ? "6px 4px" : "7px 12px",
            borderRadius: 9999,
            border: "none",
            background: queueTab === "COMPLETED" ? theme.surface : "transparent",
            color: queueTab === "COMPLETED" ? theme.ink : theme.inkSoft,
            fontWeight: queueTab === "COMPLETED" ? 700 : 500,
            fontSize: isMobileView ? "0.78rem" : "0.82rem",
            cursor: "pointer",
            whiteSpace: "nowrap",
            boxShadow: queueTab === "COMPLETED" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            transition: "all 0.18s ease"
          }}
        >
          <span>Completed</span>
          {completedCount > 0 && (
            <span
              style={{
                fontSize: "0.68rem",
                fontWeight: 800,
                padding: "1px 6px",
                borderRadius: 9999,
                background: queueTab === "COMPLETED" ? theme.surface2 : "rgba(0,0,0,0.05)",
                color: queueTab === "COMPLETED" ? theme.ink : theme.inkSoft,
                lineHeight: 1.4
              }}
            >
              {completedCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => onSelectTab("PROFILE")}
          style={{
            flex: 1,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: isMobileView ? "6px 4px" : "7px 12px",
            borderRadius: 9999,
            border: "none",
            background: queueTab === "PROFILE" ? theme.surface : "transparent",
            color: queueTab === "PROFILE" ? theme.ink : theme.inkSoft,
            fontWeight: queueTab === "PROFILE" ? 700 : 500,
            fontSize: isMobileView ? "0.78rem" : "0.82rem",
            cursor: "pointer",
            whiteSpace: "nowrap",
            boxShadow: queueTab === "PROFILE" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            transition: "all 0.18s ease"
          }}
        >
          <span>Profile</span>
        </button>
      </div>
    </div>
  );
}
