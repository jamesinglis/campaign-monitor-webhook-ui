<template>
  <div class="relative">
    <button
      @click="showDropdown = !showDropdown"
      class="flex items-center px-3 py-1 text-blue-100 hover:text-blue-900 hover:bg-white hover:bg-opacity-90 rounded-lg transition-colors duration-200 text-sm"
    >
      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      <span class="max-w-32 truncate">{{ selectedClientName || authStore.clientId }}</span>
      <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    
    <!-- Dropdown -->
    <div v-if="showDropdown" class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
      <div class="p-3">
        <!-- Filter Input -->
        <div v-if="clients.length > 0" class="mb-3">
          <label class="block text-xs font-medium text-gray-700 mb-1">Filter Clients</label>
          <input
            v-model="filterText"
            type="text"
            placeholder="Search clients..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <!-- Client List -->
        <div v-if="filteredClients.length > 0" class="mb-2">
          <label class="block text-xs font-medium text-gray-700 mb-1">Available Clients</label>
          <div class="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
            <button
              v-for="client in filteredClients"
              :key="client.ClientID"
              @click="selectClient(client.ClientID)"
              :class="[
                'w-full text-left px-3 py-3 text-sm transition-colors duration-200 first:rounded-t-md last:rounded-b-md',
                client.ClientID === authStore.clientId
                  ? 'bg-blue-100 text-blue-900'
                  : 'hover:bg-gray-100 text-gray-700'
              ]"
            >
              <div class="font-medium">{{ client.Name }}</div>
              <div class="text-xs text-gray-500">{{ client.ClientID }}</div>
            </button>
          </div>
        </div>
        
        <!-- Load Clients Button -->
        <button
          @click="loadClients"
          :disabled="loading"
          class="w-full flex items-center justify-center px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200"
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
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useDataStore } from '../stores/data'
import apiClient from '../services/api'

const authStore = useAuthStore()
const dataStore = useDataStore()

const showDropdown = ref(false)
const clients = ref([])
const loading = ref(false)
const filterText = ref('')

const selectedClientName = computed(() => {
  const client = clients.value.find(c => c.ClientID === authStore.clientId)
  return client?.Name || null
})

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

const loadClients = async () => {
  if (!authStore.isAccountLevel) return
  
  loading.value = true
  try {
    const clientData = await apiClient.getAccountClients()
    clients.value = clientData || []
    
    // Don't auto-select - let user choose their client manually
  } catch (error) {
    console.error('Failed to load clients:', error)
  } finally {
    loading.value = false
  }
}

const selectClient = (clientId) => {
  if (!clientId?.trim()) return
  
  const newClientId = clientId.trim()
  
  // Only proceed if client actually changed
  if (newClientId === authStore.clientId) {
    showDropdown.value = false
    filterText.value = ''
    return
  }
  
  authStore.setClientId(newClientId)
  showDropdown.value = false
  filterText.value = ''
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (!event.target.closest('.relative')) {
    showDropdown.value = false
    filterText.value = ''
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  // Auto-load clients on mount
  if (authStore.isAccountLevel) {
    loadClients()
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>