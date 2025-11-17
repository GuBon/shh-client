<template>
  <div class="analysis-page">
    <GlobalHeader />

    <div class="main-content">
      <div class="container">
        <!-- 페이지 헤더 -->
        <div class="page-header">
          <h1>서울 골목상권 클러스터 분석</h1>
          <div class="update-info">
            <span class="data-count">총 {{ totalDistricts }}개 상권</span>
            <span class="data-source">서울시 골목상권 데이터</span>
          </div>
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

        <!-- 분석 결과 -->
        <template v-else-if="districtsData.length > 0">
          <!-- 차트 -->
          <div class="chart-card">
            <div class="chart-header">
              <h2>상권 평균 연령 vs 총매출 분포 (클러스터링)</h2>
              <p>X축: 평균 연령 (세) | Y축: 총매출 (로그 스케일)</p>
              <div class="chart-hint">
                💡 매출액에 따라 점 크기가 달라집니다. 클러스터나 점을 클릭하면 상세 분석 페이지로 이동합니다.
              </div>
            </div>
            <div class="chart-container">
              <div ref="scatterChart" class="scatter-chart"></div>
            </div>
            
            <!-- 범례 -->
            <div class="chart-legend">
              <div v-for="cluster in clusterInfo" :key="cluster.id" 
                   class="legend-item clickable" 
                   @click="openClusterDetail(cluster)">
                <div class="legend-color" :style="{ backgroundColor: cluster.color }"></div>
                <div class="legend-details">
                  <span class="legend-title">{{ cluster.name }}</span>
                  <span class="legend-desc">{{ cluster.description }}</span>
                </div>
                <div class="legend-arrow">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- 클러스터 통계 -->
          <div class="stats-section">
            <h2>클러스터별 상세 분석</h2>
            <div class="stats-grid">
              <div v-for="cluster in clusterStats" :key="cluster.id" 
                   class="stat-card clickable" 
                   @click="openClusterDetailById(cluster.id)">
                <div class="stat-header">
                  <div class="stat-color" :style="{ backgroundColor: cluster.color }"></div>
                  <div>
                    <h3>{{ cluster.name }}</h3>
                    <span class="stat-count">{{ cluster.count }}개 ({{ cluster.percentage }}%)</span>
                  </div>
                  <div class="detail-arrow">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                    </svg>
                  </div>
                </div>
                
                <div class="stat-description">
                  <p>{{ cluster.description }}</p>
                </div>

                <div class="stat-metrics">
                  <div class="metric">
                    <span class="metric-label">평균 연령</span>
                    <span class="metric-value">{{ cluster.avgAge.toFixed(1) }}세</span>
                  </div>
                  <div class="metric">
                    <span class="metric-label">평균 매출</span>
                    <span class="metric-value">{{ formatRevenue(cluster.avgRevenue) }}</span>
                  </div>
                  <div class="metric">
                    <span class="metric-label">평균 유동인구</span>
                    <span class="metric-value">{{ formatNumber(cluster.avgFootTraffic) }}명</span>
                  </div>
                  <div class="metric">
                    <span class="metric-label">상권 효율성</span>
                    <span class="metric-value">{{ cluster.avgEfficiency.toFixed(1) }}</span>
                  </div>
                </div>

                <!-- 상위 매장 -->
                <div class="top-districts">
                  <h4>매출 상위 3곳</h4>
                  <div class="district-list">
                    <div v-for="district in cluster.topDistricts" :key="district.code" class="district-item">
                      <span class="district-name">{{ district.name }}</span>
                      <span class="district-revenue">{{ formatRevenue(district.revenue) }}</span>
                    </div>
                  </div>
                </div>

                <div class="view-detail-btn">
                  상세 분석 보기
                </div>
              </div>
            </div>
          </div>

          <!-- 주요 인사이트 -->
          <div class="insights-section">
            <h2>주요 인사이트</h2>
            <div class="insights-grid">
              <div class="insight-card">
                <h3>🏆 최고 매출 상권</h3>
                <p><strong>{{ topRevenueDistrict.name }}</strong></p>
                <p>매출: {{ formatRevenue(topRevenueDistrict.revenue) }}</p>
              </div>
              <div class="insight-card">
                <h3>👥 최대 유동인구</h3>
                <p><strong>{{ topTrafficDistrict.name }}</strong></p>
                <p>유동인구: {{ formatNumber(topTrafficDistrict.traffic) }}명</p>
              </div>
              <div class="insight-card">
                <h3>📊 최고 효율성</h3>
                <p><strong>{{ topEfficiencyDistrict.name }}</strong></p>
                <p>효율성: {{ topEfficiencyDistrict.efficiency.toFixed(1) }}</p>
              </div>
              <div class="insight-card">
                <h3>🎯 연령 분포</h3>
                <p>젊은층: <strong>{{ youngestDistrict.name }}</strong> ({{ youngestDistrict.age.toFixed(1) }}세)</p>
                <p>중장년층: <strong>{{ oldestDistrict.name }}</strong> ({{ oldestDistrict.age.toFixed(1) }}세)</p>
              </div>
            </div>
          </div>
        </template>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import * as echarts from 'echarts'
import GlobalHeader from '../components/GlobalHeader.vue'

const router = useRouter()
const authStore = useAuthStore()

// 로그인한 사용자의 클러스터 유형 확인 및 리다이렉트
const checkUserClusterAndRedirect = () => {
  if (authStore.isAuthenticated && authStore.user) {
    // 예시: 사용자가 블루 유형이라면 (실제로는 사용자 데이터에서 가져와야 함)
    const userClusterType = authStore.user.clusterType || 'blue' // 기본값을 blue로 설정
    
    // 블루 유형 분석 페이지로 리다이렉트
    router.push(`/analysis/cluster/${userClusterType}`)
  }
}

// 상태
const districtsData = ref([])
const loading = ref(true)
const error = ref(null)
const scatterChart = ref(null)
let chartInstance = null

// 클러스터 정보
const clusterInfo = [
  { 
    id: 0, 
    color: '#e74c3c', 
    name: '레드 상권', 
    description: '고매출, 고효율 프리미엄 상권',
    type: 'red'
  },
  { 
    id: 1, 
    color: '#f39c12', 
    name: '오렌지 상권', 
    description: '초고매출 대형 상권',
    type: 'orange'
  },
  { 
    id: 2, 
    color: '#27ae60', 
    name: '그린 상권', 
    description: '중간 규모 안정적 상권',
    type: 'green'
  },
  { 
    id: 3, 
    color: '#3498db', 
    name: '블루 상권', 
    description: '균형잡힌 발전 가능 상권',
    type: 'blue'
  }
]

// 계산된 속성
const totalDistricts = computed(() => districtsData.value.length)

const clusterStats = computed(() => {
  if (!districtsData.value.length) return []
  
  const stats = {}
  const total = districtsData.value.length
  
  // 클러스터별 데이터 집계
  districtsData.value.forEach(d => {
    const cluster = d.district_cluster_label
    if (!stats[cluster]) {
      stats[cluster] = {
        id: cluster,
        color: clusterInfo.find(c => c.id === cluster)?.color || '#666',
        name: clusterInfo.find(c => c.id === cluster)?.name || `클러스터 ${cluster}`,
        description: clusterInfo.find(c => c.id === cluster)?.description || '',
        count: 0,
        ages: [],
        revenues: [],
        footTraffic: [],
        efficiencies: [],
        districts: []
      }
    }
    
    stats[cluster].count++
    stats[cluster].ages.push(d.상권_평균_연령)
    stats[cluster].revenues.push(d.상권_총매출)
    stats[cluster].footTraffic.push(d.상권_총유동인구)
    stats[cluster].efficiencies.push(d.상권_효율성)
    stats[cluster].districts.push({
      code: d.상권_코드,
      name: d.상권_코드_명,
      revenue: d.상권_총매출
    })
  })
  
  // 평균값 계산
  return Object.values(stats).map(stat => ({
    ...stat,
    percentage: ((stat.count / total) * 100).toFixed(1),
    avgAge: stat.ages.reduce((sum, age) => sum + age, 0) / stat.ages.length,
    avgRevenue: stat.revenues.reduce((sum, rev) => sum + rev, 0) / stat.revenues.length,
    avgFootTraffic: stat.footTraffic.reduce((sum, ft) => sum + ft, 0) / stat.footTraffic.length,
    avgEfficiency: stat.efficiencies.reduce((sum, eff) => sum + eff, 0) / stat.efficiencies.length,
    topDistricts: stat.districts
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 3)
  })).sort((a, b) => a.id - b.id)
})

// 인사이트 계산
const topRevenueDistrict = computed(() => {
  if (!districtsData.value.length) return {}
  const top = districtsData.value.reduce((max, d) => 
    d.상권_총매출 > max.상권_총매출 ? d : max
  )
  return { name: top.상권_코드_명, revenue: top.상권_총매출 }
})

const topTrafficDistrict = computed(() => {
  if (!districtsData.value.length) return {}
  const top = districtsData.value.reduce((max, d) => 
    d.상권_총유동인구 > max.상권_총유동인구 ? d : max
  )
  return { name: top.상권_코드_명, traffic: top.상권_총유동인구 }
})

const topEfficiencyDistrict = computed(() => {
  if (!districtsData.value.length) return {}
  const top = districtsData.value.reduce((max, d) => 
    d.상권_효율성 > max.상권_효율성 ? d : max
  )
  return { name: top.상권_코드_명, efficiency: top.상권_효율성 }
})

const youngestDistrict = computed(() => {
  if (!districtsData.value.length) return {}
  const youngest = districtsData.value.reduce((min, d) => 
    d.상권_평균_연령 < min.상권_평균_연령 ? d : min
  )
  return { name: youngest.상권_코드_명, age: youngest.상권_평균_연령 }
})

const oldestDistrict = computed(() => {
  if (!districtsData.value.length) return {}
  const oldest = districtsData.value.reduce((max, d) => 
    d.상권_평균_연령 > max.상권_평균_연령 ? d : max
  )
  return { name: oldest.상권_코드_명, age: oldest.상권_평균_연령 }
})

// 메서드
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
    console.log('CSV Headers:', headers)
    
    const data = []
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue // 빈 라인 스킵
      
      // CSV 파싱 개선 - 쉼표로 분할하되 따옴표 안의 내용은 보호
      const values = []
      let current = ''
      let inQuotes = false
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j]
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      values.push(current.trim()) // 마지막 값 추가
      
      if (values.length !== headers.length) {
        console.warn(`Line ${i + 1}: Expected ${headers.length} columns, got ${values.length}`)
        continue
      }

      const row = {}
      const numericHeaders = [
        '상권_총매출',
        'total_weighted_age_sum',
        '상권_총유동인구',
        '업종_개수',
        '상권_평균_연령',
        '상권_효율성',
        'district_cluster_label'
      ]

      headers.forEach((header, index) => {
        const value = values[index]

        if (numericHeaders.includes(header)) {
          // 1) 천 단위 콤마 제거
          const cleaned = value.replace(/,/g, '')
          const num = Number(cleaned)

          // 2) NaN이면 그냥 null(혹은 undefined)로 두고, 절대 0으로 강제 변환하지 않기
          row[header] = Number.isNaN(num) ? null : num
        } else {
          row[header] = value || ''
        }
      })

      // 유효한 데이터만 추가 (매출, 연령 등 기본 값이 있는 경우에만)
      if (
          row.상권_코드 &&
          row.district_cluster_label !== null &&
          row.상권_총매출 !== null &&
          row.상권_총매출 > 0 &&
          row.상권_평균_연령 !== null &&
          row.상권_평균_연령 > 0
      ) {
        data.push(row)
      }
    }
    
    if (data.length === 0) {
      throw new Error('유효한 데이터가 없습니다')
    }
    
    districtsData.value = data
    console.log(`✅ Loaded ${data.length} district records`)
    
  } catch (err) {
    console.error('❌ Failed to load CSV data:', err)
    error.value = `데이터 로드 실패: ${err.message}`
  } finally {
    loading.value = false
  }
}

const createScatterChart = () => {
  if (!scatterChart.value || !districtsData.value.length) return
  
  if (chartInstance) {
    chartInstance.dispose()
  }
  
  chartInstance = echarts.init(scatterChart.value)
  
  // 클러스터별 데이터 분류 및 통계 계산
  const clusterStats = {}
  const seriesData = clusterInfo.map(cluster => {
    const clusterData = districtsData.value
      .filter(d => d.district_cluster_label === cluster.id)
      .map(d => [
        d.상권_평균_연령,  // x축: 평균 연령
        d.상권_총매출,     // y축: 총매출
        d.상권_코드_명,    // 이름
        d.상권_총유동인구,  // 유동인구
        d.상권_효율성      // 효율성
      ])
    
    // 클러스터별 통계 저장
    if (clusterData.length > 0) {
      const revenues = clusterData.map(d => d[1])
      const ages = clusterData.map(d => d[0])
      clusterStats[cluster.id] = {
        count: clusterData.length,
        avgRevenue: revenues.reduce((sum, rev) => sum + rev, 0) / revenues.length,
        avgAge: ages.reduce((sum, age) => sum + age, 0) / ages.length
      }
    }
    
    return {
      name: cluster.name,
      type: 'scatter',
      data: clusterData,
      itemStyle: {
        color: cluster.color,
        opacity: 0.7
      },
      symbolSize: function(data) {
        const revenue = data[1]
        if (revenue <= 1e6) return 4
        if (revenue <= 1e7) return 6
        if (revenue <= 1e8) return 8
        if (revenue <= 1e9) return 10
        return 12
      }
    }
  })
  
  const option = {
    title: {
      text: '서울 골목상권 클러스터 분석',
      subtext: 'X축: 평균 연령 | Y축: 총매출 (로그 스케일)',
      left: 'center',
      top: 20
    },
    grid: {
      left: 80,
      right: 40,
      top: 80,
      bottom: 80
    },
    xAxis: {
      type: 'value',
      name: '상권 평균 연령 (세)',
      nameLocation: 'middle',
      nameGap: 35,
      min: 20,
      max: 70
    },
    yAxis: {
      type: 'log',
      name: '총매출 (로그 스케일)',
      nameLocation: 'middle',
      nameGap: 60,
      min: 1e5,
      max: 1e11,
      axisLabel: {
        formatter: value => formatRevenue(value)
      }
    },
    legend: {
      data: clusterInfo.map(c => c.name),
      bottom: 15
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      textStyle: { color: '#fff' },
      formatter: function(params) {
        const [age, revenue, name, traffic, efficiency] = params.data
        return [
          `<strong>${name}</strong>`,
          `평균 연령: ${age.toFixed(1)}세`,
          `총 매출: ${formatRevenue(revenue)}`,
          `유동인구: ${formatNumber(traffic)}명`,
          `효율성: ${efficiency.toFixed(1)}`,
          `클러스터: ${params.seriesName}`
        ].join('<br/>')
      }
    },
    series: seriesData
  }
  
  chartInstance.setOption(option)
  
  // 차트 클릭 이벤트
  chartInstance.on('click', function(params) {
    const cluster = clusterInfo.find(c => c.name === params.seriesName)
    if (cluster) {
      openClusterDetail(cluster)
    }
  })
  
  // 윈도우 리사이즈 이벤트
  const handleResize = () => {
    if (chartInstance) {
      chartInstance.resize()
    }
  }
  window.addEventListener('resize', handleResize)
  
  // 컴포넌트 언마운트 시 이벤트 리스너 제거
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })
}

// 모달 관련 함수들을 라우팅으로 변경
const openClusterDetail = (cluster) => {
  router.push(`/analysis/cluster/${cluster.type}`)
}

const openClusterDetailById = (clusterId) => {
  const cluster = clusterInfo.find(c => c.id === clusterId)
  if (cluster) {
    openClusterDetail(cluster)
  }
}

const formatRevenue = (value) => {
  if (value >= 1e10) return `${(value / 1e10).toFixed(1)}조`
  if (value >= 1e8) return `${(value / 1e8).toFixed(1)}억`
  if (value >= 1e4) return `${(value / 1e4).toFixed(1)}만`
  return value.toLocaleString()
}

const formatNumber = (value) => {
  return value.toLocaleString()
}

// 라이프사이클
onMounted(async () => {
  // 로그인한 사용자라면 해당 클러스터 페이지로 리다이렉트
  if (authStore.isAuthenticated) {
    checkUserClusterAndRedirect()
    return
  }
  
  // 로그인하지 않은 경우 전체 분석 페이지 표시
  await loadData()
  if (!error.value && districtsData.value.length > 0) {
    console.log(`Loaded ${districtsData.value.length} districts for chart`)
    // 차트 생성을 위해 DOM 업데이트 후 실행
    await nextTick()
    setTimeout(() => createScatterChart(), 100)
  }
})

// 컴포넌트 언마운트 시 차트 정리
onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
  }
  window.removeEventListener('resize', () => {
    if (chartInstance) {
      chartInstance.resize()
    }
  })
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
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
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

.update-info {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.data-count,
.data-source {
  font-size: 14px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 6px 12px;
  border-radius: 12px;
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

.chart-card {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 40px;
}

.chart-header {
  margin-bottom: 24px;
  text-align: center;
}

.chart-header h2 {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.chart-header p {
  margin: 0 0 12px;
  font-size: 14px;
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

.scatter-chart {
  width: 100%;
  height: 500px;
}

.chart-legend {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.legend-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
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
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
}

.legend-desc {
  display: block;
  font-size: 12px;
  color: #6b7280;
  line-height: 1.4;
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

.stats-section {
  margin-bottom: 40px;
}

.stats-section h2 {
  margin: 0 0 24px;
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  text-align: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  position: relative;
}

.stat-card.clickable {
  cursor: pointer;
  border: 1px solid transparent;
}

.stat-card.clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: #e5e7eb;
}

.stat-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
  position: relative;
}

.detail-arrow {
  position: absolute;
  top: 0;
  right: 0;
  color: #9ca3af;
  opacity: 0;
  transition: all 0.2s;
}

.stat-card.clickable:hover .detail-arrow {
  opacity: 1;
  color: #6b7280;
}

.view-detail-btn {
  margin-top: 16px;
  text-align: center;
  padding: 8px 16px;
  background: #f3f4f6;
  color: #374151;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  opacity: 0;
  transition: all 0.2s;
}

.stat-card.clickable:hover .view-detail-btn {
  opacity: 1;
  background: #e5e7eb;
}

.stat-color {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  margin-top: 2px;
  flex-shrink: 0;
}

.stat-header h3 {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.stat-count {
  font-size: 13px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 3px 8px;
  border-radius: 8px;
}

.stat-description {
  margin-bottom: 20px;
}

.stat-description p {
  margin: 0;
  font-size: 14px;
  color: #4b5563;
  line-height: 1.5;
}

.stat-metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

.metric {
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
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.top-districts h4 {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.district-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.district-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: #f9fafb;
  border-radius: 6px;
}

.district-name {
  font-size: 13px;
  color: #374151;
}

.district-revenue {
  font-size: 13px;
  font-weight: 500;
  color: #059669;
}

.insights-section h2 {
  margin: 0 0 24px;
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  text-align: center;
}

.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.insight-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.insight-card h3 {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.insight-card p {
  margin: 0 0 8px;
  font-size: 14px;
  color: #4b5563;
}

.insight-card p:last-child {
  margin-bottom: 0;
}

.insight-card strong {
  color: #059669;
  font-weight: 600;
}

@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }

  .page-header h1 {
    font-size: 22px;
  }

  .scatter-chart {
    height: 400px;
  }

  .chart-legend {
    grid-template-columns: 1fr;
  }

  .stats-grid,
  .insights-grid {
    grid-template-columns: 1fr;
  }

  .stat-metrics {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .chart-hint {
    font-size: 12px;
    padding: 6px 10px;
  }
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
</style>
