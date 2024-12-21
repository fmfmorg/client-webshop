import { IncomingMessage, ServerResponse, request } from 'http';

export function createProxyMiddleware(targetUrl: string) {
  return async (req: IncomingMessage, res: ServerResponse) => {
    const url = new URL(req.url!, targetUrl);
    url.pathname = url.pathname.replace(/^\/api/, ''); // Remove leading /api
    const options = {
      hostname: url.hostname,
      port: url.port || 80, // Default to port 80
      path: url.pathname + url.search,
      method: req.method,
      headers: req.headers,
    };

    const proxyReq = request(options, (proxyRes) => {
      proxyRes.on('data', (chunk) => res.write(chunk));
      proxyRes.on('end', () => res.end());
    });

    proxyReq.on('error', (err) => {
      console.error('Proxy error:', err);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
    });

    req.pipe(proxyReq);
  };
}