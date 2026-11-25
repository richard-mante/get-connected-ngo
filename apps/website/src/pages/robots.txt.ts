import type { APIRoute } from "astro";
export const GET:APIRoute=({url})=>new Response(`User-agent: *
Allow: /

Sitemap: ${url.origin}/sitemap.xml
`,{headers:{"content-type":"text/plain; charset=utf-8","cache-control":"public, max-age=3600"}});
