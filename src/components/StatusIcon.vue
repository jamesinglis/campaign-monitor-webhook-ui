<template>
  <div class="relative" @mouseenter="showPopover = true" @mouseleave="showPopover = false">
    <button
      :class="getStatusIconClass()"
      class="w-5 h-5 rounded-full flex items-center justify-center transition-colors duration-200 hover:scale-110"
      :title="`${type} status: ${statusText}`"
    >
      <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <circle cx="10" cy="10" r="8"/>
      </svg>
    </button>
    
    <!-- Popover -->
    <div
      v-if="showPopover"
      ref="popover"
      class="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
      @click.stop
    >
      <div class="p-3">
        <div class="mb-2">
          <h3 class="font-semibold text-gray-900 capitalize">{{ type }}</h3>
        </div>
        
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Status:</span>
            <span :class="getCacheStatusColor(status)" class="text-sm font-medium">
              {{ statusText }}
            </span>
          </div>
          
          <div v-if="age" class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Age:</span>
            <span class="text-sm text-gray-900">{{ formatCacheAge(age) }}</span>
          </div>
          
          <div v-if="lastUpdated" class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Updated:</span>
            <span class="text-sm text-gray-900">{{ formatDateTime(lastUpdated) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    default: null
  },
  lastUpdated: {
    type: Number,
    default: null
  }
})

const showPopover = ref(false)

const statusText = computed(() => {
  switch (props.status) {
    case 'fresh': return 'Fresh'
    case 'aging': return 'Aging'
    case 'expired': return 'Expired'
    case 'stale': return 'Stale'
    case 'client-mismatch': return 'Client Mismatch'
    case 'no-cache': return 'No Cache'
    default: return 'Unknown'
  }
})

const getStatusIconClass = () => {
  switch (props.status) {
    case 'fresh': return 'bg-green-100 text-green-600 hover:bg-green-200'
    case 'aging': return 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
    case 'expired': return 'bg-red-100 text-red-600 hover:bg-red-200'
    case 'stale': return 'bg-red-100 text-red-600 hover:bg-red-200'
    case 'client-mismatch': return 'bg-orange-100 text-orange-600 hover:bg-orange-200'
    default: return 'bg-gray-100 text-gray-600 hover:bg-gray-200'
  }
}

const getCacheStatusColor = (status) => {
  switch (status) {
    case 'fresh': return 'text-green-600'
    case 'aging': return 'text-yellow-600'
    case 'expired': return 'text-red-600'
    case 'stale': return 'text-red-600'
    case 'client-mismatch': return 'text-orange-600'
    default: return 'text-gray-600'
  }
}

const formatCacheAge = (age) => {
  if (!age) return null
  const seconds = Math.floor(age / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ago`
}

const formatDateTime = (timestamp) => {
  if (!timestamp) return null
  const date = new Date(timestamp)
  return date.toLocaleString()
}
</script>