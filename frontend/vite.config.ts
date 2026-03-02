import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// 🔍 Debug environment variables at build time
console.log('\n🔧 VITE CONFIG DEBUG');
console.log('📌 process.env.VITE_API_URL:', process.env.VITE_API_URL);
console.log('📌 process.env.NODE_ENV:', process.env.NODE_ENV);
console.log('🔧 ================\n');

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'build',
    sourcemap: true,
    chunkSizeWarningLimit: 1000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // 🔥 CRITICAL: Define environment variables for the client
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'https://communityhub-09ib.onrender.com/api')
  }
})