import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    email: z.string().email("Please enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });

/* ── Car logo mark ──────────────────────────────────────── */
const CarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 17H3a2 2 0 0 1-2-2v-3l3-3L6 7h12l2 3 3 3v2a2 2 0 0 1-2 2h-2"/>
    <circle cx="7.5" cy="17.5" r="2.5"/>
    <circle cx="16.5" cy="17.5" r="2.5"/>
  </svg>
);

/* ── Password strength ──────────────────────────────────── */
function PasswordStrength({ value = "" }) {
  const checks = [value.length >= 8, /[A-Z]/.test(value), /[0-9]/.test(value), /[^A-Za-z0-9]/.test(value)];
  const score = checks.filter(Boolean).length;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "#ef4444", "#f59e0b", "#22c55e", "#16a34a"];
  if (!value) return null;
  return (
    <div style={{ marginTop: "8px" }}>
      <div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{
            flex: 1, height: "3px", borderRadius: "99px",
            background: i <= score ? colors[score] : "var(--border-subtle)",
            transition: "background 0.2s",
          }} />
        ))}
      </div>
      <span style={{ fontSize: "11px", color: colors[score] || "var(--text-muted)", fontWeight: 500 }}>
        {labels[score] || "Very weak"}
      </span>
    </div>
  );
}

function Register() {
  const navigate = useNavigate();
  const { register: registerUser, isLoading, error } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data) => {
    const result = await registerUser(data.name, data.email, data.password);
    if (result.success) navigate("/");
  };

  /* Shared eye toggle button */
  const EyeBtn = ({ show, onToggle }) => (
    <button
      type="button"
      onClick={onToggle}
      style={{
        position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
        background: "none", border: "none", cursor: "pointer",
        color: "var(--text-muted)", display: "flex", alignItems: "center", padding: "2px",
      }}
      tabIndex={-1}
    >
      {show ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
          <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      )}
    </button>
  );

  return (
    <div className="auth-page">
      <div style={{ width: "100%", maxWidth: "400px" }}>

        {/* ── Logo ─────────────────────────────────── */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <Link to="/" style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: "12px", textDecoration: "none" }}>
            <div style={{
              width: 44, height: 44, borderRadius: "12px",
              background: "linear-gradient(135deg, var(--accent), var(--accent-hover))",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 16px var(--accent-subtle2)",
            }}>
              <CarIcon />
            </div>
            <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
              Car Specialist <span style={{ color: "var(--accent)" }}>GPT</span>
            </span>
          </Link>
        </div>

        {/* ── Card ─────────────────────────────────── */}
        <div className="auth-card" style={{ maxWidth: "400px" }}>
          {/* Heading */}
          <div style={{ marginBottom: "24px" }}>
            <h1 style={{
              fontSize: "22px",
              fontWeight: 700,
              letterSpacing: "-0.025em",
              color: "var(--text-primary)",
              marginBottom: "6px",
            }}>
              Create your account
            </h1>
            <p style={{ fontSize: "13.5px", color: "var(--text-secondary)" }}>
              Free forever. No credit card required.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: "rgba(220,38,38,0.07)",
              border: "1px solid rgba(220,38,38,0.2)",
              borderRadius: "8px",
              padding: "10px 14px",
              marginBottom: "16px",
              display: "flex", alignItems: "center", gap: "8px",
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span style={{ fontSize: "13px", color: "#dc2626" }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

            {/* Name */}
            <div>
              <label htmlFor="name" style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--text-primary)", marginBottom: "6px" }}>
                Full name
              </label>
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                className={`input-field${errors.name ? " error" : ""}`}
                {...register("name")}
              />
              {errors.name && <p style={{ fontSize: "12px", color: "#dc2626", marginTop: "5px" }}>{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--text-primary)", marginBottom: "6px" }}>
                Email address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className={`input-field${errors.email ? " error" : ""}`}
                {...register("email")}
              />
              {errors.email && <p style={{ fontSize: "12px", color: "#dc2626", marginTop: "5px" }}>{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--text-primary)", marginBottom: "6px" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  className={`input-field${errors.password ? " error" : ""}`}
                  style={{ paddingRight: "42px" }}
                  {...register("password", {
                    onChange: (e) => setPasswordValue(e.target.value),
                  })}
                />
                <EyeBtn show={showPassword} onToggle={() => setShowPassword(!showPassword)} />
              </div>
              <PasswordStrength value={passwordValue} />
              {errors.password && <p style={{ fontSize: "12px", color: "#dc2626", marginTop: "5px" }}>{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--text-primary)", marginBottom: "6px" }}>
                Confirm password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repeat your password"
                  className={`input-field${errors.confirmPassword ? " error" : ""}`}
                  style={{ paddingRight: "42px" }}
                  {...register("confirmPassword")}
                />
                <EyeBtn show={showConfirm} onToggle={() => setShowConfirm(!showConfirm)} />
              </div>
              {errors.confirmPassword && <p style={{ fontSize: "12px", color: "#dc2626", marginTop: "5px" }}>{errors.confirmPassword.message}</p>}
            </div>

            {/* Terms */}
            <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.6 }}>
              By creating an account, you agree to our{" "}
              <a href="#" style={{ color: "var(--accent)", fontWeight: 500 }}>Terms of Service</a>{" "}
              and{" "}
              <a href="#" style={{ color: "var(--accent)", fontWeight: 500 }}>Privacy Policy</a>.
            </p>

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
              style={{ width: "100%", padding: "12px", fontSize: "14px", borderRadius: "9px" }}
            >
              {isLoading ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 0.8s linear infinite" }}>
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                  Creating account...
                </>
              ) : "Create account"}
            </button>
          </form>

          {/* Divider */}
          <div className="auth-divider">
            <span>Already have an account?</span>
          </div>

          {/* Login link */}
          <Link
            to="/login"
            className="btn-outline"
            style={{ width: "100%", padding: "11px", fontSize: "13.5px", borderRadius: "9px", display: "flex", justifyContent: "center" }}
          >
            Sign in instead →
          </Link>
        </div>

        {/* Back link */}
        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "12.5px" }}>
          <Link to="/" style={{ color: "var(--text-secondary)", transition: "color 0.15s" }}
            onMouseEnter={e => e.target.style.color = "var(--text-primary)"}
            onMouseLeave={e => e.target.style.color = "var(--text-secondary)"}
          >
            ← Back to home
          </Link>
        </p>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default Register;
