import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 3000,
    proxy: {
      '/mta-feed': {
        target: 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/mta-feed/, ''),
      },
    },
  },
});
