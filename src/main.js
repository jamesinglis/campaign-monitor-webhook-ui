import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import './assets/main.css'
import { useThemeStore } from './stores/theme'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)
app.use(pinia)

// Initialize theme store after pinia is available
const themeStore = useThemeStore()
themeStore.initializeTheme()

app.mount('#app')