import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import router from './router'

// Pinia 인스턴스 생성
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// Vue 앱 생성
const app = createApp(App)

// 플러그인 등록
app.use(pinia)
app.use(router)

// 전역 에러 핸들러
app.config.errorHandler = (err, instance, info) => {
  console.error('Global error:', err)
  console.error('Error info:', info)
}

// 전역 warning 핸들러
app.config.warnHandler = (msg, instance, trace) => {
  console.warn('Vue warning:', msg)
  console.warn('Trace:', trace)
}

// 개발 환경에서만 성능 추적 활성화
if (import.meta.env.DEV) {
  app.config.performance = true
}

// 앱 마운트
app.mount('#app')

// 서비스워커 등록 (PWA)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration)
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError)
        })
  })
}

// 브라우저 지원 체크
const checkBrowserSupport = () => {
  const requiredFeatures = ['fetch', 'Promise', 'Map', 'Set', 'Array.from']

  const unsupportedFeatures = requiredFeatures.filter(feature => {
    try {
      return !window[feature] && !eval(feature)
    } catch (e) {
      return true
    }
  })

  if (unsupportedFeatures.length > 0) {
    console.warn('일부 브라우저 기능이 지원되지 않습니다:', unsupportedFeatures)

    const shouldShowWarning = unsupportedFeatures.some(feature =>
        ['fetch', 'Promise'].includes(feature)
    )

    if (shouldShowWarning) {
      const message =
          '최신 브라우저를 사용해 주세요. 일부 기능이 제대로 동작하지 않을 수 있습니다.'
      setTimeout(() => alert(message), 1000)
    }
  }
}

checkBrowserSupport()

// 전역 유틸리티
window.sowhapp = {
  version: '1.0.0',
  buildDate: new Date().toISOString(),
  env: import.meta.env.MODE
}

// 🔧 개발 환경 디버깅용 (devtools hook 건들지 않기!!)
if (import.meta.env.DEV) {
  window.app = app
}
