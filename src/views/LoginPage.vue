<template>
  <div class="login-page">
    <div class="login-container">
      <!-- 로고 -->
      <div class="logo-section">
        <img src="/images/logo.png" alt="소확행" class="logo" />
        <p class="tagline">소상공인을 확실하게 행복하게 만드는 플랫폼</p>
      </div>

      <!-- 로그인 폼 -->
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <input
            v-model="loginForm.username"
            type="text"
            placeholder="이메일/아이디"
            class="form-input"
            required
          />
        </div>

        <div class="form-group">
          <input
            v-model="loginForm.password"
            type="password"
            placeholder="비밀번호"
            class="form-input"
            required
          />
        </div>

        <button 
          type="submit" 
          class="login-btn"
          :disabled="isLoading"
        >
          <span v-if="isLoading" class="loading-spinner"></span>
          {{ isLoading ? '로그인 중...' : '로그인' }}
        </button>
      </form>

      <!-- 회원가입 링크 -->
      <div class="signup-section">
        <router-link to="/signup" class="signup-link">회원 가입</router-link>
      </div>

      <!-- 에러 메시지 -->
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { authApi } from '../services/api'  //API import 추가

const router = useRouter()
const authStore = useAuthStore()

// 상태
const isLoading = ref(false)
const errorMessage = ref('')

// 폼 데이터
const loginForm = reactive({
  username: '',
  password: ''
})

// 메서드
const handleLogin = async () => {
  if (!loginForm.username || !loginForm.password) {
    errorMessage.value = '이메일/아이디와 비밀번호를 모두 입력해 주세요.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    // 📋 API 명세서에 맞는 로그인 API 호출
    const response = await authApi.login(loginForm.username, loginForm.password)
    
    // 🔥 JWT 토큰 저장 (store와 localStorage 모두)
    authStore.setToken(response.access_token)
    
    // 사용자 정보 스토어에 저장 (실제로는 사용자 정보 API를 따로 호출해야 함)
    const userData = {
      name: loginForm.username, // 임시: 실제로는 사용자 정보 API에서 가져와야 함
      loginId: loginForm.username,
      email: loginForm.username
    }
    
    authStore.login(userData)
    
    console.log('✅ 로그인 성공:', userData.name)
    
    // 메인 페이지로 이동
    router.push('/')
    
  } catch (error) {
    console.error('❌ 로그인 실패:', error)
    
    // API 응답에 따른 에러 메시지 처리
    if (error.response?.status === 401) {
      errorMessage.value = '아이디 또는 비밀번호가 올바르지 않습니다.'
    } else if (error.response?.status === 422) {
      errorMessage.value = '입력한 정보를 다시 확인해주세요.'
    } else {
      errorMessage.value = error.response?.data?.detail || 
                          '로그인 중 오류가 발생했습니다. 다시 시도해주세요.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 420px;
  background: white;
  border-radius: 16px;
  padding: 48px 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
}

/* 로고 섹션 */
.logo-section {
  margin-bottom: 40px;
}

.logo {
  width: 180px;
  height: auto;
  margin-bottom: 16px;
}

.tagline {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
}

/* 로그인 폼 */
.login-form {
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 16px;
}

.form-input {
  width: 100%;
  padding: 16px 20px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #ff6b35;
}

.form-input::placeholder {
  color: #9ca3af;
}

.login-btn {
  width: 100%;
  padding: 16px 20px;
  background: #ff6b35;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.login-btn:hover:not(:disabled) {
  background: #e55a2b;
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* 회원가입 섹션 */
.signup-section {
  margin-bottom: 16px;
}

.signup-link {
  color: #6b7280;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}

.signup-link:hover {
  color: #ff6b35;
  text-decoration: underline;
}

/* 에러 메시지 */
.error-message {
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 14px;
  text-align: center;
}

/* 애니메이션 */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 반응형 */
@media (max-width: 480px) {
  .login-container {
    padding: 32px 24px;
    margin: 0 16px;
  }

  .logo {
    width: 150px;
  }

  .tagline {
    font-size: 13px;
  }

  .form-input,
  .login-btn {
    padding: 14px 18px;
    font-size: 15px;
  }
}

/* 다크모드 */
@media (prefers-color-scheme: dark) {
  .login-page {
    background: #111827;
  }

  .login-container {
    background: #1f2937;
    color: #e5e7eb;
  }

  .tagline {
    color: #9ca3af;
  }

  .form-input {
    background: #374151;
    border-color: #4b5563;
    color: #e5e7eb;
  }

  .form-input::placeholder {
    color: #6b7280;
  }

  .form-input:focus {
    border-color: #ff6b35;
  }

  .signup-link {
    color: #9ca3af;
  }

  .signup-link:hover {
    color: #ff6b35;
  }

  .error-message {
    background: #451a03;
    border-color: #7c2d12;
    color: #ef4444;
  }
}
</style>