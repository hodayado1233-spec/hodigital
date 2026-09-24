import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

const KEY = "hd-consent-v1";
const GA_ID = "G-EZLY336C0D";

type W = Window & { dataLayer?: unknown[]; gtag?: (...a: unknown[]) => void; __gaLoaded?: boolean } & Record<string, unknown>;

function loadGA() {
  const w = window as unknown as W;
  w[`ga-disable-${GA_ID}`] = false;
  if (w.__gaLoaded) return;
  w.__gaLoaded = true;
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
  w.dataLayer = w.dataLayer || [];
  w.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer!.push(arguments);
  };
  w.gtag("js", new Date());
  w.gtag("config", GA_ID);
}

function disableGA() {
  (window as unknown as W)[`ga-disable-${GA_ID}`] = true;
  document.cookie.split(";").forEach((c) => {
    const name = (c.split("=")[0] ?? "").trim();
    if (name.startsWith("_ga")) {
      document.cookie = `${name}=; Max-Age=0; path=/`;
      document.cookie = `${name}=; Max-Age=0; path=/; domain=.${location.hostname}`;
    }
  });
}

export function CookieConsent() {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const v = localStorage.getItem(KEY);
    if (v === "granted") loadGA();
    else if (!v) setShow(true);
    const open = () => setShow(true);
    window.addEventListener("hd:cookie-settings", open);
    return () => window.removeEventListener("hd:cookie-settings", open);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("cb-open", show);
    if (!show || !ref.current) {
      root.style.setProperty("--cb-h", "0px");
      return;
    }
    const el = ref.current;
    const update = () => root.style.setProperty("--cb-h", `${el.offsetHeight}px`);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [show]);

  const choose = (granted: boolean) => {
    localStorage.setItem(KEY, granted ? "granted" : "denied");
    if (granted) loadGA();
    else disableGA();
    setShow(false);
  };

  if (!show) return null;
  return (
    <section ref={ref} className="cookie" role="region" aria-label="הסכמה לעוגיות">
      <div className="wrap cookie-in">
        <p>
          האתר משתמש בעוגיות (cookies) כדי להבין איך משתמשים בו. הן נטענות רק לאחר אישור שלכם, ואפשר לשנות את הבחירה
          בכל רגע דרך "הגדרות עוגיות" בתחתית העמוד. פרטים נוספים ב<Link to="/privacy">מדיניות הפרטיות</Link>.
        </p>
        <div className="cookie-btns">
          <button type="button" className="btn btn-v" onClick={() => choose(true)}>אישור</button>
          <button type="button" className="btn btn-o" onClick={() => choose(false)}>דחייה</button>
        </div>
      </div>
    </section>
  );
}
