<template>
  <div class="store-list">
    <!-- 검색 및 필터 헤더 -->
    <div class="list-header">
      <div class="search-bar">
        <input 
          type="text"
          v-model="searchQuery"
          @input="handleSearch"
          placeholder="매장명 또는 키워드로 검색"
          class="search-input"
        />
        <button class="search-btn">🔍</button>
      </div>

      <!-- 결과 헤더 -->
      <div class="result-header">
        <span class="result-count">
          총 {{ totalCount }}개 매장 
          <span v-if="memberCount > 0" class="member-count">
            (회원 {{ memberCount }}개)
          </span>
        </span>
        <div class="filter-container">
          <button 
            class="filter-btn" 
            @click="toggleCategoryFilter"
            :class="{ active: showCategoryFilter }"
          >
            <i class="icon-filter"></i>
            필터
            <span v-if="selectedCategoriesCount > 0" class="filter-count">{{ selectedCategoriesCount }}</span>
            <span class="dropdown-arrow" :class="{ expanded: showCategoryFilter }">▼</span>
          </button>

          <!-- 드롭다운 업종 필터 -->
          <div v-if="showCategoryFilter" class="category-dropdown" @click.stop>
            <div class="dropdown-content">
              <!-- 업종 목록 -->
              <div class="category-section">
                <h4 class="section-title">
                  <span class="title-icon">🏪</span>
                  업종 선택
                </h4>
                <div class="category-grid">
                  <label 
                    v-for="category in allCategories" 
                    :key="category.code"
                    class="category-item"
                  >
                    <input 
                      type="checkbox" 
                      :value="category.code"
                      v-model="selectedCategories"
                      @change="onCategoryChange"
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

              <!-- 회원매장 필터 -->
              <div class="category-section">
                <label class="category-item member-filter">
                  <input 
                    type="checkbox" 
                    v-model="memberOnly"
                    @change="onMemberFilterChange"
                    class="category-checkbox"
                  />
                  <div class="category-content">
                    <span class="category-icon">✅</span>
                    <span class="category-name">회원매장만 보기</span>
                  </div>
                </label>
              </div>

              <!-- 드롭다운 하단 액션 -->
              <div class="dropdown-actions">
                <button @click="clearAllFilters" class="clear-btn">
                  전체 해제
                </button>
                <button @click="closeCategoryFilter" class="apply-btn">
                  적용
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 선택된 카테고리 표시 -->
      <div v-if="hasActiveFilters" class="active-filters">
        <div class="filter-tags">
          <span 
            v-for="categoryName in selectedCategoryNames" 
            :key="categoryName"
            class="filter-tag"
          >
            {{ categoryName }}
            <button 
              @click="removeCategoryFilter(categoryName)"
              class="remove-tag-btn"
            >
              ✕
            </button>
          </span>
          <span v-if="memberOnly" class="filter-tag member-tag">
            회원매장만
            <button 
              @click="memberOnly = false; onMemberFilterChange()"
              class="remove-tag-btn"
            >
              ✕
            </button>
          </span>
        </div>
        <button @click="clearAllFilters" class="clear-all-btn">
          전체 해제
        </button>
      </div>
    </div>

    <!-- 매장 리스트 -->
    <div class="list-content" @scroll="handleScroll" ref="listContainer">
      <!-- 로딩 상태 -->
      <div v-if="loading && stores.length === 0" class="loading">
        <div class="loading-spinner"></div>
        매장을 검색하는 중...
      </div>

      <!-- 매장 아이템들 -->
      <div v-else-if="stores.length > 0" class="store-items">
        <StoreListItem
          v-for="store in stores"
          :key="store.id"
          :store="store"
          :is-selected="selectedStoreId === store.id"
          @click="handleStoreClick"
          @hover="handleStoreHover"
        />

        <!-- 더 로드하기 -->
        <div v-if="hasMore && !loading" class="load-more">
          <button @click="loadMore" class="load-more-btn">
            더 많은 매장 보기
          </button>
        </div>

        <!-- 로딩 더보기 -->
        <div v-if="loading && stores.length > 0" class="loading-more">
          <div class="loading-spinner"></div>
          더 많은 매장을 불러오는 중...
        </div>
      </div>

      <!-- 검색 결과 없음 -->
      <div v-else-if="!loading" class="no-results">
        <div class="no-results-icon">🏪</div>
        <h3>검색 결과가 없습니다</h3>
        <p>다른 지역이나 검색어로 다시 시도해 보세요.</p>
        <button @click="clearAllFilters" class="clear-filters-btn">
          필터 초기화
        </button>
      </div>

      <!-- 에러 상태 -->
      <div v-if="error" class="error-state">
        <div class="error-icon">❌</div>
        <h3>매장 정보를 불러올 수 없습니다</h3>
        <p>{{ error }}</p>
        <button @click="retrySearch" class="retry-btn">
          다시 시도
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useStoreStore } from '../stores/store'
import StoreListItem from './StoreListItem.vue'

const emit = defineEmits(['store-select', 'store-hover'])
const props = defineProps({
  selectedStoreId: String
})

const storeStore = useStoreStore()

// 상태
const searchQuery = ref('')
const showCategoryFilter = ref(false)
const listContainer = ref(null)
const selectedCategories = ref([])
const memberOnly = ref(false)

// 18개 업종 정의 (헤더의 추천업종: 음식점, 소매업)
const defaultCategories = [
  {
    code: 'MT1',
    name: '대형마트',
    icon: '🛒',
    count: 0
  },
  {
    code: 'CS2',
    name: '편의점',
    icon: '🏪',
    count: 0
  },
  {
    code: 'PS3',
    name: '어린이집, 유치원',
    icon: '🏫',
    count: 0
  },
  {
    code: 'SC4',
    name: '학교',
    icon: '🎓',
    count: 0
  },
  {
    code: 'AC5',
    name: '학원',
    icon: '📚',
    count: 0
  },
  {
    code: 'PK6',
    name: '주차장',
    icon: '🅿️',
    count: 0
  },
  {
    code: 'OL7',
    name: '주유소, 충전소',
    icon: '⛽',
    count: 0
  },
  {
    code: 'SW8',
    name: '지하철역',
    icon: '🚇',
    count: 0
  },
  {
    code: 'BK9',
    name: '은행',
    icon: '🏦',
    count: 0
  },
  {
    code: 'CT1',
    name: '문화시설',
    icon: '🎭',
    count: 0
  },
  {
    code: 'AG2',
    name: '중개업소',
    icon: '🏠',
    count: 0
  },
  {
    code: 'PO3',
    name: '공공기관',
    icon: '🏢',
    count: 0
  },
  {
    code: 'AT4',
    name: '관광명소',
    icon: '🗺️',
    count: 0
  },
  {
    code: 'AD5',
    name: '숙박',
    icon: '🏨',
    count: 0
  },
  {
    code: 'FD6',
    name: '음식점',
    icon: '🍽️',
    count: 0
  },
  {
    code: 'CE7',
    name: '카페',
    icon: '☕',
    count: 0
  },
  {
    code: 'HP8',
    name: '병원',
    icon: '🏥',
    count: 0
  },
  {
    code: 'PM9',
    name: '약국',
    icon: '💊',
    count: 0
  }
]

// 헤더에서 표시하는 추천 업종 코드 (음식점, 소매업)
const RECOMMENDED_CODES = []  // 음식점, 대형마트, 편의점

let searchTimeout = null

// 계산된 속성
const stores = computed(() => storeStore.sortedStores)
const loading = computed(() => storeStore.loading)
const error = computed(() => storeStore.error)
const totalCount = computed(() => stores.value.length)
const memberCount = computed(() => storeStore.memberStores.length)
const hasMore = computed(() => false)

const allCategories = computed(() => defaultCategories)

const selectedCategoriesCount = computed(() => selectedCategories.value.length)

const selectedCategoryNames = computed(() => {
  return allCategories.value
    .filter(cat => selectedCategories.value.includes(cat.code))
    .map(cat => cat.name)
})

const hasActiveFilters = computed(() => 
  selectedCategories.value.length > 0 || memberOnly.value
)

// 메서드
const handleSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  searchTimeout = setTimeout(() => {
    applyFilters()
  }, 500)
}

const toggleCategoryFilter = () => {
  showCategoryFilter.value = !showCategoryFilter.value
}

const closeCategoryFilter = () => {
  showCategoryFilter.value = false
}

const onCategoryChange = () => {
  applyFilters()
}

const onMemberFilterChange = () => {
  applyFilters()
}

const removeCategoryFilter = (categoryName) => {
  const category = allCategories.value.find(cat => cat.name === categoryName)
  if (category) {
    const index = selectedCategories.value.indexOf(category.code)
    if (index > -1) {
      selectedCategories.value.splice(index, 1)
      applyFilters()
    }
  }
}

const applyFilters = () => {
  const searchFilters = {
    categories: selectedCategories.value,
    memberOnly: memberOnly.value,
    query: searchQuery.value.trim()
  }

  storeStore.setSearchFilters(searchFilters)
  storeStore.searchStores()
}

const clearAllFilters = () => {
  searchQuery.value = ''
  selectedCategories.value = []
  memberOnly.value = false
  
  storeStore.setSearchFilters({
    categories: [],
    memberOnly: false,
    query: ''
  })
  
  storeStore.searchStores()
  showCategoryFilter.value = false
}

const loadMore = () => {
  storeStore.loadMoreStores()
}

const retrySearch = () => {
  storeStore.searchStores()
}

const handleStoreClick = (store) => {
  emit('store-select', store)
}

const handleStoreHover = (store) => {
  emit('store-hover', store)
}

// 무한 스크롤 처리
const handleScroll = () => {
  const container = listContainer.value
  if (!container || loading.value || !hasMore.value) return

  const scrollTop = container.scrollTop
  const scrollHeight = container.scrollHeight
  const clientHeight = container.clientHeight

  // 스크롤이 하단에서 100px 이내에 있을 때 더 로드
  if (scrollTop + clientHeight >= scrollHeight - 100) {
    loadMore()
  }
}

// 외부 클릭 감지
const handleClickOutside = (event) => {
  if (showCategoryFilter.value && !event.target.closest('.filter-container')) {
    showCategoryFilter.value = false
  }
}

// 라이프사이클
onMounted(() => {
  console.log('📋 StoreList component mounted')
  
  // 헤더의 추천 업종을 기본 선택 (음식점, 대형마트, 편의점)
  selectedCategories.value = [...RECOMMENDED_CODES]
  applyFilters()
  
  // 외부 클릭 감지
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.store-list {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
}

/* 리스트 헤더 */
.list-header {
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.search-bar {
  display: flex;
  margin-bottom: 16px;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px 0 0 8px;
  outline: none;
  font-size: 14px;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #ff6b35;
}

.search-btn {
  padding: 12px 16px;
  background: #ff6b35;
  color: white;
  border: none;
  border-radius: 0 8px 8px 0;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.2s;
}

.search-btn:hover {
  background: #e55a2b;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.result-count {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
}

.member-count {
  color: #ff6b35;
  font-weight: 600;
}

/* 필터 컨테이너 */
.filter-container {
  position: relative;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  background: #f9fafb;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
  position: relative;
}

.filter-btn:hover {
  background: #f3f4f6;
  border-color: #ff6b35;
  color: #ff6b35;
}

.filter-btn.active {
  background: #ff6b35;
  color: white;
  border-color: #ff6b35;
}

.icon-filter::before {
  content: "⚙️";
  font-size: 14px;
}

.filter-count {
  background: rgba(255, 255, 255, 0.3);
  color: inherit;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  min-width: 18px;
  text-align: center;
}

.filter-btn:not(.active) .filter-count {
  background: #ff6b35;
  color: white;
}

.dropdown-arrow {
  font-size: 10px;
  transition: transform 0.2s;
}

.dropdown-arrow.expanded {
  transform: rotate(180deg);
}

/* 카테고리 드롭다운 */
.category-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  width: 360px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  z-index: 100;
  overflow: hidden;
}

.dropdown-content {
  max-height: 500px;
  overflow-y: auto;
}

/* 카테고리 섹션 */
.category-section {
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;
}

.category-section:last-child {
  border-bottom: none;
}

.section-title {
  display: flex;
  align-items: center;
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.title-icon {
  margin-right: 8px;
  font-size: 16px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.category-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  background: #f9fafb;
  border: 1px solid #f3f4f6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.category-item:hover {
  background: #f3f4f6;
  border-color: #ff6b35;
}

.category-item.member-filter {
  background: linear-gradient(135deg, #f0fdf4, #f7fee7);
  border-color: #bbf7d0;
  grid-column: 1 / -1;
}

.category-checkbox {
  margin-right: 10px;
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.category-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.category-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.category-name {
  flex: 1;
  font-weight: 500;
  font-size: 13px;
  color: #374151;
}

.category-count {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
}

/* 드롭다운 액션 */
.dropdown-actions {
  display: flex;
  gap: 8px;
  padding: 16px;
  border-top: 1px solid #f3f4f6;
  background: #fafafa;
}

.clear-btn {
  flex: 1;
  padding: 8px 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  color: #6b7280;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s;
}

.clear-btn:hover {
  border-color: #d1d5db;
  color: #374151;
}

.apply-btn {
  flex: 1;
  padding: 8px 12px;
  background: #ff6b35;
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.2s;
}

.apply-btn:hover {
  background: #e55a2b;
}

/* 활성 필터 표시 */
.active-filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fef7ed;
  border: 1px solid #fed7aa;
  border-radius: 8px;
  margin-top: 12px;
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  flex: 1;
}

.filter-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: #ff6b35;
  color: white;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.filter-tag.member-tag {
  background: #059669;
}

.remove-tag-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0;
  font-size: 9px;
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
}

.remove-tag-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.clear-all-btn {
  padding: 6px 12px;
  background: white;
  border: 1px solid #fed7aa;
  border-radius: 16px;
  font-size: 11px;
  color: #ea580c;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  font-weight: 500;
}

.clear-all-btn:hover {
  background: #ea580c;
  color: white;
  border-color: #ea580c;
}

/* 리스트 컨텐츠 */
.list-content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 20px;
}

.store-items {
  padding: 0 20px;
}

/* 로딩 상태 */
.loading, .loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 20px;
  color: #6b7280;
  font-size: 14px;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f4f6;
  border-top: 2px solid #ff6b35;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 더 보기 */
.load-more {
  text-align: center;
  padding: 20px;
}

.load-more-btn {
  padding: 12px 24px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.load-more-btn:hover {
  border-color: #ff6b35;
  color: #ff6b35;
}

/* 검색 결과 없음 */
.no-results {
  text-align: center;
  padding: 60px 20px;
}

.no-results-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.no-results h3 {
  margin: 0 0 8px;
  font-size: 18px;
  color: #374151;
}

.no-results p {
  margin: 0 0 24px;
  color: #6b7280;
  font-size: 14px;
}

.clear-filters-btn {
  padding: 10px 20px;
  background: #ff6b35;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
  font-weight: 500;
}

.clear-filters-btn:hover {
  background: #e55a2b;
}

/* 에러 상태 */
.error-state {
  text-align: center;
  padding: 60px 20px;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-state h3 {
  margin: 0 0 8px;
  font-size: 18px;
  color: #dc2626;
}

.error-state p {
  margin: 0 0 24px;
  color: #6b7280;
  font-size: 14px;
}

.retry-btn {
  padding: 10px 20px;
  background: #6b7280;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
  font-weight: 500;
}

.retry-btn:hover {
  background: #4b5563;
}

/* 반응형 */
@media (max-width: 768px) {
  .list-header {
    padding: 16px;
  }

  .result-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .category-dropdown {
    left: 0;
    right: 0;
    width: auto;
    margin-top: 8px;
  }

  .category-grid {
    grid-template-columns: 1fr;
  }

  .active-filters {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .filter-tags {
    justify-content: center;
  }
}

/* 다크모드 대응 */
@media (prefers-color-scheme: dark) {
  .store-list {
    background: #1f2937;
  }

  .list-header {
    border-color: #374151;
  }

  .search-input {
    background: #374151;
    border-color: #4b5563;
    color: #e5e7eb;
  }

  .search-input::placeholder {
    color: #9ca3af;
  }

  .filter-btn {
    background: #374151;
    border-color: #4b5563;
    color: #e5e7eb;
  }

  .filter-btn:hover {
    background: #4b5563;
  }

  .filter-btn.active {
    background: #ff6b35;
    color: white;
  }

  .result-count {
    color: #e5e7eb;
  }

  .category-dropdown {
    background: #374151;
    border-color: #4b5563;
  }

  .category-item {
    background: #4b5563;
    border-color: #6b7280;
    color: #e5e7eb;
  }

  .category-item:hover {
    background: #6b7280;
  }

  .category-name {
    color: #e5e7eb;
  }

  .dropdown-actions {
    background: #1f2937;
    border-color: #374151;
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

  .active-filters {
    background: #451a03;
    border-color: #7c2d12;
  }

  .clear-all-btn {
    background: #374151;
    border-color: #ea580c;
    color: #ea580c;
  }
}
</style>