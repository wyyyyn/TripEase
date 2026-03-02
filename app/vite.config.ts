import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // 把前端发出的 /api 请求转发到后端 3001 端口
    // 类比：前台（前端 5173）收到客人的请求后，转交给后厨（后端 3001）处理
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
    },
  },
})
