<template>
  <div class="store-detail-page">
    <!-- 글로벌 헤더 -->
    <GlobalHeader />

    <div class="main-content">
      <div class="content-container">
        <!-- 뒤로 가기 -->
        <div class="navigation">
          <button @click="goBack" class="back-btn">
            <i class="icon-arrow-left"></i>
            제휴매장 찾기로 돌아가기
          </button>
        </div>

        <!-- 매장 정보가 있을 때 -->
        <div v-if="store" class="store-detail">
          
          <!-- 매장 대표 이미지 -->
          <div class="store-images-section">
            <div class="main-image-container">
              <img 
                :src="store.mainImage || '/images/store-placeholder.jpeg'"
                :alt="store.name"
                class="main-image"
                @error="handleImageError"
              />
              <div v-if="store.is_member" class="member-badge">
                회원매장
              </div>
            </div>

            <!-- 추가 이미지들 -->
            <div v-if="store.images && store.images.length > 0" class="image-gallery">
              <h3 class="gallery-title">매장 사진</h3>
              <div class="gallery-grid">
                <img 
                  v-for="(image, index) in store.images" 
                  :key="index"
                  :src="image" 
                  :alt="`${store.name} 사진 ${index + 1}`"
                  class="gallery-image"
                  @click="openImageModal(image)"
                  @error="handleImageError"
                />
              </div>
            </div>
          </div>

          <!-- 매장 정보 -->
          <div class="store-info-section">
            
            <!-- 매장명 -->
            <div class="store-header">
              <h1 class="store-name">{{ store.name }}</h1>
              <div class="store-meta">
                <span v-if="store.rating" class="rating">
                  ⭐ {{ store.rating }}
                </span>
                <span class="distance">{{ store.distance || '거리 정보 없음' }}</span>
              </div>
            </div>

            <!-- 매장 소개 -->
            <div v-if="store.description" class="info-group">
              <h3 class="info-title">
                <i class="info-icon">📄</i>
                매장 소개
              </h3>
              <div class="info-content">
                <p class="store-description">{{ store.description }}</p>
              </div>
            </div>

            <!-- 연락처 -->
            <div class="info-group">
              <h3 class="info-title">
                <i class="info-icon">📞</i>
                연락처
              </h3>
              <div class="info-content">
                <div class="contact-item">
                  <span class="contact-number">{{ store.phone }}</span>
                  <button @click="callStore" class="call-btn">
                    📞 전화걸기
                  </button>
                </div>
              </div>
            </div>

            <!-- 주소 -->
            <div class="info-group">
              <h3 class="info-title">
                <i class="info-icon">🏠</i>
                주소
              </h3>
              <div class="info-content">
                <p class="store-address">{{ store.address }}</p>
                <button @click="openMap" class="map-btn">
                  🗺️ 지도에서 보기
                </button>
              </div>
            </div>

            <!-- 영업시간 -->
            <div v-if="store.operatingHours" class="info-group">
              <h3 class="info-title">
                <i class="info-icon">🕒</i>
                영업시간
              </h3>
              <div class="info-content">
                <div class="operating-hours">
                  <div class="hours-item">
                    <span class="day-label">평일</span>
                    <span class="time-range">
                      {{ store.operatingHours.weekday.open }} - {{ store.operatingHours.weekday.close }}
                    </span>
                  </div>
                  <div class="hours-item">
                    <span class="day-label">주말</span>
                    <span class="time-range">
                      {{ store.operatingHours.weekend.open }} - {{ store.operatingHours.weekend.close }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 추가 정보 -->
            <div class="additional-info">
              <div class="info-item">
                <span class="info-label">등록일</span>
                <span class="info-value">{{ formatDate(store.createdAt) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">업데이트</span>
                <span class="info-value">{{ formatDate(store.updatedAt) }}</span>
              </div>
            </div>

          </div>
        </div>

        <!-- 로딩 상태 -->
        <div v-else-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>매장 정보를 불러오는 중...</p>
        </div>

        <!-- 에러 상태 -->
        <div v-else-if="error" class="error-state">
          <div class="error-icon">❌</div>
          <h3>매장 정보를 불러올 수 없습니다</h3>
          <p>{{ error }}</p>
          <button @click="retryLoad" class="retry-btn">다시 시도</button>
        </div>

        <!-- 매장을 찾을 수 없음 -->
        <div v-else class="not-found">
          <div class="not-found-icon">🏪</div>
          <h3>매장을 찾을 수 없습니다</h3>
          <p>존재하지 않거나 삭제된 매장입니다.</p>
          <button @click="goBack" class="back-btn-large">
            제휴매장 찾기로 돌아가기
          </button>
        </div>
      </div>
    </div>

    <!-- 이미지 모달 -->
    <div v-if="showImageModal" class="image-modal" @click="closeImageModal">
      <div class="modal-content" @click.stop>
        <img :src="selectedImage" alt="확대 이미지" class="modal-image" />
        <button @click="closeImageModal" class="modal-close-btn">✕</button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeApi } from '../services/api'
import GlobalHeader from '../components/GlobalHeader.vue'

const route = useRoute()
const router = useRouter()

// 상태
const store = ref(null)
const loading = ref(true)
const error = ref(null)
const showImageModal = ref(false)
const selectedImage = ref('')

// Props (라우트 파라미터)
const storeId = computed(() => route.params.id)

// 메서드
const loadStoreDetail = async () => {
  loading.value = true
  error.value = null

  try {
    console.log('매장 상세 정보 로딩:', storeId.value)
    
    // 실제 API 호출
    const response = await storeApi.getStoreDetail(storeId.value)
    store.value = response.store

  } catch (err) {
    console.error('매장 정보 로딩 실패:', err)
    error.value = err.message || '매장 정보를 불러오는 중 오류가 발생했습니다.'
    store.value = null
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/')
}

const retryLoad = () => {
  loadStoreDetail()
}

const callStore = () => {
  if (store.value?.phone) {
    const confirmed = confirm(`${store.value.name}에 전화를 거시겠습니까?\n${store.value.phone}`)
    if (confirmed) {
      window.location.href = `tel:${store.value.phone}`
    }
  }
}

const openMap = () => {
  if (store.value) {
    const query = encodeURIComponent(`${store.value.name} ${store.value.address}`)
    window.open(`https://map.kakao.com/?q=${query}`, '_blank')
  }
}

const openImageModal = (image) => {
  selectedImage.value = image
  showImageModal.value = true
  document.body.style.overflow = 'hidden'
}

const closeImageModal = () => {
  showImageModal.value = false
  selectedImage.value = ''
  document.body.style.overflow = ''
}

const handleImageError = (event) => {
  event.target.src = '/images/store-placeholder.jpg'
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 라이프사이클
onMounted(() => {
  loadStoreDetail()
})
</script>

<style scoped>
.store-detail-page {
  min-height: 100vh;
  background: #f8fafc;
}

.main-content {
  padding-top: 20px;
  padding-bottom: 40px;
}

.content-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 네비게이션 */
.navigation {
  margin-bottom: 24px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  color: #374151;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.back-btn:hover {
  background: #f9fafb;
  border-color: #ff6b35;
  color: #ff6b35;
}

.icon-arrow-left::before {
  content: "←";
  font-size: 16px;
}

/* 매장 상세 */
.store-detail {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  align-items: start;
}

/* 이미지 섹션 */
.store-images-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.main-image-container {
  position: relative;
  margin-bottom: 24px;
}

.main-image {
  width: 100%;
  height: 300px;
  object-fit: cover;
  border-radius: 12px;
}

.member-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #ff6b35;
  color: white;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
}

.gallery-title {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 8px;
}

.gallery-image {
  width: 100%;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s;
}

.gallery-image:hover {
  transform: scale(1.05);
}

/* 매장 정보 섹션 */
.store-info-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.store-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f3f4f6;
}

.store-name {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 700;
  color: #111827;
}

.store-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rating {
  font-size: 14px;
  color: #f59e0b;
  font-weight: 500;
}

.distance {
  font-size: 12px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 2px 8px;
  border-radius: 4px;
}

/* 정보 그룹 */
.info-group {
  margin-bottom: 24px;
}

.info-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.info-icon {
  font-size: 18px;
}

.info-content {
  padding-left: 26px;
}

.store-description {
  margin: 0;
  line-height: 1.6;
  color: #4b5563;
  font-size: 14px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.contact-number {
  font-size: 16px;
  color: #111827;
  font-weight: 500;
}

.call-btn,
.map-btn {
  padding: 6px 12px;
  background: #ff6b35;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.call-btn:hover,
.map-btn:hover {
  background: #e55a2b;
}

.store-address {
  margin: 0 0 8px;
  font-size: 14px;
  color: #4b5563;
  line-height: 1.5;
}

.operating-hours {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hours-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f9fafb;
  border-radius: 6px;
}

.day-label {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.time-range {
  font-size: 14px;
  color: #6b7280;
}

.additional-info {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-size: 12px;
  color: #6b7280;
}

.info-value {
  font-size: 12px;
  color: #374151;
}

/* 상태들 */
.loading-state,
.error-state,
.not-found {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #ff6b35;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

.error-icon,
.not-found-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.loading-state p,
.error-state p,
.not-found p {
  margin: 8px 0 24px;
  color: #6b7280;
  font-size: 14px;
}

.retry-btn,
.back-btn-large {
  padding: 12px 24px;
  background: #ff6b35;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s;
}

.retry-btn:hover,
.back-btn-large:hover {
  background: #e55a2b;
}

/* 이미지 모달 */
.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}

.modal-image {
  max-width: 100%;
  max-height: 100%;
  border-radius: 8px;
}

.modal-close-btn {
  position: absolute;
  top: -40px;
  right: 0;
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 4px;
}

/* 애니메이션 */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 반응형 */
@media (max-width: 768px) {
  .content-container {
    padding: 0 16px;
  }

  .store-detail {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .store-images-section,
  .store-info-section {
    padding: 20px;
  }

  .store-name {
    font-size: 20px;
  }

  .main-image {
    height: 200px;
  }

  .gallery-grid {
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  }

  .gallery-image {
    height: 60px;
  }

  .contact-item,
  .hours-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}

/* 다크모드 */
@media (prefers-color-scheme: dark) {
  .store-detail-page {
    background: #111827;
  }

  .store-images-section,
  .store-info-section,
  .loading-state,
  .error-state,
  .not-found {
    background: #1f2937;
    color: #e5e7eb;
  }

  .back-btn {
    background: #374151;
    border-color: #4b5563;
    color: #d1d5db;
  }

  .back-btn:hover {
    background: #4b5563;
    color: #ff6b35;
  }

  .store-name,
  .info-title {
    color: #f9fafb;
  }

  .store-description,
  .store-address {
    color: #d1d5db;
  }

  .hours-item {
    background: #374151;
  }

  .day-label {
    color: #e5e7eb;
  }

  .time-range {
    color: #9ca3af;
  }
}
</style>