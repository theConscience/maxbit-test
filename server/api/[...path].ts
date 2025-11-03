export default defineEventHandler(async (event) => {
  const cfg = useRuntimeConfig()
  const path = event.context.params!.path
  const url = `${cfg.public.API_BASE_URL}/${path}`

  const method = getMethod(event)
  const query = getQuery(event)
  const body = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)
    ? await readBody(event)
    : undefined

  return await $fetch(url, {
    method,
    query,
    body,
    headers: getHeaders(event),
    // credentials: 'include', // если когда-нибудь понадобятся куки
  })
})
