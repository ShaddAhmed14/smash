import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx,js,jsx}'],
    css: false, // Disable CSS processing in tests
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  css: {
    postcss: {}, // Use empty PostCSS config for tests
  },
})
