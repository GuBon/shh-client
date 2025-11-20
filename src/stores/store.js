import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import kakaoPlacesService from '../services/kakaoPlaces'

export const useStoreStore = defineStore('store', () => {
  // 상태
  const stores = ref([])
  const selectedStore = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const searchFilters = ref({
    categories: [], // 선택된 카테고리들
    memberOnly: false, // 제휴 매장만 표시
    radius: 1000, // 검색 반경 (미터)
    maxResults: 50 // 최대 결과 수
  })
  const currentLocation = ref({
    latitude: 37.57574724,
    longitude: 126.9572089,
    address: '서울특별시 중구 세종대로 110'
  })
  const lastSearchParams = ref(null)

  // 계산된 속성
  const filteredStores = computed(() => {
    let filtered = stores.value

    // 제휴 매장 필터
    if (searchFilters.value.memberOnly) {
      filtered = filtered.filter(store => store.is_member)
    }

    // 회원 매장을 앞으로 정렬
    filtered.sort((a, b) => {
      if (a.is_member && !b.is_member) return -1
      if (!a.is_member && b.is_member) return 1
      return (a.distance_meters || 0) - (b.distance_meters || 0)
    })

    return filtered
  })

  const memberStores = computed(() => 
    stores.value.filter(store => store.is_member)
  )

  const sortedStores = computed(() => {
    return filteredStores.value
  })

  const categoryStats = computed(() => {
    const stats = {}
    stores.value.forEach(store => {
      const category = store.category_group_code
      if (!stats[category]) {
        stats[category] = {
          code: category,
          name: store.category_name,
          icon: store.category_icon,
          count: 0,
          memberCount: 0
        }
      }
      stats[category].count++
      if (store.is_member) {
        stats[category].memberCount++
      }
    })
    return Object.values(stats)
  })

  // 액션
  const searchStores = async (location = null, options = {}) => {
    loading.value = true
    error.value = null

    try {
      const searchLocation = location || currentLocation.value
      const searchOptions = { ...searchFilters.value, ...options }

      // 검색 매개변수 저장
      lastSearchParams.value = {
        location: searchLocation,
        options: searchOptions,
        timestamp: Date.now()
      }

      let result

      if (searchOptions.categories.length > 0) {
        // 선택된 카테고리로 검색
        result = await kakaoPlacesService.searchMultipleCategories({
          categories: searchOptions.categories,
          x: searchLocation.longitude,
          y: searchLocation.latitude,
          radius: searchOptions.radius,
          maxResults: searchOptions.maxResults
        })
      } else {
        // 기본 카테고리로 검색 (음식점, 카페, 편의점, 마트)
        result = await kakaoPlacesService.searchMultipleCategories({
          categories: ['FD6', 'CE7', 'CS2', 'MT1'],
          x: searchLocation.longitude,
          y: searchLocation.latitude,
          radius: searchOptions.radius,
          maxResults: searchOptions.maxResults
        })
      }

      stores.value = result.places
      currentLocation.value = searchLocation

      console.log(`Found ${result.places.length} stores in ${result.categoriesSearched} categories`)
      
    } catch (err) {
      console.error('Store search failed:', err)
      error.value = err.message || '매장 검색 중 오류가 발생했습니다'
      stores.value = []
    } finally {
      loading.value = false
    }
  }

  const searchByKeyword = async (keyword, location = null) => {
    loading.value = true
    error.value = null

    try {
      const searchLocation = location || currentLocation.value
      
      const result = await kakaoPlacesService.searchByKeyword({
        query: keyword,
        x: searchLocation.longitude,
        y: searchLocation.latitude,
        radius: searchFilters.value.radius,
        size: searchFilters.value.maxResults
      })

      stores.value = result.places
      console.log(`Found ${result.places.length} stores for keyword: ${keyword}`)

    } catch (err) {
      console.error('Keyword search failed:', err)
      error.value = err.message || '키워드 검색 중 오류가 발생했습니다'
      stores.value = []
    } finally {
      loading.value = false
    }
  }

  const setSelectedStore = (store) => {
    selectedStore.value = store
  }

  const clearSelectedStore = () => {
    selectedStore.value = null
  }

  const setSearchFilters = async (newFilters) => {
    const hasChanged = JSON.stringify(searchFilters.value) !== JSON.stringify({...searchFilters.value, ...newFilters})
    
    searchFilters.value = { ...searchFilters.value, ...newFilters }

    // 카테고리나 반경이 변경된 경우 다시 검색
    if (hasChanged && (newFilters.categories !== undefined || newFilters.radius !== undefined)) {
      await searchStores()
    }
  }

  const setCurrentLocation = (location) => {
    currentLocation.value = {
      ...currentLocation.value,
      ...location
    }
  }

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
          setCurrentLocation(location)
          resolve(location)
        },
        (err) => {
          console.error('Geolocation error:', err)
          reject(new Error('위치 정보를 가져올 수 없습니다'))
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5분 캐시
        }
      )
    })
  }

  const refreshStores = async () => {
    if (lastSearchParams.value) {
      await searchStores(
        lastSearchParams.value.location,
        lastSearchParams.value.options
      )
    }
  }

  const clearError = () => {
    error.value = null
  }

  const clearStores = () => {
    stores.value = []
  }

  // 초기화
  const initializeStores = async () => {
    try {
      console.log('🏪 Initializing stores with Kakao API...')
      // 현재 위치 가져오기 시도
      const userLocation = await getCurrentLocation()
      await searchStores(userLocation)
    } catch (err) {
      // 위치 권한이 없으면 기본 위치로 검색
      console.warn('Could not get user location, using default location')
      await searchStores()
    }
  }

  return {
    // 상태
    stores,
    selectedStore,
    loading,
    error,
    searchFilters,
    currentLocation,
    lastSearchParams,
    
    // 계산된 속성
    filteredStores,
    memberStores,
    sortedStores,
    categoryStats,
    
    // 액션
    searchStores,
    searchByKeyword,
    setSelectedStore,
    clearSelectedStore,
    setSearchFilters,
    setCurrentLocation,
    getCurrentLocation,
    refreshStores,
    clearError,
    clearStores,
    initializeStores
  }
})
