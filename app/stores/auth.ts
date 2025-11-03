import { defineStore } from 'pinia'

type AuthState = {
  token: string | null
  user: { username: string } | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({ token: null, user: null }),
  getters: {
    isAuthed: (s) => !!s.token,
    username: (s) => s.user?.username ?? null,
  },
  actions: {
    async register(username: string, password: string) {
      const api = useApi()
      await api('/register', { method: 'POST', body: { username, password } })
      // независимо от ответа регистрации — авторизуемся явно
      await this.login(username, password)
    },
    async login(username: string, password: string) {
      const api = useApi()
      const res = (await api('/login', { method: 'POST', body: { username, password } })) as any
      if (!res?.token) {
        throw new Error('Неверный логин или пароль. Проверьте введенные данные и попробуйте снова')
      }
      this.token = res.token
      this.user = { username }
    },
    logout() {
      this.$reset()
    },
  },
  persist: true,
})
