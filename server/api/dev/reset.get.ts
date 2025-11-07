import { resetDb, seed } from '../_db'

export default defineEventHandler(() => {
  if (process.env.NODE_ENV !== 'development') {
    throw createError({ statusCode: 404 })
  }

  resetDb()
  seed(true)
  return { ok: true }
})
