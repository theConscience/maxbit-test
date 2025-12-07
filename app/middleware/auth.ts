export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()

  if (process.server) return

  if (to.path.startsWith('/tickets') && !auth.isAuthed) {
    // на всякий случай чистим стора, вдруг там какие-то обломки
    auth.logout()
    return navigateTo(`/auth/login?next=${encodeURIComponent(to.fullPath)}`)
  }
})
