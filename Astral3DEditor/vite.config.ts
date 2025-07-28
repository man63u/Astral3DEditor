import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import { wrapperEnv, createPlugins } from './build'

export default defineConfig(async ({ mode, command }) => {
  const root = process.cwd()
  const env = loadEnv(mode, root)
  const viteEnv = wrapperEnv(env)

  const {
    VITE_PORT,
    VITE_PUBLIC_PATH,
    VITE_BUILD_COMPRESS,
    VITE_BUILD_COMPRESS_DELETE_ORIGIN_FILE,
    VITE_ENABLE_ANALYZE,
    VITE_PROXY_URL,
    VITE_API_PREFIX = '/api'
  } = viteEnv

  const isBuild = command === 'build'
  const plugins = await createPlugins({
    isBuild,
    root,
    compress: {
      compress: VITE_BUILD_COMPRESS,
      deleteOriginFile: VITE_BUILD_COMPRESS_DELETE_ORIGIN_FILE
    },
    enableAnalyze: VITE_ENABLE_ANALYZE
  })

  // 打印端口看一下
  console.log('当前使用的 VITE_PORT:', VITE_PORT)

  return {
    base: VITE_PUBLIC_PATH,
    root,
    plugins,
    define: {
      'process.env': {},
    },
    resolve: {
      alias: {
        '~': path.resolve(__dirname, './types'),
        '@': path.resolve(__dirname, './src')
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
    },
    optimizeDeps: {
      exclude: ['keyframe-resample', 'draco3dgltf']
    },
    server: {
      host: true,
      port: Number(VITE_PORT),
      headers: {
        'Cross-Origin-Embedder-Policy': 'unsafe-none',
        'Cross-Origin-Opener-Policy': 'unsafe-none'
      },
      // dev 阶段用代理就行，不需要在 vite 开 CORS
      cors: false,
      proxy: {
        // 1) API 代理
        [VITE_API_PREFIX]: {
          target: VITE_PROXY_URL, // http://127.0.0.1:8080
          changeOrigin: true,
          ws: true
          // 不需要 rewrite，后端就是 /api 开头
        },

        // 2) Rocksi 静态页
        '/rocksi': {
          target: VITE_PROXY_URL,
          changeOrigin: true
        },

        // 3) Rocksi 模型目录
        '/models': {
          target: VITE_PROXY_URL,
          changeOrigin: true
        },

        // 4) Rocksi 国际化文件目录
        '/i18n': {
          target: VITE_PROXY_URL,
          changeOrigin: true
        },

        // 5) 文件静态目录（如果需要）
        '/file/static': {
          target: VITE_PROXY_URL,
          changeOrigin: true
          // 后端真实路径是 /api/common/static，就保留 rewrite
          // rewrite: p => p.replace(/^\/file\/static/, '/api/common/static')
        }
      }
    }
  }
})
