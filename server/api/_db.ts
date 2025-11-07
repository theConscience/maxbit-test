/** === Типы по Swagger === */

export type User = {
  id: number
  username: string
  password: string // в моках plain-text
  token: string
}

export type Movie = {
  id: number
  title: string
  description: string
  year: number
  lengthMinutes: number
  posterImage: string
  rating: number
}

export type Cinema = {
  id: number
  name: string
  address: string
}

export type MovieSession = {
  id: number
  movieId: number
  cinemaId: number
  startTime: string // ISO date-time
}

export type Seat = {
  rowNumber: number
  seatNumber: number
}

export type MovieSessionDetails = MovieSession & {
  seats: {
    rows: number
    seatsPerRow: number
  }
  bookedSeats: Seat[]
}

export type Booking = {
  id: string // uuid
  userId: number
  movieSessionId: number
  bookedAt: string // ISO date-time
  seats: Seat[]
  isPaid: boolean
}

export type Settings = {
  bookingPaymentTimeSeconds: number
}

/** === UUID helper (без node:crypto) === */

function safeRandomUUID(): string {
  // если есть Web Crypto / Node Crypto c randomUUID
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    // @ts-expect-error: рантайм проверен
    return crypto.randomUUID()
  }

  // простой v4-like fallback для моков
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/** === In-memory DB === */

export const db = {
  users: [] as User[],
  movies: [] as Movie[],
  cinemas: [] as Cinema[],
  // sessions храним сразу с размерами зала
  movieSessions: [] as (MovieSession & { seats: { rows: number; seatsPerRow: number } })[],
  bookings: [] as Booking[],
  settings: {
    bookingPaymentTimeSeconds: 180,
  } as Settings,
}

let userSeq = 1
let movieSeq = 1
let cinemaSeq = 1
let sessionSeq = 1

/** === Helpers === */

function addUser(username: string, password: string): User {
  const existing = db.users.find((u) => u.username === username)
  if (existing) throw new Error('User exists')

  const user: User = {
    id: userSeq++,
    username,
    password,
    token: safeRandomUUID(),
  }
  db.users.push(user)
  return user
}

function findUserByToken(token: string | null | undefined): User | null {
  if (!token) return null
  return db.users.find((u) => u.token === token) ?? null
}

export function resetDb(withSeed = true) {
  db.users.length = 0
  db.movies.length = 0
  db.cinemas.length = 0
  db.movieSessions.length = 0
  db.bookings.length = 0
  db.settings = { bookingPaymentTimeSeconds: 180 }

  userSeq = 1
  movieSeq = 1
  cinemaSeq = 1
  sessionSeq = 1

  if (withSeed) seed(true)
}

/** === Seed === */

export function seed(force = false) {
  if (!force && (db.movies.length || db.cinemas.length || db.movieSessions.length)) return

  resetDb(false)

  const movies: Movie[] = [
    {
      id: movieSeq++,
      title: 'Побег из Шоушенка',
      year: 1994,
      rating: 9.3,
      posterImage: '/static/images/posters/shawshank.jpg',
      lengthMinutes: 142,
      description:
        'Два заключённых сближаются за годы совместного заключения, находя утешение и искупление.',
    },
    {
      id: movieSeq++,
      title: 'Тёмный рыцарь',
      year: 2008,
      rating: 9.0,
      posterImage: '/static/images/posters/dark_knight.jpg',
      lengthMinutes: 152,
      description: 'Когда Джокер сеет хаос в Готэме, Бэтмен сталкивается с пределами морали.',
    },
  ]
  db.movies.push(...movies)

  const cinemas: Cinema[] = [
    {
      id: cinemaSeq++,
      name: 'Skyline Cinema',
      address: 'ТРЦ Galileo, ул. Бобруйская, 6',
    },
    {
      id: cinemaSeq++,
      name: 'Салют',
      address: 'пр-т Рокоссовского, 150а',
    },
  ]
  db.cinemas.push(...cinemas)

  const now = Date.now()
  const inMinutes = (m: number) => new Date(now + m * 60_000).toISOString()

  function pushSession(movieId: number, cinemaId: number, minutesFromNow: number) {
    const session: MovieSession & { seats: { rows: number; seatsPerRow: number } } = {
      id: sessionSeq++,
      movieId,
      cinemaId,
      startTime: inMinutes(minutesFromNow),
      seats: {
        rows: 3 + 5 * cinemaId,
        seatsPerRow: 10 + 5 * (cinemaId - 1),
      },
    }
    db.movieSessions.push(session)
    return session
  }

  pushSession(movies[0]!.id, cinemas[0]!.id, 60)
  pushSession(movies[0]!.id, cinemas[1]!.id, 90)
  pushSession(movies[1]!.id, cinemas[0]!.id, 120)

  addUser('demouser', 'Password1')
}

// сидим при первом импорте; в dev принудительно обновим демо-данные
seed(process.env.NODE_ENV === 'development')

/** === Auth helper === */

export function requireAuth(event: any): User {
  const auth = getHeader(event, 'authorization') || ''
  const token = auth.replace(/^Bearer\s+/i, '')
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  const user = findUserByToken(token)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  return user
}

/** === API-функции под [...path].ts === */

export function apiRegister(username: string, password: string) {
  if (!username || !password) {
    return { status: 400, body: { message: 'Требуется имя пользователя и пароль' } }
  }
  if (db.users.some((u) => u.username === username)) {
    return { status: 409, body: { message: 'Имя пользователя уже существует' } }
  }
  const user = addUser(username, password)
  return { status: 200, body: { token: user.token } }
}

export function apiLogin(username: string, password: string) {
  if (!username || !password) {
    return { status: 400, body: { message: 'Требуется имя пользователя и пароль' } }
  }
  const user = db.users.find((u) => u.username === username)
  if (!user || user.password !== password) {
    return { status: 401, body: { message: 'Неверное имя пользователя или пароль' } }
  }
  return { status: 200, body: { token: user.token } }
}

export function apiGetMovies() {
  return { status: 200, body: db.movies }
}

export function apiGetCinemas() {
  return { status: 200, body: db.cinemas }
}

export function apiGetMovieSessionsByMovie(movieId: number) {
  const movie = db.movies.find((m) => m.id === movieId)
  if (!movie) return { status: 404, body: { message: 'Фильм не найден' } }

  const sessions = db.movieSessions
    .filter((s) => s.movieId === movieId)
    .map(({ seats, ...rest }) => rest as MovieSession)

  return { status: 200, body: sessions }
}

export function apiGetMovieSessionsByCinema(cinemaId: number) {
  const cinema = db.cinemas.find((c) => c.id === cinemaId)
  if (!cinema) return { status: 404, body: { message: 'Кинотеатр не найден' } }

  const sessions = db.movieSessions
    .filter((s) => s.cinemaId === cinemaId)
    .map(({ seats, ...rest }) => rest as MovieSession)

  return { status: 200, body: sessions }
}

export function apiGetMovieSessionDetails(movieSessionId: number) {
  const session = db.movieSessions.find((s) => s.id === movieSessionId)
  if (!session) return { status: 404, body: { message: 'Сеанс не найден' } }

  const bookedSeats = db.bookings
    .filter((b) => b.movieSessionId === movieSessionId)
    .flatMap((b) => b.seats)

  const body: MovieSessionDetails = {
    id: session.id,
    movieId: session.movieId,
    cinemaId: session.cinemaId,
    startTime: session.startTime,
    seats: session.seats,
    bookedSeats,
  }

  return { status: 200, body }
}

export function apiCreateBooking(userToken: string | null, movieSessionId: number, seats: Seat[]) {
  const user = findUserByToken(userToken)
  if (!user) return { status: 401, body: { message: 'Неавторизованный доступ' } }

  const session = db.movieSessions.find((s) => s.id === movieSessionId)
  if (!session) return { status: 404, body: { message: 'Сеанс не найден' } }

  if (
    !Array.isArray(seats) ||
    seats.length === 0 ||
    !seats.every(
      (s) =>
        s &&
        typeof s.rowNumber === 'number' &&
        typeof s.seatNumber === 'number' &&
        s.rowNumber > 0 &&
        s.seatNumber > 0 &&
        s.rowNumber <= session.seats.rows &&
        s.seatNumber <= session.seats.seatsPerRow,
    )
  ) {
    return { status: 400, body: { message: 'Неверное тело запроса' } }
  }

  const conflict = db.bookings.some(
    (b) =>
      b.movieSessionId === movieSessionId &&
      b.seats.some((bs) =>
        seats.some(
          (s) => s.rowNumber === bs.rowNumber && s.seatNumber === bs.seatNumber,
        ),
      ),
  )
  if (conflict) {
    return { status: 409, body: { message: 'Места уже забронированы' } }
  }

  const booking: Booking = {
    id: safeRandomUUID(),
    userId: user.id,
    movieSessionId,
    bookedAt: new Date().toISOString(),
    seats,
    isPaid: false,
  }

  db.bookings.push(booking)
  return { status: 200, body: { bookingId: booking.id } }
}

export function apiPayBooking(userToken: string | null, bookingId: string) {
  const user = findUserByToken(userToken)
  if (!user) return { status: 401, body: { message: 'Неавторизованный доступ' } }

  const b = db.bookings.find((x) => x.id === bookingId && x.userId === user.id)
  if (!b) return { status: 404, body: { message: 'Бронирование не найдено' } }
  if (b.isPaid) return { status: 409, body: { message: 'Бронирование уже оплачено' } }

  b.isPaid = true
  return { status: 200, body: { message: 'Бронирование успешно оплачено' } }
}

export function apiGetMyBookings(userToken: string | null) {
  const user = findUserByToken(userToken)
  if (!user) return { status: 401, body: { message: 'Неавторизованный доступ' } }

  const list = db.bookings.filter((b) => b.userId === user.id)
  return { status: 200, body: list }
}

export function apiGetSettings() {
  return { status: 200, body: db.settings }
}
