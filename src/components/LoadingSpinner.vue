<template>
  <div class="flex items-center justify-center" :class="containerClass">
    <svg 
      class="animate-spin text-blue-600" 
      :class="spinnerClass"
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        class="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        stroke-width="4"
      ></circle>
      <path 
        class="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
    <span v-if="message" class="ml-2 text-gray-600" :class="textClass">
      {{ message }}
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  message: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'medium', // small, medium, large
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  fullScreen: {
    type: Boolean,
    default: false
  }
})

const spinnerClass = computed(() => {
  switch (props.size) {
    case 'small':
      return 'w-4 h-4'
    case 'large':
      return 'w-12 h-12'
    default:
      return 'w-8 h-8'
  }
})

const textClass = computed(() => {
  switch (props.size) {
    case 'small':
      return 'text-sm'
    case 'large':
      return 'text-lg'
    default:
      return 'text-base'
  }
})

const containerClass = computed(() => {
  return props.fullScreen ? 'min-h-screen' : 'py-8'
})
</script>