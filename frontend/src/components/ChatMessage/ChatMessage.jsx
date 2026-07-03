import { useAuthStore } from "../../store/authStore";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/* ─── Icons ─────────────────────────────────────────────── */
const UserIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const CarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 17H3a2 2 0 0 1-2-2v-3l3-3L6 7h12l2 3 3 3v2a2 2 0 0 1-2 2h-2"/>
    <circle cx="7.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/>
  </svg>
);

/* ─── Format timestamp ───────────────────────────────────── */
function formatTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/* ─── ChatMessage ────────────────────────────────────────── */
function ChatMessage({ message }) {
  const { user } = useAuthStore();
  const isUser = message.role === "user";

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div style={{
      display: "flex",
      flexDirection: isUser ? "row-reverse" : "row",
      gap: "10px",
      alignItems: "flex-start",
      animation: "fadeIn 0.25s ease both",
      padding: "0 4px",
    }}>
      {/* Avatar */}
      <div style={{
        width: "30px",
        height: "30px",
        borderRadius: "50%",
        background: isUser ? "linear-gradient(135deg, var(--accent), var(--accent-hover))" : "var(--accent)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        color: "white",
        fontSize: "10px",
        fontWeight: 700,
        boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
        marginTop: "2px",
      }}>
        {isUser ? initials : <CarIcon />}
      </div>

      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isUser ? "flex-end" : "flex-start",
        maxWidth: "85%",
      }}>
        {/* Header */}
        <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "4px", padding: "0 4px" }}>
          {isUser ? "You" : "Car Specialist"}
        </span>

        {/* Message Bubble */}
        <div style={{
          background: isUser ? "var(--btn-dark-bg)" : "var(--bg-card)",
          color: isUser ? "var(--btn-dark-text)" : "var(--text-primary)",
          padding: "12px 16px",
          borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          fontSize: "13.5px",
          lineHeight: 1.6,
          boxShadow: "var(--shadow-sm)",
          border: isUser ? "none" : "1px solid var(--border-subtle)",
          position: "relative",
        }}>
          {isUser ? (
            <p style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{message.content}</p>
          ) : (
            <div className="markdown-body" style={{ color: "inherit", fontSize: "inherit", lineHeight: "inherit", wordBreak: "break-word" }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Timestamp */}
        {message.timestamp && (
          <span style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "4px", padding: "0 4px" }}>
            {formatTime(message.timestamp)}
          </span>
        )}
      </div>
    </div>
  );
}

export default ChatMessage;
