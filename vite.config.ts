
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 'base: ./' es CRÍTICO para Hostinger si subes la app a una subcarpeta
  base: './',
  server: {
    // No proxy needed - using Supabase directly
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    emptyOutDir: true,
  },
  define: {
    'process.env': {}
  }
});
