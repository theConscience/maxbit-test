import { resetDb, seed } from '../api/_db'

export default defineEventHandler(async (event) => {
  // Например, требуем специальный хедер, чтобы случайно не дернуть в проде
  if (process.env.NODE_ENV === 'production') throw createError({ statusCode: 403 })
  resetDb()
  seed(true)
  return { ok: true }
})
