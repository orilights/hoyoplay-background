import { Buffer } from 'node:buffer'
import path from 'node:path'
import process from 'node:process'
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
    {
      name: 'html-transform',
      apply: 'build',
      transformIndexHtml(html) {
        return html.replace(
          '</head>',
          `${Buffer.from(process.env.INJECT_HEAD_B || '', 'base64').toString('ascii')}</head>`,
        )
      },
    },
  ],
})
