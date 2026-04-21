"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import NeuralCanvas from "@/components/NeuralCanvas";
import Cursor from "@/components/Cursor";
import Nav from "@/components/Nav";
import { useReveal } from "@/lib/useReveal";

/* ─── Ticker ─── */
function useTicker() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setPhase((p) => p + 0.05), 4000);
    return () => clearInterval(id);
  }, []);
  return phase;
}
function genTicks(phase: number) {
  return [
    { k: "NERVE-A TEMP", v: (62 + 10 * Math.sin(phase * .7)).toFixed(1), u: "°C", s: "ok" as const },
    { k: "NERVE-A VIB",  v: (35 + 18 * Math.sin(phase * 1.3)).toFixed(1), u: "mm/s", s: "warn" as const },
    { k: "SYNAPSE LDR",  v: String(Math.round(450 + 280 * Math.sin(phase * .4))), u: "lux", s: "ok" as const },
    { k: "NERVE-A HUM",  v: (55 + 12 * Math.sin(phase * .35)).toFixed(1), u: "%RH", s: "ok" as const },
    { k: "NERVE-B TEMP", v: (58 + 8 * Math.sin(phase * .9)).toFixed(1), u: "°C", s: "ok" as const },
    { k: "NERVE-B VIB",  v: (68 + 22 * Math.sin(phase * .6)).toFixed(1), u: "mm/s", s: "crit" as const },
    { k: "AMBIENT",      v: (28 + 3 * Math.sin(phase * .25)).toFixed(1), u: "°C", s: "ok" as const },
    { k: "AXON-C TEMP",  v: (45 + 5 * Math.cos(phase * .5)).toFixed(1), u: "°C", s: "ok" as const },
  ];
}

/* ─── Live mini-dashboard data ─── */
function useMiniData() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setPhase((p) => p + 0.07), 2000);
    return () => clearInterval(id);
  }, []);
  const temp = (62 + 10 * Math.sin(phase * .7)).toFixed(1);
  const vib  = (35 + 18 * Math.sin(phase * 1.3)).toFixed(1);
  const ldr  = Math.round(450 + 280 * Math.sin(phase * .4));
  const hum  = (55 + 12 * Math.sin(phase * .35)).toFixed(1);
  const hA   = Math.max(3, Math.min(100, Math.round(72 + 18 * (1 - (parseFloat(temp) - 50) / 60))));
  const hB   = Math.max(3, Math.min(100, Math.round(45 + 28 * (1 - parseFloat(vib) / 110))));
  const hD   = Math.max(3, Math.min(100, Math.round(18 + 20 * (1 - parseFloat(vib) / 110))));
  return { temp, vib, ldr, hum, hA, hB, hD };
}

/* ─── AI bars ─── */
const MODEL_DATA = { drl: 87, rf: 82, gbm: 84, ens: 93 };

function MiniDash({ id }: { id: string }) {
  const { temp, vib, ldr, hum, hA, hB, hD } = useMiniData();
  const now = new Date().toLocaleTimeString();
  const bCol = hB > 68 ? "var(--neural)" : hB > 40 ? "var(--amber)" : "var(--red)";
  return (
    <div className="mini-dashboard">
      <div className="mini-hdr">
        <div className="mini-hdr-left"><span className="mini-live-dot" />LIVE NEURAL FEED</div>
        <span className="mini-brand">REFLEXSENSE</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--t3)" }}>{now}</span>
      </div>
      <div className="mini-cards">
        <div className="mini-card"><div className="mini-card-l">Temperature</div><div className="mini-card-v teal">{temp}</div><div className="mini-card-u">°C</div></div>
        <div className="mini-card"><div className="mini-card-l">Vibration</div><div className="mini-card-v amber">{vib}</div><div className="mini-card-u">mm/s</div></div>
        <div className="mini-card"><div className="mini-card-l">Light (LDR)</div><div className="mini-card-v blue">{ldr}</div><div className="mini-card-u">lux</div></div>
        <div className="mini-card"><div className="mini-card-l">Humidity</div><div className="mini-card-v green">{hum}</div><div className="mini-card-u">%RH</div></div>
      </div>
      {[{label: "Machine A — Motor", pct: hA, col: "var(--neural)"}, {label: "Machine B — Conveyor", pct: hB, col: bCol}, {label: "Machine D — Pump", pct: hD, col: "var(--red)"}].map(b => (
        <div className="mini-bar-row" key={b.label}>
          <div className="mini-bar-label"><span>{b.label}</span><span>{b.pct}%</span></div>
          <div className="mini-bar-track"><div className="mini-bar-fill" style={{ width: `${b.pct}%`, background: b.col }} /></div>
        </div>
      ))}
      {id === "1" && (
        <div className="mini-alarms">
          <div className="mini-alarm alarm-crit"><span className="alarm-dot" />NERVE-B VIB — 71 mm/s exceeds CRIT<span className="alarm-next">→ Inspect bearing</span></div>
          <div className="mini-alarm alarm-warn"><span className="alarm-dot" />AXON-C TEMP — Rising trend +8°C / 4h<span className="alarm-next">→ Check coolant</span></div>
          <div className="mini-alarm alarm-ok"><span className="alarm-dot" />NERVE-A — All systems nominal</div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  useReveal();
  const tickerPhase = useTicker();
  const ticks = genTicks(tickerPhase);
  const [barsVisible, setBarsVisible] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!barRef.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setBarsVisible(true); obs.disconnect(); } }, { threshold: .3 });
    obs.observe(barRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <Cursor />
      <NeuralCanvas opacity={0.45} />
      <Nav />

      {/* ── HERO ── */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "140px 48px 80px", textAlign: "center", overflow: "hidden", zIndex: 1 }}>
        <div style={{ position: "absolute", top: -100, left: "50%", transform: "translateX(-50%)", width: 900, height: 600, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(0,212,232,.08) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px 6px 8px", borderRadius: 100, background: "rgba(0,212,232,.06)", border: "1px solid rgba(0,212,232,.25)", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--neural)", letterSpacing: 2, marginBottom: 32, animation: "fadeUp .7s ease both" }}>
          <div className="pulse-dot" />INTELLIGENT INDUSTRIAL SYSTEM
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(42px,7vw,88px)", fontWeight: 800, lineHeight: 1, letterSpacing: -3, marginBottom: 8, animation: "fadeUp .8s .1s ease both", background: "linear-gradient(270deg,#9e9a9a,#cfd8e3,#1f354d)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
          NERVOUS SYSTEM
        </h1>
        <div style={{ fontSize: 12, letterSpacing: "0.35em", color: "var(--t3)", marginTop: 8, fontFamily: "var(--font-display)" }}>BEYOND</div>
        <div style={{ fontSize: "clamp(24px,3vw,36px)", letterSpacing: "0.5em", background: "linear-gradient(180deg,#9fb3c8,#5f738a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", fontFamily: "var(--font-display)", fontWeight: 700 }}>PREDICTIVE</div>
        <p style={{ maxWidth: 620, fontSize: 16, lineHeight: 1.75, color: "var(--t2)", margin: "20px auto 0", animation: "fadeUp .8s .2s ease both" }}>
          Detect failures early and act faster with affordable predictive maintenance by converting avoided downtime into output.
        </p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, flexWrap: "wrap", margin: "44px 0 64px", animation: "fadeUp .8s .35s ease both" }}>
          <Link href="#features" className="btn-hero-outline">Explore</Link>
          <Link href="/dashboard" className="btn-hero-fill">Dashboard</Link>
          <Link href="/contact" className="btn-hero-outline">Get In Touch</Link>
        </div>
        {/* Ticker */}
        <div className="ticker-wrap" style={{ width: "min(960px,92vw)", animation: "fadeUp .8s .45s ease both" }}>
          <div className="ticker-bar">
            <span className="ticker-dot" /><span className="ticker-label">LIVE SYSTEMS</span>
            <span className="ticker-identity">· REFLEXSENSE v2.4</span>
            <span className="ticker-time">{new Date().toLocaleTimeString()}</span>
          </div>
          <div className="ticker-scroll">
            <div className="ticker-track">
              {[...ticks, ...ticks].map((t, i) => (
                <span key={i} className="tick">
                  <span className="tick-key">{t.k}</span>
                  <span className={`tick-val ${t.s}`}>{t.v}<span style={{ fontSize: 9, opacity: .55, marginLeft: 2 }}>{t.u}</span></span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", background: "var(--deep)", position: "relative", zIndex: 1 }}>
        {[
          { num: "$304M", label: "Capital Preserved" },
          { num: "97,631", label: "Hours of Downtime Avoided" },
          { num: "93.4%", label: "AI Prediction Accuracy" },
          { num: "1 GWh", label: "Energy Saved Per Year" },
        ].map((s, i) => (
          <div key={i} className={`reveal reveal-d${i}`} style={{ padding: "30px 24px", textAlign: "center", borderRight: i < 3 ? "1px solid var(--border)" : "none", position: "relative" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px,3.5vw,44px)", fontWeight: 800, background: "linear-gradient(135deg, var(--neural), var(--pulse))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", lineHeight: 1 }}>{s.num}</div>
            <div style={{ fontSize: 11.5, color: "var(--t2)", marginTop: 8, letterSpacing: .3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── DASHBOARD SHOWCASE ── */}
      <section id="dashboard" style={{ background: "var(--bg)", padding: "96px 48px", borderTop: "1px solid var(--border)", position: "relative", zIndex: 1 }}>
        <div className="container">
          <div className="reveal"><span className="section-eyebrow">ONE COMMAND CENTER</span></div>
          <h2 className="section-h reveal reveal-d1">The brain of<br />your <em>operation.</em></h2>
          <p className="section-p reveal reveal-d2">Not just data — intelligence. Your dashboard is the living cortex that sees, understands, and acts on every signal from every machine, in real time.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 72, alignItems: "center", marginTop: 56 }} className="dash-inner-grid">
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }} className="reveal">
              {[
                { icon: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>, title: "Real-Time Senses", desc: "Live telemetry for vibration, temperature, and light intensity gathered from rigid, industrial-grade MEMS sensors — streamed every 2 seconds.", col: "var(--neural)" },
                { icon: <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>, title: "Actionable Alarms", desc: "Alarms you can trust with clear next steps — WARN and CRIT thresholds per sensor, escalating from amber to red.", col: "var(--pulse)" },
                { icon: <><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></>, title: "Device Health & Status", desc: "Equipment status awareness at a glance — health scores, uptime bars, and reliable communication status for every connected node.", col: "var(--amber)" },
                { icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>, title: "Secure Infrastructure", desc: "Secure and scalable data infrastructure powered by ngrok for safe data tunneling — your machine data travels encrypted.", col: "var(--green)" },
              ].map((f) => (
                <div key={f.title} style={{ display: "flex", gap: 18, padding: 20, border: "1px solid var(--border)", borderRadius: 12, transition: "border-color .3s, background .3s" }} className="cursor-hover"
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.background = "rgba(0,212,232,.03)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "transparent"; }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: `${f.col}1a`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, fill: "none", stroke: f.col, strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" }}>{f.icon}</svg>
                  </div>
                  <div>
                    <h4 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "var(--t1)", marginBottom: 5 }}>{f.title}</h4>
                    <p style={{ fontSize: 12.5, color: "var(--t2)", lineHeight: 1.55 }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="reveal reveal-d2"><MiniDash id="1" /></div>
          </div>
        </div>
        <style>{`@media(max-width:900px){.dash-inner-grid{grid-template-columns:1fr !important;gap:40px !important;}}`}</style>
      </section>

      {/* ── ECONOMIC IMPACT ── */}
      <section id="economic" style={{ background: "var(--bg2)", padding: "96px 48px", borderTop: "1px solid var(--border)", position: "relative", zIndex: 1 }}>
        <div className="container">
          <div className="reveal"><span className="section-eyebrow">TURNING TIME INTO REVENUE</span></div>
          <h2 className="section-h reveal reveal-d1">The cost of <em>reactive</em><br />maintenance is enormous.</h2>
          <p className="section-p reveal reveal-d2" style={{ marginBottom: 52 }}>Every hour of unplanned downtime is revenue lost, morale spent, and competitive ground surrendered.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "var(--border)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden", marginBottom: 60 }} className="reveal econ-grid">
            {[
              { val: "97,631", label: "HOURS TURNED BACK INTO REVENUE", sub: "Downtime avoided across active deployments" },
              { val: "1 GWh", label: "ENERGY SAVED PER YEAR", sub: "Leaner operations team, optimised load cycles" },
              { val: "40%", label: "REDUCTION IN MAINTENANCE SPEND", sub: "Fix only what needs fixing, only when it needs it" },
            ].map((m) => (
              <div key={m.val} style={{ background: "var(--card)", padding: "40px 32px", textAlign: "center", position: "relative" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,var(--neural),transparent)" }} />
                <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px,5vw,60px)", fontWeight: 800, lineHeight: 1, background: "linear-gradient(135deg,var(--neural3),var(--neural))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{m.val}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 1.5, color: "var(--t2)", marginTop: 10 }}>{m.label}</div>
                <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 4 }}>{m.sub}</div>
              </div>
            ))}
          </div>
          {/* VS Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 24, alignItems: "stretch" }} className="reveal vs-grid">
            <div style={{ background: "rgba(255,77,106,.04)", border: "1px solid rgba(255,77,106,.2)", borderRadius: 14, padding: 36 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 2, color: "var(--red)", marginBottom: 14 }}>REACTIVE APPROACH</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--t1)", marginBottom: 20 }}>Machine Breaks → Repair</div>
              {["⚡ Unexpected failure mid-production", "🛑 Emergency shutdown, production halts", "📞 Rush-call technician, source spare parts", "⏳ 4–48 hours of unplanned downtime", "📉 Cascading damage to downstream systems"].map((s) => (
                <div key={s} style={{ fontSize: 13, color: "var(--t2)", marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>{s}</div>
              ))}
              <div style={{ marginTop: 20, padding: 14, borderRadius: 8, background: "rgba(255,77,106,.1)", color: "var(--red)", fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 500 }}>Avg. cost: $15,000–$260,000 per incident</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "var(--t3)" }}>VS</div>
            <div style={{ background: "rgba(0,212,232,.04)", border: "1px solid rgba(0,212,232,.2)", borderRadius: 14, padding: 36 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 2, color: "var(--neural)", marginBottom: 14 }}>PREDICTIVE APPROACH</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--t1)", marginBottom: 20 }}>Early Signal → Maintenance Before Breakdown</div>
              {["📡 ReflexSense detects anomaly: vibration trend rising", "🔔 Actionable alarm with clear next steps dispatched", "🔧 Scheduled maintenance during planned downtime", "✅ Machine repaired before failure, zero disruption", "📈 Full production output maintained"].map((s) => (
                <div key={s} style={{ fontSize: 13, color: "var(--t2)", marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>{s}</div>
              ))}
              <div style={{ marginTop: 20, padding: 14, borderRadius: 8, background: "rgba(0,212,232,.1)", color: "var(--neural)", fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 500 }}>Avg. cost: $500–$2,000 per intervention</div>
            </div>
          </div>
        </div>
        <style>{`@media(max-width:900px){.vs-grid{grid-template-columns:1fr !important;}.vs-grid>div:nth-child(2){display:none;} .econ-grid{grid-template-columns:1fr !important;}}`}</style>
      </section>

      {/* ── PERSONAS ── */}
      <section id="personas" style={{ background: "var(--void)", padding: "96px 48px", borderTop: "1px solid var(--border)", position: "relative", zIndex: 1 }}>
        <div className="container">
          <div className="reveal"><span className="section-eyebrow">WHO WE SERVE</span></div>
          <h2 className="section-h reveal reveal-d1">Built for every<br /><em>decision-maker</em> on the floor.</h2>
          <p className="section-p reveal reveal-d2">ReflexSense delivers what matters most to the people who matter most — at every level of the operation.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, marginTop: 56 }} className="personas-grid">
            {[
              { tag: "PLANT MANAGER", cls: "persona-pm", name: "Lead with Confidence.", tagline: "Drive tangible results and make outcomes more predictable across every line.", desc: "You're accountable for the entire floor. ReflexSense gives you a single view of every machine's health — so your weekly reports show progress, not post-mortems.", benefit: "↑ OEE · Predictable output · Board-ready metrics", benefitColor: "var(--neural)" },
              { tag: "RELIABILITY ENGINEER", cls: "persona-re", name: "Own the Data.", tagline: "Gain clarity on root causes and drive smarter decisions with 9-axis motion fusion.", desc: "You live in the data. ReflexSense gives you the full vibration spectrum, temperature trends, and humidity drift — across all axes, all sensors, all history.", benefit: "9-axis MEMS fusion · Root cause clarity · Trend memory", benefitColor: "var(--pulse)" },
              { tag: "MAINTENANCE ENGINEER", cls: "persona-me", name: "Stay Ahead of Failures.", tagline: "Get a break. Keep machines running smoothly without the stress of sudden breakdowns.", desc: "You're the last line of defence. ReflexSense turns reactive firefighting into planned, confident action. Alarms tell you exactly what's wrong and what to do first.", benefit: "Clear next steps · Scheduled work orders · Less stress", benefitColor: "var(--green)" },
            ].map((p, i) => (
              <div key={i} className={`persona-card ${p.cls} reveal reveal-d${i}`}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 2, color: "var(--neural)", marginBottom: 24, display: "block" }}>{p.tag}</span>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--t1)", marginBottom: 10 }}>{p.name}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: p.benefitColor, marginBottom: 14, lineHeight: 1.4 }}>{p.tagline}</div>
                <p style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.65 }}>{p.desc}</p>
                <div style={{ marginTop: 20, padding: "12px 16px", background: "rgba(0,212,232,.05)", border: `1px solid ${p.benefitColor}30`, borderRadius: 8, fontFamily: "var(--font-mono)", fontSize: 11, color: p.benefitColor }}>{p.benefit}</div>
              </div>
            ))}
          </div>
        </div>
        <style>{`@media(max-width:900px){.personas-grid{grid-template-columns:1fr !important;}}`}</style>
      </section>

      {/* ── ADAPTIVE ADVANTAGE ── */}
      <section id="adaptive" style={{ background: "var(--bg)", padding: "96px 48px", borderTop: "1px solid var(--border)", position: "relative", zIndex: 1 }}>
        <div className="container">
          <div className="reveal"><span className="section-eyebrow">THE ADAPTIVE ADVANTAGE</span></div>
          <h2 className="section-h reveal reveal-d1">Deep tech that<br /><em>evolves</em> with you.</h2>
          <p className="section-p reveal reveal-d2">Unlike static models that decay after deployment, our AI continuously learns from your machines — reaching precision that static rules can never match.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center", marginTop: 56 }} className="adaptive-grid">
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }} className="reveal">
              {[
                { num: "01", title: "Adaptive Ensemble AI", body: "Our system combines Deep Reinforcement Learning, Random Forest, and Gradient Boosted Machines in an ensemble that continues to evolve after deployment.", badge: "DRL + RF + GBM ENSEMBLE" },
                { num: "02", title: "No Rip-and-Replace", body: "Built to plug into the tools teams already use. ReflexSense integrates natively with SAP, Oracle NetSuite, Power BI, and your existing CMMS.", badge: "SAP · NETSUITE · POWER BI · CMMS" },
                { num: "03", title: "Rigid Industrial Hardware", body: "Our devices are engineered to withstand temperature extremes and industrial vibration. MEMS-grade sensors rated for real shop-floor conditions.", badge: "IP-RATED · MEMS-GRADE · INDUSTRIAL CERTIFIED" },
              ].map((p) => (
                <div key={p.num} style={{ padding: 24, border: "1px solid var(--border)", borderRadius: 12, transition: "border-color .3s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border2)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--neural)", letterSpacing: 1 }}>{p.num}</span>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, color: "var(--t1)" }}>{p.title}</div>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.6 }}>{p.body}</p>
                  <span style={{ display: "inline-flex", fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--neural)", padding: "2px 8px", border: "1px solid rgba(0,212,232,.25)", borderRadius: 3, marginTop: 8, letterSpacing: 1 }}>{p.badge}</span>
                </div>
              ))}
            </div>
            <div className="reveal reveal-d2" ref={barRef} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 32 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 2, color: "var(--neural)", marginBottom: 24 }}>ADAPTIVE ENSEMBLE MODEL PERFORMANCE</div>
              <div style={{ textAlign: "center", marginBottom: 28 }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 64, fontWeight: 800, background: "linear-gradient(135deg,var(--neural3),var(--neural))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", lineHeight: 1 }}>93.4%</div>
                <div style={{ fontSize: 12, color: "var(--t2)", marginTop: 4 }}>Prediction Accuracy (Post-Deployment Learning)</div>
              </div>
              {Object.entries(MODEL_DATA).map(([key, val]) => (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: key === "ens" ? "var(--neural)" : "var(--t2)", minWidth: 36, letterSpacing: .5, textTransform: "uppercase" }}>{key}</span>
                  <div style={{ flex: 1, height: 4, background: "var(--border)", borderRadius: 2 }}>
                    <div style={{ height: "100%", borderRadius: 2, width: barsVisible ? `${val}%` : "0%", background: `linear-gradient(90deg,var(--neural),var(--neural2))`, transition: "width 2s ease" }} />
                  </div>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--t2)", minWidth: 36, textAlign: "right" }}>{barsVisible ? `${val}%` : "–"}</span>
                </div>
              ))}
              <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 2, color: "var(--t3)", marginBottom: 12 }}>NATIVE INTEGRATIONS</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {["SAP", "Oracle NetSuite", "Power BI", "CMMS", "REST API"].map((c) => (
                    <span key={c} style={{ fontFamily: "var(--font-mono)", fontSize: 10, padding: "5px 12px", borderRadius: 5, background: "var(--bg2)", border: "1px solid var(--border)", color: "var(--t2)" }}>{c}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <style>{`@media(max-width:900px){.adaptive-grid{grid-template-columns:1fr !important;gap:48px !important;}}`}</style>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ background: "var(--bg2)", padding: "96px 48px", borderTop: "1px solid var(--border)", position: "relative", zIndex: 1 }}>
        <div className="container">
          <div className="reveal"><span className="section-eyebrow">CAPABILITIES</span></div>
          <h2 className="section-h reveal reveal-d1">Built for <em>real industry.</em></h2>
          <p className="section-p reveal reveal-d2">Every capability forged for the shop floor. Rugged, fast, and readable in milliseconds.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: "var(--border)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden", marginTop: 56 }} className="feat-grid">
            {[
              { icon: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>, title: "Real-Time Sensing", body: "Every 2 seconds, live readings from thermistors, vibration, LDR and humidity sensors stream into your dashboard — zero latency, zero guessing.", col: "var(--neural)", n: "01" },
              { icon: <><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></>, title: "Predictive Reflexes", body: "Pattern recognition flags vibration trends, temperature spikes, and humidity drift before they cascade into failures. Catch it early, fix it cheap.", col: "var(--pulse)", n: "02" },
              { icon: <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>, title: "Neural Alert System", body: "Configurable WARN and CRIT thresholds per sensor. Alerts escalate from amber to red — visual signals that mirror biological stress responses.", col: "var(--amber)", n: "03" },
              { icon: <><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></>, title: "Command Dashboard", body: "A live command center view — charts, health bars, and machine states. Responsive for phone, tablet, and control-room screen alike.", col: "var(--green)", n: "04" },
            ].map((f, i) => (
              <div key={i} className={`feat-card reveal reveal-d${i}`}>
                <div style={{ position: "absolute", top: 16, right: 20, fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--border2)" }}>{f.n}</div>
                <div style={{ width: 46, height: 46, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 22, background: `${f.col}1a` }}>
                  <svg viewBox="0 0 24 24" style={{ width: 22, height: 22, fill: "none", stroke: f.col, strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" }}>{f.icon}</svg>
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 700, color: "var(--t1)", marginBottom: 10 }}>{f.title}</div>
                <p style={{ fontSize: 13, lineHeight: 1.65, color: "var(--t2)" }}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
        <style>{`@media(max-width:900px){.feat-grid{grid-template-columns:1fr 1fr !important;} @media(max-width:600px){.feat-grid{grid-template-columns:1fr !important;}}}`}</style>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={{ background: "var(--void)", padding: "96px 48px", borderTop: "1px solid var(--border)", position: "relative", zIndex: 1 }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }} className="how-grid">
            <div>
              <div className="reveal"><span className="section-eyebrow">NEURAL PIPELINE</span></div>
              <h2 className="section-h reveal reveal-d1">From sensor<br />to <em>insight.</em></h2>
              <p className="section-p reveal reveal-d2" style={{ marginBottom: 40 }}>Four neural stages — sense, transmit, analyse, act — one seamless reflex arc from raw hardware to actionable decision.</p>
              <div>
                {[
                  { n: "01", title: "Sense", body: "RP2040 reads thermistors, vibration, LDR and humidity probes via MicroPython firmware. Machines feel their environment for the first time.", tag: "DENDRITE INPUT" },
                  { n: "02", title: "Transmit", body: "Readings pulse over a FastAPI server via secure Ngrok tunnel — the axon carrying signals from machine to brain, anywhere on Earth.", tag: "AXON SIGNAL" },
                  { n: "03", title: "Analyse", body: "The server stores history, computes health scores, and flags threshold crossings. This is the machine's cortex — building memory and context.", tag: "CORTEX PROCESS" },
                  { n: "04", title: "Act", body: "The live dashboard visualises every stream — charts, alerts, health bars — giving operators the motor response they need, instantly.", tag: "MOTOR RESPONSE" },
                ].map((s, i) => (
                  <div key={i} className={`reveal reveal-d${i}`} style={{ display: "flex", gap: 20, padding: "26px 0", borderBottom: i < 3 ? "1px solid var(--border)" : "none" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--neural)", letterSpacing: 1, minWidth: 28, paddingTop: 3 }}>{s.n}</span>
                    <div>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--t1)", marginBottom: 6 }}>{s.title}</div>
                      <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--t2)" }}>{s.body}</p>
                      <span style={{ display: "inline-block", fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 1, color: "var(--pulse)", padding: "2px 8px", border: "1px solid rgba(108,159,255,.25)", borderRadius: 3, marginTop: 8 }}>{s.tag}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="reveal reveal-d2"><MiniDash id="2" /></div>
          </div>
        </div>
        <style>{`@media(max-width:900px){.how-grid{grid-template-columns:1fr !important;gap:48px !important;}}`}</style>
      </section>

      {/* ── USE CASES ── */}
      <section id="usecases" style={{ background: "var(--bg)", padding: "96px 48px", borderTop: "1px solid var(--border)", position: "relative", zIndex: 1 }}>
        <div className="container">
          <div className="reveal"><span className="section-eyebrow">VERSATILE PROTECTION</span></div>
          <h2 className="section-h reveal reveal-d1">One nervous system.<br /><em>Every sector.</em></h2>
          <p className="section-p reveal reveal-d2">Designed for operations that can't afford enterprise downtime — or enterprise pricing.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16, marginTop: 56 }} className="uc-grid">
            {[
              { n: "01", title: "Manufacturing", body: "Preventing production line halts that lead to massive losses. Monitor motors, conveyors, compressors and pumps. Catch bearing wear through vibration trends before your line goes dark.", tags: ["VIBRATION","TEMPERATURE","UPTIME","OEE"] },
              { n: "02", title: "Agriculture", body: "Providing calculated solutions to save crops from weather-related revenue reversal. Track soil humidity, greenhouse temperature, and light intensity for data-driven irrigation and crop protection.", tags: ["HUMIDITY","LIGHT (LDR)","CROP SAFETY"] },
              { n: "03", title: "Transportation & Railways", body: "Monitoring point machines to detect degradation before failure. Continuously sense switching mechanisms and mechanical components — catching early degradation before it becomes a safety incident.", tags: ["VIBRATION","REAL-TIME","SAFETY","ALERTS"] },
              { n: "04", title: "Healthcare & Facilities", body: "Ensuring stability in critical automation environments. HVAC systems, refrigeration units and clinical automation stay within safe operating parameters — environmental drift triggers alerts before patient safety is affected.", tags: ["TEMPERATURE","HUMIDITY","COMPLIANCE"] },
            ].map((u, i) => (
              <div key={i} className={`uc-card reveal reveal-d${i}`}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 28, color: "var(--border2)", lineHeight: 1, minWidth: 34, paddingTop: 4, transition: "color .3s" }}>{u.n}</div>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--t1)", marginBottom: 8 }}>{u.title}</div>
                  <p style={{ fontSize: 13, lineHeight: 1.65, color: "var(--t2)" }}>{u.body}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
                    {u.tags.map((t) => (
                      <span key={t} style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: .8, padding: "3px 9px", borderRadius: 4, background: "rgba(0,212,232,.06)", color: "var(--neural)", border: "1px solid rgba(0,212,232,.18)" }}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <style>{`@media(max-width:768px){.uc-grid{grid-template-columns:1fr !important;}}`}</style>
      </section>

      {/* ── TECH STACK ── */}
      <div style={{ background: "var(--bg2)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", position: "relative", zIndex: 1 }}>
        <div className="container" style={{ padding: "0 48px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap", padding: "28px 0" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, color: "var(--t3)", letterSpacing: 2.5 }}>NEURAL STACK</span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["RP2040","MicroPython","FastAPI","Ngrok","Chart.js","Thermistor","LDR Sensor","Vibration MEMS","DHT Humidity","DRL + RF + GBM"].map((c) => (
                <span key={c} style={{ fontFamily: "var(--font-mono)", fontSize: 11, padding: "7px 14px", borderRadius: 6, background: "var(--card)", border: "1px solid var(--border)", color: "var(--t2)", transition: "border-color .2s, color .2s", cursor: "default" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--neural)"; e.currentTarget.style.color = "var(--neural)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--t2)"; }}>{c}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <section style={{ background: "var(--void)", textAlign: "center", padding: "100px 48px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 800, margin: "0 auto", border: "1px solid var(--border)", borderRadius: 20, padding: "72px 56px", background: "var(--bg)", position: "relative", overflow: "hidden" }} className="reveal">
          <div style={{ position: "absolute", top: -100, left: "50%", transform: "translateX(-50%)", width: 500, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,212,232,.1) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 2, color: "var(--neural)", padding: "4px 14px", border: "1px solid rgba(0,212,232,.2)", borderRadius: 100, marginBottom: 24 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--neural)", display: "inline-block", animation: "blink 1.4s infinite" }} /> REFLEXSENSE SYSTEM ACTIVE
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px,4.5vw,52px)", fontWeight: 800, lineHeight: 1, color: "var(--t1)", marginBottom: 18, letterSpacing: -1 }}>From insight<br />to <em style={{ fontStyle: "normal", color: "var(--neural)" }}>action.</em></h2>
          <p style={{ fontSize: 16, fontStyle: "italic", color: "var(--t2)", maxWidth: 520, margin: "0 auto 12px", lineHeight: 1.7 }}>"Our team now sees technology as a partner in decision-making, not just a tool."</p>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--t3)", marginBottom: 36 }}>— Operations Director, ReflexSense Client</p>
          <p style={{ fontFamily: "var(--font-display)", fontSize: "clamp(18px,2.8vw,28px)", fontWeight: 700, color: "var(--lgrey)", marginBottom: 44, letterSpacing: -.5 }}>Your equipment is already sending signals.<br /><em style={{ color: "var(--neural)", fontStyle: "normal" }}>Are you listening?</em></p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <Link href="/contact" className="btn-hero-fill">Get In Touch</Link>
            <Link href="/login" className="btn-hero-outline">Login</Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "36px 48px", background: "var(--void)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 26, height: 26, borderRadius: 6, background: "linear-gradient(135deg,var(--neural),var(--pulse))", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg viewBox="0 0 24 24" style={{ width: 13, height: 13, fill: "none", stroke: "var(--void)", strokeWidth: 2.2, strokeLinecap: "round" }}><circle cx="12" cy="12" r="3" /><line x1="12" y1="9" x2="12" y2="3" /><line x1="14.6" y1="9.7" x2="19" y2="6" /><line x1="14.6" y1="14.3" x2="19" y2="18" /><line x1="12" y1="15" x2="12" y2="21" /><line x1="9.4" y1="14.3" x2="5" y2="18" /><line x1="9.4" y1="9.7" x2="5" y2="6" /></svg>
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 800, letterSpacing: 1.5, color: "var(--t2)" }}>REFLEXSENSE</span>
        </div>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {[["#", "Documentation"], ["/dashboard", "Dashboard"], ["#features", "Capabilities"], ["#usecases", "Industries"]].map(([href, label]) => (
            <Link key={label} href={href} style={{ fontSize: 12, color: "var(--t3)", textDecoration: "none" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--neural)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--t3)")}>{label}</Link>
          ))}
        </div>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--t3)" }}>© 2025 ReflexSense · The Nervous System Pvt. Ltd</span>
      </footer>
    </>
  );
}
