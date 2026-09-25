import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'

// from `VITE_API_URL` (see `src/api/`), so no proxy is involved.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = env.VITE_DEV_PROXY ?? 'http://127.0.0.1:8000'
  return {
    plugins: [tailwindcss(), react()],
    server: {
      proxy: {
        '/system': { target: proxyTarget, changeOrigin: true },
        '/api': { target: proxyTarget, changeOrigin: true },
      },
    },
    preview: {
      proxy: {
        '/system': { target: proxyTarget, changeOrigin: true },
        '/api': { target: proxyTarget, changeOrigin: true },
      },
    },
  }
})
