import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // IMPORTANTE: cambia 'lotto-ecuador' por el nombre exacto de tu repo en GitHub
  base: '/claude-lot/',
});
