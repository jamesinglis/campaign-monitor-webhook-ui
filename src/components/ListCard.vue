<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
    <div class="p-6">
      <div class="flex items-center justify-between">
        <div class="flex-1 min-w-0">
          <h3 class="text-lg font-medium text-gray-900 truncate">
            {{ list.Name }}
          </h3>
        </div>
        
        <div class="flex items-center space-x-2">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {{ webhookCount }} {{ webhookCount === 1 ? 'webhook' : 'webhooks' }}
          </span>
          
          <button
            @click="toggleExpanded"
            class="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <svg 
              class="w-5 h-5 transition-transform duration-200"
              :class="{ 'rotate-180': expanded }"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
      
      <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div>
          <span class="text-gray-500">List ID:</span>
          <span class="ml-2 font-mono text-gray-900">{{ list.ListID }}</span>
        </div>
        <div>
          <span class="text-gray-500">Confirmed Subscribers:</span>
          <span class="ml-2 font-semibold text-gray-900">{{ list.TotalActiveSubscribers || 0 }}</span>
        </div>
      </div>
    </div>
    
    <!-- Expanded content -->
    <div 
      v-if="expanded"
      class="border-t border-gray-200 bg-gray-50"
    >
      <div class="p-6">
        <div class="flex items-center justify-between mb-4">
          <h4 class="text-lg font-medium text-gray-900">Webhooks</h4>
          <button
            @click="$emit('add-webhook', list.ListID)"
            class="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Webhook
          </button>
        </div>
        
        <WebhookTable
          :webhooks="webhooks"
          :list-id="list.ListID"
          @edit-webhook="$emit('edit-webhook', $event)"
          @delete-webhook="$emit('delete-webhook', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import WebhookTable from './WebhookTable.vue'

const props = defineProps({
  list: {
    type: Object,
    required: true
  },
  webhooks: {
    type: Array,
    default: () => []
  },
  forceExpanded: {
    type: Boolean,
    default: null
  }
})

defineEmits(['add-webhook', 'edit-webhook', 'delete-webhook'])

const expanded = ref(false)

const webhookCount = computed(() => props.webhooks.length)

const toggleExpanded = () => {
  expanded.value = !expanded.value
}

// Watch for external expansion control
watch(() => props.forceExpanded, (newValue) => {
  if (newValue !== null) {
    expanded.value = newValue
  }
})
</script>