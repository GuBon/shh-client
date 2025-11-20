<template>
  <div class="cluster-detail-page">
    <GlobalHeader />

    <div class="main-content">
      <div class="container">
        <!-- 브레드크럼 -->
        <div class="breadcrumb">
          <router-link to="/analysis" class="breadcrumb-item">상권 분석</router-link>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-current">{{ clusterConfig.name }}</span>
        </div>

        <!-- 페이지 헤더 -->
        <div class="page-header">
          <div class="header-top">
            <div class="cluster-badge">
              <div class="cluster-color" :style="{ backgroundColor: clusterConfig.color }"></div>
              <span class="cluster-type">{{ clusterConfig.name }}</span>
            </div>
            <button @click="$router.push('/analysis')" class="view-all-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
              </svg>
              전체 분석 보기
            </button>
          </div>
          <h1>{{ clusterConfig.name }} 상세 분석</h1>
          <p class="page-description">{{ clusterConfig.description }}</p>
        </div>

        <!-- ================== 실제 콘텐츠 시작 (정적 텍스트 기반) ================== -->

        <!-- 상권 유형 인트로 -->
        <section class="cluster-intro-section">
          <h2>📍 사장님의 상권 유형은?</h2>
          <p class="cluster-intro-quote">
            “{{ getClusterQuote(clusterId) }}”
          </p>
        </section>

        <!-- 클러스터 개요 -->
        <section class="overview-section">
          <h2>📊 데이터로 본 우리 상권</h2>
          <div class="overview-grid">
            <!-- 누가 오나요 -->
            <div class="overview-card">
              <div class="overview-icon">👥</div>
              <div class="overview-content">
                <span class="overview-label">누가 오나요?</span>
                <span class="overview-value">{{ getClusterAge(clusterId) }}세</span>
                <span class="overview-sub">{{ getAgeDescription(clusterId) }}</span>
              </div>
            </div>

            <!-- 얼마나 오나요 -->
            <div class="overview-card">
              <div class="overview-icon">🚶</div>
              <div class="overview-content">
                <span class="overview-label">얼마나 오나요?</span>
                <span class="overview-value">{{ getTrafficLevel(clusterId) }}</span>
                <span class="overview-sub">{{ getTrafficDescription(clusterId) }}</span>
              </div>
            </div>

            <!-- 장사는 잘 되나요 -->
            <div class="overview-card">
              <div class="overview-icon">💰</div>
              <div class="overview-content">
                <span class="overview-label">장사는 잘 되나요?</span>
                <span class="overview-value">{{ getBusinessLevel(clusterId) }}</span>
                <span class="overview-sub">{{ getBusinessDescription(clusterId) }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 업종 분포 -->
        <section class="business-distribution-section">
          <h2>🏪 주요 업종 분포</h2>
          <div class="business-chart-container">
            <div class="business-chart">
              <div
                  v-for="(business, index) in getTopBusinessTypes(clusterId)"
                  :key="index"
                  class="business-item"
              >
                <div class="business-rank">{{ index + 1 }}위</div>
                <div class="business-info">
                  <div class="business-name">{{ business.name }}</div>
                  <div class="business-bar-container">
                    <div
                        class="business-bar"
                        :style="{
                        width: business.percentage + '%',
                        backgroundColor: clusterConfig.color
                      }"
                    ></div>
                  </div>
                </div>
                <div class="business-percentage">{{ business.percentage }}%</div>
              </div>
            </div>
          </div>
          <div class="business-insight">
            <div class="insight-icon">💡</div>
            <div class="insight-text">{{ getBusinessInsight(clusterId) }}</div>
          </div>
        </section>

        <section class="business-distribution-section">
          <div class="chart-card">
            <div class="chart-header">
              <h2>업종 분포표</h2>
              <p>업종의 분포가 해당 박스의 크기에 따라 나타납니다.</p>
              <div class="chart-hint">
                💡 마우스를 올리면 업종명이 나타납니다.
              </div>
            </div>
            <div class="chart-container">
              <div
                  ref="flourishContainer"
                  class="flourish-embed flourish-scatter"
                  :data-src="currentFlourishSrc"
                  :key="currentFlourishSrc">   <!-- 상권 유형 바뀔 때 강제 리렌더 -->

              <div v-if="!flourishLoaded" class="flourish-loading">
                <div class="loading-spinner"></div>
                <p>차트를 불러오는 중...</p>
              </div>
              <noscript>
                <img
                    :src="`https://public.flourish.studio/${currentFlourishSrc}/thumbnail`"
                    width="100%"
                    alt="업종 분포 시각화"
                />
              </noscript>
            </div>
          </div>
          </div>
        </section>


      <!-- 고객 행동 분석 -->
        <section class="customer-behavior-section">
          <h2>👥 고객 행동 분석</h2>
          <div class="behavior-card">
            <div class="behavior-header">
              <h3>{{ getCustomerBehaviorTitle(clusterId) }}</h3>
            </div>
            <div class="behavior-content">
              <div class="behavior-points">
                <div
                    v-for="(point, index) in getCustomerBehaviorPoints(clusterId)"
                    :key="index"
                    class="behavior-point"
                >
                  <div class="point-icon">•</div>
                  <div class="point-content">
                    <div class="point-title">{{ point.title }}</div>
                    <div class="point-description">{{ point.description }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 생존 법칙 -->
        <section class="survival-rules-section">
          <h2>🎯 생존 법칙</h2>
          <div class="survival-subtitle">이 상권에서 살아남는 방법</div>
          <div class="rules-grid">
            <div
                v-for="(rule, index) in getSurvivalRules(clusterId)"
                :key="index"
                class="rule-card"
            >
              <div class="rule-number">{{ index + 1 }}</div>
              <div class="rule-content">
                <h3 class="rule-title">{{ rule.title }}</h3>
                <p class="rule-description">{{ rule.description }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- 제휴 파트너 추천 섹션 -->
        <section class="partnership-section">
          <h2>🤝 제휴 파트너 매칭</h2>
          <div class="partnership-card">
            <div class="partnership-content">
              <h3>{{ getPartnershipTitle(clusterId) }}</h3>
              <p>{{ getPartnershipDescription(clusterId) }}</p>
              <button class="partnership-btn" @click="goToPartnerMatching">
                👉 내 업종에 딱 맞는 '제휴 파트너' 매칭하기
              </button>
            </div>
            <div class="partnership-icon">🎯</div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

import GlobalHeader from '../components/GlobalHeader.vue'

const route = useRoute()
const router = useRouter()

// 클러스터 설정 (이건 그대로 사용)
const clusterConfigs = {
  green: {
    id: 0,
    color: '#27ae60',
    name: 'Cluster 0 (그린 유형)',
    description: '[생활 중심 상권]',
    type: 'green',
    quote: '동네 주민들의 발길이 끊이지 않는 안정된 상권입니다.'
  },
  red: {
    id: 1,
    color: '#e74c3c',
    name: 'Cluster 1 (레드 유형)',
    description: '[핫플레이스 상권]',
    type: 'red',
    quote: '서울에서 가장 핫한, 누구나 한 번쯤 와보고 싶어 하는 \'핫플레이스\'입니다.'
  },
  orange: {
    id: 2,
    color: '#f39c12',
    name: 'Cluster 2 (오렌지 유형)',
    description: '[목적형 핀포인트 상권]',
    type: 'orange',
    quote: '손님 수는 적지만, 방문하면 무조건 지갑을 여는 \'실속형\' 상권입니다.'
  },
  blue: {
    id: 3,
    color: '#3498db',
    name: 'Cluster 3 (블루 유형)',
    description: '[활력 충전 필요 상권]',
    type: 'blue',
    quote: '지금은 잠시 숨을 고르고 있지만, \'새로운 활력\'만 채워진다면 다시 태어날 수 있는 잠재력 있는 곳입니다.'
  }
}

// 현재 클러스터 ID 및 설정
const clusterId = computed(() => {
  const type = route.params.type
  return clusterConfigs[type]?.id ?? 0
})

const clusterConfig = computed(() => {
  const type = route.params.type
  return clusterConfigs[type] || clusterConfigs.green
})

const goToPartnerMatching = () => {
  router.push('/')
}

/* ===================== 문서 기반 콘텐츠 함수들 ===================== */

// 상단 “사장님의 상권 유형은?” 인용문
const getClusterQuote = (clusterIdValue) => {
  const quotes = {
    0: `동네 주민들의 발길이 끊이지 않는 안정된 상권입니다.`,
    1: `서울에서 가장 핫한, 누구나 한 번쯤 와보고 싶어 하는 '핫플레이스'입니다.`,
    2: `손님 수는 적지만, 방문하면 무조건 지갑을 여는 '실속형' 상권입니다.`,
    3: `지금은 잠시 숨을 고르고 있지만, '새로운 활력'만 채워진다면 다시 태어날 수 있는 잠재력 있는 곳입니다.`
  }
  return quotes[clusterIdValue] || ''
}

// “누가 오나요?” 숫자
const getClusterAge = (clusterIdValue) => {
  const ages = {
    0: '47.1',
    1: '38.0',
    2: '35.5',
    3: '47.5'
  }
  return ages[clusterIdValue] || '45.0'
}

// “누가 오나요?” 설명
const getAgeDescription = (clusterIdValue) => {
  const descriptions = {
    0: `이곳의 주인은 '동네 터줏대감'인 4050 중장년층입니다. 트렌드보다 실속과 편안함을 중요하게 생각하는 분들입니다.`,
    1: `유행을 선도하는 2030 젊은 층이 주력입니다. 새로운 문화를 소비하고 전파하는 '트민남/녀'들이 모이는 곳입니다.`,
    2: `서울시 골목상권 중 가장 젊은 고객층이 찾는 곳입니다. 트렌드에 민감한 2030세대가 주력입니다.`,
    3: `뜨내기손님이 아니라, 이 동네를 지키는 든든한 '토박이' 거주민들이 핵심 고객입니다. 한 번 마음을 열면 가장 충성도 높은 단골이 됩니다.`
  }
  return descriptions[clusterIdValue] || ''
}

// “얼마나 오나요?” 한 줄 요약
const getTrafficLevel = (clusterIdValue) => {
  const levels = {
    0: '매출/유동 모두 2위',
    1: '압도적 1위',
    2: '유동인구 최저',
    3: '유동인구 낮음 (거주민 중심)'
  }
  return levels[clusterIdValue] || ''
}

// “얼마나 오나요?” 설명
const getTrafficDescription = (clusterIdValue) => {
  const descriptions = {
    0: `서울시 최상위권입니다. 레드 유형(1등)이 '관광객'으로 붐빈다면, 이곳은 '거주민'들의 꾸준한 방문으로 붐빕니다.`,
    1: `매출, 유동인구, 업종 수 모든 지표에서 서울시 전체 1등입니다. 평일, 주말 할 것 없이 1년 내내 사람이 넘쳐납니다.`,
    2: `북적북적한 대로변이 아닙니다. 지나가다 들르는 손님보다 알고 찾아오는 손님이 대부분입니다.`,
    3: `사람들의 발길이 많지 않고 외부에서 일부러 찾아오는 손님은 많지 않습니다. 하지만 매일 이 길을 지나는 잠재 고객이 모여 있는 상권입니다.`
  }
  return descriptions[clusterIdValue] || ''
}

// “장사는 잘 되나요?” 한 줄 요약
const getBusinessLevel = (clusterIdValue) => {
  const levels = {
    0: '안정적 실수요',
    1: '성장 중심 축',
    2: '효율성 압도적 1위',
    3: '서울 시민의 가장 친근한 삶의 터전'
  }
  return levels[clusterIdValue] || ''
}

// “장사는 잘 되나요?” 설명
const getBusinessDescription = (clusterIdValue) => {
  const descriptions = {
    0: `특정 업종에 쏠리지 않고 다양한 가게들이 골고루 잘 됩니다. 기복 없이 꾸준한 매출을 올리는 '스테디셀러' 상권입니다.`,
    1: `가장 높은 매출을 기록하지만, 그만큼 경쟁도 치열합니다. 성공하면 전국구 브랜드로 성장할 수 있는 '기회의 상권'입니다.`,
    2: `유동인구가 적다고 걱정하지 마세요. 유동인구 대비 매출 효율은 서울시 전체 1등입니다. '목적을 갖고 한 번 온 손님은 큰 돈을 쓰고 간다'는 뜻입니다.`,
    3: `반짝하고 사라지는 유행이 아닌, 서울 시민의 일상을 지탱하는 상권입니다. 화려하진 않지만 오래가는 장사를 할 수 있는 곳입니다.`
  }
  return descriptions[clusterIdValue] || ''
}

// 업종 분포 TOP3
const getTopBusinessTypes = (clusterIdValue) => {
  const businessTypes = {
    0: [
      { name: '한식음식점', percentage: 4.4 },
      { name: '미용실', percentage: 4.2 },
      { name: '커피-음료', percentage: 4.2 }
    ],
    1: [
      { name: '한식음식점', percentage: 3.4 },
      { name: '커피-음료', percentage: 3.4 },
      { name: '호프-간이주점', percentage: 3.4 }
    ],
    2: [
      { name: '한식음식점', percentage: 9.8 },
      { name: '커피-음료', percentage: 9.1 },
      { name: '미용실', percentage: 7.4 }
    ],
    3: [
      { name: '한식음식점', percentage: 8.5 },
      { name: '미용실', percentage: 8.3 },
      { name: '커피-음료', percentage: 6.8 }
    ]
  }
  return businessTypes[clusterIdValue] || []
}

// 🔹 클러스터별 Flourish 시각화 ID 매핑
// 실제 Flourish 프로젝트 ID로 바꿔 넣어줘!
const flourishMap = {
  0: 'visualisation/26228702', // 그린 상권 treemap ID
  1: 'visualisation/26333681', // 레드 상권 treemap ID
  2: 'visualisation/26333678', // 오렌지 상권 treemap ID
  3: 'visualisation/26333672'  // 블루 상권 treemap ID
}

// Flourish 상태
const flourishContainer = ref(null)
const flourishLoaded = ref(false)

// 현재 클러스터에 맞는 Flourish src
const currentFlourishSrc = computed(() => {
  // clusterId.value: 0/1/2/3
  return flourishMap[clusterId.value] || 'visualisation/AAAAAAA'
})

// Flourish embed 스크립트 로드
const loadFlourishScript = () => {
  return new Promise((resolve, reject) => {
    // 이미 로드되어 있으면 패스
    if (window.flourish) {
      resolve()
      return
    }

    const existingScript = document.querySelector('script[src*="flourish.studio"]')
    if (existingScript) {
      existingScript.addEventListener('load', resolve)
      existingScript.addEventListener('error', reject)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://public.flourish.studio/resources/embed.js'
    script.async = true
    script.onload = () => resolve()
    script.onerror = (error) => reject(error)
    document.head.appendChild(script)
  })
}

// Flourish 차트 초기화
const initializeFlourishChart = async () => {
  try {
    await loadFlourishScript()
    // DOM 업데이트 반영 후 embed 호출을 위해 약간의 딜레이
    setTimeout(() => {
      if (window.flourish && window.flourish.embed) {
        window.flourish.embed()
      }
      flourishLoaded.value = true
    }, 300)
  } catch (e) {
    console.error('Flourish init error:', e)
    flourishLoaded.value = true
  }
}


// aside 💡 “핵심” 문구
const getBusinessInsight = (clusterIdValue) => {
  const insights = {
    0: `“새로운 손님을 끌어오는 것보다, '단골 손님'이 더 자주 오게 만드는 것이 중요합니다.”`,
    1: `“단순히 물건을 파는 것이 아니라, 고객에게 '특별한 경험'과 '자랑거리'를 팔아야 합니다.”`,
    2: `“사람을 많이 모으는 것보다, 한 명의 손님을 확실하게 만족시키는 것이 매출에 더 큰 영향을 줍니다.”`,
    3: `“익숙함은 곧 '신뢰'입니다. 이웃들이 편하게 들러 쉬어갈 수 있는 '동네 사랑방'이 되어주세요.”`
  }
  return insights[clusterIdValue] || ''
}

// 고객 행동 - 제목
const getCustomerBehaviorTitle = (clusterIdValue) => {
  const titles = {
    0: "손님들은 '일상'을 보내러 옵니다",
    1: "손님들은 '놀러' 옵니다",
    2: "손님들은 이미 '결정'하고 옵니다",
    3: "손님들은 '새로운 즐거움'을 기다립니다"
  }
  return titles[clusterIdValue] || ''
}

// 고객 행동 - 포인트 리스트
const getCustomerBehaviorPoints = (clusterIdValue) => {
  const behaviorPoints = {
    0: [
      {
        title: '생활 밀착',
        description: `병원·약국·마트·세탁소 등 '목적형 생활 소비'가 주를 이룹니다.`
      },
      {
        title: '편안함 추구',
        description: `낯설고 힙한 곳보다, 익숙하고 편안한 '단골집'을 선호합니다.`
      },
      {
        title: '가성비/신뢰',
        description: `화려한 인테리어보다 '가격 대비 성능'과 사장님과의 '신뢰'를 중요시합니다.`
      }
    ],
    1: [
      {
        title: '경험 소비',
        description: `팝업스토어, 전시 등 '이색적인 체험'을 즐기러 옵니다.`
      },
      {
        title: 'SNS 공유',
        description: `인스타그램에 올릴 만한 사진 포인트가 중요합니다.`
      },
      {
        title: '새로움 갈망',
        description: `늘 새로운 것을 찾으며, 유행에 뒤처지는 매장은 빠르게 외면받습니다.`
      }
    ],
    2: [
      {
        title: '검색 먼저',
        description: `인스타그램·블로그·지도 앱에서 이미 갈 곳을 정하고 방문합니다.`
      },
      {
        title: '인증 필수',
        description: `사진을 찍고 기록을 남길 만한 가치가 있어야 방문합니다.`
      },
      {
        title: '연쇄 소비',
        description: `밥 + 카페 + 소품샵 등 하나의 코스로 소비를 이어가는 경향이 있습니다.`
      }
    ],
    3: [
      {
        title: '익숙함 속의 갈증',
        description: `늘 가던 가게에 익숙하지만, '조금 다른 무언가'를 내심 기다리고 있습니다.`
      },
      {
        title: '입소문의 힘',
        description: `주민들 사이에서의 입소문이 매우 강력하게 작용합니다.`
      }
    ]
  }
  return behaviorPoints[clusterIdValue] || []
}

// 생존 법칙
const getSurvivalRules = (clusterIdValue) => {
  const rules = {
    0: [
      {
        title: '“친근함이 무기다.”',
        description: `손님의 이름을 기억하고 안부를 묻는 '스몰 토크'가 최고의 마케팅입니다.`
      },
      {
        title: '“생활 동선을 파고들어라.”',
        description: `손님들의 하루 동선 안에 자연스럽게 내 가게가 포함되도록 위치·시간·서비스를 설계하세요.`
      }
    ],
    1: [
      {
        title: '“끊임없이 변화해야 한다.”',
        description: `시즌 한정 메뉴, 콜라보 등 늘 새로운 이야깃거리를 만들어야 합니다.`
      },
      {
        title: '“확산시켜라.”',
        description: `SNS, 인플루언서, 포토존 등을 통해 '찍고 공유하고 싶게' 만드는 것이 중요합니다.`
      }
    ],
    2: [
      {
        title: '“브랜딩이 곧 생존이다.”',
        description: `우리 가게만의 확실한 컨셉과 스토리가 있어야 합니다.`
      },
      {
        title: '“혼자서는 외롭다, 뭉쳐야 산다.”',
        description: `옆 가게 손님이 곧 내 손님이 될 수 있습니다. 코스를 함께 만드는 제휴를 고민해 보세요.`
      }
    ],
    3: [
      {
        title: '“반전 매력을 보여주세요.”',
        description: `익숙한 메뉴에 요즘 트렌드를 살짝 더해 '익숙하지만 새로운' 경험을 주세요.`
      },
      {
        title: '“동네 사랑방이 되어라.”',
        description: `플리마켓, 소소한 이벤트 등 주민이 모일 명분을 만들어 '커뮤니티 허브' 역할을 해보세요.`
      }
    ]
  }
  return rules[clusterIdValue] || []
}

// 제휴 파트너 섹션 문구
const getPartnershipTitle = (clusterIdValue) => {
  const titles = {
    0: '그렇다면, 내 가게(업종)와 가장 시너지가 날 파트너는 누구일까요?',
    1: '그렇다면, 내 가게(업종)와 가장 시너지가 날 파트너는 누구일까요?',
    2: '그렇다면, 내 가게(업종)와 가장 시너지가 날 파트너는 누구일까요?',
    3: '혼자 고민하지 마세요. 사장님 가게에 \'젊은 활기\'를 더해줄 파트너가 주변에 있습니다.'
  }
  return titles[clusterIdValue] || ''
}

const getPartnershipDescription = (clusterIdValue) => {
  const descriptions = {
    0: '소확행이 추천하는 그린 유형 최적의 제휴 파트너를 지금 확인해 보세요.',
    1: '소확행이 추천하는 레드 유형 최적의 제휴 파트너를 지금 확인해 보세요.',
    2: '소확행이 추천하는 오렌지 유형 최적의 제휴 파트너를 지금 확인해 보세요.',
    3: '소확행이 추천하는 블루 유형 최적의 제휴 파트너를 지금 확인해 보세요.'
  }
  return descriptions[clusterIdValue] || ''
}

// 페이지 타이틀 업데이트
watch(
    () => clusterConfig.value,
    (newConfig) => {
      document.title = `${newConfig.name} | 상권 분석 | 소확행`
    },
    { immediate: true }
)
// 첫 렌더 시 현재 클러스터에 맞는 차트 초기화
onMounted(async () => {
  flourishLoaded.value = false
  await initializeFlourishChart()
})

onUnmounted(() => {
  flourishLoaded.value = false
})

//  URL이 /analysis/cluster/green → /analysis/cluster/red 로 바뀔 때마다 차트 재초기화
watch(
    () => clusterId.value,
    async () => {
      flourishLoaded.value = false
      await initializeFlourishChart()
    }
)

</script>

<style scoped>
.cluster-detail-page {
  min-height: 100vh;
  background: #f8fafc;
}

.main-content {
  padding: 20px 0 60px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  font-size: 14px;
}

.breadcrumb-item {
  color: #6b7280;
  text-decoration: none;
  transition: color 0.2s;
}

.breadcrumb-item:hover {
  color: #374151;
}

.breadcrumb-separator {
  color: #9ca3af;
}

.breadcrumb-current {
  color: #111827;
  font-weight: 500;
}

.page-header {
  margin-bottom: 32px;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.cluster-badge {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  background: white;
  padding: 12px 20px;
  border-radius: 50px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.view-all-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 1px solid #e5e7eb;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}

.view-all-btn:hover {
  background: #f9fafb;
  border-color: #d1d5db;
  color: #111827;
}

.cluster-color {
  width: 16px;
  height: 16px;
  border-radius: 50%;
}

.cluster-type {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.page-header h1 {
  margin: 0 0 8px;
  font-size: 32px;
  font-weight: 800;
  color: #111827;
  line-height: 1.2;
}

.page-description {
  margin: 0;
  font-size: 16px;
  color: #6b7280;
}

/* 인트로 섹션 */
.cluster-intro-section {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  text-align: center;
}

.cluster-intro-section h2 {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 700;
  color: #111827;
}

.cluster-intro-quote {
  margin: 0;
  font-size: 16px;
  color: #4b5563;
  font-weight: 500;
}

/* 로딩/에러 */
.loading-container,
.error-container {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
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

.retry-btn {
  margin-top: 16px;
  padding: 10px 20px;
  background: #ff6b35;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.retry-btn:hover {
  background: #e55a2b;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 섹션 공통 스타일 */
section {
  margin-bottom: 48px;
}

section h2 {
  margin: 0 0 24px;
  font-size: 24px;
  font-weight: 700;
  color: #111827;
}

/* 개요 섹션 */
.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.overview-card {
  background: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 20px;
}

.overview-icon {
  font-size: 32px;
  width: 64px;
  height: 64px;
  background: #f3f4f6;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.overview-content {
  flex: 1;
}

.overview-label {
  display: block;
  font-size: 13px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.overview-value {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 4px;
}

.overview-sub {
  display: block;
  font-size: 12px;
  color: #9ca3af;
  line-height: 1.3;
}

/* 업종 분포 섹션 */
.business-distribution-section {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.business-chart-container {
  margin-bottom: 24px;
}

.business-chart {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.business-item {
  display: grid;
  grid-template-columns: 48px 1fr 60px;
  gap: 16px;
  align-items: center;
  padding: 16px;
  background: #f9fafb;
  border-radius: 12px;
}

.business-rank {
  background: #374151;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

.business-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.business-name {
  font-weight: 600;
  color: #111827;
  font-size: 16px;
}

.business-bar-container {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.business-bar {
  height: 100%;
  transition: width 0.8s ease;
  border-radius: 4px;
}

.business-percentage {
  font-weight: 700;
  color: #111827;
  text-align: right;
}

.business-insight {
  display: flex;
  gap: 12px;
  padding: 20px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 12px;
  align-items: flex-start;
}

.insight-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.insight-text {
  color: #0369a1;
  line-height: 1.5;
  font-weight: 500;
}

/* 고객 행동 섹션 */
.customer-behavior-section {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.behavior-card {
  background: #fafafa;
  border-radius: 12px;
  padding: 24px;
}

.behavior-header h3 {
  margin: 0 0 20px;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.behavior-points {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.behavior-point {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.point-icon {
  color: #6b7280;
  font-size: 20px;
  font-weight: bold;
  margin-top: 2px;
  flex-shrink: 0;
}

.point-content {
  flex: 1;
}

.point-title {
  font-weight: 600;
  color: #374151;
  margin-bottom: 4px;
}

.point-description {
  color: #6b7280;
  line-height: 1.5;
  font-size: 14px;
}

/* 생존 법칙 섹션 */
.survival-rules-section {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.survival-subtitle {
  color: #6b7280;
  margin-bottom: 24px;
  font-size: 16px;
}

.rules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
}

.rule-card {
  display: flex;
  gap: 20px;
  padding: 24px;
  background: #f8fafc;
  border-radius: 12px;
  border-left: 4px solid #3b82f6;
}

.rule-number {
  background: #3b82f6;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
  margin-top: 4px;
}

.rule-content {
  flex: 1;
}

.rule-title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.rule-description {
  margin: 0;
  color: #4b5563;
  line-height: 1.5;
  font-size: 14px;
}

/* 제휴 파트너 섹션 */
.partnership-section {
  background: linear-gradient(135deg, #ff6b35 0%, #f39c12 100%);
  border-radius: 16px;
  padding: 32px;
  color: white;
}

.partnership-section h2 {
  color: white;
}

.partnership-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}

.partnership-content {
  flex: 1;
}

.partnership-content h3 {
  margin: 0 0 12px;
  font-size: 20px;
  font-weight: 600;
}

.partnership-content p {
  margin: 0 0 20px;
  opacity: 0.9;
  line-height: 1.5;
}

.partnership-btn {
  background: white;
  color: #ff6b35;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.partnership-btn:hover {
  background: #f9fafb;
  transform: translateY(-1px);
}

.partnership-icon {
  font-size: 48px;
  opacity: 0.8;
}

.district-info h3 {
  margin: 0 0 12px;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}
.guide-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.guide-content p {
  margin: 0;
  font-size: 15px;
  color: #4b5563;
  line-height: 1.6;
}


/* 반응형 */
@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }

  .header-top {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .view-all-btn {
    justify-content: center;
  }

  .page-header h1 {
    font-size: 28px;
  }

  .overview-grid {
    grid-template-columns: 1fr;
  }

  .overview-card {
    flex-direction: column;
    text-align: center;
  }

  .business-item {
    grid-template-columns: 40px 1fr 50px;
    gap: 12px;
  }

  .rules-grid,
  .guide-grid,
  .trend-grid,
  .recommendations-grid {
    grid-template-columns: 1fr;
  }

  .district-card {
    flex-direction: column;
    align-items: flex-start;
    text-align: center;
  }

  .district-metrics {
    justify-content: center;
  }

  .cluster-chart {
    height: 300px;
  }

  .user-revenue-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .revenue-summary {
    order: 2;
  }

  .revenue-chart-container {
    order: 1;
  }

  .summary-card {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }

  .revenue-chart {
    height: 250px;
  }

  .partnership-card {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }

  .partnership-icon {
    order: -1;
  }
}
</style>
