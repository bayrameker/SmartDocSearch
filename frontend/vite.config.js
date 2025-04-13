import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [sveltekit()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  optimizeDeps: {
    exclude: [
      '@sveltejs/kit',
      'chunk-OFUZV5SZ',
      'chunk-BVQOVANR'
    ]
  },
  build: {
    target: 'esnext',
    sourcemap: true
  },
  server: {
    host: '0.0.0.0',
    port: 5000,
    strictPort: true,
    hmr: {
      clientPort: 443
    },
    cors: true,
    proxy: {},
    allowedHosts: 'all',
    fs: {
      strict: false,
      allow: [
        './frontend',
        './',
        '../',
        '../../',
        '/home/runner/workspace'
      ]
    }
  }
});