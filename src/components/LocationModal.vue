<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>지역 선택</h3>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="modal-body">
        <!-- 검색 입력 -->
        <div class="search-section">
          <input 
            type="text"
            v-model="searchQuery"
            @input="handleSearchInput"
            placeholder="지역명을 입력하세요 (예: 서울시 강남구)"
            class="search-input"
          />
          <button class="current-location-btn" @click="getCurrentLocation">
            <i class="icon-gps"></i>
            현재 위치
          </button>
        </div>

        <!-- 자동완성 결과 -->
        <div v-if="suggestions.length" class="suggestions">
          <div 
            v-for="suggestion in suggestions"
            :key="suggestion.id"
            @click="selectSuggestion(suggestion)"
            class="suggestion-item"
          >
            <i class="icon-location"></i>
            <div class="suggestion-info">
              <div class="suggestion-name">{{ suggestion.name }}</div>
              <div class="suggestion-address">{{ suggestion.address }}</div>
            </div>
          </div>
        </div>

        <!-- 인기 지역 -->
        <div v-if="!searchQuery" class="popular-regions">
          <h4>인기 지역</h4>
          <div class="region-grid">
            <button 
              v-for="region in popularRegions"
              :key="region.id"
              @click="selectRegion(region)"
              class="region-btn"
            >
              {{ region.name }}
            </button>
          </div>
        </div>

        <!-- 로딩 상태 -->
        <div v-if="loading" class="loading">
          지역 정보를 가져오는 중...
        </div>

        <!-- 에러 상태 -->
        <div v-if="error" class="error">
          {{ error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeApi } from '../services/api'
import { kakaoMapService } from '../services/kakaoMap'

const emit = defineEmits(['close', 'select'])

// 상태
const searchQuery = ref('')
const suggestions = ref([])
const loading = ref(false)
const error = ref('')

// 인기 지역 데이터
const popularRegions = ref([
  { id: 1, name: '서울시 중구', address: '서울특별시 중구', latitude: 37.5665, longitude: 126.9780 },
  { id: 2, name: '강남역', address: '서울특별시 강남구 강남대로 지하 396', latitude: 37.4979, longitude: 127.0276 },
  { id: 3, name: '홍대입구역', address: '서울특별시 마포구 양화로 지하 188', latitude: 37.5567, longitude: 126.9225 },
  { id: 4, name: '명동', address: '서울특별시 중구 명동길', latitude: 37.5636, longitude: 126.9834 },
  { id: 5, name: '이태원', address: '서울특별시 용산구 이태원로', latitude: 37.5347, longitude: 126.9947 },
  { id: 6, name: '신촌', address: '서울특별시 서대문구 신촌로', latitude: 37.5551, longitude: 126.9366 }
])

let searchTimeout = null

// 메서드
const handleSearchInput = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  // 디바운싱 적용 (500ms)
  searchTimeout = setTimeout(() => {
    if (searchQuery.value.trim().length >= 2) {
      searchRegions()
    } else {
      suggestions.value = []
    }
  }, 500)
}

const searchRegions = async () => {
  try {
    loading.value = true
    error.value = ''

    const response = await storeApi.searchRegions(searchQuery.value)
    suggestions.value = response.regions || []
  } catch (err) {
    error.value = '지역 검색 중 오류가 발생했습니다.'
    console.error('Region search error:', err)
  } finally {
    loading.value = false
  }
}

const selectSuggestion = async (suggestion) => {
  try {
    loading.value = true
    
    // 좌표가 없는 경우 주소로 좌표 변환
    if (!suggestion.latitude || !suggestion.longitude) {
      const coords = await kakaoMapService.geocode(suggestion.address)
      suggestion.latitude = coords.latitude
      suggestion.longitude = coords.longitude
    }

    const location = {
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
      address: suggestion.address
    }

    emit('select', location)
  } catch (err) {
    error.value = '위치 정보를 가져올 수 없습니다.'
    console.error('Location select error:', err)
  } finally {
    loading.value = false
  }
}

const selectRegion = (region) => {
  const location = {
    latitude: region.latitude,
    longitude: region.longitude,
    address: region.address
  }

  emit('select', location)
}

const getCurrentLocation = () => {
  if (!navigator.geolocation) {
    error.value = '브라우저에서 위치 서비스를 지원하지 않습니다.'
    return
  }

  loading.value = true
  error.value = ''

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const latitude = position.coords.latitude
        const longitude = position.coords.longitude
        
        // 좌표를 주소로 변환
        const address = await kakaoMapService.reverseGeocode(latitude, longitude)
        
        const location = {
          latitude,
          longitude,
          address
        }

        emit('select', location)
      } catch (err) {
        error.value = '현재 위치의 주소를 찾을 수 없습니다.'
        console.error('Reverse geocoding error:', err)
      } finally {
        loading.value = false
      }
    },
    (err) => {
      error.value = '현재 위치를 가져올 수 없습니다. 위치 권한을 확인해 주세요.'
      console.error('Geolocation error:', err)
      loading.value = false
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    }
  )
}
</script>

<style scoped>
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
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 20px 24px 24px;
  max-height: 60vh;
  overflow-y: auto;
}

/* 검색 섹션 */
.search-section {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #ff6b35;
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

.current-location-btn {
  padding: 12px 16px;
  background: #ff6b35;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}

.current-location-btn:hover {
  background: #e55a2b;
}

.icon-gps::before {
  content: "🎯";
  margin-right: 4px;
}

/* 자동완성 */
.suggestions {
  margin-bottom: 20px;
}

.suggestion-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid #f3f4f6;
}

.suggestion-item:hover {
  background: #f9fafb;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.icon-location::before {
  content: "📍";
  font-size: 16px;
  margin-right: 12px;
}

.suggestion-info {
  flex: 1;
}

.suggestion-name {
  font-weight: 500;
  color: #111827;
  margin-bottom: 2px;
}

.suggestion-address {
  font-size: 12px;
  color: #6b7280;
}

/* 인기 지역 */
.popular-regions h4 {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.region-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;
}

.region-btn {
  padding: 10px 12px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.region-btn:hover {
  background: #fff7f5;
  border-color: #ff6b35;
  color: #ff6b35;
}

/* 상태 메시지 */
.loading, .error {
  text-align: center;
  padding: 20px;
  font-size: 14px;
}

.loading {
  color: #6b7280;
}

.error {
  color: #dc2626;
  background: #fef2f2;
  border-radius: 6px;
}

/* 반응형 */
@media (max-width: 480px) {
  .modal-content {
    width: 95%;
    margin: 20px;
  }

  .search-section {
    flex-direction: column;
  }

  .region-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
