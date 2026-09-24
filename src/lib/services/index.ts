import { seo } from "./seo";
import { ppc } from "./ppc";
import { social } from "./social";
import { geo } from "./geo";
import { content } from "./content";
import { local } from "./local";
import { web } from "./web";
import type { Service } from "./types";

export * from "./types";

export const services: Service[] = [seo, ppc, social, geo, content, local, web];

export function getService(slug: string) {
  return services.find((s) => s.slug === slug);
}
