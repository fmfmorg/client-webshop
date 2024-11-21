import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (_, next) => {
  const response = await next();

  // Check if the response is compressible
  if (response.status === 200 && response.headers.get('Content-Type')?.includes('text/html')) {
    const compressedBody = response.body?.pipeThrough(new CompressionStream('gzip'));
    
    return new Response(compressedBody, {
      ...response,
      headers: {
        ...response.headers,
        'Content-Encoding': 'gzip',
      },
    });
  }

  return response;
});