import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

const KEY = "hd-a11y-v1";
type Settings = { fs: number; contrast: boolean; gray: boolean; links: boolean; font: boolean; still: boolean; focus: boolean };
const DEFAULTS: Settings = { fs: 0, contrast: false, gray: false, links: false, font: false, still: false, focus: false };

const TOGGLES: { key: Exclude<keyof Settings, "fs">; label: string }[] = [
  { key: "contrast", label: "ניגודיות גבוהה" },
  { key: "gray", label: "גווני אפור" },
  { key: "links", label: "הדגשת קישורים" },
  { key: "font", label: "גופן קריא" },
  { key: "still", label: "עצירת אנימציות" },
  { key: "focus", label: "הדגשת מיקוד מקלדת" },
];

function apply(s: Settings) {
  const c = document.documentElement.classList;
  [1, 2, 3].forEach((n) => c.toggle(`a11y-fs-${n}`, s.fs === n));
  TOGGLES.forEach(({ key }) => c.toggle(`a11y-${key}`, s[key]));
}

export function A11yMenu() {
  const [open, setOpen] = useState(false);
  const [s, setS] = useState<Settings>(DEFAULTS);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "null");
      if (saved) setS({ ...DEFAULTS, ...saved });
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    apply(s);
    localStorage.setItem(KEY, JSON.stringify(s));
  }, [s]);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>("button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className="a11y-fab"
        aria-label="תפריט נגישות"
        aria-expanded={open}
        aria-controls="a11y-panel"
        onClick={() => setOpen((v) => !v)}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <circle cx="12" cy="4" r="2" />
          <path d="M19 8.5c-2.2.5-4.5.8-7 .8s-4.8-.3-7-.8l-.5 1.9c1.8.4 3.6.7 5.5.8V14l-2 7.5 1.9.5L12 15.5l2.1 6.5 1.9-.5-2-7.5v-2.8c1.9-.1 3.7-.4 5.5-.8L19 8.5z" />
        </svg>
      </button>
      {open && (
        <div ref={panelRef} id="a11y-panel" className="a11y-panel" role="dialog" aria-modal="false" aria-labelledby="a11y-title">
          <div className="a11y-head">
            <h2 id="a11y-title">תפריט נגישות</h2>
            <button type="button" className="a11y-x" aria-label="סגירת תפריט הנגישות" onClick={() => { setOpen(false); btnRef.current?.focus(); }}>✕</button>
          </div>
          <div className="a11y-fs" role="group" aria-label="גודל טקסט">
            <span>גודל טקסט</span>
            <button type="button" aria-label="הקטנת טקסט" disabled={s.fs === 0} onClick={() => setS({ ...s, fs: Math.max(0, s.fs - 1) })}>א−</button>
            <span aria-live="polite">{["רגיל", "110%", "125%", "140%"][s.fs]}</span>
            <button type="button" aria-label="הגדלת טקסט" disabled={s.fs === 3} onClick={() => setS({ ...s, fs: Math.min(3, s.fs + 1) })}>א+</button>
          </div>
          <div className="a11y-grid">
            {TOGGLES.map(({ key, label }) => (
              <button key={key} type="button" aria-pressed={s[key]} onClick={() => setS({ ...s, [key]: !s[key] })}>
                {label}
              </button>
            ))}
          </div>
          <button type="button" className="a11y-reset" onClick={() => setS(DEFAULTS)}>איפוס הגדרות</button>
          <Link to="/accessibility-statement" className="a11y-link" onClick={() => setOpen(false)}>להצהרת הנגישות</Link>
        </div>
      )}
    </>
  );
}
