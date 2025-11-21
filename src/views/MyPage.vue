<template>
  <div class="mypage">
    <!-- 글로벌 헤더 -->
    <GlobalHeader />

    <!-- 메인 컨텐츠 -->
    <div class="main-content">
      <div class="content-container">
        <!-- 페이지 헤더 -->
        <div class="page-header">
          <h1>내 매장 관리</h1>
          <p>매장 정보를 수정하고 관리하세요</p>
        </div>

        <!-- 매장 정보 수정 폼 -->
        <div class="store-form-section">
          <form @submit.prevent="saveStoreInfo" class="store-form">
            
            <!-- 가게 대표사진 -->
            <div class="form-group">
              <label class="form-label">
                <span class="label-text">대표사진</span>
                <span class="label-required">*</span>
              </label>
              <div class="main-image-upload">
                <div class="main-image-preview" @click="selectMainImage">
                  <img 
                    v-if="storeInfo.mainImage" 
                    :src="storeInfo.mainImage" 
                    alt="대표사진"
                    class="preview-image"
                  />
                  <div v-else class="upload-placeholder">
                    <div class="upload-icon">📷</div>
                    <span>대표사진 업로드</span>
                  </div>
                  <div class="upload-overlay">
                    <span>📷 변경</span>
                  </div>
                </div>
                <input 
                  ref="mainImageInput" 
                  type="file" 
                  accept="image/*" 
                  @change="handleMainImageUpload"
                  class="file-input"
                />
                <p class="upload-hint">권장 크기: 800x600px, 최대 5MB</p>
              </div>
            </div>

            <!-- 가게 사진들 -->
            <div class="form-group">
              <label class="form-label">
                <span class="label-text">매장 사진</span>
                <span class="label-count">({{ storeInfo.images.length }}/5)</span>
              </label>
              <div class="images-upload">
                <div class="images-grid">
                  <!-- 기존 이미지들 -->
                  <div 
                    v-for="(image, index) in storeInfo.images" 
                    :key="'img-' + index"
                    class="image-item"
                  >
                    <img :src="image" :alt="`매장사진 ${index + 1}`" />
                    <button 
                      type="button"
                      @click="removeImage(index)"
                      class="remove-image-btn"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <!-- 추가 업로드 버튼 -->
                  <div 
                    v-if="storeInfo.images.length < 5"
                    class="add-image-btn"
                    @click="selectImages"
                  >
                    <div class="add-icon">+</div>
                    <span>사진 추가</span>
                  </div>
                </div>
                <input 
                  ref="imagesInput" 
                  type="file" 
                  accept="image/*" 
                  multiple
                  @change="handleImagesUpload"
                  class="file-input"
                />
                <p class="upload-hint">최대 5장까지 업로드 가능, 각 이미지 최대 5MB</p>
              </div>
            </div>

            <!-- 매장명 -->
            <div class="form-group">
              <label class="form-label">
                <span class="label-text">매장명</span>
                <span class="label-required">*</span>
              </label>
              <input 
                v-model="storeInfo.name"
                type="text" 
                class="form-input"
                placeholder="매장 이름을 입력하세요"
                required
              />
            </div>

            <!-- 매장 설명 -->
            <div class="form-group">
              <label class="form-label">
                <span class="label-text">매장 소개</span>
              </label>
              <textarea 
                v-model="storeInfo.description"
                class="form-textarea"
                rows="4"
                placeholder="매장의 특징, 주요 메뉴, 분위기 등을 소개해 주세요"
                maxlength="500"
              ></textarea>
              <div class="char-count">{{ storeInfo.description.length }}/500</div>
            </div>

            <!-- 연락처 -->
            <div class="form-group">
              <label class="form-label">
                <span class="label-text">연락처</span>
                <span class="label-required">*</span>
              </label>
              <input 
                v-model="storeInfo.phone"
                type="tel" 
                class="form-input"
                placeholder="02-1234-5678"
                required
              />
            </div>

            <!-- 주소 (읽기전용) -->
            <div class="form-group">
              <label class="form-label">
                <span class="label-text">매장 주소</span>
              </label>
              <input 
                :value="storeInfo.address"
                type="text" 
                class="form-input readonly"
                readonly
              />
              <p class="form-hint">주소 변경은 고객센터로 문의해 주세요</p>
            </div>

            <!-- 영업시간 -->
            <div class="form-group">
              <label class="form-label">
                <span class="label-text">영업시간</span>
              </label>
              <div class="operating-hours">
                <div class="time-input-group">
                  <label>평일</label>
                  <input 
                    v-model="storeInfo.operatingHours.weekday.open"
                    type="time" 
                    class="time-input"
                  />
                  <span>~</span>
                  <input 
                    v-model="storeInfo.operatingHours.weekday.close"
                    type="time" 
                    class="time-input"
                  />
                </div>
                <div class="time-input-group">
                  <label>주말</label>
                  <input 
                    v-model="storeInfo.operatingHours.weekend.open"
                    type="time" 
                    class="time-input"
                  />
                  <span>~</span>
                  <input 
                    v-model="storeInfo.operatingHours.weekend.close"
                    type="time" 
                    class="time-input"
                  />
                </div>
              </div>
            </div>

            <!-- 저장 버튼 -->
            <div class="form-actions">
              <button 
                type="button" 
                @click="resetForm"
                class="btn-secondary"
                :disabled="saving"
              >
                초기화
              </button>
              <button 
                type="submit" 
                class="btn-primary"
                :disabled="saving"
              >
                <span v-if="saving" class="loading-spinner"></span>
                {{ saving ? '저장 중...' : '저장하기' }}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import GlobalHeader from '../components/GlobalHeader.vue'

const router = useRouter()
const authStore = useAuthStore()

// 상태
const saving = ref(false)
const mainImageInput = ref(null)
const imagesInput = ref(null)

// 매장 정보
const storeInfo = reactive({
  name: '영천생고기',
  description: '',
  phone: '02-722-9291',
  address: '서울특별시 종로구 통일로14길 10',
  mainImage: '/images/store-main.jpg',
  images: [

  ],
  operatingHours: {
    weekday: {
      open: '09:00',
      close: '22:00'
    },
    weekend: {
      open: '10:00',
      close: '23:00'
    }
  }
})

// 메서드
const selectMainImage = () => {
  mainImageInput.value?.click()
}

const selectImages = () => {
  imagesInput.value?.click()
}

const handleMainImageUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  if (file.size > 5 * 1024 * 1024) {
    alert('파일 크기는 5MB를 초과할 수 없습니다.')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    storeInfo.mainImage = e.target.result
  }
  reader.readAsDataURL(file)
}

const handleImagesUpload = (event) => {
  const files = Array.from(event.target.files)
  if (!files.length) return

  const remainingSlots = 5 - storeInfo.images.length
  if (files.length > remainingSlots) {
    alert(`최대 ${remainingSlots}장까지만 추가할 수 있습니다.`)
    return
  }

  files.forEach(file => {
    if (file.size > 5 * 1024 * 1024) {
      alert(`${file.name}은 파일 크기가 5MB를 초과합니다.`)
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      if (storeInfo.images.length < 5) {
        storeInfo.images.push(e.target.result)
      }
    }
    reader.readAsDataURL(file)
  })

  // 파일 입력 초기화
  event.target.value = ''
}

const removeImage = (index) => {
  if (confirm('이 사진을 삭제하시겠습니까?')) {
    storeInfo.images.splice(index, 1)
  }
}

const saveStoreInfo = async () => {
  if (!storeInfo.name.trim()) {
    alert('매장명을 입력해 주세요.')
    return
  }

  if (!storeInfo.phone.trim()) {
    alert('연락처를 입력해 주세요.')
    return
  }

  if (!storeInfo.mainImage) {
    alert('대표사진을 업로드해 주세요.')
    return
  }

  saving.value = true

  try {
    // TODO: 실제 API 호출
    console.log('매장 정보 저장:', storeInfo)
    
    // 임시 지연
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    alert('매장 정보가 성공적으로 저장되었습니다.')
    
  } catch (error) {
    console.error('저장 실패:', error)
    alert('저장에 실패했습니다. 다시 시도해 주세요.')
  } finally {
    saving.value = false
  }
}

const resetForm = () => {
  if (confirm('모든 변경사항이 초기화됩니다. 계속하시겠습니까?')) {
    // 초기 데이터로 리셋
    Object.assign(storeInfo, {
      name: '구본경의 카페',
      description: '신선한 원두로 내린 커피와 수제 디저트를 즐길 수 있는 아늑한 공간입니다.',
      phone: '02-1234-5678',
      address: '서울특별시 중구 명동길 26',
      mainImage: '/images/store-main.jpg',
      images: [
        '/images/store-1.jpg',
        '/images/store-2.jpg', 
        '/images/store-3.jpg'
      ],
      operatingHours: {
        weekday: { open: '09:00', close: '22:00' },
        weekend: { open: '10:00', close: '23:00' }
      }
    })
  }
}

// 라이프사이클
onMounted(() => {
  console.log('📱 Store Management Page loaded')
  
  // 로그인 체크
  if (!authStore.isLoggedIn) {
    alert('로그인이 필요합니다.')
    router.push('/')
    return
  }
})
</script>

<style scoped>
.mypage {
  min-height: 100vh;
  background: #f8fafc;
}

.main-content {
  padding-top: 20px;
  padding-bottom: 40px;
}

.content-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 페이지 헤더 */
.page-header {
  margin-bottom: 32px;
  text-align: center;
}

.page-header h1 {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 700;
  color: #111827;
}

.page-header p {
  margin: 0;
  font-size: 16px;
  color: #6b7280;
}

/* 폼 섹션 */
.store-form-section {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.store-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 폼 그룹 */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.label-required {
  color: #ef4444;
}

.label-count {
  color: #6b7280;
  font-weight: 400;
  font-size: 12px;
}

/* 입력 필드 */
.form-input,
.form-textarea {
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #ff6b35;
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

.form-input.readonly {
  background: #f9fafb;
  color: #6b7280;
  cursor: not-allowed;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

/* 대표사진 업로드 */
.main-image-upload {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.main-image-preview {
  position: relative;
  width: 200px;
  height: 150px;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.2s;
}

.main-image-preview:hover {
  border-color: #ff6b35;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6b7280;
  gap: 8px;
}

.upload-icon {
  font-size: 24px;
}

.upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.main-image-preview:hover .upload-overlay {
  opacity: 1;
}

/* 매장 사진들 */
.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}

.image-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-image-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: background 0.2s;
}

.remove-image-btn:hover {
  background: rgba(239, 68, 68, 1);
}

.add-image-btn {
  aspect-ratio: 1;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
  gap: 4px;
}

.add-image-btn:hover {
  border-color: #ff6b35;
  color: #ff6b35;
}

.add-icon {
  font-size: 24px;
}

/* 영업시간 */
.operating-hours {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.time-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.time-input-group label {
  width: 40px;
  font-size: 14px;
  color: #374151;
}

.time-input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

/* 유틸리티 */
.file-input {
  display: none;
}

.upload-hint {
  margin: 0;
  font-size: 12px;
  color: #6b7280;
}

.form-hint {
  margin: 4px 0 0;
  font-size: 12px;
  color: #6b7280;
}

.char-count {
  align-self: flex-end;
  font-size: 12px;
  color: #6b7280;
}

/* 액션 버튼 */
.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
}

.btn-primary,
.btn-secondary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: #ff6b35;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #e55a2b;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f9fafb;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover:not(:disabled) {
  background: #f3f4f6;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 반응형 */
@media (max-width: 768px) {
  .content-container {
    padding: 0 16px;
  }

  .store-form-section {
    padding: 24px;
    border-radius: 12px;
  }

  .page-header h1 {
    font-size: 24px;
  }

  .main-image-preview {
    width: 160px;
    height: 120px;
  }

  .images-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 8px;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .btn-primary,
  .btn-secondary {
    justify-content: center;
  }

  .time-input-group {
    flex-wrap: wrap;
  }
}

/* 다크모드 */
@media (prefers-color-scheme: dark) {
  .mypage {
    background: #111827;
  }

  .page-header h1 {
    color: #f9fafb;
  }

  .page-header p {
    color: #9ca3af;
  }

  .store-form-section {
    background: #1f2937;
    color: #e5e7eb;
  }

  .form-label {
    color: #d1d5db;
  }

  .form-input,
  .form-textarea,
  .time-input {
    background: #374151;
    border-color: #4b5563;
    color: #e5e7eb;
  }

  .form-input.readonly {
    background: #2d3748;
    color: #9ca3af;
  }

  .main-image-preview,
  .add-image-btn {
    border-color: #4b5563;
  }

  .upload-placeholder {
    color: #9ca3af;
  }

  .btn-secondary {
    background: #374151;
    border-color: #4b5563;
    color: #d1d5db;
  }

  .btn-secondary:hover:not(:disabled) {
    background: #4b5563;
  }
}
</style>