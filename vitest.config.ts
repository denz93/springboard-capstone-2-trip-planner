import { defineConfig } from 'vitest/config'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: '.env.test.local' })
export default defineConfig({
  test: {
    // ... Specify options here.
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

})