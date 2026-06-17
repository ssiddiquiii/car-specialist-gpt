import { Link } from "react-router-dom";

function Logo({ dark = false }) {
  return (
    <Link to="/" className="group flex items-center gap-3 outline-none">
      {/* Icon mark */}
      <div className="relative flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden" style={{
        background: "linear-gradient(135deg, #e8683a 0%, #d4522a 100%)",
        boxShadow: "0 4px 16px rgba(232,104,58,0.4)"
      }}>
        {/* Car icon SVG */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 17H3a2 2 0 0 1-2-2v-3a2 2 0 0 1 .586-1.414l3-3A2 2 0 0 1 6 7h12a2 2 0 0 1 1.414.586l3 3A2 2 0 0 1 23 12v3a2 2 0 0 1-2 2h-2"/>
          <circle cx="7.5" cy="17.5" r="2.5"/>
          <circle cx="16.5" cy="17.5" r="2.5"/>
          <path d="M5 9l2-4h10l2 4"/>
        </svg>
      </div>
      {/* Wordmark */}
      <div className="flex flex-col leading-none">
        <span style={{
          fontSize: "15px",
          fontWeight: 700,
          letterSpacing: "-0.02em",
          color: dark ? "#0a0a0f" : "#f0f0f5",
          lineHeight: 1.2
        }}>
          Car Specialist
        </span>
        <span style={{
          fontSize: "10px",
          fontWeight: 500,
          letterSpacing: "0.06em",
          color: "#e8683a",
          textTransform: "uppercase",
          lineHeight: 1.2
        }}>
          GPT
        </span>
      </div>
    </Link>
  );
}

export default Logo;
