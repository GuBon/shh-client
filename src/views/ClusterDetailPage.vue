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

        <!-- 로딩 상태 -->
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>데이터를 분석하는 중...</p>
        </div>

        <!-- 에러 상태 -->
        <div v-else-if="error" class="error-container">
          <h3>데이터 로드 실패</h3>
          <p>{{ error }}</p>
          <button @click="loadData" class="retry-btn">다시 시도</button>
        </div>

        <!-- 클러스터 상세 분석 -->
        <template v-else-if="clusterData">
          <!-- 클러스터 개요 -->
          <section class="overview-section">
            <h2>📊 클러스터 개요</h2>
            <div class="overview-grid">
              <div class="overview-card">
                <div class="overview-icon">🏪</div>
                <div class="overview-content">
                  <span class="overview-label">전체 상권 수</span>
                  <span class="overview-value">{{ clusterData.count }}개</span>
                  <span class="overview-sub">전체 대비 {{ clusterData.percentage }}%</span>
                </div>
              </div>
              <div class="overview-card">
                <div class="overview-icon">👥</div>
                <div class="overview-content">
                  <span class="overview-label">평균 연령</span>
                  <span class="overview-value">{{ clusterData.avgAge.toFixed(1) }}세</span>
                  <span class="overview-sub">고객층 연령대</span>
                </div>
              </div>
              <div class="overview-card">
                <div class="overview-icon">💰</div>
                <div class="overview-content">
                  <span class="overview-label">평균 매출</span>
                  <span class="overview-value">{{ formatRevenue(clusterData.avgRevenue) }}</span>
                  <span class="overview-sub">월평균 기준</span>
                </div>
              </div>
              <div class="overview-card">
                <div class="overview-icon">🚶</div>
                <div class="overview-content">
                  <span class="overview-label">평균 유동인구</span>
                  <span class="overview-value">{{ formatNumber(clusterData.avgFootTraffic) }}명</span>
                  <span class="overview-sub">일일 평균</span>
                </div>
              </div>
            </div>
          </section>

          <!-- 특성 분석 -->
          <section class="characteristics-section">
            <h2>🔍 주요 특성</h2>
            <div class="characteristics-grid">
              <div class="characteristic-card">
                <div class="characteristic-header">
                  <h3>👥 고객층</h3>
                </div>
                <div class="characteristic-content">
                  <p>{{ getCustomerProfile(clusterId) }}</p>
                </div>
              </div>
              <div class="characteristic-card">
                <div class="characteristic-header">
                  <h3>🏪 업종 특성</h3>
                </div>
                <div class="characteristic-content">
                  <p>{{ getBusinessProfile(clusterId) }}</p>
                </div>
              </div>
              <div class="characteristic-card">
                <div class="characteristic-header">
                  <h3>📍 입지 특성</h3>
                </div>
                <div class="characteristic-content">
                  <p>{{ getLocationProfile(clusterId) }}</p>
                </div>
              </div>
              <div class="characteristic-card">
                <div class="characteristic-header">
                  <h3>💰 수익성</h3>
                </div>
                <div class="characteristic-content">
                  <p>{{ getProfitabilityProfile(clusterId) }}</p>
                </div>
              </div>
            </div>
          </section>

          <!-- 상위 상권 -->
          <section class="top-districts-section">
            <h2>🏆 매출 상위 상권</h2>
            <div class="districts-grid">
              <div v-for="(district, index) in clusterData.topDistricts" 
                   :key="district.code" 
                   class="district-card">
                <div class="rank-badge" :class="`rank-${index + 1}`">{{ index + 1 }}</div>
                <div class="district-info">
                  <h3>{{ district.name }}</h3>
                  <div class="district-metrics">
                    <div class="metric-item">
                      <span class="metric-label">매출</span>
                      <span class="metric-value">{{ formatRevenue(district.revenue) }}</span>
                    </div>
                    <div class="metric-item">
                      <span class="metric-label">연령</span>
                      <span class="metric-value">{{ getDistrictAge(district.code) }}세</span>
                    </div>
                    <div class="metric-item">
                      <span class="metric-label">효율성</span>
                      <span class="metric-value">{{ getDistrictEfficiency(district.code) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 투자 및 창업 가이드 -->
          <section class="investment-guide-section">
            <h2>💡 투자 및 창업 가이드</h2>
            <div class="guide-grid">
              <div class="guide-card success">
                <div class="guide-header">
                  <div class="guide-icon">💡</div>
                  <h3>추천 업종</h3>
                </div>
                <div class="guide-content">
                  <p>{{ getRecommendedBusinessTypes(clusterId) }}</p>
                </div>
              </div>
              <div class="guide-card warning">
                <div class="guide-header">
                  <div class="guide-icon">⚠️</div>
                  <h3>주의사항</h3>
                </div>
                <div class="guide-content">
                  <p>{{ getInvestmentWarnings(clusterId) }}</p>
                </div>
              </div>
              <div class="guide-card info">
                <div class="guide-header">
                  <div class="guide-icon">🎯</div>
                  <h3>성공 포인트</h3>
                </div>
                <div class="guide-content">
                  <p>{{ getSuccessFactors(clusterId) }}</p>
                </div>
              </div>
            </div>
          </section>

          <!-- 시장 동향 -->
          <section class="market-trend-section">
            <h2>📈 시장 동향</h2>
            <div class="trend-grid">
              <div class="trend-card">
                <h3>성장 전망</h3>
                <div class="trend-meter">
                  <div class="trend-bar" 
                       :style="{ width: getGrowthProspect(clusterId) + '%', backgroundColor: clusterConfig.color }">
                  </div>
                </div>
                <div class="trend-details">
                  <span class="trend-value">{{ getGrowthProspect(clusterId) }}%</span>
                  <span class="trend-desc">{{ getGrowthDescription(clusterId) }}</span>
                </div>
              </div>
              <div class="trend-card">
                <h3>경쟁 강도</h3>
                <div class="trend-meter">
                  <div class="trend-bar" 
                       :style="{ width: getCompetitionLevel(clusterId) + '%', backgroundColor: '#ef4444' }">
                  </div>
                </div>
                <div class="trend-details">
                  <span class="trend-value">{{ getCompetitionLevel(clusterId) }}%</span>
                  <span class="trend-desc">{{ getCompetitionDescription(clusterId) }}</span>
                </div>
              </div>
              <div class="trend-card">
                <h3>진입 용이성</h3>
                <div class="trend-meter">
                  <div class="trend-bar" 
                       :style="{ width: getEntryEase(clusterId) + '%', backgroundColor: '#10b981' }">
                  </div>
                </div>
                <div class="trend-details">
                  <span class="trend-value">{{ getEntryEase(clusterId) }}%</span>
                  <span class="trend-desc">{{ getEntryDescription(clusterId) }}</span>
                </div>
              </div>
            </div>
          </section>

          <!-- 데이터 시각화 -->
          <section class="chart-section">
            <h2>📊 데이터 시각화</h2>
            <div class="chart-container">
              <div ref="clusterChart" class="cluster-chart"></div>
            </div>
          </section>

          <!-- 내 상권 매출 분석 (로그인 사용자만) -->
          <section v-if="authStore.isAuthenticated" class="user-revenue-section">
            <h2>💰 내 상권 매출 분석</h2>
            <div class="user-revenue-content">
              <div class="revenue-summary">
                <div class="summary-card">
                  <div class="summary-icon">📈</div>
                  <div class="summary-content">
                    <span class="summary-label">이번 달 매출</span>
                    <span class="summary-value">{{ formatRevenue(currentMonthRevenue) }}</span>
                    <span class="summary-change positive">+12.3%</span>
                  </div>
                </div>
                <div class="summary-card">
                  <div class="summary-icon">🎯</div>
                  <div class="summary-content">
                    <span class="summary-label">목표 달성률</span>
                    <span class="summary-value">87.5%</span>
                    <span class="summary-change neutral">목표까지 12.5%</span>
                  </div>
                </div>
                <div class="summary-card">
                  <div class="summary-icon">📊</div>
                  <div class="summary-content">
                    <span class="summary-label">클러스터 평균 대비</span>
                    <span class="summary-value">+15.7%</span>
                    <span class="summary-change positive">평균 이상</span>
                  </div>
                </div>
              </div>
              <div class="revenue-chart-container">
                <div ref="revenueChart" class="revenue-chart"></div>
              </div>
            </div>
          </section>

          <!-- 관련 상권 추천 -->
          <section class="recommendations-section">
            <h2>🔗 이런 상권도 관심 있으실 것 같아요</h2>
            <div class="recommendations-grid">
              <div v-for="cluster in otherClusters" :key="cluster.id" 
                   class="recommendation-card"
                   @click="$router.push(`/analysis/cluster/${cluster.type}`)">
                <div class="recommendation-color" :style="{ backgroundColor: cluster.color }"></div>
                <div class="recommendation-content">
                  <h3>{{ cluster.name }}</h3>
                  <p>{{ cluster.description }}</p>
                </div>
                <div class="recommendation-arrow">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                  </svg>
                </div>
              </div>
            </div>
          </section>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import * as echarts from 'echarts'
import GlobalHeader from '../components/GlobalHeader.vue'

// 상태
const route = useRoute()
const authStore = useAuthStore()
const districtsData = ref([])
const loading = ref(true)
const error = ref(null)
const clusterChart = ref(null)
const revenueChart = ref(null)
let chartInstance = null
let revenueChartInstance = null

// 클러스터 설정
const clusterConfigs = {
  red: { id: 0, color: '#e74c3c', name: '레드 상권', description: '고매출, 고효율 프리미엄 상권', type: 'red' },
  orange: { id: 1, color: '#f39c12', name: '오렌지 상권', description: '초고매출 대형 상권', type: 'orange' },
  green: { id: 2, color: '#27ae60', name: '그린 상권', description: '중간 규모 안정적 상권', type: 'green' },
  blue: { id: 3, color: '#3498db', name: '블루 상권', description: '균형잡힌 발전 가능 상권', type: 'blue' }
}

// 현재 클러스터 ID 및 설정
const clusterId = computed(() => {
  const type = route.params.type
  return clusterConfigs[type]?.id ?? 0
})

const clusterConfig = computed(() => {
  const type = route.params.type
  return clusterConfigs[type] || clusterConfigs.red
})

const otherClusters = computed(() => {
  return Object.values(clusterConfigs).filter(c => c.id !== clusterId.value)
})

// 사용자 매출 데이터 (예시)
const currentMonthRevenue = ref(24500000) // 2450만원

const monthlyRevenueData = ref([
  { month: '1월', revenue: 18500000, target: 20000000 },
  { month: '2월', revenue: 19200000, target: 20000000 },
  { month: '3월', revenue: 21800000, target: 22000000 },
  { month: '4월', revenue: 20900000, target: 22000000 },
  { month: '5월', revenue: 23100000, target: 24000000 },
  { month: '6월', revenue: 24500000, target: 24000000 },
])

// 클러스터 데이터 계산
const clusterData = computed(() => {
  if (!districtsData.value.length) return null
  
  const clusterDistricts = districtsData.value.filter(d => d.district_cluster_label === clusterId.value)
  
  if (!clusterDistricts.length) return null
  
  const total = districtsData.value.length
  
  return {
    count: clusterDistricts.length,
    percentage: ((clusterDistricts.length / total) * 100).toFixed(1),
    avgAge: clusterDistricts.reduce((sum, d) => sum + d.상권_평균_연령, 0) / clusterDistricts.length,
    avgRevenue: clusterDistricts.reduce((sum, d) => sum + d.상권_총매출, 0) / clusterDistricts.length,
    avgFootTraffic: clusterDistricts.reduce((sum, d) => sum + d.상권_총유동인구, 0) / clusterDistricts.length,
    avgEfficiency: clusterDistricts.reduce((sum, d) => sum + d.상권_효율성, 0) / clusterDistricts.length,
    topDistricts: clusterDistricts
      .sort((a, b) => b.상권_총매출 - a.상권_총매출)
      .slice(0, 5)
      .map(d => ({
        code: d.상권_코드,
        name: d.상권_코드_명,
        revenue: d.상권_총매출
      }))
  }
})

// 데이터 로드
const loadData = async () => {
  try {
    loading.value = true
    error.value = null
    
    const response = await fetch('/data/alley_district_clusters_final.csv')
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const csvText = await response.text()
    const lines = csvText.trim().split('\n')
    
    if (lines.length < 2) {
      throw new Error('CSV 파일에 데이터가 없습니다')
    }
    
    const headers = lines[0].split(',').map(h => h.trim().replace('﻿', ''))
    const data = []
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue
      
      const values = line.split(',').map(v => v.trim())
      
      if (values.length !== headers.length) {
        console.warn(`Line ${i + 1}: Expected ${headers.length} columns, got ${values.length}`)
        continue
      }

      const row = {}
      const numericHeaders = [
        '상권_총매출', 'total_weighted_age_sum', '상권_총유동인구', 
        '업종_개수', '상권_평균_연령', '상권_효율성', 'district_cluster_label'
      ]

      headers.forEach((header, index) => {
        const value = values[index]
        if (numericHeaders.includes(header)) {
          const cleaned = value.replace(/,/g, '')
          const num = Number(cleaned)
          row[header] = Number.isNaN(num) ? null : num
        } else {
          row[header] = value || ''
        }
      })

      if (row.상권_코드 && row.district_cluster_label !== null && row.상권_총매출 !== null && row.상권_총매출 > 0) {
        data.push(row)
      }
    }
    
    districtsData.value = data
    console.log(`✅ Loaded ${data.length} district records for cluster ${clusterId.value}`)
    
  } catch (err) {
    console.error('❌ Failed to load CSV data:', err)
    error.value = `데이터 로드 실패: ${err.message}`
  } finally {
    loading.value = false
  }
}

// 사용자 매출 차트 생성
const createUserRevenueChart = () => {
  if (!revenueChart.value || !authStore.isAuthenticated) return
  
  if (revenueChartInstance) {
    revenueChartInstance.dispose()
  }
  
  revenueChartInstance = echarts.init(revenueChart.value)
  
  const months = monthlyRevenueData.value.map(d => d.month)
  const revenues = monthlyRevenueData.value.map(d => d.revenue)
  const targets = monthlyRevenueData.value.map(d => d.target)
  
  const option = {
    title: {
      text: '월별 매출 추이',
      left: 'center',
      textStyle: { fontSize: 16, color: '#111827' }
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      textStyle: { color: '#fff' },
      formatter: function(params) {
        const month = params[0].name
        const revenue = params[0].value
        const target = params[1].value
        const achievement = ((revenue / target) * 100).toFixed(1)
        
        return [
          `<strong>${month}</strong>`,
          `실제 매출: ${formatRevenue(revenue)}`,
          `목표 매출: ${formatRevenue(target)}`,
          `달성률: ${achievement}%`
        ].join('<br/>')
      }
    },
    legend: {
      data: ['실제 매출', '목표 매출'],
      bottom: 10
    },
    grid: {
      left: 60,
      right: 40,
      top: 60,
      bottom: 60
    },
    xAxis: {
      type: 'category',
      data: months,
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisTick: { lineStyle: { color: '#e5e7eb' } },
      axisLabel: { color: '#6b7280' }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisTick: { lineStyle: { color: '#e5e7eb' } },
      axisLabel: { 
        color: '#6b7280',
        formatter: value => formatRevenue(value)
      },
      splitLine: { lineStyle: { color: '#f3f4f6' } }
    },
    series: [
      {
        name: '실제 매출',
        type: 'line',
        data: revenues,
        itemStyle: { color: clusterConfig.value.color },
        lineStyle: { color: clusterConfig.value.color, width: 3 },
        symbolSize: 8,
        smooth: true
      },
      {
        name: '목표 매출',
        type: 'line',
        data: targets,
        itemStyle: { color: '#94a3b8' },
        lineStyle: { color: '#94a3b8', width: 2, type: 'dashed' },
        symbolSize: 6,
        smooth: true
      }
    ]
  }
  
  revenueChartInstance.setOption(option)
}

// 클러스터 차트 생성
const createClusterChart = () => {
  if (!clusterChart.value || !clusterData.value) return
  
  if (chartInstance) {
    chartInstance.dispose()
  }
  
  chartInstance = echarts.init(clusterChart.value)
  
  const clusterDistricts = districtsData.value.filter(d => d.district_cluster_label === clusterId.value)
  
  const scatterData = clusterDistricts.map(d => [
    d.상권_평균_연령,
    d.상권_총매출,
    d.상권_코드_명,
    d.상권_총유동인구,
    d.상권_효율성
  ])
  
  const option = {
    title: {
      text: `${clusterConfig.value.name} 상권 분포`,
      left: 'center',
      textStyle: { fontSize: 18 }
    },
    grid: { left: 80, right: 40, top: 80, bottom: 80 },
    xAxis: {
      type: 'value',
      name: '평균 연령 (세)',
      nameLocation: 'middle',
      nameGap: 30
    },
    yAxis: {
      type: 'log',
      name: '총매출 (로그 스케일)',
      nameLocation: 'middle',
      nameGap: 50,
      axisLabel: {
        formatter: value => formatRevenue(value)
      }
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      textStyle: { color: '#fff' },
      formatter: params => {
        const [age, revenue, name, traffic, efficiency] = params.data
        return [
          `<strong>${name}</strong>`,
          `평균 연령: ${age.toFixed(1)}세`,
          `총 매출: ${formatRevenue(revenue)}`,
          `유동인구: ${formatNumber(traffic)}명`,
          `효율성: ${efficiency.toFixed(1)}`
        ].join('<br/>')
      }
    },
    series: [{
      type: 'scatter',
      data: scatterData,
      itemStyle: {
        color: clusterConfig.value.color,
        opacity: 0.7
      },
      symbolSize: 8
    }]
  }
  
  chartInstance.setOption(option)
}

// 유틸리티 함수들
const formatRevenue = (value) => {
  if (value >= 1e10) return `${(value / 1e10).toFixed(1)}조`
  if (value >= 1e8) return `${(value / 1e8).toFixed(1)}억`
  if (value >= 1e4) return `${(value / 1e4).toFixed(1)}만`
  return value.toLocaleString()
}

const formatNumber = (value) => {
  return value.toLocaleString()
}

const getDistrictAge = (districtCode) => {
  const district = districtsData.value.find(d => d.상권_코드 === districtCode)
  return district ? district.상권_평균_연령.toFixed(1) : 'N/A'
}

const getDistrictEfficiency = (districtCode) => {
  const district = districtsData.value.find(d => d.상권_코드 === districtCode)
  return district ? district.상권_효율성.toFixed(1) : 'N/A'
}

// 클러스터별 상세 정보 함수들
const getCustomerProfile = (clusterId) => {
  const profiles = {
    0: "높은 구매력을 가진 30-40대 직장인과 고소득 계층이 주요 고객층입니다. 프리미엄 상품과 서비스를 선호하며, 브랜드 가치를 중시합니다.",
    1: "다양한 연령층이 방문하는 대형 상권으로, 유동인구가 매우 많고 관광객 비중도 높습니다. 접근성이 뛰어나 광범위한 고객층을 보유합니다.",
    2: "지역 주민과 직장인이 주요 고객층인 안정적인 상권입니다. 일상적인 소비 패턴을 보이며, 합리적인 가격대의 상품을 선호합니다.",
    3: "젊은 층과 중장년층이 균형있게 분포하며, 성장 잠재력이 높은 지역입니다. 트렌드에 민감하고 새로운 경험을 추구하는 고객들이 많습니다."
  }
  return profiles[clusterId] || "상세 정보를 분석 중입니다."
}

const getBusinessProfile = (clusterId) => {
  const profiles = {
    0: "고급 레스토랑, 부티크 카페, 프리미엄 뷰티샵 등 고부가가치 업종이 성공하기 좋은 환경입니다. 서비스 품질과 브랜드력이 중요합니다.",
    1: "대형 프랜차이즈, 백화점, 복합쇼핑몰 등 규모의 경제를 활용할 수 있는 업종이 적합합니다. 높은 임대료 대비 충분한 매출 확보가 가능합니다.",
    2: "동네 카페, 일반 음식점, 편의점, 미용실 등 생활밀착형 업종이 안정적으로 운영됩니다. 꾸준한 단골 고객 확보가 핵심입니다.",
    3: "트렌디한 카페, 퓨전 음식점, 체험형 매장 등 새로운 컨셉의 업종에 적합합니다. 혁신적인 아이디어와 차별화된 서비스가 성공 요인입니다."
  }
  return profiles[clusterId] || "상세 정보를 분석 중입니다."
}

const getLocationProfile = (clusterId) => {
  const profiles = {
    0: "주요 업무지구나 고급 주거지역 인근으로 접근성이 우수하고 인프라가 잘 갖춰져 있습니다. 주차 시설과 대중교통 연결이 편리합니다.",
    1: "도심 중심가나 교통 허브 지역으로 최고의 접근성을 자랑합니다. 지하철역, 버스터미널 등과 직결되어 유동인구가 매우 많습니다.",
    2: "주거지역 내 또는 인근 상업지역으로 지역 주민들의 접근이 용이합니다. 주변 아파트단지나 오피스텔과의 거리가 가깝습니다.",
    3: "신개발지역이나 재개발 예정지역으로 향후 발전 가능성이 높습니다. 현재는 진입비용이 상대적으로 낮지만 성장 잠재력을 보유하고 있습니다."
  }
  return profiles[clusterId] || "상세 정보를 분석 중입니다."
}

const getProfitabilityProfile = (clusterId) => {
  const profiles = {
    0: "높은 매출과 수익성을 기대할 수 있으나, 높은 임대료와 운영비용을 감안해야 합니다. 프리미엄 전략으로 고수익 확보가 가능합니다.",
    1: "매우 높은 매출 규모를 자랑하지만 그에 비례하여 임대료와 인건비도 높습니다. 규모의 경제와 효율적 운영이 수익성의 핵심입니다.",
    2: "안정적이고 예측 가능한 수익 구조를 가지고 있습니다. 적정 수준의 임대료로 꾸준한 수익 창출이 가능하며 리스크가 낮습니다.",
    3: "현재는 중간 수준의 수익성이지만 향후 지역 발전에 따라 수익성 개선 여지가 큽니다. 장기적 관점에서의 투자 가치가 높습니다."
  }
  return profiles[clusterId] || "상세 정보를 분석 중입니다."
}

const getRecommendedBusinessTypes = (clusterId) => {
  const recommendations = {
    0: "고급 일식당, 와인바, 프리미엄 카페, 명품 편집샵, 고급 미용실, 웰니스 센터",
    1: "대형 프랜차이즈 매장, 백화점 입점, 복합문화공간, 대형 음식점, 브랜드 flagship 스토어",
    2: "동네 카페, 가정식당, 치킨·피자 전문점, 편의점, 동네 미용실, 세탁소, 문구점",
    3: "트렌디 카페, 퓨전 음식점, 팝업스토어, 체험형 매장, 공유오피스, 소규모 갤러리"
  }
  return recommendations[clusterId] || "상세 정보를 분석 중입니다."
}

const getInvestmentWarnings = (clusterId) => {
  const warnings = {
    0: "높은 초기 투자비용과 임대료로 인한 부담, 까다로운 고객층의 높은 기대치, 치열한 고급 브랜드 간 경쟁",
    1: "매우 높은 임대료와 보증금, 대형 프랜차이즈와의 경쟁, 높은 인건비와 운영비용, 유동인구 의존도 높음",
    2: "상대적으로 낮은 객단가, 제한적인 고객층, 대형마트·온라인몰과의 경쟁, 지역경제 침체 시 직격탄",
    3: "불확실한 지역 발전 속도, 초기 고객 확보의 어려움, 주변 인프라 미비, 장기간 손익분기점 도달 위험"
  }
  return warnings[clusterId] || "상세 정보를 분석 중입니다."
}

const getSuccessFactors = (clusterId) => {
  const factors = {
    0: "차별화된 고급 서비스 제공, 브랜드 신뢰도 구축, VIP 고객 관리 시스템, 프리미엄 상품 라인업 구성",
    1: "효율적인 운영 시스템 구축, 대량 구매를 통한 원가 절감, 마케팅 및 프로모션 활용, 최신 트렌드 반영",
    2: "지역 주민과의 관계 구축, 합리적 가격 정책, 편의성과 접근성 강화, 단골 고객 확보 및 유지",
    3: "독특하고 창의적인 컨셉, SNS 마케팅 활용, 젊은 층 타겟 메뉴·서비스, 지역 커뮤니티 참여"
  }
  return factors[clusterId] || "상세 정보를 분석 중입니다."
}

const getGrowthProspect = (clusterId) => {
  const prospects = { 0: 85, 1: 70, 2: 60, 3: 90 }
  return prospects[clusterId] || 50
}

const getGrowthDescription = (clusterId) => {
  const descriptions = {
    0: "지속적인 고급화 트렌드로 성장 가능성 높음",
    1: "포화 상태이지만 안정적 성장 유지",
    2: "완만한 성장 곡선, 안정성 중심",
    3: "높은 성장 잠재력, 투자 가치 우수"
  }
  return descriptions[clusterId] || ""
}

const getCompetitionLevel = (clusterId) => {
  const competition = { 0: 90, 1: 95, 2: 70, 3: 60 }
  return competition[clusterId] || 50
}

const getCompetitionDescription = (clusterId) => {
  const descriptions = {
    0: "프리미엄 브랜드 간 치열한 경쟁",
    1: "최고 수준의 경쟁 강도",
    2: "적당한 경쟁, 차별화 여지 존재",
    3: "상대적으로 낮은 경쟁, 기회 많음"
  }
  return descriptions[clusterId] || ""
}

const getEntryEase = (clusterId) => {
  const ease = { 0: 30, 1: 20, 2: 70, 3: 80 }
  return ease[clusterId] || 50
}

const getEntryDescription = (clusterId) => {
  const descriptions = {
    0: "높은 진입장벽, 충분한 자본 필요",
    1: "매우 높은 진입장벽",
    2: "상대적으로 용이한 진입",
    3: "진입 용이, 창업 친화적"
  }
  return descriptions[clusterId] || ""
}

// 라이프사이클
onMounted(async () => {
  await loadData()
  if (!error.value && clusterData.value) {
    await nextTick()
    setTimeout(() => {
      createClusterChart()
      if (authStore.isAuthenticated) {
        createUserRevenueChart()
      }
    }, 100)
  }
})

// 페이지 타이틀 업데이트
import { watch } from 'vue'
watch(() => clusterConfig.value, (newConfig) => {
  document.title = `${newConfig.name} | 상권 분석 | 소확행`
}, { immediate: true })
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
  margin-bottom: 48px;
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
  margin: 0 0 12px;
  font-size: 36px;
  font-weight: 800;
  color: #111827;
  line-height: 1.2;
  text-align: center;
}

.page-description {
  margin: 0;
  font-size: 18px;
  color: #6b7280;
  text-align: center;
}

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
}

/* 특성 분석 섹션 */
.characteristics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.characteristic-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #e5e7eb;
  transition: all 0.2s;
}

.characteristic-card:hover {
  border-left-color: #3b82f6;
  transform: translateY(-1px);
}

.characteristic-header h3 {
  margin: 0 0 16px;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.characteristic-content p {
  margin: 0;
  font-size: 15px;
  color: #4b5563;
  line-height: 1.6;
}

/* 상위 상권 섹션 */
.districts-grid {
  display: grid;
  gap: 20px;
}

.district-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.2s;
}

.district-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.rank-badge {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 18px;
  color: white;
  flex-shrink: 0;
}

.rank-badge.rank-1 { background: #ffd700; }
.rank-badge.rank-2 { background: #c0c0c0; }
.rank-badge.rank-3 { background: #cd7f32; }
.rank-badge.rank-4,
.rank-badge.rank-5 { background: #6b7280; }

.district-info {
  flex: 1;
}

.district-info h3 {
  margin: 0 0 12px;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.district-metrics {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.metric-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.metric-label {
  font-size: 12px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metric-value {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

/* 가이드 섹션 */
.guide-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
}

.guide-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-top: 4px solid #e5e7eb;
}

.guide-card.success {
  border-top-color: #10b981;
}

.guide-card.warning {
  border-top-color: #f59e0b;
}

.guide-card.info {
  border-top-color: #3b82f6;
}

.guide-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.guide-icon {
  font-size: 24px;
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

/* 시장 동향 섹션 */
.trend-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.trend-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.trend-card h3 {
  margin: 0 0 16px;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.trend-meter {
  height: 12px;
  background: #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 12px;
}

.trend-bar {
  height: 100%;
  transition: width 0.8s ease;
  border-radius: 6px;
}

.trend-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.trend-value {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.trend-desc {
  font-size: 13px;
  color: #6b7280;
}

/* 차트 섹션 */
.chart-container {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.cluster-chart {
  width: 100%;
  height: 400px;
}

/* 사용자 매출 섹션 */
.user-revenue-section {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 48px;
}

.user-revenue-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 32px;
  align-items: start;
}

.revenue-summary {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.summary-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
}

.summary-icon {
  font-size: 24px;
  width: 48px;
  height: 48px;
  background: #f1f5f9;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.summary-content {
  flex: 1;
}

.summary-label {
  display: block;
  font-size: 12px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.summary-value {
  display: block;
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 4px;
}

.summary-change {
  display: block;
  font-size: 12px;
  font-weight: 500;
}

.summary-change.positive {
  color: #059669;
}

.summary-change.negative {
  color: #dc2626;
}

.summary-change.neutral {
  color: #6b7280;
}

.revenue-chart-container {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.revenue-chart {
  width: 100%;
  height: 300px;
}

/* 추천 섹션 */
.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.recommendation-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.recommendation-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: #e5e7eb;
}

.recommendation-color {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  flex-shrink: 0;
}

.recommendation-content {
  flex: 1;
}

.recommendation-content h3 {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.recommendation-content p {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

.recommendation-arrow {
  color: #9ca3af;
  transition: all 0.2s;
}

.recommendation-card:hover .recommendation-arrow {
  color: #6b7280;
  transform: translateX(2px);
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

  .characteristics-grid,
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
}
</style>
