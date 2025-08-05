import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: path => path.replace(/^\/api/, ''),
      },
    },
  },
  define: {
    __VUE_PROD_DEVTOOLS__: false,
    __VUE_OPTIONS_API__: true,
  },
})
