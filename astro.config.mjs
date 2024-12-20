import { defineConfig, envField } from 'astro/config';
import solid from '@astrojs/solid-js';
import node from '@astrojs/node';
import tailwind from '@astrojs/tailwind';

const isProduction = process.env.IS_PRODUCTION === 'true';

// https://astro.build/config
export default defineConfig({
    server:{
        host:true,
        headers: {
            "Content-Security-Policy": [
                "default-src 'self';",
                "script-src 'self' https://challenges.cloudflare.com https://sandbox-merchant.revolut.com 'unsafe-inline';",
                "style-src 'self' https://fonts.googleapis.com 'unsafe-inline';",
                `img-src 'self' data: https://link.storjshare.io${isProduction ? ' ' + process.env.PUBLIC_FM_PUBLIC_IMAGE_URL_PREFIX + ' ' + process.env.PUBLIC_FM_DELIVERY_PROOF_IMAGE_URL_PREFIX : ''};`,
                "frame-src 'self' https://challenges.cloudflare.com https://sandbox-merchant.revolut.com;",
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
    },
    env:{
        schema:{
            FM_CLIENT_WEBSHOP_API_URL:envField.string({
                context:'server',
                access:'secret'
            }),
            FM_IS_ONLINE:envField.string({
                context:'server',
                access:'secret'
            }),
            PUBLIC_FM_PUBLIC_IMAGE_URL_PREFIX:envField.string({
                context:'server',
                access:'secret'
            })
            // for github action, cannot have envField with { context:'client', access:'public' }
        }
    },
    devToolbar:{
        enabled:false
    }
});