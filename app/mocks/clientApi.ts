import type {
  ApiMovie,
  ApiCinema,
  ApiMovieSession,
  ApiMovieSessionDetails,
  ApiBooking,
  ApiSeat,
  ApiSettings,
} from '@/types/api'

type User = {
  id: number
  username: string
  password: string
  token: string
}

type Movie = ApiMovie
type Cinema = ApiCinema

type MovieSession = ApiMovieSession & {
  seats: {
    rows: number
    seatsPerRow: number
  }
}

type Booking = {
  id: string
  userId: number
  movieSessionId: number
  bookedAt: string
  seats: ApiSeat[]
  isPaid: boolean
}

const db = {
  users: [] as User[],
  movies: [] as Movie[],
  cinemas: [] as Cinema[],
  movieSessions: [] as MovieSession[],
  bookings: [] as Booking[],
  settings: {
    bookingPaymentTimeSeconds: 180,
  } as ApiSettings,
}

let userSeq = 1
let movieSeq = 1
let cinemaSeq = 1
let sessionSeq = 1

function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return (crypto as any).randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function findUserByToken(token: string | undefined | null): User | null {
  if (!token) return null
  return db.users.find((u) => u.token === token) ?? null
}

function addUser(username: string, password: string): User {
  const existing = db.users.find((u) => u.username === username)
  if (existing) {
    throw new Error('User exists')
  }
  const user: User = {
    id: userSeq++,
    username,
    password,
    token: uuid(),
  }
  db.users.push(user)
  return user
}

let seeded = false

function seedDemoData() {
  if (seeded) return
  seeded = true

  // demo user
  addUser('demoUser', 'DemoPass1')

  // movies
  const movie1: Movie = {
    id: movieSeq++,
    title: 'Интерстеллар',
    description: 'Космическая драма о любви, времени и гравитации.',
    year: 2014,
    lengthMinutes: 169,
    posterImage: '/img-interstellar.jpg',
    rating: 8.6,
  }
  const movie2: Movie = {
    id: movieSeq++,
    title: 'Матрица',
    description: 'Киберпанк-боевик о симуляции реальности.',
    year: 1999,
    lengthMinutes: 136,
    posterImage: '/img-matrix.jpeg',
    rating: 8.7,
  }
  const movie3: Movie = {
    id: movieSeq++,
    title: 'Бегущий по лезвию 2049',
    description: 'Неонуар о репликантах и человеческой природе.',
    year: 2017,
    lengthMinutes: 163,
    posterImage: '',
    rating: 8.1,
  }
  db.movies.push(movie1, movie2, movie3)

  // cinemas
  const cinema1: Cinema = {
    id: cinemaSeq++,
    name: 'Космос',
    address: 'ул. Галактическая, 1',
  }
  const cinema2: Cinema = {
    id: cinemaSeq++,
    name: 'Пионер',
    address: 'пр-т Ретро, 12',
  }
  db.cinemas.push(cinema1, cinema2)

  function fromNowMinutes(min: number) {
    const d = new Date()
    d.setMinutes(d.getMinutes() + min)
    return d.toISOString()
  }

  const sessions: MovieSession[] = []

  sessions.push(
    {
      id: sessionSeq++,
      movieId: movie1.id,
      cinemaId: cinema1.id,
      startTime: fromNowMinutes(60),
      seats: { rows: 6, seatsPerRow: 10 },
    },
    {
      id: sessionSeq++,
      movieId: movie1.id,
      cinemaId: cinema1.id,
      startTime: fromNowMinutes(180),
      seats: { rows: 6, seatsPerRow: 10 },
    },
    {
      id: sessionSeq++,
      movieId: movie1.id,
      cinemaId: cinema2.id,
      startTime: fromNowMinutes(240),
      seats: { rows: 8, seatsPerRow: 12 },
    },
    {
      id: sessionSeq++,
      movieId: movie2.id,
      cinemaId: cinema1.id,
      startTime: fromNowMinutes(90),
      seats: { rows: 5, seatsPerRow: 8 },
    },
    {
      id: sessionSeq++,
      movieId: movie2.id,
      cinemaId: cinema2.id,
      startTime: fromNowMinutes(200),
      seats: { rows: 7, seatsPerRow: 9 },
    },
    {
      id: sessionSeq++,
      movieId: movie3.id,
      cinemaId: cinema2.id,
      startTime: fromNowMinutes(120),
      seats: { rows: 10, seatsPerRow: 14 },
    },
  )

  db.movieSessions.push(...sessions)

  const demoUser = db.users[0]
  const sessionA = sessions[0]
  const sessionB = sessions[sessions.length - 1]
  const nowIso = new Date().toISOString()

  if (demoUser && sessionA && sessionB) {
    const booking1: Booking = {
      id: uuid(),
      userId: demoUser.id,
      movieSessionId: sessionA.id,
      bookedAt: nowIso,
      seats: [
        { rowNumber: 1, seatNumber: 3 },
        { rowNumber: 1, seatNumber: 4 },
      ],
      isPaid: false,
    }

    const booking2: Booking = {
      id: uuid(),
      userId: demoUser.id,
      movieSessionId: sessionB.id,
      bookedAt: nowIso,
      seats: [{ rowNumber: 5, seatNumber: 7 }],
      isPaid: true,
    }

    db.bookings.push(booking1, booking2)
  }
}

/** === Endpoint-логика === */

function epLogin(username: string, password: string) {
  if (!username || !password) {
    return { status: 400, body: { message: 'Требуется имя пользователя и пароль' } }
  }
  const user = db.users.find((u) => u.username === username)
  if (!user || user.password !== password) {
    return { status: 401, body: { message: 'Неверное имя пользователя или пароль' } }
  }
  return { status: 200, body: { token: user.token } }
}

function epRegister(username: string, password: string) {
  if (!username || !password) {
    return { status: 400, body: { message: 'Требуется имя пользователя и пароль' } }
  }
  try {
    const user = addUser(username, password)
    return { status: 200, body: { token: user.token } }
  } catch {
    return { status: 409, body: { message: 'Пользователь уже существует' } }
  }
}

function epGetMovies() {
  const body: ApiMovie[] = db.movies
  return { status: 200, body }
}

function epGetCinemas() {
  const body: ApiCinema[] = db.cinemas
  return { status: 200, body }
}

function epGetMovieSessionsByMovie(movieId: number) {
  const movie = db.movies.find((m) => m.id === movieId)
  if (!movie) return { status: 404, body: { message: 'Фильм не найден' } }

  const sessions: ApiMovieSession[] = db.movieSessions
    .filter((s) => s.movieId === movieId)
    .map(({ seats, ...rest }) => rest)

  return { status: 200, body: sessions }
}

function epGetMovieSessionsByCinema(cinemaId: number) {
  const cinema = db.cinemas.find((c) => c.id === cinemaId)
  if (!cinema) return { status: 404, body: { message: 'Кинотеатр не найден' } }

  const sessions: ApiMovieSession[] = db.movieSessions
    .filter((s) => s.cinemaId === cinemaId)
    .map(({ seats, ...rest }) => rest)

  return { status: 200, body: sessions }
}

function epGetMovieSessionDetails(movieSessionId: number) {
  const session = db.movieSessions.find((s) => s.id === movieSessionId)
  if (!session) return { status: 404, body: { message: 'Сеанс не найден' } }

  const bookedSeats: ApiSeat[] = db.bookings
    .filter((b) => b.movieSessionId === movieSessionId)
    .flatMap((b) => b.seats)

  const body: ApiMovieSessionDetails = {
    id: session.id,
    movieId: session.movieId,
    cinemaId: session.cinemaId,
    startTime: session.startTime,
    seats: session.seats,
    bookedSeats,
  }

  return { status: 200, body }
}

function epCreateBooking(token: string | null, movieSessionId: number, seats: ApiSeat[]) {
  const user = findUserByToken(token)
  if (!user) return { status: 401, body: { message: 'Неавторизованный доступ' } }

  const session = db.movieSessions.find((s) => s.id === movieSessionId)
  if (!session) return { status: 404, body: { message: 'Сеанс не найден' } }

  if (!seats?.length) {
    return { status: 400, body: { message: 'Нужно указать места' } }
  }

  const conflict = db.bookings.some(
    (b) =>
      b.movieSessionId === movieSessionId &&
      b.seats.some((s) =>
        seats.some((sel) => sel.rowNumber === s.rowNumber && sel.seatNumber === s.seatNumber),
      ),
  )
  if (conflict) {
    return { status: 409, body: { message: 'Некоторые места уже забронированы' } }
  }

  const now = new Date().toISOString()

  const booking: Booking = {
    id: uuid(),
    userId: user.id,
    movieSessionId,
    bookedAt: now,
    seats: seats.map((s) => ({ rowNumber: s.rowNumber, seatNumber: s.seatNumber })),
    isPaid: false,
  }

  db.bookings.push(booking)

  const body: ApiBooking = {
    id: booking.id,
    userId: booking.userId,
    movieSessionId: booking.movieSessionId,
    bookedAt: booking.bookedAt,
    seats: booking.seats,
    isPaid: booking.isPaid,
  }

  return { status: 201, body }
}

function epPayBooking(token: string | null, bookingId: string) {
  const user = findUserByToken(token)
  if (!user) return { status: 401, body: { message: 'Неавторизованный доступ' } }

  const booking = db.bookings.find((b) => b.id === bookingId)
  if (!booking) return { status: 404, body: { message: 'Бронирование не найдено' } }
  if (booking.userId !== user.id) {
    return { status: 403, body: { message: 'Чужое бронирование' } }
  }

  booking.isPaid = true
  return { status: 200, body: { ok: true } }
}

function epGetMyBookings(token: string | null) {
  const user = findUserByToken(token)
  if (!user) return { status: 401, body: { message: 'Неавторизованный доступ' } }

  const bookings = db.bookings.filter((b) => b.userId === user.id)

  const body: ApiBooking[] = bookings.map((b) => ({
    id: b.id,
    userId: b.userId,
    movieSessionId: b.movieSessionId,
    bookedAt: b.bookedAt,
    seats: b.seats,
    isPaid: b.isPaid,
  }))

  return { status: 200, body }
}

function epGetSettings() {
  const body: ApiSettings = db.settings
  return { status: 200, body }
}

/** === Класс ошибки mock-API, чтобы из useApi можно было смотреть status === */
export class MockApiError extends Error {
  status: number
  body: any

  constructor(status: number, body: any, message?: string) {
    const msg = (body && (body as any).message) || message || 'Mock API error'
    super(msg)
    this.name = 'MockApiError'
    this.status = status
    this.body = body
  }
}

/** === Тип функции API и фабрика === */

export type ClientApiFn = <T = any>(
  path: string,
  options?: { method?: string; body?: any; headers?: Record<string, string> },
) => Promise<T>

export function createClientApi(): ClientApiFn {
  seedDemoData()

  return async function clientApi<T = any>(path: string, options?: any): Promise<T> {
    const method = (options?.method || 'GET').toUpperCase()
    const body = options?.body
    const headers = options?.headers || {}
    const token =
      (headers.authorization || headers.Authorization || '')
        .toString()
        .match(/^Bearer\s+(.+)$/i)?.[1] ?? null

    const cleanPath = path.replace(/^\/+/, '')
    const segments = cleanPath.split('/').filter(Boolean)

    // auth
    if (segments.length === 1 && segments[0] === 'login' && method === 'POST') {
      const r = epLogin(body?.username ?? '', body?.password ?? '')
      if (r.status >= 400) {
        // ← здесь уже летит MockApiError со статусом
        throw new MockApiError(r.status, r.body, (r.body as any).message || 'Login error')
      }
      return r.body as T
    }
    if (segments.length === 1 && segments[0] === 'register' && method === 'POST') {
      const r = epRegister(body?.username ?? '', body?.password ?? '')
      if (r.status >= 400) {
        throw new MockApiError(
          r.status,
          r.body,
          (r.body as any).message || 'Register error',
        )
      }
      return r.body as T
    }

    // movies/cinemas
    if (segments.length === 1 && segments[0] === 'movies' && method === 'GET') {
      return epGetMovies().body as T
    }
    if (
      segments.length === 3 &&
      segments[0] === 'movies' &&
      segments[2] === 'sessions' &&
      method === 'GET'
    ) {
      const movieId = Number(segments[1])
      const r = epGetMovieSessionsByMovie(movieId)
      if (r.status >= 400) {
        throw new MockApiError(
          r.status,
          r.body,
          (r.body as any).message || 'Movie sessions error',
        )
      }
      return r.body as T
    }

    if (segments.length === 1 && segments[0] === 'cinemas' && method === 'GET') {
      return epGetCinemas().body as T
    }
    if (
      segments.length === 3 &&
      segments[0] === 'cinemas' &&
      segments[2] === 'sessions' &&
      method === 'GET'
    ) {
      const cinemaId = Number(segments[1])
      const r = epGetMovieSessionsByCinema(cinemaId)
      if (r.status >= 400) {
        throw new MockApiError(
          r.status,
          r.body,
          (r.body as any).message || 'Cinema sessions error',
        )
      }
      return r.body as T
    }

    // movieSessions/{id}
    if (segments.length === 2 && segments[0] === 'movieSessions' && method === 'GET') {
      const id = Number(segments[1])
      const r = epGetMovieSessionDetails(id)
      if (r.status >= 400) {
        throw new MockApiError(
          r.status,
          r.body,
          (r.body as any).message || 'Session not found',
        )
      }
      return r.body as T
    }

    // movieSessions/{id}/bookings
    if (
      segments.length === 3 &&
      segments[0] === 'movieSessions' &&
      segments[2] === 'bookings' &&
      method === 'POST'
    ) {
      const id = Number(segments[1])
      const seats = (body?.seats || []) as ApiSeat[]
      const r = epCreateBooking(token, id, seats)
      if (r.status >= 400) {
        throw new MockApiError(
          r.status,
          r.body,
          (r.body as any).message || 'Booking error',
        )
      }
      return r.body as T
    }

    // bookings/{id}/payments
    if (
      segments.length === 3 &&
      segments[0] === 'bookings' &&
      segments[2] === 'payments' &&
      method === 'POST'
    ) {
      const bookingId = segments[1] as string
      const r = epPayBooking(token, bookingId)
      if (r.status >= 400) {
        throw new MockApiError(
          r.status,
          r.body,
          (r.body as any).message || 'Payment error',
        )
      }
      return r.body as T
    }

    // me/bookings
    if (
      segments.length === 2 &&
      segments[0] === 'me' &&
      segments[1] === 'bookings' &&
      method === 'GET'
    ) {
      const r = epGetMyBookings(token)
      if (r.status >= 400) {
        throw new MockApiError(
          r.status,
          r.body,
          (r.body as any).message || 'My bookings error',
        )
      }
      return r.body as T
    }

    // settings
    if (segments.length === 1 && segments[0] === 'settings' && method === 'GET') {
      return epGetSettings().body as T
    }

    // если вообще не совпало с маршрутом — тоже через MockApiError
    throw new MockApiError(
      404,
      { message: `clientApi: Unsupported path/method ${method} ${path}` },
    )
  }
}

// удобный синглтон, если не хочется каждый раз дергать createClientApi
export const clientApi: ClientApiFn = createClientApi()
