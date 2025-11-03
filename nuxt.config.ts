// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config'
import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  srcDir: 'app/',
  ssr: true,
  typescript: { strict: true, typeCheck: true },
  modules: ['@nuxt/fonts', '@nuxt/icon', '@nuxt/image', '@pinia/nuxt'],
  runtimeConfig: {
    public: { API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:8080' },
  },
  imports: {
    // добавляем директорию stores к автоимпортируемым
    dirs: ['stores'], // путь относительно srcDir, у тебя srcDir = 'app', значит фактически app/stores
  },
  postcss: {
    plugins: {
      'postcss-nesting': {},
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  css: ['@/assets/css/tailwind.css'],
  // fonts: {
  //   families: [
  //     {
  //       name: 'Inter',
  //       provider: 'google',
  //       weights: [400, 500, 600, 700],
  //       display: 'swap',
  //     },
  //   ],
  // },
  fonts: {
    families: [
      {
        name: 'Open Sans',
        provider: 'google',
        weights: [400, 500, 600, 700],
        display: 'swap',
      },
    ],
  },
  app: {
    head: {
      htmlAttrs: {
        lang: 'ru',
      },
      titleTemplate: '%s · Catalog',
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
    },
  },
  nitro: { preset: 'node-server' }, // для SSR-режима по умолчанию

  // === Aliases (на всякий случай) ===
  alias: {
    '@': fileURLToPath(new URL('./app', import.meta.url)),
    '~': fileURLToPath(new URL('./app', import.meta.url)),
  },
})
