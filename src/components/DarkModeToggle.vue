<template>
  <div class="relative">
    <button
      @click="handleClick"
      @mouseenter="showTooltip = true"
      @mouseleave="showTooltip = false"
      class="flex items-center px-3 py-1 text-blue-100 hover:text-blue-900 hover:bg-white hover:bg-opacity-20 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-600 rounded-lg transition-all duration-200 text-sm group"
      :aria-label="`Current theme: ${currentModeLabel}. Click to cycle through themes.`"
    >
      <!-- System Icon -->
      <svg
        v-if="themeStore.mode === 'system'"
        class="w-4 h-4 transition-transform duration-200 group-hover:scale-110"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
      
      <!-- Light Icon -->
      <svg
        v-else-if="themeStore.mode === 'light'"
        class="w-4 h-4 transition-transform duration-200 group-hover:scale-110"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
      
      <!-- Dark Icon -->
      <svg
        v-else
        class="w-4 h-4 transition-transform duration-200 group-hover:scale-110"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>
    </button>
    
    <!-- Tooltip -->
    <div
      v-if="showTooltip"
      class="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 text-xs font-medium text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 whitespace-nowrap z-50 transition-opacity duration-200"
      role="tooltip"
    >
      <div class="flex flex-col items-center">
        <div class="font-semibold">{{ currentModeLabel }}</div>
        <div class="text-gray-600 dark:text-gray-300 mt-1">{{ tooltipDescription }}</div>
      </div>
      <!-- Tooltip arrow -->
      <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white dark:bg-gray-800 border-l border-t border-gray-200 dark:border-gray-600 rotate-45"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useThemeStore } from '../stores/theme'

const themeStore = useThemeStore()
const showTooltip = ref(false)

const currentModeLabel = computed(() => {
  const labels = {
    system: 'System',
    light: 'Light',
    dark: 'Dark'
  }
  return labels[themeStore.mode] || 'System'
})

const tooltipDescription = computed(() => {
  const descriptions = {
    system: `Auto (currently ${themeStore.currentTheme})`,
    light: 'Always light theme',
    dark: 'Always dark theme'
  }
  return descriptions[themeStore.mode] || 'Auto theme'
})

const handleClick = () => {
  themeStore.cycleMode()
}
</script>