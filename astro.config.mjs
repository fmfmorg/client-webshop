import { defineConfig, envField } from 'astro/config';
import solid from '@astrojs/solid-js';
import node from '@astrojs/node';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
    server:{
        host:true
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
    experimental:{
        env:{
            schema:{
                FM_CLIENT_WEBSHOP_API_URL:envField.string({
                    context:'server',
                    access:'secret'
                }),
                FM_ENV_MODE:envField.string({
                    context:'server',
                    access:'secret'
                })
                // for github action, cannot have envField with { context:'client', access:'public' }
            }
        },
    },
    devToolbar:{
        enabled:false
    }
});