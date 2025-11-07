export default defineEventHandler(async (event) => {
  const id = event.context.params!.id
  const body = await readBody<{ seats: { row:number; col:number }[] }>(event)
  // имитируем успех
  return { ok: true, bookingId: `b-${id}-${Date.now()}`, seats: body?.seats || [] }
})
