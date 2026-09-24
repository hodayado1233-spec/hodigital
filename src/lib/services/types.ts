export type ServiceSection = {
  id: string;
  title: string;
  /** Blocks: plain paragraph, "### " = H3, "- " = list item, "> " = highlighted answer box */
  body: string[];
};

export type Service = {
  slug: string;
  name: string;
  nav: string;
  code: string;
  title: string;
  description: string;
  lead: string;
  serviceType: string;
  sections: ServiceSection[];
  connections: { slug: string; text: string }[];
  faq: { q: string; a: string }[];
  sources: { label: string; url: string; note: string }[];
};

export const SITE_URL = "https://hodigital-exact-clone.lovable.app";
export const UPDATED_ISO = "2026-09-24";
export const UPDATED_HE = "24 בספטמבר 2026";
