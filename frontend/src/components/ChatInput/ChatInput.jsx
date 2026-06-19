import { useState, useRef } from "react";

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

function ChatInput({ onSend, disabled = false, placeholder = "Ask me anything about cars…" }) {
  const [input, setInput] = useState("");
  const textareaRef = useRef(null);

  const canSend = input.trim().length > 0 && !disabled;

  const handleSend = () => {
    if (!canSend) return;
    onSend(input.trim());
    setInput("");
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleChange = (e) => {
    setInput(e.target.value);
    // Auto grow
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{ padding: "12px 16px 16px", borderTop: "1px solid var(--border-subtle)", background: "var(--bg-base)" }}>
      <div style={{
        display: "flex",
        alignItems: "flex-end",
        gap: "10px",
        background: "var(--bg-card)",
        border: "1px solid var(--border-strong)",
        borderRadius: "var(--radius-lg)",
        padding: "10px 10px 10px 16px",
        boxShadow: "var(--shadow-md)",
        transition: "border-color 0.15s ease",
        maxWidth: "760px",
        margin: "0 auto",
      }}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            resize: "none",
            fontSize: "14px",
            color: "var(--text-primary)",
            fontFamily: "inherit",
            lineHeight: 1.6,
            maxHeight: "160px",
            overflowY: "auto",
            opacity: disabled ? 0.5 : 1,
          }}
        />
        <button
          onClick={handleSend}
          disabled={!canSend}
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: canSend ? "var(--btn-dark-bg)" : "var(--bg-surface)",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: canSend ? "var(--btn-dark-text)" : "var(--text-muted)",
            cursor: canSend ? "pointer" : "not-allowed",
            flexShrink: 0,
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => { if (canSend) e.currentTarget.style.background = "var(--btn-dark-hover)"; }}
          onMouseLeave={(e) => { if (canSend) e.currentTarget.style.background = "var(--btn-dark-bg)"; }}
        >
          <SendIcon />
        </button>
      </div>

      <p style={{ textAlign: "center", fontSize: "11px", color: "var(--text-muted)", marginTop: "8px" }}>
        Press{" "}
        <kbd style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "4px", padding: "1px 5px", fontSize: "10.5px", fontFamily: "inherit" }}>Enter</kbd>
        {" "}to send ·{" "}
        <kbd style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "4px", padding: "1px 5px", fontSize: "10.5px", fontFamily: "inherit" }}>Shift+Enter</kbd>
        {" "}for new line
      </p>
    </div>
  );
}

export default ChatInput;
