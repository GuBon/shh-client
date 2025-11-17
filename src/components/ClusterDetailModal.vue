<template>
  <div v-if="isVisible" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <div class="modal-header">
        <div class="cluster-info">
          <div class="cluster-color" :style="{ backgroundColor: cluster.color }"></div>
          <div>
            <h2>{{ cluster.name }}</h2>
            <p class="cluster-desc">{{ cluster.description }}</p>
          </div>
        </div>
        <button @click="$emit('close')" class="close-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>

      <div class="modal-content">
        <!-- 클러스터 개요 -->
        <div class="overview-section">
          <h3>클러스터 개요</h3>
          <div class="overview-grid">
            <div class="overview-item">
              <span class="label">전체 상권 수</span>
              <span class="value">{{ clusterData.count }}개</span>
            </div>
            <div class="overview-item">
              <span class="label">전체 대비 비율</span>
              <span class="value">{{ clusterData.percentage }}%</span>
            </div>
            <div class="overview-item">
              <span class="label">평균 연령</span>
              <span class="value">{{ clusterData.avgAge.toFixed(1) }}세</span>
            </div>
            <div class="overview-item">
              <span class="label">평균 매출</span>
              <span class="value">{{ formatRevenue(clusterData.avgRevenue) }}</span>
            </div>
          </div>
        </div>

        <!-- 특성 분석 -->
        <div class="characteristics-section">
          <h3>주요 특성</h3>
          <div class="characteristics-grid">
            <div class="characteristic-card">
              <h4>👥 고객층</h4>
              <p>{{ getCustomerProfile(cluster.id) }}</p>
            </div>
            <div class="characteristic-card">
              <h4>🏪 업종 특성</h4>
              <p>{{ getBusinessProfile(cluster.id) }}</p>
            </div>
            <div class="characteristic-card">
              <h4>📍 입지 특성</h4>
              <p>{{ getLocationProfile(cluster.id) }}</p>
            </div>
            <div class="characteristic-card">
              <h4>💰 수익성</h4>
              <p>{{ getProfitabilityProfile(cluster.id) }}</p>
            </div>
          </div>
        </div>

        <!-- 상위 상권 -->
        <div class="top-districts-section">
          <h3>매출 상위 상권</h3>
          <div class="districts-list">
            <div v-for="(district, index) in clusterData.topDistricts" :key="district.code" 
                 class="district-card">
              <div class="rank-badge">{{ index + 1 }}</div>
              <div class="district-info">
                <h4>{{ district.name }}</h4>
                <div class="district-metrics">
                  <span class="metric">매출: {{ formatRevenue(district.revenue) }}</span>
                  <span class="metric">연령: {{ getDistrictAge(district.code) }}세</span>
                  <span class="metric">효율성: {{ getDistrictEfficiency(district.code) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 투자 및 창업 가이드 -->
        <div class="investment-guide-section">
          <h3>투자 및 창업 가이드</h3>
          <div class="guide-content">
            <div class="guide-item">
              <h4>💡 추천 업종</h4>
              <p>{{ getRecommendedBusinessTypes(cluster.id) }}</p>
            </div>
            <div class="guide-item">
              <h4>⚠️ 주의사항</h4>
              <p>{{ getInvestmentWarnings(cluster.id) }}</p>
            </div>
            <div class="guide-item">
              <h4>🎯 성공 포인트</h4>
              <p>{{ getSuccessFactors(cluster.id) }}</p>
            </div>
          </div>
        </div>

        <!-- 시장 동향 -->
        <div class="market-trend-section">
          <h3>시장 동향</h3>
          <div class="trend-analysis">
            <div class="trend-item">
              <span class="trend-label">성장 전망</span>
              <div class="trend-indicator">
                <div class="trend-bar" 
                     :style="{ width: getGrowthProspect(cluster.id) + '%', backgroundColor: cluster.color }"></div>
              </div>
              <span class="trend-value">{{ getGrowthProspect(cluster.id) }}%</span>
            </div>
            <div class="trend-item">
              <span class="trend-label">경쟁 강도</span>
              <div class="trend-indicator">
                <div class="trend-bar" 
                     :style="{ width: getCompetitionLevel(cluster.id) + '%', backgroundColor: cluster.color }"></div>
              </div>
              <span class="trend-value">{{ getCompetitionLevel(cluster.id) }}%</span>
            </div>
            <div class="trend-item">
              <span class="trend-label">진입 용이성</span>
              <div class="trend-indicator">
                <div class="trend-bar" 
                     :style="{ width: getEntryEase(cluster.id) + '%', backgroundColor: cluster.color }"></div>
              </div>
              <span class="trend-value">{{ getEntryEase(cluster.id) }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  cluster: {
    type: Object,
    required: true
  },
  clusterData: {
    type: Object,
    required: true
  },
  allData: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close'])

const formatRevenue = (value) => {
  if (value >= 1e10) return `${(value / 1e10).toFixed(1)}조`
  if (value >= 1e8) return `${(value / 1e8).toFixed(1)}억`
  if (value >= 1e4) return `${(value / 1e4).toFixed(1)}만`
  return value.toLocaleString()
}

const getDistrictAge = (districtCode) => {
  const district = props.allData.find(d => d.상권_코드 === districtCode)
  return district ? district.상권_평균_연령.toFixed(1) : 'N/A'
}

const getDistrictEfficiency = (districtCode) => {
  const district = props.allData.find(d => d.상권_코드 === districtCode)
  return district ? district.상권_효율성.toFixed(1) : 'N/A'
}

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

const getCompetitionLevel = (clusterId) => {
  const competition = { 0: 90, 1: 95, 2: 70, 3: 60 }
  return competition[clusterId] || 50
}

const getEntryEase = (clusterId) => {
  const ease = { 0: 30, 1: 20, 2: 70, 3: 80 }
  return ease[clusterId] || 50
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-container {
  background: white;
  border-radius: 16px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.cluster-info {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.cluster-color {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  margin-top: 4px;
  flex-shrink: 0;
}

.modal-header h2 {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 700;
  color: #111827;
}

.cluster-desc {
  margin: 0;
  font-size: 16px;
  color: #6b7280;
}

.close-btn {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.overview-section,
.characteristics-section,
.top-districts-section,
.investment-guide-section,
.market-trend-section {
  margin-bottom: 32px;
}

.overview-section h3,
.characteristics-section h3,
.top-districts-section h3,
.investment-guide-section h3,
.market-trend-section h3 {
  margin: 0 0 16px;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.overview-item {
  background: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.overview-item .label {
  font-size: 13px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.overview-item .value {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
}

.characteristics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.characteristic-card {
  background: #f8fafc;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.characteristic-card h4 {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.characteristic-card p {
  margin: 0;
  font-size: 14px;
  color: #4b5563;
  line-height: 1.6;
}

.districts-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.district-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #f9fafb;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.rank-badge {
  width: 32px;
  height: 32px;
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}

.district-info {
  flex: 1;
}

.district-info h4 {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.district-metrics {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.metric {
  font-size: 13px;
  color: #6b7280;
  background: white;
  padding: 4px 8px;
  border-radius: 4px;
}

.guide-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.guide-item h4 {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.guide-item p {
  margin: 0;
  font-size: 14px;
  color: #4b5563;
  line-height: 1.6;
}

.trend-analysis {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.trend-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.trend-label {
  width: 100px;
  font-size: 14px;
  color: #374151;
  font-weight: 500;
  flex-shrink: 0;
}

.trend-indicator {
  flex: 1;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.trend-bar {
  height: 100%;
  transition: width 0.3s ease;
}

.trend-value {
  width: 40px;
  text-align: right;
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .modal-overlay {
    padding: 10px;
  }

  .modal-container {
    max-height: 95vh;
  }

  .modal-header {
    padding: 16px;
  }

  .modal-content {
    padding: 16px;
  }

  .modal-header h2 {
    font-size: 20px;
  }

  .overview-grid {
    grid-template-columns: 1fr 1fr;
  }

  .characteristics-grid {
    grid-template-columns: 1fr;
  }

  .district-metrics {
    flex-direction: column;
    gap: 8px;
  }

  .trend-item {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }

  .trend-label {
    width: auto;
  }
}
</style>
