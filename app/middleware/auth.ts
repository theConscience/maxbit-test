export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()
  if (process.server) return
  if (to.path.startsWith('/tickets') && !auth.isAuthed) {
    return navigateTo(`/auth/login?next=${encodeURIComponent(to.fullPath)}`)
  }
})
