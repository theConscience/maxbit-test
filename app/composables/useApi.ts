import { useRuntimeConfig } from '#imports'
import { clientApi, type ClientApiFn, MockApiError } from '@/mocks/clientApi'
import { useAuthStore } from '@/stores/auth'

export type ApiFn = <T = any>(
  path: string,
  options?: { method?: string; body?: any; headers?: Record<string, string> },
) => Promise<T>

export const useApi = (): ApiFn => {
  const auth = useAuthStore()
  const cfg = useRuntimeConfig()

  // ----- 1) Чистый mock-режим (для gh-pages / client-only) -----
  if (process.client && cfg.public.API_MODE === 'mock') {
    console.info('[useApi] CLIENT MOCK MODE')

    const api: ClientApiFn = clientApi

    return async <T = any>(path: string, options: any = {}): Promise<T> => {
      const method = (options.method || 'GET').toUpperCase()
      const body = options.body
      const headers: Record<string, string> = { ...(options.headers || {}) }

      if (auth.token) {
        headers.Authorization = `Bearer ${auth.token}`
      }

      // В clientApi path без `/api`
      const cleanPath = path.replace(/^\/+/, '') // '/movies' → 'movies'

      try {
        // обращение к mock-API
        return await api<T>(cleanPath, { method, body, headers })
      } catch (err: any) {
        // NOTE: если in-memory БД ресетнулась, токен умер и
        // MockApiError со статусом 401 → ведём себя так же, как в BFF-режиме:
        // чистим auth и уводим на логин
        if (
          err instanceof MockApiError &&
          err.status === 401 &&
          cleanPath !== 'login' &&
          cleanPath !== 'register'
        ) {
          auth.logout()
          if (process.client) {
            navigateTo('/auth/login')
          }
        }

        // остальное пусть летит дальше, чтобы UI показал тост/ошибку
        throw err
      }
    }
  } else {
    console.info('[useApi] BFF MODE (/_db or real backend)', {
      API_BASE_URL: cfg.public.API_BASE_URL,
    })

    // ----- 2) Обычный режим: ходим через BFF `/api` -----
    const base = '/api'

    const ofetchApi = $fetch.create({
      baseURL: base,
      onRequest({ options }) {
        const h = new Headers(options.headers as HeadersInit)
        if (auth.token) {
          h.set('Authorization', `Bearer ${auth.token}`)
        }
        options.headers = h
      },
      onResponseError({ response }) {
        if (response?.status === 401) {
          auth.logout()
          if (process.client) navigateTo('/auth/login')
        }
      },
    })

    return <T = any>(path: string, options: any = {}): Promise<T> =>
      ofetchApi<T>(path, options)
  }
}
