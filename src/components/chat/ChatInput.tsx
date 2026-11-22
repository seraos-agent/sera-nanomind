import React, { useRef, useState, useEffect } from "react";
import { Plus, ArrowUp, FileText, PanelLeft, Image as ImageIcon, Square, Trash2 } from "lucide-react";
import type { ThemeType } from "../../theme";
import { registerBackHandler } from "../../utils/backButton";
import {
  type ImageAttachment,
  type DocumentAttachment,
  processMediaFileUpload,
  readDocumentFileAttachment,
} from "./components/input/chatMediaUpload";
import { AttachmentPreviewStrip } from "./components/input/AttachmentPreviewStrip";
import { ConfirmClearChatModal } from "./components/input/ConfirmClearChatModal";

export type { ImageAttachment, DocumentAttachment };

interface ChatInputProps {
  theme: ThemeType;
  onSend: (text: string, images?: string[], documents?: DocumentAttachment[], modelTier?: 'flash' | 'high') => void;
  disabled?: boolean;
  isProcessing?: boolean;
  isMobileView?: boolean;
  onOpenSidebar?: () => void;
  onCancelChat?: () => void;
  onClearChat?: () => void;
}

export function ChatInput({
  theme,
  onSend,
  disabled,
  isProcessing,
  isMobileView,
  onOpenSidebar,
  onCancelChat,
  onClearChat
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [imageAttachments, setImageAttachments] = useState<ImageAttachment[]>([]);
  const [documentAttachments, setDocumentAttachments] = useState<DocumentAttachment[]>([]);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showConfirmClearModal, setShowConfirmClearModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'flash' | 'high'>(() => {
    try {
      const saved = localStorage.getItem('sera_chat_model');
      return saved === 'high' ? 'high' : 'flash';
    } catch {
      return 'flash';
    }
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle back button for attach menu and confirm clear modal
  useEffect(() => {
    const unregs: (() => void)[] = [];
    if (showConfirmClearModal) {
      unregs.push(registerBackHandler('chat_confirm_clear', 80, () => {
        setShowConfirmClearModal(false);
        return true;
      }));
    }
    if (showAttachMenu) {
      unregs.push(registerBackHandler('chat_attach_menu', 60, () => {
        setShowAttachMenu(false);
        return true;
      }));
    }
    return () => {
      unregs.forEach(u => u());
    };
  }, [showConfirmClearModal, showAttachMenu]);

  // Close attach menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowAttachMenu(false);
      }
    };
    if (showAttachMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAttachMenu]);

  const uploadMediaFile = (file: File) => {
    processMediaFileUpload(
      file,
      (att) => setImageAttachments(prev => [...prev, att]),
      (id, patch) => setImageAttachments(prev => prev.map(item => (item.id === id ? { ...item, ...patch } : item)))
    );
  };

  const uploadDocumentFile = (file: File) => {
    readDocumentFileAttachment(file, (doc) => setDocumentAttachments(prev => [...prev, doc]));
  };

  const handleAttachOption = (type: 'document' | 'image') => {
    setShowAttachMenu(false);
    if (fileInputRef.current) {
      if (type === 'document') {
        fileInputRef.current.accept = '.csv,.xlsx,.xls,.json,.txt,.md,.pdf';
      } else if (type === 'image') {
        fileInputRef.current.accept = 'image/*,video/*';
      }
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      uploadMediaFile(file);
    } else {
      uploadDocumentFile(file);
    }
    e.target.value = '';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const autoGrow = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/') || items[i].type.startsWith('video/')) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            uploadMediaFile(file);
            return;
          }
        }
      }
    }

    const text = e.clipboardData.getData("text/plain");
    if (text.length > 250 || text.split('\n').length > 5) {
      e.preventDefault();
      setAttachments(prev => [...prev, text]);
    }
  };

  const isImageUploading = imageAttachments.some(img => img.uploading && !img.dataUrl);

  const handleSend = () => {
    const hasText = !!input.trim();
    const hasAttachments = attachments.length > 0;
    const hasImages = imageAttachments.length > 0;
    const hasDocs = documentAttachments.length > 0;

    if ((!hasText && !hasAttachments && !hasImages && !hasDocs) || disabled || isImageUploading) return;

    let finalText = "";
    if (attachments.length > 0) {
      attachments.forEach((att, i) => {
        finalText += `[Pasted Context ${i + 1}]\n${att}\n\n`;
      });
    }
    finalText += input.trim();

    // Filter out local browser blob: URLs so remote inference does not fail to fetch
    const imageUrls = imageAttachments
      .map(img => img.publicUrl || img.dataUrl)
      .filter((url): url is string => Boolean(url && !url.startsWith('blob:')));

    onSend(
      finalText.trim(),
      imageUrls.length > 0 ? imageUrls : undefined,
      documentAttachments.length > 0 ? documentAttachments : undefined,
      selectedModel
    );
    setInput("");
    setAttachments([]);
    setImageAttachments([]);
    setDocumentAttachments([]);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const canSend = isProcessing || (!isImageUploading && (input.trim() || attachments.length > 0 || imageAttachments.length > 0 || documentAttachments.length > 0) && !disabled);
  const isMobileDark = Boolean(theme.isDark && isMobileView);

  return (
    <div style={{ padding: "0", flexShrink: 0 }}>
      <div style={{ maxWidth: 760, margin: "0 auto", position: "relative" }}>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            background: (theme as any).chatInputBg || (theme.isDark ? "#18181B" : theme.surface),
            border: `1.5px solid ${(theme as any).chatInputBorder || (theme.isDark ? "#2E2E33" : theme.border)}`,
            borderRadius: 24,
            padding: "12px 14px 10px",
            boxShadow: theme.isDark ? "0 4px 20px rgba(0, 0, 0, 0.4)" : "none",
          }}
        >
          <AttachmentPreviewStrip
            theme={theme}
            imageAttachments={imageAttachments}
            documentAttachments={documentAttachments}
            textAttachments={attachments}
            onRemoveImage={(id) => setImageAttachments(prev => prev.filter(i => i.id !== id))}
            onRemoveDocument={(id) => setDocumentAttachments(prev => prev.filter(d => d.id !== id))}
            onRemoveText={(idx) => setAttachments(prev => prev.filter((_, i) => i !== idx))}
          />

          <textarea
            ref={textareaRef}
            className="chatui-textarea"
            value={input}
            onChange={autoGrow}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="Ask anything..."
            rows={1}
            disabled={disabled}
            style={{
              width: "100%",
              resize: "none",
              border: "none",
              outline: "none",
              background: "transparent",
              color: theme.ink,
              fontFamily: "Inter, sans-serif",
              fontSize: isMobileView ? 16 : 15,
              lineHeight: 1.5,
              padding: "2px 8px 10px",
              maxHeight: 160,
              minHeight: 24,
              boxSizing: "border-box"
            }}
          />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
            <div style={{ display: "flex", gap: 8, paddingLeft: 6, position: "relative" }}>
              {isMobileView && onOpenSidebar && (
                <button
                  title="Menu"
                  onClick={onOpenSidebar}
                  disabled={disabled}
                  style={{
                    background: "transparent", border: "none", color: isMobileDark ? "#FFFFFF" : theme.inkSoft,
                    cursor: disabled ? "default" : "pointer",
                    opacity: 1,
                    pointerEvents: "auto",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.2s"
                  }}
                >
                  <PanelLeft size={20} color={isMobileDark ? "#FFFFFF" : undefined} />
                </button>
              )}
              <div ref={menuRef} style={{ position: "relative" }}>
                <button
                  title="Attach file"
                  onClick={() => setShowAttachMenu(!showAttachMenu)}
                  disabled={disabled}
                  style={{
                    background: showAttachMenu ? theme.surface2 : "transparent", border: "none",
                    color: isMobileDark ? "#FFFFFF" : (showAttachMenu ? theme.ink : theme.inkSoft),
                    cursor: disabled ? "default" : "pointer",
                    opacity: 1,
                    pointerEvents: "auto",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    borderRadius: 8, padding: 4, transition: "all 0.2s"
                  }}
                >
                  <Plus size={20} color={isMobileDark ? "#FFFFFF" : undefined} />
                </button>

                {showAttachMenu && (
                  <div style={{
                    position: "absolute", bottom: "100%", left: 0, marginBottom: 8,
                    background: theme.isDark ? "#1E1E22" : theme.surface,
                    border: `1px solid ${theme.isDark ? "#2E2E33" : theme.border}`,
                    borderRadius: 12, padding: 6,
                    boxShadow: theme.isDark ? "0 8px 30px rgba(0,0,0,0.5)" : "0 4px 20px rgba(0,0,0,0.15)",
                    display: "flex", flexDirection: "column", gap: 2, minWidth: 160, zIndex: 50,
                    animation: "walletPageIn 150ms cubic-bezier(0.16, 1, 0.3, 1) forwards"
                  }}>
                    <button
                      onClick={() => handleAttachOption('image')}
                      style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "8px 12px",
                        background: "transparent", border: "none", borderRadius: 6,
                        color: theme.ink, fontSize: 13, fontWeight: 500, cursor: "pointer",
                        transition: "background 0.2s", width: "100%", textAlign: "left"
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = theme.isDark ? "#2A2A30" : theme.surface2}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <ImageIcon size={16} color={theme.inkSoft} />
                      Galeri
                    </button>
                    <button
                      onClick={() => handleAttachOption('document')}
                      style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "8px 12px",
                        background: "transparent", border: "none", borderRadius: 6,
                        color: theme.ink, fontSize: 13, fontWeight: 500, cursor: "pointer",
                        transition: "background 0.2s", width: "100%", textAlign: "left"
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = theme.isDark ? "#2A2A30" : theme.surface2}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <FileText size={16} color={theme.inkSoft} />
                      File
                    </button>
                    <div style={{ height: 1, background: theme.isDark ? "#2E2E33" : theme.border, margin: "4px 0" }} />
                    <button
                      onClick={() => {
                        setShowAttachMenu(false);
                        setShowConfirmClearModal(true);
                      }}
                      style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "8px 12px",
                        background: "transparent", border: "none", borderRadius: 6,
                        color: "#ef4444", fontSize: 13, fontWeight: 500, cursor: "pointer",
                        transition: "background 0.2s", width: "100%", textAlign: "left"
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <Trash2 size={16} color="#ef4444" />
                      Hapus Chat
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {/* Segmented Model Switch (Flash vs High) */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  background: theme.isDark ? "#121214" : "rgba(0, 0, 0, 0.05)",
                  border: `1px solid ${theme.isDark ? "#27272A" : theme.border}`,
                  borderRadius: 20,
                  padding: 2,
                  gap: 2,
                  userSelect: "none",
                }}
              >
                <button
                  type="button"
                  title="Hybrid On-Device Priority (Firebase AI Logic · Gemini Nano)"
                  onClick={() => {
                    setSelectedModel('flash');
                    try { localStorage.setItem('sera_chat_model', 'flash'); } catch {}
                  }}
                  disabled={disabled}
                  style={{
                    border: "none",
                    outline: "none",
                    cursor: disabled ? "default" : "pointer",
                    padding: "3px 9px",
                    borderRadius: 16,
                    fontSize: 11.5,
                    fontWeight: selectedModel === 'flash' ? 600 : 500,
                    fontFamily: "Inter, sans-serif",
                    color: selectedModel === 'flash'
                      ? (theme.isDark ? "#FFFFFF" : theme.ink)
                      : theme.inkSoft,
                    background: selectedModel === 'flash'
                      ? (theme.isDark ? "#27272A" : "#FFFFFF")
                      : "transparent",
                    boxShadow: selectedModel === 'flash'
                      ? (theme.isDark ? "0 1px 3px rgba(0,0,0,0.5)" : "0 1px 3px rgba(0,0,0,0.1)")
                      : "none",
                    transition: "all 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  Flash
                </button>
                <button
                  type="button"
                  title="Cloud Deep Reasoning (Firebase AI Logic · Gemini 3.5 Flash)"
                  onClick={() => {
                    setSelectedModel('high');
                    try { localStorage.setItem('sera_chat_model', 'high'); } catch {}
                  }}
                  disabled={disabled}
                  style={{
                    border: "none",
                    outline: "none",
                    cursor: disabled ? "default" : "pointer",
                    padding: "3px 9px",
                    borderRadius: 16,
                    fontSize: 11.5,
                    fontWeight: selectedModel === 'high' ? 600 : 500,
                    fontFamily: "Inter, sans-serif",
                    color: selectedModel === 'high'
                      ? (theme.isDark ? "#FFFFFF" : theme.ink)
                      : theme.inkSoft,
                    background: selectedModel === 'high'
                      ? (theme.isDark ? "#27272A" : "#FFFFFF")
                      : "transparent",
                    boxShadow: selectedModel === 'high'
                      ? (theme.isDark ? "0 1px 3px rgba(0,0,0,0.5)" : "0 1px 3px rgba(0,0,0,0.1)")
                      : "none",
                    transition: "all 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  High
                </button>
              </div>

              <button
                onClick={() => {
                  if (isProcessing) {
                    if (onCancelChat) onCancelChat();
                  } else {
                    handleSend();
                  }
                }}
                disabled={!canSend}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  border: "none",
                  background: isProcessing ? (theme.isDark ? "#27272A" : theme.surface2) : (canSend ? theme.accent : (theme.isDark ? "#27272A" : theme.surface2)),
                  color: isMobileDark
                    ? "#FFFFFF"
                    : (isProcessing ? theme.ink : (canSend ? theme.accentInk : theme.inkSoft)),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: canSend ? "pointer" : "default",
                  opacity: 1,
                  flexShrink: 0,
                  transform: canSend ? "scale(1)" : "scale(0.95)",
                  transition: "all 180ms ease",
                }}
              >
                {isProcessing ? (
                  <Square size={14} fill={isMobileDark ? "#FFFFFF" : "currentColor"} strokeWidth={0} />
                ) : (
                  <ArrowUp size={18} color={isMobileDark ? "#FFFFFF" : undefined} />
                )}
              </button>
            </div>
          </div>
        </div>

        {!isMobileView && (
          <div style={{ textAlign: "center", fontSize: 11, color: theme.inkSoft, fontFamily: "Inter, sans-serif", marginTop: 14 }}>
            Sera can make mistakes. Verify important information.
          </div>
        )}
      </div>

      {showConfirmClearModal && (
        <ConfirmClearChatModal
          theme={theme}
          onCancel={() => setShowConfirmClearModal(false)}
          onConfirm={() => {
            setShowConfirmClearModal(false);
            onClearChat?.();
          }}
        />
      )}
    </div>
  );
}
