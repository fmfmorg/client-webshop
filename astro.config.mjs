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
                // FM_CLIENT_WEBSHOP_REVOLUT_MODE:envField.string({
                //     context:'client',
                //     access:'public'
                // }),
                // FM_HEADER_CAROUSEL_OFF_COOKIE_KEY:envField.string({
                //     context:'client',
                //     access:'public'
                // }),
                // FM_COMPANY_NAME_SHORT:envField.string({
                //     context:'client',
                //     access:'public'
                // }),
                // FM_COMPANY_NAME_FULL:envField.string({
                //     context:'client',
                //     access:'public'
                // }),
                // FM_PUBLIC_IMAGE_URL_PREFIX:envField.string({
                //     context:'client',
                //     access:'public'
                // })
            }
        }
    }
});