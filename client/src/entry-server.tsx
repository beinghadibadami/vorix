// Server entry used only at build time for prerendering (never shipped to browsers).
import { renderToString } from "react-dom/server";
import { Router } from "wouter";
import App from "./App";

export { routes, SITE_URL } from "./seo";

export function render(url: string): string {
  return renderToString(
    <Router ssrPath={url}>
      <App />
    </Router>,
  );
}
