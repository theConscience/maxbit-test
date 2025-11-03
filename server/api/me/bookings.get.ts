export default defineEventHandler(() => {
  return [
    {
      id: 'b1',
      sessionId: 's-m1-1',
      sessionTitle: 'Мстители (18:00)',
      startsAt: new Date(Date.now() + 24*60*60*1000).toISOString(),
      status: 'paid',
      bookedAt: new Date(Date.now() - 60*60*1000).toISOString(),
    },
    {
      id: 'b2',
      sessionId: 's-m2-1',
      sessionTitle: 'Тёмный рыцарь (20:00)',
      startsAt: new Date(Date.now() + 2*60*60*1000).toISOString(),
      status: 'unpaid',
      bookedAt: new Date().toISOString(),
    },
  ]
})
