import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],

  server: {
    proxy: {
      "/api/clova": {
        target: "https://clovastudio.stream.ntruss.com",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/clova/, ""),
      },
    },
  },
})
