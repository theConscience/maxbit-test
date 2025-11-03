export default defineEventHandler((event) => {
  const id = event.context.params!.id
  return [
    {
      id: `s-${id}-1`,
      movieId: id,
      cinemaId: 'c1',
      cinemaName: 'Кинотеатр Центральный',
      startsAt: new Date(Date.now() + 60*60*1000).toISOString(),
      rows: 8,
      cols: 12,
      bookedSeats: ['1-2', '2-5'],
    },
    {
      id: `s-${id}-2`,
      movieId: id,
      cinemaId: 'c2',
      cinemaName: 'IMAX Сити',
      startsAt: new Date(Date.now() + 3*60*60*1000).toISOString(),
      rows: 10,
      cols: 14,
      bookedSeats: [],
    },
  ]
})
