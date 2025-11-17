<template>
  <div class="signup-page">
    <div class="signup-container">
      <!-- 로고 -->
      <div class="logo-section">
        <img src="/images/logo.png" alt="소확행" class="logo" />
        <h1 class="page-title">회원가입</h1>
      </div>

      <!-- 회원가입 단계 표시 -->
      <div class="step-indicator">
        <div class="step" :class="{ active: currentStep >= 1 }">
          <span class="step-number">1</span>
          <span class="step-text">기본정보</span>
        </div>
        <div class="step-divider"></div>
        <div class="step" :class="{ active: currentStep >= 2 }">
          <span class="step-number">2</span>
          <span class="step-text">사업자인증</span>
        </div>
        <div class="step-divider"></div>
        <div class="step" :class="{ active: currentStep >= 3 }">
          <span class="step-number">3</span>
          <span class="step-text">완료</span>
        </div>
      </div>

      <!-- 1단계: 기본 정보 입력 -->
      <div v-if="currentStep === 1" class="step-content">
        <form @submit.prevent="goToBusinessVerification" class="signup-form">
          
          <!-- 아이디 -->
          <div class="form-group">
            <label class="form-label">아이디</label>
            <div class="input-with-button">
              <input
                v-model="signupForm.username"
                type="text"
                placeholder="아이디를 입력하세요"
                class="form-input"
                :class="{ error: usernameError }"
                @blur="validateUsername"
                required
              />
              <button 
                type="button" 
                @click="checkDuplicateUsername"
                class="check-btn"
                :disabled="!signupForm.username || isCheckingUsername"
              >
                {{ isCheckingUsername ? '확인중...' : '중복확인' }}
              </button>
            </div>
            <p v-if="usernameError" class="error-text">{{ usernameError }}</p>
            <p v-if="usernameValid" class="success-text">✓ 사용 가능한 아이디입니다</p>
          </div>

          <!-- 비밀번호 -->
          <div class="form-group">
            <label class="form-label">비밀번호</label>
            <input
              v-model="signupForm.password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              class="form-input"
              :class="{ error: passwordError }"
              @blur="validatePassword"
              required
            />
            <p v-if="passwordError" class="error-text">{{ passwordError }}</p>
          </div>

          <!-- 전화번호 -->
          <div class="form-group">
            <label class="form-label">전화번호</label>
            <input
              v-model="signupForm.phone"
              type="tel"
              placeholder="010-1234-5678"
              class="form-input"
              :class="{ error: phoneError }"
              @input="formatPhone"
              @blur="validatePhone"
              required
            />
            <p v-if="phoneError" class="error-text">{{ phoneError }}</p>
          </div>

          <!-- 성명(대표) -->
          <div class="form-group">
            <label class="form-label">성명(대표)</label>
            <input
              v-model="signupForm.name"
              type="text"
              placeholder="대표자 이름을 입력하세요"
              class="form-input"
              required
            />
          </div>

          <!-- 사업자 등록번호 -->
          <div class="form-group">
            <label class="form-label">사업자 등록번호</label>
            <div class="input-with-button">
              <input
                v-model="signupForm.businessNumber"
                type="text"
                placeholder="000-00-00000"
                class="form-input"
                :class="{ error: businessNumberError }"
                @input="formatBusinessNumber"
                @blur="validateBusinessNumber"
                required
              />
              <button 
                type="button" 
                @click="verifyBusinessNumber"
                class="verify-btn"
                :disabled="!isBusinessNumberValid || isVerifyingBusiness"
              >
                {{ isVerifyingBusiness ? '확인중...' : '사업자 인증' }}
              </button>
            </div>
            <p v-if="businessNumberError" class="error-text">{{ businessNumberError }}</p>
            <p v-if="businessNumberValid" class="success-text">✓ 인증이 완료되었습니다</p>
          </div>

          <!-- 업종 -->
          <div class="form-group">
            <label class="form-label">업종</label>
            <div class="industry-selector" @click="toggleIndustryDropdown">
              <input
                :value="selectedIndustryText"
                type="text"
                placeholder="업종을 선택하세요"
                class="form-input industry-input"
                readonly
                required
              />
              <div class="dropdown-arrow" :class="{ open: showIndustryDropdown }">▼</div>
            </div>
            
            <!-- 업종 드롭다운 -->
            <div v-if="showIndustryDropdown" class="industry-dropdown">
              <div class="industry-list">
                <div 
                  v-for="industry in industryOptions" 
                  :key="industry.code"
                  class="industry-option"
                  @click="selectIndustry(industry)"
                >
                  <span class="industry-icon">{{ industry.icon }}</span>
                  <span class="industry-name">{{ industry.name }}</span>
                </div>
              </div>
            </div>
          </div>

          <button type="submit" class="next-btn" :disabled="!isStep1Valid">
            회원 가입
          </button>

        </form>
      </div>

      <!-- 2단계: 사업자 인증 진행 -->
      <div v-else-if="currentStep === 2" class="step-content verification-step">
        <div class="verification-status">
          <div class="status-icon loading">⏳</div>
          <h2>사업자 정보를 확인하고 있습니다</h2>
          <p>잠시만 기다려 주세요...</p>
          
          <div class="verification-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: verificationProgress + '%' }"></div>
            </div>
            <p class="progress-text">{{ verificationProgress }}% 완료</p>
          </div>
        </div>
      </div>

      <!-- 3단계: 가입 완료 -->
      <div v-else-if="currentStep === 3" class="step-content completion-step">
        <div class="completion-status">
          <div class="status-icon success">✅</div>
          <h2>가입이 완료되었습니다</h2>
          <p>{{ signupForm.name }}님, 소확행에 오신 것을 환영합니다!</p>
          
          <div class="completion-info">
            <div class="info-item">
              <span class="info-label">아이디:</span>
              <span class="info-value">{{ signupForm.username }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">사업장:</span>
              <span class="info-value">{{ verificationResult.businessName }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">업종:</span>
              <span class="info-value">{{ selectedIndustryText }}</span>
            </div>
          </div>

          <button @click="goToLogin" class="complete-btn">
            로그인 하러 가기
          </button>
        </div>
      </div>

      <!-- 뒤로 가기 (1단계에서만) -->
      <div v-if="currentStep === 1" class="back-section">
        <router-link to="/login" class="back-link">이미 계정이 있으신가요? 로그인</router-link>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '../services/api'

const router = useRouter()

// 상태
const currentStep = ref(1)
const showIndustryDropdown = ref(false)
const isCheckingUsername = ref(false)
const isVerifyingBusiness = ref(false)
const verificationProgress = ref(0)

// 폼 데이터
const signupForm = reactive({
  username: '',
  password: '',
  phone: '',
  name: '',
  businessNumber: '',
  industry: ''
})

// 검증 상태
const usernameError = ref('')
const usernameValid = ref(false)
const passwordError = ref('')
const phoneError = ref('')
const businessNumberError = ref('')
const businessNumberValid = ref(false)

// 인증 결과
const verificationResult = ref({
  businessName: '',
  businessType: '',
  businessAddress: ''
})

// 업종 옵션
const industryOptions = ref([
  { code: 'FD6', name: '음식점', icon: '🍽️' },
  { code: 'CE7', name: '카페', icon: '☕' },
  { code: 'CS2', name: '편의점', icon: '🏪' },
  { code: 'MT1', name: '대형마트', icon: '🛒' },
  { code: 'CT1', name: '문화시설', icon: '🎭' },
  { code: 'BK9', name: '은행', icon: '🏦' },
  { code: 'HP8', name: '병원', icon: '🏥' },
  { code: 'PM9', name: '약국', icon: '💊' },
  { code: 'AD5', name: '숙박', icon: '🏨' },
  { code: 'OL7', name: '주유소', icon: '⛽' }
])

// 계산된 속성
const selectedIndustryText = computed(() => {
  const selected = industryOptions.value.find(item => item.code === signupForm.industry)
  return selected ? selected.name : ''
})

const isBusinessNumberValid = computed(() => {
  return signupForm.businessNumber.replace(/[^0-9]/g, '').length === 10
})

const isStep1Valid = computed(() => {
  return signupForm.username && 
         usernameValid.value && 
         signupForm.password && 
         !passwordError.value && 
         signupForm.phone && 
         !phoneError.value && 
         signupForm.name && 
         signupForm.businessStartDate && 
         signupForm.businessNumber && 
         businessNumberValid.value && 
         signupForm.industry
})

// 메서드
const validateUsername = () => {
  if (!signupForm.username) {
    usernameError.value = '아이디를 입력해 주세요.'
    return false
  }
  if (signupForm.username.length < 4) {
    usernameError.value = '아이디는 4자 이상이어야 합니다.'
    return false
  }
  if (!/^[a-zA-Z0-9]+$/.test(signupForm.username)) {
    usernameError.value = '아이디는 영문, 숫자만 사용할 수 있습니다.'
    return false
  }
  usernameError.value = ''
  return true
}

const checkDuplicateUsername = async () => {
  if (!validateUsername()) return

  isCheckingUsername.value = true
  try {
    const response = await authApi.checkUsername(signupForm.username)
    
    if (response.available) {
      usernameValid.value = true
    } else {
      usernameError.value = response.message
      usernameValid.value = false
    }
  } catch (error) {
    usernameError.value = '중복 확인 중 오류가 발생했습니다.'
    console.error('Username check error:', error)
  } finally {
    isCheckingUsername.value = false
  }
}

const validatePassword = () => {
  if (!signupForm.password) {
    passwordError.value = '비밀번호를 입력해 주세요.'
    return false
  }
  if (signupForm.password.length < 8) {
    passwordError.value = '비밀번호는 8자 이상이어야 합니다.'
    return false
  }
  if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(signupForm.password)) {
    passwordError.value = '비밀번호는 영문, 숫자를 포함해야 합니다.'
    return false
  }
  passwordError.value = ''
  return true
}

const formatPhone = (event) => {
  let value = event.target.value.replace(/[^0-9]/g, '')
  if (value.length <= 11) {
    if (value.length > 6) {
      value = value.replace(/(\d{3})(\d{4})(\d+)/, '$1-$2-$3')
    } else if (value.length > 3) {
      value = value.replace(/(\d{3})(\d+)/, '$1-$2')
    }
    signupForm.phone = value
  }
}

const validatePhone = () => {
  const phoneRegex = /^010-\d{4}-\d{4}$/
  if (!phoneRegex.test(signupForm.phone)) {
    phoneError.value = '올바른 전화번호 형식이 아닙니다.'
    return false
  }
  phoneError.value = ''
  return true
}

const formatBusinessNumber = (event) => {
  let value = event.target.value.replace(/[^0-9]/g, '')
  if (value.length <= 10) {
    if (value.length > 5) {
      value = value.replace(/(\d{3})(\d{2})(\d+)/, '$1-$2-$3')
    } else if (value.length > 3) {
      value = value.replace(/(\d{3})(\d+)/, '$1-$2')
    }
    signupForm.businessNumber = value
  }
}

const validateBusinessNumber = () => {
  const businessRegex = /^\d{3}-\d{2}-\d{5}$/
  if (!businessRegex.test(signupForm.businessNumber)) {
    businessNumberError.value = '올바른 사업자등록번호 형식이 아닙니다.'
    return false
  }
  businessNumberError.value = ''
  return true
}

const verifyBusinessNumber = async () => {
  if (!validateBusinessNumber()) return

  isVerifyingBusiness.value = true
  try {
    const response = await authApi.verifyBusiness(signupForm.businessNumber)
    
    if (response.success && response.verified) {
      businessNumberValid.value = true
      verificationResult.value = {
        businessName: response.businessInfo.businessName,
        businessType: response.businessInfo.businessType,
        businessAddress: response.businessInfo.businessAddress
      }
    } else {
      businessNumberError.value = '사업자 정보를 확인할 수 없습니다.'
      businessNumberValid.value = false
    }
    
  } catch (error) {
    businessNumberError.value = '사업자 진위 확인에 실패했습니다.'
    businessNumberValid.value = false
    console.error('Business verification error:', error)
  } finally {
    isVerifyingBusiness.value = false
  }
}

const toggleIndustryDropdown = () => {
  showIndustryDropdown.value = !showIndustryDropdown.value
}

const selectIndustry = (industry) => {
  signupForm.industry = industry.code
  showIndustryDropdown.value = false
}

const goToBusinessVerification = async () => {
  if (!isStep1Valid.value) return

  currentStep.value = 2
  
  try {
    // 진행률 시뮬레이션
    const interval = setInterval(() => {
      verificationProgress.value += Math.random() * 15 + 5
      if (verificationProgress.value >= 100) {
        verificationProgress.value = 100
        clearInterval(interval)
      }
    }, 400)

    // 실제 회원가입 API 호출
    const response = await authApi.signup({
      username: signupForm.username,
      password: signupForm.password,
      phone: signupForm.phone,
      name: signupForm.name,
      businessStartDate: signupForm.businessStartDate,
      businessNumber: signupForm.businessNumber,
      industry: signupForm.industry
    })

    // 성공 시 3단계로 이동
    setTimeout(() => {
      currentStep.value = 3
    }, 1000)

  } catch (error) {
    console.error('회원가입 실패:', error)
    // 에러 처리 - 1단계로 되돌리기
    currentStep.value = 1
    alert('회원가입 중 오류가 발생했습니다. 다시 시도해 주세요.')
  }
}

const goToLogin = () => {
  router.push('/login')
}

// 외부 클릭 감지
const handleClickOutside = (event) => {
  if (!event.target.closest('.industry-selector')) {
    showIndustryDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.signup-page {
  min-height: 100vh;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.signup-container {
  width: 100%;
  max-width: 520px;
  background: white;
  border-radius: 16px;
  padding: 40px 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

/* 로고 섹션 */
.logo-section {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  width: 150px;
  height: auto;
  margin-bottom: 16px;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #111827;
}

/* 단계 표시 */
.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e5e7eb;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s;
}

.step.active .step-number {
  background: #ff6b35;
  color: white;
}

.step-text {
  font-size: 12px;
  color: #6b7280;
  transition: color 0.2s;
}

.step.active .step-text {
  color: #ff6b35;
}

.step-divider {
  width: 40px;
  height: 2px;
  background: #e5e7eb;
  margin: 0 16px;
}

/* 폼 스타일 */
.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  color: #374151;
  font-weight: 500;
  font-size: 14px;
}

.form-input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 15px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #ff6b35;
}

.form-input.error {
  border-color: #ef4444;
}

/* 버튼이 있는 입력 필드 */
.input-with-button {
  display: flex;
  gap: 8px;
}

.input-with-button .form-input {
  flex: 1;
}

.check-btn,
.verify-btn {
  padding: 14px 16px;
  background: #6b7280;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}

.verify-btn {
  background: #ff6b35;
}

.check-btn:hover:not(:disabled) {
  background: #4b5563;
}

.verify-btn:hover:not(:disabled) {
  background: #e55a2b;
}

.check-btn:disabled,
.verify-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 업종 선택 */
.industry-selector {
  position: relative;
  cursor: pointer;
}

.industry-input {
  cursor: pointer;
  padding-right: 40px !important;
}

.dropdown-arrow {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  font-size: 12px;
  transition: transform 0.2s;
  pointer-events: none;
}

.dropdown-arrow.open {
  transform: translateY(-50%) rotate(180deg);
}

.industry-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  z-index: 10;
  max-height: 200px;
  overflow-y: auto;
}

.industry-list {
  padding: 8px 0;
}

.industry-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.industry-option:hover {
  background: #f9fafb;
}

.industry-icon {
  font-size: 16px;
}

.industry-name {
  font-size: 14px;
  color: #374151;
}

/* 메시지 */
.error-text {
  margin: 4px 0 0;
  color: #ef4444;
  font-size: 12px;
}

.success-text {
  margin: 4px 0 0;
  color: #10b981;
  font-size: 12px;
}

/* 버튼 */
.next-btn,
.complete-btn {
  width: 100%;
  padding: 16px 20px;
  background: #ff6b35;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 24px;
}

.next-btn:hover:not(:disabled),
.complete-btn:hover {
  background: #e55a2b;
}

.next-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 인증 단계 */
.verification-step,
.completion-step {
  text-align: center;
  padding: 40px 0;
}

.status-icon {
  font-size: 64px;
  margin-bottom: 24px;
}

.verification-step h2,
.completion-step h2 {
  margin: 0 0 8px;
  font-size: 20px;
  color: #111827;
}

.verification-step p,
.completion-step p {
  margin: 0 0 32px;
  color: #6b7280;
}

.verification-progress {
  max-width: 300px;
  margin: 0 auto;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: #ff6b35;
  transition: width 0.3s;
}

.progress-text {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

.completion-info {
  background: #f9fafb;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 32px;
  text-align: left;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  color: #6b7280;
  font-size: 14px;
}

.info-value {
  color: #111827;
  font-weight: 500;
  font-size: 14px;
}

/* 뒤로 가기 */
.back-section {
  text-align: center;
  margin-top: 24px;
}

.back-link {
  color: #6b7280;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}

.back-link:hover {
  color: #ff6b35;
  text-decoration: underline;
}

/* 반응형 */
@media (max-width: 600px) {
  .signup-container {
    padding: 32px 24px;
    margin: 0 16px;
  }

  .logo {
    width: 120px;
  }

  .page-title {
    font-size: 20px;
  }

  .step-indicator {
    margin-bottom: 32px;
  }

  .step-divider {
    width: 20px;
    margin: 0 8px;
  }

  .input-with-button {
    flex-direction: column;
  }

  .check-btn,
  .verify-btn {
    width: 100%;
  }
}

/* 다크모드 */
@media (prefers-color-scheme: dark) {
  .signup-page {
    background: #111827;
  }

  .signup-container {
    background: #1f2937;
    color: #e5e7eb;
  }

  .page-title {
    color: #f9fafb;
  }

  .form-label {
    color: #d1d5db;
  }

  .form-input {
    background: #374151;
    border-color: #4b5563;
    color: #e5e7eb;
  }

  .form-input:focus {
    border-color: #ff6b35;
  }

  .industry-dropdown {
    background: #374151;
    border-color: #4b5563;
  }

  .industry-option:hover {
    background: #4b5563;
  }

  .industry-name {
    color: #e5e7eb;
  }

  .completion-info {
    background: #374151;
  }

  .info-label {
    color: #9ca3af;
  }

  .info-value {
    color: #e5e7eb;
  }

  .back-link {
    color: #9ca3af;
  }

  .back-link:hover {
    color: #ff6b35;
  }
}
</style>