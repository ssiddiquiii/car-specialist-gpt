import { forwardRef, useState } from "react";

const Input = forwardRef(
  ({ label, type = "text", error, className, id, icon: Icon, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div style={{ width: "100%" }}>
        {label && (
          <label
            htmlFor={id}
            style={{
              display: "block",
              marginBottom: "6px",
              fontSize: "13px",
              fontWeight: 500,
              color: "var(--text-secondary)"
            }}
          >
            {label}
          </label>
        )}

        <div style={{ position: "relative" }}>
          {/* Left icon */}
          {Icon && (
            <div style={{
              position: "absolute",
              inset: "0",
              left: "0",
              display: "flex",
              alignItems: "center",
              paddingLeft: "14px",
              pointerEvents: "none",
              top: "50%",
              transform: "translateY(-50%)",
              height: "fit-content"
            }}>
              <Icon size={16} style={{ color: "var(--text-muted)" }} />
            </div>
          )}

          <input
            id={id}
            type={inputType}
            ref={ref}
            className={`input-field ${error ? "error" : ""} ${className || ""}`}
            style={{
              paddingLeft: Icon ? "42px" : "16px",
              paddingRight: isPassword ? "44px" : "16px",
            }}
            {...props}
          />

          {/* Password toggle */}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              style={{
                position: "absolute",
                right: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                padding: 0,
                transition: "color 0.2s ease"
              }}
              onMouseEnter={e => e.currentTarget.style.color = "var(--accent)"}
              onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
            >
              {showPassword ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          )}
        </div>

        {error && (
          <p style={{
            marginTop: "6px",
            fontSize: "12px",
            color: "#ef4444",
            display: "flex",
            alignItems: "center",
            gap: "4px"
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
