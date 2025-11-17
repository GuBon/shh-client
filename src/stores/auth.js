import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const isLoggedIn = ref(false)
  
  // 임시 내 가게 정보 (추후 실제 API에서 가져올 데이터)
  const myStore = ref({
    id: 'store_001',
    name: '구본경의 카페',
    latitude: 37.5636,  // 명동 근처
    longitude: 126.9834,
    address: '서울특별시 중구 명동길 26',
    phone: '02-1234-5678'
  })

  // Getters
  const userInfo = computed(() => user.value)
  const hasMyStore = computed(() => myStore.value !== null)
  const isAuthenticated = computed(() => isLoggedIn.value)

  // Actions
  const login = (userData) => {
    user.value = {
      ...userData,
      clusterType: 'blue' // 예시로 블루 타입 사용자로 설정
    }
    isLoggedIn.value = true
    console.log('🔐 User logged in:', userData.name)
  }

  const logout = () => {
    user.value = null
    isLoggedIn.value = false
    
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

  return {
    // State
    user,
    isLoggedIn,
    myStore,
    
    // Getters
    userInfo,
    hasMyStore,
    isAuthenticated,
    
    // Actions
    login,
    logout,
    setMyStore,
    getMyStoreLocation
  }
})
