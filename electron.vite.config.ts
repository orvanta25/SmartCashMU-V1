import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        external: [
          // Modules Node.js natifs
          'fs', 'path', 'crypto', 'os', 'http', 'https', 'stream', 'buffer', 'util', 'events', 'net', 'tls',
          // Modules npm spécifiques
          'electron',
          '@electron-toolkit/preload',
          '@electron-toolkit/utils',
          '@prisma/client',
          'prisma',
          'axios',
          'dotenv',
          'express',
          'express-session',
          'cors',
          'jsonwebtoken',
          'bcrypt',
          'bcryptjs',
          'helmet',
          'compression',
          'winston',
          'uuid',
          'moment',
          'pdf-to-printer',
          'pdf-lib',
          'zod'
        ]
      }
    }
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
          activation: resolve(__dirname, 'src/renderer/activation.html')
        }
      },
      outDir: 'out/renderer'
    }
  }
})
