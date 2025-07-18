<template>
  <div class="space-y-6">
    <div>
      <label for="apiKey" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
        Campaign Monitor API Key
      </label>
      <div class="relative">
        <input
          id="apiKey"
          v-model="localApiKey"
          :type="showApiKey ? 'text' : 'password'"
          class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          placeholder="Enter your Campaign Monitor API key"
          @blur="validateApiKey"
        />
        <button
          type="button"
          @click="showApiKey = !showApiKey"
          class="absolute right-3 top-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
        >
          <svg v-if="showApiKey" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.05 8.05m1.828 1.828l4.242 4.242M8.05 8.05a5.971 5.971 0 00-.787 1.467M8.05 8.05C8.04 8.031 8.03 8.012 8.02 7.993m4.99 4.99l4.242 4.242M15.01 15.01a3 3 0 01-4.243-4.243m4.243 4.243L16.838 16.838m-1.828-1.828l-4.242-4.242m4.242 4.242L15.01 15.01" />
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
      </div>
      <p v-if="error" class="mt-2 text-sm text-red-600 flex items-center">
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {{ error }}
      </p>
    </div>
    
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
      <button
        @click="showHelpModal = true"
        class="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
      >
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Where do I find my API key?
      </button>
      
      <button
        @click="saveApiKey"
        :disabled="!localApiKey || loading"
        class="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
      >
        <span v-if="loading" class="flex items-center">
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Validating...
        </span>
        <span v-else class="flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Save API Key
        </span>
      </button>
    </div>
    
    <!-- Help Modal -->
    <div v-if="showHelpModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 transform transition-all">
        <div class="p-6">
          <div class="flex items-center mb-6">
            <div class="bg-blue-100 rounded-full p-2 mr-3">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900">Finding Your API Key</h3>
          </div>
          
          <div class="space-y-6 text-sm">
            <div class="bg-green-50 rounded-lg p-4">
              <p class="font-semibold text-green-800 mb-2">Account-level API key:</p>
              <ol class="list-decimal list-inside space-y-1 ml-2 text-green-700">
                <li>Log into your Campaign Monitor account</li>
                <li>Go to Account Settings → API Keys</li>
                <li>Copy your API key</li>
              </ol>
            </div>
            
            <div class="bg-blue-50 rounded-lg p-4">
              <p class="font-semibold text-blue-800 mb-2">Client-level API key:</p>
              <ol class="list-decimal list-inside space-y-1 ml-2 text-blue-700">
                <li>Log into your Campaign Monitor account</li>
                <li>Select your client</li>
                <li>Go to Settings → API Keys</li>
                <li>Copy your API key and note the Client ID</li>
              </ol>
            </div>
          </div>
          
          <div class="mt-8 flex justify-end">
            <button
              @click="showHelpModal = false"
              class="px-6 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

const localApiKey = ref(authStore.apiKey || '')
const showApiKey = ref(false)
const showHelpModal = ref(false)
const loading = ref(false)
const error = ref('')

const validateApiKey = () => {
  if (!localApiKey.value) {
    error.value = 'API key is required'
    return false
  }
  
  if (localApiKey.value.length < 20) {
    error.value = 'API key appears to be too short'
    return false
  }
  
  error.value = ''
  return true
}

const saveApiKey = async () => {
  if (!validateApiKey()) return
  
  loading.value = true
  error.value = ''
  
  try {
    authStore.setApiKey(localApiKey.value)
    
    // Validate the API key with the Campaign Monitor API
    const isValid = await authStore.validateApiKey()
    
    if (!isValid) {
      error.value = 'Invalid API key. Please check your key and try again.'
      authStore.logout()
      localApiKey.value = '' // Clear the local input
    }
  } catch (err) {
    error.value = 'Failed to validate API key. Please try again.'
    authStore.logout()
    localApiKey.value = '' // Clear the local input
  } finally {
    loading.value = false
  }
}
</script>