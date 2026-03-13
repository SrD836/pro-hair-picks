/**
 * Netlify Edge Function — inject <link rel="canonical"> into every HTML response.
 *
 * Why: GuiaDelSalon is a CSR app (React + Vite). Bots that don't run JS (Semrush,
 * legacy crawlers) only see the static index.html, which has no per-page canonical.
 * This edge function intercepts every request BEFORE the CDN cache and injects the
 * correct canonical for that URL into the raw HTML, making it visible to all bots.
 *
 * Runs at the edge (Deno), zero cold-start overhead.
 */

const BASE_URL = "https://guiadelsalon.com";

export default async (request: Request, context: any) => {
  const url = new URL(request.url);

  // Skip obvious non-HTML paths early to avoid reading the response body
  const ext = url.pathname.split(".").pop()?.toLowerCase();
  const nonHtmlExtensions = new Set([
    "js", "css", "json", "xml", "txt", "webp", "png", "jpg", "jpeg",
    "svg", "ico", "woff", "woff2", "ttf", "otf", "map", "gz",
  ]);
  if (ext && nonHtmlExtensions.has(ext)) {
    return context.next();
  }

  const response = await context.next();

  // Only transform HTML responses
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html")) {
    return response;
  }

  // Build canonical: strip trailing slash except on root "/"
  const cleanPath =
    url.pathname === "/" ? "/" : url.pathname.replace(/\/+$/, "");
  const canonical = `${BASE_URL}${cleanPath}`;

  const html = await response.text();

  // Inject canonical as the very first tag inside <head>
  const injected = html.replace(
    /(<head[^>]*>)/i,
    `$1\n    <link rel="canonical" href="${canonical}" />`
  );

  // Preserve all original headers, only update body
  const headers = new Headers(response.headers);
  headers.set("content-type", "text/html; charset=UTF-8");

  return new Response(injected, {
    status: response.status,
    headers,
  });
};

export const config = { path: "/*" };
