import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { SITE_URL, UPDATED_HE, UPDATED_ISO } from "@/lib/services";

export type Crumb = { label: string; to?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="crumbs" aria-label="פירורי לחם">
      <ol>
        {items.map((c, i) => (
          <li key={i}>
            {c.to ? <Link to={c.to}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function breadcrumbLd(items: Crumb[], path: string) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      item: SITE_URL + (c.to ?? path),
    })),
  };
}

export function pageHead(opts: { title: string; description: string; path: string; type?: string; ld?: object }) {
  const url = SITE_URL + opts.path;
  return {
    meta: [
      { title: opts.title },
      { name: "description", content: opts.description },
      { name: "author", content: "הודיה ארנטרוי" },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:type", content: opts.type ?? "article" },
      { property: "og:locale", content: "he_IL" },
      { property: "og:site_name", content: "HODIGITAL" },
      { property: "og:title", content: opts.title },
      { property: "og:description", content: opts.description },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary" },
      { name: "theme-color", content: "#0c0a10" },
    ],
    links: [{ rel: "canonical", href: url }],
    scripts: opts.ld ? [{ type: "application/ld+json", children: JSON.stringify(opts.ld) }] : [],
  };
}

export function DocHero({ crumbs, lab, title, lead }: { crumbs: Crumb[]; lab: string; title: string; lead?: string }) {
  return (
    <section className="hero dark doc-hero">
      <div className="wrap">
        <Breadcrumbs items={crumbs} />
        <p className="lab">{lab}</p>
        <h1>{title}</h1>
        {lead && <p className="sub">{lead}</p>}
        <p className="updated">עודכן לאחרונה: <time dateTime={UPDATED_ISO}>{UPDATED_HE}</time></p>
      </div>
    </section>
  );
}

export function DocBody({ children }: { children: ReactNode }) {
  return (
    <section className="doc-sec">
      <div className="wrap"><div className="doc">{children}</div></div>
    </section>
  );
}
