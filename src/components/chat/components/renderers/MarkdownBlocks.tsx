import { useState, useEffect, useRef, useCallback } from 'react';
import { Copy, Check } from "lucide-react";
import type { ThemeType } from "../../../../theme";

export function ClearChatCountdownCard({ theme, onClear }: { theme: ThemeType; onClear: () => void }) {
  const [timeLeft, setTimeLeft] = useState(5);
  const [canceled, setCanceled] = useState(false);

  useEffect(() => {
    if (canceled) return;
    if (timeLeft <= 0) {
      onClear();
      return;
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, canceled, onClear]);

  if (canceled) {
    return <div style={{ color: theme.inkFaint, fontSize: 13, fontStyle: 'italic', padding: '8px 0' }}>Chat history clearing canceled.</div>;
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: theme.surface2,
      border: `1px solid ${theme.border}`,
      borderRadius: 12,
      padding: '10px 14px',
      marginTop: 4,
      width: '100%',
      maxWidth: 300
    }}>
      <div style={{ fontSize: 14, color: theme.ink, fontWeight: 500 }}>
        Clearing chat in <span style={{ color: '#EF4444', fontWeight: 700, marginLeft: 2 }}>{timeLeft}</span>
      </div>
      <button
        onClick={() => setCanceled(true)}
        style={{
          background: theme.surface, border: `1px solid ${theme.border}`, color: theme.ink,
          padding: '5px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500,
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)', transition: 'background 0.2s'
        }}
      >
        Cancel
      </button>
    </div>
  );
}

export function CodeBlockCard({ children, theme }: { children: any; theme: ThemeType }) {
  const [copied, setCopied] = useState(false);

  const extractText = (child: any): string => {
    if (!child) return '';
    if (typeof child === 'string') return child;
    if (Array.isArray(child)) return child.map(extractText).join('');
    if (child.props && child.props.children) return extractText(child.props.children);
    return '';
  };

  const rawText = extractText(children).trim();
  const langMatch = children?.props?.className ? /language-(\w+)/.exec(children.props.className) : null;
  const language = langMatch ? langMatch[1].toUpperCase() : 'LOGIC / CODE';

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!rawText) return;
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        margin: "14px 0",
        borderRadius: 10,
        border: `1px solid ${theme.border}`,
        background: theme.surface2 || "rgba(0,0,0,0.03)",
        overflow: "hidden",
        fontSize: "0.9em",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "7px 12px",
          background: theme.surface || "rgba(0,0,0,0.02)",
          borderBottom: `1px solid ${theme.border}`,
          fontSize: "0.78em",
          fontWeight: 600,
          color: theme.inkSoft,
          letterSpacing: "0.04em",
          userSelect: "none"
        }}
      >
        <span>{language}</span>
        <button
          onClick={handleCopy}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            background: "transparent",
            border: "none",
            color: copied ? "#10B981" : theme.inkSoft,
            cursor: "pointer",
            fontSize: "0.95em",
            fontWeight: 500,
            padding: "2px 6px",
            borderRadius: 4,
            transition: "all 0.2s ease"
          }}
          title="Salin ke clipboard"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          <span>{copied ? "Disalin!" : "Salin"}</span>
        </button>
      </div>
      <pre
        style={{
          margin: 0,
          padding: "12px 14px",
          color: theme.ink,
          background: "transparent",
          fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
          fontSize: "0.92em",
          lineHeight: 1.55,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          overflowX: "hidden",
        }}
      >
        {children}
      </pre>
    </div>
  );
}

export interface MiniBarChartProps {
  title?: string;
  description?: string;
  footer?: string;
  items: Array<{
    label: string;
    value?: string;
    percentage: number;
    color?: string;
  }>;
  theme: ThemeType;
}

export function MiniBarChart({ title, description, footer, items, theme }: MiniBarChartProps) {
  return (
    <div style={{
      margin: "16px 0 20px 0",
      display: "flex",
      flexDirection: "column",
      gap: 10,
      maxWidth: 520,
      width: "100%"
    }}>
      {title && (
        <div style={{ fontWeight: 700, fontSize: "1.05em", color: theme.ink, lineHeight: 1.3 }}>
          {title}
        </div>
      )}
      {description && (
        <div style={{ fontSize: "0.86em", color: theme.inkSoft, lineHeight: 1.4 }}>
          {description}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 4 }}>
        {items.map((item, idx) => (
          <div key={idx} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: "0.92em" }}>
              <span style={{ fontWeight: 700, color: theme.ink }}>{item.label}</span>
              {item.value && <span style={{ fontWeight: 600, color: theme.ink }}>{item.value}</span>}
            </div>
            <div style={{
              width: "100%",
              height: 7,
              borderRadius: 999,
              background: theme.surface2 || "rgba(0,0,0,0.06)",
              overflow: "hidden",
              position: "relative"
            }}>
              <div style={{
                height: "100%",
                width: `${Math.min(100, Math.max(0, item.percentage))}%`,
                borderRadius: 999,
                background: item.color || (idx === 0 ? "#3B82F6" : "#60A5FA"),
                transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
              }} />
            </div>
          </div>
        ))}
      </div>
      {footer && (
        <div style={{ fontSize: "0.78em", color: theme.inkFaint, fontStyle: "italic", marginTop: 2 }}>
          {footer}
        </div>
      )}
    </div>
  );
}

export function DraggableTableContainer({ children, theme }: { children: React.ReactNode; theme?: ThemeType }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const isDownRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);

  const checkScrollability = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const hasOverflow = el.scrollWidth > el.clientWidth + 2;
    setCanScrollLeft(hasOverflow && el.scrollLeft > 4);
    setCanScrollRight(hasOverflow && Math.ceil(el.scrollLeft + el.clientWidth) < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    checkScrollability();
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver(() => {
      checkScrollability();
    });
    observer.observe(el);

    const timer = setTimeout(checkScrollability, 100);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [checkScrollability]);

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDownRef.current) return;
      const el = containerRef.current;
      if (!el) return;

      const deltaX = e.clientX - startXRef.current;
      if (Math.abs(deltaX) > 3) {
        if (!hasMovedRef.current) {
          hasMovedRef.current = true;
          setIsDragging(true);
        }
        el.scrollLeft = startScrollLeftRef.current - deltaX;
        checkScrollability();
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDownRef.current) {
        isDownRef.current = false;
        setIsDragging(false);
      }
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [checkScrollability]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const el = containerRef.current;
    if (!el) return;
    if (el.scrollWidth <= el.clientWidth + 2) return;

    isDownRef.current = true;
    startXRef.current = e.clientX;
    startScrollLeftRef.current = el.scrollLeft;
    hasMovedRef.current = false;
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth + 2) return;

      if (Math.abs(e.deltaY) > 0 && Math.abs(e.deltaX) === 0) {
        const atStart = el.scrollLeft <= 0;
        const atEnd = Math.ceil(el.scrollLeft + el.clientWidth) >= el.scrollWidth - 1;

        if ((e.deltaY > 0 && !atEnd) || (e.deltaY < 0 && !atStart)) {
          e.preventDefault();
          el.scrollLeft += e.deltaY;
          checkScrollability();
        }
      } else {
        checkScrollability();
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [checkScrollability]);

  const hasOverflow = canScrollLeft || canScrollRight;

  const isDark = Boolean(theme?.isDark);
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.12)' : (theme?.border || 'rgba(0, 0, 0, 0.1)');
  const cardBg = isDark ? '#111113' : '#FFFFFF';

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '100%',
        margin: '14px 0 18px 0',
        border: `1px solid ${borderColor}`,
        borderRadius: 12,
        background: cardBg,
        overflow: 'hidden'
      }}
    >
      <div
        ref={containerRef}
        className="clean-table-container"
        onMouseDown={handleMouseDown}
        onScroll={checkScrollability}
        style={{
          cursor: isDragging ? 'grabbing' : (hasOverflow ? 'grab' : 'auto'),
          userSelect: isDragging ? 'none' : 'auto',
          WebkitUserSelect: isDragging ? 'none' : 'auto',
        }}
      >
        {children}
      </div>
    </div>
  );
}
