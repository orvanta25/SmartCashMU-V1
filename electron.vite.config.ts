import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [react()],
    css: {
      postcss: './postcss.config.js'
    },
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'src/renderer/index.html'),
          activation: resolve(__dirname, 'src/renderer/activation.html') // <-- add this
        }
      },
      outDir: 'out/renderer'
    }
  }
})
