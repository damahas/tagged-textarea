import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  if (mode === 'lib') {
    // 库模式打包配置
    return {
      plugins: [vue()],
      build: {
        lib: {
          entry: resolve(__dirname, 'src/index.js'),
          name: 'TagTextarea',
          fileName: (format) => `tag-textarea.${format}.js`,
          formats: ['es', 'umd']
        },
        rollupOptions: {
          external: ['vue'],
          output: {
            globals: {
              vue: 'Vue'
            },
            assetFileNames: (assetInfo) => {
              if (assetInfo.name === 'style.css') {
                return 'tag-textarea.css'
              }
              return assetInfo.name
            }
          }
        },
        cssCodeSplit: false
      }
    }
  }

  // 开发模式配置
  return {
    base: '/tag-textarea/',
    plugins: [vue()],
    server: {
      port: 3000,
      open: true
    }
  }
})
