export const useBookingsStore = defineStore('bookings', {
  state: () => ({ all: [] as any[], pending: false, error: null as any }),
  getters: {
    unpaid: (s) => s.all.filter((b:any) => b.status === 'unpaid'),
    upcoming: (s) => s.all.filter((b:any) => b.status === 'paid' && new Date(b.startsAt) > new Date()),
    past: (s) => s.all.filter((b:any) => new Date(b.startsAt) <= new Date()),
  },
  actions: {
    async fetchMyBookings() {
      this.pending = true; this.error = null
      try { this.all = await useApi()('/me/bookings') }
      catch (e) { this.error = e } finally { this.pending = false }
    },
    async pay(bookingId:string) {
      await useApi()(`/bookings/${bookingId}/payments`, { method: 'POST' })
    },
    async bookSeats(sessionId:string, seats:{row:number,col:number}[]) {
      await useApi()(`/movieSessions/${sessionId}`, { method: 'POST', body: { seats } })
    },
  },
})
