import { defineStore } from 'pinia'
import type {
  // сырой контракт DTO
  ApiMovie,
  ApiCinema,
  ApiMovieSession,
  ApiMovieSessionDetails,
  // view-модели для UI
  Movie,
  Cinema,
  Session,
} from '@/types/api'

function mapMovie(m: ApiMovie): Movie {
  const { public: { API_BASE_URL = '' } } = useRuntimeConfig()

  // нормализуем и подхватываем оба варианта: 'shawshank.jpg' ИЛИ '/static/images/posters/shawshank.jpg'
  const urlBase = API_BASE_URL.replace(/\/+$/, '')
  const poster = m.posterImage.replace(/^\/+/, '') // убираем лидирующие '/'
  // если пришло уже с 'static/...', оставляем; если просто имя файла — добавим префикс
  const posterPath = poster.startsWith('static/') ? poster : `static/images/posters/${poster}`


  return {
    id: m.id,
    title: m.title,
    description: m.description,
    year: m.year,
    durationMin: m.lengthMinutes,
    rating: m.rating,
    posterUrl: m.posterImage ? `${urlBase}/${posterPath}` : '',
  }
}

function mapCinema(c: ApiCinema): Cinema {
  return {
    id: c.id,
    title: c.name,
    address: c.address,
  }
}

function mapSession(
  s: ApiMovieSession | ApiMovieSessionDetails,
  cinemas: Cinema[],
  movies: Movie[],
): Session {
  const cinemaName = cinemas.find((c) => c.id === s.cinemaId)?.title
  const movie = movies.find((m) => m.id === s.movieId)

  const base: Session = {
    id: s.id,
    movieId: s.movieId,
    cinemaId: s.cinemaId,
    startsAt: s.startTime,
    cinemaName,
    movieTitle: movie?.title,
    moviePosterUrl: movie?.posterUrl,
  }

  if ('seats' in s) {
    base.rows = s.seats.rows
    base.cols = s.seats.seatsPerRow
  }

  if ('bookedSeats' in s) {
    base.bookedSeats = s.bookedSeats.map((seat) => `${seat.rowNumber}-${seat.seatNumber}`)
  }

  return base
}

export const useCatalogStore = defineStore('catalog', {
  state: () => ({
    movies: [] as Movie[],
    movie: null as Movie | null,
    movieSessions: [] as Session[],

    cinemas: [] as Cinema[],
    cinema: null as Cinema | null,
    cinemaSessions: [] as Session[],

    session: null as Session | null,
    pending: false,
    error: null as any,
  }),
  actions: {
    async fetchMovies() {
      this.pending = true
      this.error = null
      try {
        const api = useApi()
        const res = await api<ApiMovie[]>('/movies')
        this.movies = res.map(mapMovie)
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
        const res = await api<ApiCinema[]>('/cinemas')
        this.cinemas = res.map(mapCinema)
      } catch (e) {
        this.error = e
      } finally {
        this.pending = false
      }
    },

    async ensureMovies() {
      if (!this.movies.length) await this.fetchMovies()
    },
    async ensureCinemas() {
      if (!this.cinemas.length) await this.fetchCinemas()
    },

    async fetchMovieWithSessions(id: string) {
      this.pending = true
      this.error = null
      try {
        const api = useApi()
        const movieId = Number(id)
        await Promise.all([this.ensureMovies(), this.ensureCinemas()])

        this.movie = this.movies.find((m) => m.id === movieId) || null

        const raw = await api<ApiMovieSession[]>(`/movies/${movieId}/sessions`)
        this.movieSessions = raw.map((s) => mapSession(s, this.cinemas, this.movies))
      } catch (e) {
        this.error = e
        this.movieSessions = []
      } finally {
        this.pending = false
      }
    },

    async fetchCinemaWithSessions(id: string) {
      this.pending = true
      this.error = null
      try {
        const api = useApi()
        const cinemaId = Number(id)
        await Promise.all([this.ensureCinemas(), this.ensureMovies()])

        this.cinema = this.cinemas.find((c) => c.id === cinemaId) || null

        const raw = await api<ApiMovieSession[]>(`/cinemas/${cinemaId}/sessions`)
        this.cinemaSessions = raw.map((s) => mapSession(s, this.cinemas, this.movies))
      } catch (e) {
        this.error = e
        this.cinemaSessions = []
      } finally {
        this.pending = false
      }
    },

    async fetchSession(id: string) {
      this.pending = true
      this.error = null
      try {
        const api = useApi()
        const sessionId = Number(id)

        await Promise.all([this.ensureCinemas(), this.ensureMovies()])

        const details = await api<ApiMovieSessionDetails>(`/movieSessions/${sessionId}`)
        this.session = mapSession(details, this.cinemas, this.movies)
      } catch (e) {
        this.error = e
        this.session = null
      } finally {
        this.pending = false
      }
    },
  },
})
