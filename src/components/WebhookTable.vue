<template>
  <div class="overflow-hidden">
    <div v-if="webhooks.length === 0" class="text-center py-8">
      <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No webhooks</h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating a new webhook.</p>
    </div>
    
    <div v-else class="overflow-x-auto">
      <table class="min-w-full">
        <thead>
          <tr class="border-b border-gray-200 dark:border-gray-700">
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              URL
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Events
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Format
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Status
            </th>
            <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr 
            v-for="webhook in webhooks" 
            :key="webhook.WebhookID"
            class="hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <td class="px-4 py-3">
              <div class="flex items-center">
                <div class="flex-shrink-0 w-2 h-2 bg-green-400 dark:bg-green-500 rounded-full mr-3"></div>
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {{ truncateUrl(webhook.Url) }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ webhook.Url }}
                  </p>
                </div>
              </div>
            </td>
            
            <td class="px-4 py-3">
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="event in webhook.Events"
                  :key="event"
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  :class="getEventBadgeClass(event)"
                >
                  {{ event }}
                </span>
              </div>
            </td>
            
            <td class="px-4 py-3">
              <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                {{ webhook.PayloadFormat.toUpperCase() }}
              </span>
            </td>
            
            <td class="px-4 py-3">
              <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                Active
              </span>
            </td>
            
            <td class="px-4 py-3 text-right text-sm font-medium">
              <div class="flex justify-end space-x-2">
                <button
                  @click="$emit('edit-webhook', { listId, webhook })"
                  class="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                  title="Edit webhook"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                
                <button
                  @click="$emit('delete-webhook', { listId, webhookId: webhook.WebhookID })"
                  class="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                  title="Delete webhook"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
defineProps({
  webhooks: {
    type: Array,
    required: true
  },
  listId: {
    type: String,
    required: true
  }
})

defineEmits(['edit-webhook', 'delete-webhook'])

const truncateUrl = (url) => {
  if (url.length <= 50) return url
  const parsed = new URL(url)
  return `${parsed.hostname}${parsed.pathname.substring(0, 20)}...`
}

const getEventBadgeClass = (event) => {
  switch (event) {
    case 'Subscribe':
      return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
    case 'Unsubscribe':
      return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
    case 'Deactivate':
      return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
    default:
      return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
  }
}
</script>