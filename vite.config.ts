import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  base: './',
  plugins: [
    vue(),
    tailwindcss(),
    AutoImport({
      imports: ['vue'],
      dts: 'src/auto-imports.d.ts',
      vueTemplate: true,
    }),
  ],
})
