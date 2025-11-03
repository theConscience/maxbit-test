export default defineEventHandler(async (event) => {
  const cfg = useRuntimeConfig()
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
