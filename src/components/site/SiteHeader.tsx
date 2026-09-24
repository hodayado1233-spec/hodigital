import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { services } from "@/lib/services";
import { LOGO_SVG } from "./logo";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [dd, setDd] = useState(false);
  const ddRef = useRef<HTMLLIElement>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setOpen(false);
    setDd(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDd(false);
        setOpen(false);
      }
    };
    const onDoc = (e: MouseEvent) => {
      if (ddRef.current && !ddRef.current.contains(e.target as Node)) setDd(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onDoc);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onDoc);
    };
  }, []);

  const close = () => setOpen(false);

  return (
    <header>
      <nav className={"wrap nav" + (open ? " open" : "")} aria-label="ניווט ראשי">
        <Link to="/" className="brand" aria-label="HODIGITAL – דף הבית">
          <span dangerouslySetInnerHTML={{ __html: LOGO_SVG }} />
        </Link>
        <ul id="main-menu">
          <li className="dd" ref={ddRef}>
            <button
              type="button"
              className="dd-btn"
              aria-expanded={dd}
              aria-controls="svc-menu"
              onClick={() => setDd((v) => !v)}
            >
              שירותים
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
            </button>
            <ul id="svc-menu" className="dd-menu" hidden={!dd}>
              {services.map((s) => (
                <li key={s.slug}>
                  <Link to="/services/$slug" params={{ slug: s.slug }} onClick={close}>{s.nav}</Link>
                </li>
              ))}
              <li><Link to="/services" onClick={close}>כל השירותים</Link></li>
            </ul>
          </li>
          <li><Link to="/" hash="process" onClick={close}>איך אני עובדת</Link></li>
          <li><Link to="/" hash="about" onClick={close}>עליי</Link></li>
          <li><Link to="/" hash="faq" onClick={close}>שאלות נפוצות</Link></li>
        </ul>
        <Link to="/" hash="contact" className="btn btn-g">לשיחה איתי</Link>
        <button
          type="button"
          className="burger"
          aria-label={open ? "סגירת תפריט" : "פתיחת תפריט"}
          aria-expanded={open}
          aria-controls="main-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 8h16M4 16h16" />}
          </svg>
        </button>
      </nav>
    </header>
  );
}
