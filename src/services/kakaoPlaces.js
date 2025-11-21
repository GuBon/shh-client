import axios from 'axios'

class KakaoPlacesService {
  constructor() {
    const apiKey = import.meta.env.VITE_KAKAO_REST_API_KEY
    console.log('🔑 Initializing Kakao Places API with key:', apiKey ? `${apiKey.slice(0, 8)}...` : 'NOT_FOUND')
    
    this.apiClient = axios.create({
      baseURL: 'https://dapi.kakao.com/v2/local',
      headers: {
        'Authorization': `KakaoAK ${apiKey}`
      },
      timeout: 10000
    })

    // 카테고리 코드 매핑
    this.categoryMapping = {
      'MT1': { name: '대형마트', icon: '🛒' },
      'CS2': { name: '편의점', icon: '🏪' },
      'PS3': { name: '어린이집, 유치원', icon: '🏫' },
      'SC4': { name: '학교', icon: '🎓' },
      'AC5': { name: '학원', icon: '📚' },
      'PK6': { name: '주차장', icon: '🅿️' },
      'OL7': { name: '주유소, 충전소', icon: '⛽' },
      'SW8': { name: '지하철역', icon: '🚇' },
      'BK9': { name: '은행', icon: '🏦' },
      'CT1': { name: '문화시설', icon: '🎭' },
      'AG2': { name: '중개업소', icon: '🏠' },
      'PO3': { name: '공공기관', icon: '🏢' },
      'AT4': { name: '관광명소', icon: '🗺️' },
      'AD5': { name: '숙박', icon: '🏨' },
      'FD6': { name: '음식점', icon: '🍽️' },
      'CE7': { name: '카페', icon: '☕' },
      'HP8': { name: '병원', icon: '🏥' },
      'PM9': { name: '약국', icon: '💊' }
    }

    // 응답 인터셉터
    this.apiClient.interceptors.response.use(
      (response) => response.data,
      (error) => {
        console.error('Kakao Places API Error:', {
          status: error.response?.status,
          message: error.message,
          data: error.response?.data
        })
        throw this.handleAPIError(error)
      }
    )
  }

  /**
   * 카테고리별 장소 검색
   * @param {Object} params - 검색 매개변수
   * @param {string} params.categoryCode - 카테고리 코드 (예: 'CE7')
   * @param {number} params.x - 경도
   * @param {number} params.y - 위도
   * @param {number} params.radius - 검색 반경 (미터, 기본값: 1000)
   * @param {number} params.size - 결과 개수 (기본값: 15, 최대 15)
   * @param {number} params.page - 페이지 번호 (기본값: 1)
   */
  async searchByCategory(params) {
    try {
      const searchParams = {
        category_group_code: params.categoryCode,
        x: params.x,
        y: params.y,
        radius: params.radius || 1000,
        size: Math.min(params.size || 15, 15),
        page: params.page || 1,
        sort: 'distance' // 거리순 정렬
      }

      const response = await this.apiClient.get('/search/category.json', {
        params: searchParams
      })

      return {
        places: response.documents.map(place => this.transformPlace(place, params.categoryCode)),
        meta: response.meta,
        pagination: {
          currentPage: params.page || 1,
          totalCount: response.meta.total_count,
          hasNext: !response.meta.is_end
        }
      }
    } catch (error) {
      console.error('Category search failed:', error)
      throw error
    }
  }

  /**
   * 다중 카테고리 검색
   * @param {Object} params - 검색 매개변수
   * @param {string[]} params.categories - 카테고리 코드 배열
   * @param {number} params.x - 경도
   * @param {number} params.y - 위도  
   * @param {number} params.radius - 검색 반경
   * @param {number} params.maxResults - 최대 결과 수
   */
  async searchMultipleCategories(params) {
    try {
      const { categories, maxResults = 50, ...searchParams } = params
      
      if (!categories || categories.length === 0) {
        throw new Error('카테고리를 선택해주세요')
      }

      // 각 카테고리별로 병렬 검색
      const searchPromises = categories.map(categoryCode =>
        this.searchByCategory({
          ...searchParams,
          categoryCode,
          size: Math.ceil(maxResults / categories.length)
        })
      )

      const results = await Promise.allSettled(searchPromises)
      
      // 성공한 결과만 수집
      const allPlaces = results
        .filter(result => result.status === 'fulfilled')
        .flatMap(result => result.value.places)

      // 거리순 정렬 및 중복 제거
      const uniquePlaces = this.removeDuplicates(allPlaces)
      const sortedPlaces = this.sortByDistance(uniquePlaces)

      return {
        places: sortedPlaces.slice(0, maxResults),
        totalFound: uniquePlaces.length,
        categoriesSearched: categories.length,
        searchCenter: { x: params.x, y: params.y }
      }
    } catch (error) {
      console.error('Multiple category search failed:', error)
      throw error
    }
  }

  /**
   * 키워드로 장소 검색
   * @param {Object} params - 검색 매개변수
   * @param {string} params.query - 검색 키워드
   * @param {number} params.x - 경도 (선택사항)
   * @param {number} params.y - 위도 (선택사항)
   * @param {number} params.radius - 검색 반경
   */
  async searchByKeyword(params) {
    try {
      const searchParams = {
        query: params.query,
        size: params.size || 15,
        page: params.page || 1
      }

      // 위치 기반 검색인 경우
      if (params.x && params.y) {
        searchParams.x = params.x
        searchParams.y = params.y
        searchParams.radius = params.radius || 1000
        searchParams.sort = 'distance'
      }

      const response = await this.apiClient.get('/search/keyword.json', {
        params: searchParams
      })

      return {
        places: response.documents.map(place => this.transformPlace(place)),
        meta: response.meta,
        pagination: {
          currentPage: params.page || 1,
          totalCount: response.meta.total_count,
          hasNext: !response.meta.is_end
        }
      }
    } catch (error) {
      console.error('Keyword search failed:', error)
      throw error
    }
  }

  /**
   * 카카오 API 응답을 내부 형식으로 변환
   */
  transformPlace(place, categoryCode = null) {
    const distance = place.distance ? `${Math.round(place.distance)}m` : null
    const category = categoryCode ? this.categoryMapping[categoryCode] : null

    return {
      id: place.id,
      name: place.place_name,
      category_group_code: place.category_group_code,
      category_group_name: place.category_group_name,
      category_name: category?.name || place.category_group_name,
      category_icon: category?.icon || '🏪',
      address: place.address_name,
      road_address: place.road_address_name,
      phone: place.phone || null,
      place_url: place.place_url,
      latitude: parseFloat(place.y),
      longitude: parseFloat(place.x),
      distance: distance,
      distance_meters: place.distance ? parseInt(place.distance) : null,
      is_member: Math.random() > 0.9, // 임시: 30% 확률로 회원 매장
      rating: null, // 카카오 API에서는 평점 제공 안함
      review_count: null,
      description: null,
      main_image: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }

  /**
   * 중복 장소 제거 (같은 ID 기준)
   */
  removeDuplicates(places) {
    const seen = new Set()
    return places.filter(place => {
      if (seen.has(place.id)) {
        return false
      }
      seen.add(place.id)
      return true
    })
  }

  /**
   * 거리순 정렬
   */
  sortByDistance(places) {
    return places.sort((a, b) => {
      const distanceA = a.distance_meters || Infinity
      const distanceB = b.distance_meters || Infinity
      return distanceA - distanceB
    })
  }

  /**
   * 에러 처리
   */
  handleAPIError(error) {
    if (error.response?.status === 401) {
      return new Error('카카오 API 인증에 실패했습니다. API 키를 확인해주세요.')
    } else if (error.response?.status === 429) {
      return new Error('API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.')
    } else if (error.response?.status >= 500) {
      return new Error('카카오 서버에 일시적인 문제가 있습니다. 잠시 후 다시 시도해주세요.')
    } else {
      return new Error(`장소 검색 중 오류가 발생했습니다: ${error.message}`)
    }
  }

  /**
   * 카테고리 정보 조회
   */
  getCategoryInfo(categoryCode) {
    return this.categoryMapping[categoryCode] || { name: '기타', icon: '🏪' }
  }

  /**
   * 모든 카테고리 목록 반환
   */
  getAllCategories() {
    return Object.entries(this.categoryMapping).map(([code, info]) => ({
      code,
      name: info.name,
      icon: info.icon
    }))
  }
}

// 싱글톤 인스턴스 생성
const kakaoPlacesService = new KakaoPlacesService()

export default kakaoPlacesService
