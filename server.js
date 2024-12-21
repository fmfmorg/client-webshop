// server.js
import express from 'express';
import { handler as ssrHandler } from './dist/server/entry.mjs';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configure proxy settings
const proxyConfig = {
  '/api': {
    target: 'https://api-shop.fairymade.top', // Replace with your actual API domain
    changeOrigin: true,
    pathRewrite: {
      '^/api': '',
    },
    // Log proxy activity for debugging
    logLevel: 'debug',
    onError(err, req, res) {
      console.error('Proxy Error:', err);
      res.status(500).send('Proxy Error');
    }
  }
};

// Apply proxy middleware
app.use('/api', createProxyMiddleware(proxyConfig['/api']));

// Serve static files
app.use(express.static(path.join(__dirname, 'dist/client')));

// Handle all other routes with Astro's SSR handler
app.use(ssrHandler);

const port = 1234;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});