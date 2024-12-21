// server.js
import express from 'express';
import { handler as ssrHandler } from './dist/server/entry.mjs';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configure proxy settings for your specific API
const apiProxy = createProxyMiddleware({
  target: 'https://api-shop.fairymade.top',
  changeOrigin: true,
  secure: true, // Keep true for HTTPS
  pathRewrite: {
    '^/api': '', // Remove /api prefix when forwarding to backend
  },
  logLevel: 'debug', // Enable debug logging
  onProxyReq: (proxyReq, req, res) => {
    // Log the original request
    console.log('Original URL:', req.url);
    console.log('Proxied URL:', proxyReq.path);
    
    // You might need to set specific headers
    proxyReq.setHeader('Host', 'api-shop.fairymade.top');
  },
  onError: (err, req, res) => {
    console.error('Proxy Error:', err);
    res.status(500).send('Proxy Error');
  }
});

// Apply proxy middleware for /api routes
app.use('/api', apiProxy);

// Serve static files
app.use(express.static(path.join(__dirname, 'dist/client')));

// Handle all other routes with Astro's SSR handler
app.use(ssrHandler);

const port = process.env.PORT || 1234;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Proxying /api/* to https://api-shop.fairymade.top`);
});