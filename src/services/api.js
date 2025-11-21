import axios from 'axios'

// API 기본 설정
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1', //
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
})

// 요청 인터셉터
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request:`, {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      headers: config.headers,
      data: config.data
    })
    
    // JWT 토큰이 있다면 헤더에 추가
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('❌ API Request Error:', error)
    return Promise.reject(error)
  }
)

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response:`, {
      status: response.status,
      url: response.config.url,
      data: response.data
    })
    return response.data
  },
  (error) => {
    const errorInfo = {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      data: error.response?.data,
      headers: error.response?.headers
    }
    
    console.error('❌ API Response Error:', errorInfo)
    
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
      if (import.meta.env.DEV && (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED')) {
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
      if (import.meta.env.DEV && (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED')) {
        console.warn('API 서버 연결 실패 - 모킹 데이터 반환')
        return getMockStoreDetail(storeId)
      }
      throw error
    }
  },

  // 내 상권 정보 조회
  async getMyDistrict() {
    try {
      const response = await apiClient.get('/stores/me/district')
      return response
    } catch (error) {
      if (import.meta.env.DEV && (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED')) {
        console.warn('API 서버 연결 실패 - 모킹 데이터 반환')
        return getMockMyDistrict()
      }
      throw error
    }
  }
}

// ===========================================
// 🔐 1. 인증 관련 API (/auth)
// ===========================================
export const authApi = {
  // 1.1 아이디 중복 체크
  async checkUsername(loginId) {
    try {
      const response = await apiClient.get('/auth/check-username', {
        params: { login_id: loginId }
      })
      return response
    } catch (error) {
      if (import.meta.env.DEV && (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED')) {
        console.warn('API 서버 연결 실패 - 모킹 데이터 반환')
        return getMockUsernameCheck(loginId)
      }
      throw error
    }
  },

  // 1.2 사업자등록번호 검증
  async verifyBusiness(businessNumber) {
    try {
      console.log('🔍 사업자 인증 요청:', businessNumber)
      const response = await apiClient.post('/auth/verify-business', null, {
        params: { businessNumber }
      })
      return response
    } catch (error) {
      console.log('🔍 사업자 인증 에러 상세:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      })
      
      if (import.meta.env.DEV && (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED')) {
        console.warn('API 서버 연결 실패 - 모킹 데이터 반환')
        return getMockBusinessVerification(businessNumber)
      }
      throw error
    }
  },

  // 1.3 회원가입
  async signup(userData) {
    try {
      // ✅ JSON 유지, 하지만 에러 처리 강화
      const response = await apiClient.post('/auth/signup', userData)
      return response
    } catch (error) {
      console.log('🔍 회원가입 에러 상세:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      })
      
      if (import.meta.env.DEV && (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED')) {
        console.warn('API 서버 연결 실패 - 모킹 회원가입')
        return getMockSignupResponse(userData)
      }
      throw error
    }
  },

  // 1.4 로그인
  async login(username, password) {
    try {
      console.log('🔍 로그인 시도:', { username, password: '***' })
      
      // x-www-form-urlencoded 형태로 전송
      const formData = new URLSearchParams()
      formData.append('username', username)
      formData.append('password', password)

      console.log('🔍 로그인 FormData:', formData.toString())

      const response = await apiClient.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      return response
    } catch (error) {
      console.log('🔍 로그인 에러 상세:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      })
      
      if (import.meta.env.DEV && (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED')) {
        console.warn('API 서버 연결 실패 - 모킹 로그인')
        return getMockLoginResponse({ username, password })
      }
      throw error
    }
  },

  // 🔥 1.5 현재 사용자 정보 조회 (토큰 유효성 검증)
  async getCurrentUser() {
    try {
      const response = await apiClient.get('/auth/me')
      return response
    } catch (error) {
      if (import.meta.env.DEV && (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED')) {
        console.warn('API 서버 연결 실패 - 모킹 사용자 정보')
        return getMockCurrentUser()
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
      if (import.meta.env.DEV && (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED')) {
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
      if (import.meta.env.DEV && (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED')) {
        return getMockClusterAnalysis(clusterType)
      }
      throw error
    }
  }
}

// Recommendation API
export const recommendationApi = {
  // 업종 추천 조회
  async getIndustryRecommendations(params) {
    try {
      const response = await apiClient.get('/recommendations/industries', {params})
      return response
    } catch (error) {
      if (import.meta.env.DEV && (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED')) {
        console.warn('API 서버 연결 실패 - 모킹 데이터 반환')
        return getMockIndustryRecommendations(params)
      }
      throw error
    }
  },

  // 제휴 파트너 추천
  async getPartnerRecommendations(params) {
    try {
      const response = await apiClient.get('/recommendations/partners', {params})
      return response
    } catch (error) {
      if (import.meta.env.DEV && (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED')) {
        return getMockPartnerRecommendations()
      }
      throw error
    }
  },
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

// ===========================================
// 📋 5. 개발용 모킹 데이터 함수들 (API 명세서에 정확히 맞춤)
// ===========================================

function getMockUsernameCheck(loginId) {
  const duplicateUsernames = ['admin', 'test', 'user', 'owner', 'testuser']
  return {
    available: !duplicateUsernames.includes(loginId.toLowerCase()),
    message: duplicateUsernames.includes(loginId.toLowerCase()) 
      ? '이미 사용 중인 아이디입니다.' 
      : null
  }
}

function getMockBusinessVerification(businessNumber) {
  return {
    success: true,
    verified: true,
    businessInfo: {
      businessName: "소확행 샘플 상호",
      representativeName: "홍길동",
      businessType: "일반과세자",
      businessStatus: "영업중"
    }
  }
}

function getMockSignupResponse(userData) {
  return {
    id: 1,
    loginId: userData.login_id,
    name: userData.name
  }
}

function getMockLoginResponse(credentials) {
  return {
    access_token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.mock_token_" + Date.now(),
    token_type: "bearer"
  }
}

function getMockCurrentUser() {
  return {
    id: 1,
    loginId: "testuser",
    name: "홍길동",
    email: "test@example.com",
    businessNumber: "123-45-67890",
    businessName: "소확행 테스트 상호",
    clusterType: "blue"
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

// 내 상권 정보 모킹
function getMockMyDistrict() {
  return {
    district_code: "GANG123",
    district_name: "테헤란로상권",
    district_cluster_label: 1,
    district_cluster_type: "red",
    coordinates: {
      latitude: 37.498095,
      longitude: 127.027621
    }
  }
}

// 업종 추천 모킹
function getMockIndustryRecommendations(params) {
  return {
    userIndustry: "커피전문점/카페/다방",
    clusterLabel: 0,
    clusterName: "young_female",
    recommendations: [
      {
        industryName: "베이커리",
        similarityScore: 0.85,
        avgAge: 28.5,
        avgFemaleRatio: 0.72,
        clusterLabel: 0,
        comment: "비슷한 연령대의 여성 고객층을 타깃으로 하는 업종입니다"
      },
      {
        industryName: "화장품/향수",
        similarityScore: 0.78,
        avgAge: 26.3,
        avgFemaleRatio: 0.89,
        clusterLabel: 0,
        comment: "젊은 여성층 중심의 뷰티 관련 업종입니다"
      },
      {
        industryName: "패션/의류",
        similarityScore: 0.72,
        avgAge: 29.1,
        avgFemaleRatio: 0.68,
        clusterLabel: 0,
        comment: "20-30대 여성들이 자주 찾는 패션 업종입니다"
      }
    ]
  }
}

export default apiClient
