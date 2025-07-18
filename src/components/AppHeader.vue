<template>
  <header class="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-gray-800 dark:to-gray-900 shadow-lg">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center">
          <div class="flex-shrink-0 flex items-center">
            <div class="bg-white bg-opacity-20 rounded-lg p-2 mr-3">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h1 class="text-xl font-bold text-white">
                Campaign Monitor
              </h1>
              <p class="text-sm text-blue-100">
                Webhook Management
              </p>
            </div>
          </div>
        </div>
        
        <div class="flex items-center space-x-4">
          <!-- Client Switcher for Account-Level Keys -->
          <div v-if="authStore.isAccountLevel && authStore.clientId" class="text-sm">
            <ClientSwitcher />
          </div>
          
          <div v-if="authStore.isAuthenticated" class="text-sm">
            <span v-if="authStore.isAccountLevel" class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-400 text-green-900">
              Account Level
            </span>
            <span v-else class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-400 text-blue-900">
              Client Level
            </span>
          </div>
          
          <!-- Dark Mode Toggle -->
          <DarkModeToggle />
          
          <button
            v-if="authStore.isAuthenticated"
            @click="handleLogout"
            class="flex items-center px-3 py-1 text-blue-100 hover:text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors duration-200 text-sm"
          >
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'
import { useDataStore } from '../stores/data'
import ClientSwitcher from './ClientSwitcher.vue'
import DarkModeToggle from './DarkModeToggle.vue'

const authStore = useAuthStore()
const dataStore = useDataStore()

const handleLogout = () => {
  authStore.logout()
  dataStore.clearData()
}
</script>