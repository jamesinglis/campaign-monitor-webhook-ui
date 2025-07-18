<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full mx-4 transform transition-all">
      <div class="p-6">
        <div class="flex items-center mb-6">
          <div class="bg-blue-100 dark:bg-blue-900 rounded-full p-2 mr-3">
            <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100">
            {{ isEdit ? 'Edit Webhook' : 'Add Webhook' }}
          </h3>
        </div>
        
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- URL Field -->
          <div>
            <label for="webhook-url" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Webhook URL
            </label>
            <input
              id="webhook-url"
              v-model="form.url"
              type="url"
              required
              placeholder="https://your-domain.com/webhook"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-500': errors.url }"
            />
            <p v-if="errors.url" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors.url }}</p>
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Must be a valid HTTPS URL</p>
          </div>
          
          <!-- Events Field -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Events to Subscribe To
            </label>
            <div class="space-y-2">
              <label v-for="event in availableEvents" :key="event.value" class="flex items-center">
                <input
                  v-model="form.events"
                  type="checkbox"
                  :value="event.value"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                />
                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">{{ event.label }}</span>
                <span class="ml-2 text-xs text-gray-500 dark:text-gray-400">({{ event.description }})</span>
              </label>
            </div>
            <p v-if="errors.events" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors.events }}</p>
          </div>
          
          <!-- Payload Format Field -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Payload Format
            </label>
            <div class="space-y-2">
              <label class="flex items-center">
                <input
                  v-model="form.payloadFormat"
                  type="radio"
                  value="json"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                />
                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">JSON</span>
                <span class="ml-2 text-xs text-gray-500 dark:text-gray-400">(Recommended)</span>
              </label>
              <label class="flex items-center">
                <input
                  v-model="form.payloadFormat"
                  type="radio"
                  value="xml"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                />
                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">XML</span>
              </label>
            </div>
            <p v-if="errors.payloadFormat" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors.payloadFormat }}</p>
          </div>
          
          <div class="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              @click="$emit('close')"
              class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
            >
              <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ loading ? 'Saving...' : (isEdit ? 'Update Webhook' : 'Create Webhook') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  webhook: {
    type: Object,
    default: null
  },
  listId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['close', 'save'])

const loading = ref(false)
const errors = ref({})

const availableEvents = [
  { value: 'Subscribe', label: 'Subscribe', description: 'User subscribes to list' },
  { value: 'Unsubscribe', label: 'Unsubscribe', description: 'User unsubscribes from list' },
  { value: 'Deactivate', label: 'Deactivate', description: 'User is deactivated' }
]

const form = reactive({
  url: '',
  events: [],
  payloadFormat: 'json'
})

const isEdit = computed(() => props.webhook !== null)

// Reset form when modal opens/closes or webhook changes
watch([() => props.isOpen, () => props.webhook], () => {
  if (props.isOpen) {
    resetForm()
  }
})

const resetForm = () => {
  errors.value = {}
  if (props.webhook) {
    // Edit mode - populate form with existing webhook data
    form.url = props.webhook.Url || ''
    form.events = props.webhook.Events || []
    // Convert Campaign Monitor's "Json"/"Xml" to lowercase for form
    form.payloadFormat = (props.webhook.PayloadFormat || 'json').toLowerCase()
  } else {
    // Add mode - reset to defaults
    form.url = ''
    form.events = []
    form.payloadFormat = 'json'
  }
}

const validateForm = () => {
  errors.value = {}
  
  // Validate URL
  if (!form.url) {
    errors.value.url = 'URL is required'
  } else if (!form.url.startsWith('https://')) {
    errors.value.url = 'URL must use HTTPS'
  } else {
    try {
      new URL(form.url)
    } catch {
      errors.value.url = 'Please enter a valid URL'
    }
  }
  
  // Validate events
  if (form.events.length === 0) {
    errors.value.events = 'At least one event must be selected'
  }
  
  // Validate payload format
  if (!form.payloadFormat) {
    errors.value.payloadFormat = 'Payload format is required'
  }
  
  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }
  
  loading.value = true
  
  try {
    const webhookData = {
      Url: form.url,
      Events: form.events,
      // Convert back to Campaign Monitor's expected format (capitalize first letter)
      PayloadFormat: form.payloadFormat.charAt(0).toUpperCase() + form.payloadFormat.slice(1)
    }
    
    await emit('save', {
      listId: props.listId,
      webhookData,
      webhook: props.webhook // Include original webhook for edit operations
    })
    
    emit('close')
  } catch (error) {
    console.error('Error saving webhook:', error)
    errors.value.submit = error.message || 'Failed to save webhook'
  } finally {
    loading.value = false
  }
}
</script>