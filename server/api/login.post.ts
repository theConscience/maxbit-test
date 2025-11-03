export default defineEventHandler(async (e) => {
  const { username, password } = await readBody<{username:string;password:string}>(e)
  if (username === 'user' && password === 'pass123A') return { token: 'mock-token-user' }
  throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
})
