import { defineConfig, envField } from 'astro/config';
import solid from '@astrojs/solid-js';
import node from '@astrojs/node';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
    server:{
        host:true,
        headers: {
            "Content-Security-Policy": [
                "default-src 'self';",
                "script-src 'self' https://challenges.cloudflare.com https://sandbox-merchant.revolut.com https://merchant.revolut.com 'unsafe-inline';",
                "style-src 'self' https://fonts.googleapis.com 'unsafe-inline';",
                `img-src 'self' data: https://link.storjshare.io ${process.env.PUBLIC_FM_PUBLIC_IMAGE_URL_PREFIX} ${process.env.PUBLIC_FM_DELIVERY_PROOF_IMAGE_URL_PREFIX};`,
                "frame-src 'self' https://challenges.cloudflare.com https://sandbox-merchant.revolut.com https://merchant.revolut.com;",
                "font-src 'self' https://fonts.gstatic.com;",
                `connect-src 'self' ${process.env.FM_WEBSOCKET_URL}`,
            ].join(' ')
        },
    },
    integrations: [
        solid(),
        tailwind()
    ],
    output:'server',
    adapter:node({
        mode:'standalone',
    }),
    ...(process.env.FM_IS_ONLINE === 'true' && {
        hooks:{
            'astro:server:setup': ({ server }) => {
                console.log('Middleware setup initialized')
                server.middlewares.use('/api', async (req, res, next) => {
                    const targetUrl = `${process.env.FM_CLIENT_WEBSHOP_API_URL}${req.url}`;
                    console.log('Target URL:', targetUrl);
                    console.log('Request Method:', req.method);
                    console.log('Request Headers:', req.headers);

                    try {
                        const response = await fetch(targetUrl, {
                            method: req.method,
                            headers: req.headers,
                            body: req.method !== 'GET' ? await req.text() : undefined,
                        });

                        // Check if response is OK
                        if (!response.ok) {
                            console.error(`Error fetching from ${targetUrl}: ${response.statusText}`);
                            res.writeHead(response.status);
                            return res.end();
                        }

                        res.writeHead(response.status, Object.fromEntries(response.headers));
                        response.body.pipe(res);
                    } catch (error) {
                        console.error('Fetch error:', error);
                        next(error);
                    }
                });
            },
        }
    }),
    ...(process.env.FM_IS_ONLINE !== 'true' && {
        vite: {
            server: {
                proxy: {
                    '/api': {
                        target: process.env.FM_CLIENT_WEBSHOP_API_URL,
                        changeOrigin: true,
                        rewrite: (path) => path.replace(/^\/api/, ''),
                    },
                },
            },
        }
    }),
    env:{
        schema:{
            FM_CLIENT_WEBSHOP_API_URL:envField.string({
                context:'client',
                access:'public'
            }),
            FM_IS_ONLINE:envField.string({
                context:'server',
                access:'secret'
            }),
            PUBLIC_FM_PUBLIC_IMAGE_URL_PREFIX:envField.string({
                context:'client',
                access:'public'
            }),
            PUBLIC_FM_COMPANY_NAME_SHORT:envField.string({
                context:'client',
                access:'public'
            }),
            PUBLIC_FM_COMPANY_NAME_FULL:envField.string({
                context:'client',
                access:'public'
            }),
            PUBLIC_FM_TURNSTILE_SITEKEY:envField.string({
                context:'client',
                access:'public'
            }),
            PUBLIC_FM_COMPANY_NUMBER:envField.string({
                context:'client',
                access:'public'
            }),
            PUBLIC_FM_DELIVERY_PROOF_IMAGE_URL_PREFIX:envField.string({
                context:'client',
                access:'public'
            }),
            PUBLIC_FM_HEADER_CAROUSEL_OFF_COOKIE_KEY:envField.string({
                context:'client',
                access:'public'
            }),
            PUBLIC_FM_CLIENT_WEBSHOP_REVOLUT_MODE:envField.string({
                context:'client',
                access:'public'
            }),
            PUBLIC_FM_ACCEPT_MEMBERSHIP:envField.string({
                context:'client',
                access:'public'
            }),
            // for github action, cannot have envField with { context:'client', access:'public' }
        }
    },
    devToolbar:{
        enabled:false
    }
});