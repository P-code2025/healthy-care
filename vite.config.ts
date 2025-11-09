import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],

  // ✅ Thêm phần này để proxy request ClovaX
  server: {
    proxy: {
      "/api/clova": {
        target: "https://clovastudio.stream.ntruss.com",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/clova/, ""), // bỏ tiền tố /api/clova
      },
    },
  },
})
