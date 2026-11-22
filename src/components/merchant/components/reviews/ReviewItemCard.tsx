import { Star, Send, CornerDownRight, Edit3 } from "lucide-react";
import type { ThemeType } from "../../../../theme";
import type { MerchantStore, MerchantReview } from "../../types";

const QUICK_TEMPLATES = [
  "Thank you for your order! We hope you love it!",
  "Thank you so much for the 5-star review! We appreciate your support.",
  "Thank you for your feedback! We will review and continue improving."
];

function formatRelativeTime(timestamp: number): string {
  try {
    const diffMs = Date.now() - timestamp;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(timestamp).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  } catch {
    return "Just now";
  }
}

interface ReviewItemCardProps {
  review: MerchantReview;
  store: MerchantStore | null;
  theme: ThemeType;
  isMobileView?: boolean;
  isReplying: boolean;
  replyText: string;
  submittingReply: boolean;
  onChangeReplyText: (text: string) => void;
  onStartReply: (review: MerchantReview) => void;
  onCancelReply: () => void;
  onSubmitReply: (reviewId: string) => void;
  onOpenPhotoModal: (photoUrl: string) => void;
}

export function ReviewItemCard({
  review: rev,
  store,
  theme,
  isMobileView,
  isReplying,
  replyText,
  submittingReply,
  onChangeReplyText,
  onStartReply,
  onCancelReply,
  onSubmitReply,
  onOpenPhotoModal
}: ReviewItemCardProps) {
  return (
    <div
      style={{
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderRadius: 12,
        padding: isMobileView ? "14px 14px" : "16px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 10
      }}
    >
      {/* Header: Customer Name & Star Rating */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: theme.surface2,
              color: theme.ink,
              fontSize: 12,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              border: `1px solid ${theme.border}`
            }}
          >
            {(rev.customerName || "U").charAt(0).toUpperCase()}
          </div>

          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: theme.ink }}>
              {rev.customerName}
            </span>
            <span style={{ fontSize: 11, color: theme.inkFaint }}>
              {formatRelativeTime(rev.createdAt)}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          {[1, 2, 3, 4, 5].map((st) => (
            <Star
              key={st}
              size={12}
              color="#EAB308"
              fill={st <= Math.round(rev.rating) ? "#EAB308" : "none"}
            />
          ))}
        </div>
      </div>

      {/* Product / Variant Info */}
      {(rev.itemName || rev.variant) && (
        <div
          style={{
            fontSize: 11.5,
            color: theme.inkSoft,
            display: "flex",
            alignItems: "center",
            gap: 4
          }}
        >
          <span>{rev.itemName}</span>
          {rev.variant && <span style={{ color: theme.inkFaint }}>({rev.variant})</span>}
        </div>
      )}

      {/* Comment Text */}
      <p
        style={{
          margin: 0,
          fontSize: 13,
          color: theme.ink,
          lineHeight: 1.5,
          wordBreak: "break-word"
        }}
      >
        {rev.comment}
      </p>

      {/* Photo thumbnails */}
      {rev.photos && rev.photos.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {rev.photos.map((photoUrl, idx) => (
            <img
              key={idx}
              src={photoUrl}
              alt="Customer photo"
              onClick={() => onOpenPhotoModal(photoUrl)}
              style={{
                width: 54,
                height: 54,
                borderRadius: 8,
                objectFit: "cover",
                border: `1px solid ${theme.border}`,
                cursor: "pointer"
              }}
            />
          ))}
        </div>
      )}

      {/* Store Response */}
      {rev.reply && !isReplying && (
        <div
          style={{
            marginTop: 2,
            padding: "10px 12px",
            borderRadius: 8,
            background: theme.surface2,
            border: `1px solid ${theme.border}`,
            display: "flex",
            flexDirection: "column",
            gap: 4
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: 11.5,
                fontWeight: 600,
                color: theme.inkSoft
              }}
            >
              <CornerDownRight size={12} />
              <span>Store Reply ({store?.name || "Merchant"}):</span>
            </div>

            <button
              onClick={() => onStartReply(rev)}
              style={{
                background: theme.surface,
                border: `1px solid ${theme.border}`,
                borderRadius: 6,
                color: theme.inkSoft,
                fontSize: 11,
                fontWeight: 500,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "3px 8px",
                boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
              }}
            >
              <Edit3 size={11} />
              <span>Edit</span>
            </button>
          </div>

          <p style={{ margin: 0, fontSize: 12.5, color: theme.ink, lineHeight: 1.45 }}>
            {rev.reply.text}
          </p>

          <span style={{ fontSize: 10, color: theme.inkFaint }}>
            {formatRelativeTime(rev.reply.repliedAt)}
          </span>
        </div>
      )}

      {/* Active Reply Composer */}
      {isReplying && (
        <div
          style={{
            marginTop: 4,
            padding: "12px",
            borderRadius: 10,
            background: theme.surface2,
            border: `1px solid ${theme.border}`,
            display: "flex",
            flexDirection: "column",
            gap: 8
          }}
        >
          <div style={{ display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none" }}>
            {QUICK_TEMPLATES.map((tpl, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onChangeReplyText(tpl)}
                style={{
                  background: theme.surface,
                  border: `1px solid ${theme.border}`,
                  color: theme.inkSoft,
                  padding: "3px 8px",
                  borderRadius: 6,
                  fontSize: 11,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  flexShrink: 0
                }}
              >
                {tpl.length > 32 ? tpl.substring(0, 32) + "..." : tpl}
              </button>
            ))}
          </div>

          <textarea
            value={replyText}
            onChange={(e) => onChangeReplyText(e.target.value)}
            placeholder="Write a reply to the buyer..."
            rows={2}
            maxLength={500}
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: 6,
              border: `1px solid ${theme.border}`,
              background: theme.surface,
              color: theme.ink,
              fontSize: 12.5,
              outline: "none",
              fontFamily: "inherit",
              boxSizing: "border-box"
            }}
          />

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
            <button
              type="button"
              onClick={onCancelReply}
              disabled={submittingReply}
              style={{
                padding: "6px 14px",
                borderRadius: 6,
                background: theme.surface,
                border: `1px solid ${theme.border}`,
                color: theme.inkSoft,
                fontSize: 11.5,
                fontWeight: 500,
                cursor: "pointer",
                boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onSubmitReply(rev.id)}
              disabled={submittingReply}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "5px 14px",
                borderRadius: 6,
                background: theme.ink,
                border: "none",
                color: theme.surface,
                fontSize: 11.5,
                fontWeight: 600,
                cursor: "pointer",
                opacity: submittingReply ? 0.7 : 1
              }}
            >
              <Send size={11} />
              <span>{submittingReply ? "Sending..." : "Send"}</span>
            </button>
          </div>
        </div>
      )}

      {!rev.reply && !isReplying && (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={() => onStartReply(rev)}
            style={{
              background: theme.surface,
              border: `1px solid ${theme.border}`,
              borderRadius: 8,
              padding: "6px 14px",
              color: theme.ink,
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
              transition: "all 0.15s ease"
            }}
          >
            <CornerDownRight size={13} />
            <span>Reply</span>
          </button>
        </div>
      )}
    </div>
  );
}
