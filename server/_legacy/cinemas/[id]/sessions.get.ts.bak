export default defineEventHandler((event) => {
  const id = event.context.params!.id
  return [
    {
      id: `sc-${id}-1`,
      cinemaId: id,
      cinemaName: id === 'c1' ? 'Кинотеатр Центральный' : 'IMAX Сити',
      startsAt: new Date(Date.now() + 2*60*60*1000).toISOString(),
      rows: 9,
      cols: 12,
      bookedSeats: ['3-3', '3-4'],
    },
  ]
})
