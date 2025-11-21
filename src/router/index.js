import { createRouter, createWebHistory } from 'vue-router'

// 페이지 컴포넌트 import (lazy loading 적용)
const StoreFinderPage = () => import('../views/StoreFinderPage.vue')
const StoreDetailPage = () => import('../views/StoreDetailPage.vue')
const MyPage = () => import('../views/MyPage.vue')
const MyStorePage = () => import('../views/MyStorePage.vue')
const AnalysisPage = () => import('../views/AnalysisPage.vue')
const ClusterDetailPage = () => import('../views/ClusterDetailPage.vue')
const LoginPage = () => import('../views/LoginPage.vue')
const SignUpPage = () => import('../views/SignUpPage.vue')

const routes = [
  {
    path: '/',
    name: 'StoreFinder',
    component: StoreFinderPage,
    meta: {
      title: '제휴매장 찾기'
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: {
      title: '로그인'
    }
  },
  {
    path: '/signup',
    name: 'SignUp',
    component: SignUpPage,
    meta: {
      title: '회원가입'
    }
  },
  {
    path: '/mypage',
    name: 'MyPage',
    component: MyPage,
    meta: {
      title: '마이페이지'
    }
  },
  {
    path: '/analysis',
    name: 'Analysis',
    component: AnalysisPage,
    meta: {
      title: '상권 분석'
    }
  },
  {
    path: '/analysis/cluster/:type',
    name: 'ClusterDetail',
    component: ClusterDetailPage,
    meta: {
      title: '클러스터 상세 분석'
    },
    beforeEnter: (to, from, next) => {
      const validTypes = ['green', 'red', 'orange', 'blue']
      if (validTypes.includes(to.params.type)) {
        next()
      } else {
        next('/analysis')
      }
    }
  },
  {
    path: '/my-store',
    name: 'MyStore',
    component: MyStorePage,
    meta: {
      title: '제휴 매장 관리'
    }
  },
  {
    path: '/store/:id',
    name: 'StoreDetail',
    component: StoreDetailPage,
    meta: {
      title: '매장 상세정보'
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 페이지 타이틀 설정
router.beforeEach((to, from, next) => {
  const title = to.meta?.title || '소확행'
  document.title = `${title} | 소확행`
  next()
})

export default router
