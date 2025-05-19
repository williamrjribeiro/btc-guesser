import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [preact()],
  root: 'src/web-ui',
  build: {
    sourcemap: true,
  },
});
