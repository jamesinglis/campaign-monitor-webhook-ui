import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'fs'
import path from 'path'

// Custom plugin to write hot file (similar to Laravel)
function hotFilePlugin() {
  let resolvedConfig
  const hotFile = path.join(process.cwd(), 'hot')
  
  return {
    name: 'hot-file',
    configResolved(config) {
      resolvedConfig = config
    },
    configureServer(server) {
      server.httpServer?.once('listening', () => {
        const address = server.httpServer?.address()
        if (typeof address === 'object' && address !== null) {
          const protocol = resolvedConfig.server.https ? 'https' : 'http'
          const host = address.address === '::' || address.address === '0.0.0.0' 
            ? 'localhost' 
            : address.address
          const port = address.port
          const devServerUrl = `${protocol}://${host}:${port}`
          
          // Write the dev server URL to hot file
          fs.writeFileSync(hotFile, devServerUrl)
          console.log(`\n  Dev server URL written to hot file: ${devServerUrl}\n`)
        }
      })
      
      // Clean up hot file on exit
      const cleanup = () => {
        if (fs.existsSync(hotFile)) {
          fs.rmSync(hotFile)
        }
      }
      process.once('SIGTERM', cleanup)
      process.once('SIGINT', cleanup)
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), hotFilePlugin()],
  server: {
    host: true, // Listen on all network interfaces
    port: 5173,
    strictPort: true,
    hmr: false, // Disable HMR for now
    cors: {
      origin: /https:\/\/.*\.ddev\.site(:\d+)?$/
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    manifest: true,
    rollupOptions: {
      input: 'src/main.js',
      output: {
        manualChunks: {
          vendor: ['vue', 'pinia', 'axios'],
          ui: ['pinia-plugin-persistedstate']
        }
      }
    }
  },
  base: '/'
})