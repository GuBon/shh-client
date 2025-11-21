<template>
  <div class="analysis-page">
    <GlobalHeader />

    <div class="main-content">
      <div class="container">
        <!-- 페이지 헤더 -->
        <div class="page-header">
          <h1>서울 골목상권 클러스터 분석</h1>
        </div>
          <!-- 차트 -->
          <div class="chart-card">
            <div class="chart-header">
              <h2>상권 평균 연령 vs 총매출 분포 (클러스터링)</h2>
              <p>X축: 평균 연령 (세) | Y축: 총매출 (로그 스케일)</p>
              <div class="chart-hint">
                💡  클러스터나 점 위에 마우스를 올리면 해당 상권정보를 알 수 있습니다.
              </div>
            </div>
            <div class="chart-container">
              <!-- Flourish 스캐터 차트 -->
              <div
                  ref="flourishContainer"
                  class="flourish-embed flourish-scatter"
                  data-src="visualisation/26226563"
              >
                <div v-if="!flourishLoaded" class="flourish-loading">
                  <div class="loading-spinner"></div>
                  <p>차트를 불러오는 중...</p>
                </div>
                <noscript>
                  <img
                      src="https://public.flourish.studio/visualisation/26226563/thumbnail"
                      width="100%"
                      alt="scatter visualization"
                  />
                </noscript>
              </div>
            </div>

            <!-- 범례 -->
            <div class="chart-legend">
              <div
                  v-for="cluster in clusterInfo"
                  :key="cluster.id"
                  class="legend-item clickable"
                  @click="openClusterDetail(cluster)"
              >
                <div
                    class="legend-color"
                    :style="{ backgroundColor: cluster.color }"
                ></div>
                <div class="legend-details">
                  <span class="legend-title">{{ cluster.name }}</span>
                  <span class="legend-desc">{{ cluster.description }}</span>
                </div>
                <div class="legend-arrow">
                  <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                  >
                    <path
                        d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- 🔎 연령/성별 업종 선호도 & 고객 성향 분석 섹션 -->
          <div class="customer-profile-card">
            <div class="chart-header">
              <h2>연령/성별 업종 선호도</h2>
              <p>
                우리 상권을 찾는 주요 고객의 라이프스타일과, 제휴로 함께
                성장할 수 있는 옆 가게 인사이트입니다.
              </p>
            </div>

            <div class="customer-profile-content">
              <!-- 그래프 이미지 -->
              <div class="customer-profile-image">
                <img
                    src="/images/graph.png"
                    alt="연령/성별 업종 선호도 클러스터 그래프"
                />
                <p class="image-caption">
                  K-Means 군집 분석 결과(K=4)를 기반으로 한 업종별 고객
                  세그먼트입니다.
                </p>
              </div>
            </div>
              <!-- 텍스트 인사이트 -->
              <div class="customer-profile-text">
                <h3 class="section-title">
                  [고객 성향 분석] 우리 가게의 “진짜 단짝”은 누구일까요?
                </h3>
                <blockquote class="section-quote">
                  “00사장님 업종의 주요 고객층을 파악하고, 그들이 좋아하는
                  ‘옆 가게’와 손을 잡으세요.”
                </blockquote>

                <!-- 1. 2030 여성 -->
                <div class="segment-block segment-red">
                  <h4>1. 🔴 [2030 여성] "나를 위한 뷰티 &amp; 힐링 코스"</h4>
                  <p class="segment-intro">
                    "예뻐지고, 맛있는 것을 먹으며 스트레스를 푸는
                    '자기관리형' 소비 패턴입니다."
                  </p>
                  <ul class="segment-list">
                    <li>
                      <strong>선호 업종 TOP 3:</strong>
                      <span>네일/피부관리 ➡ 커피/음료 ➡ 패스트푸드</span>
                    </li>
                    <li>
                      <strong>고객의 심리 (Insight):</strong>
                      <ul>
                        <li>
                          "관리받는 날은 기분 전환하는 날!" 관리 후 예쁜 카페에서
                          디저트나 간편 식사를 즐깁니다.
                        </li>
                        <li>
                          <strong>비주얼</strong>과 <strong>트렌드</strong>에
                          민감하며, 인스타그램에 올릴 수 있는 공간을 선호합니다.
                        </li>
                      </ul>
                    </li>
                    <li>
                      <strong>💡 사장님을 위한 제휴 꿀팁:</strong>
                      <ul>
                        <li>
                          <strong>(카페 사장님)</strong> 인근 네일숍/미용실
                          영수증을 가져오면
                          <strong>'디저트 10% 할인'</strong> 혜택을 주세요.
                          "관리받느라 당 떨어지셨죠?" 같은 감성 카피와 함께요.
                        </li>
                        <li>
                          <strong>(뷰티숍 원장님)</strong> 대기하는 손님들에게
                          인근 핫한 카페의 '음료 쿠폰'을 서비스로 제공해 보세요.
                        </li>
                      </ul>
                    </li>
                  </ul>
                </div>

                <!-- 2. 4050 남성 -->
                <div class="segment-block segment-blue">
                  <h4>2. 🔵 [4050 남성] "퇴근 후 든든한 회식 코스"</h4>
                  <p class="segment-intro">
                    "동료들과 함께 식사부터 술자리까지 이어지는 '모임형' 소비
                    패턴입니다."
                  </p>
                  <ul class="segment-list">
                    <li>
                      <strong>선호 업종 TOP 3:</strong>
                      <span>한식음식점 ➡ 호프/간이주점 ➡ 노래방</span>
                    </li>
                    <li>
                      <strong>고객의 심리 (Insight):</strong>
                      <ul>
                        <li>
                          "밥 배 따로, 술 배 따로!" 1차로 든든하게, 2차로 가볍게
                          맥주 한잔할 곳을 찾습니다.
                        </li>
                        <li>
                          새로운 곳보다는
                          <strong>익숙하고 편안한 분위기</strong>와
                          <strong>단체석</strong>을 선호합니다.
                        </li>
                      </ul>
                    </li>
                    <li>
                      <strong>💡 사장님을 위한 제휴 꿀팁:</strong>
                      <ul>
                        <li>
                          <strong>(고깃집 사장님)</strong> 계산대 옆에 인근
                          호프집의 '마른안주 서비스 쿠폰'을 비치해 두고,
                          "2차 가실 때 여기 어떠세요?"라고 자연스럽게
                          추천해보세요.
                        </li>
                        <li>
                          <strong>(호프집 사장님)</strong> 인근 맛집들과 함께
                          '회식 예약 원스톱 패키지'를 만들어보는 것도 좋습니다.
                        </li>
                      </ul>
                    </li>
                  </ul>
                </div>

                <!-- 3. 4050 여성 -->
                <div class="segment-block segment-green">
                  <h4>
                    3. 🟢 [4050 여성] "가족과 나를 챙기는 생활 쇼핑 코스"
                  </h4>
                  <p class="segment-intro">
                    "가족을 위한 장보기와 나를 위한 미용/건강을 한 번에 해결하는
                    '실속형' 소비 패턴입니다."
                  </p>
                  <ul class="segment-list">
                    <li>
                      <strong>선호 업종 TOP 3:</strong>
                      <span>슈퍼마켓 ➡ 한의원/병원 ➡ 일반의류/화장품</span>
                    </li>
                    <li>
                      <strong>고객의 심리 (Insight):</strong>
                      <ul>
                        <li>
                          동네 상권을 가장 촘촘하게 이용하는 '큰손'입니다. 장을
                          보러 나온 김에 병원·옷가게도 함께 들릅니다.
                        </li>
                        <li>
                          제품 <strong>품질</strong>과 사장님과의
                          <strong>신뢰(단골 관계)</strong>를 가장 중요하게
                          생각합니다.
                        </li>
                      </ul>
                    </li>
                    <li>
                      <strong>💡 사장님을 위한 제휴 꿀팁:</strong>
                      <ul>
                        <li>
                          <strong>(슈퍼마켓 사장님)</strong> 장바구니를 든
                          손님들에게 인근 옷가게·화장품 가게의 '세일 소식'을
                          함께 알려주세요. 동네 사랑방 역할을 할수록 재방문이
                          늘어납니다.
                        </li>
                        <li>
                          <strong>(한의원 원장님)</strong> 대기실에 인근
                          슈퍼마켓의 '제철 과일/건강 식재료 정보'를 함께
                          비치해보세요.
                        </li>
                      </ul>
                    </li>
                  </ul>
                </div>

                <!-- 4. 2030 남성 -->
                <div class="segment-block segment-purple">
                  <h4>4. 🟣 [2030 남성] "친구들과 즐기는 가성비 놀이 코스"</h4>
                  <p class="segment-intro">
                    "친구들과 몰려다니며 저렴하고 재밌게 시간을 보내는
                    '엔터테인먼트형' 소비 패턴입니다."
                  </p>
                  <ul class="segment-list">
                    <li>
                      <strong>선호 업종 TOP 3:</strong>
                      <span>PC방 ➡ 당구장 ➡ 편의점/분식</span>
                    </li>
                    <li>
                      <strong>고객의 마음 (Insight):</strong>
                      <ul>
                        <li>
                          "가성비가 최고!" 저렴한 가격으로 오랫동안 놀 수 있는
                          공간을 선호합니다.
                        </li>
                        <li>
                          식사보다는 게임·놀이 중간에 간편하게 배를 채울 수 있는
                          <strong>분식</strong>·<strong>편의점</strong>을
                          이용합니다.
                        </li>
                      </ul>
                    </li>
                    <li>
                      <strong>💡 사장님을 위한 제휴 꿀팁:</strong>
                      <ul>
                        <li>
                          <strong>(당구장 사장님)</strong> 내기에서 이긴 팀에게
                          인근 PC방 <strong>'1시간 이용권'</strong>을 주는
                          이벤트를 열어보세요.
                        </li>
                        <li>
                          <strong>(PC방/분식 사장님)</strong> 당구장·보드게임방과
                          함께 '게임+간식 세트'를 기획하면 체류시간을 더
                          늘릴 수 있습니다.
                        </li>
                      </ul>
                    </li>
                  </ul>
                </div>
            </div>
          </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import GlobalHeader from '../components/GlobalHeader.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 로그인한 사용자의 클러스터 유형 확인 및 리다이렉트
const checkUserClusterAndRedirect = () => {
  // "전체 분석 보기" 쿼리 파라미터가 있으면 리다이렉트하지 않음
  if (route.query.showAll === 'true') {
    return
  }

  if (authStore.isAuthenticated && authStore.user) {
    // 예시: 사용자가 블루 유형이라면 (실제로는 사용자 데이터에서 가져와야 함)
    const userClusterType = authStore.user.clusterType || 'blue' // 기본값을 blue로 설정
    
    // 블루 유형 분석 페이지로 리다이렉트
    router.push(`/analysis/cluster/${userClusterType}`)
  }
}

// 상태
const flourishContainer = ref(null)
const flourishLoaded = ref(false)

// 클러스터 정보
const clusterInfo = [
  { 
    id: 0,
    color: '#27ae60',
    name: '그린 상권',
    description: '동네 든든 상권',
    type: 'green'
  },
  { 
    id: 1,
    color: '#e74c3c',
    name: '레드 상권',
    description: '모두가 찾는 핫플 상권',
    type: 'red'
  },
  { 
    id: 2,
    color: '#f39c12',
    name: '오렌지 상권',
    description: '찾아오는 맛집/멋집 상권/ 입소문 상권',
    type: 'orange'
  },
  { 
    id: 3, 
    color: '#3498db', 
    name: '블루 상권', 
    description: '새로운 활력 상권',
    type: 'blue'
  }
]


// Flourish embed 관련 함수
const loadFlourishScript = () => {
  return new Promise((resolve) => {
    // 이미 로드된 경우
    if (window.flourish) {
      resolve()
      return
    }
    
    // 스크립트가 이미 존재하는지 확인
    const existingScript = document.querySelector('script[src*="flourish.studio"]')
    if (existingScript) {
      resolve()
      return
    }
    
    // 새로운 스크립트 태그 생성
    const script = document.createElement('script')
    script.src = 'https://public.flourish.studio/resources/embed.js'
    script.async = true
    script.onload = resolve
    script.onerror = resolve // 에러가 있어도 계속 진행
    document.head.appendChild(script)
  })
}

const initializeFlourishChart = async () => {
  try {
    console.log('Flourish 초기화 시작')
    
    await loadFlourishScript()
    
    // 간단한 타이밍으로 처리
    setTimeout(() => {
      if (window.flourish && window.flourish.embed) {
        window.flourish.embed()
        console.log('Flourish 초기화 완료')
      }
      flourishLoaded.value = true
    }, 300)
    
  } catch (error) {
    console.error('Flourish 초기화 실패:', error)
    flourishLoaded.value = true
  }
}

// 모달 관련 함수들을 라우팅으로 변경
const openClusterDetail = (cluster) => {
  router.push(`/analysis/cluster/${cluster.type}`)
}

// 라이프사이클
onMounted(async () => {
  // 로그인한 사용자라면 해당 클러스터 페이지로 리다이렉트
  if (authStore.isAuthenticated) {
    checkUserClusterAndRedirect()
    return
  }
  
  // 로그인하지 않은 경우 전체 분석 페이지 표시
  console.log('Analysis page loaded for guest user')
  
  // Flourish 차트 초기화
  await initializeFlourishChart()
})

// 컴포넌트 정리
onUnmounted(() => {
  // Flourish 관련 정리가 필요한 경우 여기에 추가
  flourishLoaded.value = false
})

</script>

<style scoped>
.analysis-page {
  min-height: 100vh;
  background: #f8fafc;
}

.main-content {
  padding: 40px 0;
}

.container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 40px;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  margin: 0 0 16px;
  font-size: 28px;
  font-weight: 700;
  color: #111827;
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

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.chart-card {
  background: white;
  border-radius: 16px;
  padding: 48px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 40px;
}

.chart-header {
  margin-bottom: 32px;
  text-align: center;
}

.chart-header h2 {
  margin: 0 0 12px;
  font-size: 24px;
  font-weight: 600;
  color: #111827;
}

.chart-header p {
  margin: 0 0 16px;
  font-size: 16px;
  color: #6b7280;
}

.chart-hint {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #059669;
  background: #ecfdf5;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #a7f3d0;
}

.chart-container {
  position: relative;
}

.flourish-embed {
  width: 100%;
  height: 720px;
  position: relative;
  margin-bottom: 20px;
}

.flourish-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6b7280;
}

.flourish-loading .loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #ff6b35;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

.flourish-loading p {
  margin: 0;
  font-size: 14px;
}

.chart-legend {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-top: 60px;
  padding-top: 32px;
  border-top: 1px solid #e5e7eb;
}

.legend-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  transition: all 0.2s;
  position: relative;
}

.legend-item.clickable {
  cursor: pointer;
  border: 1px solid transparent;
}

.legend-item.clickable:hover {
  background: #f9fafb;
  border-color: #e5e7eb;
  transform: translateY(-1px);
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  margin-top: 2px;
  flex-shrink: 0;
}

.legend-details {
  flex: 1;
}

.legend-title {
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
}

.legend-desc {
  display: block;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.3;
}

.legend-arrow {
  color: #9ca3af;
  opacity: 0;
  transition: all 0.2s;
}

.legend-item.clickable:hover .legend-arrow {
  opacity: 1;
  color: #6b7280;
}

/* 공통 클릭 가능 요소 스타일 */
.clickable {
  position: relative;
  transition: all 0.2s ease;
}

.clickable:hover {
  transform: translateY(-1px);
}

.clickable::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: inherit;
  box-shadow: 0 0 0 2px transparent;
  transition: box-shadow 0.2s ease;
}

.clickable:focus::after,
.clickable:focus-visible::after {
  box-shadow: 0 0 0 2px #3b82f6;
  outline: none;
}

/* 반응형 디자인 */
@media (max-width: 1200px) {
  .container {
    max-width: 1200px;
    padding: 0 30px;
  }
  
  .chart-card {
    padding: 36px;
  }
  
  .chart-legend {
    gap: 16px;
  }
  
  .legend-item {
    padding: 16px;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 20px;
  }

  .page-header h1 {
    font-size: 22px;
  }

  .chart-card {
    padding: 24px;
    border-radius: 12px;
  }

  .flourish-embed {
    height: 550px;
  }
  
  .flourish-loading {
    height: 550px;
  }

  .chart-legend {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .legend-item {
    padding: 16px;
  }

  .legend-title {
    font-size: 15px;
  }

  .legend-desc {
    font-size: 13px;
  }

  .chart-hint {
    font-size: 12px;
    padding: 6px 10px;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 16px;
  }
  
  .main-content {
    padding: 20px 0;
  }

  .chart-card {
    padding: 20px;
    margin-bottom: 30px;
  }

  .flourish-embed {
    height: 450px;
  }
  
  .flourish-loading {
    height: 450px;
  }

  .chart-legend {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .legend-item {
    padding: 14px;
  }

  .legend-title {
    font-size: 14px;
  }

  .legend-desc {
    font-size: 12px;
  }
}
.customer-profile-card {
  background: white;
  border-radius: 16px;
  padding: 40px 48px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  margin-bottom: 40px;
}

.customer-profile-header {
  margin-bottom: 24px;
}

.customer-profile-header h2 {
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 600;
  color: #111827;
}

.customer-profile-header p {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

.customer-profile-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* 이미지 영역 */
.customer-profile-image {
  text-align: center;
}

.customer-profile-image img {
  width: 80%;
  max-width: 800px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  display: block;
  margin: 0 auto;
}

.image-caption {
  margin-top: 8px;
  font-size: 12px;
  color: #9ca3af;
}

/* 텍스트 영역 */
.customer-profile-text {
  max-height: 100%;

}

.section-title {
  text-align: center;
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.section-quote {
  text-align: center;
  margin: 0 0 20px;
  padding-left: 12px;
  //border-left: 3px solid #3b82f6;
  font-size: 13px;
  color: #4b5563;
}

/* 세그먼트 블록 공통 */
.segment-block {
  margin-bottom: 24px;
  padding: 16px 18px;
  border-radius: 12px;
  background: #f9fafb;
  border-left: 4px solid #e5e7eb;
}

.segment-block h4 {
  margin: 0 0 8px;
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.segment-intro {
  margin: 0 0 10px;
  font-size: 13px;
  color: #4b5563;
}

.segment-list {
  margin: 0;
  padding-left: 16px;
  list-style: disc;
  font-size: 13px;
  color: #4b5563;
}

.segment-list > li {
  margin-bottom: 8px;
}

.segment-list ul {
  margin: 4px 0 0 16px;
  padding-left: 0;
  list-style: disc;
}

/* 색깔 포인트 */
.segment-red {
  border-left-color: #ef4444;
}

.segment-blue {
  border-left-color: #3b82f6;
}

.segment-green {
  border-left-color: #10b981;
}

.segment-purple {
  border-left-color: #a855f7;
}

/* 반응형 */
@media (max-width: 1024px) {
  .customer-profile-card {
    padding: 28px 24px;
  }
}

@media (max-width: 640px) {
  .customer-profile-header h2 {
    font-size: 18px;
  }
  .section-title {
    font-size: 16px;
  }
}
</style>
