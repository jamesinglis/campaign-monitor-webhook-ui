import axios from 'axios'

class ApiClient {
  constructor() {
    this.client = axios.create({
      baseURL: '/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    // Track active requests by client ID for cancellation
    this.activeRequests = new Map() // clientId -> Set of AbortControllers
    
    // Request interceptor to add auth headers
    this.client.interceptors.request.use(
      (config) => {
        const apiKey = this.getApiKey()
        if (apiKey) {
          // Campaign Monitor uses Basic auth with API key as username
          const basicAuth = btoa(apiKey + ':x')
          config.headers.Authorization = `Basic ${basicAuth}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )
    
    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        // Handle rate limiting with exponential backoff
        if (error.response?.status === 429) {
          const retryAfter = error.response.headers['retry-after'] || 60
          console.warn(`Rate limited. Retrying after ${retryAfter} seconds`)
          
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve(this.client.request(error.config))
            }, retryAfter * 1000)
          })
        }
        
        // Handle other errors
        if (error.response?.status === 401) {
          this.handleAuthError()
        }
        
        return Promise.reject(error)
      }
    )
  }
  
  getApiKey() {
    // Get API key from sessionStorage
    const authData = sessionStorage.getItem('cm-auth')
    if (authData) {
      try {
        const parsed = JSON.parse(authData)
        return parsed.apiKey
      } catch (e) {
        console.error('Failed to parse auth data:', e)
      }
    }
    return null
  }
  
  handleAuthError() {
    // Clear auth data on 401
    sessionStorage.removeItem('cm-auth')
    sessionStorage.removeItem('cm-data')
    
    // Don't reload page automatically - let the app handle it
    // This allows for better UX during API key validation
    console.warn('Authentication failed - cleared session data')
  }
  
  // Cancel all active requests for a specific client
  cancelRequestsForClient(clientId) {
    const controllers = this.activeRequests.get(clientId)
    if (controllers) {
      console.log(`Cancelling ${controllers.size} active requests for client ${clientId}`)
      controllers.forEach(controller => {
        controller.abort()
      })
      controllers.clear()
    }
  }
  
  // Cancel all active requests
  cancelAllRequests() {
    console.log('Cancelling all active requests')
    this.activeRequests.forEach((controllers, clientId) => {
      controllers.forEach(controller => {
        controller.abort()
      })
      controllers.clear()
    })
    this.activeRequests.clear()
  }
  
  // Track a request for a specific client
  trackRequest(clientId, abortController) {
    if (!this.activeRequests.has(clientId)) {
      this.activeRequests.set(clientId, new Set())
    }
    this.activeRequests.get(clientId).add(abortController)
    
    // Clean up when request completes
    const cleanup = () => {
      const controllers = this.activeRequests.get(clientId)
      if (controllers) {
        controllers.delete(abortController)
        if (controllers.size === 0) {
          this.activeRequests.delete(clientId)
        }
      }
    }
    
    return cleanup
  }
  
  // Get account clients (account-level API key required)
  async getAccountClients() {
    try {
      const response = await this.client.get('/clients.json')
      return response.data
    } catch (error) {
      console.error('Failed to get account clients:', error)
      throw error
    }
  }
  
  // Get client details for client-level API key
  async getClientDetails(clientId) {
    try {
      const response = await this.client.get(`/clients/${clientId}.json`)
      return response.data
    } catch (error) {
      console.error('Failed to get client details:', error)
      throw error
    }
  }
  
  // Get client lists
  async getClientLists(clientId, options = {}) {
    if (!clientId) {
      throw new Error('Client ID is required to get client lists')
    }
    
    const { signal } = options
    let cleanup = null
    
    try {
      // Track this request if signal provided
      if (signal) {
        cleanup = this.trackRequest(clientId, { abort: () => signal.abort?.() })
      }
      
      const response = await this.client.get(`/clients/${clientId}/lists.json`, { signal })
      return response.data
    } catch (error) {
      // Don't log errors for cancelled requests
      if (error.name !== 'CanceledError' && error.name !== 'AbortError') {
        console.error('Failed to get client lists:', error)
      }
      throw error
    } finally {
      cleanup?.()
    }
  }
  
  // Test API key by getting a simple endpoint (for debugging)
  async testApiKey() {
    try {
      // Try the simplest endpoint first to validate authentication
      const response = await this.client.get('/clients.json')
      return response.data
    } catch (error) {
      console.error('API key test failed:', error)
      throw error
    }
  }

  // Test client-level API key by getting lists for a specific client
  async testClientApiKey(clientId) {
    if (!clientId) {
      throw new Error('Client ID is required to test client API key')
    }
    
    try {
      const response = await this.client.get(`/clients/${clientId}/lists.json`)
      return response.data
    } catch (error) {
      console.error('Client API key test failed:', error)
      throw error
    }
  }
  
  // Get webhooks for a list
  async getListWebhooks(listId, options = {}) {
    const { signal, clientId } = options
    let cleanup = null
    
    try {
      // Track this request if signal and clientId provided
      if (signal && clientId) {
        cleanup = this.trackRequest(clientId, { abort: () => signal.abort?.() })
      }
      
      const response = await this.client.get(`/lists/${listId}/webhooks.json`, { signal })
      return response.data
    } catch (error) {
      // Don't log errors for cancelled requests
      if (error.name !== 'CanceledError' && error.name !== 'AbortError') {
        console.error('Failed to get list webhooks:', error)
      }
      throw error
    } finally {
      cleanup?.()
    }
  }
  
  // Get stats for a list
  async getListStats(listId, options = {}) {
    const { signal, clientId } = options
    let cleanup = null
    
    try {
      // Track this request if signal and clientId provided
      if (signal && clientId) {
        cleanup = this.trackRequest(clientId, { abort: () => signal.abort?.() })
      }
      
      const response = await this.client.get(`/lists/${listId}/stats.json`, { signal })
      return response.data
    } catch (error) {
      // Don't log errors for cancelled requests
      if (error.name !== 'CanceledError' && error.name !== 'AbortError') {
        console.error('Failed to get list stats:', error)
      }
      throw error
    } finally {
      cleanup?.()
    }
  }
  
  // Create a new webhook
  async createWebhook(listId, webhookData) {
    try {
      const response = await this.client.post(`/lists/${listId}/webhooks.json`, webhookData)
      return response.data
    } catch (error) {
      console.error('Failed to create webhook:', error)
      throw error
    }
  }
  
  // Delete a webhook
  async deleteWebhook(listId, webhookId) {
    try {
      const response = await this.client.delete(`/lists/${listId}/webhooks/${webhookId}.json`)
      return response.data
    } catch (error) {
      console.error('Failed to delete webhook:', error)
      throw error
    }
  }
  
  // Update webhook (delete + create pattern as per requirements)
  async updateWebhook(listId, webhookId, webhookData) {
    try {
      // Delete existing webhook
      await this.deleteWebhook(listId, webhookId)
      
      // Create new webhook
      return await this.createWebhook(listId, webhookData)
    } catch (error) {
      console.error('Failed to update webhook:', error)
      throw error
    }
  }
  
  // Batch fetch webhooks for multiple lists (with concurrency limit)
  async batchFetchWebhooks(listIds, concurrencyLimit = 3, options = {}) {
    const { signal, clientId } = options
    const results = {}
    const errors = {}
    
    // Process in batches to respect concurrency limit
    for (let i = 0; i < listIds.length; i += concurrencyLimit) {
      // Check if request was cancelled
      if (signal?.aborted) {
        throw new Error('Request cancelled')
      }
      
      const batch = listIds.slice(i, i + concurrencyLimit)
      
      const promises = batch.map(async (listId) => {
        try {
          const webhooks = await this.getListWebhooks(listId, { signal, clientId })
          results[listId] = webhooks
        } catch (error) {
          // Don't add to errors if request was cancelled
          if (error.name !== 'CanceledError' && error.name !== 'AbortError') {
            errors[listId] = error
          }
        }
      })
      
      await Promise.all(promises)
    }
    
    return { results, errors }
  }
  
  // Batch fetch stats for multiple lists (with concurrency limit)
  async batchFetchStats(listIds, concurrencyLimit = 3) {
    const results = {}
    const errors = {}
    
    // Process in batches to respect concurrency limit
    for (let i = 0; i < listIds.length; i += concurrencyLimit) {
      const batch = listIds.slice(i, i + concurrencyLimit)
      
      const promises = batch.map(async (listId) => {
        try {
          const stats = await this.getListStats(listId)
          results[listId] = stats
        } catch (error) {
          errors[listId] = error
        }
      })
      
      await Promise.all(promises)
    }
    
    return { results, errors }
  }
  
  // Helper method to validate webhook URL
  validateWebhookUrl(url) {
    try {
      const parsed = new URL(url)
      return parsed.protocol === 'https:'
    } catch (error) {
      return false
    }
  }
  
  // Helper method to validate webhook data
  validateWebhookData(data) {
    const errors = []
    
    if (!data.Url) {
      errors.push('URL is required')
    } else if (!this.validateWebhookUrl(data.Url)) {
      errors.push('URL must be HTTPS')
    }
    
    if (!data.Events || !Array.isArray(data.Events) || data.Events.length === 0) {
      errors.push('At least one event type is required')
    }
    
    if (!data.PayloadFormat || !['json', 'xml'].includes(data.PayloadFormat.toLowerCase())) {
      errors.push('Payload format must be json or xml')
    }
    
    return errors
  }
}

// Export singleton instance
export const apiClient = new ApiClient()
export default apiClient