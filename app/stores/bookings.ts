import { defineStore } from 'pinia'
import type { ApiBooking, ApiMovieSessionDetails, BookingVm } from '@/types/api'
import { useCatalogStore } from '@/stores/catalog'

export const useBookingsStore = defineStore('bookings', {
  state: () => ({
    all: [] as BookingVm[],
    pending: false,
    error: null as any,
  }),
  getters: {
    unpaid: (s) => s.all.filter((b) => b.status === 'unpaid'),
    upcoming: (s) =>
      s.all.filter((b) => b.status === 'paid' && new Date(b.startsAt).getTime() > Date.now()),
    past: (s) =>
      s.all.filter((b) => b.status === 'paid' && new Date(b.startsAt).getTime() <= Date.now()),
  },
  actions: {
    async fetchMyBookings() {
      this.pending = true
      this.error = null
      try {
        const api = useApi()
        const catalog = useCatalogStore()

        // чтобы были названия фильмов/кинотеатров
        await Promise.all([catalog.ensureMovies(), catalog.ensureCinemas()])

        const raw = await api<ApiBooking[]>('/me/bookings')

        const sessions = await Promise.all(
          raw.map((b) =>
            api<ApiMovieSessionDetails>(`/movieSessions/${b.movieSessionId}`).catch(() => null),
          ),
        )

        this.all = raw.map((b, i): BookingVm => {
          const s = sessions[i]
          const startsAt = s?.startTime ?? b.bookedAt

          const movie = s
            ? catalog.movies.find((m) => m.id === s.movieId)
            : undefined
          const cinema = s
            ? catalog.cinemas.find((c) => c.id === s.cinemaId)
            : undefined

          const sessionTitle = s
            ? `Сеанс #${s.id} · ${new Date(s.startTime).toLocaleString('ru-RU', {
                dateStyle: 'short',
                timeStyle: 'short',
              })}`
            : `Сеанс #${b.movieSessionId}`

          const seats = (b.seats || []).map((seat) => ({
            row: seat.rowNumber,
            col: seat.seatNumber,
          }))

          return {
            id: b.id,
            sessionId: b.movieSessionId,
            sessionTitle,
            startsAt,
            bookedAt: b.bookedAt,
            status: b.isPaid ? 'paid' : 'unpaid',

            movieTitle: movie?.title,
            cinemaName: cinema?.title,
            seats,
          }
        })
      } catch (e) {
        this.error = e
        this.all = []
      } finally {
        this.pending = false
      }
    },

    async pay(bookingId: string) {
      const api = useApi()
      await api(`/bookings/${bookingId}/payments`, { method: 'POST' })
      await this.fetchMyBookings()
    },

    async bookSeats(sessionId: number, seats: Array<{ row: number; col: number }>) {
      const api = useApi()
      const payload = {
        seats: seats.map((s) => ({
          rowNumber: s.row,
          seatNumber: s.col,
        })),
      }
      await api(`/movieSessions/${sessionId}/bookings`, {
        method: 'POST',
        body: payload,
      })
      // рефетч будет на /tickets
    },
  },
})
