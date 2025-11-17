import axios from 'axios'

// API 기본 설정
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
})

// 요청 인터셉터
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
    
    // JWT 토큰이 있다면 헤더에 추가
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`)
    return response.data
  },
  (error) => {
    console.error('API Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    })
    
    if (error.response?.status === 401) {
      // 인증 오류 처리
      localStorage.removeItem('access_token')
      // 개발 중에는 로그인 페이지로 리다이렉트 하지 않음
      if (import.meta.env.PROD) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Store API
export const storeApi = {
  // 매장 검색
  async searchStores(params) {
    try {
      const response = await apiClient.get('/stores/search', { params })
      return response
    } catch (error) {
      if (import.meta.env.DEV && error.code === 'ERR_NETWORK') {
        console.warn('API 서버 연결 실패 - 모킹 데이터 반환')
        return getMockStoreData(params)
      }
      throw error
    }
  },

  // 매장 상세 정보 조회
  async getStoreDetail(storeId) {
    try {
      const response = await apiClient.get(`/stores/${storeId}`)
      return response
    } catch (error) {
      if (import.meta.env.DEV && error.code === 'ERR_NETWORK') {
        console.warn('API 서버 연결 실패 - 모킹 데이터 반환')
        return getMockStoreDetail(storeId)
      }
      throw error
    }
  }
}

// Auth API
export const authApi = {
  // 로그인
  async login(credentials) {
    try {
      const response = await apiClient.post('/auth/login', credentials)
      return response
    } catch (error) {
      if (import.meta.env.DEV && error.code === 'ERR_NETWORK') {
        console.warn('API 서버 연결 실패 - 모킹 로그인')
        return getMockLoginResponse(credentials)
      }
      throw error
    }
  },

  // 회원가입
  async signup(userData) {
    try {
      const response = await apiClient.post('/auth/signup', userData)
      return response
    } catch (error) {
      if (import.meta.env.DEV && error.code === 'ERR_NETWORK') {
        console.warn('API 서버 연결 실패 - 모킹 회원가입')
        return getMockSignupResponse(userData)
      }
      throw error
    }
  },

  // 아이디 중복 확인
  async checkUsername(username) {
    try {
      const response = await apiClient.get(`/auth/check-username?username=${username}`)
      return response
    } catch (error) {
      if (import.meta.env.DEV && error.code === 'ERR_NETWORK') {
        return getMockUsernameCheck(username)
      }
      throw error
    }
  },

  // 사업자 상태조회 (사업자등록번호만 필요)
  async verifyBusiness(businessNumber) {
    try {
      const response = await apiClient.post('/auth/verify-business', {
        business_number: businessNumber  // 백엔드 스키마에 맞게 수정
      })
      return response
    } catch (error) {
      if (import.meta.env.DEV && error.code === 'ERR_NETWORK') {
        return getMockBusinessVerification(businessNumber)
      }
      throw error
    }
  }
}

// Analysis API
export const analysisApi = {
  // 내 상권 분석
  async getMyDistrictAnalysis() {
    try {
      const response = await apiClient.get('/analysis/my-district')
      return response
    } catch (error) {
      if (import.meta.env.DEV && error.code === 'ERR_NETWORK') {
        return getMockDistrictAnalysis()
      }
      throw error
    }
  },

  // 클러스터 분석
  async getClusterAnalysis(clusterType) {
    try {
      const response = await apiClient.get(`/analysis/clusters/${clusterType}`)
      return response
    } catch (error) {
      if (import.meta.env.DEV && error.code === 'ERR_NETWORK') {
        return getMockClusterAnalysis(clusterType)
      }
      throw error
    }
  }
}

// Recommendation API
export const recommendationApi = {
  // 제휴 파트너 추천
  async getPartnerRecommendations(params) {
    try {
      const response = await apiClient.get('/recommendations/partners', { params })
      return response
    } catch (error) {
      if (import.meta.env.DEV && error.code === 'ERR_NETWORK') {
        return getMockPartnerRecommendations()
      }
      throw error
    }
  },

  // 확장 입지 추천
  async getExpansionRecommendations(params) {
    try {
      const response = await apiClient.get('/recommendations/expansion', { params })
      return response
    } catch (error) {
      if (import.meta.env.DEV && error.code === 'ERR_NETWORK') {
        return getMockExpansionRecommendations()
      }
      throw error
    }
  }
}

// Coupon API
export const couponApi = {
  // 쿠폰 생성
  async createCoupon(couponData) {
    try {
      const response = await apiClient.post('/coupons/', couponData)
      return response
    } catch (error) {
      if (import.meta.env.DEV && error.code === 'ERR_NETWORK') {
        return getMockCouponCreation(couponData)
      }
      throw error
    }
  },

  // 사용 가능한 쿠폰 조회
  async getAvailableCoupons(params) {
    try {
      const response = await apiClient.get('/coupons/available', { params })
      return response
    } catch (error) {
      if (import.meta.env.DEV && error.code === 'ERR_NETWORK') {
        return getMockAvailableCoupons()
      }
      throw error
    }
  }
}

// 카테고리 API
export const categoryApi = {
  // 카테고리 목록 조회
  async getCategories() {
    try {
      const response = await apiClient.get('/categories')
      return response
    } catch (error) {
      if (import.meta.env.DEV && error.code === 'ERR_NETWORK') {
        console.warn('API 서버 연결 실패 - 기본 카테고리 반환')
        return getMockCategories()
      }
      throw error
    }
  }
}

// 지역 API  
export const regionApi = {
  // 현재 지역 정보
  async getCurrentRegion() {
    try {
      const response = await apiClient.get('/regions/current')
      return response
    } catch (error) {
      if (import.meta.env.DEV && error.code === 'ERR_NETWORK') {
        return getMockCurrentRegion()
      }
      throw error
    }
  },

  // 지역 목록
  async getRegions() {
    try {
      const response = await apiClient.get('/regions/list')
      return response
    } catch (error) {
      if (import.meta.env.DEV && error.code === 'ERR_NETWORK') {
        return { regions: [] }
      }
      throw error
    }
  },

  // 지역 자동완성
  async searchRegions(query) {
    try {
      const response = await apiClient.get('/regions/autocomplete', {
        params: { q: query }
      })
      return response
    } catch (error) {
      if (import.meta.env.DEV && error.code === 'ERR_NETWORK') {
        return { regions: [] }
      }
      throw error
    }
  },

  // 좌표 변환
  async convertCoordinates(data) {
    try {
      const response = await apiClient.post('/coordinates/convert', data)
      return response
    } catch (error) {
      if (import.meta.env.DEV && error.code === 'ERR_NETWORK') {
        return { coordinates: data }
      }
      throw error
    }
  }
}

// ===========================================
// 개발용 모킹 데이터 함수들
// ===========================================

function getMockStoreData(params) {
  const mockStores = [
    {
      id: 1,
      name: '구본경의 카페',
      category: 'CE7',
      address: '서울특별시 중구 명동길 26',
      phone: '02-1234-5678',
      latitude: 37.5636,
      longitude: 126.9834,
      is_member: true,
      distance: '0.3km',
      rating: 4.8,
      review_count: 156,
      description: '신선한 원두로 내린 커피와 수제 디저트를 즐길 수 있는 아늑한 공간입니다.',
      mainImage: '/images/store-main.jpg',
      operatingHours: {
        weekday: { open: '09:00', close: '22:00' },
        weekend: { open: '10:00', close: '23:00' }
      },
      createdAt: '2024-01-15',
      updatedAt: '2024-11-15'
    },
    {
      id: 2,
      name: '투썸플레이스 을지로점',
      category: 'CE7',
      address: '서울특별시 중구 을지로 30',
      phone: '02-2345-6789',
      latitude: 37.5658,
      longitude: 126.9779,
      is_member: false,
      distance: '0.5km',
      rating: 4.2,
      review_count: 89
    },
    {
      id: 3,
      name: 'GS25 시청점',
      category: 'CS2',
      address: '서울특별시 중구 세종대로 110',
      phone: '02-3456-7890',
      latitude: 37.5665,
      longitude: 126.9780,
      is_member: true,
      distance: '0.1km',
      rating: 4.0,
      review_count: 45
    }
  ]

  // 필터 적용
  let filteredStores = mockStores
  
  if (params.categories && params.categories.length > 0) {
    filteredStores = filteredStores.filter(store => 
      params.categories.includes(store.category)
    )
  }
  
  if (params.member_only) {
    filteredStores = filteredStores.filter(store => store.is_member)
  }

  // 회원 매장 우선 정렬
  filteredStores.sort((a, b) => {
    if (a.is_member && !b.is_member) return -1
    if (!a.is_member && b.is_member) return 1
    return parseFloat(a.distance) - parseFloat(b.distance)
  })

  return {
    stores: filteredStores,
    total: filteredStores.length,
    page: params.page || 1,
    total_pages: Math.ceil(filteredStores.length / (params.size || 20))
  }
}

function getMockStoreDetail(storeId) {
  const mockStores = getMockStoreData({})
  const store = mockStores.stores.find(s => s.id.toString() === storeId.toString())
  
  if (!store) {
    throw new Error('매장을 찾을 수 없습니다.')
  }
  
  // 상세 정보가 없는 매장에 기본값 추가
  if (!store.description) {
    store.description = '매장에 대한 자세한 정보를 확인해 보세요.'
  }
  if (!store.operatingHours) {
    store.operatingHours = {
      weekday: { open: '09:00', close: '21:00' },
      weekend: { open: '10:00', close: '22:00' }
    }
  }
  if (!store.createdAt) store.createdAt = '2024-01-01'
  if (!store.updatedAt) store.updatedAt = '2024-11-01'
  
  return { store }
}

function getMockLoginResponse(credentials) {
  return {
    user: {
      id: 'user_001',
      username: credentials.username,
      name: '구본경',
      email: credentials.username,
      role: 'STORE_OWNER'
    },
    token: 'mock_jwt_token_' + Date.now()
  }
}

function getMockSignupResponse(userData) {
  return {
    success: true,
    message: '회원가입이 완료되었습니다.',
    user: {
      id: 'user_' + Date.now(),
      username: userData.username,
      name: userData.name,
      phone: userData.phone,
      role: 'STORE_OWNER'
    }
  }
}

function getMockUsernameCheck(username) {
  const duplicateUsernames = ['admin', 'test', 'user', 'owner']
  return {
    available: !duplicateUsernames.includes(username.toLowerCase()),
    message: duplicateUsernames.includes(username.toLowerCase()) 
      ? '이미 사용중인 아이디입니다.' 
      : '사용 가능한 아이디입니다.'
  }
}

function getMockBusinessVerification(businessNumber) {
  return {
    success: true,
    verified: true,
    businessInfo: {
      businessNumber: businessNumber,
      businessName: '소확행 사업장',
      representativeName: '구본경',
      businessType: '일반음식점',
      businessAddress: '서울특별시 중구 명동길 26',
      businessStatus: '계속사업자'
    }
  }
}

function getMockCategories() {
  return {
    categories: [
      { code: 'MT1', name: '대형마트', icon: '🛒', count: 1 },
      { code: 'CS2', name: '편의점', icon: '🏪', count: 2 },
      { code: 'PS3', name: '어린이집, 유치원', icon: '🏫', count: 0 },
      { code: 'SC4', name: '학교', icon: '🎓', count: 0 },
      { code: 'AC5', name: '학원', icon: '📚', count: 0 },
      { code: 'PK6', name: '주차장', icon: '🅿️', count: 0 },
      { code: 'OL7', name: '주유소, 충전소', icon: '⛽', count: 0 },
      { code: 'SW8', name: '지하철역', icon: '🚇', count: 0 },
      { code: 'BK9', name: '은행', icon: '🏦', count: 1 },
      { code: 'CT1', name: '문화시설', icon: '🎭', count: 1 },
      { code: 'AG2', name: '중개업소', icon: '🏠', count: 0 },
      { code: 'PO3', name: '공공기관', icon: '🏢', count: 0 },
      { code: 'AT4', name: '관광명소', icon: '🗺️', count: 0 },
      { code: 'AD5', name: '숙박', icon: '🏨', count: 0 },
      { code: 'FD6', name: '음식점', icon: '🍽️', count: 3 },
      { code: 'CE7', name: '카페', icon: '☕', count: 2 },
      { code: 'HP8', name: '병원', icon: '🏥', count: 0 },
      { code: 'PM9', name: '약국', icon: '💊', count: 0 }
    ]
  }
}

function getMockCurrentRegion() {
  return {
    region: {
      name: '서울특별시 중구',
      code: 'SEOUL_JUNG',
      latitude: 37.5665,
      longitude: 126.9780
    }
  }
}

function getMockDistrictAnalysis() {
  return {
    analysis: {
      overview: {
        totalStores: 124,
        memberStores: 45,
        averageRating: 4.2,
        popularCategories: ['FD6', 'CE7', 'CS2']
      },
      demographics: {
        population: 15420,
        ageGroup: '20-30대 중심',
        averageIncome: 3500
      }
    }
  }
}

function getMockClusterAnalysis(clusterType) {
  return {
    clusters: [
      {
        id: 1,
        center: [37.5665, 126.9780],
        stores: 25,
        category: clusterType,
        strength: 'high'
      }
    ]
  }
}

function getMockPartnerRecommendations() {
  return {
    recommendations: [
      {
        id: 1,
        name: '추천 파트너 매장',
        category: 'CE7',
        compatibility: 0.85,
        reason: '고객층이 유사합니다'
      }
    ]
  }
}

function getMockExpansionRecommendations() {
  return {
    recommendations: [
      {
        location: '강남구 역삼동',
        score: 0.9,
        reason: '유동인구가 많고 경쟁이 적습니다'
      }
    ]
  }
}

function getMockCouponCreation(couponData) {
  return {
    success: true,
    coupon: {
      id: 'coupon_' + Date.now(),
      ...couponData,
      createdAt: new Date().toISOString()
    }
  }
}

function getMockAvailableCoupons() {
  return {
    coupons: [
      {
        id: 'coupon_1',
        title: '10% 할인 쿠폰',
        discount: 10,
        expiresAt: '2024-12-31'
      }
    ]
  }
}

export default apiClient
