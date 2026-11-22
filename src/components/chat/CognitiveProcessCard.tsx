import { useState, useEffect } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import type { ThemeType } from '../../theme';

export interface CognitiveStepSource {
  title: string;
  url: string;
  domain?: string;
  isVideo?: boolean;
}

export interface CognitiveStep {
  title: string;
  detail?: string;
  status?: 'completed' | 'active';
  sources?: CognitiveStepSource[];
}

export interface CognitiveProcessCardProps {
  theme: ThemeType;
  phase?: 'THINKING' | 'WORKING' | 'COMPLETED';
  subText?: string;
  steps?: CognitiveStep[];
  isLive?: boolean;
  startTime?: number;
  durationSeconds?: number;
  hadTools?: boolean;
}

function isBoilerplateDetail(text?: string): boolean {
  if (!text) return true;
  const lower = text.trim().toLowerCase();
  return (
    lower.includes('evaluating request context') ||
    lower.includes('analyzing request context') ||
    lower.includes('analyzed request context') ||
    lower.includes('preparing actions') ||
    lower.includes('formulated plan') ||
    lower.includes('cognitive steps completed') ||
    lower === 'analyzing' ||
    lower === 'analyzed' ||
    lower === 'thinking' ||
    lower === 'thinking...' ||
    lower === 'working' ||
    lower === 'working...'
  );
}

function isThoughtStep(step: CognitiveStep): boolean {
  const t = (step.title || '').trim().toLowerCase();
  return (
    t === 'thinking' ||
    t === 'thinking process' ||
    t === 'thought' ||
    t === 'thought process' ||
    t === 'reasoning' ||
    t === 'reasoning process' ||
    t === 'analyzing' ||
    t === 'analyzed'
  );
}

function getCleanSubText(subText?: string): string | null {
  if (!subText) return null;
  const trimmed = subText.trim();
  const lower = trimmed.toLowerCase();

  // Filter out redundant raw placeholders
  if (
    lower === 'thinking' ||
    lower === 'thinking...' ||
    lower === 'working' ||
    lower === 'working...' ||
    lower === 'analyzing' ||
    lower === 'analyzed' ||
    isBoilerplateDetail(trimmed)
  ) {
    return null;
  }

  // Cap nicely for inline display (allows natural cognitive phrasing)
  if (trimmed.length > 80) {
    return trimmed.slice(0, 77) + '...';
  }
  return trimmed;
}

function isMetaRuleSentence(sentence: string): boolean {
  const lower = sentence.toLowerCase();
  return (
    lower.includes('vendor name') ||
    lower.includes('external model') ||
    lower.includes('provider name') ||
    lower.includes('own engine') ||
    lower.includes('system prompt') ||
    lower.includes('system instruction') ||
    lower.includes('whitelabel') ||
    lower.includes('avoid mentioning') ||
    lower.includes('never mention') ||
    lower.includes('must not mention') ||
    lower.includes('table-first') ||
    lower.includes('em-dash') ||
    lower.includes('no header') ||
    lower.includes('next action offer') ||
    lower.includes('tactical insight') ||
    lower.includes('include figures') ||
    lower.includes('grounded in search') ||
    lower.includes('specs/details') ||
    /\bpunchy\b/.test(lower)
  );
}

/**
 * Extracts only the executive intent / opening formulation from raw reasoning text (Option A).
 * Discards internal scratchpad calculations, prompt rule debates, and self-checks.
 */
function extractExecutiveSummary(rawReasoning?: string): string {
  if (!rawReasoning || typeof rawReasoning !== 'string') return '';
  const trimmed = rawReasoning.trim();
  if (!trimmed) return '';

  // Clean meta headers like "Thinking Process:" or "Thought Process:"
  const cleaned = trimmed
    .replace(/^(?:thinking process|thought process|reasoning process|reasoning):\s*/i, '')
    .trim();

  // Split into distinct blocks separated by blank lines and drop meta-prompt rule checks
  const rawBlocks = cleaned.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);
  const blocks = rawBlocks
    .map(block => {
      const sentences = block.split(/(?<=[.!?])\s+/).filter(s => s.trim() && !isMetaRuleSentence(s));
      return sentences.join(' ').trim();
    })
    .filter(Boolean);

  if (blocks.length === 0) return '';
  let candidate = blocks[0];

  // If the first block is a short header (< 30 chars), combine with the next block
  if (candidate.length < 30 && blocks.length > 1) {
    candidate = `${candidate} ${blocks[1]}`;
  }

  // If the executive block is overly verbose (> 320 chars), extract the first 1-2 complete sentences
  if (candidate.length > 320) {
    const sentenceMatch = candidate.match(/^((?:[^.!?\n]+[.!?\n]){1,2})/);
    if (sentenceMatch && sentenceMatch[1].trim().length >= 35) {
      candidate = sentenceMatch[1].trim();
    } else {
      const truncated = candidate.slice(0, 300);
      const lastSpace = truncated.lastIndexOf(' ');
      candidate = (lastSpace > 200 ? truncated.slice(0, lastSpace) : truncated).trim() + '...';
    }
  }

  return candidate.trim();
}

/**
 * Formats duration in seconds to human-friendly units:
 * - < 60s -> "20s"
 * - >= 60s -> "1m 15s" or "2m"
 * - >= 3600s -> "1h 5m" or "2h"
 */
export function formatDuration(totalSeconds: number): string {
  const secs = Math.max(0, Math.round(totalSeconds));
  if (secs < 60) {
    return `${secs}s`;
  }
  const hours = Math.floor(secs / 3600);
  const minutes = Math.floor((secs % 3600) / 60);
  const remainingSecs = secs % 60;

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }

  return remainingSecs > 0 ? `${minutes}m ${remainingSecs}s` : `${minutes}m`;
}

export function CognitiveProcessCard({
  theme,
  phase = 'COMPLETED',
  subText,
  steps = [],
  isLive = false,
  startTime,
  durationSeconds,
  hadTools = false
}: CognitiveProcessCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [elapsed, setElapsed] = useState(() => {
    if (!startTime) return 0;
    return Math.max(0, Math.floor((Date.now() - startTime) / 1000));
  });

  useEffect(() => {
    if (!isLive || !startTime) return;
    setElapsed(Math.max(0, Math.floor((Date.now() - startTime) / 1000)));
    const interval = setInterval(() => {
      setElapsed(Math.max(0, Math.floor((Date.now() - startTime) / 1000)));
    }, 1000);
    return () => clearInterval(interval);
  }, [isLive, startTime]);

  const effectiveDuration = (durationSeconds !== undefined && durationSeconds > 0)
    ? durationSeconds
    : (elapsed > 0 ? elapsed : 1);

  const isWorking = phase === 'WORKING';

  // Separate thought steps and real tool/action steps upfront
  const thoughtSteps = (steps || []).filter(isThoughtStep);
  let curatedThought = '';
  for (let i = thoughtSteps.length - 1; i >= 0; i--) {
    const summary = extractExecutiveSummary(thoughtSteps[i].detail);
    if (summary && !isBoilerplateDetail(summary)) {
      curatedThought = summary;
      break;
    }
  }

  const actionSteps = (steps || []).filter(s => !isThoughtStep(s));
  const deduplicatedActions = actionSteps.reduce<CognitiveStep[]>((acc, current) => {
    const last = acc[acc.length - 1];
    if (last && last.title === current.title && last.detail === current.detail) {
      if (current.status === 'active') last.status = 'active';
      if (Array.isArray(current.sources) && current.sources.length > 0) {
        const merged = [...(last.sources || []), ...current.sources];
        const seen = new Set<string>();
        last.sources = merged.filter(s => {
          if (!s?.url || seen.has(s.url)) return false;
          seen.add(s.url);
          return true;
        });
      }
      return acc;
    }
    acc.push({ ...current });
    return acc;
  }, []);

  const hasActions = deduplicatedActions.length > 0;
  const hasThought = !!curatedThought;
  const canExpand = isLive || hadTools || hasActions;

  // Determine main header title
  let mainTitle = 'Thinking';
  if (isLive) {
    mainTitle = isWorking ? 'Working' : 'Thinking';
  } else {
    // Completed state: clean single-line title (e.g. "Worked 20s", "Worked 1m 15s", or "Thought 2s")
    const actionVerb = hadTools || hasActions ? 'Worked' : 'Thought';
    mainTitle = `${actionVerb} ${formatDuration(effectiveDuration)}`;
  }

  const cleanSub = isLive ? getCleanSubText(subText) : null;

  return (
    <div style={{
      width: "100%",
      maxWidth: 620,
      fontFamily: "Inter, sans-serif",
      display: "flex",
      flexDirection: "column",
      marginBottom: isLive ? 12 : 8
    }}>
      {/* Main Cognitive Bar: Clean, Borderless & Capsule-Free */}
      <button
        type="button"
        onClick={() => canExpand && setIsOpen(!isOpen)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "5px 4px",
          background: "transparent",
          border: "none",
          cursor: canExpand ? "pointer" : "default",
          outline: "none",
          textAlign: "left",
          gap: 12
        }}
      >
        {/* Left Side: Status & Optional Sub-text */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
            <span style={{
              color: theme.ink,
              fontWeight: 600,
              fontSize: 13,
              letterSpacing: "-0.01em"
            }}>
              {mainTitle}
            </span>

            {/* Non-redundant distinct subtext */}
            {cleanSub && (
              <span style={{
                color: theme.inkSoft,
                fontSize: 12,
                fontWeight: 450,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}>
                • {cleanSub}
              </span>
            )}
          </div>
        </div>

        {/* Right Side: Timer & Enlarged Dropdown Icon */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          {isLive && elapsed > 0 && (
            <span style={{
              fontSize: 11.5,
              color: theme.inkFaint,
              fontFamily: "monospace",
              marginRight: 2
            }}>
              {formatDuration(elapsed)}
            </span>
          )}
          {canExpand && (
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 26,
              height: 26,
              borderRadius: 6,
              color: theme.inkSoft,
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease"
            }}>
              <ChevronDown size={19} />
            </div>
          )}
        </div>
      </button>

      {/* Sub-process Flow Capsule (Only renders inside a container when toggled open) */}
      {canExpand && isOpen && (
          <div style={{
            marginTop: 6,
            padding: "10px 14px 12px",
            borderRadius: 12,
            background: theme.surface2,
            border: `1px solid ${theme.border}`,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
          }}>
            {/* Section 1: Agent Genuine Thought / Reasoning (Direct, clean neutral card) */}
            {hasThought && (
              <div style={{
                fontSize: 11.5,
                color: theme.inkSoft,
                lineHeight: 1.55,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                background: "rgba(0,0,0,0.025)",
                padding: "8px 10px",
                borderRadius: 8,
                border: `1px solid ${theme.border}`,
                fontFamily: "Inter, sans-serif"
              }}>
                {curatedThought}
              </div>
            )}

            {/* Section 2: Real Action Steps (e.g. Tools executed) */}
            {hasActions && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {deduplicatedActions.map((step, idx) => {
                  const isStepActive = isLive && (step.status === 'active' || (!step.status && idx === deduplicatedActions.length - 1));
                  return (
                    <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
                      {isStepActive ? (
                        <div style={{
                          marginTop: 4,
                          width: 9,
                          height: 9,
                          borderRadius: "50%",
                          border: `2px solid ${theme.accent}35`,
                          borderTopColor: theme.accent,
                          animation: "cognitive-spin 0.85s linear infinite",
                          flexShrink: 0
                        }} />
                      ) : (
                        <div style={{
                          marginTop: 5,
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background: theme.accent,
                          flexShrink: 0
                        }} />
                      )}
                      <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0, flex: 1 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: theme.ink }}>
                          {step.title}
                        </span>
                        {step.detail && (
                          <span style={{ fontSize: 11, color: theme.inkFaint, lineHeight: 1.4 }}>
                            {step.detail.replace(/^Address user inquiry:\s*/i, '').replace(/^Respond to user:\s*/i, '')}
                          </span>
                        )}
                        {Array.isArray(step.sources) && step.sources.length > 0 && (
                          <div style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 5,
                            marginTop: 4
                          }}>
                            {step.sources.map((src, sIdx) => {
                              const displayLabel = src.domain || src.title;
                              const faviconDomain = src.domain || (() => {
                                try { return new URL(src.url).hostname.replace(/^www\./i, ''); } catch { return ''; }
                              })();
                              return (
                                <a
                                  key={`${src.url}-${sIdx}`}
                                  href={src.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title={src.title}
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 5,
                                    padding: "3px 8px",
                                    borderRadius: 999,
                                    border: `1px solid ${theme.border}`,
                                    background: theme.isDark ? "rgba(255,255,255,0.04)" : "#FFFFFF",
                                    color: theme.inkSoft,
                                    fontSize: 10.5,
                                    fontWeight: 500,
                                    textDecoration: "none",
                                    maxWidth: 165,
                                    transition: "border-color 0.15s ease, color 0.15s ease"
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = theme.accent;
                                    e.currentTarget.style.color = theme.ink;
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = theme.border;
                                    e.currentTarget.style.color = theme.inkSoft;
                                  }}
                                >
                                  {faviconDomain ? (
                                    <img
                                      src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(faviconDomain)}&sz=32`}
                                      alt=""
                                      width={12}
                                      height={12}
                                      style={{ borderRadius: 2, flexShrink: 0 }}
                                      onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                      }}
                                    />
                                  ) : (
                                    <Globe size={11} style={{ flexShrink: 0, opacity: 0.7 }} />
                                  )}
                                  <span style={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap"
                                  }}>
                                    {displayLabel}
                                  </span>
                                </a>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Section 3: Live In-Progress State (when no actions or thought yet) */}
            {!hasThought && !hasActions && isLive && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  border: `2px solid ${theme.accent}35`,
                  borderTopColor: theme.accent,
                  animation: "cognitive-spin 0.85s linear infinite",
                  flexShrink: 0
                }} />
                <span style={{ fontSize: 11.5, color: theme.inkSoft }}>
                  {isWorking ? 'Executing task...' : 'Reasoning through inquiry...'}
                </span>
              </div>
            )}
          </div>
      )}

      <style>{`
        @keyframes cognitive-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
