export default defineEventHandler((event) => {
  const id = event.context.params!.id
  return {
    id,
    cinemaId: 'c1',
    cinemaName: 'Кинотеатр Центральный',
    startsAt: new Date(Date.now() + 90*60*1000).toISOString(),
    rows: 8,
    cols: 12,
    bookedSeats: ['1-2', '2-5'],
  }
})

