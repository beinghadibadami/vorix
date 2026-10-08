import { content } from './content';
// Per-route SEO metadata. Used at build time by scripts/prerender.mjs to
// write a fully rendered index.html (with its own <head>) for every route.

export const SITE_URL = "https://vorixfoodingredients.com";

export interface RouteMeta {
  path: string;
  title: string;
  description: string;
  /** Canonical path (defaults to `path`). */
  canonical?: string;
  /** Extra JSON-LD objects to inject for this route. */
  jsonLd?: object[];
}

const faqEntries = content.faqs.map(({question, answer}) => [question, answer]);

export const routes: RouteMeta[] = [
  {
    path: "/",
    ...content.seo.home,
  },
  {
    path: "/products",
    ...content.seo.products,
  },
  {
    path: "/about",
    ...content.seo.about,
  },
  {
    path: "/faq",
    ...content.seo.faq,
    jsonLd: faqEntries.length ? [
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqEntries.map(([name, text]) => ({
          "@type": "Question",
          name,
          acceptedAnswer: { "@type": "Answer", text },
        })),
      },
    ] : [],
  },
  {
    path: "/journal",
    ...content.seo.journal,
    jsonLd: [{ "@context": "https://schema.org", "@type": "Blog", name: "Vorix Ingredient Journal", url: `${SITE_URL}/journal` }],
  },
  {
    path: "/contact",
    ...content.seo.contact,
    canonical: "/",
  },
];
