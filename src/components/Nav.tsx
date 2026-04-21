"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const LogoIcon = () => (
  <svg viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="3" />
    <line x1="12" y1="9" x2="12" y2="3" />
    <line x1="14.6" y1="9.7" x2="19" y2="6" />
    <line x1="14.6" y1="14.3" x2="19" y2="18" />
    <line x1="12" y1="15" x2="12" y2="21" />
    <line x1="9.4" y1="14.3" x2="5" y2="18" />
    <line x1="9.4" y1="9.7" x2="5" y2="6" />
  </svg>
);

const links = [
  { href: "/#dashboard", label: "Command Center" },
  { href: "/#economic", label: "ROI" },
  { href: "/#personas", label: "Who We Serve" },
  { href: "/#adaptive", label: "Technology" },
  { href: "/#usecases", label: "Industries" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav className="nav" style={scrolled ? { background: "rgba(2,6,16,.97)" } : {}}>
      {/* Brand */}
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
        <div className="nav-logo-mark"><LogoIcon /></div>
        <span className="nav-logotype">Reflex<span>Sense</span></span>
      </Link>

      {/* Desktop links */}
      <div className="hide-mobile" style={{ display: "flex", alignItems: "center", gap: 26 }}>
        {links.map((l) => (
          <Link key={l.href} href={l.href} style={{ fontFamily: "var(--font-body)", fontSize: 16, fontWeight: 500, color: "#d1d5db", textDecoration: "none", transition: "color .2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--t1)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#d1d5db")}>
            {l.label}
          </Link>
        ))}
      </div>

      {/* Desktop CTAs */}
      <div className="hide-mobile" style={{ display: "flex", gap: 10 }}>
        <Link href="/contact" className="btn-ghost">Connect To Us</Link>
        <Link href="/login" className="btn-primary">Login</Link>
      </div>

      {/* Mobile hamburger */}
      <button
        className="show-mobile"
        onClick={() => setOpen(!open)}
        aria-label="Menu"
        style={{ display: "none", background: "none", border: "none", cursor: "pointer", padding: 4 }}
      >
        <svg viewBox="0 0 24 24" style={{ width: 22, height: 22, stroke: "var(--t2)", fill: "none", strokeWidth: 2, strokeLinecap: "round" }}>
          {open
            ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
            : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
          }
        </svg>
      </button>

      {/* Mobile menu */}
      {open && (
        <div style={{ position: "fixed", top: 68, left: 0, right: 0, background: "rgba(2,6,16,.97)", borderBottom: "1px solid var(--border)", padding: "12px 20px 20px", zIndex: 99 }}>
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              style={{ display: "block", padding: "14px 0", borderBottom: "1px solid var(--border)", color: "var(--t1)", textDecoration: "none", fontSize: 15, fontWeight: 500 }}>
              {l.label}
            </Link>
          ))}
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <Link href="/contact" className="btn-ghost" style={{ flex: 1, textAlign: "center" }}>Contact</Link>
            <Link href="/login" className="btn-primary" style={{ flex: 1, textAlign: "center" }}>Login</Link>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
          .show-mobile { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
