import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: '.', // raiz do projeto onde está o index.html
  build: {
    outDir: 'dist'
  }
})
