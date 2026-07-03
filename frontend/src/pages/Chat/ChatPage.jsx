import { useState, useEffect } from "react";
import { useChatStore } from "../../store/chatStore";
import ChatWindow from "../../components/ChatWindow/ChatWindow";
import ChatInput from "../../components/ChatInput/ChatInput";

/* ─── Mobile hook ────────────────────────────────────────── */
function useIsMobile(breakpoint = 560) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < breakpoint);
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, [breakpoint]);
  return isMobile;
}

/* ─── Suggestion prompts ─────────────────────────────────── */
const SUGGESTIONS = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 17H3a2 2 0 0 1-2-2v-3l3-3L6 7h12l2 3 3 3v2a2 2 0 0 1-2 2h-2"/>
        <circle cx="7.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/>
      </svg>
    ),
    label: "Best SUV under $40k",
    prompt: "What are the best SUVs available under $40,000 in 2024?",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
      </svg>
    ),
    label: "Engine oil explained",
    prompt: "Explain the difference between 5W-30 and 10W-40 engine oil and which should I use?",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
      </svg>
    ),
    label: "EV vs Hybrid comparison",
    prompt: "What's the real-world difference between a fully electric vehicle and a plug-in hybrid?",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
      </svg>
    ),
    label: "When to service brakes",
    prompt: "How do I know when my brake pads need to be replaced and what are the warning signs?",
  },
];

const FEATURES = [
  "Diagnostics & troubleshooting",
  "Buying advice",
  "Maintenance schedules",
  "Fuel & performance tips",
  "Insurance guidance",
  "EV & hybrid knowledge",
];

/* ─── Welcome / Empty State ──────────────────────────────── */
function WelcomeScreen({ onSend }) {
  const isMobile = useIsMobile(560);
  return (
    <div style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "32px 20px 0",
      overflow: "hidden",
      position: "relative",
    }}>
      {/* Radial glow */}
      <div style={{
        position: "absolute", top: "8%", left: "50%", transform: "translateX(-50%)",
        width: "600px", height: "360px",
        background: "radial-gradient(ellipse at center, var(--accent-subtle) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "680px", display: "flex", flexDirection: "column", alignItems: "center", gap: "24px" }}>

        {/* Icon + heading */}
        <div style={{ textAlign: "center", animation: "fadeUp 0.4s ease both" }}>
          <div style={{
            width: "56px", height: "56px", borderRadius: "16px",
            background: "linear-gradient(135deg, var(--accent), var(--accent-hover))",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
            boxShadow: "0 8px 32px rgba(200,95,58,0.3)",
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 17H3a2 2 0 0 1-2-2v-3l3-3L6 7h12l2 3 3 3v2a2 2 0 0 1-2 2h-2"/>
              <circle cx="7.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/>
            </svg>
          </div>
          <h1 style={{ fontSize: "clamp(22px, 3vw, 28px)", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.03em", marginBottom: "8px" }}>
            Your Car Specialist is ready
          </h1>
          <p style={{ fontSize: "14.5px", color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: "420px" }}>
            Ask anything about cars — diagnostics, buying advice, maintenance, fuel efficiency, and more.
          </p>
        </div>

        {/* Suggestion cards */}
        <div style={{
          display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
          gap: "10px", width: "100%",
          animation: "fadeUp 0.5s ease 0.1s both",
        }}>
          {SUGGESTIONS.map((s) => (
            <button
              key={s.label}
              onClick={() => onSend(s.prompt)}
              style={{
                display: "flex", alignItems: "flex-start", gap: "10px",
                background: "var(--bg-card)", border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)", padding: "14px 16px",
                textAlign: "left", cursor: "pointer", fontFamily: "inherit",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--accent)";
                e.currentTarget.style.background = "var(--accent-subtle)";
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "var(--shadow-sm)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-subtle)";
                e.currentTarget.style.background = "var(--bg-card)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <span style={{ color: "var(--accent)", flexShrink: 0, marginTop: "1px" }}>{s.icon}</span>
              <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)", lineHeight: 1.4 }}>
                {s.label}
              </span>
            </button>
          ))}
        </div>

        {/* Capability chips */}
        <div style={{ animation: "fadeUp 0.5s ease 0.2s both", textAlign: "center" }}>
          <p style={{ fontSize: "11.5px", color: "var(--text-muted)", marginBottom: "10px" }}>I can help you with</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", justifyContent: "center" }}>
            {FEATURES.map((f) => (
              <span key={f} style={{
                fontSize: "11.5px", fontWeight: 500,
                background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-full)", padding: "4px 12px",
                color: "var(--text-secondary)",
              }}>
                {f}
              </span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

/* ─── ChatPage ───────────────────────────────────────────── */
function ChatPage() {
  const { getActiveConversation, sendMessage, isTyping, dualResponse } = useChatStore();
  const activeConv = getActiveConversation();
  const hasMessages = (activeConv?.messages?.length ?? 0) > 0;
  const inputDisabled = isTyping || !!dualResponse;

  const handleSend = (text) => {
    if (!text.trim()) return;
    sendMessage(text);
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* Show welcome screen OR message thread */}
      {hasMessages || dualResponse ? (
        <ChatWindow messages={activeConv?.messages ?? []} isTyping={isTyping} dualResponse={dualResponse} />
      ) : (
        <WelcomeScreen onSend={handleSend} />
      )}

      {/* Input always at the bottom — disabled while dual card is open */}
      <ChatInput onSend={handleSend} disabled={inputDisabled} />

    </div>
  );
}

export default ChatPage;
