import { defineStore } from 'pinia'

export type Booking = {
  id: string
  sessionId: string
  sessionTitle?: string
  startsAt: string
  status: 'unpaid' | 'paid' | 'expired'
  bookedAt?: string
}

type BookingsState = {
  all: Booking[]
  pending: boolean
  error: any
}

export const useBookingsStore = defineStore('bookings', {
  state: (): BookingsState => ({
    all: [],
    pending: false,
    error: null,
  }),
  getters: {
    unpaid: (s) => s.all.filter((b) => b.status === 'unpaid'),
    upcoming: (s) => s.all.filter((b) => b.status === 'paid' && new Date(b.startsAt) > new Date()),
    past: (s) => s.all.filter((b) => new Date(b.startsAt) <= new Date()),
  },
  actions: {
    async fetchMyBookings() {
      this.pending = true
      this.error = null
      try {
        const api = useApi()
        const res = await api('/me/bookings')
        this.all = Array.isArray(res) ? (res as Booking[]) : []
      } catch (e) {
        this.error = e
      } finally {
        this.pending = false
      }
    },

    async pay(bookingId: string) {
      const api = useApi()
      await api(`/bookings/${bookingId}/payments`, { method: 'POST' })
      // сразу рефетч, чтобы обновить статусы
      await this.fetchMyBookings()
    },

    /** бронирование выбранных мест */
    async bookSeats(sessionId: string, seats: Array<{ row: number; col: number }>) {
      const api = useApi()
      await api(`/movieSessions/${sessionId}`, { method: 'POST', body: { seats } })
      // после успешного бронирования можно редиректить на /tickets, рефетч — уже на странице билетов
    },
  },
})
