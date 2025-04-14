import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 如果要部署到GitHub Pages，请取消下面一行的注释并替换为您的仓库名
  base: '/games-demo/',
}) 