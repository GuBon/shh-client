<template>
  <div 
    class="store-item" 
    :class="{ 
      'is-member': store.is_member,
      'is-selected': isSelected
    }"
    @click="handleClick"
    @mouseenter="$emit('hover', store)"
    @mouseleave="$emit('hover', null)"
  >
    <!-- 매장 이미지 -->
    <div class="store-image">
      <!-- 회원 매장은 이미지, 일반 매장은 아이콘 -->
      <div v-if="!store.is_member" class="store-icon">
        <i class="icon-default-store"></i>
      </div>
      <img 
        v-else
        :src="store.main_image || '/images/store-placeholder.jpg'" 
        :alt="store.name" 
        @error="handleImageError"
      />
      <div v-if="store.image_count && store.is_member" class="image-count">
        {{ store.image_count }}/10
      </div>
      <div v-if="store.is_member" class="member-badge">
        회원
      </div>
    </div>
    
    <!-- 매장 정보 -->
    <div class="store-info">
      <div class="store-header">
        <h3 class="store-name">{{ store.name }}</h3>
        <div class="store-meta">
          <span class="distance">{{ store.distance }}</span>
        </div>
      </div>

      <p v-if="store.description" class="store-description">
        {{ store.description }}
      </p>
      
      <p class="store-address">
        <i class="icon-location"></i>
        {{ store.address }}
      </p>

      <!-- 회원 매장 추가 정보 -->
      <div v-if="store.is_member" class="member-info">
        <!-- 메뉴 정보 -->
        <div v-if="store.menu_items && store.menu_items.length" class="store-menu">
          <div 
            v-for="menu in store.menu_items.slice(0, 2)" 
            :key="menu.id"
            class="menu-item"
          >
            <span class="menu-name">{{ menu.name }}</span>
            <span class="menu-price">{{ formatPrice(menu.price) }}</span>
          </div>
          <div v-if="store.menu_items.length > 2" class="menu-more">
            +{{ store.menu_items.length - 2 }}개 메뉴 더보기
          </div>
        </div>

        <!-- 연락처 -->
        <div v-if="store.phone" class="store-contact">
          <button 
            class="contact-btn"
            @click.stop="handleContactClick"
          >
            <i class="icon-phone"></i>
            {{ formatPhone(store.phone) }}
          </button>
        </div>
      </div>

      <!-- 일반 매장 정보 -->
      <div v-else class="regular-info">
        <p v-if="store.phone" class="store-phone">
          📞 {{ formatPhone(store.phone) }}
        </p>
        <p class="store-category">{{ store.category_name }}</p>
      </div>
    </div>

    <!-- 액션 버튼 -->
    <div class="store-actions">
      <button 
        v-if="store.is_member"
        class="detail-btn"
        @click.stop="goToDetail"
      >
        상세보기
      </button>
      <button 
        v-else
        class="external-btn"
        @click.stop="openKakaoMap"
      >
        카카오맵
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  store: {
    type: Object,
    required: true
  },
  isSelected: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click', 'hover'])
const router = useRouter()

// 메서드
const handleClick = () => {
  emit('click', props.store)
}

const handleContactClick = () => {
  // 전화 걸기 모달이나 액션 시트 표시
  if (props.store.phone) {
    const confirmed = confirm(`${props.store.name}에 전화를 거시겠습니까?\n${props.store.phone}`)
    if (confirmed) {
      window.location.href = `tel:${props.store.phone}`
    }
  }
}

const goToDetail = () => {
  router.push(`/store/${props.store.id}`)
}

const openKakaoMap = () => {
  if (props.store.place_url) {
    window.open(props.store.place_url, '_blank')
  } else {
    // 카카오맵에서 검색
    const query = encodeURIComponent(`${props.store.name} ${props.store.address}`)
    window.open(`https://map.kakao.com/?q=${query}`, '_blank')
  }
}

const handleImageError = (event) => {
  event.target.src = '/images/store-placeholder.jpg'
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('ko-KR').format(price) + '원'
}

const formatPhone = (phone) => {
  // 전화번호 포맷팅 (예: 02-1234-5678)
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
  } else if (cleaned.length === 9) {
    return cleaned.replace(/(\d{2})(\d{3})(\d{4})/, '$1-$2-$3')
  }
  return phone
}
</script>

<style scoped>
.store-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.store-item:hover {
  background: #fafafa;
}

.store-item.is-selected {
  background: #fff7f5;
  border-left: 4px solid #ff6b35;
}

.store-item.is-member {
  border-left: 2px solid #ff6b35;
}

.store-item.is-member.is-selected {
  border-left: 4px solid #ff6b35;
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.1);
}

/* 매장 이미지 */
.store-image {
  position: relative;
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
}

.store-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 기본 가게 아이콘 (일반 매장) */
.store-icon {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
}

.icon-default-store::before {
  content: "🏪";
  font-size: 32px;
  opacity: 0.6;
}

.image-count {
  position: absolute;
  bottom: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 10px;
  padding: 2px 4px;
  border-radius: 2px;
}

.member-badge {
  position: absolute;
  top: 4px;
  left: 4px;
  background: #ff6b35;
  color: white;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
}

/* 매장 정보 */
.store-info {
  flex: 1;
  min-width: 0;
}

.store-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.store-name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  line-height: 1.3;
}

.store-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  flex-shrink: 0;
  margin-left: 12px;
}

.distance {
  font-size: 11px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 3px;
}

.store-description {
  margin: 0 0 6px;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.store-address {
  margin: 0 0 12px;
  font-size: 12px;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 4px;
}

.icon-location::before {
  content: "📍";
  font-size: 11px;
}

/* 회원 매장 정보 */
.member-info {
  margin-top: 8px;
}

.store-menu {
  margin-bottom: 8px;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  margin-bottom: 3px;
  padding: 2px 0;
}

.menu-name {
  color: #374151;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-price {
  color: #ff6b35;
  font-weight: 600;
  margin-left: 8px;
}

.menu-more {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 4px;
}

.store-contact {
  margin-top: 8px;
}

.contact-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: #f3f4f6;
  border: none;
  border-radius: 4px;
  font-size: 11px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.contact-btn:hover {
  background: #e5e7eb;
}

.icon-phone::before {
  content: "📞";
  font-size: 10px;
}

/* 일반 매장 정보 */
.regular-info {
  margin-top: 8px;
}

.store-phone {
  margin: 0 0 4px;
  font-size: 12px;
  color: #6b7280;
}

.store-category {
  margin: 0;
  font-size: 11px;
  color: #9ca3af;
  background: #f9fafb;
  padding: 2px 6px;
  border-radius: 3px;
  display: inline-block;
}

/* 액션 버튼 */
.store-actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.detail-btn, .external-btn {
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.detail-btn {
  background: #ff6b35;
  color: white;
}

.detail-btn:hover {
  background: #e55a2b;
}

.external-btn {
  background: #f9fafb;
  color: #374151;
  border: 1px solid #e5e7eb;
}

.external-btn:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

/* 반응형 */
@media (max-width: 640px) {
  .store-item {
    padding: 12px;
    gap: 12px;
  }

  .store-image {
    width: 60px;
    height: 60px;
  }

  .icon-default-store::before {
    font-size: 24px;
  }

  .store-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .store-meta {
    flex-direction: row;
    align-items: center;
    gap: 8px;
    margin-left: 0;
    margin-top: 4px;
  }

  .store-actions {
    position: absolute;
    bottom: 12px;
    right: 12px;
  }

  .detail-btn, .external-btn {
    padding: 6px 10px;
    font-size: 11px;
  }
}

/* 회원 매장 강조 스타일 */
@media (min-width: 641px) {
  .store-item.is-member {
    background: linear-gradient(135deg, #fff7f5 0%, #ffffff 100%);
  }

  .store-item.is-member:hover {
    background: linear-gradient(135deg, #fef2f2 0%, #fafafa 100%);
  }
}
</style>
