// `defineConfig` sale de vitest/config, no de vite: es el mismo tipo de Vite
// mas la clave `test`, y asi la config de build y la de tests viven juntas sin
// duplicar los alias.
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
      '@features': fileURLToPath(new URL('./src/features', import.meta.url)),
      '@app': fileURLToPath(new URL('./src/app', import.meta.url)),
      '@contracts': fileURLToPath(new URL('./src/shared/contracts.ts', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    // El front nunca guarda el token del closer: la sesion va en cookie
    // httpOnly. El proxy mantiene mismo origen en dev para que la cookie viaje.
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    setupFiles: ['./src/shared/test/setup.ts'],
    // Sin esto, happy-dom intenta cargar de verdad el `src` de cualquier
    // <iframe> montado en un test (p. ej. `LessonVideoPlayer`), disparando
    // una peticion de red real contra un tercero — lento, flaky y sin
    // sentido en un test unitario.
    environmentOptions: {
      happyDOM: {
        settings: {
          navigation: {
            disableChildFrameNavigation: true,
          },
        },
      },
    },
  },
});
