import { defineStore } from 'pinia'
import apiClient from '../services/api'
import { useDataStore } from './data'

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
        
        // Store clients data in dataStore for future use (both account and client level keys)
        if (Array.isArray(clients) && clients.length > 0) {
          const dataStore = useDataStore()
          dataStore.setClients(clients, 'account')
        }
        
        // Both account and client-level keys can access /clients.json
        // So we need to test a truly account-level endpoint
        try {
          await apiClient.getAccountBillingDetails()
          
          // If we get here, it's an account-level key
          this.accountType = 'account'
        } catch (billingError) {
          // If billing details fail with 401/403, it's likely a client-level key
          if (billingError.response?.status === 401 || billingError.response?.status === 403) {
            this.accountType = 'client'
            
            // For client-level keys, clients array might be empty, so we need to get client ID another way
            if (Array.isArray(clients) && clients.length > 0) {
              // If we got client data from /clients.json (rare for client-level keys)
              this.clientId = clients[0].ClientID
            } else if (this.clientId) {
              // If we already have a clientId set (from user input or elsewhere)
              // Continue with existing clientId
            }
            
            // If we have a client ID, try to get detailed client info
            if (this.clientId) {
              try {
                const clientDetails = await apiClient.getClientDetails(this.clientId)
                if (clientDetails) {
                  // Store the detailed client info in dataStore
                  const dataStore = useDataStore()
                  dataStore.setClients([clientDetails], 'account')
                }
              } catch (clientError) {
                console.warn('Could not fetch detailed client info:', clientError)
              }
            }
          } else {
            // If we can get clients but billing fails for other reasons, assume account-level
            this.accountType = 'account'
          }
        }
        
        return true
      } catch (error) {
        // If account-level fails, this is likely a client-level key
        if (error.response?.status === 404 || error.response?.status === 401 || error.response?.status === 403) {
          // For client-level keys, we can't fully validate without a client ID
          // But we can assume it's valid if it passed basic auth
          this.accountType = 'client'
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