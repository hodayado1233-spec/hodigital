import { createFileRoute, Link } from "@tanstack/react-router";
import { services } from "@/lib/services";
import { breadcrumbLd, DocHero, pageHead, type Crumb } from "@/components/site/Page";

const crumbs: Crumb[] = [{ label: "דף הבית", to: "/" }, { label: "שירותים" }];

export const Route = createFileRoute("/services/")({
  head: () =>
    pageHead({
      title: "שירותי שיווק דיגיטלי ומדריכים מעמיקים | הודיה ארנטרוי – HODIGITAL",
      description: "כל שירותי השיווק הדיגיטלי של HODIGITAL, ולכל אחד מדריך מעמיק: קידום אורגני, ממומן, רשתות חברתיות, GEO, תוכן, קידום מקומי ואתרים.",
      path: "/services",
      type: "website",
      ld: { "@context": "https://schema.org", ...breadcrumbLd(crumbs, "/services") },
    }),
  component: ServicesIndex,
});

function ServicesIndex() {
  return (
    <>
      <DocHero crumbs={crumbs} lab="שירותים ומדריכים" title="שירותי שיווק דיגיטלי" lead="לכל ערוץ שאני מנהלת כתבתי מדריך מעמיק: מה זה, איך זה עובד, מה חשוב לדעת היום ואיך מודדים הצלחה." />
      <section className="related">
        <div className="wrap">
          <div className="ch-grid" style={{ marginTop: 0 }}>
            {services.map((s) => (
              <article className="ch" key={s.slug}>
                <span className="code">{s.code}</span>
                <h2 className="h3">{s.name}</h2>
                <p>{s.description}</p>
                <Link className="more" to="/services/$slug" params={{ slug: s.slug }}>לקריאת המדריך ←</Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
