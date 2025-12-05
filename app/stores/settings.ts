// app/stores/settings.ts
import { defineStore } from 'pinia'
import type { ApiSettings } from '@/types/api'

export const useSettingsStore = defineStore('settings', {
  state: () => ({ paymentTimeoutSeconds: 0 }),
  actions: {
    async fetchSettings() {
      const api = useApi()
      const res = await api<ApiSettings>('/settings')
      this.paymentTimeoutSeconds = res.bookingPaymentTimeSeconds ?? 0
    },
  },
})
