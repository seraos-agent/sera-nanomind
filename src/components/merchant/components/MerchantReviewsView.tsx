import { useState, useMemo } from "react";
import { MessageSquare, X } from "lucide-react";
import type { ThemeType } from "../../../theme";
import type { MerchantStore, MerchantReview } from "../types";
import { getApiBaseUrl } from "../../../config/marketplaceConfig";
import { ReviewSummaryCard } from "./reviews/ReviewSummaryCard";
import { ReviewItemCard } from "./reviews/ReviewItemCard";

interface MerchantReviewsViewProps {
  theme: ThemeType;
  isMobileView?: boolean;
  store: MerchantStore | null;
  reviews: MerchantReview[];
  onRefreshReviews: () => Promise<void>;
  embedded?: boolean;
}

export function MerchantReviewsView({
  theme,
  isMobileView,
  store,
  reviews,
  onRefreshReviews,
  embedded = false
}: MerchantReviewsViewProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>("");
  const [submittingReply, setSubmittingReply] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activePhotoModal, setActivePhotoModal] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Calculations
  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
      : "5.0";

  const starCounts = useMemo(() => {
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const star = Math.floor(r.rating);
      if (star in counts) counts[star]++;
      else if (star > 5) counts[5]++;
      else if (star < 1) counts[1]++;
    });
    return counts;
  }, [reviews]);

  const unrepliedCount = useMemo(() => {
    return reviews.filter((r) => !r.reply || !r.reply.text).length;
  }, [reviews]);

  const withPhotosCount = useMemo(() => {
    return reviews.filter((r) => r.photos && r.photos.length > 0).length;
  }, [reviews]);

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    if (selectedFilter === "UNREPLIED") {
      return reviews.filter((r) => !r.reply || !r.reply.text);
    }
    if (selectedFilter === "WITH_PHOTOS") {
      return reviews.filter((r) => r.photos && r.photos.length > 0);
    }
    if (selectedFilter === "STAR_5") {
      return reviews.filter((r) => r.rating >= 4.8);
    }
    if (selectedFilter === "STAR_4") {
      return reviews.filter((r) => r.rating >= 3.8 && r.rating < 4.8);
    }
    if (selectedFilter === "STAR_3") {
      return reviews.filter((r) => r.rating >= 2.8 && r.rating < 3.8);
    }
    if (selectedFilter === "STAR_2") {
      return reviews.filter((r) => r.rating >= 1.8 && r.rating < 2.8);
    }
    if (selectedFilter === "STAR_1") {
      return reviews.filter((r) => r.rating < 1.8);
    }
    return reviews;
  }, [reviews, selectedFilter]);

  const handleStartReply = (review: MerchantReview) => {
    setReplyingReviewId(review.id);
    setReplyText(review.reply?.text || "");
  };

  const handleCancelReply = () => {
    setReplyingReviewId(null);
    setReplyText("");
  };

  const handleSubmitReply = async (reviewId: string) => {
    if (!replyText.trim()) {
      showToast("Teks balasan tidak boleh kosong.");
      return;
    }

    try {
      setSubmittingReply(true);
      const res = await fetch(`${getApiBaseUrl()}/api/market/reviews/${reviewId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ replyText: replyText.trim() })
      });

      if (!res.ok) {
        throw new Error("Gagal mengirim balasan.");
      }

      showToast("Balasan ulasan terkirim");
      setReplyingReviewId(null);
      setReplyText("");
      await onRefreshReviews();
    } catch (err: any) {
      showToast(`Gagal: ${err.message}`);
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <div
      style={{
        padding: embedded ? "0 0 24px" : isMobileView ? "12px 10px 48px" : "16px 20px 48px",
        maxWidth: embedded ? "100%" : 900,
        width: "100%",
        margin: embedded ? "0" : "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 14
      }}
    >
      {/* Toast */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: theme.ink,
            color: theme.surface,
            padding: "8px 18px",
            borderRadius: 24,
            fontSize: 12.5,
            fontWeight: 500,
            zIndex: 9999,
            boxShadow: "0 4px 16px rgba(0,0,0,0.15)"
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* Lightbox Modal */}
      {activePhotoModal && (
        <div
          onClick={() => setActivePhotoModal(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.75)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              maxWidth: 600,
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }}
          >
            <button
              onClick={() => setActivePhotoModal(null)}
              style={{
                position: "absolute",
                top: -36,
                right: 0,
                background: "transparent",
                border: "none",
                color: "#FFFFFF",
                cursor: "pointer"
              }}
            >
              <X size={22} />
            </button>
            <img
              src={activePhotoModal}
              alt="Preview"
              style={{
                maxWidth: "100%",
                maxHeight: "80vh",
                borderRadius: 10,
                objectFit: "contain"
              }}
            />
          </div>
        </div>
      )}

      {/* 1. UNIFIED CARD: RATING SUMMARY & NON-SCROLLING FILTER PILLS */}
      <ReviewSummaryCard
        theme={theme}
        isMobileView={isMobileView}
        averageRating={averageRating}
        totalReviews={totalReviews}
        unrepliedCount={unrepliedCount}
        withPhotosCount={withPhotosCount}
        starCounts={starCounts}
        selectedFilter={selectedFilter}
        onSelectFilter={setSelectedFilter}
      />

      {/* 2. REVIEWS LIST */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filteredReviews.length === 0 ? (
          <div
            style={{
              background: theme.surface,
              border: `1px solid ${theme.border}`,
              borderRadius: 12,
              padding: "40px 20px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8
            }}
          >
            <MessageSquare size={24} color={theme.inkFaint} />
            <span style={{ fontSize: 13, fontWeight: 600, color: theme.ink }}>
              {selectedFilter === "UNREPLIED"
                ? "Tidak ada ulasan yang perlu dibalas"
                : "Tidak ada ulasan pada kategori ini"}
            </span>
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <ReviewItemCard
              key={rev.id}
              review={rev}
              store={store}
              theme={theme}
              isMobileView={isMobileView}
              isReplying={replyingReviewId === rev.id}
              replyText={replyText}
              submittingReply={submittingReply}
              onChangeReplyText={setReplyText}
              onStartReply={handleStartReply}
              onCancelReply={handleCancelReply}
              onSubmitReply={handleSubmitReply}
              onOpenPhotoModal={setActivePhotoModal}
            />
          ))
        )}
      </div>
    </div>
  );
}
