import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // honor the harness-assigned port (falls back to Vite's default 5173)
    port: Number(process.env.PORT) || 5173,
  },
})
