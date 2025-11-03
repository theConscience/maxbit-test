export const useSettingsStore = defineStore('settings', {
  state: () => ({ paymentTimeoutSeconds: 0 }),
  actions: {
    async fetchSettings() {
      const res = await useApi()('/settings')
      this.paymentTimeoutSeconds = (res as any).paymentTimeoutSeconds ?? 0
    },
  },
})
