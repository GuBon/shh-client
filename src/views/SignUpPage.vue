<template>
  <div class="signup-page">
    <div class="signup-container">
      <!-- 로고 -->
      <div class="logo-section">
        <img src="/images/logo.png" alt="소확행" class="logo" />
        <h2 class="page-title">회원가입</h2>
      </div>

      <!-- 회원가입 폼 -->
      <form @submit.prevent="handleSignup" class="signup-form">

        <!-- 아이디 -->
        <div class="form-group">
          <label class="form-label">아이디</label>
          <input
            v-model="signupForm.userId"
            type="text"
            class="form-input"
            placeholder="아이디를 입력하세요"
            :class="{ error: userIdError }"
            @blur="validateUserId"
            required
          />
          <div v-if="userIdError" class="error-message">{{ userIdError }}</div>
          <div v-if="userIdChecked && !userIdError" class="success-message">✓ 사용 가능한 아이디입니다</div>
        </div>

        <!-- 비밀번호 -->
        <div class="form-group">
          <label class="form-label">비밀번호</label>
          <input
            v-model="signupForm.password"
            type="password"
            class="form-input"
            placeholder="비밀번호를 입력하세요"
            :class="{ error: passwordError }"
            @input="validatePassword"
            required
          />
          <div v-if="passwordError" class="error-message">{{ passwordError }}</div>
        </div>

        <!-- 성명 -->
        <div class="form-group">
          <label class="form-label">성명</label>
          <input
            v-model="signupForm.name"
            type="text"
            class="form-input"
            placeholder="성명을 입력하세요"
            :class="{ error: nameError }"
            @blur="validateName"
            required
          />
          <div v-if="nameError" class="error-message">{{ nameError }}</div>
        </div>

        <!-- 매장 찾기 -->
        <div class="form-group">
          <label class="form-label">매장 찾기</label>
          <div class="search-container">
            <input
              v-model="storeSearchQuery"
              type="text"
              class="form-input search-input"
              placeholder="매장명을 검색하세요"
              @input="onSearchInput"
              @keyup.enter="searchStores"
              readonly
            />
            <button
              type="button"
              @click="openStoreSearch"
              class="search-btn"
            >
              매장명 검색
            </button>
          </div>

          <!-- 선택된 매장 정보 -->
          <div v-if="selectedStore" class="selected-store">
            <div class="store-info">
              <div class="store-name">{{ selectedStore.place_name }}</div>
              <div class="store-address">{{ selectedStore.road_address_name || selectedStore.address_name }}</div>
            </div>
            <button type="button" @click="clearSelectedStore" class="change-btn">변경</button>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">업종 선택</label>

          <select
              v-model="signupForm.industryCode"
              class="form-input"
              required
          >
            <option value="" disabled>업종을 선택하세요</option>
            <option
                v-for="industry in industryList"
                :key="industry"
                :value="industry"
            >
              {{ industry }}
            </option>
          </select>

          <div v-if="!signupForm.industryCode" class="error-message">
            업종을 선택해야 합니다.
          </div>
        </div>

        <!-- 사업자등록번호 -->
        <div class="form-group">
          <label class="form-label">사업자등록번호</label>
          <div class="business-container">
            <input
              v-model="signupForm.businessNumber"
              type="text"
              class="form-input business-input"
              placeholder="000-00-00000"
              :class="{ error: businessNumberError }"
              @input="formatBusinessNumber"
              @blur="validateBusinessNumber"
              required
            />
            <button
              type="button"
              @click="verifyBusiness"
              class="verify-btn"
              :disabled="!isBusinessNumberValid || businessVerifying"
            >
              {{ businessVerifying ? '확인중...' : '사업자 인증' }}
            </button>
          </div>
          <div v-if="businessNumberError" class="error-message">{{ businessNumberError }}</div>
          <div v-if="businessVerified" class="success-message">
            ✓ 사업자 인증이 완료되었습니다 ({{ businessInfo.business_name }})
          </div>
        </div>

        <!-- 회원가입 버튼 -->
        <button
          type="submit"
          class="signup-btn"
          :disabled="!canSignup || isSubmitting"
        >
          {{ isSubmitting ? '가입중...' : '회원가입' }}
        </button>
      </form>

      <!-- 로그인 링크 -->
      <div class="login-link-section">
        <router-link to="/login" class="login-link">
          이미 계정이 있으신가요? 로그인
        </router-link>
      </div>
    </div>

    <!-- 매장 검색 모달 -->
    <div v-if="showSearchModal" class="modal-overlay" @click="closeSearchModal">
      <div class="search-modal" @click.stop>
        <div class="modal-header">
          <h3>매장 검색</h3>
          <button @click="closeSearchModal" class="close-btn">✕</button>
        </div>

        <div class="modal-body">
          <div class="search-box">
            <input
              v-model="searchKeyword"
              type="text"
              placeholder="매장명을 입력하세요"
              class="search-input-modal"
              @keyup.enter="performSearch"
              @input="onSearchKeywordChange"
            />
            <button @click="performSearch" class="search-btn-modal" :disabled="!searchKeyword.trim() || isSearching">
              {{ isSearching ? '검색중...' : '검색' }}
            </button>
          </div>

          <!-- 검색 결과 -->
          <div class="search-results">
            <div v-if="isSearching" class="loading">
              <div class="loading-spinner"></div>
              <p>매장을 검색하고 있습니다...</p>
            </div>

            <div v-else-if="searchError" class="search-error">
              <p>{{ searchError }}</p>
              <button @click="performSearch" class="retry-btn">다시 시도</button>
            </div>

            <div v-else-if="searchResults.length === 0 && hasSearched" class="no-results">
              <p>검색 결과가 없습니다.</p>
              <p>다른 키워드로 검색해 보세요.</p>
            </div>

            <div v-else-if="searchResults.length > 0" class="results-list">
              <div class="results-header">
                검색 결과 {{ searchResults.length }}개
              </div>
              <div
                v-for="result in searchResults"
                :key="result.id"
                class="result-item"
                @click="selectStoreFromModal(result)"
              >
                <div class="result-content">
                  <div class="result-name">{{ result.place_name }}</div>
                  <div class="result-address">{{ result.road_address_name || result.address_name }}</div>
                  <div class="result-category">{{ result.category_group_name }}</div>
                </div>
                <div class="select-indicator">선택</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { authApi } from '@/services/api'
import kakaoPlacesService from '@/services/kakaoPlaces' // ✅ 카카오 Places API 추가

export default {
  name: 'SignUpPage',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()

    // ✅ CSV 기반 업종 리스트 (일부만 예시, 나머지는 CSV에서 그대로 추가)
    const industryList = ref([
          "PC방",
          "가구",
          "가방",
          "가전제품",
          "가전제품수리",
          "골프연습장",
          "네일숍",
          "노래방",
          "당구장",
          "문구",
          "미곡판매",
          "미용실",
          "반찬가게",
          "부동산중개업",
          "분식전문점",
          "서적",
          "슈퍼마켓",
          "스포츠클럽",
          "스포츠용품판매",
          "식료품",
          "안경점",
          "애견용품",
          "약국",
          "여관",
          "옷가게",
          "운동용품",
          "의료기기",
          "의류수선",
          "의원",
          "자동차수리",
          "정육점",
          "제과점",
          "주유소",
          "주차장",
          "중고품판매",
          "중식음식점",
          "철물점",
          "청과상",
          "치과의원",
          "치킨전문점",
          "커피-음료",
          "컴퓨터및주변장치판매",
          "패스트푸드점",
          "편의점",
          "피부관리실",
          "한식음식점",
          "한의원",
          "핸드폰",
          "호프-간이주점",
          "화장품",
          "화초"
        ]
    )

    // 폼 데이터
    const signupForm = ref({
      userId: '',
      password: '',
      name: '',
      businessNumber: '',
      industryCode: ''
    })

    // 검증 상태
    const userIdError = ref('')
    const userIdChecked = ref(false)
    const passwordError = ref('')
    const nameError = ref('')
    const businessNumberError = ref('')
    const businessVerifying = ref(false)
    const businessVerified = ref(false)
    const businessInfo = ref({})

    // 매장 검색 관련
    const showSearchModal = ref(false)
    const storeSearchQuery = ref('')
    const searchKeyword = ref('')
    const searchResults = ref([])
    const selectedStore = ref(null)
    const isSearching = ref(false)
    const searchError = ref('')
    const hasSearched = ref(false)

    // 제출 상태
    const isSubmitting = ref(false)

    // 계산된 속성
    const isBusinessNumberValid = computed(() => {
      return signupForm.value.businessNumber.replace(/[^0-9]/g, '').length === 10
    })

    const canSignup = computed(() => {
      return signupForm.value.userId &&
          userIdChecked.value &&
          !userIdError.value &&
          signupForm.value.password &&
          !passwordError.value &&
          signupForm.value.name &&
          !nameError.value &&
          selectedStore.value &&
          businessVerified.value &&
          // ✅ 업종 반드시 선택해야 가입 가능
          !!signupForm.value.industryCode
    })

    // 아이디 검증
    const validateUserId = async () => {
      const userId = signupForm.value.userId.trim()

      if (!userId) {
        userIdError.value = '아이디를 입력해주세요'
        userIdChecked.value = false
        return
      }

      if (userId.length < 4 || userId.length > 15) {
        userIdError.value = '아이디는 4-15자로 입력해주세요'
        userIdChecked.value = false
        return
      }

      if (!/^[a-zA-Z0-9]+$/.test(userId)) {
        userIdError.value = '아이디는 영문, 숫자만 사용 가능합니다'
        userIdChecked.value = false
        return
      }

      try {
        const response = await authApi.checkUsername(userId)

        if (response.available) {
          userIdError.value = ''
          userIdChecked.value = true
        } else {
          userIdError.value = response.message || '이미 사용 중인 아이디입니다'
          userIdChecked.value = false
        }
      } catch (error) {
        console.error('❌ 아이디 확인 실패:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        })
        
        if (error.response?.status === 405) {
          userIdError.value = '서버 CORS 설정 문제 - 개발자에게 문의하세요'
        } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
          userIdError.value = '서버 응답 시간 초과 - 잠시 후 다시 시도하세요'
        } else if (error.response?.status >= 500) {
          userIdError.value = '서버 오류 - 잠시 후 다시 시도하세요'
        } else {
          userIdError.value = error.response?.data?.detail || '아이디 확인 중 오류가 발생했습니다'
        }
        userIdChecked.value = false
      }
    }

    // 비밀번호 검증
    const validatePassword = () => {
      const password = signupForm.value.password

      if (!password) {
        passwordError.value = ''
        return
      }

      if (password.length < 8) {
        passwordError.value = '비밀번호는 8자 이상 입력해주세요'
        return
      }

      if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
        passwordError.value = '비밀번호는 영문과 숫자를 포함해야 합니다'
        return
      }

      passwordError.value = ''
    }

    // 이름 검증
    const validateName = () => {
      const name = signupForm.value.name.trim()

      if (!name) {
        nameError.value = '성명을 입력해주세요'
        return
      }

      if (name.length < 2) {
        nameError.value = '성명은 2자 이상 입력해주세요'
        return
      }

      nameError.value = ''
    }

    // 사업자등록번호 포맷팅
    const formatBusinessNumber = () => {
      let businessNumber = signupForm.value.businessNumber.replace(/\D/g, '')

      if (businessNumber.length <= 3) {
        signupForm.value.businessNumber = businessNumber
      } else if (businessNumber.length <= 5) {
        signupForm.value.businessNumber = `${businessNumber.slice(0, 3)}-${businessNumber.slice(3)}`
      } else {
        signupForm.value.businessNumber = `${businessNumber.slice(0, 3)}-${businessNumber.slice(3, 5)}-${businessNumber.slice(5, 10)}`
      }
    }

    // 사업자등록번호 검증
    const validateBusinessNumber = () => {
      const businessNumber = signupForm.value.businessNumber.replace(/\D/g, '')

      if (!businessNumber) {
        businessNumberError.value = ''
        return
      }

      if (businessNumber.length !== 10) {
        businessNumberError.value = '올바른 사업자등록번호를 입력해주세요'
        return
      }

      businessNumberError.value = ''
    }

    // 사업자 인증
    const verifyBusiness = async () => {
      if (!isBusinessNumberValid.value) {
        businessNumberError.value = '올바른 사업자등록번호를 입력해주세요'
        return
      }

      businessVerifying.value = true
      businessNumberError.value = ''

      try {
        const response = await authApi.verifyBusiness(
            signupForm.value.businessNumber.replace(/\D/g, '')
        )

        if (response.success && response.verified) {
          businessInfo.value = {
            business_name: response.businessInfo.businessName,
            representative_name: response.businessInfo.representativeName,
            business_type: response.businessInfo.businessType,
            business_status: response.businessInfo.businessStatus
          }
          businessVerified.value = true
        } else {
          businessNumberError.value = '사업자 정보를 확인할 수 없습니다.'
          businessVerified.value = false
        }

      } catch (error) {
        console.error('❌ 사업자 인증 실패:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          config: error.config
        })
        
        if (error.response?.status === 405) {
          businessNumberError.value = 'CORS 설정 문제 - 백엔드 설정을 확인해주세요'
        } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
          businessNumberError.value = '서버 응답 시간 초과 - 잠시 후 다시 시도하세요'
        } else if (error.response?.status >= 500) {
          businessNumberError.value = '서버 오류 - 잠시 후 다시 시도하세요'
        } else {
          businessNumberError.value = error.response?.data?.detail || 
                                     '사업자 인증에 실패했습니다. 다시 시도해주세요.'
        }
        businessVerified.value = false
      } finally {
        businessVerifying.value = false
      }
    }

    // 매장 검색 모달
    const openStoreSearch = () => {
      showSearchModal.value = true
      searchKeyword.value = ''
      searchResults.value = []
      hasSearched.value = false
      searchError.value = ''
    }

    const closeSearchModal = () => {
      showSearchModal.value = false
    }

    const onSearchKeywordChange = () => {
      if (!searchKeyword.value.trim()) {
        searchResults.value = []
        hasSearched.value = false
      }
    }

    // 매장 검색 실행 (실제 카카오 API 사용)
    const performSearch = async () => {
      if (!searchKeyword.value.trim()) return

      isSearching.value = true
      searchError.value = ''
      hasSearched.value = true

      try {
        console.log('🔍 카카오 API로 매장 검색 시작:', searchKeyword.value)
        
        const response = await kakaoPlacesService.searchByKeyword({
          query: searchKeyword.value.trim(),
          size: 15, // 최대 15개 결과
          page: 1
        })

        console.log('✅ 카카오 API 검색 완료:', response.places.length, '개 결과')
        
        // 카카오 API 응답을 회원가입에 필요한 형식으로 변환
        searchResults.value = response.places.map(place => ({
          id: place.id,
          place_name: place.name,
          road_address_name: place.road_address,
          address_name: place.address,
          category_group_name: place.category_name || place.category_group_name,
          phone: place.phone,
          place_url: place.place_url,
          y: place.latitude.toString(),
          x: place.longitude.toString()
        }))

      } catch (error) {
        console.error('❌ 카카오 API 매장 검색 실패:', error)
        
        if (error.message.includes('API 키')) {
          searchError.value = '카카오 API 키가 설정되지 않았습니다. 환경변수를 확인해주세요.'
        } else if (error.message.includes('요청 한도')) {
          searchError.value = 'API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.'
        } else {
          searchError.value = error.message || '매장 검색 중 오류가 발생했습니다.'
        }
        
        searchResults.value = []
      } finally {
        isSearching.value = false
      }
    }

    // 매장 선택
    const selectStoreFromModal = (store) => {
      selectedStore.value = store
      storeSearchQuery.value = store.place_name
      showSearchModal.value = false
    }

    const clearSelectedStore = () => {
      selectedStore.value = null
      storeSearchQuery.value = ''
    }

    // 회원가입 제출 (API 명세서에 정확히 맞춤)
    const handleSignup = async () => {
      if (!canSignup.value) return

      if (!signupForm.value.industryCode) {
        alert('업종을 선택해주세요.')
        return
      }

      isSubmitting.value = true

      try {
        // 📋 API 명세서에 정확히 맞는 데이터 구조
        const signupData = {
          login_id: signupForm.value.userId,  // ✅ login_id로 변경
          password: signupForm.value.password,
          name: signupForm.value.name,
          store_info: {  // ✅ store_info 객체로 변경
            kakao_place_id: selectedStore.value.id,
            store_name: selectedStore.value.place_name,
            place_url: `https://place.map.kakao.com/${selectedStore.value.id}`,
            phone: "02-0000-0000", // 기본값 (실제로는 사업자 정보나 사용자 입력)
            road_address_name: selectedStore.value.road_address_name || selectedStore.value.address_name,
            industry_name: signupForm.value.industryCode,
            x: parseFloat(selectedStore.value.x),
            y: parseFloat(selectedStore.value.y)
          }
        }

        console.log('🚀 회원가입 데이터 전송:', signupData)
        
        const response = await authApi.signup(signupData)
        console.log('✅ 회원가입 성공:', response)

        alert(`회원가입이 완료되었습니다!\n환영합니다, ${response.name}님!`)
        router.push('/login')

      } catch (error) {
        console.error('❌ 회원가입 실패:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          config: error.config
        })
        
        let errorMessage = '회원가입 중 오류가 발생했습니다.'
        
        if (error.response?.status === 405) {
          errorMessage = 'CORS 문제가 발생했습니다. 백엔드 설정을 확인해주세요.'
        } else if (error.response?.status === 400) {
          errorMessage = error.response?.data?.detail || '입력한 정보를 다시 확인해주세요.'
        } else if (error.response?.status >= 500) {
          errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
        } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
          errorMessage = '서버 응답 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.'
        } else {
          errorMessage = error.response?.data?.detail || error.message || errorMessage
        }
        
        alert(errorMessage)
      } finally {
        isSubmitting.value = false
      }
    }

    return {
      // state
      signupForm,
      industryList,
      userIdError,
      userIdChecked,
      passwordError,
      nameError,
      businessNumberError,
      businessVerifying,
      businessVerified,
      businessInfo,
      isBusinessNumberValid,
      showSearchModal,
      storeSearchQuery,
      searchKeyword,
      searchResults,
      selectedStore,
      isSearching,
      searchError,
      hasSearched,
      isSubmitting,
      canSignup,

      // methods
      validateUserId,
      validatePassword,
      validateName,
      formatBusinessNumber,
      validateBusinessNumber,
      verifyBusiness,
      openStoreSearch,
      closeSearchModal,
      onSearchKeywordChange,
      performSearch,
      selectStoreFromModal,
      clearSelectedStore,
      handleSignup
    }
  }
}
</script>


<style scoped>
.signup-page {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.signup-container {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 12px;
  padding: 40px 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

/* 로고 섹션 */
.logo-section {
  text-align: center;
  margin-bottom: 40px;
}

.logo {
  font-size: 2.5rem;
  font-weight: bold;
  color: #FF8C42;
  margin: 0 0 10px 0;
  text-decoration: none;
}

.page-title {
  font-size: 1.2rem;
  font-weight: 500;
  color: #333;
  margin: 0;
}

/* 폼 스타일 */
.signup-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #FF8C42;
  box-shadow: 0 0 0 3px rgba(255, 140, 66, 0.1);
}

.form-input.error {
  border-color: #ff4757;
}

.form-input:disabled {
  background-color: #f8f9fa;
  color: #6c757d;
}

/* 검색 컨테이너 */
.search-container {
  display: flex;
  gap: 8px;
}

.search-input {
  flex: 1;
  cursor: pointer;
}

.search-btn {
  padding: 12px 16px;
  background: #FF8C42;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s;
}

.search-btn:hover {
  background: #e67c37;
}

/* 사업자번호 컨테이너 */
.business-container {
  display: flex;
  gap: 8px;
}

.business-input {
  flex: 1;
}

.verify-btn {
  padding: 12px 16px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s;
}

.verify-btn:hover:not(:disabled) {
  background: #218838;
}

.verify-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* 선택된 매장 정보 */
.selected-store {
  margin-top: 8px;
  padding: 12px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.store-info {
  flex: 1;
}

.store-name {
  font-weight: 500;
  color: #333;
  margin-bottom: 2px;
}

.store-address {
  font-size: 12px;
  color: #666;
}

.change-btn {
  padding: 6px 12px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.change-btn:hover {
  background: #545b62;
}

/* 메시지 */
.error-message {
  color: #ff4757;
  font-size: 12px;
  margin-top: 4px;
}

.success-message {
  color: #2ed573;
  font-size: 12px;
  margin-top: 4px;
}

/* 회원가입 버튼 */
.signup-btn {
  width: 100%;
  padding: 14px;
  background: #FF8C42;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 10px;
}

.signup-btn:hover:not(:disabled) {
  background: #e67c37;
  transform: translateY(-1px);
}

.signup-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

/* 로그인 링크 */
.login-link-section {
  text-align: center;
  margin-top: 24px;
}

.login-link {
  color: #666;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}

.login-link:hover {
  color: #FF8C42;
}

/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.search-modal {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #f8f9fa;
}

.modal-body {
  padding: 24px;
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 검색 박스 */
.search-box {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.search-input-modal {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.search-input-modal:focus {
  outline: none;
  border-color: #FF8C42;
  box-shadow: 0 0 0 3px rgba(255, 140, 66, 0.1);
}

.search-btn-modal {
  padding: 12px 20px;
  background: #FF8C42;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.search-btn-modal:hover:not(:disabled) {
  background: #e67c37;
}

.search-btn-modal:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* 검색 결과 */
.search-results {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  color: #666;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #FF8C42;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.search-error, .no-results {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.retry-btn {
  margin-top: 12px;
  padding: 8px 16px;
  background: #FF8C42;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.results-header {
  font-weight: 500;
  color: #333;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e9ecef;
}

.results-list {
  flex: 1;
  overflow-y: auto;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.result-item:hover {
  border-color: #FF8C42;
  background: #fff8f5;
}

.result-content {
  flex: 1;
}

.result-name {
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.result-address {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.result-category {
  font-size: 11px;
  color: #FF8C42;
  background: rgba(255, 140, 66, 0.1);
  padding: 2px 6px;
  border-radius: 3px;
  display: inline-block;
}

.select-indicator {
  color: #FF8C42;
  font-size: 12px;
  font-weight: 500;
}

/* 반응형 */
@media (max-width: 768px) {
  .signup-page {
    padding: 15px;
  }

  .signup-container {
    padding: 30px 20px;
  }

  .logo {
    font-size: 2rem;
  }

  .search-container,
  .business-container {
    flex-direction: column;
    gap: 10px;
  }

  .search-btn,
  .verify-btn {
    width: 100%;
  }

  .search-modal {
    margin: 10px;
    max-height: calc(100vh - 40px);
  }

  .modal-body {
    padding: 20px;
  }

  .search-box {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
