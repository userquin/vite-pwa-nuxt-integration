import { defineNuxtConfig } from 'nuxt/config'
import VitePwaModule from '..'

export default defineNuxtConfig({
  modules: [
    VitePwaModule,
  ],
  vite: {
    logLevel: 'info',
  },
  pwa: {
    includeAssets: ['favicon.ico', 'favicon.svg'],
    manifest: {
      name: 'Nuxt Vite PWA',
      short_name: 'NuxtVitePWA',
      theme_color: '#ffffff',
      icons: [
        {
          src: 'pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable',
        },
      ],
    },
    workbox: {
      navigateFallback: '/404',
    },
    devOptions: {
      enabled: true,
      type: 'module',
    },
  },
})
