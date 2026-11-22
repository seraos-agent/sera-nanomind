import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import type { ThemeType } from "../../theme";
import { MessageBubble } from "./MessageBubble";
import { EmptyState } from "./EmptyState";
import { ChatInput } from "./ChatInput";
import type { Socket } from "../../services/localSocket";
import { GovernanceRecommendationCard } from "./proposal/GovernanceRecommendationCard";
import { CognitiveProcessCard } from "./CognitiveProcessCard";
import { sortMessagesChronologically, getMessageTimestamp } from "../../utils/messageOrder";

interface ChatViewProps {
  theme: ThemeType;
  messages: any[];
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
  isMobileView: boolean;
  onOpenSidebar: () => void;
  onSend: (text: string, images?: string[], documents?: any[], modelTier?: 'flash' | 'high') => void;
  socket: Socket | null;
  currentActivity: any | null;
  onCancelChat: () => void;
  governanceRecommendations?: any[];
  onRespondGovernance?: (recommendationId: string, decision: 'APPROVED' | 'REJECTED', rationale?: string) => void;
  onClearChat?: () => void;
}

export function ChatView({
  theme,
  messages,
  setMessages,
  isMobileView,
  onOpenSidebar,
  onSend,
  socket,
  currentActivity,
  onCancelChat,
  governanceRecommendations,
  onRespondGovernance,
  onClearChat
}: ChatViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState<number | null>(null);

  const isAtBottomRef = useRef(true);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const touchStartY = useRef<number | null>(null);

  const checkIfAtBottom = useCallback(() => {
    if (!scrollRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    // 60px tolerance threshold for detecting when user is at the bottom
    return scrollHeight - scrollTop - clientHeight <= 60;
  }, []);

  const handleScroll = useCallback(() => {
    const atBottom = checkIfAtBottom();
    isAtBottomRef.current = atBottom;
    setShowScrollBottom(!atBottom);
  }, [checkIfAtBottom]);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    if (e.deltaY < 0) {
      // User scrolling upwards: immediately release bottom lock to prevent friction
      isAtBottomRef.current = false;
      setShowScrollBottom(true);
    }
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartY.current !== null) {
      const deltaY = e.touches[0].clientY - touchStartY.current;
      if (deltaY > 6) {
        // User dragged finger down (scrolling content upwards)
        isAtBottomRef.current = false;
        setShowScrollBottom(true);
      }
    }
  }, []);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (!scrollRef.current) return;
    const { scrollHeight, clientHeight } = scrollRef.current;
    if (scrollHeight > clientHeight) {
      scrollRef.current.scrollTo({
        top: scrollHeight,
        behavior
      });
    }
  }, []);

  const sortedMessages = useMemo(() => sortMessagesChronologically(messages), [messages]);

  // Scroll on new messages or activity state changes
  useEffect(() => {
    const lastMsg = sortedMessages[sortedMessages.length - 1];
    const isUserSentLast = lastMsg?.role === 'user';

    // If user sent a message, ALWAYS scroll to bottom smoothly
    if (isUserSentLast) {
      isAtBottomRef.current = true;
      setShowScrollBottom(false);
      scrollToBottom('smooth');
      return;
    }

    // Otherwise (assistant streaming, thinking updates):
    // Only follow along if the user is already at the bottom, and use 'auto' to never fight user gestures
    if (isAtBottomRef.current) {
      scrollToBottom('auto');
    }
  }, [sortedMessages, currentActivity, scrollToBottom]);

  // Use ResizeObserver on the messages content wrapper ONLY if user is already at bottom
  useEffect(() => {
    if (!contentRef.current) return;
    const observer = new ResizeObserver(() => {
      // Never yank scroll to bottom if user is reading previous messages
      if (isAtBottomRef.current) {
        scrollToBottom('auto');
      }
    });
    observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, [scrollToBottom]);

  const handleCopy = useCallback((id: number, content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  }, []);

  const handleApprove = useCallback((proposalId: string, action: 'APPROVE' | 'REJECT', candidateId?: string) => {
    if (proposalId === "mock_purchase_github" && action === "APPROVE") {
      window.dispatchEvent(new Event("mock_github_installed"));
    }
    if (socket) {
      socket.emit('chat:proposal_response', { proposalId, action, candidateId });
      setMessages(prev => prev.map(m => {
        if (m.proposal && m.proposal.proposalId === proposalId) {
          return { ...m, proposal: { ...m.proposal, status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED' } };
        }
        return m;
      }));
    }
  }, [socket, setMessages]);


  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, position: "relative" }}>
      {/* Messages area */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        style={{
          flex: 1,
          overflowY: "auto",
          overscrollBehaviorY: "contain",
          WebkitOverflowScrolling: "touch",
          touchAction: "pan-y",
          padding: isMobileView ? "68px 14px 180px" : "80px 26px 200px",
          maskImage: "linear-gradient(to bottom, transparent 0px, black 56px, black 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0px, black 56px, black 100%)",
        }}
      >
        {sortedMessages.length === 0 ? (
          <EmptyState theme={theme} />
        ) : (
          <div ref={contentRef} style={{ maxWidth: 760, margin: "0 auto" }}>
            {sortedMessages.map((msg, idx) => (
              <MessageBubble
                key={msg.clientMessageId || msg.id || `${msg.role}-${idx}-${getMessageTimestamp(msg)}`}
                theme={theme}
                msg={msg}
                onCopy={handleCopy}
                copied={copied}
                onApprove={handleApprove}
                onClearChat={() => socket?.emit("chat:clear")}
                isMobileView={isMobileView}
              />
            ))}

            {governanceRecommendations && governanceRecommendations.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, margin: '16px 0' }}>
                {governanceRecommendations.map((rec) => (
                  <GovernanceRecommendationCard
                    key={rec.id}
                    theme={theme}
                    recommendation={rec}
                    onRespond={(id, decision, rationale) => onRespondGovernance?.(id, decision, rationale)}
                  />
                ))}
              </div>
            )}



            {currentActivity && (
              <div style={{ display: "flex", justifyContent: "flex-start", margin: "16px 0 12px" }}>
                <CognitiveProcessCard
                  theme={theme}
                  phase={typeof currentActivity === 'object' ? currentActivity.phase : (String(currentActivity).toLowerCase().includes('working') ? 'WORKING' : 'THINKING')}
                  subText={typeof currentActivity === 'object' ? currentActivity.subText : String(currentActivity)}
                  steps={typeof currentActivity === 'object' ? currentActivity.cognitiveSteps : []}
                  isLive={true}
                  startTime={typeof currentActivity === 'object' ? currentActivity.startTime : undefined}
                />
              </div>
            )}

            {/* Scroll bottom clearance anchor */}
            <div ref={bottomRef} style={{ height: isMobileView ? 24 : 32 }} />

          </div>
        )}
      </div>

      {/* Input area */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        padding: isMobileView ? "0px 14px 14px" : "0px 26px 16px",
        background: theme.bg,
        pointerEvents: "none" // so clicks pass through the gradient
      }}>
        <div style={{ maxWidth: 760, margin: "0 auto", position: "relative", pointerEvents: "auto" }}>
          {showScrollBottom && (
            <button
              type="button"
              onClick={() => {
                isAtBottomRef.current = true;
                setShowScrollBottom(false);
                scrollToBottom('smooth');
              }}
              style={{
                position: "absolute",
                right: 12,
                top: -46,
                width: 36,
                height: 36,
                borderRadius: "50%",
                backgroundColor: theme.surface2 || "#1e1e24",
                color: theme.ink,
                border: `1px solid ${theme.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(0,0,0,0.22)",
                zIndex: 30,
                transition: "all 0.15s ease"
              }}
              title="Scroll to bottom"
            >
              <ChevronDown size={18} />
            </button>
          )}

          <ChatInput
            theme={theme}
            onSend={onSend}
            disabled={!socket}
            isProcessing={!!currentActivity}
            isMobileView={isMobileView}
            onOpenSidebar={onOpenSidebar}
            onCancelChat={onCancelChat}
            onClearChat={onClearChat}
          />
        </div>
      </div>
    </div>
  );
}
