import { Link } from "@tanstack/react-router";
import { services } from "@/lib/services";

export function SiteFooter() {
  return (
    <footer>
      <div className="wrap foot-top">
        <nav aria-label="שירותים">
          <p className="foot-h">שירותים</p>
          <ul>
            {services.map((s) => (
              <li key={s.slug}><Link to="/services/$slug" params={{ slug: s.slug }}>{s.nav}</Link></li>
            ))}
          </ul>
        </nav>
        <nav aria-label="מידע משפטי">
          <p className="foot-h">מידע</p>
          <ul>
            <li><Link to="/privacy">מדיניות פרטיות</Link></li>
            <li><Link to="/terms">תנאי שימוש</Link></li>
            <li><Link to="/accessibility-statement">הצהרת נגישות</Link></li>
            <li>
              <button type="button" className="linkish" onClick={() => window.dispatchEvent(new Event("hd:cookie-settings"))}>
                הגדרות עוגיות
              </button>
            </li>
          </ul>
        </nav>
      </div>
      <div className="wrap">
        <span>© {new Date().getFullYear()} HODIGITAL · הודיה ארנטרוי · שיווק דיגיטלי לעסקים בכל הארץ</span>
        <span><a href="tel:+972547253007" dir="ltr">054-725-3007</a> · <a href="mailto:hodayado1233@gmail.com">hodayado1233@gmail.com</a></span>
      </div>
    </footer>
  );
}
