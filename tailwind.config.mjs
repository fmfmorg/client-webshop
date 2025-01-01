/** @type {import('tailwindcss').Config} */

const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['"Noto Sans JP"', ...defaultTheme.fontFamily.sans],
        'serif': ['"Noto Serif JP"', ...defaultTheme.fontFamily.serif],
        'display': ['"Yuji Syuku"', 'serif'],
        'barcode': ['"Libre Barcode 128"']
      }
    },
    fontSize:{
      '2xs':['0.6rem','0.75rem'],
      ...defaultTheme.fontSize,
    },
    screens: {
      'mouse':{'raw':'(pointer:fine)'},
      'touchscreen':{'raw':'(pointer:coarse)'},
      '2xs': '280px',
      'xs': '475px',
      ...defaultTheme.screens,
    }
  },
  plugins: [],
}

