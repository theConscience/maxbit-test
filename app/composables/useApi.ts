export const useApi = () => {
  const auth = useAuthStore()
  return $fetch.create({
    baseURL: '/api',
    onRequest({ options }) {
      if (auth.token) {
        const h = new Headers(options.headers as HeadersInit)
        h.set('Authorization', `Bearer ${auth.token}`)
        options.headers = h
      }
    },
    onResponseError({ response }) {
      if (response?.status === 401) {
        auth.logout()
        if (process.client) navigateTo('/auth/login')
      }
    },
  })
}
