export async function GET({url}:{url:URL}) {
    let { origin } = url
    origin = origin.replaceAll('http://','https://')

    const robotsTxt = `
User-agent: *
Allow: /

Sitemap: ${origin}/sitemap.xml
  `.trim();

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}