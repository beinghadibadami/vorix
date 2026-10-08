// Build-time prerendering: renders every route in client/src/seo.ts to static
// HTML so crawlers get full content + per-page <head> without running JS.
// Runs after `vite build` (client) and `vite build --ssr` (server bundle).
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "..");
const outDir = path.join(root, "dist", "public");
const ssrEntry = path.join(root, "dist", "server", "entry-server.js");

const { render, routes, SITE_URL } = await import(pathToFileURL(ssrEntry).href);
const template = fs.readFileSync(path.join(outDir, "index.html"), "utf-8");

const escapeAttr = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const escapeText = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

function buildPage(url, meta) {
  let html = template.replace('<div id="root"></div>', () => `<div id="root">${render(url)}</div>`);
  if (!meta) return html;

  const canonical = `${SITE_URL}${meta.canonical ?? meta.path}`;
  html = html
    .replace(/<title>[\s\S]*?<\/title>/, () => `<title>${escapeText(meta.title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, (_match, start, end) => `${start}${escapeAttr(meta.description)}${end}`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, (_match, start, end) => `${start}${escapeAttr(meta.title)}${end}`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, (_match, start, end) => `${start}${escapeAttr(meta.description)}${end}`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, (_match, start, end) => `${start}${canonical}${end}`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, (_match, start, end) => `${start}${canonical}${end}`);

  if (meta.jsonLd?.length) {
    const scripts = meta.jsonLd
      .map((obj) => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, "\\u003c")}</script>`)
      .join("\n    ");
    html = html.replace("</head>", () => `    ${scripts}\n  </head>`);
  }
  return html;
}

for (const meta of routes) {
  const file = meta.path === "/" ? path.join(outDir, "index.html") : path.join(outDir, meta.path.slice(1), "index.html");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, buildPage(meta.path, meta));
  console.log(`prerendered ${meta.path} -> ${path.relative(root, file)}`);
}

// 404 page (static hosts serve 404.html for unknown paths)
const notFound = buildPage("/404", null).replace(
  /<meta name="robots" content="[^"]*"/,
  '<meta name="robots" content="noindex"',
);
fs.writeFileSync(path.join(outDir, "404.html"), notFound);
console.log("prerendered 404 -> dist/public/404.html");

// The server bundle is only needed at build time.
fs.rmSync(path.join(root, "dist", "server"), { recursive: true, force: true });
