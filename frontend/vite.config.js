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
    exclude: ['@sveltejs/kit']
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
    allowedHosts: [
      'localhost',
      '*.replit.dev',
      '*.repl.co',
      '627fd322-c460-4889-b148-fc58fe628c69-00-3ui7y5efzujue.spock.replit.dev'
    ],
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