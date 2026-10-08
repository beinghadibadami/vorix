import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { existsSync } from "node:fs";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss(), {
    name: "prerendered-preview-routes",
    configurePreviewServer(server) {
      // Match Vercel's clean URLs instead of hydrating homepage HTML at /faq,
      // /about, etc. This middleware only affects the local production preview.
      server.middlewares.use((request, _response, next) => {
        const url = new URL(request.url ?? "/", "http://localhost");
        if (/^\/[a-z0-9-]+$/.test(url.pathname)) {
          const page = path.join(import.meta.dirname, "dist/public", url.pathname.slice(1), "index.html");
          if (existsSync(page)) request.url = `${url.pathname}/index.html${url.search}`;
        }
        next();
      });
    },
  }],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    strictPort: false, // Falls back to the next free port if 3000 is busy
    host: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
