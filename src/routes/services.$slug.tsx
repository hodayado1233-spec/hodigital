import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Fragment, type ReactNode } from "react";
import { getService, services, SITE_URL, UPDATED_HE, UPDATED_ISO, type Service } from "@/lib/services";
import { Breadcrumbs, breadcrumbLd, pageHead, type Crumb } from "@/components/site/Page";

export const Route = createFileRoute("/services/$slug")({
  loader: ({ params }) => {
    const service = getService(params.slug);
    if (!service) throw notFound();
    return { slug: service.slug };
  },
  head: ({ loaderData }) => {
    const s = loaderData ? getService(loaderData.slug) : undefined;
    if (!s) return { meta: [{ title: "העמוד לא נמצא | HODIGITAL" }, { name: "robots", content: "noindex, nofollow" }] };
    const path = `/services/${s.slug}`;
    const url = SITE_URL + path;
    const person = {
      "@type": "Person",
      "@id": SITE_URL + "/#hodaya",
      name: "הודיה ארנטרוי",
      alternateName: "Hodaya Arentroy",
      jobTitle: "מומחית שיווק דיגיטלי ו-SEO, מעצבת UI/UX",
      url: SITE_URL + "/#about",
      telephone: "+972-54-725-3007",
    };
    const ld = {
      "@context": "https://schema.org",
      "@graph": [
        person,
        {
          "@type": "Service",
          "@id": url + "#service",
          name: s.name,
          serviceType: s.serviceType,
          description: s.description,
          url,
          areaServed: { "@type": "Country", name: "ישראל" },
          provider: { "@type": "ProfessionalService", name: "HODIGITAL", url: SITE_URL + "/", telephone: "+972-54-725-3007", founder: { "@id": person["@id"] } },
        },
        {
          "@type": "Article",
          headline: s.name,
          description: s.description,
          inLanguage: "he",
          dateModified: UPDATED_ISO,
          image: SITE_URL + "/og-image.png",
          author: { "@id": person["@id"] },
          mainEntityOfPage: url,
        },
        {
          "@type": "FAQPage",
          mainEntity: s.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        },
        breadcrumbLd(crumbsFor(s), path),
      ],
    };
    return pageHead({ title: s.title, description: s.description, path, ld });
  },
  component: ServicePage,
  notFoundComponent: () => (
    <section className="doc-sec"><div className="wrap doc"><h1>השירות לא נמצא</h1><p><Link to="/services">לכל השירותים</Link></p></div></section>
  ),
});

function crumbsFor(s: Service): Crumb[] {
  return [{ label: "דף הבית", to: "/" }, { label: "שירותים", to: "/services" }, { label: s.name }];
}

function inline(text: string): ReactNode {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((p, i) => (i % 2 ? <strong key={i}>{p}</strong> : <Fragment key={i}>{p}</Fragment>));
}

function Blocks({ body }: { body: string[] }) {
  const out: ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length) out.push(<ul key={out.length}>{list.map((li, i) => <li key={i}>{inline(li)}</li>)}</ul>);
    list = [];
  };
  body.forEach((b) => {
    if (b.startsWith("- ")) return void list.push(b.slice(2));
    flush();
    if (b.startsWith("### ")) out.push(<h3 key={out.length}>{b.slice(4)}</h3>);
    else if (b.startsWith("> ")) out.push(<p key={out.length} className="answer">{inline(b.slice(2))}</p>);
    else out.push(<p key={out.length}>{inline(b)}</p>);
  });
  flush();
  return <>{out}</>;
}

function ServicePage() {
  const { slug } = Route.useLoaderData();
  const s = getService(slug)!;
  const others = services.filter((o) => o.slug !== s.slug);
  const toc = [
    ...s.sections.map((x) => ({ id: x.id, title: x.title })),
    { id: "connections", title: "איך זה מתחבר לשאר הערוצים" },
    { id: "faq", title: "שאלות נפוצות" },
    { id: "sources", title: "מקורות להרחבה" },
  ];

  return (
    <>
      <section className="hero dark svc-hero">
        <div className="wrap hero-grid">
          <div>
            <Breadcrumbs items={crumbsFor(s)} />
            <p className="lab">מדריך · {s.code}</p>
            <h1>{s.name}</h1>
            <p className="sub">{s.lead}</p>
            <div className="byline">
              <span><b>הודיה ארנטרוי</b>מומחית שיווק דיגיטלי ו-SEO · עודכן ב-<time dateTime={UPDATED_ISO}>{UPDATED_HE}</time></span>
            </div>
          </div>
          <nav className="toc" aria-label="תוכן העמוד">
            <p>במדריך הזה</p>
            <ol>{toc.map((t) => <li key={t.id}><a href={`#${t.id}`}>{t.title}</a></li>)}</ol>
          </nav>
        </div>
      </section>

      <section className="doc-sec">
        <div className="wrap">
          <article className="doc">
            {s.sections.map((sec) => (
              <section key={sec.id} id={sec.id} aria-labelledby={`h-${sec.id}`}>
                <h2 id={`h-${sec.id}`}>{sec.title}</h2>
                <Blocks body={sec.body} />
              </section>
            ))}

            <section id="connections" aria-labelledby="h-connections">
              <h2 id="h-connections">איך זה מתחבר לשאר הערוצים באסטרטגיית 360</h2>
              <p>אף ערוץ לא עובד לבד. כך {s.name} משתלב עם הערוצים האחרים:</p>
              <ul>
                {s.connections.map((c) => {
                  const o = getService(c.slug)!;
                  return (
                    <li key={c.slug}>
                      <Link to="/services/$slug" params={{ slug: o.slug }}>{o.name}</Link>: {c.text}
                    </li>
                  );
                })}
              </ul>
              <p>רוצים להבין את התמונה המלאה? ב<Link to="/" hash="what">עמוד הבית</Link> הסברתי מה זה שיווק דיגיטלי 360 ואיך אני בונה תוכנית שמחברת בין הערוצים.</p>
            </section>

            <section id="faq" aria-labelledby="h-faq">
              <h2 id="h-faq">שאלות נפוצות</h2>
              {s.faq.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </section>

            <section id="sources" aria-labelledby="h-sources">
              <h2 id="h-sources">מקורות רשמיים להרחבה</h2>
              <ul>
                {s.sources.map((src) => (
                  <li key={src.url}>
                    <a href={src.url} target="_blank" rel="noopener">{src.label}<span className="sr-only"> (נפתח בחלון חדש)</span></a> – {src.note}
                  </li>
                ))}
              </ul>
            </section>

            <aside className="author-box" aria-label="על הכותבת">
              <p><strong>נכתב על ידי הודיה ארנטרוי</strong>, מומחית שיווק דיגיטלי ו-SEO. עוסקת בשיווק דיגיטלי מאז 2021 ומנהלת צוות פרויקטי SEO מאז 2024. <Link to="/" hash="about">עוד עליי</Link></p>
            </aside>
          </article>
        </div>
      </section>

      <section className="related" aria-labelledby="h-related">
        <div className="wrap">
          <p className="lab">מדריכים נוספים</p>
          <h2 id="h-related">ערוצים נוספים באסטרטגיה</h2>
          <div className="ch-grid">
            {others.map((o) => (
              <article className="ch" key={o.slug}>
                <span className="code">{o.code}</span>
                <h3>{o.name}</h3>
                <p>{o.description}</p>
                <Link className="more" to="/services/$slug" params={{ slug: o.slug }}>לקריאת המדריך ←</Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="dark soft-cta">
        <div className="wrap">
          <h2>רוצים לבדוק מה מתאים לעסק שלכם?</h2>
          <p className="sub">אם המדריך עזר ואתם רוצים דעה על המצב הספציפי שלכם, אשמח לשמוע על העסק. בלי התחייבות – נדבר, ואגיד בכנות מאיפה הייתי מתחילה.</p>
          <div className="cta">
            <a className="btn btn-g" href="https://wa.me/972547253007" target="_blank" rel="noopener">כתבו לי בוואטסאפ</a>
            <Link className="btn btn-v" to="/" hash="contact">לטופס יצירת קשר</Link>
          </div>
        </div>
      </section>
    </>
  );
}
