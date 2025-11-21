import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const isLoggedIn = ref(false)
  const accessToken = ref(null)
  
  // 임시 내 가게 정보 (추후 실제 API에서 가져올 데이터)
  const myStore = ref({
    id: 'store_001',
    name: '영천생고기',
    latitude: 37.57574724,
    longitude: 126.9572089,
    address: '서울특별시 중구 명동길 26',
    phone: '02-1234-5678'
  })

  // Getters
  const userInfo = computed(() => user.value)
  const hasMyStore = computed(() => myStore.value !== null)
  const isAuthenticated = computed(() => isLoggedIn.value && !!accessToken.value)

  // Actions
  const login = (userData) => {
    user.value = {
      ...userData,
      clusterType: userData.clusterType || 'blue' // 예시로 블루 타입 사용자로 설정
    }
    isLoggedIn.value = true
    console.log('🔐 User logged in:', userData.name)
  }

  const setToken = (token) => {
    accessToken.value = token
    localStorage.setItem('access_token', token)
    console.log('🔐 Token set')
  }

  const logout = () => {
    user.value = null
    isLoggedIn.value = false
    accessToken.value = null
    
    // JWT 토큰 제거
    localStorage.removeItem('access_token')
    
    console.log('🔐 User logged out')
  }

  const setMyStore = (storeData) => {
    myStore.value = storeData
  }

  const getMyStoreLocation = () => {
    if (myStore.value) {
      return {
        latitude: myStore.value.latitude,
        longitude: myStore.value.longitude
      }
    }
    return null
  }

  // 🔥 로그인 상태 복원 (앱 시작 시 호출)
  const restoreAuthState = () => {
    try {
      const token = localStorage.getItem('access_token')
      
      if (token) {
        accessToken.value = token
        isLoggedIn.value = true
        
        console.log('🔄 Auth state restored from localStorage')
        return true
      } else {
        console.log('🔄 No token found, user not logged in')
        return false
      }
    } catch (error) {
      console.error('❌ Failed to restore auth state:', error)
      logout() // 에러가 있으면 로그아웃 처리
      return false
    }
  }

  // 🔥 토큰 유효성 검증 (실제 API와 연동)
  const validateToken = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        logout()
        return false
      }

      // 🔥 실제 API 호출하여 사용자 정보 가져오기
      const userInfo = await authApi.getCurrentUser()
      
      // 사용자 정보 업데이트
      user.value = userInfo
      isLoggedIn.value = true
      accessToken.value = token
      
      console.log('✅ Token validated successfully, user info updated:', userInfo.name)
      return true
      
    } catch (error) {
      console.error('❌ Token validation failed:', error)
      logout()
      return false
    }
  }

  return {
    // State
    user,
    isLoggedIn,
    accessToken,
    myStore,
    
    // Getters
    userInfo,
    hasMyStore,
    isAuthenticated,
    
    // Actions
    login,
    setToken,
    logout,
    setMyStore,
    getMyStoreLocation,
    restoreAuthState,
    validateToken
  }
}, {
  // 🔥 Pinia Persist 설정 - localStorage에 상태 저장
  persist: {
    key: 'sowhapp-auth',
    storage: localStorage,
    paths: ['user', 'isLoggedIn'] // accessToken은 제외 (보안상 localStorage에서 직접 관리)
  }
})
