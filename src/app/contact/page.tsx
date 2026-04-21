"use client";
import { useState } from "react";
import Link from "next/link";
import NeuralCanvas from "@/components/NeuralCanvas";
import Cursor from "@/components/Cursor";
import { useReveal } from "@/lib/useReveal";

const INTERESTS = ["Product Demo","Pricing & ROI","Site Pilot","Technical Deep-Dive","Partnership","Customer Support"];
const FAQS = [
  { q: "How long does deployment take?", a: "Most customers have sensors live and streaming within 48–72 hours. Our plug-and-play RP2040 nodes require no infrastructure changes, and the ngrok tunnel is configured in under 10 minutes." },
  { q: "Do we need to replace existing equipment?", a: "No rip-and-replace required. ReflexSense attaches non-invasively to existing machines and integrates with SAP, Oracle NetSuite, Power BI, and most CMMS platforms via REST API." },
  { q: "How is pricing structured?", a: "Pricing is per monitored asset, billed annually. We offer a Starter tier (up to 10 nodes), Professional (up to 100 nodes), and Enterprise (unlimited + custom SLA)." },
  { q: "Is our machine data secure?", a: "All data travels encrypted through our ngrok secure tunnel infrastructure. We are SOC 2 Type II compliant, and optionally offer on-premise deployment for air-gapped environments." },
];
const STATUS = [
  { name: "NEURAL API", ok: true },
  { name: "DASHBOARD CLOUD", ok: true },
  { name: "NGROK TUNNEL", ok: true },
  { name: "ALERTING ENGINE", ok: true },
  { name: "DATA INGESTION", ok: false },
];

const LogoIcon = () => (
  <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, fill: "none", stroke: "rgba(2,6,16,.9)", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }}>
    <circle cx="12" cy="12" r="3" /><line x1="12" y1="9" x2="12" y2="3" /><line x1="14.6" y1="9.7" x2="19" y2="6" />
    <line x1="14.6" y1="14.3" x2="19" y2="18" /><line x1="12" y1="15" x2="12" y2="21" /><line x1="9.4" y1="14.3" x2="5" y2="18" /><line x1="9.4" y1="9.7" x2="5" y2="6" />
  </svg>
);

export default function ContactPage() {
  useReveal();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function toggleInterest(i: string) {
    setSelectedInterests((p) => p.includes(i) ? p.filter((x) => x !== i) : [...p, i]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => setSubmitted(true), 1600);
  }

  return (
    <>
      <Cursor />
      <NeuralCanvas opacity={0.35} />

      {/* NAV */}
      <nav className="nav">
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
          <div className="nav-logo-mark"><LogoIcon /></div>
          <span className="nav-logotype">Reflex<span>Sense</span></span>
        </Link>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Link href="/" className="btn-ghost">← Back to Home</Link>
          <Link href="/login" className="btn-primary">Login</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position: "relative", padding: "160px 48px 80px", textAlign: "center", overflow: "hidden", zIndex: 1 }}>
        <div style={{ position: "absolute", top: -80, left: "50%", transform: "translateX(-50%)", width: 800, height: 500, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(0,212,232,.07) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px 6px 8px", borderRadius: 100, background: "rgba(0,212,232,.06)", border: "1px solid rgba(0,212,232,.25)", fontFamily: "var(--font-mono)", fontSize: 9.5, color: "var(--neural)", letterSpacing: 2, marginBottom: 28, animation: "fadeUp .7s ease both" }}>
          <div className="pulse-dot" />NEURAL SUPPORT NETWORK ONLINE
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(40px,7vw,88px)", fontWeight: 800, lineHeight: .95, letterSpacing: -2.5, color: "var(--t1)", marginBottom: 20, animation: "fadeUp .8s .08s ease both" }}>
          Let's <em style={{ fontStyle: "normal", background: "linear-gradient(90deg,var(--neural3),var(--neural),var(--pulse))", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", animation: "shimmer 5s linear 1s infinite" }}>connect</em><br />your operation.
        </h1>
        <p style={{ maxWidth: 520, margin: "0 auto", fontSize: 16, color: "var(--t2)", lineHeight: 1.75, animation: "fadeUp .8s .16s ease both" }}>
          Whether you're ready to deploy, evaluating options, or just curious how ReflexSense works — our team speaks your language: downtime, OEE, MTBF, and ROI.
        </p>
      </section>

      {/* CONTACT WAYS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: "var(--border)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", position: "relative", zIndex: 1 }} className="cways-grid">
        {[
          { icon: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.81A16 16 0 0 0 16 16.91l.86-.86a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>, label: "DIRECT LINE", title: "Talk to Sales", val: "+1 800 123 4567", valHref: "tel:+18001234567", note: "Talk to a solutions engineer who understands your industry — not a script-reader.", resp: "Available Mon–Fri, 08:00–18:00 UTC", col: "var(--neural)" },
          { icon: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>, label: "EMAIL", title: "Send a Message", val: "hello@reflexsense.io", valHref: "mailto:hello@reflexsense.io", note: "For demos, pricing, partnership enquiries, or technical questions. We read every email.", resp: "Typical response: < 4 hours", col: "var(--pulse)" },
          { icon: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>, label: "LIVE CHAT", title: "Chat with Support", val: "Open Chat Window →", valHref: "#", note: "Already a customer? Live chat connects you directly to our support engineering team.", resp: "Average wait: < 2 minutes", col: "var(--green)" },
        ].map((c, i) => (
          <div key={i} className={`reveal reveal-d${i}`} style={{ background: "var(--card)", padding: "36px 32px", display: "flex", flexDirection: "column", gap: 14, position: "relative", overflow: "hidden", transition: "background .3s" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg2)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--card)"; }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: `${c.col}1a` }}>
              <svg viewBox="0 0 24 24" style={{ width: 22, height: 22, fill: "none", stroke: c.col, strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" }}>{c.icon}</svg>
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 2, color: "var(--t3)" }}>{c.label}</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--t1)" }}>{c.title}</div>
            <a href={c.valHref} style={{ fontSize: 14, color: c.col, textDecoration: "none" }}>{c.val}</a>
            <p style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.5 }}>{c.note}</p>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, color: "var(--t3)", marginTop: "auto", paddingTop: 8, borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ display: "inline-block", width: 5, height: 5, borderRadius: "50%", background: "var(--neural)", animation: "blink 1.4s infinite" }} />{c.resp}
            </div>
          </div>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", borderTop: "1px solid var(--border)", position: "relative", zIndex: 1 }} className="contact-main-grid">

        {/* FORM SIDE */}
        <div style={{ padding: "80px 64px", borderRight: "1px solid var(--border)" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 2.5, color: "var(--neural)", marginBottom: 16 }}>SEND A MESSAGE</p>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px,3vw,40px)", fontWeight: 800, letterSpacing: -1, color: "var(--t1)", marginBottom: 10 }}>Tell us what<br />you <em style={{ fontStyle: "normal", color: "var(--neural)" }}>need.</em></h2>
          <p style={{ fontSize: 14, color: "var(--t2)", lineHeight: 1.7, marginBottom: 40, maxWidth: 400 }}>We'll match you with the right team — whether that's a demo, a pricing call, a technical deep-dive, or a pilot proposal for your facility.</p>

          {submitted ? (
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(0,212,232,.1)", border: "2px solid rgba(0,212,232,.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                <svg viewBox="0 0 24 24" style={{ width: 32, height: 32, fill: "none", stroke: "var(--neural)", strokeWidth: 2, strokeLinecap: "round" }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "var(--t1)", marginBottom: 12 }}>Signal received.</div>
              <p style={{ fontSize: 14, color: "var(--t2)", lineHeight: 1.7, maxWidth: 360, margin: "0 auto" }}>Thanks for reaching out. A ReflexSense solutions engineer will respond within 4 hours — usually much sooner.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="form-2col">
                {[{ id: "fname", label: "FIRST NAME", placeholder: "Maria" }, { id: "lname", label: "LAST NAME", placeholder: "Santos" }].map((f) => (
                  <div key={f.id} style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    <label htmlFor={f.id} style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: 1.5, color: "var(--t2)" }}>{f.label}</label>
                    <input id={f.id} type="text" placeholder={f.placeholder} required style={{ padding: "13px 16px" }} />
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                <label htmlFor="cemail" style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: 1.5, color: "var(--t2)" }}>WORK EMAIL</label>
                <input id="cemail" type="email" placeholder="maria@plantops.com" required style={{ padding: "13px 16px" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="form-2col">
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  <label htmlFor="company" style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: 1.5, color: "var(--t2)" }}>COMPANY</label>
                  <input id="company" type="text" placeholder="Acme Industries" required style={{ padding: "13px 16px" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  <label htmlFor="role" style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: 1.5, color: "var(--t2)" }}>YOUR ROLE</label>
                  <select id="role" style={{ padding: "13px 16px", appearance: "none", color: "var(--t2)" }}>
                    <option value="">Select role…</option>
                    {["Plant Manager","Reliability Engineer","Maintenance Engineer","Operations Director","CTO / Head of Engineering","Procurement","Other"].map((r) => <option key={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                <label htmlFor="industry" style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: 1.5, color: "var(--t2)" }}>INDUSTRY</label>
                <select id="industry" style={{ padding: "13px 16px", appearance: "none", color: "var(--t2)" }}>
                  <option value="">Select industry…</option>
                  {["Manufacturing","Agriculture","Transportation / Railways","Healthcare & Facilities","Energy & Utilities","Mining","Other"].map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <label style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: 1.5, color: "var(--t2)" }}>I'M INTERESTED IN</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {INTERESTS.map((it) => (
                    <span key={it} onClick={() => toggleInterest(it)} style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: .5, padding: "7px 14px", borderRadius: 6, background: selectedInterests.includes(it) ? "rgba(0,212,232,.07)" : "var(--card)", border: `1px solid ${selectedInterests.includes(it) ? "var(--neural)" : "var(--border)"}`, color: selectedInterests.includes(it) ? "var(--neural)" : "var(--t2)", cursor: "pointer", transition: "all .2s", userSelect: "none" }}>
                      {it}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                <label htmlFor="message" style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: 1.5, color: "var(--t2)" }}>MESSAGE</label>
                <textarea id="message" placeholder="Tell us about your operation — number of machines, current challenges, or what you'd like to achieve with ReflexSense..." required style={{ padding: "13px 16px", minHeight: 130, resize: "vertical", lineHeight: 1.6 }} />
              </div>
              <button type="submit" disabled={submitting} style={{ width: "100%", padding: 16, borderRadius: 10, border: "none", background: "linear-gradient(135deg,var(--neural),var(--pulse))", fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 600, color: "var(--void)", cursor: "pointer", transition: "all .3s", opacity: submitting ? .7 : 1, boxShadow: "0 0 32px rgba(0,212,232,.2)" }}>
                {submitting ? "Transmitting…" : "Send Message →"}
              </button>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, color: "var(--t3)", lineHeight: 1.6, textAlign: "center" }}>By submitting, you agree to our <a href="#" style={{ color: "var(--neural)", textDecoration: "none" }}>Privacy Policy</a>. We never share your data.</p>
            </form>
          )}
        </div>

        {/* INFO SIDE */}
        <div style={{ padding: "80px 64px", background: "var(--deep)" }}>
          {/* Status */}
          <div className="reveal" style={{ marginBottom: 52 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: 2.5, color: "var(--neural)", marginBottom: 18 }}>SYSTEM STATUS</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--t1)", marginBottom: 14 }}>All systems operational.</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {STATUS.map((s) => (
                <div key={s.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--t2)", letterSpacing: .5 }}>{s.name}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 1, padding: "3px 10px", borderRadius: 100, display: "flex", alignItems: "center", gap: 5, background: s.ok ? "rgba(45,212,170,.1)" : "rgba(245,166,35,.1)", color: s.ok ? "var(--green)" : "var(--amber)", border: `1px solid ${s.ok ? "rgba(45,212,170,.2)" : "rgba(245,166,35,.2)"}` }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor", animation: "blink 1.4s infinite" }} />{s.ok ? "Operational" : "Degraded — Investigating"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Offices */}
          <div className="reveal reveal-d1" style={{ marginBottom: 52 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: 2.5, color: "var(--neural)", marginBottom: 18 }}>GLOBAL OFFICES</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--t1)", marginBottom: 14 }}>We're where you are.</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { name: "Singapore HQ", addr: "18 Science Park Road, Singapore Science Park II, 117666", tag: "ASIA-PACIFIC HQ" },
                { name: "Frankfurt", addr: "Bockenheimer Landstraße 17–19, 60325 Frankfurt am Main, Germany", tag: "EMEA HQ" },
                { name: "Houston", addr: "1700 West Loop South, Suite 1900, Houston, TX 77027, USA", tag: "AMERICAS HQ" },
              ].map((o) => (
                <div key={o.name} style={{ padding: "18px 20px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, transition: "border-color .3s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border2)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "var(--t1)", marginBottom: 4 }}>{o.name}</div>
                  <div style={{ fontSize: 12.5, color: "var(--t2)", lineHeight: 1.6 }}>{o.addr}</div>
                  <span style={{ display: "inline-block", fontFamily: "var(--font-mono)", fontSize: 8.5, letterSpacing: 1, padding: "2px 8px", borderRadius: 3, border: "1px solid rgba(0,212,232,.2)", color: "var(--neural)", marginTop: 6 }}>{o.tag}</span>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="reveal reveal-d2">
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: 2.5, color: "var(--neural)", marginBottom: 18 }}>FREQUENTLY ASKED</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--t1)", marginBottom: 14 }}>Quick answers.</div>
            <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
              {FAQS.map((f, i) => (
                <div key={i} style={{ borderBottom: i < FAQS.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: "100%", background: "none", border: "none", color: "var(--t1)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", fontFamily: "var(--font-body)", fontSize: 13.5, fontWeight: 500, textAlign: "left", transition: "background .2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,212,232,.03)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "none")}>
                    {f.q}
                    <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, flexShrink: 0, fill: "none", stroke: openFaq === i ? "var(--neural)" : "var(--t3)", strokeWidth: 2, strokeLinecap: "round", transform: openFaq === i ? "rotate(45deg)" : "none", transition: "transform .3s, stroke .2s" }}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </button>
                  <div style={{ maxHeight: openFaq === i ? 200 : 0, overflow: "hidden", transition: "max-height .4s ease", fontSize: 13, color: "var(--t2)", lineHeight: 1.65, padding: openFaq === i ? "0 20px 18px" : "0 20px" }}>
                    {f.a}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "36px 48px", background: "var(--void)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 26, height: 26, borderRadius: 6, background: "linear-gradient(135deg,var(--neural),var(--pulse))", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg viewBox="0 0 24 24" style={{ width: 13, height: 13, fill: "none", stroke: "var(--void)", strokeWidth: 2.2, strokeLinecap: "round" }}><circle cx="12" cy="12" r="3" /><line x1="12" y1="9" x2="12" y2="3" /><line x1="14.6" y1="9.7" x2="19" y2="6" /><line x1="14.6" y1="14.3" x2="19" y2="18" /><line x1="12" y1="15" x2="12" y2="21" /><line x1="9.4" y1="14.3" x2="5" y2="18" /><line x1="9.4" y1="9.7" x2="5" y2="6" /></svg>
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 800, letterSpacing: 1.5, color: "var(--t2)" }}>REFLEXSENSE</span>
        </div>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {[["/" , "Home"], ["/login", "Login"], ["/dashboard", "Dashboard"], ["#", "Documentation"]].map(([href, label]) => (
            <Link key={label} href={href} style={{ fontSize: 12, color: "var(--t3)", textDecoration: "none" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--neural)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--t3)")}>{label}</Link>
          ))}
        </div>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--t3)" }}>© 2025 ReflexSense · The Nervous System of Industry</span>
      </footer>

      <style>{`
        @media (max-width: 900px) {
          .cways-grid { grid-template-columns: 1fr !important; }
          .contact-main-grid { grid-template-columns: 1fr !important; }
          .contact-main-grid > div:first-child { border-right: none !important; border-bottom: 1px solid var(--border); padding: 60px 24px !important; }
          .contact-main-grid > div:last-child { padding: 60px 24px !important; }
          .form-2col { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
