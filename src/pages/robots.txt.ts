import { httpToHttps } from "@misc";

export async function GET({url}:{url:URL}) {
    let { origin } = url
    origin = httpToHttps(origin)

    const robotsTxt = `
User-agent: *
Allow: /

Sitemap: ${origin}/sitemaps/sitemap.xml
  `.trim();

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}