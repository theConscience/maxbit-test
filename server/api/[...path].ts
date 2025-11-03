export default defineEventHandler(async (event) => {
  const cfg = useRuntimeConfig()

  // если внешний API не задан — отдаём 503 (моки перекрывают своими маршрутами)
  if (!cfg.public.API_BASE_URL) {
    throw createError({ statusCode: 503, statusMessage: 'External API is not configured' })
  }

  const method = getMethod(event) // предупреждение про deprecated можно игнорить
  const path = event.context.params!.path
  const query = getQuery(event)
  const body = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)
    ? await readBody(event)
    : undefined

  const url = `${cfg.public.API_BASE_URL}/${path}`

  // Приводим к HeadersInit и чистим лишнее
  const headers = new Headers(getHeaders(event) as unknown as HeadersInit)
  headers.delete('host')

  return await $fetch(url, {
    method,
    query,
    body,
    headers,
    // credentials: 'include', // при необходимости
  })
})
