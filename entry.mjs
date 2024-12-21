import { createServer } from 'http';
import { parse } from 'url';
import { createProxyMiddleware } from 'http-proxy-middleware';
import handler from './handler.js'; // Assuming this is your server handler
import { FM_CLIENT_WEBSHOP_API_URL } from 'astro:env/client'

const proxy = createProxyMiddleware('/api', {
  target: FM_CLIENT_WEBSHOP_API_URL,
  changeOrigin: true,
  pathRewrite: { '^/api': '' },
});

const server = createServer((req, res) => {
  const parsedUrl = parse(req.url, true);
  if (parsedUrl.pathname.startsWith('/api')) {
    proxy(req, res);
  } else {
    handler(req, res);
  }
});

server.listen(1234, () => {
  console.log(`Server is running on port ${1234}`);
});