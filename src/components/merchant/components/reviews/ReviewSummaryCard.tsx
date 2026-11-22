import { Star } from "lucide-react";
import type { ThemeType } from "../../../../theme";

interface ReviewSummaryCardProps {
  theme: ThemeType;
  isMobileView?: boolean;
  averageRating: string;
  totalReviews: number;
  unrepliedCount: number;
  withPhotosCount: number;
  starCounts: Record<number, number>;
  selectedFilter: string;
  onSelectFilter: (filter: string) => void;
}

export function ReviewSummaryCard({
  theme,
  isMobileView,
  averageRating,
  totalReviews,
  unrepliedCount,
  withPhotosCount,
  starCounts,
  selectedFilter,
  onSelectFilter
}: ReviewSummaryCardProps) {
  return (
    <div
      style={{
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderRadius: 14,
        padding: isMobileView ? "14px 14px" : "16px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
      }}
    >
      {/* Top Row: Rating Metric & Unreplied Action Filter */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 10
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: theme.ink, lineHeight: 1 }}>
            {averageRating}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Star size={15} color="#EAB308" fill="#EAB308" />
          </div>
          <span style={{ fontSize: 12, color: theme.inkFaint }}>/ 5.0</span>
        </div>

        <button
          onClick={() => onSelectFilter(selectedFilter === "UNREPLIED" ? "ALL" : "UNREPLIED")}
          style={{
            background: theme.surface,
            border: `1.5px solid ${selectedFilter === "UNREPLIED" ? theme.ink : theme.border}`,
            borderRadius: 20,
            padding: "5px 14px",
            fontSize: 12,
            fontWeight: selectedFilter === "UNREPLIED" ? 600 : 500,
            color: selectedFilter === "UNREPLIED" ? theme.ink : theme.inkSoft,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            transition: "all 0.15s ease",
            boxShadow: selectedFilter === "UNREPLIED" ? "0 1px 3px rgba(0,0,0,0.06)" : "0 1px 2px rgba(0,0,0,0.02)"
          }}
        >
          {unrepliedCount > 0 && (
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#EF4444"
              }}
            />
          )}
          <span>Belum Dibalas ({unrepliedCount})</span>
        </button>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: theme.border, width: "100%" }} />

      {/* Bottom Row: Wrapped Filter Pills */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 6
        }}
      >
        {[
          {
            id: "ALL",
            label: `Semua (${totalReviews})`
          },
          ...(withPhotosCount > 0 ? [{ id: "WITH_PHOTOS", label: `Dengan Foto (${withPhotosCount})` }] : []),
          { id: "STAR_5", star: 5, count: starCounts[5] || 0 },
          { id: "STAR_4", star: 4, count: starCounts[4] || 0 },
          { id: "STAR_3", star: 3, count: starCounts[3] || 0 },
          { id: "STAR_2", star: 2, count: starCounts[2] || 0 },
          { id: "STAR_1", star: 1, count: starCounts[1] || 0 }
        ].map((tab) => {
          const isActive = selectedFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectFilter(tab.id)}
              style={{
                background: theme.surface,
                color: isActive ? theme.ink : theme.inkSoft,
                border: `1.5px solid ${isActive ? theme.ink : theme.border}`,
                boxShadow: isActive ? "0 1px 3px rgba(0,0,0,0.06)" : "0 1px 2px rgba(0,0,0,0.02)",
                padding: "5px 12px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: isActive ? 600 : 400,
                cursor: "pointer",
                whiteSpace: "nowrap",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                transition: "all 0.15s ease"
              }}
            >
              {tab.star ? (
                <>
                  <span>{tab.star}</span>
                  <Star size={12} color="#EAB308" fill="#EAB308" />
                  <span>({tab.count})</span>
                </>
              ) : (
                <span>{tab.label}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
