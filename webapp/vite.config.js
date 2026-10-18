import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [react()],
  build: {
    outDir: mode === 'android' ? '../app/src/main/assets/www' : 'dist',
    emptyOutDir: true,
  },
}))
