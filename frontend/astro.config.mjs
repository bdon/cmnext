import { defineConfig } from 'astro/config';
import solidJs from '@astrojs/solid-js';

export default defineConfig({
  integrations: [solidJs()],
  output: 'static',
  server: {
    port: 4321,
    host: true
  },
  vite: {
    define: {
      'import.meta.env.PUBLIC_API_URL': JSON.stringify(
        process.env.PUBLIC_API_URL || 'http://localhost:8000/api'
      )
    }
  }
});
