import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/SAMGA-V3/',
  plugins: [react()],
  server: {
    watch: {
      usePolling: true
    }
  }
})
