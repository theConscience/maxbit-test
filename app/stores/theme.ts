import { defineStore } from 'pinia'
type Mode = 'light'|'dark'|'system'

export const useThemeStore = defineStore('theme', {
  state: () => ({ mode: 'system' as Mode, resolved: 'light' as 'light'|'dark' }),
  persist: true,
  actions: {
    init(){
      const prefersDark = process.client && window.matchMedia('(prefers-color-scheme: dark)').matches
      this.apply(this.mode==='dark'?'dark':this.mode==='light'?'light':(prefersDark?'dark':'light'))
      if (process.client){
        const mq = window.matchMedia('(prefers-color-scheme: dark)')
        mq.addEventListener('change', (e)=>{ if(this.mode==='system') this.apply(e.matches?'dark':'light') })
      }
    },
    setMode(m:Mode){ this.mode=m; this.init() },
    apply(actual:'light'|'dark'){ this.resolved=actual; if(process.client) document.documentElement.classList.toggle('dark', actual==='dark') },
  },
})
