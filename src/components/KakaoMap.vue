<template>
  <div class="kakao-map-container">

    <div id="map" class="map" ref="mapContainer"></div>

    <div class="map-controls">
      <button
          class="current-location-btn"
          @click="getCurrentLocation"
          :disabled="loading"
          title="현재 위치로 이동"
      >
        <i class="icon-gps" :class="{ loading }"></i>
      </button>

      <button
          class="my-store-btn"
          @click="goToMyStore"
          title="내 가게 위치"
      >
        <i class="icon-store"></i>
      </button>
    </div>

    <!-- 지도 로딩 상태 -->
    <div v-if="mapLoading" class="map-loading">
      <div class="loading-spinner"></div>
      <p>지도를 로드하는 중...</p>
    </div>

    <!-- 지도 에러 상태 -->
    <div v-if="mapError" class="map-error">
      <div class="error-icon">⚠️</div>
      <h3>지도를 불러올 수 없습니다</h3>
      <p>{{ mapError }}</p>
      <button @click="retryMapLoad" class="retry-btn">다시 시도</button>
    </div>
  </div>
</template>



<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useStoreStore } from '../stores/store'
import { kakaoMapService } from '../services/kakaoMap'

const props = defineProps({
  stores: {
    type: Array,
    default: () => []
  },
  selectedStore: {
    type: Object,
    default: null
  },
  center: {
    type: Object,
    default: () => ({ latitude: 37.57574724, longitude: 126.9572089})
  }
})

const emit = defineEmits(['marker-click', 'map-move', 'map-ready', 'go-to-my-store'])

const storeStore = useStoreStore()

// 상태
const mapContainer = ref(null)
const map = ref(null)
const markers = ref([])
const infoWindows = ref([])
const currentInfoWindow = ref(null)
const mapLoading = ref(true)
const mapError = ref('')
const loading = ref(false)

// 지도 초기화
const initializeMap = async () => {
  try {
    mapLoading.value = true
    mapError.value = ''

    if (!mapContainer.value) {
      throw new Error('지도 컨테이너를 찾을 수 없습니다')
    }

    console.log('Starting map initialization...')
    console.log('Kakao SDK status:', kakaoMapService.getSDKStatus())

    // 먼저 kakao 객체를 받아온다
    const kakao = await kakaoMapService.loadKakaoMapSDK()

    //그 다음에 LatLng 생성
    const mapOptions = {
      center: new kakao.maps.LatLng(
        props.center.latitude,
        props.center.longitude
      ),
      level: 3
    }

    // 여기서는 options만 넘긴다
    map.value = await kakaoMapService.initializeMap(mapContainer.value, mapOptions)

    // 지도 이벤트 리스너 추가
    kakao.maps.event.addListener(map.value, 'dragend', handleMapMove)
    kakao.maps.event.addListener(map.value, 'zoom_changed', handleMapMove)

    emit('map-ready', map.value)
    
  } catch (error) {
    console.error('Map initialization error:', error)
    mapError.value = error.message || '지도 초기화에 실패했습니다'
    
    // 디버깅 정보 출력
    console.log('Debug - Kakao SDK status:', kakaoMapService.getSDKStatus())
    console.log('Debug - window.kakao:', window.kakao)
    if (window.kakao) {
      console.log('Debug - window.kakao.maps:', window.kakao.maps)
      if (window.kakao.maps) {
        console.log('Debug - window.kakao.maps.LatLng:', window.kakao.maps.LatLng)
      }
    }
  } finally {
    mapLoading.value = false
  }
}

// 마커 생성 및 관리
const createMarker = async (store) => {
  try {
    const marker = await kakaoMapService.createMarker(store, map.value)
    const infoWindow = await kakaoMapService.createInfoWindow(store)
    
    // 마커 클릭 이벤트
    const kakao = await kakaoMapService.loadKakaoMapSDK()
    kakao.maps.event.addListener(marker, 'click', () => {
      // 기존 인포윈도우 닫기
      if (currentInfoWindow.value) {
        currentInfoWindow.value.close()
      }

      // 새 인포윈도우 열기
      infoWindow.open(map.value, marker)
      currentInfoWindow.value = infoWindow

      // 선택된 매장 이벤트 발생
      emit('marker-click', store)
    })

    // 마커에 스토어 정보 저장
    marker.storeData = store
    
    markers.value.push(marker)
    infoWindows.value.push(infoWindow)

    return marker
  } catch (error) {
    console.error('Marker creation error:', error)
    return null
  }
}

// 모든 마커 업데이트
const updateMarkers = async () => {
  if (!map.value) return

  // 기존 마커 제거
  clearMarkers()

  // 새 마커 생성
  for (const store of props.stores) {
    await createMarker(store)
  }
}

// 마커 제거
const clearMarkers = () => {
  markers.value.forEach(marker => {
    marker.setMap(null)
  })
  
  infoWindows.value.forEach(infoWindow => {
    infoWindow.close()
  })

  markers.value = []
  infoWindows.value = []
  currentInfoWindow.value = null
}

// 선택된 매장 마커 강조
const highlightSelectedMarker = async (selectedStore) => {
  if (!selectedStore || !map.value) return

  const targetMarker = markers.value.find(
    marker => marker.storeData?.id === selectedStore.id
  )

  if (targetMarker) {
    try {
      // ✅ 서비스를 통해 일관되게 kakao 객체 가져오기
      const kakao = await kakaoMapService.loadKakaoMapSDK()
      const position = new kakao.maps.LatLng(
        selectedStore.latitude,
        selectedStore.longitude
      )
      
      map.value.panTo(position)

      // 인포윈도우 표시
      const targetInfoWindow = infoWindows.value[markers.value.indexOf(targetMarker)]
      if (targetInfoWindow) {
        if (currentInfoWindow.value) {
          currentInfoWindow.value.close()
        }
        targetInfoWindow.open(map.value, targetMarker)
        currentInfoWindow.value = targetInfoWindow
      }
    } catch (error) {
      console.error('Failed to highlight marker:', error)
    }
  }
}

// 지도 중심 이동
const moveToLocation = async (location) => {
  if (!map.value) return

  try {
    const kakao = await kakaoMapService.loadKakaoMapSDK()
    const moveLatLon = new kakao.maps.LatLng(location.latitude, location.longitude)
    map.value.setCenter(moveLatLon)
  } catch (error) {
    console.error('Move to location error:', error)
  }
}

// 현재 위치 가져오기
const getCurrentLocation = async () => {
  if (!navigator.geolocation) {
    alert('브라우저에서 위치 서비스를 지원하지 않습니다.')
    return
  }

  loading.value = true

  try {
    const position = await storeStore.getCurrentLocation()
    await moveToLocation(position)
    
    // 새로운 위치에서 매장 검색
    handleMapMove()
  } catch (error) {
    console.error('Get current location error:', error)
    alert('현재 위치를 가져올 수 없습니다. 위치 권한을 확인해 주세요.')
  } finally {
    loading.value = false
  }
}

// 내 가게 위치로 이동
const goToMyStore = () => {
  emit('go-to-my-store')
}

// 지도 이동 처리
const handleMapMove = () => {
  if (!map.value) return

  const center = map.value.getCenter()
  const bounds = kakaoMapService.getMapBounds(map.value)

  const mapData = {
    center: {
      latitude: center.getLat(),
      longitude: center.getLng()
    },
    bounds
  }

  emit('map-move', mapData)
}

// 지도 재로드
const retryMapLoad = () => {
  mapError.value = ''
  initializeMap()
}

// 워처
watch(
  () => props.stores,
  () => {
    updateMarkers()
  },
  { deep: true }
)

watch(
  () => props.selectedStore,
  (selectedStore) => {
    highlightSelectedMarker(selectedStore)
  }
)

watch(
  () => props.center,
  (newCenter) => {
    moveToLocation(newCenter)
  },
  { deep: true }
)

// 라이프사이클
onMounted(async () => {
  await nextTick()
  await initializeMap()
})

onUnmounted(() => {
  clearMarkers()
  if (map.value) {
    map.value = null
  }
})
</script>

<style scoped>
.kakao-map-container {
  position: relative;
  width: 100%;
  height: 100%;
  background: #f5f5f5;
}

.map {
  width: 100%;
  height: 100%;
}

/* 지도 컨트롤 */
.map-controls {
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 지도 버튼 공통 스타일 */
.current-location-btn,
.my-store-btn {
  width: 44px !important;
  height: 44px !important;
  border-radius: 6px; /* 좀 더 둥글게 */
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.25) !important; /* 그림자 강화 */
  transition: all 0.2s;
  display: flex !important;
  align-items: center;
  justify-content: center;
  border: none;
  position: relative !important;
  z-index: 1001 !important; /* 버튼도 높은 z-index */
}

.current-location-btn:hover,
.my-store-btn:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

/* 현재 위치 버튼 */
.current-location-btn {
  background: white;
  color: #374151;
  border: 1px solid #e5e7eb;
}

.current-location-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 내 가게 위치 버튼 */
.my-store-btn {
  background: #ff6b35 !important;
  color: white !important;
  border: 2px solid #ff6b35 !important;
}

.my-store-btn:hover {
  background: #e55a2b !important;
  border-color: #e55a2b !important;
}

.icon-gps::before {
  content: "📍";
  font-size: 18px;
}

.icon-gps.loading {
  animation: spin 1s linear infinite;
}

.icon-store::before {
  content: "🏬";
  font-size: 18px;
}

/* 지도 로딩 */
.map-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 20;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #ff6b35;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.map-loading p {
  color: #6b7280;
  font-size: 14px;
  margin: 0;
}

/* 지도 에러 */
.map-error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  z-index: 20;
  max-width: 300px;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.map-error h3 {
  margin: 0 0 8px;
  font-size: 18px;
  color: #dc2626;
}

.map-error p {
  margin: 0 0 20px;
  font-size: 14px;
  color: #6b7280;
}

.retry-btn {
  padding: 10px 20px;
  background: #ff6b35;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.retry-btn:hover {
  background: #e55a2b;
}

/* 애니메이션 */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 반응형 */
@media (max-width: 768px) {
  .map-controls {
    bottom: 16px;
    right: 16px;
  }

  .current-location-btn,
  .my-store-btn {
    width: 40px;
    height: 40px;
  }

  .icon-gps::before,
  .icon-store::before {
    font-size: 16px;
  }

  .map-error {
    margin: 20px;
    max-width: calc(100vw - 40px);
    padding: 30px 20px;
  }
}

/* 다크모드 대응 */
@media (prefers-color-scheme: dark) {
  .kakao-map-container {
    background: #1f2937;
  }

  .current-location-btn {
    background: #374151;
    border-color: #4b5563;
  }

  .my-store-btn {
    background: #ff6b35;
  }

  .my-store-btn:hover {
    background: #e55a2b;
  }

  .map-loading {
    background: rgba(31, 41, 55, 0.9);
  }

  .map-loading p {
    color: #d1d5db;
  }

  .map-error {
    background: #374151;
    color: #e5e7eb;
  }

  .map-error h3 {
    color: #ef4444;
  }

  .map-error p {
    color: #9ca3af;
  }
}
/* 맵 레이어는 그냥 바닥에 깔리게 */
.map {
  position: relative; /* 혹시 전역에서 absolute 준 게 있으면 덮어쓰기 */
  z-index: 1;
}

/* 컨트롤은 확실히 그 위로 */
.map-controls {
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 9999; /* 맵 위로 확실히 올리기 */
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 혹시 어디선가 display:none; 먹은 경우 대비 */
.current-location-btn,
.my-store-btn {
  display: flex !important;
}


</style>
