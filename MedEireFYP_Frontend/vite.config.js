import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import { config } from 'dotenv';
config();


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "devextreme/ui": "devextreme/esm/ui",
    },
  },
  build: {
    rollupOptions: {
      treeshake: false,
    },
  },
})

