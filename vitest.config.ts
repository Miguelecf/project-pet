/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // Domain and infrastructure tests stay in Node. UI tests explicitly select
    // jsdom with the @vitest-environment pragma in their test file.
    environment: 'node',
    // Per A0.4 / strict-tdd policy: disallow .only so a focused test cannot
    // accidentally ship as the canonical run.
    allowOnly: false,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.{test,spec}.{ts,tsx}', 'src/main.tsx'],
    },
  },
})
