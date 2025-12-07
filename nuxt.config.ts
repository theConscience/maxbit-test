// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config'
import { fileURLToPath } from 'node:url'

const isGhPages = process.env.GITHUB_PAGES === 'true'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  srcDir: 'app/',
  ssr: !isGhPages,
  typescript: { strict: true, typeCheck: true },
  modules: ['@nuxt/fonts', '@nuxt/icon', '@nuxt/image', '@pinia/nuxt'],
  runtimeConfig: {
    public: {
      API_BASE_URL: process.env.API_BASE_URL || '',
      API_MODE: process.env.API_MODE || "bff", // 'bff' | 'mock
    },
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
        subsets: ['cyrillic','latin'],
      },
    ],
  },
  icon: {
    customCollections: [
      {
        prefix: 'app',             // как будем вызывать
        dir: 'app/assets/icons',       // где лежат svg
      },
    ],
  },
  image: {
    domains: ['localhost:3022'],
  },
  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || '/',   // ← вот это
    head: {
      htmlAttrs: {
        lang: 'ru',
      },
      titleTemplate: '%s · Catalog',
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
    },
  },
  // nitro: { preset: 'node-server' }, // для SSR-режима по умолчанию
  nitro: {
    preset: isGhPages ? 'static' : 'node-server',
  },

  // === Aliases (на всякий случай) ===
  alias: {
    '@': fileURLToPath(new URL('./app', import.meta.url)),
    '~': fileURLToPath(new URL('./app', import.meta.url)),
  },
})
