import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import fs from 'fs'
import { join } from 'path'

// 插件：将 CSS 内联到 JS 文件中
function inlineCssPlugin() {
  return {
    name: 'inline-css',
    apply: 'build',
    closeBundle() {
      const distDir = resolve(process.cwd(), 'dist')
      const cssFiles = fs.readdirSync(distDir).filter(file => file.endsWith('.css'))

      if (cssFiles.length === 0) return

      // 读取所有 CSS 内容
      const allCss = cssFiles
        .map(cssFile => fs.readFileSync(join(distDir, cssFile), 'utf-8'))
        .join('\n')

      const injectedJsCode = `
(function() {
  var style = document.createElement('style');
  style.textContent = ${JSON.stringify(allCss)};
  (document.head || document.documentElement).appendChild(style);
})();`

      // 读取并修改 JS 文件
      const jsFiles = fs.readdirSync(distDir).filter(file => file.endsWith('.js'))
      jsFiles.forEach(jsFile => {
        const jsPath = join(distDir, jsFile)
        const jsContent = fs.readFileSync(jsPath, 'utf-8')
        fs.writeFileSync(jsPath, injectedJsCode + '\n' + jsContent)
      })

      // 删除 CSS 文件
      cssFiles.forEach(cssFile => {
        fs.unlinkSync(join(distDir, cssFile))
      })
    }
  }
}

export default defineConfig(({ mode }) => {
  if (mode === 'lib') {
    // 库模式打包配置
    return {
      plugins: [vue(), inlineCssPlugin()],
      build: {
        lib: {
          entry: resolve(__dirname, 'src/index.js'),
          name: 'TaggedTextarea',
          fileName: (format) => `tagged-textarea.${format}.js`,
          formats: ['es', 'umd']
        },
        rollupOptions: {
          external: ['vue'],
          output: {
            globals: {
              vue: 'Vue'
            }
          }
        },
        cssCodeSplit: false
      }
    }
  }

  // 开发模式配置
  return {
    base: '/tagged-textarea/',
    plugins: [vue()],
    server: {
      port: 3000,
      open: true
    }
  }
})
