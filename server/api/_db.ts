// ---- Types ----
type ID = string

export type Movie = {
  id: ID
  title: string
  durationMin?: number
  rating?: number
  posterUrl?: string
}
export type Cinema = { id: ID; title: string; posterUrl?: string }
export type Session = {
  id: ID
  movieId: ID
  cinemaId: ID
  cinemaName: string
  startsAt: string // ISO
  rows: number
  cols: number
  bookedSeats: string[] // ['1-2','1-3']
}
export type Booking = {
  id: ID
  sessionId: ID
  sessionTitle: string
  startsAt: string
  bookedAt: string
  seats: { row: number; col: number }[]
  status: 'unpaid' | 'paid'
}

// ---- State ----
let seq = 1
const nid = (): ID => String(seq++)

export const db = {
  users: new Map<string, { username: string; password: string; token: string }>(),
  movies: [] as Movie[],
  cinemas: [] as Cinema[],
  sessions: [] as Session[],
  bookings: [] as Booking[],
  settings: { paymentTimeoutSeconds: 15 * 60 },
}

// ---- Utils ----
const inMin = (m: number) => new Date(Date.now() + m * 60_000)
const seat = (r: number, c: number) => `${r}-${c}`

// ассерт, который устраивает TS и даёт рантайм-гарантию
function req<T>(arr: T[], i: number, name: string): T {
  const v = arr[i]
  if (!v) throw new Error(`[seed] ${name}[${i}] is missing`)
  return v
}

// ---- Seed helpers ----
export function resetDb() {
  db.users.clear()
  db.movies.length = 0
  db.cinemas.length = 0
  db.sessions.length = 0
  db.bookings.length = 0
  db.settings = { paymentTimeoutSeconds: 15 * 60 }
  seq = 1
}

export function pushDemoUser() {
  // простая демо-учётка (совместима с твоим requireAuth)
  db.users.set('demo', { username: 'demo', password: 'Password1', token: 'demo-token' })
}

export function seedIfEmpty() {
  if (db.movies.length > 0 || db.cinemas.length > 0 || db.sessions.length > 0) return

  // 1) базовые сущности
  db.movies.push(
    { id: nid(), title: 'Мстители', durationMin: 140, rating: 4.2, posterUrl: '' },
    { id: nid(), title: 'Тёмный рыцарь', durationMin: 165, rating: 4.8, posterUrl: '' },
  )

  db.cinemas.push(
    { id: nid(), title: 'Киномакс Центральный' },
    { id: nid(), title: 'IMAX Aurora' },
  )

  // зафиксированные ссылки (TS теперь уверен, что элементы есть)
  const m0 = req(db.movies, 0, 'movies')
  const m1 = req(db.movies, 1, 'movies')
  const c0 = req(db.cinemas, 0, 'cinemas')
  const c1 = req(db.cinemas, 1, 'cinemas')

  // 2) сессии
  const s1: Session = {
    id: nid(),
    movieId: m0.id,
    cinemaId: c0.id,
    cinemaName: c0.title,
    startsAt: inMin(120).toISOString(),
    rows: 8,
    cols: 12,
    bookedSeats: [seat(1, 2), seat(1, 3)],
  }
  const s2: Session = {
    id: nid(),
    movieId: m1.id,
    cinemaId: c1.id,
    cinemaName: c1.title,
    startsAt: inMin(240).toISOString(),
    rows: 8,
    cols: 12,
    bookedSeats: [],
  }

  db.sessions.push(s1, s2)
  pushDemoUser()
}

// сразу сидим при загрузке модуля (dev)
seedIfEmpty()

// ---- Auth helper ----
export function requireAuth(event: any) {
  const auth = getHeader(event, 'authorization') || ''
  const token = auth.replace(/^Bearer\s+/i, '')
  if (!token) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  const ok = Array.from(db.users.values()).some((u) => u.token === token)
  if (!ok) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
}
