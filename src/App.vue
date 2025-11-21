<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useStoreStore } from './stores/store'
import { useAuthStore } from './stores/auth'

const storeStore = useStoreStore()
const authStore = useAuthStore()

onMounted(async () => {
  // 🔥 1. 로그인 상태 복원 (최우선)
  console.log('🔄 앱 시작 - 로그인 상태 복원 중...')
  authStore.restoreAuthState()
  
  // 🔥 2. 토큰이 있으면 유효성 검증 (선택사항)
  if (authStore.isAuthenticated) {
    console.log('🔍 토큰 유효성 검증 중...')
    await authStore.validateToken()
  }
  
  // 앱 초기화 로직
  console.log('소확행 제휴매장 찾기 앱이 시작되었습니다.')
  
  // 백엔드 없이 프론트 개발을 위한 초기 데이터 로드
  console.log('🏪 Loading initial store data for frontend development...')
  await storeStore.initializeStores()
})
</script>

<style>
/* 전역 스타일 리셋 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: #333;
  background-color: #fff;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  height: 100%;
  width: 100%;
}

/* 스크롤바 스타일링 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 전역 유틸리티 클래스 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.text-center {
  text-align: center;
}

.text-left {
  text-align: left;
}

.text-right {
  text-align: right;
}

/* 버튼 기본 스타일 */
button {
  font-family: inherit;
  font-size: inherit;
  outline: none;
}

button:focus-visible {
  outline: 2px solid #ff6b35;
  outline-offset: 2px;
}

/* 링크 기본 스타일 */
a {
  color: inherit;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

/* 입력 요소 기본 스타일 */
input, textarea, select {
  font-family: inherit;
  font-size: inherit;
}

input:focus, textarea:focus, select:focus {
  outline: 2px solid #ff6b35;
  outline-offset: 2px;
}

/* 이미지 반응형 */
img {
  max-width: 100%;
  height: auto;
}

/* 접근성 향상을 위한 포커스 스타일 */
*:focus-visible {
  outline: 2px solid #ff6b35;
  outline-offset: 2px;
}

/* 다크모드 지원 */
@media (prefers-color-scheme: dark) {
  html, body {
    background-color: #1a202c;
    color: #e2e8f0;
  }
  
  ::-webkit-scrollbar-track {
    background: #2d3748;
  }
  
  ::-webkit-scrollbar-thumb {
    background: #4a5568;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: #5a6572;
  }
}

/* 모션 감소 설정 존중 */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* 인쇄 스타일 */
@media print {
  * {
    background: transparent !important;
    color: black !important;
    box-shadow: none !important;
    text-shadow: none !important;
  }
  
  a, a:visited {
    text-decoration: underline;
  }
  
  img {
    max-width: 100% !important;
    page-break-inside: avoid;
  }
  
  h1, h2, h3 {
    page-break-after: avoid;
  }
}
</style>
