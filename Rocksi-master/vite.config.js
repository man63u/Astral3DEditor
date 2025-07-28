import { defineConfig } from 'vite'
import stringPlugin from 'vite-plugin-string'
import commonjs from 'vite-plugin-commonjs' // 👈 新增

export default defineConfig({
  base: '/rocksi/',
  plugins: [
    commonjs(), // 👈 新增
    stringPlugin({
      include: ['**/*.xml']
    })
  ],
  define: {
  'process.env': {},
}
, // 👈 确保 process.env 在代码中可用
  build: {
    outDir: 'dist/build',
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      input: './index.html',
      output: {
        manualChunks: undefined
      }
    },
    commonjsOptions: {
      transformMixedEsModules: true,
      include: [/node_modules/] // 👈 保证 commonjs 转换能作用到所有第三方依赖
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  optimizeDeps: {
    include: ['@tweenjs/tween.js'] // 👈 强制预构建可能出问题的依赖
  }
})
