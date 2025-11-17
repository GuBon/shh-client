<template>
  <div class="category-filter">
    <!-- 필터 버튼 -->
    <button 
      @click="toggleFilterModal" 
      class="filter-button"
      :class="{ active: hasActiveFilter }"
    >
      <span class="filter-icon">🔍</span>
      <span class="filter-text">업종 필터</span>
      <span v-if="selectedCount > 0" class="selected-count">{{ selectedCount }}</span>
      <span class="dropdown-arrow" :class="{ expanded: showModal }">▼</span>
    </button>

    <!-- 선택된 필터 표시 -->
    <div v-if="hasActiveFilter" class="selected-filters">
      <div class="selected-tags">
        <span 
          v-for="category in selectedCategoriesData" 
          :key="category.code"
          class="filter-tag"
        >
          {{ category.name }}
          <button 
            @click="toggleCategory(category.code)"
            class="remove-tag"
          >
            ✕
          </button>
        </span>
      </div>
      <button @click="clearAllFilters" class="clear-all-btn">
        전체 해제
      </button>
    </div>

    <!-- 필터 모달/드롭다운 -->
    <div v-if="showModal" class="filter-modal" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">업종 선택</h3>
          <button @click="closeModal" class="close-btn">✕</button>
        </div>

        <!-- 추천 업종 -->
        <div class="recommended-section">
          <h4 class="section-title">
            <span class="title-icon">⭐</span>
            추천 업종
          </h4>
          <div class="category-grid">
            <label 
              v-for="category in recommendedCategories" 
              :key="'rec-' + category.code"
              class="category-item recommended"
              :class="{ selected: selectedCategories.includes(category.code) }"
            >
              <input 
                type="checkbox" 
                :value="category.code"
                :checked="selectedCategories.includes(category.code)"
                @change="toggleCategory(category.code)"
                class="category-checkbox"
              />
              <div class="category-content">
                <span class="category-icon">{{ category.icon }}</span>
                <span class="category-name">{{ category.name }}</span>
                <span v-if="category.count > 0" class="category-count">{{ category.count }}</span>
              </div>
            </label>
          </div>
        </div>

        <!-- 전체 업종 -->
        <div class="all-categories-section">
          <h4 class="section-title">
            <span class="title-icon">🏪</span>
            전체 업종
          </h4>
          <div class="category-grid">
            <label 
              v-for="category in allCategories" 
              :key="'all-' + category.code"
              class="category-item"
              :class="{ 
                selected: selectedCategories.includes(category.code),
                recommended: category.isRecommended 
              }"
            >
              <input 
                type="checkbox" 
                :value="category.code"
                :checked="selectedCategories.includes(category.code)"
                @change="toggleCategory(category.code)"
                class="category-checkbox"
              />
              <div class="category-content">
                <span class="category-icon">{{ category.icon }}</span>
                <span class="category-name">{{ category.name }}</span>
                <span v-if="category.count > 0" class="category-count">{{ category.count }}</span>
                <span v-if="category.isRecommended" class="recommended-badge">추천</span>
              </div>
            </label>
          </div>
        </div>

        <!-- 모달 하단 액션 -->
        <div class="modal-actions">
          <button @click="clearAllFilters" class="clear-btn">
            전체 해제
          </button>
          <button @click="applyFilters" class="apply-btn">
            적용 ({{ selectedCount }}개)
          </button>
        </div>
      </div>
    </div>

    <!-- 모달 배경 -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { categoryApi } from '../services/api'

const emit = defineEmits(['filter-change', 'close'])

// 상태
const selectedCategories = ref([])
const categoriesData = ref([])
const loading = ref(false)
const showModal = ref(false)

// 추천 업종 코드 (기본 선택될 업종들)
const RECOMMENDED_CODES = ['FD6', 'CE7', 'CS2', 'CT1']

// 10개 업종 정의 (세부카테고리 제거)
const defaultCategories = [
  {
    code: 'FD6',
    name: '음식점',
    icon: '🍽️',
    count: 0,
    isRecommended: true
  },
  {
    code: 'CE7',
    name: '카페',
    icon: '☕',
    count: 0,
    isRecommended: true
  },
  {
    code: 'CS2',
    name: '편의점·마트',
    icon: '🛒',
    count: 0,
    isRecommended: true
  },
  {
    code: 'CT1',
    name: '문화·여가',
    icon: '🎭',
    count: 0,
    isRecommended: true
  },
  {
    code: 'HP8',
    name: '병원·약국',
    icon: '🏥',
    count: 0,
    isRecommended: false
  },
  {
    code: 'BK9',
    name: '은행·금융',
    icon: '🏦',
    count: 0,
    isRecommended: false
  },
  {
    code: 'OL7',
    name: '주유소·정비',
    icon: '⛽',
    count: 0,
    isRecommended: false
  },
  {
    code: 'SW8',
    name: '지하철·교통',
    icon: '🚇',
    count: 0,
    isRecommended: false
  },
  {
    code: 'PK6',
    name: '주차장',
    icon: '🅿️',
    count: 0,
    isRecommended: false
  },
  {
    code: 'AD5',
    name: '숙박',
    icon: '🏨',
    count: 0,
    isRecommended: false
  }
]

// 계산된 속성
const allCategories = computed(() => {
  return categoriesData.value.length > 0 ? categoriesData.value : defaultCategories
})

const recommendedCategories = computed(() => {
  return allCategories.value.filter(cat => cat.isRecommended || RECOMMENDED_CODES.includes(cat.code))
})

const selectedCategoriesData = computed(() => {
  return allCategories.value.filter(cat => selectedCategories.value.includes(cat.code))
})

const selectedCount = computed(() => selectedCategories.value.length)

const hasActiveFilter = computed(() => selectedCategories.value.length > 0)

// 메서드
const toggleFilterModal = () => {
  showModal.value = !showModal.value
}

const closeModal = () => {
  showModal.value = false
  emit('close')
}

const toggleCategory = (categoryCode) => {
  const index = selectedCategories.value.indexOf(categoryCode)
  if (index > -1) {
    selectedCategories.value.splice(index, 1)
  } else {
    selectedCategories.value.push(categoryCode)
  }
}

const clearAllFilters = () => {
  selectedCategories.value = []
  emitFilterChange()
}

const applyFilters = () => {
  emitFilterChange()
  closeModal()
}

const emitFilterChange = () => {
  const filterData = {
    categories: selectedCategories.value,
    categoryNames: selectedCategoriesData.value.map(cat => cat.name)
  }
  
  emit('filter-change', filterData)
}

// 추천 업종을 기본 선택
const setDefaultRecommendedCategories = () => {
  selectedCategories.value = [...RECOMMENDED_CODES]
  emitFilterChange()
}

// 카테고리 데이터 로드
const loadCategories = async () => {
  try {
    loading.value = true
    const response = await categoryApi.getCategories()
    
    if (response.categories && response.categories.length > 0) {
      // API에서 받은 데이터에 추천 여부 표시 추가
      categoriesData.value = response.categories.map(cat => ({
        ...cat,
        isRecommended: RECOMMENDED_CODES.includes(cat.code)
      }))
    }
  } catch (error) {
    console.error('Failed to load categories:', error)
    // 기본 카테고리 사용
  } finally {
    loading.value = false
  }
}

// 모달 외부 클릭 감지는 제거 (StoreList에서 관리)

// 라이프사이클
onMounted(async () => {
  // 모달이 처음 열릴 때만 API에서 카테고리 로드
  await loadCategories()
  
  // 추천 업종을 기본 선택
  setDefaultRecommendedCategories()
  
  // 모달이 열린 상태로 시작
  showModal.value = true
})

// 정리
import { onUnmounted } from 'vue'
onUnmounted(() => {
  // 컴포넌트 제거시 이벤트 정리
})

// 선택된 카테고리 변경 시 자동으로 이벤트 발생하지 않도록 제거
// (적용 버튼 클릭 시에만 필터 변경)
</script>

<style scoped>
.category-filter {
  position: relative;
  margin-bottom: 16px;
}

/* 필터 버튼 */
.filter-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  justify-content: space-between;
  font-weight: 500;
}

.filter-button:hover {
  border-color: #ff6b35;
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.1);
}

.filter-button.active {
  border-color: #ff6b35;
  background: #fef7ed;
  color: #ea580c;
}

.filter-icon {
  font-size: 16px;
}

.filter-text {
  flex: 1;
  text-align: left;
}

.selected-count {
  background: #ff6b35;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.dropdown-arrow {
  font-size: 12px;
  color: #6b7280;
  transition: transform 0.2s;
}

.dropdown-arrow.expanded {
  transform: rotate(180deg);
}

/* 선택된 필터 표시 */
.selected-filters {
  margin-top: 12px;
  padding: 12px;
  background: #fef7ed;
  border: 1px solid #fed7aa;
  border-radius: 8px;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.filter-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: #ff6b35;
  color: white;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
}

.remove-tag {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0;
  font-size: 10px;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
}

.remove-tag:hover {
  background: rgba(255, 255, 255, 0.2);
}

.clear-all-btn {
  padding: 4px 8px;
  background: none;
  border: 1px solid #ea580c;
  color: #ea580c;
  border-radius: 6px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-all-btn:hover {
  background: #ea580c;
  color: white;
}

/* 모달 오버레이 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

/* 필터 모달 */
.filter-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  max-width: 500px;
  width: 90vw;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f3f4f6;
  background: #fafafa;
}

.modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #f3f4f6;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #6b7280;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

/* 섹션 */
.recommended-section,
.all-categories-section {
  padding: 20px 24px;
}

.recommended-section {
  border-bottom: 1px solid #f3f4f6;
  background: linear-gradient(135deg, #fef7ed, #fefbf7);
}

.section-title {
  display: flex;
  align-items: center;
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.title-icon {
  margin-right: 8px;
  font-size: 16px;
}

/* 카테고리 그리드 */
.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 8px;
}

.category-item {
  position: relative;
  display: flex;
  align-items: center;
  padding: 12px;
  background: white;
  border: 2px solid #f3f4f6;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.category-item:hover {
  border-color: #ff6b35;
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.1);
}

.category-item.selected {
  border-color: #ff6b35;
  background: #fef7ed;
}

.category-item.recommended {
  border-color: #fed7aa;
  background: linear-gradient(135deg, #fefbf7, #fef7ed);
}

.category-item.recommended.selected {
  border-color: #ff6b35;
  background: linear-gradient(135deg, #ff6b35, #ea580c);
  color: white;
}

.category-checkbox {
  display: none;
}

.category-content {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.category-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.category-name {
  flex: 1;
  font-weight: 500;
  font-size: 13px;
}

.category-count {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
}

.category-item.selected .category-count {
  background: rgba(255, 255, 255, 0.3);
  color: inherit;
}

.recommended-badge {
  background: #ff6b35;
  color: white;
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 600;
}

.category-item.recommended.selected .recommended-badge {
  background: rgba(255, 255, 255, 0.3);
}

/* 모달 액션 */
.modal-actions {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #f3f4f6;
  background: #fafafa;
}

.clear-btn {
  flex: 1;
  padding: 12px 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #6b7280;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.clear-btn:hover {
  border-color: #d1d5db;
  color: #374151;
}

.apply-btn {
  flex: 2;
  padding: 12px 16px;
  background: #ff6b35;
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
}

.apply-btn:hover {
  background: #e55a2b;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
}

/* 반응형 */
@media (max-width: 768px) {
  .filter-modal {
    width: 95vw;
    max-height: 85vh;
  }

  .modal-header,
  .recommended-section,
  .all-categories-section,
  .modal-actions {
    padding: 16px 20px;
  }

  .category-grid {
    grid-template-columns: 1fr;
    gap: 6px;
  }

  .category-item {
    padding: 10px;
  }

  .modal-actions {
    flex-direction: column;
  }

  .apply-btn {
    order: -1;
  }
}

/* 다크모드 대응 */
@media (prefers-color-scheme: dark) {
  .filter-button {
    background: #374151;
    border-color: #4b5563;
    color: #e5e7eb;
  }

  .filter-button.active {
    background: #451a03;
    border-color: #ea580c;
    color: #fed7aa;
  }

  .selected-filters {
    background: #451a03;
    border-color: #7c2d12;
  }

  .modal-content {
    background: #1f2937;
  }

  .modal-header,
  .modal-actions {
    background: #111827;
    border-color: #374151;
  }

  .modal-title {
    color: #e5e7eb;
  }

  .close-btn {
    background: #374151;
    color: #9ca3af;
  }

  .close-btn:hover {
    background: #4b5563;
    color: #e5e7eb;
  }

  .recommended-section {
    background: linear-gradient(135deg, #451a03, #7c2d12);
    border-color: #374151;
  }

  .section-title {
    color: #e5e7eb;
  }

  .category-item {
    background: #374151;
    border-color: #4b5563;
    color: #e5e7eb;
  }

  .category-item.selected {
    background: #451a03;
    border-color: #ea580c;
  }

  .clear-btn {
    background: #374151;
    border-color: #4b5563;
    color: #9ca3af;
  }

  .clear-btn:hover {
    background: #4b5563;
    color: #e5e7eb;
  }
}
</style>