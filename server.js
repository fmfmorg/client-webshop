// server.js
import express from 'express';
import { handler as ssrHandler } from './dist/server/entry.mjs';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();

// Configure proxy settings
const proxyConfig = {
  '/api': {  // This will catch all requests to /api/*
    target: 'https://api-shop.fairymade.top',
    changeOrigin: true,
    pathRewrite: {
      '^/api': '', // Remove /api prefix when forwarding
    },
    // Optional: modify headers to hide origin
    onProxyReq: (proxyReq, req, res) => {
      proxyReq.removeHeader('origin');
      proxyReq.removeHeader('referer');
    },
    // Optional: modify response headers
    onProxyRes: (proxyRes, req, res) => {
      proxyRes.headers['x-powered-by'] = 'Your-Custom-Server';
    }
  }
};

// Apply proxy middleware before the SSR handler
app.use(createProxyMiddleware(proxyConfig['/api']));

// Serve static files from the dist/client directory
app.use(express.static('dist/client'));

// Handle all other routes with Astro's SSR handler
app.use(ssrHandler);

const port = 1234;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});