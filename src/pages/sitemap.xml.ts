export async function GET() {
    const sitemap = `
        <?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
            <url>
                <loc>http://example.co</loc>
                <lastmod>${new Date().toISOString()}</lastmod>
            </url>
        </urlset>
    `.trim();

    return new Response(sitemap, {
        headers: {
          'Content-Type': 'application/xml',
        },
    });
}

/*

  const sitemap = `
    <?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${products.map(product => `
        <url>
          <loc>${siteUrl}/product/${product.name}/${product.id}</loc>
          <lastmod>${new Date(product.updatedAt).toISOString()}</lastmod>
        <image:image>
            <image:loc>https://your-website.com/images/product1.jpg</image:loc>
            <image:title>Product Name</image:title>
        </image:image>
        </url>
      `).join('')}
    </urlset>
  `.trim();

*/


/*

// src/pages/sitemap.xml.js

export async function GET() {
  const siteUrl = import.meta.env.SITE;

  // Fetch dynamic data for products
  const products = await fetchProductData(); // Implement this function to retrieve product data

  const sitemap = `
    <?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${products.map(product => `
        <url>
          <loc>${siteUrl}/product/${product.name}/${product.id}</loc>
          <lastmod>${new Date(product.updatedAt).toISOString()}</lastmod>
        </url>
      `).join('')}
    </urlset>
  `.trim();

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}

// Example function to fetch product data
async function fetchProductData() {
  // Replace with your actual data fetching logic
  // This could be an API call or database query
  return [
    { name: 'product1', id: '123', updatedAt: '2024-11-17' },
    { name: 'product2', id: '456', updatedAt: '2024-11-16' },
    // Add more products as needed
  ];
}


*/