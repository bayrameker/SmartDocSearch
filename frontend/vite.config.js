import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    host: '0.0.0.0',
    port: 5000,
    strictPort: true,
    hmr: {
      clientPort: 443
    },
    cors: true,
    allowedHosts: [
      'localhost',
      '627fd322-c460-4889-b148-fc58fe628c69-00-3ui7y5efzujue.spock.replit.dev',
      '*.replit.dev'
    ]
  }
});