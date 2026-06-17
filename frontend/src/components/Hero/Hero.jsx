import { useNavigate } from "react-router-dom";

/* ─── DATA ────────────────────────────────────────────────── */
const features = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
      </svg>
    ),
    title: "Instant Diagnostics",
    desc: "Describe any symptom — from engine codes to grinding brakes — and get precise diagnostic insights in seconds.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    title: "Conversational AI",
    desc: "Ask follow-up questions naturally. The AI remembers context and provides tailored, step-by-step repair guidance.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    title: "Cost Estimates",
    desc: "Get realistic cost breakdowns before visiting a mechanic. Save money and stay in control of your vehicle budget.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: "Maintenance Tracking",
    desc: "Set reminders and track service history. Know exactly when your next oil change or brake check is due.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
    title: "Persistent History",
    desc: "All conversations are saved. Revisit old diagnoses, track ongoing issues, and share sessions with your mechanic.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
    title: "Self-Improving AI",
    desc: "Your 👍/👎 feedback trains the model. Every interaction makes it smarter and more accurate for everyone.",
  },
];

const steps = [
  {
    number: "01",
    title: "Describe Your Problem",
    desc: "Type your symptoms, error codes, or questions in plain language. No technical jargon needed.",
  },
  {
    number: "02",
    title: "AI Analysis",
    desc: "Our fine-tuned automotive AI cross-references thousands of vehicle databases and repair manuals instantly.",
  },
  {
    number: "03",
    title: "Get Expert Guidance",
    desc: "Receive a clear diagnosis, repair steps, and cost estimates. Ask follow-up questions anytime.",
  },
];

const stats = [
  { value: "10k+",  label: "Vehicles diagnosed" },
  { value: "98%",   label: "Accuracy rate" },
  { value: "< 3s",  label: "Response time" },
  { value: "24/7",  label: "Always available" },
];

/* ─── COMPONENT ───────────────────────────────────────────── */
function Hero() {
  const navigate = useNavigate();

  return (
    <div style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}>

      {/* ════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════ */}
      <section style={{
        position: "relative",
        padding: "96px 24px 80px",
        textAlign: "center",
        overflow: "hidden",
      }}>
        {/* Subtle radial glow */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(232,104,58,0.10) 0%, transparent 70%)",
        }} />
        {/* Grid overlay */}
        <div className="bg-grid" style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.5 }} />

        <div style={{ position: "relative", maxWidth: "740px", margin: "0 auto" }}>
          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            background: "rgba(232,104,58,0.08)",
            border: "1px solid rgba(232,104,58,0.22)",
            borderRadius: "99px", padding: "5px 14px",
            fontSize: "11.5px", fontWeight: 600, color: "#e8683a",
            letterSpacing: "0.06em", textTransform: "uppercase",
            marginBottom: "28px",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
            AI-Powered · Fine-tuned SLM · Beta
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: "clamp(42px, 7vw, 76px)",
            fontWeight: 900,
            letterSpacing: "-0.045em",
            lineHeight: 1.06,
            margin: "0 0 22px",
            color: "var(--text-primary)",
          }}>
            Your AI{" "}
            <span className="gradient-text">Car Expert</span>
            <br />On Demand
          </h1>

          {/* Sub */}
          <p style={{
            fontSize: "clamp(16px, 2vw, 18px)",
            color: "var(--text-secondary)",
            lineHeight: 1.75,
            maxWidth: "520px",
            margin: "0 auto 36px",
          }}>
            Diagnose vehicle problems, get repair cost estimates, and solve automotive issues through natural conversation.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", flexWrap: "wrap", marginBottom: "20px" }}>
            <button
              className="btn-primary"
              onClick={() => navigate("/register")}
              style={{ padding: "13px 32px", fontSize: "15px", borderRadius: "10px" }}
            >
              Start for Free
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
            <button
              className="btn-outline"
              onClick={() => navigate("/login")}
              style={{ padding: "13px 32px", fontSize: "15px", borderRadius: "10px" }}
            >
              Sign In
            </button>
          </div>

          <p style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>
            ✓ No credit card &nbsp;·&nbsp; ✓ Free during beta &nbsp;·&nbsp; ✓ Human feedback system
          </p>
        </div>

        {/* ── Chat preview card ───────────────────────── */}
        <div style={{
          margin: "52px auto 0",
          maxWidth: "480px",
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "16px",
          padding: "20px",
          textAlign: "left",
          position: "relative",
          zIndex: 1,
          boxShadow: "0 32px 80px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
        }}>
          {/* Window dots */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "18px" }}>
            <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#ef4444", opacity: 0.7 }} />
            <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#f59e0b", opacity: 0.7 }} />
            <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#22c55e", opacity: 0.7 }} />
            <span style={{ marginLeft: "auto", fontSize: "11px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
              AI Online
            </span>
          </div>

          {/* User message */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
            <div style={{
              background: "linear-gradient(135deg, #e8683a, #d4522a)",
              color: "white",
              borderRadius: "14px 14px 3px 14px",
              padding: "10px 14px",
              fontSize: "13px",
              maxWidth: "280px",
              lineHeight: 1.55,
            }}>
              My car makes a grinding noise when braking at high speed.
            </div>
          </div>

          {/* AI message */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
            <div style={{
              width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
              background: "linear-gradient(135deg, #e8683a, #d4522a)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            <div style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "14px 14px 14px 3px",
              padding: "10px 14px",
              fontSize: "13px",
              color: "var(--text-secondary)",
              maxWidth: "300px",
              lineHeight: 1.6,
            }}>
              This sounds like worn brake pads or warped rotors. At high speed, vibration with grinding typically indicates rotor damage. I'd recommend inspecting front rotors first — this is a safety issue. Repair cost: <strong style={{ color: "var(--text-primary)" }}>$250–$450</strong>.
            </div>
          </div>

          {/* User follow-up */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div style={{
              background: "rgba(232,104,58,0.1)",
              border: "1px solid rgba(232,104,58,0.2)",
              color: "#e8683a",
              borderRadius: "14px 14px 3px 14px",
              padding: "8px 14px",
              fontSize: "12.5px",
            }}>
              Can I do it myself?
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          STATS
      ════════════════════════════════════════════════ */}
      <div style={{
        borderTop: "1px solid var(--border-subtle)",
        borderBottom: "1px solid var(--border-subtle)",
        padding: "0 24px",
      }}>
        <div style={{
          maxWidth: "900px", margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
        }} className="stats-row">
          {stats.map((s, i) => (
            <div key={i} style={{
              padding: "32px 20px",
              textAlign: "center",
              borderRight: i < stats.length - 1 ? "1px solid var(--border-subtle)" : "none",
            }} className="stat-item">
              <div className="gradient-text" style={{ fontSize: "clamp(26px, 3.5vw, 36px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1 }}>
                {s.value}
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "6px" }}>{s.label}</div>
            </div>
          ))}
        </div>
        <style>{`
          .stats-row { grid-template-columns: repeat(2, 1fr) !important; }
          .stat-item:nth-child(2) { border-right: none !important; }
          .stat-item:nth-child(3) { border-top: 1px solid var(--border-subtle) !important; }
          .stat-item:nth-child(4) { border-top: 1px solid var(--border-subtle) !important; border-right: none !important; }
          @media (min-width: 640px) {
            .stats-row { grid-template-columns: repeat(4, 1fr) !important; }
            .stat-item { border-top: none !important; }
            .stat-item:nth-child(2) { border-right: 1px solid var(--border-subtle) !important; }
          }
        `}</style>
      </div>

      {/* ════════════════════════════════════════════════
          FEATURES
      ════════════════════════════════════════════════ */}
      <section id="features" style={{ padding: "88px 24px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "52px" }}>
            <p style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#e8683a", marginBottom: "12px" }}>
              Features
            </p>
            <h2 style={{
              fontSize: "clamp(26px, 4vw, 42px)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
              marginBottom: "14px",
            }}>
              Everything you need to handle<br />
              <span className="gradient-text">any car problem</span>
            </h2>
            <p style={{ fontSize: "15px", color: "var(--text-secondary)", maxWidth: "480px", margin: "0 auto", lineHeight: 1.7 }}>
              From simple oil change reminders to complex engine diagnostics — all through natural conversation.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1px",
            background: "var(--border-subtle)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "16px",
            overflow: "hidden",
          }} className="features-mosaic">
            {features.map((f, i) => (
              <div key={i} style={{
                background: "var(--bg-card)",
                padding: "28px 24px",
                transition: "background 0.2s ease",
                cursor: "default",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--bg-surface)"}
                onMouseLeave={e => e.currentTarget.style.background = "var(--bg-card)"}
              >
                <div style={{
                  width: 38, height: 38,
                  borderRadius: "10px",
                  background: "rgba(232,104,58,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#e8683a",
                  marginBottom: "14px",
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "6px", color: "var(--text-primary)" }}>{f.title}</h3>
                <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
          <style>{`
            .features-mosaic { grid-template-columns: repeat(1, 1fr) !important; }
            @media (min-width: 640px) { .features-mosaic { grid-template-columns: repeat(2, 1fr) !important; } }
            @media (min-width: 900px) { .features-mosaic { grid-template-columns: repeat(3, 1fr) !important; } }
          `}</style>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          HOW IT WORKS
      ════════════════════════════════════════════════ */}
      <section id="how-it-works" style={{
        padding: "88px 24px",
        background: "var(--bg-card)",
        borderTop: "1px solid var(--border-subtle)",
        borderBottom: "1px solid var(--border-subtle)",
      }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "52px" }}>
            <p style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#e8683a", marginBottom: "12px" }}>
              How it works
            </p>
            <h2 style={{
              fontSize: "clamp(26px, 4vw, 42px)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
            }}>
              Get your answer in{" "}
              <span className="gradient-text">3 simple steps</span>
            </h2>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "24px",
          }} className="steps-grid">
            {steps.map((step, i) => (
              <div key={i} style={{
                background: "var(--bg-base)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "14px",
                padding: "32px 24px",
                position: "relative",
              }}>
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div style={{
                    display: "none",
                    position: "absolute",
                    top: "28px",
                    right: "-13px",
                    width: "25px",
                    height: "1px",
                    background: "linear-gradient(90deg, var(--border-strong), transparent)",
                    zIndex: 2,
                  }} className="step-line" />
                )}
                <div style={{
                  fontSize: "48px",
                  fontWeight: 900,
                  letterSpacing: "-0.05em",
                  lineHeight: 1,
                  marginBottom: "18px",
                  color: "rgba(232,104,58,0.18)",
                }}>
                  {step.number}
                </div>
                <h3 style={{ fontSize: "17px", fontWeight: 700, marginBottom: "8px", color: "var(--text-primary)" }}>{step.title}</h3>
                <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: 1.65 }}>{step.desc}</p>
              </div>
            ))}
          </div>
          <style>{`
            .steps-grid { grid-template-columns: 1fr !important; }
            @media (min-width: 768px) { .steps-grid { grid-template-columns: repeat(3, 1fr) !important; } .step-line { display: block !important; } }
          `}</style>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          FEEDBACK SECTION
      ════════════════════════════════════════════════ */}
      <section id="about" style={{ padding: "88px 24px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "48px",
            alignItems: "center",
          }} className="feedback-grid">
            {/* Left: text */}
            <div>
              <p style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#e8683a", marginBottom: "12px" }}>
                Fine-tuning ready
              </p>
              <h2 style={{
                fontSize: "clamp(24px, 3.5vw, 38px)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                lineHeight: 1.2,
                marginBottom: "16px",
              }}>
                An AI that gets{" "}
                <span className="gradient-text">smarter with you</span>
              </h2>
              <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.75, marginBottom: "24px" }}>
                Car Specialist GPT is built with a human feedback loop. Rate responses with 👍 or 👎, and your feedback is used to continuously fine-tune the underlying model — making it more accurate for everyone.
              </p>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
                {["Human feedback (RLHF) pipeline built in", "Ratings stored and used for model fine-tuning", "Improves for your make, model and region"].map((item, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "13.5px", color: "var(--text-secondary)" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e8683a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: "2px" }}>
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: feedback card mockup */}
            <div style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 24px 60px -16px rgba(0,0,0,0.5)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: "linear-gradient(135deg, #e8683a, #d4522a)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/></svg>
                </div>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>Car Specialist AI</span>
                <span style={{ marginLeft: "auto", fontSize: "11px", color: "var(--text-muted)" }}>Just now</span>
              </div>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.65, marginBottom: "18px" }}>
                Based on your description, this is likely a failing <strong style={{ color: "var(--text-primary)" }}>wheel bearing</strong> on the left front axle. The whirring noise that changes with speed and steering angle is a classic indicator.
              </p>
              <div style={{
                borderTop: "1px solid var(--border-subtle)",
                paddingTop: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", flex: 1 }}>Was this helpful?</span>
                <button style={{
                  background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)",
                  borderRadius: "8px", padding: "5px 12px",
                  fontSize: "12.5px", color: "#22c55e", cursor: "pointer", fontFamily: "inherit",
                }}>👍 Yes</button>
                <button style={{
                  background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)",
                  borderRadius: "8px", padding: "5px 12px",
                  fontSize: "12.5px", color: "#ef4444", cursor: "pointer", fontFamily: "inherit",
                }}>👎 No</button>
              </div>
            </div>
          </div>
          <style>{`
            .feedback-grid { grid-template-columns: 1fr !important; }
            @media (min-width: 768px) { .feedback-grid { grid-template-columns: 1fr 1fr !important; } }
          `}</style>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          FINAL CTA
      ════════════════════════════════════════════════ */}
      <section style={{
        padding: "80px 24px",
        background: "var(--bg-card)",
        borderTop: "1px solid var(--border-subtle)",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: "600px", margin: "0 auto", position: "relative" }}>
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: "400px", height: "200px",
            background: "radial-gradient(ellipse, rgba(232,104,58,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />
          <h2 style={{
            fontSize: "clamp(28px, 4.5vw, 52px)",
            fontWeight: 900,
            letterSpacing: "-0.04em",
            lineHeight: 1.1,
            marginBottom: "16px",
            position: "relative",
          }}>
            Ready to diagnose{" "}
            <span className="gradient-text">smarter?</span>
          </h2>
          <p style={{
            fontSize: "15px",
            color: "var(--text-secondary)",
            lineHeight: 1.7,
            marginBottom: "32px",
            position: "relative",
          }}>
            Join thousands of mechanics and car owners using AI to solve automotive problems — completely free.
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", flexWrap: "wrap", position: "relative" }}>
            <button
              className="btn-primary"
              onClick={() => navigate("/register")}
              style={{ padding: "14px 36px", fontSize: "15px", borderRadius: "10px" }}
            >
              Create Free Account
            </button>
            <button
              className="btn-outline"
              onClick={() => navigate("/login")}
              style={{ padding: "14px 36px", fontSize: "15px", borderRadius: "10px" }}
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}

export default Hero;
