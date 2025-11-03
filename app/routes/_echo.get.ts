export default defineEventHandler((event) => {
  return {
    ok: true,
    method: getMethod(event),
    query: getQuery(event),
    headers: getRequestHeaders(event),
  }
})
