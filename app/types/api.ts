export type Movie = {
  id: string
  title: string
  durationMin?: number
  rating?: number
  posterUrl?: string
  imageUrl?: string
}

export type Cinema = {
  id: string
  title: string
  posterUrl?: string
  imageUrl?: string
}

export type Session = {
  id: string
  movieId?: string
  cinemaId?: string
  cinemaName?: string
  startsAt: string
  rows?: number
  cols?: number
  bookedSeats?: string[] // 'r-c'
}
