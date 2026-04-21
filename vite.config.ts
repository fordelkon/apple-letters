import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ command }) => ({
  plugins: [vue()],
  publicDir: command === 'serve' ? 'public' : false,
  resolve: {
    alias: {
      '@delkon/apple-letters': '/src/lib/index.ts',
    },
  },
  build: {
    lib: {
      entry: 'src/lib/index.ts',
      name: 'AppleLetters',
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs'),
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
}))
