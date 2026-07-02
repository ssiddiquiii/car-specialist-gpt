import { useAuthStore } from "../../store/authStore";

/* ─── Tiny markdown renderer (no external deps) ─────────────
   Handles: **bold**, *italic*, `code`, ```blocks```,
            > blockquote, | tables |, - lists, 1. ordered lists
   ─────────────────────────────────────────────────────────── */
function renderMarkdown(text) {
  const lines = text.split("\n");
  const output = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // ── Fenced code block ```
    if (line.trimStart().startsWith("```")) {
      const startIndex = i;
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      output.push(
        <pre key={startIndex} style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-sm)",
          padding: "12px 16px",
          overflowX: "auto",
          fontSize: "12.5px",
          lineHeight: 1.7,
          fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
          color: "var(--text-primary)",
          margin: "8px 0",
        }}>
          <code>{codeLines.join("\n")}</code>
        </pre>
      );
      i++;
      continue;
    }

    // ── Table  |...|...|
    if (line.includes("|") && line.trim().startsWith("|")) {
      const startIndex = i;
      const tableLines = [];
      while (i < lines.length && lines[i].includes("|") && lines[i].trim().startsWith("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      // Filter out separator rows (---|---)
      const rows = tableLines.filter((r) => !/^\s*\|[\s\-|]+\|\s*$/.test(r));
      output.push(
        <div key={startIndex} style={{ overflowX: "auto", margin: "8px 0" }}>
          <table style={{ borderCollapse: "collapse", width: "100%", fontSize: "13px" }}>
            <tbody>
              {rows.map((row, ri) => {
                const cells = row.split("|").filter((_, ci) => ci > 0 && ci < row.split("|").length - 1);
                const Tag = ri === 0 ? "th" : "td";
                return (
                  <tr key={ri}>
                    {cells.map((cell, ci) => (
                      <Tag key={ci} style={{
                        border: "1px solid var(--border-subtle)",
                        padding: "6px 12px",
                        textAlign: "left",
                        background: ri === 0 ? "var(--bg-surface)" : "transparent",
                        fontWeight: ri === 0 ? 600 : 400,
                        color: "var(--text-primary)",
                      }}>
                        {inlineMarkdown(cell.trim())}
                      </Tag>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // ── Headings # ## ### ####
    if (/^#{1,4}\s/.test(line)) {
      const level = line.match(/^(#{1,4})\s/)[1].length;
      const text = line.replace(/^#{1,4}\s/, "");
      const sizes = { 1: "18px", 2: "16px", 3: "14.5px", 4: "13.5px" };
      const margins = { 1: "14px 0 6px", 2: "12px 0 5px", 3: "10px 0 4px", 4: "8px 0 3px" };
      output.push(
        <div key={i} style={{
          fontSize: sizes[level],
          fontWeight: 700,
          color: "var(--text-primary)",
          margin: margins[level],
          lineHeight: 1.4,
          borderBottom: level <= 2 ? "1px solid var(--border-subtle)" : "none",
          paddingBottom: level <= 2 ? "4px" : "0",
        }}>
          {inlineMarkdown(text)}
        </div>
      );
      i++;
      continue;
    }

    // ── Horizontal rule ---
    if (/^[-*_]{3,}$/.test(line.trim())) {
      output.push(
        <hr key={i} style={{
          border: "none",
          borderTop: "1px solid var(--border-subtle)",
          margin: "10px 0",
        }} />
      );
      i++;
      continue;
    }

    // ── Blockquote >
    if (line.startsWith(">")) {
      output.push(
        <blockquote key={i} style={{
          borderLeft: "3px solid var(--accent)",
          paddingLeft: "14px",
          margin: "8px 0",
          color: "var(--text-secondary)",
          fontStyle: "italic",
          fontSize: "13.5px",
        }}>
          {inlineMarkdown(line.slice(1).trim())}
        </blockquote>
      );
      i++;
      continue;
    }

    // ── Unordered list  -  or  *
    if (/^[-*]\s/.test(line)) {
      const startIndex = i;
      const items = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i])) {
        items.push(lines[i].slice(2));
        i++;
      }
      output.push(
        <ul key={startIndex} style={{ paddingLeft: "20px", margin: "6px 0", display: "flex", flexDirection: "column", gap: "3px" }}>
          {items.map((item, idx) => (
            <li key={idx} style={{ fontSize: "13.5px", color: "var(--text-primary)", lineHeight: 1.6 }}>
              {inlineMarkdown(item)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // ── Ordered list  1.
    if (/^\d+\.\s/.test(line)) {
      const startIndex = i;
      const items = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ""));
        i++;
      }
      output.push(
        <ol key={startIndex} style={{ paddingLeft: "20px", margin: "6px 0", display: "flex", flexDirection: "column", gap: "3px" }}>
          {items.map((item, idx) => (
            <li key={idx} style={{ fontSize: "13.5px", color: "var(--text-primary)", lineHeight: 1.6 }}>
              {inlineMarkdown(item)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // ── Empty line
    if (line.trim() === "") {
      output.push(<div key={i} style={{ height: "6px" }} />);
      i++;
      continue;
    }

    // ── Normal paragraph
    output.push(
      <p key={i} style={{ fontSize: "13.5px", lineHeight: 1.7, color: "var(--text-primary)", margin: "2px 0" }}>
        {inlineMarkdown(line)}
      </p>
    );
    i++;
  }

  return output;
}

/* Inline markdown: **bold**, *italic*, `code` */
function inlineMarkdown(text) {
  const parts = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`)/g;
  let last = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    if (match[2]) parts.push(<strong key={match.index}>{match[2]}</strong>);
    else if (match[3]) parts.push(<em key={match.index}>{match[3]}</em>);
    else if (match[4]) parts.push(
      <code key={match.index} style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "4px",
        padding: "1px 5px",
        fontSize: "12px",
        fontFamily: "monospace",
        color: "var(--accent)",
      }}>{match[4]}</code>
    );
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length > 0 ? parts : text;
}

/* ─── Car icon for AI avatar ─────────────────────────────── */
const CarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 17H3a2 2 0 0 1-2-2v-3l3-3L6 7h12l2 3 3 3v2a2 2 0 0 1-2 2h-2"/>
    <circle cx="7.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/>
  </svg>
);

/* ─── Format timestamp ───────────────────────────────────── */
function formatTime(iso) {
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
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "11px",
        fontWeight: 700,
        marginTop: "2px",
        ...(isUser
          ? { background: "linear-gradient(135deg, var(--accent), var(--accent-hover))", color: "white" }
          : { background: "var(--btn-dark-bg)", color: "var(--btn-dark-text)" }
        ),
      }}>
        {isUser ? initials : <CarIcon />}
      </div>

      {/* Bubble + meta */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        maxWidth: "75%",
        alignItems: isUser ? "flex-end" : "flex-start",
      }}>
        {/* Role label */}
        <span style={{
          fontSize: "11px",
          fontWeight: 600,
          color: "var(--text-muted)",
          letterSpacing: "0.03em",
          textTransform: "uppercase",
        }}>
          {isUser ? "You" : "Car Specialist"}
        </span>

        {/* Bubble */}
        <div style={{
          background: isUser ? "var(--btn-dark-bg)" : "var(--bg-card)",
          color: isUser ? "var(--btn-dark-text)" : "var(--text-primary)",
          borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          padding: "12px 16px",
          border: isUser ? "none" : "1px solid var(--border-subtle)",
          boxShadow: "var(--shadow-sm)",
          wordBreak: "break-word",
          lineHeight: 1.6,
        }}>
          {isUser
            ? <p style={{ fontSize: "13.5px", margin: 0, lineHeight: 1.6 }}>{message.content}</p>
            : <div>{renderMarkdown(message.content)}</div>
          }
        </div>

        {/* Timestamp */}
        <span style={{ fontSize: "10.5px", color: "var(--text-muted)" }}>
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
}

export default ChatMessage;
