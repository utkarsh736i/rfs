"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import NeuralCanvas from "@/components/NeuralCanvas";
import Cursor from "@/components/Cursor";

function LiveMetric({ label, value, dotClass }: { label: string; value: string; dotClass: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", background: "rgba(12,26,56,.6)", border: "1px solid var(--border)", borderRadius: 10, backdropFilter: "blur(8px)" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, background: dotClass === "green" ? "var(--neural)" : dotClass === "amber" ? "var(--amber)" : "var(--pulse)" }} className={`blink${dotClass === "amber" ? "-slow" : dotClass === "pulse" ? "-mid" : ""}`} />
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--t3)", letterSpacing: .5, flex: 1 }}>{label}</span>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 500, color: dotClass === "amber" ? "var(--amber)" : dotClass === "pulse" ? "var(--pulse)" : "var(--neural)" }}>{value}</span>
    </div>
  );
}

const LogoIcon = () => (
  <svg viewBox="0 0 24 24" style={{ width: 24, height: 24, fill: "none", stroke: "rgba(2,6,16,.9)", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }}>
    <circle cx="12" cy="12" r="3" />
    <line x1="12" y1="9" x2="12" y2="3" /><line x1="14.6" y1="9.7" x2="19" y2="6" />
    <line x1="14.6" y1="14.3" x2="19" y2="18" /><line x1="12" y1="15" x2="12" y2="21" />
    <line x1="9.4" y1="14.3" x2="5" y2="18" /><line x1="9.4" y1="9.7" x2="5" y2="6" />
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 1200);
    }, 1600);
  }

  return (
    <>
      <Cursor />
      <NeuralCanvas opacity={0.4} />
      <div style={{ position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "100vh" }} className="login-grid">

        {/* ── LEFT PANEL ── */}
        <div style={{ background: "linear-gradient(160deg, rgba(0,212,232,.06) 0%, rgba(108,159,255,.04) 50%, transparent 100%)", borderRight: "1px solid var(--border)", padding: "56px 64px", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -200, left: -100, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(0,212,232,.07) 0%, transparent 70%)", pointerEvents: "none" }} />
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 14, textDecoration: "none" }}>
            <div style={{ width: 46, height: 46, borderRadius: 12, background: "linear-gradient(135deg,var(--neural),var(--pulse))", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", flexShrink: 0 }}>
              <LogoIcon />
            </div>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, letterSpacing: 1, color: "var(--t1)" }}>Reflex<span style={{ color: "var(--neural)" }}>Sense</span></span>
          </Link>
          <div style={{ margin: "auto 0", padding: "48px 0" }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 3, color: "var(--neural)", marginBottom: 20 }}>COMMAND CENTER ACCESS</p>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px,3.5vw,48px)", fontWeight: 800, lineHeight: 1, letterSpacing: -1.5, color: "var(--t1)", marginBottom: 20 }}>
              Your machines<br />are <em style={{ fontStyle: "normal", color: "var(--neural)" }}>talking.</em><br />Are you listening?
            </h2>
            <p style={{ fontSize: 14, color: "var(--t2)", lineHeight: 1.75, maxWidth: 360, marginBottom: 40 }}>
              Sign in to access your live neural telemetry dashboard — real-time sensor streams, predictive alerts, and machine health across your entire operation.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <LiveMetric label="NERVE-A TEMPERATURE" value="68.4°C" dotClass="green" />
              <LiveMetric label="NERVE-B VIBRATION" value="71.2 mm/s ↑" dotClass="amber" />
              <LiveMetric label="SYNAPSE UPTIME" value="99.7%" dotClass="pulse" />
            </div>
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--t3)", letterSpacing: 1 }}>© 2025 REFLEXSENSE · THE NERVOUS SYSTEM OF INDUSTRY</div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{ padding: "56px 80px", display: "flex", flexDirection: "column", justifyContent: "center", background: "var(--void)" }}>
          <div style={{ marginBottom: 44, animation: "fadeUp .6s ease both" }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: 2.5, color: "var(--neural)", marginBottom: 14 }}>SECURE ACCESS</p>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px,3vw,40px)", fontWeight: 800, letterSpacing: -1, color: "var(--t1)", marginBottom: 10 }}>Welcome back.</h1>
            <p style={{ fontSize: 14, color: "var(--t2)", lineHeight: 1.6 }}>New to ReflexSense? <Link href="/contact" style={{ color: "var(--neural)", textDecoration: "none" }}>Request access →</Link></p>
          </div>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 420 }}>
            {/* Email */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, animation: "fadeUp .6s .05s ease both" }}>
              <label style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 1.5, color: "var(--t2)" }}>EMAIL ADDRESS</label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <div style={{ position: "absolute", left: 14, zIndex: 2, pointerEvents: "none" }}>
                  <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: "none", stroke: "var(--t3)", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", display: "block" }}>
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <input type="email" placeholder="operator@plant.io" autoComplete="email" required style={{ paddingLeft: 44, padding: "14px 14px 14px 44px" }} />
              </div>
            </div>
            {/* Password */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, animation: "fadeUp .6s .1s ease both" }}>
              <label style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 1.5, color: "var(--t2)" }}>PASSWORD</label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <div style={{ position: "absolute", left: 14, zIndex: 2, pointerEvents: "none" }}>
                  <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: "none", stroke: "var(--t3)", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", display: "block" }}>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <input type="password" placeholder="••••••••••••" autoComplete="current-password" required style={{ paddingLeft: 44, padding: "14px 14px 14px 44px" }} />
              </div>
            </div>
            {/* Remember + Forgot */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input type="checkbox" id="remember" style={{ width: 16, height: 16, padding: 0, accentColor: "var(--neural)" }} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: .5, color: "var(--t2)" }}>Remember this device</span>
              </label>
              <a href="#" style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: .5, color: "var(--neural)", textDecoration: "none" }}>Forgot password?</a>
            </div>
            {/* Submit */}
            <button type="submit" disabled={loading || success} style={{
              width: "100%", padding: 16, borderRadius: 10, border: "none",
              background: success ? "linear-gradient(135deg,var(--green),var(--neural))" : "linear-gradient(135deg,var(--neural),var(--pulse))",
              fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 600, color: "var(--void)",
              cursor: "pointer", transition: "all .3s", opacity: loading ? .7 : 1,
              boxShadow: "0 0 32px rgba(0,212,232,.2)", animation: "fadeUp .6s .2s ease both"
            }}>
              {success ? "✓ Access Granted — Redirecting" : loading ? "Authenticating..." : "Access Command Center"}
            </button>
            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--t3)", letterSpacing: 1.5 }}>OR CONTINUE WITH</span>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            </div>
            {/* SSO */}
            <div style={{ display: "flex", gap: 10 }}>
              {[
                { label: "Google", icon: <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/> },
                { label: "Microsoft", icon: <path d="M0 12C0 5.37 5.37 0 12 0a12 12 0 0 1 8.47 3.53l-3.3 3.3A7.51 7.51 0 0 0 12 4.5a7.5 7.5 0 0 0-7.5 7.5A7.5 7.5 0 0 0 12 19.5a7.51 7.51 0 0 0 7.5-7.5h-7.5V9h10.5c.13.66.2 1.32.2 2A12 12 0 0 1 12 24 12 12 0 0 1 0 12z" fill="var(--t2)"/> },
                { label: "SSO", icon: <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" fill="var(--t2)"/> },
              ].map((s) => (
                <a key={s.label} href="#" style={{ flex: 1, padding: 12, borderRadius: 10, background: "var(--card)", border: "1px solid var(--border)", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 500, color: "var(--t2)", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all .25s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.color = "var(--t1)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--t2)"; }}>
                  <svg viewBox="0 0 24 24" style={{ width: 16, height: 16 }}>{s.icon}</svg>{s.label}
                </a>
              ))}
            </div>
            {/* Security note */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-mono)", fontSize: 9.5, color: "var(--t3)", letterSpacing: .5, padding: "10px 14px", background: "rgba(0,212,232,.04)", border: "1px solid rgba(0,212,232,.1)", borderRadius: 8 }}>
              <svg viewBox="0 0 24 24" style={{ width: 13, height: 13, flexShrink: 0, fill: "none", stroke: "var(--neural)", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              End-to-end encrypted · Ngrok secure tunnel · Session expires after 8h inactivity
            </div>
          </form>
        </div>
      </div>
      <style>{`
        @media (max-width: 900px) {
          .login-grid { grid-template-columns: 1fr !important; }
          .login-grid > div:first-child { display: none; }
          .login-grid > div:last-child { padding: 64px 24px 40px !important; justify-content: flex-start !important; }
        }
      `}</style>
    </>
  );
}
