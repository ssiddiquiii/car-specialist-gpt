import { useState, useEffect } from "react";
import { useChatStore } from "../../store/chatStore";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/* ─── Timer hook ─────────────────────────────────────────────── */
function useCountdown(seconds, onExpire) {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    if (remaining <= 0) { onExpire(); return; }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, onExpire]);
  return remaining;
}

/* ─── Single response card ───────────────────────────────────── */
function ResponseCard({ label, response, onChoose, isChosen, disabled }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        border: isChosen
          ? "2px solid var(--accent)"
          : hovered && !disabled
          ? "1.5px solid var(--accent)"
          : "1.5px solid var(--border-subtle)",
        borderRadius: "var(--radius-md)",
        background: isChosen ? "var(--accent-subtle)" : "var(--bg-card)",
        overflow: "hidden",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        boxShadow: hovered && !disabled ? "var(--shadow-md)" : "var(--shadow-sm)",
      }}
    >
      {/* Card header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 14px",
        borderBottom: "1px solid var(--border-subtle)",
        background: "var(--bg-surface)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{
            fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em",
            textTransform: "uppercase", color: "var(--accent)",
            background: "var(--accent-subtle)", padding: "2px 8px",
            borderRadius: "var(--radius-full)", border: "1px solid var(--accent)",
          }}>
            {label}
          </span>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
            {response.token_count} tokens · {Math.round(response.latency_ms / 1000)}s
          </span>
        </div>
        {isChosen && (
          <span style={{ fontSize: "11px", color: "var(--accent)", fontWeight: 600 }}>✓ Selected</span>
        )}
      </div>

      {/* Content */}
      <div className="markdown-body" style={{ flex: 1, padding: "14px 16px", overflowY: "auto", maxHeight: "340px", fontSize: "13px", lineHeight: 1.6, color: "var(--text-primary)" }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{response.content}</ReactMarkdown>
      </div>

      {/* Choose button */}
      <div style={{ padding: "10px 14px", borderTop: "1px solid var(--border-subtle)" }}>
        <button
          onClick={() => !disabled && onChoose()}
          disabled={disabled}
          style={{
            width: "100%",
            padding: "8px 16px",
            borderRadius: "var(--radius-sm)",
            border: "none",
            fontSize: "12.5px",
            fontWeight: 600,
            fontFamily: "inherit",
            cursor: disabled ? "not-allowed" : "pointer",
            transition: "all 0.15s ease",
            background: isChosen
              ? "var(--accent)"
              : "var(--btn-dark-bg)",
            color: isChosen ? "white" : "var(--btn-dark-text)",
            opacity: disabled && !isChosen ? 0.5 : 1,
          }}
        >
          {isChosen ? "✓ Using this response" : "Use this response"}
        </button>
      </div>
    </div>
  );
}

function DualResponseCard() {
  const dualResponse = useChatStore((state) => state.dualResponse);
  const chooseDualResponse = useChatStore((state) => state.chooseDualResponse);
  const stopGeneration = useChatStore((state) => state.stopGeneration);
  const [chosen, setChosen] = useState(null); // 'a', 'b', or 'skipped'

  if (!dualResponse) return null;

  const isStreaming = !dualResponse.streaming_complete;

  const handleChoose = (pick) => {
    if (chosen) return;
    setChosen(pick);
    chooseDualResponse(pick);
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      animation: "fadeIn 0.3s ease both",
      padding: "0 4px",
    }}>
      {/* Header row */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: "12px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Sparkle icon */}
          <div style={{
            width: "28px", height: "28px", borderRadius: "50%",
            background: "linear-gradient(135deg, var(--accent), var(--accent-hover))",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
            </svg>
          </div>
          <div>
            <p style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
              {isStreaming ? "Generating two responses..." : "Two responses generated"}
            </p>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0 }}>
              {isStreaming ? "Please wait for options A and B to finish typing." : "Choose the better one — your choice helps improve the AI"}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          {/* Typing Indicator */}
          {isStreaming && (
            <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "0 8px" }}>
              <div className="typing-dot"></div>
              <div className="typing-dot" style={{ animationDelay: "0.2s" }}></div>
              <div className="typing-dot" style={{ animationDelay: "0.4s" }}></div>
            </div>
          )}
          
          {/* Stop / Skip button */}
          {isStreaming ? (
            <button
              onClick={() => stopGeneration()}
              style={{
                display: "flex", alignItems: "center", gap: "4px",
                fontSize: "11px", padding: "5px 12px", borderRadius: "var(--radius-full)",
                border: "1px solid var(--border-subtle)", background: "transparent",
                color: "var(--text-muted)", cursor: "pointer", fontFamily: "inherit",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--text-muted)"; e.currentTarget.style.color = "var(--text-primary)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-subtle)"; e.currentTarget.style.color = "var(--text-muted)"; }}
              title="Stop Generation"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <rect x="4" y="4" width="16" height="16" rx="2" />
              </svg>
              Stop
            </button>
          ) : !chosen && (
            <button
              onClick={() => handleChoose("skipped")}
              style={{
                fontSize: "11px", padding: "5px 12px", borderRadius: "var(--radius-full)",
                border: "1px solid var(--border-subtle)", background: "transparent",
                color: "var(--text-muted)", cursor: "pointer", fontFamily: "inherit",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--text-muted)"; e.currentTarget.style.color = "var(--text-primary)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-subtle)"; e.currentTarget.style.color = "var(--text-muted)"; }}
            >
              Skip
            </button>
          )}
        </div>
      </div>

      {/* Dual cards */}
      <div style={{ display: "flex", gap: "12px", alignItems: "stretch", flexWrap: "wrap" }}>
        <ResponseCard
          label="Response A"
          response={dualResponse.response_a}
          onChoose={() => handleChoose("a")}
          isChosen={chosen === "a"}
          disabled={!!chosen || isStreaming}
        />
        <ResponseCard
          label="Response B"
          response={dualResponse.response_b}
          onChoose={() => handleChoose("b")}
          isChosen={chosen === "b"}
          disabled={!!chosen || isStreaming}
        />
      </div>
    </div>
  );
}

export default DualResponseCard;
