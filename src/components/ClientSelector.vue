<template>
  <div class="space-y-4">
    <!-- Client Dropdown for account-level keys -->
    <div v-if="authStore.isAccountLevel" class="space-y-2">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Select a client:
      </label>
      
      <!-- Filter Input -->
      <div v-if="clients.length > 0" class="mb-3">
        <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Filter Clients</label>
        <input
          v-model="filterText"
          type="text"
          placeholder="Search clients..."
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <!-- Client List -->
      <div v-if="filteredClients.length > 0" class="mb-2">
        <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Available Clients</label>
        <div class="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-md">
          <button
            v-for="client in filteredClients"
            :key="client.ClientID"
            @click="selectClient(client.ClientID)"
            :class="[
              'w-full text-left px-3 py-3 text-sm transition-colors duration-200 first:rounded-t-md last:rounded-b-md',
              client.ClientID === selectedClient
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            ]"
          >
            <div class="font-medium">{{ client.Name }}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">{{ client.ClientID }}</div>
          </button>
        </div>
      </div>
      
      <div v-else-if="!loading && clients.length === 0" class="text-sm text-gray-500 dark:text-gray-400">
        No clients found. Click "Load Clients" to refresh.
      </div>
      
      <!-- Load Clients Button -->
      <button
        @click="loadClients"
        :disabled="loading"
        class="w-full flex items-center justify-center px-3 py-2 text-sm bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 transition-colors duration-200"
      >
        <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        {{ loading ? 'Loading...' : 'Load Clients' }}
      </button>
    </div>
    
    <!-- Client ID Input for client-level keys -->
    <div v-if="authStore.isClientLevel" class="space-y-2">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Enter your Client ID:
      </label>
      <input
        v-model="clientIdInput"
        type="text"
        placeholder="Enter your Client ID (e.g., 1234567890abcdef)"
        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        @blur="validateClientId"
        @keypress.enter="setClientId"
      />
      <p v-if="clientIdError" class="text-sm text-red-600 dark:text-red-400">{{ clientIdError }}</p>
      <button
        @click="setClientId"
        :disabled="!clientIdInput || !!clientIdError"
        class="w-full flex items-center justify-center px-3 py-2 text-sm bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 transition-colors duration-200"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Set Client ID
      </button>
    </div>
    
    
    <!-- Info messages for different key types -->
    <div v-if="authStore.isAccountLevel" class="p-4 bg-green-50 dark:bg-green-900/20 rounded-md">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-green-400 dark:text-green-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-green-800 dark:text-green-200">
            You're using an account-level API key. Please select a client to manage its webhook subscriptions.
          </p>
        </div>
      </div>
    </div>
    
    <div v-if="authStore.isClientLevel" class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-blue-400 dark:text-blue-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-blue-800 dark:text-blue-200">
            You're using a client-level API key. Please enter your Client ID to manage webhook subscriptions.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useDataStore } from '../stores/data'
import apiClient from '../services/api'

const authStore = useAuthStore()
const dataStore = useDataStore()

const selectedClient = ref('')
const loading = ref(false)
const error = ref('')
const filterText = ref('')

// Client ID input for client-level keys
const clientIdInput = ref(authStore.clientId || '')
const clientIdError = ref('')

const clients = computed(() => dataStore.clients)

const filteredClients = computed(() => {
  if (!filterText.value.trim()) {
    return clients.value
  }
  
  const filter = filterText.value.toLowerCase()
  return clients.value.filter(client => 
    client.Name.toLowerCase().includes(filter) ||
    client.ClientID.toLowerCase().includes(filter)
  )
})


const selectClient = (clientId) => {
  if (!clientId?.trim()) return
  
  const newClientId = clientId.trim()
  
  // Only proceed if client actually changed
  if (newClientId === authStore.clientId) {
    selectedClient.value = newClientId
    return
  }
  
  selectedClient.value = newClientId
  authStore.setClientId(newClientId)
}

const loadClients = async () => {
  if (!authStore.isAccountLevel) return
  
  loading.value = true
  error.value = ''
  
  try {
    const result = await dataStore.loadClientsIfNeeded(apiClient)
    
    if (result.fromCache) {
    } else {
    }
    
    // Don't auto-select - let user choose their client manually
  } catch (err) {
    error.value = 'Failed to load clients'
    console.error('Failed to load clients:', err)
  } finally {
    loading.value = false
  }
}

// Client ID validation and setting for client-level keys
const validateClientId = () => {
  clientIdError.value = ''
  
  if (!clientIdInput.value) {
    clientIdError.value = 'Client ID is required'
    return false
  }
  
  if (clientIdInput.value.length < 8) {
    clientIdError.value = 'Client ID appears to be too short'
    return false
  }
  
  // Basic format validation - Campaign Monitor client IDs are typically alphanumeric
  if (!/^[a-zA-Z0-9]+$/.test(clientIdInput.value)) {
    clientIdError.value = 'Client ID should contain only letters and numbers'
    return false
  }
  
  return true
}

const setClientId = () => {
  if (!validateClientId()) return
  
  const newClientId = clientIdInput.value.trim()
  
  // Only proceed if client actually changed
  if (newClientId === authStore.clientId) {
    return
  }
  
  authStore.setClientId(newClientId)
}

// Load clients automatically if using account-level key
onMounted(() => {
  if (authStore.isAccountLevel && authStore.hasValidAuth) {
    loadClients()
  }
})
</script>