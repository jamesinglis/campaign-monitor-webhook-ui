import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    mode: 'system' // 'system', 'light', 'dark'
  }),
  
  getters: {
    systemPreference() {
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      }
      return 'light'
    },
    
    currentTheme() {
      if (this.mode === 'system') {
        return this.systemPreference
      }
      return this.mode
    },
    
    isDark() {
      return this.mode === 'dark' || (this.mode === 'system' && this.systemPreference === 'dark')
    },
    
    isLight() {
      return this.mode === 'light' || (this.mode === 'system' && this.systemPreference === 'light')
    },
    
    isSystem() {
      return this.mode === 'system'
    }
  },
  
  actions: {
    initializeTheme() {
      // Apply initial theme
      this.applyTheme()
      
      // Listen for system preference changes
      this.setupSystemListener()
    },
    
    setupSystemListener() {
      if (typeof window !== 'undefined' && window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        mediaQuery.addEventListener('change', () => {
          if (this.mode === 'system') {
            this.applyTheme()
          }
        })
      }
    },
    
    setMode(mode) {
      this.mode = mode
      this.applyTheme()
    },
    
    cycleMode() {
      const modes = ['system', 'light', 'dark']
      const currentIndex = modes.indexOf(this.mode)
      const nextIndex = (currentIndex + 1) % modes.length
      this.setMode(modes[nextIndex])
    },
    
    applyTheme() {
      const html = document.documentElement
      
      // Calculate theme more explicitly
      let shouldBeDark = false
      if (this.mode === 'dark') {
        shouldBeDark = true
      } else if (this.mode === 'light') {
        shouldBeDark = false
      } else if (this.mode === 'system') {
        // Check system preference directly
        if (typeof window !== 'undefined' && window.matchMedia) {
          shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        }
      }
      
      if (shouldBeDark) {
        html.classList.add('dark')
      } else {
        html.classList.remove('dark')
      }
      
    }
  },
  
  persist: {
    key: 'cm-theme',
    storage: sessionStorage,
    paths: ['mode']
  }
})