export default defineEventHandler(async (e) => {
  const { username, password } = await readBody<{ username: string; password: string }>(e)
  if (!username || !password) throw createError({ statusCode: 400, statusMessage: 'Bad payload' })
  return { ok: true, token: 'mock-token-' + username }
})
