import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

/* ── Car logo mark ──────────────────────────────────────── */
const CarIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 17H3a2 2 0 0 1-2-2v-3l3-3L6 7h12l2 3 3 3v2a2 2 0 0 1-2 2h-2"/>
    <circle cx="7.5" cy="17.5" r="2.5"/>
    <circle cx="16.5" cy="17.5" r="2.5"/>
  </svg>
);

function Login() {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data) => {
    const result = await login(data.email, data.password);
    if (result.success) navigate("/chat");
  };

  return (
    <div className="auth-page">
      <div style={{ width: "100%", maxWidth: "350px" }}>

        {/* ── Brand Logo Header ── */}
        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
            <div style={{
              width: 30, height: 30, borderRadius: "8px",
              background: "linear-gradient(135deg, var(--accent), var(--accent-hover))",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 8px var(--accent-subtle2)",
            }}>
              <CarIcon />
            </div>
            <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
              Car Specialist <span style={{ color: "var(--accent)" }}>GPT</span>
            </span>
          </Link>
        </div>

        {/* ── Compact Clean Card ── */}
        <div className="auth-card" style={{ padding: "22px 22px 18px", borderRadius: "12px" }}>
          {/* Heading */}
          <div style={{ marginBottom: "16px", textAlign: "left" }}>
            <h1 style={{
              fontSize: "18px",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "var(--text-primary)",
              marginBottom: "3px",
            }}>
              Welcome back
            </h1>
            <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", margin: 0 }}>
              Sign in to your account
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div style={{
              background: "rgba(220,38,38,0.07)",
              border: "1px solid rgba(220,38,38,0.2)",
              borderRadius: "6px",
              padding: "7px 10px",
              marginBottom: "12px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span style={{ fontSize: "12px", color: "#dc2626" }}>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "11px" }}>

            {/* Email */}
            <div>
              <label htmlFor="email" style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "var(--text-primary)", marginBottom: "4px" }}>
                Email address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className={`input-field${errors.email ? " error" : ""}`}
                style={{ height: "38px", fontSize: "13px", padding: "0 11px" }}
                {...register("email")}
              />
              {errors.email && (
                <p style={{ fontSize: "11px", color: "#dc2626", marginTop: "3px", margin: "3px 0 0" }}>{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                <label htmlFor="password" style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-primary)" }}>
                  Password
                </label>
                <a href="#" style={{ fontSize: "11.5px", color: "var(--accent)", fontWeight: 500 }}>
                  Forgot?
                </a>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`input-field${errors.password ? " error" : ""}`}
                  style={{ height: "38px", fontSize: "13px", padding: "0 34px 0 11px" }}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute", right: "9px", top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: "var(--text-muted)", display: "flex", alignItems: "center",
                    padding: "2px",
                  }}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p style={{ fontSize: "11px", color: "#dc2626", marginTop: "3px", margin: "3px 0 0" }}>{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
              style={{
                width: "100%", height: "38px", fontSize: "13.5px", fontWeight: 600,
                borderRadius: "8px", marginTop: "4px",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
              }}
            >
              {isLoading ? (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 0.8s linear infinite" }}>
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                  Signing in...
                </>
              ) : "Sign in"}
            </button>
          </form>

          {/* Simple Inline Footer Switch */}
          <p style={{
            textAlign: "center", fontSize: "12px", color: "var(--text-secondary)",
            margin: "14px 0 0", paddingTop: "12px", borderTop: "1px solid var(--border-subtle)",
          }}>
            Don&apos;t have an account?{" "}
            <Link to="/register" style={{ color: "var(--accent)", fontWeight: 600 }}>
              Sign up
            </Link>
          </p>
        </div>

        {/* Back Link */}
        <p style={{ textAlign: "center", margin: "14px 0 0", fontSize: "12px" }}>
          <Link to="/" style={{ color: "var(--text-muted)", textDecoration: "none", transition: "color 0.15s" }}
            onMouseEnter={e => e.target.style.color = "var(--text-primary)"}
            onMouseLeave={e => e.target.style.color = "var(--text-muted)"}
          >
            ← Back to home
          </Link>
        </p>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default Login;
