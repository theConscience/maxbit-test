import {
  defineEventHandler,
  getMethod,
  getQuery,
  readBody,
  getHeader,
  setResponseStatus,
  createError,
  type H3Event,
} from 'h3'
import { useRuntimeConfig } from '#imports'
import { $fetch } from 'ofetch'

import {
  apiLogin,
  apiRegister,
  apiGetMovies,
  apiGetCinemas,
  apiGetMovieSessionsByMovie,
  apiGetMovieSessionsByCinema,
  apiGetMovieSessionDetails,
  apiCreateBooking,
  apiPayBooking,
  apiGetMyBookings,
  apiGetSettings,
  type Seat,
} from './_db'

function bearerToken(event: H3Event) {
  const h = getHeader(event, 'authorization') || ''
  const m = h.match(/^Bearer\s+(.+)$/i)
  return m?.[1] ?? null
}

export default defineEventHandler(async (event) => {
  const cfg = useRuntimeConfig()
  const method = getMethod(event) || 'GET'
  const pathParam = event.context.params?.path as string | undefined
  const path = (pathParam || '').replace(/^\/+/, '')
  const segments = path.split('/').filter(Boolean)

  // ========== 1) Есть реальный бэкенд → проксируем ==========
  if (cfg.public.API_BASE_URL) {
    const base = cfg.public.API_BASE_URL.replace(/\/+$/, '')
    const url = `${base}/${path}`

    const query = getQuery(event)
    const body = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)
      ? await readBody(event)
      : undefined

    // копируем хедеры без host
    const headers = new Headers(event.node.req.headers as Record<string, string>)
    headers.delete('host')

    return await $fetch(url, {
      method,
      query,
      body,
      headers,
    })
  }

  // ========== 2) Мок-режим на _db.ts (Swagger-совместимый) ==========

  // POST /login
  if (segments.length === 1 && segments[0] === 'login' && method === 'POST') {
    const body = await readBody<{ username: string; password: string }>(event)
    const r = apiLogin(body?.username ?? '', body?.password ?? '')
    setResponseStatus(event, r.status)
    return r.body
  }

  // POST /register
  if (segments.length === 1 && segments[0] === 'register' && method === 'POST') {
    const body = await readBody<{ username: string; password: string }>(event)
    const r = apiRegister(body?.username ?? '', body?.password ?? '')
    setResponseStatus(event, r.status)
    return r.body
  }

  // GET /movies
  if (segments.length === 1 && segments[0] === 'movies' && method === 'GET') {
    const r = apiGetMovies()
    setResponseStatus(event, r.status)
    return r.body
  }

  // GET /movies/{movieId}/sessions
  if (
    segments.length === 3 &&
    segments[0] === 'movies' &&
    segments[2] === 'sessions' &&
    method === 'GET'
  ) {
    const movieId = Number(segments[1])
    if (!Number.isFinite(movieId)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid movieId' })
    }
    const r = apiGetMovieSessionsByMovie(movieId)
    setResponseStatus(event, r.status)
    return r.body
  }

  // GET /cinemas
  if (segments.length === 1 && segments[0] === 'cinemas' && method === 'GET') {
    const r = apiGetCinemas()
    setResponseStatus(event, r.status)
    return r.body
  }

  // GET /cinemas/{cinemaId}/sessions
  if (
    segments.length === 3 &&
    segments[0] === 'cinemas' &&
    segments[2] === 'sessions' &&
    method === 'GET'
  ) {
    const cinemaId = Number(segments[1])
    if (!Number.isFinite(cinemaId)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid cinemaId' })
    }
    const r = apiGetMovieSessionsByCinema(cinemaId)
    setResponseStatus(event, r.status)
    return r.body
  }

  // GET /movieSessions/{movieSessionId}
  if (segments.length === 2 && segments[0] === 'movieSessions' && method === 'GET') {
    const id = Number(segments[1])
    if (!Number.isFinite(id)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid movieSessionId' })
    }
    const r = apiGetMovieSessionDetails(id)
    setResponseStatus(event, r.status)
    return r.body
  }

  // POST /movieSessions/{movieSessionId}/bookings
  if (
    segments.length === 3 &&
    segments[0] === 'movieSessions' &&
    segments[2] === 'bookings' &&
    method === 'POST'
  ) {
    const id = Number(segments[1])
    if (!Number.isFinite(id)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid movieSessionId' })
    }

    const body = await readBody<{ seats: Seat[] }>(event)
    const token = bearerToken(event)
    const r = apiCreateBooking(token, id, body?.seats ?? [])
    setResponseStatus(event, r.status)
    return r.body
  }

  // POST /bookings/{bookingId}/payments
  if (method === 'POST' && segments[0] === 'bookings' && segments[2] === 'payments') {
    const bookingId = segments[1]
    if (!bookingId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'bookingId is required in path /bookings/{bookingId}/payments',
      })
    }

    const token = bearerToken(event)
    const r = apiPayBooking(token, bookingId)
    setResponseStatus(event, r.status)
    return r.body
  }

  // GET /me/bookings
  if (
    segments.length === 2 &&
    segments[0] === 'me' &&
    segments[1] === 'bookings' &&
    method === 'GET'
  ) {
    const token = bearerToken(event)
    const r = apiGetMyBookings(token)
    setResponseStatus(event, r.status)
    return r.body
  }

  // GET /settings
  if (segments.length === 1 && segments[0] === 'settings' && method === 'GET') {
    const r = apiGetSettings()
    setResponseStatus(event, r.status)
    return r.body
  }

  // Всё остальное в мок-режиме — 404
  throw createError({ statusCode: 404, statusMessage: 'Not Found' })
})
