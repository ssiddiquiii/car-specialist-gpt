import { Link } from "react-router-dom";

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{
      background: "var(--bg-base)",
      borderTop: "1px solid var(--border-subtle)",
    }}>
      <div style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "40px 24px",
      }}>
        {/* ── Main row ─────────────────────────────── */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "36px",
          marginBottom: "36px",
        }}>
          {/* Brand */}
          <div style={{ flex: "1 1 220px" }}>
            {/* Logo mark */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div style={{
                width: 32, height: 32, borderRadius: "8px",
                background: "linear-gradient(135deg, #e8683a, #d4522a)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 17H3a2 2 0 0 1-2-2v-3l3-3L6 7h12l2 3 3 3v2a2 2 0 0 1-2 2h-2"/>
                  <circle cx="7.5" cy="17.5" r="2.5"/>
                  <circle cx="16.5" cy="17.5" r="2.5"/>
                </svg>
              </div>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                Car Specialist <span style={{ color: "#e8683a" }}>GPT</span>
              </span>
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.7, maxWidth: "240px" }}>
              AI-powered automotive assistant for instant diagnostics, repair guidance, and cost estimates.
            </p>
            {/* Status pill */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "5px",
              marginTop: "14px",
              background: "rgba(34,197,94,0.07)",
              border: "1px solid rgba(34,197,94,0.2)",
              borderRadius: "99px",
              padding: "4px 10px",
            }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
              <span style={{ fontSize: "11px", color: "#22c55e", fontWeight: 500 }}>Free during beta</span>
            </div>
          </div>

          {/* Links */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "40px" }}>
            {[
              {
                heading: "Product",
                links: [
                  { label: "Features", href: "#features" },
                  { label: "How it works", href: "#how-it-works" },
                  { label: "About", href: "#about" },
                ],
              },
              {
                heading: "Legal",
                links: [
                  { label: "Privacy Policy", href: "#" },
                  { label: "Terms of Service", href: "#" },
                ],
              },
            ].map((col) => (
              <div key={col.heading}>
                <p style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                  marginBottom: "12px",
                }}>
                  {col.heading}
                </p>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        style={{ fontSize: "13.5px", color: "var(--text-secondary)", transition: "color 0.15s" }}
                        onMouseEnter={e => e.target.style.color = "var(--text-primary)"}
                        onMouseLeave={e => e.target.style.color = "var(--text-secondary)"}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom bar ───────────────────────────── */}
        <div style={{
          borderTop: "1px solid var(--border-subtle)",
          paddingTop: "20px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
        }}>
          <p style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>
            © {year} Car Specialist GPT. All rights reserved.
          </p>
          <p style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>
            Built with ❤️ · Powered by AI
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
