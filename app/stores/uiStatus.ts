import { defineStore } from 'pinia'

export const useUiStatusStore = defineStore('uiStatus', {

  state: () => ({
    navHint: '' as string,
  }),
  actions: {
    setNavHint(text: string) {
      this.navHint = text
    },
    clearNavHint() {
      this.navHint = ''
    },
  },
})
