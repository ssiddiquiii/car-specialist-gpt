import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../../store/chatStore";
import { useAuthStore } from "../../store/authStore";
import { useThemeStore } from "../../store/themeStore";

/* ─── Icons ─────────────────────────────────────────────── */
const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const CarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 17H3a2 2 0 0 1-2-2v-3l3-3L6 7h12l2 3 3 3v2a2 2 0 0 1-2 2h-2"/>
    <circle cx="7.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);
const ChatIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const LogoutIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const EditIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

/* ─── Helpers ────────────────────────────────────────────── */
function groupByDate(conversations) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const weekAgo = new Date(today.getTime() - 7 * 86400000);

  const groups = { Today: [], Yesterday: [], "This Week": [], Older: [] };

  conversations.forEach((c) => {
    const d = new Date(c.createdAt);
    if (d >= today) groups["Today"].push(c);
    else if (d >= yesterday) groups["Yesterday"].push(c);
    else if (d >= weekAgo) groups["This Week"].push(c);
    else groups["Older"].push(c);
  });

  return groups;
}

/* ─── Single Conversation Row ────────────────────────────── */
function ConvRow({ conv, isActive, onSelect, onDelete, onRename }) {
  const [hovering, setHovering] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState(conv.title);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commitRename = () => {
    const trimmed = editVal.trim();
    if (trimmed && trimmed !== conv.title) onRename(conv.id, trimmed);
    setEditing(false);
  };

  return (
    <div
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onClick={() => !editing && onSelect(conv.id)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 10px",
        borderRadius: "var(--radius-sm)",
        cursor: "pointer",
        background: isActive ? "var(--accent-subtle)" : hovering ? "var(--bg-surface)" : "transparent",
        border: isActive ? "1px solid var(--accent-subtle2)" : "1px solid transparent",
        transition: "all 0.12s ease",
        position: "relative",
        marginBottom: "1px",
      }}
    >
      <span style={{ color: isActive ? "var(--accent)" : "var(--text-muted)", flexShrink: 0, marginTop: "1px" }}>
        <ChatIcon />
      </span>

      {editing ? (
        <input
          ref={inputRef}
          value={editVal}
          onChange={(e) => setEditVal(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") setEditing(false); }}
          onClick={(e) => e.stopPropagation()}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            fontSize: "13px",
            fontFamily: "inherit",
            color: "var(--text-primary)",
            padding: 0,
          }}
        />
      ) : (
        <span style={{
          flex: 1,
          fontSize: "13px",
          color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
          fontWeight: isActive ? 500 : 400,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {conv.title}
        </span>
      )}

      {/* Action buttons on hover */}
      {hovering && !editing && (
        <div style={{ display: "flex", gap: "2px", flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setEditing(true)}
            title="Rename"
            style={{
              width: "22px", height: "22px", borderRadius: "5px",
              background: "none", border: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--text-muted)", cursor: "pointer",
              transition: "all 0.1s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-card)"; e.currentTarget.style.color = "var(--text-primary)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "var(--text-muted)"; }}
          >
            <EditIcon />
          </button>
          <button
            onClick={() => onDelete(conv.id)}
            title="Delete"
            style={{
              width: "22px", height: "22px", borderRadius: "5px",
              background: "none", border: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--text-muted)", cursor: "pointer",
              transition: "all 0.1s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(220,38,38,0.1)"; e.currentTarget.style.color = "#dc2626"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "var(--text-muted)"; }}
          >
            <TrashIcon />
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Sidebar ────────────────────────────────────────────── */
function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isDark, toggle } = useThemeStore();
  const {
    conversations,
    activeConversationId,
    sidebarOpen,
    newConversation,
    selectConversation,
    deleteConversation,
    renameConversation,
  } = useChatStore();

  const groups = groupByDate(conversations);

  const handleNewChat = () => {
    newConversation();
    navigate("/chat");
  };

  const handleSelect = (id) => {
    selectConversation(id);
    navigate("/chat");
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <aside
      style={{
        width: sidebarOpen ? "260px" : "0px",
        minWidth: sidebarOpen ? "260px" : "0px",
        height: "100vh",
        background: "var(--bg-card)",
        borderRight: "1px solid var(--border-subtle)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        transition: "width 0.25s ease, min-width 0.25s ease",
        flexShrink: 0,
        position: "relative",
        zIndex: 45,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", height: "100%", opacity: sidebarOpen ? 1 : 0, transition: "opacity 0.2s ease", minWidth: "260px" }}>

        {/* ── Header ── */}
        <div style={{ padding: "16px 12px 12px", borderBottom: "1px solid var(--border-subtle)" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", padding: "0 2px" }}>
            <div style={{
              width: 28, height: 28, borderRadius: "8px",
              background: "linear-gradient(135deg, var(--accent), var(--accent-hover))",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <CarIcon />
            </div>
            <span style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
              Car Specialist <span style={{ color: "var(--accent)" }}>GPT</span>
            </span>
          </div>

          {/* New Chat button */}
          <button
            onClick={handleNewChat}
            style={{
              width: "100%",
              display: "flex", alignItems: "center", gap: "8px",
              background: "var(--btn-dark-bg)",
              color: "var(--btn-dark-text)",
              border: "none",
              borderRadius: "var(--radius-sm)",
              padding: "9px 14px",
              fontSize: "13px", fontWeight: 600, fontFamily: "inherit",
              cursor: "pointer",
              transition: "background 0.15s ease",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "var(--btn-dark-hover)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "var(--btn-dark-bg)"}
          >
            <PlusIcon />
            New Chat
          </button>
        </div>

        {/* ── Conversation List ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "10px 8px" }}>
          {conversations.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 16px", color: "var(--text-muted)", fontSize: "12.5px" }}>
              No conversations yet.<br />Start a new chat!
            </div>
          ) : (
            Object.entries(groups).map(([label, items]) =>
              items.length === 0 ? null : (
                <div key={label} style={{ marginBottom: "16px" }}>
                  <div style={{
                    fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.08em",
                    textTransform: "uppercase", color: "var(--text-muted)",
                    padding: "0 10px", marginBottom: "4px",
                  }}>
                    {label}
                  </div>
                  {items.map((conv) => (
                    <ConvRow
                      key={conv.id}
                      conv={conv}
                      isActive={conv.id === activeConversationId}
                      onSelect={handleSelect}
                      onDelete={deleteConversation}
                      onRename={renameConversation}
                    />
                  ))}
                </div>
              )
            )
          )}
        </div>

        {/* ── Footer: User + Theme ── */}
        <div style={{ borderTop: "1px solid var(--border-subtle)", padding: "10px 12px" }}>
          {/* Theme toggle */}
          <button
            onClick={toggle}
            style={{
              width: "100%",
              display: "flex", alignItems: "center", gap: "10px",
              background: "none", border: "none",
              padding: "8px 10px", borderRadius: "var(--radius-sm)",
              cursor: "pointer", fontFamily: "inherit",
              color: "var(--text-secondary)", fontSize: "13px",
              transition: "background 0.12s ease",
              marginBottom: "4px",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-surface)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "none"}
          >
            {isDark ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
            {isDark ? "Light mode" : "Dark mode"}
          </button>

          {/* User row */}
          <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "8px 10px", borderRadius: "var(--radius-sm)",
            cursor: "default",
          }}>
            {/* Avatar */}
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "linear-gradient(135deg, var(--accent), var(--accent-hover))",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
              fontSize: "11px", fontWeight: 700, color: "white",
            }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.name ?? "User"}
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.email ?? ""}
              </div>
            </div>
            {/* Logout */}
            <button
              onClick={logout}
              title="Sign out"
              style={{
                width: "28px", height: "28px", borderRadius: "6px",
                background: "none", border: "none", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--text-muted)", cursor: "pointer",
                transition: "all 0.12s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(220,38,38,0.1)"; e.currentTarget.style.color = "#dc2626"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "var(--text-muted)"; }}
            >
              <LogoutIcon />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
