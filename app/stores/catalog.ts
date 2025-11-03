export const useCatalogStore = defineStore('catalog', {
  state: () => ({ movies: [] as any[], cinemas: [] as any[], movie: null as any, movieSessions: [] as any[], session: null as any, pending: false, error: null as any }),
  actions: {
    async fetchMovies() {
      this.pending = true; this.error = null
      try { this.movies = await useApi()('/movies') }
      catch (e) { this.error = e } finally { this.pending = false }
    },
    async fetchMovieWithSessions(id: string) {
      this.pending = true; this.error = null
      try {
        const [sessions] = await Promise.all([
          useApi()(`/movies/${id}/sessions`),
        ])
        this.movie = (this.movies.find((m:any) => String(m.id) === String(id)) || null)
        this.movieSessions = sessions as any[]
      } catch (e) { this.error = e } finally { this.pending = false }
    },
    async fetchCinemas() {
      this.pending = true; this.error = null
      try { this.cinemas = await useApi()('/cinemas') }
      catch (e) { this.error = e } finally { this.pending = false }
    },
    async fetchCinemaSessions(id:string) {
      this.pending = true; this.error = null
      try { this.movieSessions = await useApi()(`/cinemas/${id}/session`) }
      catch (e) { this.error = e } finally { this.pending = false }
    },
    async fetchSession(id:string) {
      this.pending = true; this.error = null
      try { this.session = await useApi()(`/movieSessions/${id}`) }
      catch (e) { this.error = e } finally { this.pending = false }
    },
  },
})
