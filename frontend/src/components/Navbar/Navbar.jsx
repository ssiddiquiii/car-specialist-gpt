import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useThemeStore } from "../../store/themeStore";

/* ─── Sun icon ─────────────────────────────── */
const SunIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);
const MoonIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuthStore();
  const { isDark, toggle } = useThemeStore();

  return (
    <header className="navbar">
      <div style={{
        maxWidth: "1160px",
        margin: "0 auto",
        padding: "0 24px",
        height: "60px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
      }}>

        {/* Logo */}
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", flexShrink: 0 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "7px",
            background: "linear-gradient(135deg, var(--accent), var(--accent-hover))",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 17H3a2 2 0 0 1-2-2v-3l3-3L6 7h12l2 3 3 3v2a2 2 0 0 1-2 2h-2"/>
              <circle cx="7.5" cy="17.5" r="2.5"/>
              <circle cx="16.5" cy="17.5" r="2.5"/>
            </svg>
          </div>
          <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            Car Specialist <span style={{ color: "var(--accent)" }}>GPT</span>
          </span>
        </Link>

        {/* Center nav */}
        <nav style={{ display: "flex", alignItems: "center", gap: "2px" }} className="nav-center">
          {[
            { label: "Features", href: "#features" },
            { label: "How it works", href: "#how-it-works" },
            { label: "About", href: "#about" },
          ].map(link => (
            <a
              key={link.label}
              href={link.href}
              style={{
                fontSize: "13.5px",
                fontWeight: 500,
                color: "var(--text-secondary)",
                padding: "6px 12px",
                borderRadius: "8px",
                transition: "color 0.15s, background 0.15s",
              }}
              onMouseEnter={e => { e.target.style.color = "var(--text-primary)"; e.target.style.background = "var(--bg-surface)"; }}
              onMouseLeave={e => { e.target.style.color = "var(--text-secondary)"; e.target.style.background = "transparent"; }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          {/* Theme toggle */}
          <button
            className="theme-toggle"
            onClick={toggle}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            aria-label="Toggle theme"
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>

          {isAuthenticated ? (
            <>
              <button
                onClick={() => navigate("/chat")}
                style={{
                  fontSize: "13.5px", fontWeight: 500,
                  color: "var(--accent)",
                  background: "none", border: "none",
                  cursor: "pointer", fontFamily: "inherit",
                  padding: "6px 12px", borderRadius: "8px",
                }}
              >
                Dashboard
              </button>
              <button
                onClick={logout}
                className="btn-outline"
                style={{ padding: "7px 16px", fontSize: "13px" }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                style={{
                  fontSize: "13.5px", fontWeight: 500,
                  color: "var(--text-secondary)",
                  padding: "6px 12px", borderRadius: "8px",
                  transition: "color 0.15s",
                }}
                onMouseEnter={e => e.target.style.color = "var(--text-primary)"}
                onMouseLeave={e => e.target.style.color = "var(--text-secondary)"}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="btn-primary"
                style={{ padding: "8px 18px", fontSize: "13px" }}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>

      <style>{`
        .nav-center { display: none !important; }
        @media (min-width: 768px) { .nav-center { display: flex !important; } }
      `}</style>
    </header>
  );
}

export default Navbar;
