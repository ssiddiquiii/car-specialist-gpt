import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../../store/chatStore";
import { useAuthStore } from "../../store/authStore";

/* ─── Icons ─────────────────────────────────────────────── */
const MenuIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

function ChatTopBar() {
  const navigate = useNavigate();
  const { toggleSidebar, sidebarOpen, getActiveConversation, newConversation } = useChatStore();
  const { user } = useAuthStore();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 560);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 560);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const activeConv = getActiveConversation();
  const title = activeConv?.title ?? "Car Specialist GPT";

  const handleNewChat = () => {
    newConversation();
    navigate("/chat");
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <header style={{
      height: "56px",
      background: "var(--bg-card)",
      borderBottom: "1px solid var(--border-subtle)",
      display: "flex",
      alignItems: "center",
      padding: "0 12px",
      gap: "10px",
      flexShrink: 0,
      zIndex: 10,
    }}>
      {/* Sidebar toggle */}
      <button
        onClick={toggleSidebar}
        aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        style={{
          width: "32px", height: "32px", borderRadius: "8px",
          background: "none", border: "1px solid var(--border-subtle)", outline: "none",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--text-secondary)", cursor: "pointer",
          flexShrink: 0, transition: "all 0.12s ease",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-surface)"; e.currentTarget.style.color = "var(--text-primary)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "var(--text-secondary)"; }}
      >
        <MenuIcon />
      </button>

      {/* Current chat title */}
      <span style={{
        flex: 1,
        fontSize: isMobile ? "13px" : "14px",
        fontWeight: 600,
        color: "var(--text-primary)",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        letterSpacing: "-0.01em",
        minWidth: 0,
      }}>
        {title}
      </span>

      {/* New chat — icon only on mobile */}
      <button
        onClick={handleNewChat}
        title="New chat"
        style={{
          display: "flex", alignItems: "center", gap: isMobile ? "0" : "6px",
          background: "none", border: "1px solid var(--border-subtle)", outline: "none",
          borderRadius: "8px",
          padding: isMobile ? "6px" : "6px 12px",
          width: isMobile ? "32px" : "auto",
          height: isMobile ? "32px" : "auto",
          justifyContent: "center",
          fontSize: "12.5px", fontWeight: 500,
          color: "var(--text-secondary)", cursor: "pointer",
          fontFamily: "inherit", transition: "all 0.12s ease",
          flexShrink: 0,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-surface)"; e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.borderColor = "var(--border-strong)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.borderColor = "var(--border-subtle)"; }}
      >
        <PlusIcon />
        {!isMobile && <span>New chat</span>}
      </button>

      {/* User avatar */}
      <div style={{
        width: "30px", height: "30px", borderRadius: "50%",
        background: "linear-gradient(135deg, var(--accent), var(--accent-hover))",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "11px", fontWeight: 700, color: "white",
        flexShrink: 0, cursor: "default",
        userSelect: "none",
      }}>
        {initials}
      </div>
    </header>
  );
}

export default ChatTopBar;
