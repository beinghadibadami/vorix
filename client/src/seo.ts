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

const faqEntries: [string, string][] = [
  ["What ingredients does Vorix supply?", "We supply dehydrated white, pink and red onion, garlic, fried onion and garlic, and spices, herbs and seasonings."],
  ["Where are Vorix ingredients sourced and made?", "Our ingredients are sourced close to the crop and processed in Mahuva, Gujarat, with controlled dehydration, sorting and packing."],
  ["Which formats are available?", "Depending on the product, formats include flakes, chopped, minced, granules, powder, fried formats and custom blends."],
  ["Can Vorix support export requirements?", "Yes. We work with food makers in India and international markets and can discuss specifications, documentation and production planning."],
  ["How do I request a sample or quotation?", "Use the inquiry form on the homepage or email hussain@nexusfoods.co.in for domestic enquiries and hasan@nexusfoods.co.in for export enquiries."],
];

export const routes: RouteMeta[] = [
  {
    path: "/",
    title: "Vorix Food Ingredients — Quality, the power on our side",
    description: "Vorix Food Ingredients supplies premium dehydrated onions, garlic, spices and seasonings from Mahuva, Gujarat, India.",
  },
  {
    path: "/products",
    title: "Products — Dehydrated Onion, Garlic & Spices | Vorix Food Ingredients",
    description: "Dehydrated white, pink and red onion, garlic, fried onion and garlic, spices and custom seasonings in flakes, chopped, minced, granules and powder.",
  },
  {
    path: "/about",
    title: "About Vorix — Dehydrated Ingredients from Mahuva, Gujarat",
    description: "Founded in 2020 in Mahuva, Gujarat, Vorix brings precise dehydration, sorting and packing to a dependable ingredient supply chain.",
  },
  {
    path: "/faq",
    title: "FAQs — Vorix Food Ingredients",
    description: "Answers about Vorix dehydrated onions, garlic, spices, formats, sourcing and export supply.",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqEntries.map(([name, text]) => ({
          "@type": "Question",
          name,
          acceptedAnswer: { "@type": "Answer", text },
        })),
      },
    ],
  },
  {
    path: "/journal",
    title: "Ingredient Journal — Vorix Food Ingredients",
    description: "Practical perspectives on dehydration, ingredient consistency and better food production from Vorix.",
    jsonLd: [{ "@context": "https://schema.org", "@type": "Blog", name: "Vorix Ingredient Journal", url: `${SITE_URL}/journal` }],
  },
  {
    path: "/contact",
    title: "Contact — Vorix Food Ingredients",
    description: "Start an inquiry with Vorix Food Ingredients for domestic or export supply of dehydrated onion, garlic and spices.",
    canonical: "/",
  },
];
