import { defineStore } from 'pinia'

export const useDataStore = defineStore('data', {
  state: () => ({
    clients: [],
    lists: [],
    webhooks: {}, // Nested by list ID: { listId: [webhooks] }
    loading: {
      clients: false,
      lists: false,
      webhooks: false,
      initialLoad: false
    },
    requestInProgress: {
      clients: false,
      lists: false,
      webhooks: false
    },
    error: null,
    // AbortControllers for cancelling requests
    abortControllers: {
      lists: null,
      webhooks: null,
      initialLoad: null
    },
    // Cache metadata
    cache: {
      clients: {
        timestamp: null,
        clientId: null,
        isStale: false
      },
      lists: {
        timestamp: null,
        clientId: null,
        isStale: false
      },
      webhooks: {
        timestamp: null,
        clientId: null,
        isStale: false
      }
    },
    // Cache configuration
    cacheConfig: {
      defaultMaxAge: 15 * 60 * 1000, // 15 minutes
      clientsMaxAge: 30 * 60 * 1000, // 30 minutes (clients change less frequently)
      listsMaxAge: 15 * 60 * 1000, // 15 minutes
      webhooksMaxAge: 10 * 60 * 1000 // 10 minutes (webhooks are more dynamic)
    }
  }),
  
  getters: {
    getWebhooksByListId: (state) => (listId) => {
      return state.webhooks[listId] || []
    },
    
    getListById: (state) => (listId) => {
      return state.lists.find(list => list.ListID === listId)
    },
    
    getClientById: (state) => (clientId) => {
      return state.clients.find(client => 
        client.ClientID === clientId || 
        client.BasicDetails?.ClientID === clientId
      )
    },
    
    totalWebhooks: (state) => {
      return Object.values(state.webhooks).reduce((total, listWebhooks) => {
        return total + listWebhooks.length
      }, 0)
    },
    
    isLoading: (state) => {
      return state.loading.clients || state.loading.lists || state.loading.webhooks
    },
    
    // Cache validation getters
    isCacheValid: (state) => (type, currentClientId, customMaxAge = null) => {
      const cache = state.cache[type]
      if (!cache.timestamp || !cache.clientId) return false
      if (cache.clientId !== currentClientId) return false
      if (cache.isStale) return false
      
      const maxAge = customMaxAge || state.cacheConfig[`${type}MaxAge`] || state.cacheConfig.defaultMaxAge
      return Date.now() - cache.timestamp < maxAge
    },
    
    shouldLoadData: (state) => (type, currentClientId, customMaxAge = null) => {
      const hasData = type === 'clients' ? state.clients.length > 0 :
                      type === 'lists' ? state.lists.length > 0 :
                      Object.keys(state.webhooks).length > 0
      return !hasData || !state.isCacheValid(type, currentClientId, customMaxAge)
    },
    
    getCacheAge: (state) => (type) => {
      const cache = state.cache[type]
      if (!cache.timestamp) return null
      return Date.now() - cache.timestamp
    },
    
    getCacheStatus: (state) => (type, currentClientId) => {
      const cache = state.cache[type]
      if (!cache.timestamp) return 'no-cache'
      if (cache.clientId !== currentClientId) return 'client-mismatch'
      if (cache.isStale) return 'stale'
      
      const maxAge = state.cacheConfig[`${type}MaxAge`] || state.cacheConfig.defaultMaxAge
      const age = Date.now() - cache.timestamp
      
      if (age > maxAge) return 'expired'
      if (age > maxAge * 0.8) return 'aging'
      return 'fresh'
    },
    
    isRequestInProgress: (state) => (type) => {
      return state.requestInProgress[type]
    }
  },
  
  actions: {
    setClients(clients, clientId = null) {
      this.clients = clients
      if (clientId) {
        this.updateCacheMetadata('clients', clientId)
      }
    },
    
    setLists(lists, clientId = null) {
      this.lists = lists
      if (clientId) {
        this.updateCacheMetadata('lists', clientId)
      }
    },
    
    setWebhooks(listId, webhooks, clientId = null) {
      this.webhooks[listId] = webhooks
      if (clientId) {
        this.updateCacheMetadata('webhooks', clientId)
      }
    },
    
    addWebhook(listId, webhook) {
      if (!this.webhooks[listId]) {
        this.webhooks[listId] = []
      }
      this.webhooks[listId].push(webhook)
    },
    
    updateWebhook(listId, webhookId, updatedWebhook) {
      const listWebhooks = this.webhooks[listId]
      if (listWebhooks) {
        const index = listWebhooks.findIndex(w => w.WebhookID === webhookId)
        if (index !== -1) {
          listWebhooks[index] = { ...listWebhooks[index], ...updatedWebhook }
        }
      }
    },
    
    removeWebhook(listId, webhookId) {
      const listWebhooks = this.webhooks[listId]
      if (listWebhooks) {
        const index = listWebhooks.findIndex(w => w.WebhookID === webhookId)
        if (index !== -1) {
          listWebhooks.splice(index, 1)
        }
      }
    },
    
    setLoading(type, value) {
      this.loading[type] = value
    },
    
    setRequestInProgress(type, value) {
      this.requestInProgress[type] = value
    },
    
    updateCacheMetadata(type, clientId, isStale = false) {
      this.cache[type] = {
        timestamp: Date.now(),
        clientId: clientId,
        isStale: isStale
      }
    },
    
    invalidateCache(type, clientId = null) {
      if (type === 'all') {
        Object.keys(this.cache).forEach(key => {
          this.cache[key].isStale = true
        })
      } else {
        this.cache[type].isStale = true
      }
    },
    
    invalidateCacheForClient(oldClientId, newClientId) {
      Object.keys(this.cache).forEach(key => {
        if (this.cache[key].clientId === oldClientId) {
          this.cache[key].isStale = true
        }
      })
    },
    
    setError(error) {
      this.error = error
    },
    
    clearError() {
      this.error = null
    },
    
    clearData() {
      // Cancel any ongoing requests
      this.cancelAllRequests()
      
      this.clients = []
      this.lists = []
      this.webhooks = {}
      this.error = null
      this.invalidateCache('all')
    },
    
    // Cancel all active requests
    cancelAllRequests() {
      Object.values(this.abortControllers).forEach(controller => {
        if (controller) {
          controller.abort()
        }
      })
      
      // Clear the controllers
      this.abortControllers = {
        lists: null,
        webhooks: null,
        initialLoad: null
      }
    },
    
    // Set abort controller for a specific operation
    setAbortController(operation, controller) {
      // Cancel previous controller if exists
      if (this.abortControllers[operation]) {
        this.abortControllers[operation].abort()
      }
      this.abortControllers[operation] = controller
    },
    
    clearCacheForClientSwitch(newClientId) {
      // Clear data if client has changed
      const clientChanged = this.cache.clients.clientId && this.cache.clients.clientId !== newClientId
      if (clientChanged) {
        this.clearData()
      }
    },
    
    // Optimistic update for better UX
    optimisticUpdateWebhook(listId, webhook) {
      this.addWebhook(listId, { ...webhook, _optimistic: true })
    },
    
    // Remove optimistic update and add real data
    confirmWebhook(listId, tempId, realWebhook) {
      const listWebhooks = this.webhooks[listId]
      if (listWebhooks) {
        const index = listWebhooks.findIndex(w => w._tempId === tempId)
        if (index !== -1) {
          listWebhooks[index] = realWebhook
        }
      }
    },
    
    // Revert optimistic update on failure
    revertOptimisticUpdate(listId, tempId) {
      const listWebhooks = this.webhooks[listId]
      if (listWebhooks) {
        const index = listWebhooks.findIndex(w => w._tempId === tempId)
        if (index !== -1) {
          listWebhooks.splice(index, 1)
        }
      }
    },
    
    // Smart loading functions that check cache validity
    async loadClientsIfNeeded(apiClient, forceRefresh = false, retryCount = 0) {
      // Use 'account' as cache key since clients are account-level
      const cacheKey = 'account'
      
      if (!forceRefresh && !this.shouldLoadData('clients', cacheKey)) {
        return { fromCache: true, data: this.clients }
      }
      
      if (this.requestInProgress.clients) {
        return { fromCache: false, data: null, inProgress: true }
      }
      
      this.setRequestInProgress('clients', true)
      this.setLoading('clients', true)
      
      try {
        const clients = await apiClient.getAccountClients()
        this.setClients(clients, cacheKey)
        return { fromCache: false, data: clients }
      } catch (error) {
        // Implement retry logic with exponential backoff
        if (retryCount < 2 && this.shouldRetry(error)) {
          console.warn(`Retrying clients load (attempt ${retryCount + 1}):`, error.message)
          await this.delay(Math.pow(2, retryCount) * 1000) // Exponential backoff
          return this.loadClientsIfNeeded(apiClient, forceRefresh, retryCount + 1)
        }
        
        this.setError(error.message)
        this.invalidateCache('clients')
        throw error
      } finally {
        this.setRequestInProgress('clients', false)
        this.setLoading('clients', false)
      }
    },
    
    async loadListsIfNeeded(apiClient, currentClientId, forceRefresh = false, retryCount = 0) {
      // Ensure we have a client ID
      if (!currentClientId) {
        throw new Error('Client ID is required to load lists')
      }
      
      if (!forceRefresh && !this.shouldLoadData('lists', currentClientId)) {
        return { fromCache: true, data: this.lists }
      }
      
      if (this.requestInProgress.lists) {
        return { fromCache: false, data: null, inProgress: true }
      }
      
      this.setRequestInProgress('lists', true)
      this.setLoading('lists', true)
      
      // Create abort controller for this request
      const abortController = new AbortController()
      this.setAbortController('lists', abortController)
      
      try {
        const lists = await apiClient.getClientLists(currentClientId, { 
          signal: abortController.signal 
        })
        
        // Validate data integrity
        if (!this.validateListsData(lists)) {
          throw new Error('Invalid lists data received from API')
        }
        
        // Batch fetch stats for all lists
        const listIds = lists.map(list => list.ListID)
        const { results: statsResults, errors: statsErrors } = await apiClient.batchFetchStats(listIds)
        
        // Merge stats into list data
        const listsWithStats = lists.map(list => ({
          ...list,
          ...statsResults[list.ListID]
        }))
        
        this.setLists(listsWithStats, currentClientId)
        return { fromCache: false, data: listsWithStats, statsErrors }
      } catch (error) {
        // Implement retry logic with exponential backoff
        if (retryCount < 2 && this.shouldRetry(error)) {
          console.warn(`Retrying lists load (attempt ${retryCount + 1}):`, error.message)
          await this.delay(Math.pow(2, retryCount) * 1000) // Exponential backoff
          return this.loadListsIfNeeded(apiClient, currentClientId, forceRefresh, retryCount + 1)
        }
        
        this.setError(error.message)
        this.invalidateCache('lists')
        throw error
      } finally {
        this.setRequestInProgress('lists', false)
        this.setLoading('lists', false)
        // Clear the abort controller
        if (this.abortControllers.lists === abortController) {
          this.abortControllers.lists = null
        }
      }
    },
    
    async loadWebhooksIfNeeded(apiClient, currentClientId, forceRefresh = false, retryCount = 0) {
      // Ensure we have a client ID and lists
      if (!currentClientId) {
        throw new Error('Client ID is required to load webhooks')
      }
      
      if (!forceRefresh && !this.shouldLoadData('webhooks', currentClientId)) {
        return { fromCache: true, data: this.webhooks }
      }
      
      if (this.requestInProgress.webhooks || this.lists.length === 0) {
        return { fromCache: false, data: null, inProgress: true }
      }
      
      this.setRequestInProgress('webhooks', true)
      this.setLoading('webhooks', true)
      
      // Create abort controller for this request
      const abortController = new AbortController()
      this.setAbortController('webhooks', abortController)
      
      try {
        const listIds = this.lists.map(list => list.ListID)
        const { results, errors } = await apiClient.batchFetchWebhooks(listIds, 3, {
          signal: abortController.signal,
          clientId: currentClientId
        })
        
        // Validate webhooks data
        if (!this.validateWebhooksData(results)) {
          throw new Error('Invalid webhooks data received from API')
        }
        
        // Store webhook data
        Object.entries(results).forEach(([listId, webhooks]) => {
          this.setWebhooks(listId, webhooks, currentClientId)
        })
        
        return { fromCache: false, data: results, errors }
      } catch (error) {
        // Implement retry logic with exponential backoff
        if (retryCount < 2 && this.shouldRetry(error)) {
          console.warn(`Retrying webhooks load (attempt ${retryCount + 1}):`, error.message)
          await this.delay(Math.pow(2, retryCount) * 1000) // Exponential backoff
          return this.loadWebhooksIfNeeded(apiClient, currentClientId, forceRefresh, retryCount + 1)
        }
        
        this.setError(error.message)
        this.invalidateCache('webhooks')
        throw error
      } finally {
        this.setRequestInProgress('webhooks', false)
        this.setLoading('webhooks', false)
        // Clear the abort controller
        if (this.abortControllers.webhooks === abortController) {
          this.abortControllers.webhooks = null
        }
      }
    },
    
    // Parallel loading function for initial data load
    async loadInitialData(apiClient, currentClientId, forceRefresh = false) {
      // Ensure we have a client ID
      if (!currentClientId) {
        throw new Error('Client ID is required to load initial data')
      }
      
      if (this.loading.initialLoad) {
        return { inProgress: true }
      }
      
      this.setLoading('initialLoad', true)
      
      try {
        // First, ensure we have lists
        const listsResult = await this.loadListsIfNeeded(apiClient, currentClientId, forceRefresh)
        
        // Then load webhooks in parallel with any remaining operations
        const webhooksPromise = this.loadWebhooksIfNeeded(apiClient, currentClientId, forceRefresh)
        
        const webhooksResult = await webhooksPromise
        
        return {
          fromCache: listsResult.fromCache && webhooksResult.fromCache,
          lists: listsResult,
          webhooks: webhooksResult
        }
      } catch (error) {
        this.setError(error.message)
        throw error
      } finally {
        this.setLoading('initialLoad', false)
      }
    },
    
    // Helper functions for retry logic and data validation
    shouldRetry(error) {
      // Retry on network errors, timeout, or 5xx server errors
      if (!error.response) return true // Network error
      const status = error.response.status
      return status >= 500 || status === 429 || status === 408
    },
    
    delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    },
    
    validateListsData(lists) {
      if (!Array.isArray(lists)) return false
      return lists.every(list => 
        list && 
        typeof list.ListID === 'string' && 
        typeof list.Name === 'string'
      )
    },
    
    validateWebhooksData(webhooksData) {
      if (!webhooksData || typeof webhooksData !== 'object') return false
      return Object.entries(webhooksData).every(([listId, webhooks]) => {
        if (!Array.isArray(webhooks)) return false
        return webhooks.every(webhook => 
          webhook && 
          typeof webhook.WebhookID === 'string' && 
          typeof webhook.Url === 'string' && 
          Array.isArray(webhook.Events)
        )
      })
    },
    
    detectStaleData() {
      const now = Date.now()
      const staleThreshold = 15 * 60 * 1000 // 15 minutes
      
      Object.keys(this.cache).forEach(type => {
        const cache = this.cache[type]
        if (cache.timestamp && now - cache.timestamp > staleThreshold) {
          console.warn(`Stale data detected for ${type}:`, {
            age: now - cache.timestamp,
            threshold: staleThreshold
          })
          cache.isStale = true
        }
      })
    }
  },
  
  persist: {
    storage: sessionStorage,
    key: 'cm-data',
    pick: ['clients', 'lists', 'webhooks', 'cache'],
    afterRestore: (ctx) => {
      // Check for stale data after restore
      ctx.store.detectStaleData()
    }
  }
})