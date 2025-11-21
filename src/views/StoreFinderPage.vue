<template>
  <div class="store-finder-page">
    <!-- 글로벌 헤더 -->
    <GlobalHeader />

    <!-- 메인 컨텐츠 -->
    <div class="main-content">
      <!-- 좌측 패널: 매장 리스트 -->
      <div class="left-panel">
        <StoreList
          :selected-store-id="selectedStoreId"
          @store-select="handleStoreSelect"
          @store-hover="handleStoreHover"
        />
      </div>

      <!-- 우측 패널: 지도 -->
      <div class="right-panel">
        <KakaoMap
          :stores="sortedStores"
          :selected-store="selectedStore"
          :center="mapCenter"
          @marker-click="handleMarkerClick"
          @map-move="handleMapMove"
          @map-ready="handleMapReady"
          @go-to-my-store="handleGoToMyStore"
        />
      </div>
    </div>

    <!-- 모바일 뷰: 하단 시트 -->
    <div 
      v-if="isMobile && selectedStore"
      class="mobile-bottom-sheet"
      :class="{ expanded: isMobileSheetExpanded }"
    >
      <div class="sheet-handle" @click="toggleMobileSheet">
        <div class="handle-bar"></div>
      </div>
      
      <div class="sheet-content">
        <StoreListItem
          v-if="selectedStore"
          :store="selectedStore"
          :is-selected="true"
          @click="goToStoreDetail"
        />
      </div>
    </div>

    <!-- 로딩 오버레이 -->
    <div v-if="isInitialLoading" class="loading-overlay">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <h3>매장을 검색하고 있습니다</h3>
        <p>잠시만 기다려 주세요...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useStoreStore } from '../stores/store'
import { useAuthStore } from '../stores/auth'
import GlobalHeader from '../components/GlobalHeader.vue'
import StoreList from '../components/StoreList.vue'
import StoreListItem from '../components/StoreListItem.vue'
import KakaoMap from '../components/KakaoMap.vue'

const router = useRouter()
const storeStore = useStoreStore()
const authStore = useAuthStore()

// 상태
const selectedStore = ref(null)
const isMobileSheetExpanded = ref(false)
const mapInstance = ref(null)
const isInitialLoading = ref(true)

// 반응형 상태
const isMobile = ref(false)
const isTablet = ref(false)

// 계산된 속성
const selectedStoreId = computed(() => selectedStore.value?.id)

const sortedStores = computed(() => storeStore.sortedStores)

const mapCenter = computed(() => ({
  latitude: storeStore.currentLocation.latitude,
  longitude: storeStore.currentLocation.longitude
}))

// 메서드
const handleStoreSelect = (store) => {
  selectedStore.value = store
  storeStore.setSelectedStore(store)
  
  // 모바일에서는 하단 시트 표시
  if (isMobile.value) {
    isMobileSheetExpanded.value = true
  }
}

const handleStoreHover = (store) => {
  // 데스크톱에서만 호버 효과 적용
  if (!isMobile.value && !isTablet.value) {
    storeStore.setSelectedStore(store)
  }
}

const handleMarkerClick = (store) => {
  selectedStore.value = store
  storeStore.setSelectedStore(store)
  
  // 모바일에서는 하단 시트 표시
  if (isMobile.value) {
    isMobileSheetExpanded.value = true
  }
}

const handleMapMove = async (mapData) => {
  // 지도 중심이 크게 변경된 경우에만 새로 검색
  const centerChanged = Math.abs(mapData.center.latitude - storeStore.currentLocation.latitude) > 0.01 ||
                       Math.abs(mapData.center.longitude - storeStore.currentLocation.longitude) > 0.01
  
  if (centerChanged) {
    storeStore.setCurrentLocation({
      latitude: mapData.center.latitude,
      longitude: mapData.center.longitude
    })
    
    // 디바운싱을 위해 잠시 대기 후 검색
    setTimeout(() => {
      storeStore.searchStores()
    }, 800)
  }
}

const handleMapReady = (map) => {
  mapInstance.value = map
  // 지도 준비 완료 후 초기 검색
  initialSearch()
}

const handleGoToMyStore = () => {
  // 📍 Store에서 내 매장 좌표 확인
  const myStoreCoordinates = storeStore.myStoreInfo.coordinates
  
  if (authStore.isLoggedIn && myStoreCoordinates) {
    console.log('🏬 내 매장 위치로 이동:', myStoreCoordinates)
    storeStore.setCurrentLocation(myStoreCoordinates)
    // 내 매장 위치에서 매장 검색
    storeStore.searchStores()
  } else if (!authStore.isLoggedIn) {
    // 로그인하지 않은 경우 로그인 유도
    alert('내 가게 위치를 보려면 로그인이 필요합니다.')
    router.push('/login')
  } else {
    // 로그인했지만 매장 정보가 없는 경우
    alert('내 매장 위치 정보를 불러올 수 없습니다.')
  }
}

const toggleMobileSheet = () => {
  isMobileSheetExpanded.value = !isMobileSheetExpanded.value
}

const goToStoreDetail = (store) => {
  if (store.is_member) {
    router.push(`/store/${store.id}`)
  } else {
    // 일반 매장은 카카오맵으로 이동
    if (store.place_url) {
      window.open(store.place_url, '_blank')
    }
  }
}

// 초기 검색
const initialSearch = async () => {
  try {
    isInitialLoading.value = true
    
    // 로그인 상태에 따른 초기 위치 설정
    const myStoreCoordinates = storeStore.myStoreInfo.coordinates
    
    if (authStore.isLoggedIn && myStoreCoordinates) {
      // 로그인한 사용자: 내 가게 위치를 중심으로 설정
      storeStore.setCurrentLocation(myStoreCoordinates)
      console.log('✅ 로그인 사용자: 내 가게 위치로 설정', myStoreCoordinates)
    } else {
      // 비로그인 사용자 또는 매장 정보 없는 경우: 현재 위치 가져오기 시도
      try {
        await storeStore.getCurrentLocation()
        console.log('✅ 현재 위치로 설정')
      } catch (error) {
        console.log('📍 위치 권한 없음: 기본 위치(서울시청) 사용')
        // 기본 위치는 store에서 이미 설정되어 있음
      }
    }
    
    // 매장 검색 실행
    await storeStore.searchStores()
    
  } catch (error) {
    console.error('Initial search error:', error)
  } finally {
    setTimeout(() => {
      isInitialLoading.value = false
    }, 1000) // 최소 1초간 로딩 표시
  }
}

// 반응형 처리
const checkViewport = () => {
  const width = window.innerWidth
  isMobile.value = width < 768
  isTablet.value = width >= 768 && width < 1024
  
  // 모바일이 아닐 때는 하단 시트 닫기
  if (!isMobile.value) {
    isMobileSheetExpanded.value = false
  }
}

const handleResize = () => {
  checkViewport()
}

// 키보드 단축키
const handleKeyDown = (event) => {
  // ESC 키로 선택 해제
  if (event.key === 'Escape') {
    selectedStore.value = null
    storeStore.setSelectedStore(null)
    isMobileSheetExpanded.value = false
  }
}

// 라이프사이클
onMounted(() => {
  checkViewport()
  window.addEventListener('resize', handleResize)
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('keydown', handleKeyDown)
})

// 선택된 매장 변경 감지
watch(selectedStore, (newStore) => {
  // 선택 해제 시 하단 시트 닫기
  if (!newStore && isMobile.value) {
    isMobileSheetExpanded.value = false
  }
})
</script>

<style scoped>
.store-finder-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

/* 메인 컨텐츠 */
.main-content {
  display: flex;
  flex: 1;
  min-height: 0;
}

/* 좌측 패널 */
.left-panel {
  width: 35%;
  max-width: 500px;
  min-width: 300px;
  background: white;
  border-right: 1px solid #e5e7eb;
}

/* 우측 패널 */
.right-panel {
  flex: 1;
  position: relative;
  background: #f5f5f5;
}

/* 모바일 하단 시트 */
.mobile-bottom-sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-radius: 16px 16px 0 0;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.1);
  transform: translateY(calc(100% - 60px));
  transition: transform 0.3s ease;
  z-index: 100;
  max-height: 50vh;
}

.mobile-bottom-sheet.expanded {
  transform: translateY(0);
}

.sheet-handle {
  padding: 12px;
  text-align: center;
  cursor: pointer;
}

.handle-bar {
  width: 40px;
  height: 4px;
  background: #d1d5db;
  border-radius: 2px;
  margin: 0 auto;
}

.sheet-content {
  padding: 0 16px 20px;
  overflow-y: auto;
}

/* 로딩 오버레이 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.loading-content {
  text-align: center;
  max-width: 300px;
  padding: 40px;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #ff6b35;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 24px;
}

.loading-content h3 {
  margin: 0 0 8px;
  font-size: 18px;
  color: #111827;
}

.loading-content p {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 태블릿 반응형 */
@media (max-width: 1024px) {
  .left-panel {
    width: 40%;
    min-width: 280px;
  }
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }

  .left-panel {
    width: 100%;
    max-width: none;
    min-width: 0;
    height: 40%;
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
  }

  .right-panel {
    flex: 1;
  }
}

/* 다크모드 대응 */
@media (prefers-color-scheme: dark) {
  .left-panel {
    background: #1f2937;
    border-right-color: #374151;
  }

  .mobile-bottom-sheet {
    background: #1f2937;
  }

  .loading-overlay {
    background: rgba(31, 41, 55, 0.95);
  }

  .loading-content h3 {
    color: #f3f4f6;
  }

  .loading-content p {
    color: #9ca3af;
  }
}
</style>
