import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

export default defineConfig(({ mode }) => {
  console.log('\n🔍 ========== VITE BUILD DEBUG START ==========');
  console.log(`📌 Mode: ${mode}`);
  console.log(`📌 Current Directory: ${process.cwd()}`);
  
  // Check if .env files exist
  const envFiles = ['.env', '.env.production', '.env.development'];
  envFiles.forEach(file => {
    const exists = fs.existsSync(path.join(process.cwd(), file));
    console.log(`📁 ${file} exists: ${exists}`);
    if (exists) {
      const content = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
      console.log(`   Content: ${content.split('\n').filter(line => line.trim() && !line.startsWith('#')).join(' | ')}`);
    }
  });

  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '');
  
  console.log('\n🌍 Environment Variables:');
  console.log(`   • VITE_API_URL from loadEnv: ${env.VITE_API_URL || '❌ NOT SET'}`);
  console.log(`   • VITE_API_URL from process.env: ${process.env.VITE_API_URL || '❌ NOT SET'}`);
  
  // Check Render-specific env vars
  const renderVars = ['RENDER', 'RENDER_SERVICE_ID', 'RENDER_GIT_BRANCH', 'RENDER_GIT_COMMIT'];
  renderVars.forEach(v => {
    if (process.env[v]) {
      console.log(`   • ${v}: ${process.env[v]}`);
    }
  });

  // Check all VITE_ prefixed variables
  console.log('\n🔑 All VITE_ variables:');
  Object.keys(process.env)
    .filter(key => key.startsWith('VITE_'))
    .forEach(key => {
      console.log(`   • ${key}: ${process.env[key] ? '✅ SET' : '❌ NOT SET'}`);
    });

  // Verify the API URL specifically
  const apiUrl = env.VITE_API_URL || process.env.VITE_API_URL;
  console.log('\n🎯 Final API URL will be:', apiUrl || '❌ NOT SET - WILL USE FALLBACK');
  
  if (!apiUrl) {
    console.warn('⚠️ WARNING: VITE_API_URL is not set! The app will use localhost fallback!');
  }

  console.log('🔍 ========== VITE BUILD DEBUG END ==========\n');

  return {
    plugins: [react()],
    server: {
      port: 3000,
      open: true
    },
    build: {
      outDir: 'build',
      sourcemap: true, // Enable sourcemaps for better debugging
      chunkSizeWarningLimit: 1000,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    define: {
      // Explicitly define the env var for the client
      'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl || 'https://communityhub-09ib.onrender.com/api')
    }
  }
});