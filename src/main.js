import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Pinia 인스턴스 생성
const pinia = createPinia()

// Vue 앱 생성
const app = createApp(App)

// 플러그인 등록
app.use(pinia)
app.use(router)

// 전역 에러 핸들러
app.config.errorHandler = (err, instance, info) => {
  console.error('Global error:', err)
  console.error('Error info:', info)
  
  // 에러 리포팅 서비스에 전송 (추후 구현)
  // errorReporting.captureException(err, { extra: { info } })
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

// 앱 마운트 (카카오맵과 무관하게)
app.mount('#app')

// 서비스워커 등록 (PWA 지원을 위한 준비)
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
  const requiredFeatures = [
    'fetch',
    'Promise', 
    'Map',
    'Set',
    'Array.from'
  ]

  const unsupportedFeatures = requiredFeatures.filter(feature => {
    try {
      return !window[feature] && !eval(feature)
    } catch (e) {
      return true
    }
  })

  if (unsupportedFeatures.length > 0) {
    console.warn('일부 브라우저 기능이 지원되지 않습니다:', unsupportedFeatures)
    
    // 폴백 처리 또는 사용자에게 브라우저 업데이트 안내
    const shouldShowWarning = unsupportedFeatures.some(feature => 
      ['fetch', 'Promise'].includes(feature)
    )
    
    if (shouldShowWarning) {
      const message = '최신 브라우저를 사용해 주세요. 일부 기능이 제대로 동작하지 않을 수 있습니다.'
      setTimeout(() => alert(message), 1000)
    }
  }
}

// 브라우저 지원 체크 실행
checkBrowserSupport()

// 전역 유틸리티 함수들
window.sowhapp = {
  version: '1.0.0',
  buildDate: new Date().toISOString(),
  env: import.meta.env.MODE
}

// 개발 환경에서의 디버깅 도구
if (import.meta.env.DEV) {
  // Vue DevTools 설정 (읽기 전용 오류 방지)
  try {
    if (!window.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
      window.__VUE_DEVTOOLS_GLOBAL_HOOK__ = {}
    }
    window.app = app
  } catch (error) {
    console.warn('DevTools setup warning:', error.message)
  }
}