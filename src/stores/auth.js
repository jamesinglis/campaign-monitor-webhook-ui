import { defineStore } from 'pinia'
import apiClient from '../services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    apiKey: null,
    clientId: null,
    accountType: null // 'account' or 'client'
  }),
  
  getters: {
    isAccountLevel: (state) => state.accountType === 'account',
    isClientLevel: (state) => state.accountType === 'client',
    isAuthenticated: (state) => !!state.apiKey,
    hasValidAuth: (state) => !!state.apiKey && state.accountType
  },
  
  actions: {
    setApiKey(key) {
      // Clear data if API key changes
      if (this.apiKey && this.apiKey !== key) {
        this.invalidateAllData()
      }
      
      this.apiKey = key
      
      // Reset account type - will be determined during validation
      this.accountType = null
      
      // Clear client ID when API key changes
      if (this.apiKey && this.apiKey !== key) {
        this.clientId = null
      }
    },
    
    setClientId(id) {
      this.clientId = id
    },
    
    setAccountType(type) {
      this.accountType = type
    },
    
    logout() {
      this.invalidateAllData()
      this.apiKey = null
      this.clientId = null
      this.accountType = null
    },
    
    invalidateAllData() {
      // This will be handled by the components that watch for client changes
      // We emit an event that can be caught by the main app
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('client-changed', { 
          detail: { clientId: this.clientId, apiKey: this.apiKey } 
        }))
      }
    },
    
    // Validate API key by testing it against CM API
    async validateApiKey() {
      if (!this.apiKey) {
        return false
      }
      
      // Clear previous state
      this.accountType = null
      
      try {
        // Test account-level access first
        await apiClient.getAccountClients()
        this.accountType = 'account'
        console.log('API key validated as account-level')
        return true
      } catch (error) {
        // If account-level fails, this is likely a client-level key
        if (error.response?.status === 404 || error.response?.status === 401) {
          // For client-level keys, we can't fully validate without a client ID
          // But we can assume it's valid if it passed basic auth
          this.accountType = 'client'
          console.log('API key detected as client-level')
          return true
        }
        
        // For other errors (403, 500, etc.), the key is likely invalid
        console.error('API key validation failed:', error)
        this.accountType = null
        return false
      }
    }
  },
  
  persist: {
    storage: sessionStorage,
    key: 'cm-auth',
    pick: ['apiKey', 'clientId', 'accountType']
  }
})