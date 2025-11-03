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

let seq = 1
const nid = () => String(seq++)

const now = () => new Date()
const inMin = (m: number) => new Date(Date.now() + m * 60_000)

export const db = {
  users: new Map<string, { username: string; password: string; token: string }>(),
  movies: [] as Movie[],
  cinemas: [] as Cinema[],
  sessions: [] as Session[],
  bookings: [] as Booking[],
  settings: { paymentTimeoutSeconds: 15 * 60 },
}

// seed
if (db.movies.length === 0) {
  db.movies.push(
    { id: nid(), title: 'Мстители', durationMin: 140, rating: 4.2, posterUrl: '' },
    { id: nid(), title: 'Тёмный рыцарь', durationMin: 165, rating: 4.8, posterUrl: '' },
  )
  db.cinemas.push({ id: nid(), title: 'Киномакс Центральный' }, { id: nid(), title: 'IMAX Aurora' })
  // по сеансу на фильм/кинотеатр
  const s1: Session = {
    id: nid(),
    movieId: db.movies[0].id,
    cinemaId: db.cinemas[0].id,
    cinemaName: db.cinemas[0].title,
    startsAt: inMin(120).toISOString(),
    rows: 8,
    cols: 12,
    bookedSeats: ['1-2', '1-3'],
  }
  const s2: Session = {
    id: nid(),
    movieId: db.movies[1].id,
    cinemaId: db.cinemas[1].id,
    cinemaName: db.cinemas[1].title,
    startsAt: inMin(240).toISOString(),
    rows: 8,
    cols: 12,
    bookedSeats: [],
  }
  db.sessions.push(s1, s2)
}

// helper
export function requireAuth(event: any) {
  const auth = getHeader(event, 'authorization') || ''
  const token = auth.replace(/^Bearer\s+/i, '')
  if (!token) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  const ok = Array.from(db.users.values()).some((u) => u.token === token)
  if (!ok) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
}
