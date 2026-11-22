import { Activity, Copy, Check, ExternalLink, FileSpreadsheet, FileText, ThumbsUp, ThumbsDown } from "lucide-react";
import type { ThemeType } from "../../theme";
import { ProposalCard } from "./ProposalCard";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useState, useEffect } from 'react';
import { CognitiveProcessCard } from './CognitiveProcessCard';
import { registerBackHandler } from "../../utils/backButton";
import {
  ImageLightbox,
  ClearChatCountdownCard,
  CodeBlockCard,
  MiniBarChart,
  parseBarChart,
  normalizeMarkdownContent,
  DraggableTableContainer,
  isImageUrl,
  extractImageUrlsFromText,
  ChatMediaItem
} from './components/MessageBubbleRenderers';

export function MessageBubble({ theme, msg, onCopy, copied, onApprove, onClearChat, isMobileView }: {
  theme: ThemeType;
  msg: any;
  onCopy: (id: number, content: string) => void;
  copied: number | null;
  onApprove: (proposalId: string, action: 'APPROVE' | 'REJECT', candidateId?: string) => void;
  onClearChat?: () => void;
  isMobileView?: boolean;
}) {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(() => {
    if (msg.feedback === 'up' || msg.feedback === 'down') return msg.feedback;
    try {
      const saved = msg.id ? localStorage.getItem(`sera_feedback_${msg.id}`) : null;
      return saved === 'up' || saved === 'down' ? saved : null;
    } catch {
      return null;
    }
  });

  const toggleFeedback = (value: 'up' | 'down') => {
    const next = feedback === value ? null : value;
    setFeedback(next);
    try {
      if (msg.id) {
        if (next) localStorage.setItem(`sera_feedback_${msg.id}`, next);
        else localStorage.removeItem(`sera_feedback_${msg.id}`);
      }
    } catch {}
  };

  // Close image lightbox on back button press
  useEffect(() => {
    if (!lightboxSrc) return;
    return registerBackHandler('chat_image_lightbox', 95, () => {
      setLightboxSrc(null);
      return true;
    });
  }, [lightboxSrc]);
  const isUser = msg.role === "user";

  let cleanedContent = normalizeMarkdownContent(msg.content || '')
    .replace(/\[sheet\]\s*\{[\s\S]*\}/gi, '');

  // If companion action button links exist at the end of the message, strip duplicate inline links from body text
  if (msg.actionLinks && msg.actionLinks.length > 0) {
    for (const link of msg.actionLinks) {
      if (link.url) {
        const escapedUrl = link.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const lineRegex = new RegExp(`^\\s*(?:📄|•|-|\\*|🔗)?\\s*\\[[^\\]]+\\]\\(${escapedUrl}\\)\\s*$`, 'gim');
        cleanedContent = cleanedContent.replace(lineRegex, '');

        const inlineRegex = new RegExp(`(?:📄|🔗)?\\s*\\[[^\\]]+\\]\\(${escapedUrl}\\)`, 'gi');
        cleanedContent = cleanedContent.replace(inlineRegex, '');
      }
    }
    cleanedContent = cleanedContent.replace(/\n{3,}/g, '\n\n');
  }

  if (msg.type === "activity") {
    return (
      <div style={{ display: "flex", justifyContent: "flex-start", margin: "16px 0" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          fontSize: 12, color: theme.inkFaint, fontFamily: "Inter, sans-serif",
          fontWeight: 500
        }}>
          <Activity size={13} color={theme.inkFaint} />
          {msg.content}
        </div>
      </div>
    );
  }

  if (msg.type === "clear_chat_countdown") {
    return (
      <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 22 }}>
        <ClearChatCountdownCard theme={theme} onClear={() => onClearChat && onClearChat()} />
      </div>
    );
  }

  const explicitImages: string[] = Array.isArray(msg.images) ? msg.images : [];
  const { urls: extractedImages, cleanedText: textWithoutRawImages } = extractImageUrlsFromText(cleanedContent);
  const allImages = [...new Set([...explicitImages, ...extractedImages])];

  const hasImages = allImages.length > 0;
  const hasDocs = msg.documents && msg.documents.length > 0;
  const displayContent = (extractedImages.length > 0 ? textWithoutRawImages : cleanedContent).trim();
  const hasText = Boolean(displayContent && displayContent.trim());

  return (
    <div
      style={{
        display: "flex",
        marginBottom: 22,
        justifyContent: isUser ? "flex-end" : "flex-start",
      }}
    >
      <div style={{ maxWidth: "100%", width: isUser ? "auto" : "100%", display: "flex", flexDirection: "column", alignItems: isUser ? "flex-end" : "flex-start" }}>
        {/* Document Attachments Card */}
        {hasDocs && (
          <div style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: hasText || hasImages ? 8 : 0,
            justifyContent: isUser ? "flex-end" : "flex-start",
            maxWidth: "100%"
          }}>
            {msg.documents.map((doc: any, i: number) => {
              const name = doc.name || doc.filename || 'document.csv';
              const isSpreadsheet = name.endsWith('.csv') || name.endsWith('.xlsx') || name.endsWith('.xls');
              const sizeKb = doc.size ? (doc.size / 1024).toFixed(1) + ' KB' : (doc.totalRows ? `${doc.totalRows} rows` : 'File');
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: isUser ? theme.bubbleUser : theme.surface2,
                    padding: "8px 12px",
                    borderRadius: 12,
                    border: `1px solid ${theme.border}`,
                    color: isUser ? theme.bubbleUserInk : theme.ink,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
                  }}
                >
                  {isSpreadsheet ? (
                    <FileSpreadsheet size={18} color="#10B981" />
                  ) : (
                    <FileText size={18} color={theme.accent} />
                  )}
                  <div style={{ display: "flex", flexDirection: "column", maxWidth: 220, overflow: "hidden" }}>
                    <span style={{ fontWeight: 600, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {name}
                    </span>
                    <span style={{ fontSize: 11, opacity: 0.75 }}>{sizeKb}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Standalone Media Attachment Cards (Separated from Text Bubble) */}
        {hasImages && (
          <div style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: hasText ? 8 : 0,
            justifyContent: isUser ? "flex-end" : "flex-start",
            maxWidth: "100%"
          }}>
            {allImages.map((imgUrl: string, i: number) => (
              <ChatMediaItem
                key={i}
                src={imgUrl}
                theme={theme}
                onLightbox={(s) => setLightboxSrc(s)}
              />
            ))}
          </div>
        )}

        {/* Cognitive Process Dropdown (Strictly at the TOP of Agent Message) */}
        {!isUser && msg.cognitiveSteps && msg.cognitiveSteps.length > 0 && (
          <CognitiveProcessCard
            theme={theme}
            steps={msg.cognitiveSteps}
            isLive={msg.streaming}
            durationSeconds={msg.durationSeconds}
            hadTools={msg.hadTools}
            startTime={msg.startTime}
          />
        )}

        {/* Text Message Bubble */}
        {(hasText || isUser) && (
          <div
            style={{
              background: isUser ? theme.bubbleUser : "transparent",
              color: isUser ? theme.bubbleUserInk : theme.ink,
              padding: isUser ? "10px 16px" : "2px 0",
              borderRadius: isUser ? 18 : 0,
              borderBottomRightRadius: isUser ? 4 : 0,
              boxShadow: isUser && theme.bubbleUser === "#FFFFFF" ? "0 1px 2px rgba(0,0,0,0.05), 0 1px 1px rgba(0,0,0,0.02)" : "none",
              fontFamily: "Inter, sans-serif",
              fontSize: isMobileView ? 15.5 : 14.5,
              lineHeight: isMobileView ? 1.68 : 1.65,
              whiteSpace: isUser ? "pre-wrap" : "normal",
              wordBreak: "break-word",
              maxWidth: "100%",
              minWidth: 0,
              opacity: isUser && msg.status === "pending" ? 0.7 : 1,
              transition: "opacity 0.25s ease",
            }}
          >
            <div className="markdown-content" style={{ display: "flex", flexDirection: "column", maxWidth: "100%", minWidth: 0 }}>
              {isUser ? (
                <span style={{ display: "inline-flex", alignItems: "baseline", gap: 6 }}>
                  {displayContent && <span>{displayContent}</span>}
                  {msg.status === "pending" && (
                    <span style={{ fontSize: 10, opacity: 0.65, fontStyle: "italic", whiteSpace: "nowrap" }}>
                      • sending
                    </span>
                  )}
                </span>
              ) : (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ node, ...props }) => <p style={{ margin: "0 0 12px 0", lineHeight: 1.6 }} {...props} />,
                    a: ({ node, ...props }) => {
                      if (isImageUrl(props.href)) {
                        return (
                          <a
                            style={{ color: theme.accent, textDecoration: "none", fontWeight: 500, cursor: "pointer" }}
                            onClick={(e) => {
                              e.preventDefault();
                              if (props.href) setLightboxSrc(props.href);
                            }}
                            target="_blank"
                            rel="noopener noreferrer"
                            {...props}
                          />
                        );
                      }
                      let marketplaceDetail: { storeId?: string; itemId?: string } | null = null;
                      if (props.href) {
                        try {
                          const parsed = new URL(props.href, window.location.origin);
                          const isSeraOrigin =
                            parsed.origin === window.location.origin ||
                            parsed.hostname === 'app.seraos.xyz' ||
                            parsed.hostname === 'seraos.xyz';
                          const storeId = parsed.searchParams.get('store') || undefined;
                          const itemId = parsed.searchParams.get('item') || undefined;
                          if (isSeraOrigin && (storeId || itemId)) {
                            marketplaceDetail = { storeId, itemId };
                          }
                        } catch {}
                      }
                      if (marketplaceDetail) {
                        return (
                          <a
                            style={{ color: theme.accent, textDecoration: "none", fontWeight: 500, cursor: "pointer" }}
                            onClick={(e) => {
                              e.preventDefault();
                              window.dispatchEvent(new CustomEvent('sera:open-marketplace', { detail: marketplaceDetail }));
                            }}
                            {...props}
                          />
                        );
                      }
                      return <a style={{ color: theme.accent, textDecoration: "none", fontWeight: 500 }} target="_blank" rel="noopener noreferrer" {...props} />;
                    },
                    ul: ({ node, ...props }) => <ul style={{ paddingLeft: 22, margin: "0 0 12px 0" }} {...props} />,
                    ol: ({ node, ...props }) => <ol style={{ paddingLeft: 22, margin: "0 0 12px 0" }} {...props} />,
                    li: ({ node, ...props }) => <li style={{ marginBottom: 6 }} {...props} />,
                    strong: ({ node, ...props }) => <strong style={{ fontWeight: 600, color: theme.isDark ? "#FFFFFF" : theme.ink }} {...props} />,
                    h1: ({ _node, ...props }: any) => <h1 style={{ fontSize: "1.4em", fontWeight: 700, margin: "20px 0 12px 0", color: theme.isDark ? "#FFFFFF" : theme.ink }} {...props} />,
                    h2: ({ _node, ...props }: any) => <h2 style={{ fontSize: "1.2em", fontWeight: 600, margin: "18px 0 10px 0", color: theme.isDark ? "#FFFFFF" : theme.ink, borderBottom: `1px solid ${theme.border}`, paddingBottom: 6 }} {...props} />,
                    h3: ({ _node, ...props }: any) => <h3 style={{ fontSize: "1.1em", fontWeight: 600, margin: "16px 0 8px 0", color: theme.isDark ? "#FFFFFF" : theme.ink }} {...props} />,
                    blockquote: ({ _node, ...props }: any) => (
                      <blockquote
                        style={{
                          borderLeft: `3.5px solid ${theme.accent}`,
                          margin: "12px 0",
                          color: theme.ink,
                          background: theme.surface2 || "rgba(0,0,0,0.03)",
                          padding: "10px 16px",
                          borderRadius: "0 10px 10px 0",
                          border: `1px solid ${theme.border}`,
                          borderLeftWidth: 3.5,
                          borderLeftColor: theme.accent,
                          fontSize: "0.93em",
                          lineHeight: 1.55
                        }}
                        {...props}
                      />
                    ),
                    table: ({ node: _node, ...props }: any) => (
                      <DraggableTableContainer theme={theme}>
                        <table className="sera-markdown-table" style={{
                          minWidth: "100%",
                          width: "max-content",
                          borderCollapse: "collapse",
                          fontSize: "0.92em",
                          textAlign: "left",
                          lineHeight: 1.55,
                          background: "transparent"
                        }} {...props} />
                      </DraggableTableContainer>
                    ),
                    thead: ({ node: _node, ...props }: any) => (
                      <thead style={{
                        background: theme.isDark ? "rgba(255, 255, 255, 0.04)" : "#F4F5F7"
                      }} {...props} />
                    ),
                    tbody: ({ node: _node, ...props }: any) => (
                      <tbody {...props} />
                    ),
                    tr: ({ node: _node, ...props }: any) => (
                      <tr {...props} />
                    ),
                    th: ({ node: _node, style: propStyle, ...props }: any) => (
                      <th {...props} style={{
                        ...propStyle,
                        borderBottom: `1px solid ${theme.isDark ? "rgba(255, 255, 255, 0.10)" : theme.border}`,
                        padding: "13px 16px",
                        textAlign: propStyle?.textAlign || "left",
                        fontWeight: 600,
                        color: theme.isDark ? "#F4F4F5" : theme.ink,
                        minWidth: 105,
                        maxWidth: 220,
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                        fontSize: "0.88em",
                        letterSpacing: "0.01em",
                        verticalAlign: "middle"
                      }} />
                    ),
                    td: ({ node: _node, style: propStyle, ...props }: any) => (
                      <td {...props} style={{
                        ...propStyle,
                        borderBottom: `1px solid ${theme.isDark ? "rgba(255, 255, 255, 0.08)" : theme.border}`,
                        padding: "14px 16px",
                        textAlign: propStyle?.textAlign || "left",
                        color: theme.isDark ? "#E4E4E7" : theme.ink,
                        minWidth: 105,
                        maxWidth: 220,
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                        fontSize: "0.92em",
                        lineHeight: 1.55,
                        verticalAlign: "top"
                      }} />
                    ),
                    hr: ({ _node, ...props }: any) => <hr style={{ border: 0, borderBottom: `1px solid ${theme.border}`, margin: "20px 0" }} {...props} />,
                    pre: ({ _node, ...props }: any) => {
                      const child = props.children;
                      if (child && child.props && (child.props.className === 'language-barchart' || child.props.className === 'language-chart')) {
                        return <>{child}</>;
                      }
                      return <CodeBlockCard theme={theme}>{child}</CodeBlockCard>;
                    },
                    code: ({ _node, className, ...props }: any) => {
                      const match = /language-(\w+)/.exec(className || '');
                      const lang = match ? match[1].toLowerCase() : '';
                      
                      if (lang === 'barchart' || lang === 'chart') {
                        const parsed = parseBarChart(String(props.children || ''));
                        return <MiniBarChart {...parsed} theme={theme} />;
                      }

                      const hasNewline = String(props.children).includes('\n');
                      if (match || hasNewline) {
                        return <code style={{ fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace" }} className={className} {...props} />;
                      }
                      return <code style={{ background: theme.surface2 || 'rgba(0,0,0,0.04)', padding: "2px 6px", borderRadius: 5, fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace", fontSize: "0.88em", color: theme.ink, border: `1px solid ${theme.border}` }} className={className} {...props} />;
                    },
                    img: ({ _node, ...props }: any) => {
                      if (!props.src) return null;
                      return (
                        <ChatMediaItem
                          src={props.src}
                          alt={props.alt || "image"}
                          theme={theme}
                          onLightbox={(s) => setLightboxSrc(s)}
                          isMarkdownInline={true}
                        />
                      );
                    }
                  }}
                >
                  {displayContent}
                </ReactMarkdown>
              )}
              {msg.streaming && <span style={{ display: "inline-block", width: 6, height: 14, background: theme.accent, marginLeft: 3, verticalAlign: "-2px", animation: "chatui-blink 1s step-end infinite" }} />}
            </div>
          </div>
        )}

        {msg.actionLinks && msg.actionLinks.length > 0 && (
          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            {msg.actionLinks.map((link: any, idx: number) => {
              const labelLower = (link.label || '').toLowerCase();
              const urlLower = (link.url || '').toLowerCase();
              const isSheet = labelLower.includes('sheet') || urlLower.includes('spreadsheets') || labelLower.includes('google');
              const isPdf = link.type === 'pdf' || labelLower.endsWith('.pdf') || urlLower.endsWith('.pdf') || labelLower.includes('pdf');

              let bg = theme.surface2;
              let border = theme.border;
              let color = theme.ink;
              let icon = <ExternalLink size={14} color={theme.inkSoft} />;

              if (isPdf) {
                bg = theme.isDark ? "rgba(239, 68, 68, 0.14)" : "rgba(239, 68, 68, 0.08)";
                border = "rgba(239, 68, 68, 0.35)";
                color = "#EF4444";
                icon = <FileText size={16} color="#EF4444" />;
              } else if (isSheet) {
                bg = `${theme.accent}12`;
                border = `${theme.accent}40`;
                color = theme.accent;
                icon = <FileSpreadsheet size={16} color={theme.accent} />;
              }

              return (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={isPdf ? (link.label.endsWith('.pdf') ? link.label : `${link.label}.pdf`) : undefined}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    background: bg,
                    border: `1px solid ${border}`,
                    padding: "8px 14px",
                    borderRadius: 10,
                    textDecoration: "none",
                    color,
                    fontFamily: "Inter, sans-serif",
                    fontSize: 13,
                    fontWeight: 600,
                    transition: "all 0.2s ease",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.04)"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.04)";
                  }}
                >
                  {icon}
                  <span>{link.label}</span>
                </a>
              );
            })}
          </div>
        )}

        {msg.proposal && (
          <ProposalCard
            theme={theme}
            proposal={msg.proposal}
            onRespond={onApprove}
          />
        )}

        {!isUser && !msg.streaming && !msg.proposal && (
          <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
            <button
              type="button"
              onClick={() => onCopy(msg.id, displayContent)}
              title={copied === msg.id ? "Copied" : "Copy"}
              aria-label="Copy"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "transparent",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                color: copied === msg.id ? theme.accent : theme.inkFaint,
                padding: "5px 6px",
                transition: "color 0.15s ease, background 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = theme.isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
                if (copied !== msg.id) e.currentTarget.style.color = theme.ink;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                if (copied !== msg.id) e.currentTarget.style.color = theme.inkFaint;
              }}
            >
              {copied === msg.id ? <Check size={14} /> : <Copy size={14} />}
            </button>

            <button
              type="button"
              onClick={() => toggleFeedback('up')}
              title="Bagus"
              aria-label="Thumbs up"
              aria-pressed={feedback === 'up'}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: feedback === 'up' ? `${theme.accent}18` : "transparent",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                color: feedback === 'up' ? theme.accent : theme.inkFaint,
                padding: "5px 6px",
                transition: "color 0.15s ease, background 0.15s ease",
              }}
              onMouseEnter={(e) => {
                if (feedback !== 'up') {
                  e.currentTarget.style.background = theme.isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
                  e.currentTarget.style.color = theme.ink;
                }
              }}
              onMouseLeave={(e) => {
                if (feedback !== 'up') {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = theme.inkFaint;
                }
              }}
            >
              <ThumbsUp size={14} />
            </button>

            <button
              type="button"
              onClick={() => toggleFeedback('down')}
              title="Kurang tepat"
              aria-label="Thumbs down"
              aria-pressed={feedback === 'down'}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: feedback === 'down' ? "rgba(239,68,68,0.12)" : "transparent",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                color: feedback === 'down' ? "#EF4444" : theme.inkFaint,
                padding: "5px 6px",
                transition: "color 0.15s ease, background 0.15s ease",
              }}
              onMouseEnter={(e) => {
                if (feedback !== 'down') {
                  e.currentTarget.style.background = theme.isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
                  e.currentTarget.style.color = theme.ink;
                }
              }}
              onMouseLeave={(e) => {
                if (feedback !== 'down') {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = theme.inkFaint;
                }
              }}
            >
              <ThumbsDown size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Interactive Lightbox Modal */}
      {lightboxSrc && (
        <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
      )}
    </div>
  );
}
