import { useChatStore } from "../../store/chatStore";
import ChatWindow from "../../components/ChatWindow/ChatWindow";
import ChatInput from "../../components/ChatInput/ChatInput";

/* ─── Minimal Welcome State (Claude / ChatGPT style) ────── */
function WelcomeScreen() {
  return (
    <div style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 20px",
      textAlign: "center",
    }}>
      <div style={{ maxWidth: "560px", animation: "fadeUp 0.3s ease both" }}>
        <h1 style={{
          fontSize: "clamp(26px, 4vw, 36px)",
          fontWeight: 700,
          color: "var(--text-primary)",
          letterSpacing: "-0.03em",
          marginBottom: "12px",
          lineHeight: 1.25,
        }}>
          What's happening with your car?
        </h1>
        <p style={{
          fontSize: "15px",
          color: "var(--text-secondary)",
          lineHeight: 1.6,
          margin: 0,
        }}>
          Ask any question about vehicle diagnostics, engine codes, symptoms, or maintenance advice.
        </p>
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
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--bg-base)" }}>

      {/* Show minimal welcome screen OR message thread */}
      {hasMessages || dualResponse ? (
        <ChatWindow messages={activeConv?.messages ?? []} isTyping={isTyping} dualResponse={dualResponse} />
      ) : (
        <WelcomeScreen />
      )}

      {/* Floating minimal input bar — no top border line */}
      <ChatInput onSend={handleSend} disabled={inputDisabled} />

    </div>
  );
}

export default ChatPage;
