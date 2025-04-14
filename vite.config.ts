import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 对于个人GitHub Pages (<username>.github.io)，base应该是 '/'
  base: '/',
}) 