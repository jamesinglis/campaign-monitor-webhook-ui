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
        const clients = await apiClient.getAccountClients()
        
        // Both account and client-level keys can access /clients.json
        // So we need to test a truly account-level endpoint
        try {
          await apiClient.getAccountBillingDetails()
          
          // If we get here, it's an account-level key
          this.accountType = 'account'
          console.log('API key validated as account-level (can access billing details)')
        } catch (billingError) {
          // If billing details fail with 401/403, it's likely a client-level key
          if (billingError.response?.status === 401 || billingError.response?.status === 403) {
            this.accountType = 'client'
            console.log('API key detected as client-level (cannot access billing details)')
            
            // Auto-set client ID for client-level keys
            if (Array.isArray(clients) && clients.length > 0) {
              this.clientId = clients[0].ClientID
              console.log('Auto-set client ID for client-level key:', this.clientId)
            }
          } else {
            // If we can get clients but billing fails for other reasons, assume account-level
            this.accountType = 'account'
            console.log('API key validated as account-level (billing endpoint error but can access clients)')
          }
        }
        
        return true
      } catch (error) {
        // If account-level fails, this is likely a client-level key
        if (error.response?.status === 404 || error.response?.status === 401 || error.response?.status === 403) {
          // For client-level keys, we can't fully validate without a client ID
          // But we can assume it's valid if it passed basic auth
          this.accountType = 'client'
          console.log('API key detected as client-level (endpoint access denied)')
          return true
        }
        
        // For other errors (500, network errors, etc.), the key is likely invalid
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