<template>
  <header class="global-header">
    <!-- 메인 헤더 라인 -->
    <div class="header-content">
      <!-- 왼쪽: 네비게이션 -->
      <nav class="main-nav">
        <router-link 
          to="/" 
          class="nav-item"
          :class="{ active: $route.name === 'StoreFinder' }"
        >
          제휴매장 찾기
        </router-link>
        <router-link 
          to="/analysis" 
          class="nav-item"
          :class="{ active: $route.name === 'Analysis' }"
        >
          분석
        </router-link>
        <router-link 
          to="/my-store" 
          class="nav-item"
          :class="{ active: $route.name === 'MyStore' }"
        >
          내 제휴 매장
        </router-link>
        <router-link 
          to="/mypage" 
          class="nav-item"
          :class="{ active: $route.name === 'MyPage' }"
          v-if="authStore.isLoggedIn"
        >
          마이페이지
        </router-link>
      </nav>

      <!-- 가운데: 로고 (이미지만) -->
      <div class="logo">
        <router-link to="/" class="logo-link">
          <img src="/images/logo.png" alt="소확행" class="logo-image" />
        </router-link>
      </div>

      <!-- 우측: 사용자 정보 -->
      <div class="user-section">
        <!-- 로그인된 상태 -->
        <div v-if="authStore.isLoggedIn" class="user-info">
          <div class="user-dropdown" @click="toggleUserMenu">
            <div class="user-avatar">
              <span class="user-initial">{{ userInitial }}</span>
            </div>
            <span class="user-name">{{ authStore.userInfo?.name }}님</span>
            <i class="dropdown-icon" :class="{ open: showUserMenu }">▼</i>
          </div>
          
          <!-- 사용자 드롭다운 메뉴 -->
          <div v-if="showUserMenu" class="user-menu">
            <router-link to="/mypage" class="menu-item" @click="closeUserMenu">
              <i class="menu-icon">👤</i>
              마이페이지
            </router-link>
            <button @click="handleLogout" class="menu-item logout-item">
              <i class="menu-icon">🚪</i>
              로그아웃
            </button>
          </div>
        </div>

        <!-- 로그인되지 않은 상태 -->
        <div v-else class="auth-buttons">
          <router-link to="/login" class="auth-btn login-btn">로그인</router-link>
          <router-link to="/signup" class="auth-btn signup-btn">회원가입</router-link>
        </div>
      </div>

      <!-- 모바일 메뉴 버튼 -->
      <button class="mobile-menu-btn" @click="toggleMobileMenu">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>

    <!-- 상권 정보 라인 -->
    <div class="commerce-info">
      <div class="info-content">
        <span class="info-item">
          현재 상권 : <strong class="info-value">서울 시청</strong>
        </span>
        <span class="info-divider">|</span>
        <span class="info-item">
          추천 업종 : <strong class="info-value">음식점, 소매업</strong>
        </span>
        <span class="info-divider">|</span>
        <span class="info-item">
          상권 유형 : <strong class="info-value">블루</strong>
        </span>
      </div>
    </div>

    <!-- 모바일 메뉴 -->
    <div class="mobile-menu" :class="{ active: showMobileMenu }">
      <nav class="mobile-nav">
        <router-link 
          to="/" 
          class="nav-item"
          :class="{ active: $route.name === 'StoreFinder' }"
          @click="closeMobileMenu"
        >
          제휴매장 찾기
        </router-link>
        <router-link 
          to="/analysis" 
          class="nav-item"
          :class="{ active: $route.name === 'Analysis' }"
          @click="closeMobileMenu"
        >
          분석
        </router-link>
        <router-link 
          to="/my-store" 
          class="nav-item"
          :class="{ active: $route.name === 'MyStore' }"
          @click="closeMobileMenu"
        >
          내 제휴 매장
        </router-link>
        <router-link 
          to="/mypage" 
          class="nav-item"
          :class="{ active: $route.name === 'MyPage' }"
          @click="closeMobileMenu"
          v-if="authStore.isLoggedIn"
        >
          마이페이지
        </router-link>
        
        <!-- 모바일 인증 버튼 -->
        <div class="mobile-auth-section" v-if="!authStore.isLoggedIn">
          <router-link to="/login" class="mobile-auth-btn" @click="closeMobileMenu">
            로그인
          </router-link>
          <router-link to="/signup" class="mobile-auth-btn signup" @click="closeMobileMenu">
            회원가입
          </router-link>
        </div>
        
        <!-- 모바일 사용자 메뉴 -->
        <div class="mobile-user-section" v-else>
          <div class="mobile-user-info">
            <span class="mobile-user-name">{{ authStore.userInfo?.name }}님</span>
          </div>
          <button @click="handleLogout" class="mobile-logout-btn">
            로그아웃
          </button>
        </div>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// 상태
const showMobileMenu = ref(false)
const showUserMenu = ref(false)

// 계산된 속성
const userInitial = computed(() => {
  const name = authStore.userInfo?.name
  return name ? name.charAt(0).toUpperCase() : 'U'
})

// 메서드
const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
  // 사용자 메뉴는 닫기
  showUserMenu.value = false
}

const closeMobileMenu = () => {
  showMobileMenu.value = false
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
  // 모바일 메뉴는 닫기
  showMobileMenu.value = false
}

const closeUserMenu = () => {
  showUserMenu.value = false
}

const handleLogout = () => {
  authStore.logout()
  showUserMenu.value = false
  showMobileMenu.value = false
  
  // 로그인이 필요한 페이지에 있다면 메인으로 이동
  if (router.currentRoute.value.meta?.requiresAuth) {
    router.push('/')
  }
}

// 외부 클릭 감지
const handleClickOutside = (event) => {
  if (!event.target.closest('.user-dropdown')) {
    showUserMenu.value = false
  }
  if (!event.target.closest('.mobile-menu-btn') && !event.target.closest('.mobile-menu')) {
    showMobileMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.global-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* 메인 헤더 라인 */
.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  height: 80px;
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
}

/* 로고 (가운데 배치, 이미지만) */
.logo {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
}

.logo-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  transition: all 0.2s ease;
}

.logo-link:hover {
  transform: scale(1.05);
}

.logo-image {
  width: 140px; /* 350:150 = 7:3 비율로 조정 */
  height: 60px;
}

/* 우측: 사용자 정보 */
.user-section {
  display: flex;
  align-items: center;
}

.user-info {
  position: relative;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.user-dropdown:hover {
  background: #f3f4f6;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #ff6b35;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 14px;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.dropdown-icon {
  font-size: 10px;
  color: #6b7280;
  transition: transform 0.2s;
}

.dropdown-icon.open {
  transform: rotate(180deg);
}

.user-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  z-index: 50;
  min-width: 160px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 12px 16px;
  text-decoration: none;
  color: #374151;
  font-size: 14px;
  border: none;
  background: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.menu-item:hover {
  background: #f3f4f6;
}

.logout-item {
  color: #ef4444;
}

.logout-item:hover {
  background: #fef2f2;
}

.menu-icon {
  font-size: 16px;
}

/* 인증 버튼 (비로그인 상태) */
.auth-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
}

.auth-btn {
  padding: 8px 16px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  border-radius: 6px;
  transition: all 0.2s;
}

.login-btn {
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.login-btn:hover {
  color: #374151;
  border-color: #9ca3af;
  background: #f9fafb;
}

.signup-btn {
  color: white;
  background: #ff6b35;
  border: 1px solid #ff6b35;
}

.signup-btn:hover {
  background: #e55a2b;
  border-color: #e55a2b;
}
.main-nav {
  display: flex;
  gap: 24px;
  align-items: center;
  margin-left: auto; /* 우측 정렬 */
}

.nav-item {
  padding: 12px 18px;
  text-decoration: none;
  color: #6b7280;
  font-weight: 500;
  font-size: 15px;
  border-radius: 8px;
  transition: all 0.2s;
  white-space: nowrap;
}

.nav-item:hover {
  color: #ff6b35;
  background: #fff7f5;
}

.nav-item.active {
  color: #ff6b35;
  background: #fff7f5;
  font-weight: 600;
}

/* 상권 정보 라인 */
.commerce-info {
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  padding: 12px 0;
}

.info-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 32px;
  font-size: 14px;
}

.info-item {
  color: #64748b;
  font-weight: 400;
}

.info-value {
  color: #334155;
  font-weight: 600;
}

.info-divider {
  color: #cbd5e1;
  font-weight: 300;
}

/* 모바일 메뉴 버튼 */
.mobile-menu-btn {
  display: none;
  flex-direction: column;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: none;
  border: none;
  cursor: pointer;
}

.mobile-menu-btn span {
  width: 100%;
  height: 2px;
  background: #374151;
  margin: 3px 0;
  transition: 0.3s;
  border-radius: 1px;
}

/* 모바일 메뉴 */
.mobile-menu {
  display: none;
  background: white;
  border-top: 1px solid #e5e7eb;
  padding: 20px;
}

.mobile-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mobile-nav .nav-item {
  padding: 16px 0;
  border-bottom: 1px solid #f3f4f6;
  font-size: 16px;
}

/* 모바일 인증 섹션 */
.mobile-auth-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f3f4f6;
}

.mobile-auth-btn {
  padding: 12px 0;
  text-align: center;
  text-decoration: none;
  font-weight: 500;
  border-radius: 6px;
  transition: background 0.2s;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.mobile-auth-btn.signup {
  color: white;
  background: #ff6b35;
  border-color: #ff6b35;
}

.mobile-user-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f3f4f6;
}

.mobile-user-info {
  margin-bottom: 16px;
}

.mobile-user-name {
  font-weight: 600;
  color: #374151;
}

.mobile-logout-btn {
  width: 100%;
  padding: 12px 0;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
}

/* 반응형 */
@media (max-width: 968px) {
  .header-content {
    padding: 0 20px;
    height: 70px;
  }

  .info-content {
    padding: 0 20px;
    gap: 12px;
    font-size: 13px;
  }

  .logo-image {
    width: 126px; /* 비율 유지하며 축소 */
    height: 54px;
  }
}

@media (max-width: 768px) {
  .header-content {
    padding: 0 16px;
    height: 64px;
  }

  .logo {
    position: relative;
    left: auto;
    top: auto;
    transform: none;
    flex: 1;
    display: flex;
    justify-content: center;
  }

  .logo-image {
    width: 105px; /* 7:3 비율 유지 */
    height: 45px;
  }

  .main-nav {
    display: none;
  }

  .user-section {
    display: none;
  }

  .mobile-menu-btn {
    display: flex;
  }

  .mobile-menu {
    display: block;
  }

  .mobile-menu:not(.active) {
    display: none;
  }

  /* 모바일 상권 정보 */
  .commerce-info {
    padding: 8px 0;
  }

  .info-content {
    flex-direction: column;
    gap: 6px;
    font-size: 12px;
  }

  .info-divider {
    display: none;
  }

  .info-item {
    text-align: center;
  }
}

/* 다크모드 대응 */
@media (prefers-color-scheme: dark) {
  .global-header {
    background: #1f2937;
    border-bottom-color: #374151;
  }

  .commerce-info {
    background: #111827;
    border-top-color: #374151;
  }

  .info-item {
    color: #9ca3af;
  }

  .info-value {
    color: #e5e7eb;
  }

  .info-divider {
    color: #4b5563;
  }

  .nav-item {
    color: #9ca3af;
  }

  .nav-item:hover,
  .nav-item.active {
    color: #ff6b35;
    background: #2d1b17;
  }

  .mobile-menu {
    background: #1f2937;
    border-top-color: #374151;
  }
}
</style>