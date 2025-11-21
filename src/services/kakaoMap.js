// 카카오 맵 SDK 관리 - 완전 자체 로딩 방식

class KakaoMapService {
  constructor() {
    this.isLoaded = false
    this.loadPromise = null
  }

  async loadKakaoMapSDK() {
    // 이미 완전히 로드된 상태라면 바로 반환
    if (
      this.isLoaded &&
      window.kakao &&
      window.kakao.maps &&
      window.kakao.maps.LatLng
    ) {
      return window.kakao
    }

    // 로딩 중이면 기존 Promise 재사용
    if (this.loadPromise) {
      return this.loadPromise
    }

    this.loadPromise = new Promise((resolve, reject) => {
      const SCRIPT_ID = 'kakao-map-sdk'
      let script = document.getElementById(SCRIPT_ID)

      const onLoaded = () => {
        if (!window.kakao || !window.kakao.maps) {
          this.loadPromise = null
          reject(new Error('Kakao Maps object not available after script load'))
          return
        }

        try {
          window.kakao.maps.load(() => {
            if (!window.kakao.maps.LatLng) {
              this.loadPromise = null
              reject(new Error('Kakao Maps LatLng constructor not available'))
              return
            }
            console.log('✅ Kakao Maps SDK initialized successfully')
            this.isLoaded = true
            this.loadPromise = null
            resolve(window.kakao)
          })
        } catch (e) {
          console.error('Kakao Maps load error:', e)
          this.loadPromise = null
          reject(e)
        }
      }

      const onError = (e) => {
        console.error('Kakao Maps script load error:', e)
        this.loadPromise = null
        reject(new Error('Kakao Maps script load error'))
      }

      // 이미 script 태그가 붙어 있으면 onload / onerror만 등록
      if (script) {
        // 혹시 이미 다 준비돼 있으면 바로 resolve
        if (window.kakao && window.kakao.maps && window.kakao.maps.LatLng) {
          this.isLoaded = true
          this.loadPromise = null
          resolve(window.kakao)
        } else {
          script.addEventListener('load', onLoaded, { once: true })
          script.addEventListener('error', onError, { once: true })
        }
        return
      }

      // ✅ script 태그가 없다면 여기서 새로 생성
      script = document.createElement('script')
      script.id = SCRIPT_ID

      const appKey = import.meta.env.VITE_KAKAO_MAP_API_KEY

      if (!appKey) {
        this.loadPromise = null
        reject(new Error('VITE_KAKAO_MAP_API_KEY is not set in environment variables'))
        return
      }

      script.src =
        `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}` +
        `&autoload=false&libraries=services,clusterer,drawing`
      script.async = true
      script.onload = onLoaded
      script.onerror = onError

      console.log('📥 Loading Kakao Maps SDK...')
      document.head.appendChild(script)
    })

    return this.loadPromise
  }

  // 지도 초기화
  async initializeMap(container, options = {}) {
    try {
      const kakao = await this.loadKakaoMapSDK()

      if (!container) {
        throw new Error('Map container element is required')
      }

      if (!kakao.maps.LatLng) {
        throw new Error('Kakao Maps LatLng constructor is not available')
      }

      const defaultOptions = {
        center: new kakao.maps.LatLng(37.5665, 126.9780), // 서울시청
        level: 3
      }

      const mapOptions = { ...defaultOptions, ...options }
      console.log('🗺️ Creating map with options:', mapOptions)

      const map = new kakao.maps.Map(container, mapOptions)

      // 지도 컨트롤 추가
      try {
        const mapTypeControl = new kakao.maps.MapTypeControl()
        map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT)
        console.log('✅ Map type control added')
      } catch (e) {
        console.warn('⚠️ Failed to add map type control:', e)
      }

      try {
        const zoomControl = new kakao.maps.ZoomControl()
        map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT)
        console.log('✅ Zoom control added')
      } catch (e) {
        console.warn('⚠️ Failed to add zoom control:', e)
      }

      console.log('✅ Kakao Map initialized successfully')
      return map

    } catch (error) {
      console.error('❌ Map initialization failed:', error)
      throw error
    }
  }

  // 마커 생성
  async createMarker(store, map) {
    try {
      const kakao = await this.loadKakaoMapSDK()
      
      if (!kakao.maps.Marker) {
        throw new Error('Kakao Maps Marker constructor is not available')
      }

      // 기본 마커 이미지 (커스텀 이미지가 실패할 경우를 대비)
      let markerImageObj = null
      
      try {
        if (kakao.maps.MarkerImage) {
          const markerImage = store.is_member 
            ? '/images/marker-member.png'  // 회원 매장 마커
            : '/images/marker-normal.png'  // 일반 매장 마커
          
          const imageSize = new kakao.maps.Size(40, 42)
          const imageOption = { offset: new kakao.maps.Point(20, 42) }
          markerImageObj = new kakao.maps.MarkerImage(markerImage, imageSize, imageOption)
        }
      } catch (e) {
        console.warn('Failed to load custom marker image, using default:', e)
        // 기본 마커 사용 (markerImageObj = null)
      }
      
      const markerOptions = {
        position: new kakao.maps.LatLng(store.latitude, store.longitude),
        title: store.name
      }
      
      if (markerImageObj) {
        markerOptions.image = markerImageObj
      }
      
      const marker = new kakao.maps.Marker(markerOptions)

      if (map) {
        marker.setMap(map)
      }

      return marker
      
    } catch (error) {
      console.error('Marker creation failed:', error)
      throw error
    }
  }

  // 인포윈도우 생성
  async createInfoWindow(store) {
    try {
      const kakao = await this.loadKakaoMapSDK()
      
      if (!kakao.maps.InfoWindow) {
        throw new Error('Kakao Maps InfoWindow constructor is not available')
      }

      const content = `
        <div style="padding: 10px; min-width: 200px; max-width: 300px; font-family: 'Malgun Gothic', sans-serif;">
          <div style="font-weight: bold; margin-bottom: 5px; font-size: 14px;">
            ${store.name}
            ${store.is_member ? '<span style="background: #ff6b35; color: white; padding: 2px 6px; border-radius: 3px; font-size: 11px; margin-left: 5px;">회원</span>' : ''}
          </div>
          <div style="font-size: 12px; color: #666; margin-bottom: 3px;">${store.address}</div>
          ${store.phone ? `<div style="font-size: 12px; color: #666; margin-bottom: 3px;">📞 ${store.phone}</div>` : ''}
          <div style="font-size: 11px; color: #999;">${store.distance || '거리 정보 없음'}</div>
        </div>
      `

      return new kakao.maps.InfoWindow({
        content: content,
        removable: true
      })
      
    } catch (error) {
      console.error('InfoWindow creation failed:', error)
      throw error
    }
  }

  // 주소를 좌표로 변환
  async geocode(address) {
    try {
      const kakao = await this.loadKakaoMapSDK()

      if (!kakao.maps.services || !kakao.maps.services.Geocoder) {
        throw new Error('Kakao Maps Geocoder is not available')
      }

      return new Promise((resolve, reject) => {
        const geocoder = new kakao.maps.services.Geocoder()

        geocoder.addressSearch(address, (result, status) => {
          if (status === kakao.maps.services.Status.OK) {
            const x = parseFloat(result[0].x) // 경도
            const y = parseFloat(result[0].y) // 위도

            const coords = new kakao.maps.LatLng(y, x)

            resolve({
              latitude: y,      // ✅ 위도
              longitude: x,     // ✅ 경도
              coords
            })
          } else {
            reject(new Error('주소를 찾을 수 없습니다'))
          }
        })
      })

    } catch (error) {
      console.error('Geocoding failed:', error)
      throw error
    }
  }

  // 좌표를 주소로 변환
  async reverseGeocode(lat, lng) {
    try {
      const kakao = await this.loadKakaoMapSDK()
      
      if (!kakao.maps.services || !kakao.maps.services.Geocoder) {
        throw new Error('Kakao Maps Geocoder is not available')
      }

      return new Promise((resolve, reject) => {
        const geocoder = new kakao.maps.services.Geocoder()
        const coords = new kakao.maps.LatLng(lat, lng)
        
        geocoder.coord2Address(coords.getLng(), coords.getLat(), (result, status) => {
          if (status === kakao.maps.services.Status.OK) {
            const address = result[0].address || result[0].road_address
            resolve(address ? address.address_name : '주소 정보 없음')
          } else {
            reject(new Error('주소를 찾을 수 없습니다'))
          }
        })
      })
      
    } catch (error) {
      console.error('Reverse geocoding failed:', error)
      throw error
    }
  }

  // 지도 범위 내 좌표 계산
  getMapBounds(map) {
    try {
      const bounds = map.getBounds()
      const sw = bounds.getSouthWest() // 남서쪽 좌표
      const ne = bounds.getNorthEast() // 북동쪽 좌표
      
      return {
        southwest: {
          latitude: sw.getLat(),
          longitude: sw.getLng()
        },
        northeast: {
          latitude: ne.getLat(), 
          longitude: ne.getLng()
        }
      }
    } catch (error) {
      console.error('Failed to get map bounds:', error)
      return null
    }
  }

  // 거리 계산 (Haversine formula)
  calculateDistance(lat1, lng1, lat2, lng2) {
    try {
      const R = 6371 // 지구 반지름 (km)
      const dLat = this.deg2rad(lat2 - lat1)
      const dLng = this.deg2rad(lng2 - lng1)
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
        Math.sin(dLng/2) * Math.sin(dLng/2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
      const distance = R * c // Distance in km
      
      if (distance < 1) {
        return `${Math.round(distance * 1000)}m`
      } else {
        return `${distance.toFixed(1)}km`
      }
    } catch (error) {
      console.error('Distance calculation failed:', error)
      return '거리 계산 오류'
    }
  }

  deg2rad(deg) {
    return deg * (Math.PI/180)
  }

  // SDK 로딩 상태 체크
  isSDKLoaded() {
    return this.isLoaded && window.kakao && window.kakao.maps && window.kakao.maps.LatLng
  }

  // SDK 상태 체크 (디버깅용)
  getSDKStatus() {
    return {
      windowKakao: !!window.kakao,
      kakaoMaps: !!(window.kakao && window.kakao.maps),
      kakaoMapsLatLng: !!(window.kakao && window.kakao.maps && window.kakao.maps.LatLng),
      isLoaded: this.isLoaded,
      hasLoadPromise: !!this.loadPromise
    }
  }
}

// 싱글톤 인스턴스 생성
export const kakaoMapService = new KakaoMapService()
export default kakaoMapService