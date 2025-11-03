import { defineStore } from 'pinia'
import type { Movie, Cinema, Session } from '@/types/api'

export const useCatalogStore = defineStore('catalog', {
  state: () => ({
    movies: [] as Movie[],
    movie: null as Movie | null,
    movieSessions: [] as Session[],

    cinemas: [] as Cinema[],
    cinema: null as Cinema | null,
    cinemaSessions: [] as Session[],

    session: null as Session | null, // <— нужно для /sessions/[id]
    pending: false,
    error: null as any,
  }),
  actions: {
    async fetchMovies() {
      this.pending = true
      this.error = null
      try {
        const api = useApi()
        this.movies = await api<Movie[]>('/movies')
      } catch (e) {
        this.error = e
      } finally {
        this.pending = false
      }
    },

    async fetchMovieWithSessions(id: string) {
      this.pending = true
      this.error = null
      try {
        const api = useApi()
        const [movie, sessions] = await Promise.all([
          api<Movie>(`/movies/${id}`),
          api<Session[]>(`/movies/${id}/sessions`),
        ])
        this.movie = movie
        this.movieSessions = sessions
      } catch (e) {
        this.error = e
      } finally {
        this.pending = false
      }
    },

    async fetchCinemas() {
      this.pending = true
      this.error = null
      try {
        const api = useApi()
        this.cinemas = await api<Cinema[]>('/cinemas')
      } catch (e) {
        this.error = e
      } finally {
        this.pending = false
      }
    },

    async fetchCinemaWithSessions(id: string) {
      this.pending = true
      this.error = null
      try {
        const api = useApi()
        const [cinema, sessions] = await Promise.all([
          api<Cinema>(`/cinemas/${id}`),
          api<Session[]>(`/cinemas/${id}/sessions`),
        ])
        this.cinema = cinema
        this.cinemaSessions = sessions
      } catch (e) {
        this.error = e
      } finally {
        this.pending = false
      }
    },

    async fetchSession(id: string) {
      // <— добавили
      this.pending = true
      this.error = null
      try {
        const api = useApi()
        this.session = await api<Session>(`/movieSessions/${id}`)
      } catch (e) {
        this.error = e
      } finally {
        this.pending = false
      }
    },
  },
})
