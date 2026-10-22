import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

/* ─── Minimal Icons ─── */
const ArrowRightIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const SparkleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07l14.14-14.14"/>
  </svg>
);

const sampleConversations = [
  {
    topic: "Brake Squeak",
    car: "2018 Honda Civic",
    userMsg: "My brakes make a high-pitched squeal when I slow down at low speeds. Is it dangerous to drive?",
    reply: [
      "That high-pitched squeal is usually the built-in wear indicator tab contacting the rotor. It acts as an early audible alert before rotors get scratched.",
      "• Immediate Urgency: Low. Safe to drive for 100–200 miles, but get pads inspected soon.",
      "• What to check: Front inner brake pads usually wear down first. Measure thickness (safe is >3mm).",
    ],
  },
  {
    topic: "P0420 Check Engine",
    car: "2017 Toyota RAV4",
    userMsg: "Check engine light came on with code P0420. Gas mileage seems normal. What does it mean?",
    reply: [
      "P0420 means 'Catalytic Converter System Efficiency Below Threshold (Bank 1)'.",
      "• Is it an emergency? No, the car is safe to drive home or to work. It does not cause immediate stalls.",
      "• Common Causes: Exhaust leak near downstream sensor, aging oxygen sensor, or worn catalytic element.",
      "• Next Step: Check for small exhaust hiss underneath before replacing expensive parts.",
    ],
  },
  {
    topic: "AC Blowing Warm",
    car: "2020 Hyundai Elantra",
    userMsg: "Air conditioner blows cool air for 5 minutes then turns completely warm when stopped in traffic.",
    reply: [
      "Cool air while driving that turns warm when stopped points to airflow over the condenser rather than a compressor failure.",
      "• Most likely cause: Radiator / AC condenser fan is not spinning at idle speed.",
      "• Quick test: Pop hood while engine runs with AC on max — verify both radiator fans are spinning.",
    ],
  },
];

function Hero() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState(0);

  const handleLaunchChat = () => {
    if (isAuthenticated) {
      navigate("/chat");
    } else {
      navigate("/login");
    }
  };

  const activeConv = sampleConversations[activeTab];

  return (
    <div style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}>

      {/* ════════════════════════════════════════════════
          HERO HEADER
      ════════════════════════════════════════════════ */}
      <section style={{
        padding: "72px 20px 48px",
        textAlign: "center",
        maxWidth: "880px",
        margin: "0 auto",
      }}>

        {/* Natural, calm tag */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "5px 14px",
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "99px",
          fontSize: "12px",
          fontWeight: 500,
          color: "var(--text-secondary)",
          marginBottom: "24px",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
          <span>Local Offline Assistant · Gemma 4 E2B</span>
        </div>

        {/* Clean, human headline */}
        <h1 style={{
          fontSize: "clamp(32px, 5.2vw, 56px)",
          fontWeight: 800,
          letterSpacing: "-0.035em",
          lineHeight: 1.15,
          margin: "0 0 18px",
          color: "var(--text-primary)",
        }}>
          Car troubleshooting,<br />
          <span style={{ color: "var(--accent)" }}>simplified &amp; offline.</span>
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: "clamp(15px, 1.9vw, 17.5px)",
          color: "var(--text-secondary)",
          lineHeight: 1.65,
          maxWidth: "600px",
          margin: "0 auto 32px",
        }}>
          Describe symptoms, warning lights, or strange noises in everyday English. Runs directly on your device with no internet or mobile signal needed.
        </p>

        {/* Primary Actions */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          flexWrap: "wrap",
          marginBottom: "24px",
        }}>
          <button
            onClick={handleLaunchChat}
            className="btn-primary"
            style={{
              padding: "11px 26px",
              fontSize: "14px",
              borderRadius: "8px",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
            }}
            id="hero-launch-chat-btn"
          >
            <span>{isAuthenticated ? "Open Chat" : "Start Chatting"}</span>
            <ArrowRightIcon />
          </button>

          <a
            href="https://expo.dev/artifacts/eas/nWLQxaqpVZAjTieNEhACBiZvBNBSwWZ_tjrMthynwG0.apk"
            target="_blank"
            rel="noreferrer"
            className="btn-outline"
            style={{
              padding: "11px 20px",
              fontSize: "13.5px",
              borderRadius: "8px",
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              textDecoration: "none",
            }}
            id="hero-download-apk-btn"
          >
            <DownloadIcon />
            <span>Android APK</span>
          </a>
        </div>

        {/* Subtle trust line */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          flexWrap: "wrap",
          fontSize: "12px",
          color: "var(--text-muted)",
        }}>
          <span>100% On-Device</span>
          <span>·</span>
          <span>No Cloud Required</span>
          <span>·</span>
          <span>Free &amp; Open Weights</span>
        </div>

      </section>

      {/* ════════════════════════════════════════════════
          AUTHENTIC CHAT EXPERIENCE SHOWCASE
      ════════════════════════════════════════════════ */}
      <section style={{ padding: "0 20px 64px" }}>
        <div style={{ maxWidth: "780px", margin: "0 auto" }}>
          
          {/* Mock Window Container */}
          <div style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "14px",
            boxShadow: "var(--shadow-md)",
            overflow: "hidden",
          }}>
            {/* Window Top Bar */}
            <div style={{
              padding: "12px 18px",
              background: "var(--bg-surface)",
              borderBottom: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              flexWrap: "wrap",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ display: "flex", gap: "6px" }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444", opacity: 0.8 }} />
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b", opacity: 0.8 }} />
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e", opacity: 0.8 }} />
                </div>
                <span style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text-secondary)", marginLeft: "6px" }}>
                  {activeConv.car}
                </span>
              </div>

              {/* Topic Selectors */}
              <div style={{ display: "flex", gap: "6px" }}>
                {sampleConversations.map((item, idx) => (
                  <button
                    key={item.topic}
                    onClick={() => setActiveTab(idx)}
                    style={{
                      background: activeTab === idx ? "var(--bg-card)" : "transparent",
                      border: activeTab === idx ? "1px solid var(--border-subtle)" : "1px solid transparent",
                      borderRadius: "6px",
                      padding: "4px 10px",
                      fontSize: "11.5px",
                      fontWeight: activeTab === idx ? 600 : 500,
                      color: activeTab === idx ? "var(--accent)" : "var(--text-muted)",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {item.topic}
                  </button>
                ))}
              </div>
            </div>

            {/* Conversation Flow */}
            <div style={{ padding: "24px 20px", display: "flex", flexDirection: "column", gap: "16px" }}>
              
              {/* User Bubble */}
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div style={{
                  maxWidth: "82%",
                  background: "var(--accent)",
                  color: "#FFFFFF",
                  padding: "10px 14px",
                  borderRadius: "14px 14px 2px 14px",
                  fontSize: "13.5px",
                  lineHeight: 1.5,
                }}>
                  {activeConv.userMsg}
                </div>
              </div>

              {/* Assistant Bubble */}
              <div style={{ display: "flex", justifyContent: "flex-start", gap: "10px", alignItems: "flex-start" }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "7px",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--accent)", flexShrink: 0, marginTop: "2px",
                }}>
                  <SparkleIcon />
                </div>
                <div style={{
                  maxWidth: "86%",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-primary)",
                  padding: "14px 16px",
                  borderRadius: "2px 14px 14px 14px",
                  fontSize: "13px",
                  lineHeight: 1.6,
                }}>
                  {activeConv.reply.map((line, i) => (
                    <p key={i} style={{ margin: i === 0 ? "0 0 8px" : "6px 0 0" }}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>

            </div>

            {/* Mock Bottom Input Bar */}
            <div style={{
              padding: "12px 18px",
              borderTop: "1px solid var(--border-subtle)",
              background: "var(--bg-base)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "10px",
            }}>
              <span style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>
                Ask anything about strange sounds, OBD-II codes, or fluid levels...
              </span>
              <button
                onClick={handleLaunchChat}
                style={{
                  background: "var(--accent)",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "6px",
                  padding: "6px 14px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Try It Live
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════
          3 CLEAN PRACTICAL UTILITY PILLARS
      ════════════════════════════════════════════════ */}
      <section id="features" style={{
        padding: "54px 20px",
        borderTop: "1px solid var(--border-subtle)",
        borderBottom: "1px solid var(--border-subtle)",
        background: "var(--bg-card)",
      }}>
        <div style={{ maxWidth: "880px", margin: "0 auto" }}>
          
          <div style={{ textAlign: "center", marginBottom: "36px" }}>
            <h2 style={{
              fontSize: "clamp(20px, 3vw, 28px)",
              fontWeight: 700,
              letterSpacing: "-0.025em",
              margin: 0,
            }}>
              Built for real situations on the road
            </h2>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "16px",
          }}>
            <div style={{
              padding: "20px",
              borderRadius: "10px",
              background: "var(--bg-base)",
              border: "1px solid var(--border-subtle)",
            }}>
              <div style={{ fontSize: "14px", fontWeight: 700, marginBottom: "6px", color: "var(--text-primary)" }}>
                Works in Dead Zones
              </div>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.55, margin: 0 }}>
                Underground parking structures, highway dead spots, or rural garages where cell reception drops to zero.
              </p>
            </div>

            <div style={{
              padding: "20px",
              borderRadius: "10px",
              background: "var(--bg-base)",
              border: "1px solid var(--border-subtle)",
            }}>
              <div style={{ fontSize: "14px", fontWeight: 700, marginBottom: "6px", color: "var(--text-primary)" }}>
                Plain-English Advice
              </div>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.55, margin: 0 }}>
                Type whatever sound or issue you notice. The assistant explains root causes without confusing mechanic jargon.
              </p>
            </div>

            <div style={{
              padding: "20px",
              borderRadius: "10px",
              background: "var(--bg-base)",
              border: "1px solid var(--border-subtle)",
            }}>
              <div style={{ fontSize: "14px", fontWeight: 700, marginBottom: "6px", color: "var(--text-primary)" }}>
                Private &amp; Self-Contained
              </div>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.55, margin: 0 }}>
                Runs completely on edge hardware. No prompts or personal diagnostic notes are tracked or sent to external servers.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════
          DISCREET BETA & SAFETY NOTICE
      ════════════════════════════════════════════════ */}
      <section style={{ padding: "36px 20px", textAlign: "center" }}>
        <p style={{
          maxWidth: "640px",
          margin: "0 auto",
          fontSize: "11.5px",
          color: "var(--text-muted)",
          lineHeight: 1.6,
        }}>
          <strong>Testing Notice:</strong> This prototype is an experimental evaluation tool running Google Gemma 4 E2B weights. Output is provided for educational and diagnostic reference. Always have critical safety items (brakes, steering, fuel lines) inspected by a certified automotive technician.
        </p>
      </section>

    </div>
  );
}

export default Hero;
