<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
    <AppHeader />
    
    <main class="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
      <!-- Authentication Form -->
      <div v-if="!authStore.isAuthenticated" class="max-w-lg mx-auto">
        <div class="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
          <div class="text-center mb-8">
            <div class="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4 overflow-hidden">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="max-width: 32px; max-height: 32px;">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 class="text-3xl font-bold text-gray-900 dark:text-white">
              {{ !authStore.isAuthenticated ? 'Welcome' : 'Client ID Required' }}
            </h2>
            <p class="mt-3 text-gray-600 dark:text-gray-300">
              {{ !authStore.isAuthenticated 
                ? 'Enter your Campaign Monitor API credentials to manage webhooks'
                : 'Please provide your Client ID to access your subscriber lists'
              }}
            </p>
          </div>
          
          <ApiKeyInput v-if="!authStore.isAuthenticated" />
          
          <div v-if="authStore.apiKey" class="mt-8">
            <ClientSelector />
          </div>
        </div>
      </div>
      
      <!-- Main Content -->
      <div v-else class="space-y-6">
        <!-- Client Selection for Account-Level Keys -->
        <div v-if="authStore.isAccountLevel && !authStore.clientId" class="max-w-lg mx-auto">
          <div class="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
            <div class="text-center mb-8">
              <div class="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-4">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 class="text-3xl font-bold text-gray-900 dark:text-white">Select Client</h2>
              <p class="mt-3 text-gray-600 dark:text-gray-300">
                Choose which client you want to manage webhooks for
              </p>
            </div>
            <ClientSelector />
          </div>
        </div>
        
        <!-- Summary Stats -->
        <div v-if="authStore.clientId" class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Lists</p>
                <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ dataStore.lists.length }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Webhooks</p>
                <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ dataStore.totalWebhooks }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Active Subscribers</p>
                <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ totalSubscribers }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Actions Bar -->
        <div v-if="authStore.clientId" class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div class="flex items-center">
            <div class="flex items-center space-x-4">
              <button
                @click="loadLists"
                :disabled="loadingLists || dataStore.loading.initialLoad"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <svg v-if="loadingLists || dataStore.loading.initialLoad" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {{ loadingLists || dataStore.loading.initialLoad ? 'Refreshing Lists...' : 'Refresh Lists' }}
              </button>
              
              <!-- Lists Status Icon -->
              <StatusIcon
                v-if="dataStore.lists.length > 0"
                type="lists"
                :status="cacheStatus.lists"
                :age="cacheAge.lists"
                :last-updated="dataStore.cache.lists.timestamp"
              />
              
              <button
                v-if="dataStore.lists.length > 0"
                @click="() => loadWebhooks(true)"
                :disabled="loadingWebhooks || dataStore.loading.initialLoad"
                class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <svg v-if="loadingWebhooks || dataStore.loading.initialLoad" class="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {{ loadingWebhooks || dataStore.loading.initialLoad ? 'Refreshing Webhooks...' : 'Refresh Webhooks' }}
              </button>
              
              <!-- Webhooks Status Icon -->
              <StatusIcon
                v-if="dataStore.lists.length > 0"
                type="webhooks"
                :status="cacheStatus.webhooks"
                :age="cacheAge.webhooks"
                :last-updated="dataStore.cache.webhooks.timestamp"
              />
            </div>
            
            <!-- Center: Spacer and Error -->
            <div class="flex-1 flex justify-center">
              <div v-if="error" class="text-red-600 text-sm">
                {{ error }}
              </div>
            </div>
            
            <!-- Right: Expand/Collapse Buttons -->
            <div class="flex items-center space-x-2">
              <button
                v-if="dataStore.lists.length > 0"
                @click="expandAll"
                class="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Expand All
              </button>
              
              <button
                v-if="dataStore.lists.length > 0"
                @click="collapseAll"
                class="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Collapse All
              </button>
            </div>
          </div>
        </div>
        
        <!-- Lists Content -->
        <div v-if="authStore.clientId && dataStore.lists.length === 0 && !loadingLists">
          <EmptyState
            type="no-lists"
            title="No subscriber lists found"
            description="No subscriber lists were found for your account. Make sure you have lists set up in Campaign Monitor."
          />
        </div>
        
        <div v-else-if="authStore.clientId && (loadingLists || dataStore.loading.initialLoad) && dataStore.lists.length === 0">
          <LoadingSpinner message="Loading subscriber lists..." />
        </div>
        
        <div v-else-if="authStore.clientId" class="grid gap-6">
          <ListCard
            v-for="list in dataStore.lists"
            :key="list.ListID"
            :list="list"
            :webhooks="dataStore.getWebhooksByListId(list.ListID)"
            :force-expanded="allExpanded"
            @add-webhook="handleAddWebhook"
            @edit-webhook="handleEditWebhook"
            @delete-webhook="handleDeleteWebhook"
          />
        </div>
      </div>
    </main>
    
    <!-- Webhook Modal -->
    <WebhookModal
      :is-open="showWebhookModal"
      :webhook="editingWebhook"
      :list-id="webhookListId"
      @close="showWebhookModal = false"
      @save="handleSaveWebhook"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useDataStore } from '../stores/data'
import apiClient from '../services/api'

import AppHeader from '../components/AppHeader.vue'
import ApiKeyInput from '../components/ApiKeyInput.vue'
import ClientSelector from '../components/ClientSelector.vue'
import ListCard from '../components/ListCard.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import EmptyState from '../components/EmptyState.vue'
import WebhookModal from '../components/WebhookModal.vue'
import StatusIcon from '../components/StatusIcon.vue'

const authStore = useAuthStore()
const dataStore = useDataStore()

const loadingLists = ref(false)
const loadingWebhooks = ref(false)
const error = ref('')
const allExpanded = ref(null)

// Webhook modal state
const showWebhookModal = ref(false)
const editingWebhook = ref(null)
const webhookListId = ref('')

const totalSubscribers = computed(() => {
  return dataStore.lists.reduce((total, list) => {
    return total + (list.TotalActiveSubscribers || 0)
  }, 0)
})

// Cache status computed properties
const cacheStatus = computed(() => {
  const clientId = authStore.clientId
  if (!clientId) {
    return {
      lists: 'no-cache',
      webhooks: 'no-cache'
    }
  }
  return {
    lists: dataStore.getCacheStatus('lists', clientId),
    webhooks: dataStore.getCacheStatus('webhooks', clientId)
  }
})

const cacheAge = computed(() => {
  return {
    lists: dataStore.getCacheAge('lists'),
    webhooks: dataStore.getCacheAge('webhooks')
  }
})


const loadLists = async (forceRefresh = false) => {
  if (!authStore.hasValidAuth) {
    error.value = 'Please provide a valid API key'
    return
  }
  
  // For account-level keys, require client selection
  if (authStore.isAccountLevel && !authStore.clientId) {
    error.value = 'Please select a client first'
    return
  }
  
  // For client-level keys, require client ID
  if (authStore.isClientLevel && !authStore.clientId) {
    error.value = 'Client ID is required'
    return
  }
  
  const clientIdToUse = authStore.clientId
  
  // Clear cache if client has changed
  dataStore.clearCacheForClientSwitch(clientIdToUse)
  
  loadingLists.value = true
  error.value = ''
  
  try {
    const result = await dataStore.loadListsIfNeeded(apiClient, clientIdToUse, forceRefresh)
    
    if (result.fromCache) {
    } else if (result.inProgress) {
    } else {
      
      if (result.statsErrors && Object.keys(result.statsErrors).length > 0) {
        console.warn('Some stats failed to load:', result.statsErrors)
      }
    }
  } catch (err) {
    error.value = `Failed to load data: ${err.message || 'Unknown error'}`
    console.error('Failed to load lists:', err)
  } finally {
    loadingLists.value = false
  }
}

const loadWebhooks = async (forceRefresh = false) => {
  if (dataStore.lists.length === 0) return
  
  // Ensure we have a client ID
  if (!authStore.clientId) {
    error.value = 'Client ID is required to load webhooks'
    return
  }
  
  const clientIdToUse = authStore.clientId
  
  loadingWebhooks.value = true
  error.value = ''
  
  try {
    const result = await dataStore.loadWebhooksIfNeeded(apiClient, clientIdToUse, forceRefresh)
    
    if (result.fromCache) {
    } else if (result.inProgress) {
    } else {
      
      // Handle any errors
      if (result.errors && Object.keys(result.errors).length > 0) {
        console.warn('Some webhooks failed to load:', result.errors)
      }
    }
  } catch (err) {
    error.value = 'Failed to load webhooks'
    console.error('Failed to load webhooks:', err)
  } finally {
    loadingWebhooks.value = false
  }
}

const handleAddWebhook = (listId) => {
  editingWebhook.value = null
  webhookListId.value = listId
  showWebhookModal.value = true
}

const handleEditWebhook = ({ listId, webhook }) => {
  editingWebhook.value = webhook
  webhookListId.value = listId
  showWebhookModal.value = true
}

const handleDeleteWebhook = async ({ listId, webhookId }) => {
  if (!confirm('Are you sure you want to delete this webhook? This action cannot be undone.')) {
    return
  }
  
  try {
    await apiClient.deleteWebhook(listId, webhookId)
    dataStore.removeWebhook(listId, webhookId)
  } catch (err) {
    error.value = 'Failed to delete webhook'
    console.error('Failed to delete webhook:', err)
  }
}

const handleSaveWebhook = async ({ listId, webhookData, webhook }) => {
  try {
    if (webhook) {
      // Edit existing webhook
      const updatedWebhook = await apiClient.updateWebhook(listId, webhook.WebhookID, webhookData)
      dataStore.updateWebhook(listId, webhook.WebhookID, updatedWebhook)
    } else {
      // Create new webhook
      const webhookId = await apiClient.createWebhook(listId, webhookData)
      // Campaign Monitor API returns just the webhook ID string, so we need to construct the full object
      const newWebhook = {
        WebhookID: webhookId,
        Url: webhookData.Url,
        Events: webhookData.Events,
        PayloadFormat: webhookData.PayloadFormat,
        Status: 'Active' // New webhooks are active by default
      }
      dataStore.addWebhook(listId, newWebhook)
    }
  } catch (err) {
    error.value = 'Failed to save webhook'
    console.error('Failed to save webhook:', err)
    throw err // Re-throw to let modal handle loading state
  }
}

const expandAll = () => {
  allExpanded.value = true
  // Reset to null after a short delay to allow individual control again
  setTimeout(() => {
    allExpanded.value = null
  }, 100)
}

const collapseAll = () => {
  allExpanded.value = false
  // Reset to null after a short delay to allow individual control again
  setTimeout(() => {
    allExpanded.value = null
  }, 100)
}

const initialLoad = async (forceRefresh = false) => {
  if (!authStore.hasValidAuth) {
    error.value = 'Please provide a valid API key'
    return
  }
  
  // For account-level keys, require client selection
  if (authStore.isAccountLevel && !authStore.clientId) {
    error.value = 'Please select a client first'
    return
  }
  
  // For client-level keys, require client ID
  if (authStore.isClientLevel && !authStore.clientId) {
    error.value = 'Client ID is required'
    return
  }
  
  const clientIdToUse = authStore.clientId
  
  // Clear cache if client has changed
  dataStore.clearCacheForClientSwitch(clientIdToUse)
  
  error.value = ''
  
  try {
    const result = await dataStore.loadInitialData(apiClient, clientIdToUse, forceRefresh)
    
    if (result.inProgress) {
      return
    }
    
    if (result.fromCache) {
    } else {
      
      // Handle any errors from stats or webhooks
      if (result.lists?.statsErrors && Object.keys(result.lists.statsErrors).length > 0) {
        console.warn('Some stats failed to load:', result.lists.statsErrors)
      }
      if (result.webhooks?.errors && Object.keys(result.webhooks.errors).length > 0) {
        console.warn('Some webhooks failed to load:', result.webhooks.errors)
      }
    }
  } catch (err) {
    error.value = `Failed to load data: ${err.message || 'Unknown error'}`
    console.error('Failed to load initial data:', err)
  }
}

// Watch for client changes to trigger cache invalidation
watch(
  () => authStore.clientId,
  (newClientId, oldClientId) => {
    
    // Handle both initial client selection (oldClientId is null) and client changes
    if (newClientId && newClientId !== oldClientId) {
      
      // Always clear data and cancel requests when client changes to ensure fresh data
      if (oldClientId) {
        dataStore.clearData()
        apiClient.cancelRequestsForClient(oldClientId)
      }
      
      if (authStore.hasValidAuth) {
        initialLoad()
      } else {
      }
    }
  }
)

// Watch for API key changes to trigger cache invalidation
watch(
  () => authStore.apiKey,
  (newKey, oldKey) => {
    if (newKey && oldKey && newKey !== oldKey) {
      dataStore.clearData()
      if (authStore.hasValidAuth) {
        initialLoad()
      }
    }
  }
)

// Removed client-changed event listener - now handled by watcher

// Load lists and webhooks automatically when authenticated
onMounted(() => {
  if (authStore.hasValidAuth && authStore.clientId) {
    
    // Only load if we don't have valid cached data
    const needsListsLoad = dataStore.shouldLoadData('lists', authStore.clientId)
    const needsWebhooksLoad = dataStore.shouldLoadData('webhooks', authStore.clientId)
    
    if (needsListsLoad || needsWebhooksLoad) {
      initialLoad()
    } else {
    }
  }
  
  // Client change events now handled by watcher
  
  // Start background refresh when authenticated
  if (authStore.hasValidAuth) {
    startBackgroundRefresh()
  }
})

onUnmounted(() => {
  // Stop background refresh
  stopBackgroundRefresh()
})

// Watch for authentication changes to manage background refresh
watch(
  () => authStore.hasValidAuth,
  (hasAuth) => {
    if (hasAuth) {
      startBackgroundRefresh()
    } else {
      stopBackgroundRefresh()
    }
  }
)


// Background refresh for aging data
const checkAndRefreshAgingData = async () => {
  if (!authStore.hasValidAuth || !authStore.clientId) return
  
  const clientId = authStore.clientId
  const currentStatus = {
    lists: dataStore.getCacheStatus('lists', clientId),
    webhooks: dataStore.getCacheStatus('webhooks', clientId)
  }
  
  // Refresh aging or expired data silently in the background
  if (currentStatus.lists === 'aging' || currentStatus.lists === 'expired') {
    try {
      await loadLists(true) // Force refresh for aging data
    } catch (err) {
      console.warn('Background refresh failed for lists:', err)
    }
  }
  
  if (currentStatus.webhooks === 'aging' || currentStatus.webhooks === 'expired') {
    try {
      await loadWebhooks(true) // Force refresh for aging data
    } catch (err) {
      console.warn('Background refresh failed for webhooks:', err)
    }
  }
}

// Set up periodic background refresh
let backgroundRefreshInterval = null

const startBackgroundRefresh = () => {
  if (backgroundRefreshInterval) {
    clearInterval(backgroundRefreshInterval)
  }
  
  // Check every 2 minutes for aging data
  backgroundRefreshInterval = setInterval(checkAndRefreshAgingData, 120000)
}

const stopBackgroundRefresh = () => {
  if (backgroundRefreshInterval) {
    clearInterval(backgroundRefreshInterval)
    backgroundRefreshInterval = null
  }
}
</script>