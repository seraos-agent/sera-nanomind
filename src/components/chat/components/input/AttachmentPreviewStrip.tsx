import { FileText, X, Loader2, FileSpreadsheet, Play } from "lucide-react";
import type { ThemeType } from "../../../../theme";
import type { ImageAttachment, DocumentAttachment } from "./chatMediaUpload";

interface AttachmentPreviewStripProps {
  theme: ThemeType;
  imageAttachments: ImageAttachment[];
  documentAttachments: DocumentAttachment[];
  textAttachments: string[];
  onRemoveImage: (id: string) => void;
  onRemoveDocument: (id: string) => void;
  onRemoveText: (index: number) => void;
}

export function AttachmentPreviewStrip({
  theme,
  imageAttachments,
  documentAttachments,
  textAttachments,
  onRemoveImage,
  onRemoveDocument,
  onRemoveText,
}: AttachmentPreviewStripProps) {
  if (textAttachments.length === 0 && imageAttachments.length === 0 && documentAttachments.length === 0) {
    return null;
  }

  return (
    <div style={{ display: "flex", gap: 10, padding: "4px 8px 12px", overflowX: "auto", flexWrap: "wrap" }}>
      {/* Image & Video Previews */}
      {imageAttachments.map((img) => (
        <div
          key={img.id}
          style={{
            position: "relative",
            width: 52,
            height: 52,
            borderRadius: 12,
            overflow: "hidden",
            border: `1px solid ${theme.border}`,
            background: "#000",
            flexShrink: 0
          }}
        >
          {img.isVideo ? (
            <>
              <video
                src={img.previewUrl}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                muted
                playsInline
              />
              <div style={{
                position: "absolute", bottom: 2, left: 2,
                background: "rgba(0,0,0,0.65)", borderRadius: 4, padding: "1px 3px",
                display: "flex", alignItems: "center", gap: 2, color: "#fff", fontSize: 8, fontWeight: 700
              }}>
                <Play size={7} fill="#fff" /> VID
              </div>
            </>
          ) : (
            <img
              src={img.previewUrl}
              alt="preview"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          )}
          {img.uploading && (
            <div style={{
              position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <Loader2 size={16} color="#FFF" style={{ animation: "spin 1s linear infinite" }} />
            </div>
          )}
          <button
            onClick={() => onRemoveImage(img.id)}
            style={{
              position: "absolute",
              top: 3,
              right: 3,
              background: "rgba(0, 0, 0, 0.65)",
              backdropFilter: "blur(4px)",
              border: "none",
              borderRadius: "50%",
              width: 18,
              height: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#FFF",
              padding: 0
            }}
            title="Remove image"
          >
            <X size={11} strokeWidth={2.5} />
          </button>
        </div>
      ))}

      {/* Document Attachments */}
      {documentAttachments.map((doc) => {
        const isSpreadsheet = doc.name.endsWith('.csv') || doc.name.endsWith('.xlsx') || doc.name.endsWith('.xls');
        const sizeKb = (doc.size / 1024).toFixed(1);
        return (
          <div key={doc.id} style={{
            display: "flex", alignItems: "center", gap: 8,
            background: theme.isDark ? "#27272A" : theme.surface2, padding: "6px 10px", borderRadius: 10,
            border: `1px solid ${theme.isDark ? "#3F3F46" : theme.border}`, fontSize: 13, color: theme.ink
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {isSpreadsheet ? (
                <FileSpreadsheet size={16} color="#10B981" />
              ) : (
                <FileText size={16} color={theme.accent} />
              )}
              <div style={{ display: "flex", flexDirection: "column", maxWidth: 160, overflow: "hidden" }}>
                <span style={{ fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {doc.name}
                </span>
                <span style={{ fontSize: 11, color: theme.inkFaint }}>{sizeKb} KB</span>
              </div>
            </div>
            <button
              onClick={() => onRemoveDocument(doc.id)}
              style={{ background: "transparent", border: "none", cursor: "pointer", color: theme.inkSoft, display: "flex", padding: 2, marginLeft: 4 }}
              title="Remove file"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}

      {/* Pasted text attachments */}
      {textAttachments.map((_, idx) => (
        <div key={idx} style={{
          display: "flex", alignItems: "center", gap: 8,
          background: theme.isDark ? "#27272A" : theme.surface2, padding: "6px 10px", borderRadius: 8,
          border: `1px solid ${theme.isDark ? "#3F3F46" : theme.border}`, fontSize: 13, color: theme.ink
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, opacity: 0.9 }}>
            <FileText size={14} color={theme.inkSoft} />
            <span style={{ fontWeight: 500 }}>Pasted Context</span>
          </div>
          <button
            onClick={() => onRemoveText(idx)}
            style={{ background: "transparent", border: "none", cursor: "pointer", color: theme.inkSoft, display: "flex", padding: 2, marginLeft: 4 }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
