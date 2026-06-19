/* Three bouncing dots — animated via CSS keyframes (typingBounce) */
function TypingIndicator() {
  const dotStyle = (delay) => ({
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "var(--text-muted)",
    animation: `typingBounce 1.2s ease-in-out ${delay} infinite`,
    display: "inline-block",
  });

  const CarIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 17H3a2 2 0 0 1-2-2v-3l3-3L6 7h12l2 3 3 3v2a2 2 0 0 1-2 2h-2"/>
      <circle cx="7.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/>
    </svg>
  );

  return (
    <div style={{
      display: "flex",
      flexDirection: "row",
      gap: "10px",
      alignItems: "flex-start",
      animation: "fadeIn 0.2s ease both",
      padding: "0 4px",
    }}>
      {/* AI Avatar */}
      <div style={{
        width: "32px", height: "32px", borderRadius: "50%",
        background: "var(--btn-dark-bg)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, marginTop: "2px",
      }}>
        <CarIcon />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.03em", textTransform: "uppercase" }}>
          Car Specialist
        </span>
        {/* Bubble with dots */}
        <div style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "18px 18px 18px 4px",
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          gap: "5px",
          boxShadow: "var(--shadow-sm)",
        }}>
          <span style={dotStyle("0s")} />
          <span style={dotStyle("0.2s")} />
          <span style={dotStyle("0.4s")} />
        </div>
      </div>
    </div>
  );
}

export default TypingIndicator;
