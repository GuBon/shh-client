import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
//import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // 환경변수 로드
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [
      vue(),
      // vueDevTools(),
    ].filter(Boolean),
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    // Vue 템플릿 컴파일 설정 (CSP 문제 해결)
    esbuild: {
      drop: mode === 'production' ? ['console', 'debugger'] : []
    },
    // 개발 서버 설정
    server: {
      port: 5173, // Vue/Vite 기본 포트
      host: true,
      cors: {
        origin: [
          'http://localhost:5173',
          'http://127.0.0.1:5173',
          'https://dapi.kakao.com',
          'https://*.dapi.kakao.com'
        ],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
      },
      // API 프록시 설정 (백엔드 연동시)
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '/api/v1')
        }
      }
      // 개발 환경에서는 CSP 헤더 제거 (카카오맵 로딩을 위해)
    },
    // 빌드 설정
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development',
      // 청크 크기 경고 제한
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          // 청크 분할 최적화
          manualChunks: {
            vendor: ['vue', 'vue-router', 'pinia'],
            api: ['axios']
          }
        }
      }
    },
    // CSS 전처리기 설정
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/styles/variables.scss";`
        }
      }
    },
    // 환경변수 정의
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '0.0.0'),
      __BUILD_DATE__: JSON.stringify(new Date().toISOString())
    },
    // 최적화 설정
    optimizeDeps: {
      include: ['vue', 'vue-router', 'pinia', 'axios']
    }
  }
})