import http from 'http'; // This is where the import is crucial
// import { IncomingMessage, ServerResponse } from 'http';

export function createProxyMiddleware(targetUrl) {
  return (req, res) => {
    try {
      const url = new URL(req.url, targetUrl);
      url.pathname = url.pathname.replace(/^\/api/, '');

      const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80), // Correct port handling
        path: url.pathname + url.search,
        method: req.method,
        headers: req.headers,
      };

      console.log('Proxying request:', req.method, req.url, 'to:', url.toString()); // Log the request details

      const proxyReq = http.request(options, (proxyRes) => {
        console.log('Proxy response status:', proxyRes.statusCode); // Log the response status code
        res.writeHead(proxyRes.statusCode, proxyRes.headers); // Important: Copy headers
        proxyRes.on('data', (chunk) => res.write(chunk));
        proxyRes.on('end', () => res.end());
      });

      proxyReq.on('error', (err) => {
        console.error('Proxy request error:', err); // Log proxy request errors
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Proxy Error');
      });

      req.on('error', (err) => {
        console.error('Request error:', err); // Log incoming request errors
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Request Error');
      });

      req.pipe(proxyReq);
    } catch (error) {
      console.error("Proxy middleware error:", error);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Proxy Error');
    }
  };
}