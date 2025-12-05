// === Raw API types (из Swagger) ===

export type ApiMovie = {
  id: number
  title: string
  description: string
  year: number
  lengthMinutes: number
  posterImage: string
  rating: number
}

export type ApiCinema = {
  id: number
  name: string
  address: string
}

export type ApiMovieSession = {
  id: number
  movieId: number
  cinemaId: number
  startTime: string
}

export type ApiSeat = {
  rowNumber: number
  seatNumber: number
}

export type ApiMovieSessionDetails = ApiMovieSession & {
  seats: {
    rows: number
    seatsPerRow: number
  }
  bookedSeats: ApiSeat[]
}

export type ApiBooking = {
  id: string
  userId: number
  movieSessionId: number
  sessionId?: number
  bookedAt: string
  seats: ApiSeat[]
  isPaid: boolean
}

export type ApiSettings = {
  bookingPaymentTimeSeconds: number
}

// === View-модели для UI ===

export type Movie = {
  id: number
  title: string
  description?: string
  year?: number
  durationMin?: number
  rating?: number
  posterUrl?: string
}

export type Cinema = {
  id: number
  title: string
  address: string
}

export type Session = {
  id: number
  movieId: number
  cinemaId: number
  startsAt: string
  // доп. для UI:
  cinemaName?: string
  movieTitle?: string           // ← добавили
  moviePosterUrl?: string       // ← по желанию (заглушка/постер)
  rows?: number
  cols?: number
  bookedSeats?: string[] // 'row-col'
}

export type BookingVm = {
  id: string
  sessionId: number
  sessionTitle: string
  startsAt: string
  bookedAt: string
  status: 'unpaid' | 'paid'
  // доп. поля для страницы "Мои билеты"
  movieTitle?: string
  cinemaName?: string
  seats?: { row: number; col: number }[]
}
