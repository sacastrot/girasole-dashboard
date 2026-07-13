import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// La propiedad `base` debe coincidir con el nombre del repositorio cuando se
// publica como GitHub Project Page (https://usuario.github.io/nombre-repo/).
// Se configura mediante la variable de entorno VITE_BASE_PATH.
// En desarrollo local, si no se define, se usa '/'.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const basePath = env.VITE_BASE_PATH || '/'

  return {
    base: basePath,
    plugins: [vue()],
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            echarts: ['echarts'],
            leaflet: ['leaflet'],
            'tanstack-table': ['@tanstack/vue-table'],
          },
        },
      },
    },
    server: {
      port: 5173,
    },
  }
})
